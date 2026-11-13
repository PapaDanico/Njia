'use strict';
/* The shared page furniture: every generated guidance page ends with the sources
 * footer, every exhibit is complete and numbered in order, and the sources page
 * carries every entry in the register it is generated from. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p, 'index.html'), 'utf8');
const PAGES = ['accessibility', 'careers', 'counsellors', 'diagnostic', 'methodology', 'pathways', 'privacy', 'research', 'research/sources'];

test('every generated guidance page carries the sources footer', () => {
  for (const p of PAGES) {
    const html = read(p);
    assert.match(html, /<footer class="page-foot">[\s\S]*href="\/methodology\/"[\s\S]*href="\/research\/sources\/"[\s\S]*href="\/open-data\/"[\s\S]*<\/footer>/, `${p} has no sources footer`);
    assert.match(html, /describe what Njia has listed, not everything that exists in Kenya/, `${p} footer lacks the scope sentence`);
  }
});

test('each exhibit has a label, a title, a unit and a source, numbered in order', () => {
  let seen = 0;
  for (const p of PAGES) {
    const html = read(p);
    const figs = html.match(/<figure class="exhibit"[\s\S]*?<\/figure>/g) || [];
    figs.forEach((f, i) => {
      seen++;
      assert.match(f, new RegExp(`<p class="exhibit-label">Exhibit ${i + 1}</p>\\s*<p class="exhibit-title">[^<]{20,}</p>\\s*<p class="exhibit-unit">[^<]{10,}</p>`), `${p}: exhibit ${i + 1} is incomplete or out of order`);
      assert.match(f, /<p class="exhibit-src">Source: Njia catalogue/, `${p}: exhibit ${i + 1} has no source line`);
    });
  }
  assert.ok(seen >= 4, 'expected exhibits on /research/ and /pathways/');
});

test('the sources page carries every register entry and its limits', () => {
  const reg = JSON.parse(fs.readFileSync(path.join(root, 'research', 'sources.json'), 'utf8'));
  const html = read('research/sources');
  for (const s of reg.sources) {
    assert.ok(html.includes(`id="${s.key}"`), `no section for ${s.key}`);
    assert.ok(html.includes(s.url.replace(/&/g, '&amp;')), `no link to ${s.url}`);
  }
  assert.match(html, /not a live admissions service/);
  assert.match(html, /has not confirmed from its build that every link is still live/);
});
