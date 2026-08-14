/* Njia — regenerate the PNG app icons from icons/logo-mark.svg.
 *
 * WHY THIS EXISTS.
 *
 * The brand mark was redrawn as a vector shield and icons/logo-mark.svg was
 * updated. The four PNGs were not, and nothing noticed for a day: the SVG
 * favicon is only used by browsers that prefer it, so a tab showed the new
 * mark while every PWA install, every apple-touch-icon and every browser
 * falling back to the PNG showed the previous logo — an orange "Y" on navy,
 * which is not a colour or a shape in the current palette. A reader who
 * installed Njia had a home-screen icon from a brand that no longer existed.
 *
 * Regenerating them by hand is exactly the step that gets skipped, so it is a
 * script, and tests/artefacts.test.js asserts the PNGs are not older than the
 * SVG they are supposed to be renders of.
 *
 * WHY CHROMIUM AND NOT AN IMAGE LIBRARY.
 *
 * This project has no dependencies and no lockfile, and the container has no
 * sharp, no cairosvg, no ImageMagick and no rsvg-convert. It does have the
 * Playwright Chromium the accessibility sweep already uses, which is a
 * perfectly good SVG rasteriser — it is the same engine that will draw the
 * mark for most readers anyway, so what it produces is what they would see.
 *
 * RUN:  node tools/build-icons.mjs
 *       NODE_PATH=/path/to/node_modules node tools/build-icons.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '/'));

let chromium;
for (const p of [process.env.NODE_PATH, '/usr/lib/node_modules', '/usr/local/lib/node_modules']) {
  if (!p) continue;
  for (const dir of p.split(':')) {
    try { ({ chromium } = require(path.join(dir, 'playwright/index.js'))); break; } catch { /* keep looking */ }
  }
  if (chromium) break;
}
if (!chromium) {
  try { ({ chromium } = require('playwright')); } catch {
    console.error('Playwright not resolvable. Supply it out-of-tree, e.g.\n'
      + '  NODE_PATH=/tmp/njia/node_modules node tools/build-icons.mjs');
    process.exit(2);
  }
}

const CREAM = '#F5E9D4';
const svg = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8');

/* The mark is portrait (64x96) and the icon is square, so it is centred with
 * padding rather than stretched.
 *
 * `inset` is the share of the canvas left empty around the mark. A plain icon
 * can sit close to the edge; a maskable one is cropped to a circle by the
 * launcher and only the middle ~80% is guaranteed to survive, so it needs the
 * mark pulled well in. Getting this wrong is why maskable icons so often ship
 * with the top of the artwork sliced off. */
const TARGETS = [
  { file: 'icon-192x192.png', size: 192, inset: 0.10, radius: 0.22 },
  { file: 'icon-512x512.png', size: 512, inset: 0.10, radius: 0.22 },
  { file: 'icon-maskable-192.png', size: 192, inset: 0.14, radius: 0 },
  { file: 'icon-maskable-512.png', size: 512, inset: 0.14, radius: 0 }
];

const page = (size, inset, radius) => `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent}
  #plate{
    width:${size}px;height:${size}px;
    background:${CREAM};
    border-radius:${Math.round(size * radius)}px;
    display:flex;align-items:center;justify-content:center;
    box-sizing:border-box;
    padding:${Math.round(size * inset)}px;
  }
  #plate svg{height:100%;width:auto;display:block}
</style>
<div id="plate">${svg}</div>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
});
/* Light scheme explicitly: logo-mark.svg carries a prefers-color-scheme rule
 * that swaps the shield outline to cream for dark browser chrome. On a cream
 * icon plate that would erase the silhouette entirely. */
const ctx = await browser.newContext({ colorScheme: 'light', deviceScaleFactor: 1 });

for (const { file, size, inset, radius } of TARGETS) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(page(size, inset, radius), { waitUntil: 'load' });
  const el = await p.$('#plate');
  const out = path.join(root, 'icons', file);
  await el.screenshot({ path: out, omitBackground: true });
  console.log(`wrote icons/${file}  ${size}x${size}  inset ${Math.round(inset * 100)}%`);
  await p.close();
}

await browser.close();
console.log('\nDone. Bump CACHE_VERSION in sw.js — the icons are cache-first.');
