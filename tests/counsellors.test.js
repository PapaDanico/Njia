'use strict';
/* /counsellors/ is a print kit. Its grade table is recomputed from the catalogue
 * and every grade page it links to must exist; the handouts must be present and
 * break onto their own sheets. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'counsellors', 'index.html'), 'utf8');
const text = page.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&middot;|&amp;/g, ' ').replace(/\s+/g, ' ');
const n = (v) => Number(v).toLocaleString('en-KE');

test('the kit has a plan and both handouts, each on its own printed sheet', () => {
  assert.match(page, /id="plan"/);
  assert.match(page, /<section class="handout">\s*<h2 id="handout-a">/);
  assert.match(page, /<section class="handout">\s*<h2 id="handout-b">/);
  assert.match(page, /\.handout \{ break-before: page; \}/);
  assert.ok((page.match(/class="line"/g) || []).length >= 8, 'the worksheet needs writing lines');
});

test('every grade link resolves to a generated page and its count matches the page', () => {
  const rows = [...page.matchAll(/<a href="\/grades\/([a-z-]+)\/">([^<]+)<\/a><\/th><td class="num">([\d,]+)</g)];
  assert.ok(rows.length >= 3, 'the grade table is empty');
  for (const [, slug, , count] of rows) {
    const gp = path.join(root, 'grades', slug, 'index.html');
    assert.ok(fs.existsSync(gp), `grades/${slug}/ does not exist`);
    assert.ok(fs.readFileSync(gp, 'utf8').includes(`${count} `) || fs.readFileSync(gp, 'utf8').includes(count.replace(/,/g, '')), `grades/${slug}/ does not carry ${count}`);
  }
});

test('the kit quotes catalogue figures that are true and makes no outcome claim', () => {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root, 'data', 'landing-stats.js'), 'utf8') + '\n;this.S = LANDING_STATS', ctx);
  for (const v of [ctx.S.courses, ctx.S.institutions, ctx.S.counties]) assert.ok(text.includes(n(v)), `missing ${n(v)}`);
  for (const phrase of ['not a validated test', 'No promises', 'No outcomes data', 'no genuine scholarship asks for an application fee']) {
    assert.ok(text.toLowerCase().includes(phrase.toLowerCase()), `missing: ${phrase}`);
  }
  assert.doesNotMatch(page, /<script/);
});
