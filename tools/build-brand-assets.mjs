/* Njia — brand asset generator.
 *
 * Renders the identity sheet's lockups and banner by composing the app's OWN
 * assets in a headless browser, then screenshotting. Nothing here is drawn by
 * hand.
 *
 * WHY IT WORKS THIS WAY.
 *
 * The first attempt hand-plotted the "Njia" wordmark as SVG bezier paths. It
 * rendered as a broken "N jia" with crude letterforms that looked nothing like
 * the sheet, and it was deleted rather than shipped. The sheet specifies a
 * custom serif nobody can reproduce by eye, and a bad wordmark damages a brand
 * more than a missing one does.
 *
 * So the wordmark is set in the same --serif stack the live site uses, the mark
 * is the same icons/logo-mark.svg the app ships, and the border strip is the
 * same .brand-rule tile from css/styles.css. Read from those files at build
 * time, never copied — if the site's serif or the strip changes, regenerate and
 * these follow. That also means the assets cannot drift from the product, which
 * is the usual way a brand kit goes stale.
 *
 * OUTPUT GOES TO brand/, NOT icons/.
 *
 * These are deliverables for social profiles, decks and print — they are not
 * app runtime assets. Putting them in icons/ would add them to the orphan check
 * in tests/artefacts.test.js (correctly, since nothing in the app references
 * them) and tempt someone into caching them in the service worker, which would
 * ship a megabyte of marketing art to a learner on metered mobile data.
 *
 * RUN:
 *   npm i --no-save --prefix /tmp/njia-brand playwright
 *   NODE_PATH=/tmp/njia-brand/node_modules node tools/build-brand-assets.mjs
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'brand');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not resolvable.\n');
  console.error('  npm i --no-save --prefix /tmp/njia-brand playwright');
  console.error('  NODE_PATH=/tmp/njia-brand/node_modules node tools/build-brand-assets.mjs');
  process.exit(2);
}

const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const mark = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8');

/* Pulled out of the live stylesheet rather than restated, so a palette or type
 * change in the app propagates here on the next run. */
const grab = (name, block = ':root {') => {
  const at = css.indexOf(block);
  const slice = css.slice(at, css.indexOf('\n}', at));
  const m = slice.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`${name} not found in ${block} — the stylesheet moved`);
  return m[1].trim();
};
const SERIF = grab('--serif');
const CREAM = grab('--bg');
const INK = grab('--ink');
const TERRACOTTA = grab('--primary');
const GREEN = grab('--secondary');

const ruleTile = (css.match(/\.brand-rule \{[\s\S]*?background-image: url\("([^"]+)"\)/) || [])[1];
if (!ruleTile) throw new Error('.brand-rule tile not found — the border strip moved');

const shell = (body, bg) => `<!doctype html><meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${bg};font-family:${SERIF};-webkit-font-smoothing:antialiased}
  .rule{height:11px;background-repeat:repeat-x;background-size:auto 11px;background-image:url("${ruleTile}")}
  .mark svg{display:block}
  .word{font-family:${SERIF};font-weight:700;color:${TERRACOTTA};line-height:.92}
  .tag{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-weight:700;
       letter-spacing:.09em;color:${INK};line-height:1.35;text-transform:uppercase}
</style>${body}`;

await fs.promises.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });

/* ---- 1. Stacked vertical lockup (sheet item 2) --------------------------
 * "Use the stacked lockup for vertical or narrow spaces."
 * Clear space is the height of the N, per the sheet's usage notes. */
{
  /* colorScheme pinned: the mark carries an @media (prefers-color-scheme: dark)
   * rule for its standalone favicon use, and inlined here it would otherwise
   * follow whatever scheme the build machine happens to be in — turning this
   * lockup's outline cream on a cream ground. */
  const page = await browser.newPage({ viewport: { width: 640, height: 720 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await page.setContent(shell(`
    <div id="a" style="width:640px;padding:64px 0;display:flex;flex-direction:column;
                       align-items:center;gap:6px;background:${CREAM}">
      <div class="mark" style="width:104px">${mark}</div>
      <div class="word" style="font-size:76px">Njia</div>
      <div class="tag" style="font-size:13px;text-align:center">Data-driven career pathway<br>for Kenyan youth</div>
      <div class="rule" style="width:280px"></div>
    </div>`, CREAM));
  await page.waitForTimeout(300);
  await page.locator('#a').screenshot({ path: path.join(out, 'lockup-stacked.png') });
  await page.close();
  console.log('brand/lockup-stacked.png');
}

/* ---- 2. Stacked lockup, dark ground -------------------------------------
 * The shield edge switches to cream through --mark-edge, which is exactly why
 * the mark was built with that custom property instead of a second file. */
{
  const page = await browser.newPage({ viewport: { width: 640, height: 720 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  await page.setContent(shell(`
    <div id="a" style="width:640px;padding:64px 0;display:flex;flex-direction:column;
                       align-items:center;gap:6px;background:#241002;--mark-edge:${CREAM}">
      <div class="mark" style="width:104px">${mark}</div>
      <div class="word" style="font-size:76px;color:#E09A3C">Njia</div>
      <div class="tag" style="font-size:13px;text-align:center;color:${CREAM}">Data-driven career pathway<br>for Kenyan youth</div>
      <div class="rule" style="width:280px"></div>
    </div>`, '#241002'));
  await page.waitForTimeout(300);
  await page.locator('#a').screenshot({ path: path.join(out, 'lockup-stacked-dark.png') });
  await page.close();
  console.log('brand/lockup-stacked-dark.png');
}

/* ---- 3. Social banner, 16:9 (sheet item 7) ------------------------------
 * Carries #NjiaYaMaendeleo and the three-part line from the sheet. This is a
 * PROFILE header — a different job from icons/og-image.jpg, which is the share
 * card and has to earn a click. Do not swap one for the other. */
{
  const W = 1600, H = 900;
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: 'light' });
  await page.setContent(shell(`
    <div id="a" style="width:${W}px;height:${H}px;background:${CREAM};display:flex;
                       flex-direction:column;justify-content:space-between">
      <div class="rule"></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:26px;padding:0 80px">
        <div style="display:flex;align-items:center;gap:34px">
          <div class="mark" style="width:132px">${mark}</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div class="word" style="font-size:124px">Njia</div>
            <div class="tag" style="font-size:19px">Data-driven career pathway<br>for Kenyan youth</div>
          </div>
        </div>
        <div class="tag" style="font-size:27px;letter-spacing:.05em;color:${INK};text-align:center">
          Empowering youth. Building futures. Transforming Kenya.
        </div>
        <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
                    font-size:30px;font-weight:700;color:${GREEN}">#NjiaYaMaendeleo</div>
      </div>
      <div class="rule"></div>
    </div>`, CREAM));
  await page.waitForTimeout(400);
  await page.locator('#a').screenshot({ path: path.join(out, 'social-banner-16x9.png') });
  await page.close();
  console.log('brand/social-banner-16x9.png');
}

await browser.close();
console.log('\nRegenerate after any change to the palette, --serif, .brand-rule or logo-mark.svg.');
