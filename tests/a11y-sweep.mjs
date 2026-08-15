/* Accessibility sweep — NOT part of `node --test tests/*.test.js`.
 *
 * Run it directly:
 *
 *   python3 -m http.server 8106 &
 *   npm i --no-save --prefix /tmp/njia-a11y playwright axe-core
 *   NODE_PATH=/tmp/njia-a11y/node_modules node tests/a11y-sweep.mjs
 *
 * It needs playwright, a chromium binary and axe-core. Those are deliberately
 * not repository dependencies: Njia has no package.json, no lockfile and no
 * build step, and a clone still runs its whole test suite with nothing
 * installed. This file asks the person running it to supply the browser, and
 * says so loudly if they have not, rather than dragging a toolchain into a
 * project whose main promise is that it does not have one.
 *
 * CHROMIUM_PATH overrides the browser binary, AXE_PATH the axe-core bundle,
 * NJIA_ORIGIN the server. Exit codes: 0 clean, 1 violations or skipped states,
 * 2 tooling missing — so "the browser was not installed" can never be mistaken
 * for "the sweep passed".
 *
 * Why it exists in the repository at all: the sweep it replaces lived in a
 * scratch directory and reported "28 states, 0 violations" for weeks. It
 * navigated between the seven pages without ever completing the questionnaire,
 * so it had never scanned the screen the questionnaire produces — the most
 * consequential screen in the app, and the one carrying the primary cluster,
 * the confidence line and the catalogue supply. A contrast failure sat there
 * undetected until a scan that actually reached the state went looking.
 *
 * Hence the rule this file follows: never report a clean scan of a state it
 * has not proved it reached. Every assertion about the results screen is
 * gated on the questionnaire actually completing and the expected nodes
 * actually being present. A pass that cannot fail is not a pass.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/* Both dependencies are resolved through createRequire rather than a static
 * import. NODE_PATH is a CommonJS resolution mechanism and ESM `import`
 * ignores it, so `import { chromium } from 'playwright'` fails outright on a
 * machine that supplies the browser that way — which is the documented way to
 * run this file. require.resolve honours it. */
const require = createRequire(import.meta.url);
const ORIGIN = process.env.NJIA_ORIGIN || 'http://localhost:8106';
const EXECUTABLE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const PAGES = ['home', 'discover', 'design', 'decide', 'connect', 'track', 'help'];
const VIEWPORTS = [{ width: 412, height: 915 }, { width: 1280, height: 900 }];
const SCHEMES = ['light', 'dark'];

/* The GENERATED pages — the ones a search engine actually sends people to.
 *
 * The section below labelled "static pages" is not these. It loads index.html
 * and drives navigateTo(), so it audits the APP'S ROUTES; the label has been
 * wrong since it was written. The 53 committed county and grade pages were
 * never audited at all, in either scheme.
 *
 * That gap hid 76 serious violations: every horizontally scrollable table
 * container was a scroll region with no way to focus it, so at phone width a
 * keyboard-only reader could not reach the Tuition or Duration columns — 21 of
 * them on the D-plain page alone. Fixed in tools/build-static-pages.mjs; this
 * list is what stops it coming back.
 *
 * A representative sample rather than all 53: Nairobi is the largest table,
 * Turkana carries the "nothing here is open to you" sentence, the E page is
 * the audience with the fewest options, and the two indexes are a different
 * shape again. Auditing all 53 would be 212 states for no new markup. */
const GENERATED = [
  '/counties/nairobi/', '/counties/turkana/', '/counties/',
  '/grades/d-plain/', '/grades/e/', '/grades/'
];

const HOWTO = 'Supply them out-of-tree, e.g.\n'
  + '  npm i --no-save --prefix /tmp/njia-a11y playwright axe-core\n'
  + '  NODE_PATH=/tmp/njia-a11y/node_modules node tests/a11y-sweep.mjs\n'
  + 'or point AXE_PATH at an axe.js and CHROMIUM_PATH at a browser binary.';

let chromium, axeSource;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error(`playwright not resolvable.\n${HOWTO}`);
  process.exit(2);
}
try {
  /* AXE_PATH first: axe-core is frequently present as a transitive dependency
   * in some unrelated tree rather than anywhere this file can resolve, and an
   * explicit path beats a lucky lookup. The sweep this replaces was resolving
   * axe-core out of a temporary scratch directory that existed only for one
   * session, which is a large part of why its results were not reproducible. */
  axeSource = readFileSync(process.env.AXE_PATH || require.resolve('axe-core'), 'utf8');
} catch {
  console.error(`axe-core not resolvable.\n${HOWTO}`);
  process.exit(2);
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const parseRgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

/* Click through the real questionnaire. Returns whether it reached results —
 * the caller must not scan the results screen unless this is true. */
async function completeQuestionnaire(page) {
  await page.evaluate(() => { navigateTo('discover'); startDiscoverQuestionnaire(); });
  await page.waitForTimeout(300);
  for (let i = 0; i < 150; i++) {
    if (await page.evaluate(() => !!AppState.questionnaire.results)) return true;
    const clicked = await page.evaluate(() => {
      const visible = (el) => el.offsetParent !== null;
      const buttons = [...document.querySelectorAll('#page-discover button, #page-discover [onclick]')].filter(visible);
      const target = buttons.find((e) => /selectDiscoverOption/.test(e.getAttribute('onclick') || ''))
                  || buttons.find((e) => /Next|Continue|results|Finish/i.test(e.innerText));
      if (!target) return false;
      target.click();
      return true;
    });
    if (!clicked) break;
    await page.waitForTimeout(60);
  }
  return page.evaluate(() => !!AppState.questionnaire.results);
}

const runAxe = (page) => page.evaluate(async () =>
  (await axe.run(document, { resultTypes: ['violations'] })).violations);

const report = (label, violations) => {
  if (!violations.length) return 0;
  console.log(`  ${label}: ${violations.map((v) => `${v.id}(${v.nodes.length})`).join(', ')}`);
  for (const v of violations) {
    for (const n of v.nodes.slice(0, 4)) console.log(`      ${n.target.join(' ')}`);
  }
  return violations.length;
};

const browser = await chromium.launch({ executablePath: EXECUTABLE }).catch((e) => {
  console.error(`could not launch chromium at ${EXECUTABLE}: ${e.message}`);
  process.exit(2);
});

let violations = 0, states = 0, skipped = 0;

console.log('--- generated county and grade pages ---');
for (const colorScheme of SCHEMES) {
  for (const viewport of VIEWPORTS) {
    for (const url of GENERATED) {
      const page = await browser.newPage({ viewport, colorScheme });
      await page.goto(`${ORIGIN}${url}`, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axeSource });
      states++;
      violations += report(`${colorScheme} ${viewport.width} ${url}`, await runAxe(page));
      await page.close();
    }
  }
}

console.log('--- app routes (server-rendered shell, driven by navigateTo) ---');
for (const colorScheme of SCHEMES) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport, colorScheme });
    await page.goto(`${ORIGIN}/index.html`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: axeSource });
    for (const name of PAGES) {
      await page.evaluate((x) => navigateTo(x), name);
      await page.waitForTimeout(250);
      states++;
      violations += report(`${colorScheme} ${viewport.width} ${name}`, await runAxe(page));
    }
    await page.close();
  }
}

console.log('--- results screen (the state the old sweep never reached) ---');
for (const colorScheme of SCHEMES) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport, colorScheme });
    await page.goto(`${ORIGIN}/index.html`, { waitUntil: 'networkidle' });

    const reached = await completeQuestionnaire(page);
    const present = await page.evaluate(() => ({
      supply: !!document.querySelector('.cluster-supply'),
      label: !!document.querySelector('.cluster-tags-label'),
      confidence: !!document.querySelector('.confidence-line')
    }));
    if (!reached || !present.supply || !present.label || !present.confidence) {
      console.log(`  SKIPPED ${colorScheme} ${viewport.width}: never reached results `
        + `(${JSON.stringify({ reached, ...present })}). Not counting this as clean.`);
      skipped++;
      await page.close();
      continue;
    }

    await page.addScriptTag({ content: axeSource });
    states++;
    violations += report(`${colorScheme} ${viewport.width} results`, await runAxe(page));

    /* Print the effective ratios that tests/contrast.test.js records in DIMMED,
     * so those numbers stay reproducible rather than becoming folklore. */
    const measured = await page.evaluate(() => {
      const surfaceOf = (el) => {
        let bg = 'rgba(0, 0, 0, 0)', node = el;
        while (node && bg === 'rgba(0, 0, 0, 0)') { bg = getComputedStyle(node).backgroundColor; node = node.parentElement; }
        return bg;
      };
      const probe = (selector, make) => {
        let el = document.querySelector(selector), temp = null;
        if (!el && make) { temp = make(); el = temp.el; }
        if (!el) return null;
        const s = getComputedStyle(el);
        const out = { selector, fg: s.color, bg: surfaceOf(el), opacity: Number(s.opacity) };
        if (temp) temp.host.remove();
        return out;
      };
      return [
        probe('.landing-nav-dropdown-btn .caret'),
        probe('.meta-value.is-estimate', () => {
          const host = document.createElement('div');
          host.className = 'meta-grid';
          host.innerHTML = '<div class="meta-item"><div class="meta-value is-estimate">KES 100,000</div></div>';
          document.body.appendChild(host);
          return { host, el: host.querySelector('.meta-value') };
        }),
        probe('.cluster-supply .num')
      ].filter(Boolean);
    });
    for (const m of measured) {
      const fg = parseRgb(m.fg), bg = parseRgb(m.bg);
      const eff = fg.map((c, i) => m.opacity * c + (1 - m.opacity) * bg[i]);
      console.log(`      ${colorScheme} ${m.selector} @${m.opacity} → ${ratio(eff, bg).toFixed(2)}:1`
        + (m.opacity < 1 ? ` (undimmed ${ratio(fg, bg).toFixed(2)}:1)` : ''));
    }
    await page.close();
  }
}

await browser.close();
console.log(`\nstates scanned: ${states} · skipped: ${skipped} · violations: ${violations}`);
if (violations || skipped) process.exit(1);
