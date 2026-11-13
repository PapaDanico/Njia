/* Njia - funding freshness: an expired call must not be announced as live.
 *
 * `valid_until` is the last day a funding record's stated call is known to be
 * open; `checked_at` is the day someone last re-read the record against its
 * source. Neither may be invented: checked_at is set only on records that were
 * actually re-read, which is why most records carry none. These guards assert
 * the PROPERTY (an expired record cannot reach the clock or read as open) and
 * the shape of the data, not any one record. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = vm.createContext({});
vm.runInContext(read('data/funding.js'), ctx);
const FUNDING = vm.runInContext('FUNDING_SOURCES', ctx);

/* The function under test is read out of js/app.js, not copied, so the test
   cannot drift from what ships. */
const src = read('js/app.js');
const fnSrc = src.match(/function fundingIsExpired\([\s\S]*?\n}\n/);
assert.ok(fnSrc, 'fundingIsExpired is missing from js/app.js');
const fundingIsExpired = vm.runInContext(`(${fnSrc[0].replace(/^function fundingIsExpired/, 'function')})`, vm.createContext({}));

test('a record is expired the day after valid_until and not before', () => {
  const r = { valid_until: '2026-06-12' };
  assert.equal(fundingIsExpired(r, '2026-06-12'), false, 'the last valid day is still open');
  assert.equal(fundingIsExpired(r, '2026-06-13'), true, 'the day after is closed');
  assert.equal(fundingIsExpired({}, '2099-01-01'), false, 'a record with no stated end is never expired by this rule');
  assert.equal(fundingIsExpired(null, '2026-01-01'), false);
});

test('the clock and the funding card both consult the same expiry rule', () => {
  assert.match(src, /LANDING_STATS\.fundingDeadlines\.filter\(\(f\) => !fundingIsExpired\(f, today\)\)/,
    'the Application Clock no longer filters expired funding rows');
  assert.match(read('js/decide.js'), /fundingIsExpired\(f, /, 'the funding card no longer says a call has closed');
});

test('freshness dates are well-formed, ordered, and only attested where re-read', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const bad = [];
  for (const f of FUNDING) {
    for (const k of ['checked_at', 'valid_until']) {
      if (f[k] != null && !iso.test(f[k])) bad.push(`${f.id}.${k} is not an ISO date: ${f[k]}`);
    }
    if (f.checked_at && f.valid_until && f.valid_until < f.checked_at) bad.push(`${f.id} valid_until precedes checked_at`);
    if (f.checked_at && f.data_confidence !== 'verified') bad.push(`${f.id} carries checked_at but is not verified`);
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});
