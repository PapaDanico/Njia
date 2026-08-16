/* Njia — functional probe. Drives the real app in a real browser.
 *
 * WHY THIS IS IN THE REPO.
 *
 * It used to live in a scratch directory and die with the session, and it was
 * rewritten from memory each time. Twice now it has reported the same false
 * failure — "level filter changes the result set — 24 -> 24" — because it
 * counted rendered .course-card elements against a pagination cap of 24. Both
 * times the filter was working perfectly: 371 records narrow to 76 artisan, 125
 * certificate, 136 diploma. Both times the false alarm cost real minutes of
 * investigation, and a probe that cries wolf is worse than no probe, because
 * the second failure it reports is the one nobody checks.
 *
 * It now asserts against the headline count the app itself renders — the
 * "N of M places to apply match your filters" line — which is the number a
 * user actually reads, and is not capped.
 *
 * WHY IT IS NOT IN `node --test`.
 *
 * The unit suite runs on zero dependencies, which is a deliberate property of
 * this project: `node --test tests/*.test.js` works on a clean checkout with no
 * npm install and no lockfile. This needs Playwright and a browser, so it stays
 * a separate command and says so when it cannot run.
 *
 * The unit suite cannot replace it. Two defects this week were invisible to 155
 * green tests and obvious one second after loading the page: a removed variable
 * still referenced further down the same function, which threw on render; and
 * a page-level `display: grid` that overrode `.page { display: none }` and
 * stacked three modules on top of each other. Static assertions do not execute
 * a page.
 *
 * RUN:
 *   node tests/functional-probe.mjs
 *   NODE_PATH=/path/to/node_modules node tests/functional-probe.mjs
 *
 * Requires a server on http://localhost:8080 (python3 -m http.server 8080).
 * Override with PROBE_URL. Exits 2 when tooling or the server is missing,
 * 1 on a real failure, 0 only when every check genuinely ran and passed.
 */

import { createRequire } from 'node:module';

/* Resolved through createRequire, not a static import, for the same reason
 * tests/a11y-sweep.mjs does it: NODE_PATH is a CommonJS mechanism and ESM
 * `import` ignores it, so `import { chromium } from 'playwright'` fails on a
 * machine that supplies the browser the documented way. require.resolve
 * honours it. Written as a plain import first, and it failed exactly as the
 * sweep's comment warned it would. */
const require = createRequire(import.meta.url);
const BASE = process.env.PROBE_URL || 'http://localhost:8080';

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not resolvable. This probe drives a real browser and is');
  console.error('deliberately outside the zero-dependency unit suite.\n');
  console.error('  npm i --no-save --prefix /tmp/njia-probe playwright');
  console.error('  NODE_PATH=/tmp/njia-probe/node_modules node tests/functional-probe.mjs\n');
  console.error('Set CHROMIUM_PATH if the browser is not at /opt/pw-browsers/chromium.');
  process.exit(2);
}

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

try {
  const response = await page.goto(BASE, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    console.error(`Cannot reach ${BASE}. Start a server first: python3 -m http.server 8080`);
    process.exit(2);
  }
} catch (e) {
  console.error(`Cannot reach ${BASE}: ${e.message}`);
  console.error('Start a server first: python3 -m http.server 8080');
  process.exit(2);
}
await page.waitForTimeout(600);

/* 1. The questionnaire, driven by clicking the actual buttons rather than by
 *    calling the scorer directly. Poking internals would assert that the maths
 *    works while saying nothing about whether a person can reach it — and a
 *    questionnaire nobody can finish scores nothing. */
await page.evaluate(() => { navigateTo('discover'); startDiscoverQuestionnaire(); });
await page.waitForTimeout(250);
for (let i = 0; i < 150; i += 1) {
  if (await page.evaluate(() => !!AppState.questionnaire.results)) break;
  const clicked = await page.evaluate(() => {
    const visible = (el) => el.offsetParent !== null;
    const buttons = [...document.querySelectorAll('#page-discover button, #page-discover [onclick]')].filter(visible);
    const next = buttons.find((el) => /selectDiscoverOption/.test(el.getAttribute('onclick') || ''))
      || buttons.find((el) => /Next|Continue|results|Finish/i.test(el.innerText));
    if (!next) return false;
    next.click();
    return true;
  });
  if (!clicked) break;
  await page.waitForTimeout(40);
}
const quiz = await page.evaluate(() => AppState.questionnaire.results);
check('the questionnaire can be completed by clicking through it', !!quiz,
  quiz ? `primary=${quiz.primary}` : 'never reached a result');
check('cluster scores are non-zero', !!quiz && quiz.totalPoints > 0, quiz ? `${quiz.totalPoints} pts` : '');

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const persisted = await page.evaluate(() => AppState.questionnaire.results?.primary);
check('results survive a reload', !!quiz && persisted === quiz.primary, String(persisted));

/* 2. Filters. Asserted against the headline count, NOT the rendered card count.
 *    The card list is paginated at 24, so counting cards compares two numbers
 *    that are both the cap and reports a working filter as broken. */
/* navigateTo(), not a hash change. A hash-only goto is a same-document
 * navigation that can resolve before the router activates the page, and
 * innerText skips anything still display:none — so the headline below was read
 * from a hidden subtree and came back null while the app was working fine. */
await page.evaluate(() => navigateTo('decide'));
await page.waitForTimeout(500);

const headline = () => page.evaluate(() => {
  renderDecidePage();
  const m = document.body.innerText.match(/([\d,]+)\s+of\s+([\d,]+)\s+places to apply match/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
});
const setFilter = (key, value) => page.evaluate(([k, v]) => {
  AppState.decideFilters[k] = v; saveState();
}, [key, value]);

await setFilter('level', 'all');
const allCount = await headline();
check('the catalogue reports a headline count', allCount > 0, `${allCount} places`);

const levelCounts = {};
for (const level of ['artisan', 'certificate', 'diploma']) {
  await setFilter('level', level);
  levelCounts[level] = await headline();
}
await setFilter('level', 'all');
const levelsNarrow = Object.values(levelCounts).every((n) => n > 0 && n < allCount);
check('the level filter narrows the result set', levelsNarrow,
  Object.entries(levelCounts).map(([k, v]) => `${k}=${v}`).join(' ') + ` of ${allCount}`);
const levelsSumSane = Object.values(levelCounts).reduce((a, b) => a + b, 0) <= allCount;
check('level counts never exceed the whole catalogue', levelsSumSane);

await setFilter('cluster', 'numbers');
const numbersCount = await headline();
await setFilter('cluster', 'all');
check('the cluster filter narrows the result set', numbersCount > 0 && numbersCount < allCount,
  `numbers=${numbersCount} of ${allCount}`);

/* 3. Fee provenance is the core promise, so probe what a reader is told. */
const basis = await page.evaluate(() => {
  /* Counted into a bare object rather than a fixed set of keys. Written with
   * the four states that existed at the time, this produced `unsourced=NaN`
   * the moment a fifth was added — a probe that silently mis-reports is the
   * failure mode this file exists to avoid. */
  const counts = {};
  for (const c of COURSES) { const k = feeBasis(c); counts[k] = (counts[k] || 0) + 1; }
  const target = COURSES.find((c) => feeBasis(c) === 'unpublished');
  const inst = INSTITUTIONS.find((i) => i.id === target.institution_id);
  AppState.decideFilters.level = target.level;
  AppState.decideFilters.county = inst.county;
  renderDecidePage();
  const card = [...document.querySelectorAll('.course-card')]
    .find((el) => el.textContent.includes(target.name));
  const text = card ? card.innerText : '';
  AppState.decideFilters.level = 'all';
  AppState.decideFilters.county = 'all';
  renderDecidePage();
  return {
    counts,
    courseCount: COURSES.length,
    unpublishedShowsNoTick: !!card && !/✓ Fee (published|from)/.test(text),
    /* "Not shown", not "Not published". The old label claimed knowledge Njia
     * does not have: a public university DOES publish its fees, Njia simply
     * could not verify them, and telling a reader the university publishes
     * nothing sends them off looking for a thing that exists. The assertion
     * still checks the same intent — a fee-less course must say the figure is
     * absent — against wording that is true in both cases. */
    unpublishedSaysSo: /Not shown/.test(text),
    /* And it must never hand a university the county-VTC advice. That copy was
     * unconditional until eighteen invented university fees were nulled and
     * pushed CUE-chartered degrees into it, at which point DeKUT began telling
     * readers to budget for a NITA Grade III trade test on a BSc. */
    noVtcCopyOnADegree: !(/degree/i.test(text) && /Grade III trade test/i.test(text))
  };
});
const basisTotal = Object.values(basis.counts).reduce((a, b) => a + b, 0);
check('every course classifies into exactly one fee basis',
  basisTotal === basis.courseCount && Object.values(basis.counts).every(Number.isInteger),
  Object.entries(basis.counts).map(([k, v]) => `${k}=${v}`).join(' ') + ` (total ${basisTotal}/${basis.courseCount})`);
check('a course with no fee shows no verification tick', basis.unpublishedShowsNoTick);
check('a course with no fee says the figure is not shown', basis.unpublishedSaysSo);
check('a degree is never given the county-VTC fee advice', basis.noVtcCopyOnADegree);

/* 4. Saving, and recovery from corrupt storage. */
const saved = await page.evaluate(() => {
  AppState.savedCourses = COURSES.slice(0, 3).map((c) => c.id);
  saveState();
  return AppState.savedCourses.length;
});
check('courses can be saved', saved === 3, `${saved} saved`);

const repaired = await page.evaluate(() => {
  localStorage.setItem('njia_state', JSON.stringify({
    savedCourses: 'not-an-array', okrs: { nope: true }, questionnaire: null
  }));
  return true;
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const recovered = await page.evaluate(() => ({
  arr: Array.isArray(AppState.savedCourses),
  okrs: Array.isArray(AppState.okrs),
  usable: typeof renderDecidePage === 'function'
}));
check('malformed saved state is repaired, not fatal',
  repaired && recovered.arr && recovered.okrs && recovered.usable, JSON.stringify(recovered));

/* 5. Every module page renders without throwing, and none overflows. */
for (const route of ['home', 'discover', 'design', 'decide', 'connect', 'track', 'help']) {
  await page.evaluate((r) => navigateTo(r), route);
  await page.waitForTimeout(350);
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    visiblePages: [...document.querySelectorAll('.page')].filter((p) => getComputedStyle(p).display !== 'none').length
  }));
  check(`${route} renders one page, no horizontal overflow`,
    state.overflow <= 0 && state.visiblePages === 1,
    `overflow=${state.overflow}px visiblePages=${state.visiblePages}`);
}

check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || 'none');

/* 6. THE DEGRADED NETWORK, WHICH NOTHING HERE HAD EVER TESTED.
 *
 * Every check above this line runs against a server where every request
 * succeeds. So did the 253 unit tests and the 64 accessibility states, and all
 * three were green while a single unreachable module froze the tab outright:
 * renderRoute() retried by awaiting a cached promise that resolved on failure,
 * so it re-entered on the next microtask and never yielded. Measured before the
 * fix — main thread silent for 6s, click timed out at 4s.
 *
 * Service workers are blocked for this section. With one installed the worker
 * serves the module from its precache and the failure cannot be reproduced at
 * all, which is a genuine second line of defence and exactly why the section
 * has to opt out of it: the exposure is the FIRST visit, before any cache
 * exists, which is also when a new reader on a weak signal arrives.
 *
 * Three checks, covering the class rather than the instance: it must not hang,
 * it must recover from a transient failure, and when it truly cannot load it
 * must say so and offer a way back. */
const degraded = await browser.newContext({ serviceWorkers: 'block' });

async function moduleFailure(failCount) {
  const p = await degraded.newPage();
  let requests = 0;
  await p.route('**/js/help.js', (r) => { requests += 1; return requests <= failCount ? r.abort() : r.continue(); });
  await p.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await p.waitForTimeout(1800);                      // the idle prefetch runs and fails
  await p.evaluate(() => navigateTo('help')).catch(() => {});
  await p.waitForTimeout(1500);                      // any retry completes
  const responsive = await Promise.race([
    p.evaluate(() => true),
    new Promise((r) => setTimeout(() => r(false), 4000))
  ]);
  const dom = await p.evaluate(() => {
    const el = document.getElementById('page-help');
    const h = el && el.querySelector('h1');
    return {
      heading: h ? h.textContent.trim() : null,
      retry: !!(el && el.querySelector('button[onclick^="retryPageModule"]'))
    };
  }).catch(() => ({ heading: null, retry: false }));
  await p.close();
  return { responsive, requests, ...dom };
}

const blip = await moduleFailure(1);
check('a dropped module request does not freeze the app',
  blip.responsive, blip.responsive ? 'main thread answered' : 'MAIN THREAD BLOCKED — the retry is unbounded again');
check('a transient module failure is retried, not latched',
  blip.requests >= 2 && blip.heading === 'How Njia works',
  `requests=${blip.requests} heading=${JSON.stringify(blip.heading)}`);

const dead = await moduleFailure(99);
check('a module that never loads renders a failure with a way back',
  dead.responsive && dead.retry && /didn't load/.test(dead.heading || ''),
  `responsive=${dead.responsive} retry=${dead.retry} heading=${JSON.stringify(dead.heading)} requests=${dead.requests}`);

await degraded.close();

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
