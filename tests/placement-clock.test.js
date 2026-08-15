/* Njia — the Application Clock must not count down to a date that has passed,
 * and must not run out of dates without telling anyone.
 *
 * WHY THIS FILE EXISTS.
 *
 * The Application Clock sits in the landing hero, above the fold, and is the
 * only thing on the site that tells a reader they have to act by a particular
 * day. It is computed from PLACEMENT_CALENDAR rather than written as prose,
 * and the comment above openPlacementWindows() explains why: "a hardcoded
 * 'applications close in May' quietly becomes a lie in June".
 *
 * That reasoning was right and the implementation had two holes in it, both
 * found by simulating dates in a real browser rather than by reading the code.
 *
 * ONE — NEGATIVE ZERO KEPT CLOSED WINDOWS ON SCREEN.
 *
 * The filter was `daysLeft >= 0` where daysLeft came from Math.ceil(). For a
 * window that closed within the previous 24 hours the quotient is a small
 * negative, and Math.ceil() of a small negative is -0. In JavaScript
 * `-0 >= 0` is true and `-0 === 0` is true, so the row survived the filter AND
 * matched the "Closes today" branch. On 15 August the hero rendered:
 *
 *     Inter-institutional transfer
 *     Closes today · closes 2026-08-14
 *
 * A row contradicting itself, where the half a reader acts on is the wrong
 * one, on the day after the deadline — the single day the mistake costs the
 * most, because it is the day someone still believes they can make it.
 *
 * TWO — THE CALENDAR EXPIRES AND NOTHING SAYS SO.
 *
 * Every window is a fixed date and the last one closes 2026-12-31. Simulated
 * at 2027-02-01 the clock does not crash; it silently falls back to four
 * funding rows reading "Rolling, opens with each intake" and "Varies — check
 * annually". No error, no notice, no test — the most time-critical component
 * on the site degrades to vagueness and looks completely healthy doing it.
 *
 * A silent expiry is a manual step nobody wrote down. This file turns it into
 * a build failure with a runway, so the calendar gets refreshed before it runs
 * out rather than after somebody notices.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const { PLACEMENT_CALENDAR } = require(path.join(root, 'data', 'labour-market.js'));

/* Same brace-matching reader the fee-basis guards use, so the function under
   test is the one the app ships rather than a copy written for the test. */
function extractFn(source, name) {
  const at = source.indexOf(`function ${name}(`);
  if (at === -1) throw new Error(`${name}() not found`);
  let depth = 0;
  for (let i = source.indexOf('{', at); i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(at, i + 1); }
  }
  throw new Error('unbalanced braces');
}
const appSource = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const openPlacementWindows = vm.runInNewContext(
  `${extractFn(appSource, 'openPlacementWindows')}; openPlacementWindows`,
  { PLACEMENT_CALENDAR, Date }
);

const DAY = 24 * 60 * 60 * 1000;

test('a window that has already closed is never shown', () => {
  /* Walked across each window's closing date at several times of day, because
     the bug was invisible at some hours and not others: the quotient only
     lands in the (-1, 0) interval that Math.ceil turns into -0 while "now" is
     less than a day past the close. */
  const bad = [];
  for (const w of PLACEMENT_CALENDAR) {
    const closesAt = new Date(`${w.closes}T23:59:59`).getTime();
    for (const offsetHours of [0.001, 1, 6, 12, 18, 23.9]) {
      const now = new Date(closesAt + offsetHours * 60 * 60 * 1000);
      const shown = openPlacementWindows(now).find((x) => x.name === w.name);
      if (shown) {
        bad.push(`${w.name} (closed ${w.closes}) still shown ${offsetHours}h later as `
          + `"${shown.daysLeft === 0 ? 'Closes today' : `${shown.daysLeft} days left`}"`);
      }
    }
  }
  assert.deepEqual(bad, [],
    `a closed placement window is still on the Application Clock: ${bad.slice(0, 3).join('; ')}. `
    + 'Filter on the millisecond difference, not on Math.ceil()\'s output — `-0 >= 0` is true.');
});

test('daysLeft is never negative zero', () => {
  /* Named separately from the filter test because the two failures are
     independent: a future refactor could filter correctly and still format
     -0 into the "Closes today" branch. Object.is is the only comparison that
     can see the difference. */
  const offenders = [];
  for (const w of PLACEMENT_CALENDAR) {
    const closesAt = new Date(`${w.closes}T23:59:59`).getTime();
    for (const ms of [-1, -1000, -DAY / 2, 0, 1000, DAY]) {
      for (const x of openPlacementWindows(new Date(closesAt - ms))) {
        if (Object.is(x.daysLeft, -0)) offenders.push(`${x.name} at offset ${ms}ms`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    `daysLeft came out as -0, which renders as "Closes today" for a deadline that has passed: `
    + `${offenders.slice(0, 3).join('; ')}`);
});

test('an open window still counts down correctly', () => {
  /* The converse. A fix that dropped everything would also pass the two tests
     above, and the failure mode — an empty clock — looks like "no intakes are
     open" rather than like a bug. */
  const w = PLACEMENT_CALENDAR[0];
  const closesAt = new Date(`${w.closes}T23:59:59`).getTime();
  const opensAt = new Date(w.opens).getTime();
  const mid = new Date(Math.max(opensAt, closesAt - 10 * DAY));
  const shown = openPlacementWindows(mid).find((x) => x.name === w.name);
  assert.ok(shown, `${w.name} is not shown while it is open`);
  assert.ok(shown.daysLeft >= 0 && shown.daysLeft <= 11,
    `${w.name} shows ${shown.daysLeft} days left ten days before it closes`);
});

test('the placement calendar has not run out', () => {
  /* THE ONE THAT MATTERS MOST, because it is the only failure here that no
     amount of correct code prevents. Every window is a fixed date; when the
     last one passes, the Application Clock silently becomes four lines of
     "Varies — check annually" and nothing anywhere says the data expired.
     Simulated at 2027-02-01 that is exactly what it does.

     Ninety days of runway rather than zero: refreshing the calendar means
     finding the next KUCCPS and KMTC cycle dates, which is research against
     hosts this build cannot reach, so the warning has to arrive while there is
     still time to do it by hand. */
  const RUNWAY_DAYS = 90;
  const last = PLACEMENT_CALENDAR
    .map((w) => new Date(`${w.closes}T23:59:59`).getTime())
    .sort((a, b) => b - a)[0];
  const daysLeft = Math.floor((last - Date.now()) / DAY);

  assert.ok(daysLeft > RUNWAY_DAYS,
    `the last placement window closes in ${daysLeft} days `
    + `(${new Date(last).toISOString().slice(0, 10)}). When it passes, the Application Clock in the `
    + 'landing hero stops showing any dated deadline and falls back to "Rolling, opens with each '
    + 'intake" — a silent drop in the most time-critical thing on the site. Add the next cycle\'s '
    + 'KUCCPS, KMTC and TVET dates to PLACEMENT_CALENDAR in data/labour-market.js.');
});

test('every calendar entry opens before it closes', () => {
  const inverted = PLACEMENT_CALENDAR
    .filter((w) => new Date(w.opens) > new Date(`${w.closes}T23:59:59`))
    .map((w) => `${w.name}: opens ${w.opens}, closes ${w.closes}`);
  assert.deepEqual(inverted, [],
    `these windows close before they open, so they can never appear: ${inverted.join('; ')}`);
});
