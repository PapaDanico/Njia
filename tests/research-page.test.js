'use strict';
/* /research/ is generated at build time. Every figure is recomputed here with the
 * app's own feeBasis(), so the page cannot drift from the catalogue or classify a
 * fee differently from the course card. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'research', 'index.html'), 'utf8');
const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&middot;|&amp;/g, ' ').replace(/\s+/g, ' ');
const n = (v) => Number(v).toLocaleString('en-KE');

test('research page is linked from the main accessible resources section', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(index, /<a href="\.\/research\/">Explore catalogue evidence/);
});

test('research page needs no script and states its scope', () => {
  assert.doesNotMatch(html, /<script/);
  assert.match(text, /not every institution or course in Kenya/);
  assert.match(html, /Review official Kenyan education sources and verification rules/);
  assert.ok(!fs.existsSync(path.join(root, 'research', 'research.js')), 'research.js should not return');
});

test('research page figures are recomputed from the catalogue', async () => {
  const { summariseCatalogue } = await import('../tools/catalogue-indicators.mjs');
  const { COURSES } = require('../data/courses.js');
  const { INSTITUTIONS } = require('../data/institutions.js');
  const src = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const at = src.indexOf('function feeBasis(');
  const next = src.indexOf('\nconst FEE_BASIS_BADGE', at);
  const feeBasis = vm.runInNewContext(src.slice(at, next) + '\nfeeBasis');
  const R = summariseCatalogue(COURSES, INSTITUTIONS, { feeBasis });
  for (const v of [R.totals.catalogue_offerings, R.totals.institutions_with_offerings, R.totals.counties_with_offerings, R.totals.distinct_programme_names, R.entry_grade.specified, R.entry_grade.open_entry]) {
    assert.ok(text.includes(n(v)), `the page does not carry ${n(v)}`);
  }
  for (const [basis, count] of Object.entries(R.fees.by_basis)) {
    const row = new RegExp(`>${basis[0].toUpperCase() + basis.slice(1)}</th><td class="num">${n(count)}<`);
    assert.match(html, row, `fee group ${basis} should read ${n(count)}`);
  }
  assert.ok(text.includes(`${n(R.quality_flags.unavailable_fee)} of ${n(R.totals.linked_offerings)} listings show no fee figure; ${n(R.fees.by_basis.published + R.fees.by_basis.derived)} are published or derived`), 'the fee exhibit title does not match the data');
  const top = Object.entries(R.by_county).sort((a, b) => b[1].offerings - a[1].offerings || a[0].localeCompare(b[0]))[0];
  const thin = Object.values(R.by_county).filter((v) => v.offerings < 10).length;
  assert.ok(text.includes(`${top[0]} holds ${n(top[1].offerings)} of ${n(R.totals.linked_offerings)} listings; ${thin} counties list fewer than 10`), 'the county exhibit title does not match the data');
  const rows = (html.match(/<tbody>[\s\S]*?<\/tbody>/g) || []).pop();
  assert.equal((rows.match(/<tr>/g) || []).length, Object.keys(R.by_county).length, 'one county row per represented county');
});

test('research page indicators are generated rather than hardcoded', () => {
  const src = fs.readFileSync(path.join(root, 'tools', 'catalogue-indicators.mjs'), 'utf8');
  assert.match(src, /summariseCatalogue\(COURSES,INSTITUTIONS,\{feeBasis\}\)/);
});
