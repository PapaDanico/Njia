'use strict';
/* /methodology/ states figures and limits. Every number is recomputed from the
 * catalogue here, not compared against the generator's own variables. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'methodology', 'index.html'), 'utf8');
const text = page.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&middot;|&amp;/g, ' ').replace(/\s+/g, ' ');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'data', 'courses.js'), 'utf8') + '\n;this.N = COURSES.length', ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data', 'landing-stats.js'), 'utf8') + '\n;this.S = LANDING_STATS', ctx);
const n = (v) => Number(v).toLocaleString('en-KE');

test('methodology figures match the catalogue', () => {
  assert.strictEqual(ctx.S.courses, ctx.N);
  for (const v of [ctx.S.courses, ctx.S.institutions, ctx.S.distinctProgrammes, ctx.S.published, ctx.S.derived, ctx.S.feeAbsent]) {
    assert.ok(text.includes(n(v)), `the page does not carry ${n(v)}`);
  }
  assert.ok(text.includes(n(ctx.S.courses - ctx.S.published - ctx.S.derived)), 'the remainder group is not stated');
});

test('methodology states each limit it promises', () => {
  for (const phrase of [
    'not a validated psychological test',
    'Vacancy adverts are not employment',
    'No employment or salary outcomes',
    'No admission guarantee',
    'never recorded one higher than published'.replace('recorded', 'records'),
    'A range is not a fee'.toLowerCase()
  ]) {
    assert.ok(text.toLowerCase().includes(phrase.toLowerCase()), `missing: ${phrase}`);
  }
});

test('methodology links to the pages it points at', () => {
  for (const href of ['/diagnostic/', '/privacy/', '/open-data/', '/research/', '/analysis/']) {
    assert.ok(page.includes(`href="${href}"`), `no link to ${href}`);
  }
});
