/* Njia — what a reader downloads before they can do anything.
 *
 * WHY THIS FILE EXISTS.
 *
 * Every coverage question in this repository that has a guard is answered, and
 * every one without a guard is drifting — tests/university-coverage.test.js was
 * written on exactly that observation, after the institution register turned out
 * to be 16 of 32 chartered private universities with nothing saying so.
 *
 * Payload was the next one. `CLAUDE.md` records a lazy split that took
 * DOMContentLoaded on throttled 3G from 5,661ms to 3,605ms by moving 86.3KB
 * gzipped of catalogue off the critical path, and then nothing measured it
 * again. Between them, PRs #104 and #105 grew the catalogue from 469 courses to
 * 664 — a 15.5% rise in the lazy bundle in a single afternoon — and the only
 * number anyone looked at afterwards was a Lighthouse score, which `CLAUDE.md`
 * separately establishes is evidence in neither direction.
 *
 * These readers are on cheap Android phones on metered data. Bytes are the
 * same category of decision as the 12px type floor: not a preference, an
 * access question.
 *
 * WHAT IS GUARDED, AND WHY EACH IS SHAPED THE WAY IT IS.
 *
 * The first test is a property rather than a number, and it is the important
 * one. The catalogue must not be reachable from the served HTML. That is the
 * whole architecture the lazy split bought, it cannot be re-derived from a byte
 * count, and a regression would look like nothing but a slower first paint.
 *
 * The second is a hard ceiling on the critical path, kept tight on purpose.
 * Nothing on that path should grow when the catalogue does; if it is growing,
 * something has been wired to the wrong side of the split and the failure
 * message prints the per-file breakdown so the offender is named rather than
 * hunted.
 *
 * The third deliberately does NOT cap the catalogue's total size. Capping it
 * would fail on data that got better — the trap the artisan-variety guard fell
 * into, where a count of distinct entry values broke because the records became
 * more correct. Adding courses is the point of the project. What must not
 * happen is each record getting fatter, so the budget is bytes PER course:
 * research is free, bloat is not.
 *
 * A NOTE ON THE UNIT. gzip level 9 is a proxy — Netlify negotiates brotli with
 * most browsers and will send fewer bytes than this. It is used because it is
 * in Node's standard library, is deterministic, and moves in the same direction
 * as the real thing. The ceilings are proxy figures and mean nothing in
 * absolute terms; what they defend is the delta.
 *
 * THE FINDING THIS GUARD WAS WRITTEN AROUND, recorded because the number is
 * worth acting on and is not yet acted on:
 *
 *   data/labour-market.js costs 34.7KB gzipped, the largest single item on the
 *   critical path — bigger than js/app.js, and four fifths of the stylesheet.
 *   js/app.js is its only critical-path consumer and it uses TWO of the thirty
 *   symbols the file defines: PLACEMENT_CALENDAR and PLACEMENT_MECHANICS, both
 *   for the Application Clock. The other twenty-eight are Discover and Design
 *   content being paid for by every reader who never opens either.
 *
 *   That is the same shape as the split already in the history — 86.3KB of
 *   catalogue loaded "to render eight integers on a page that shows no course"
 *   — and it is not fixed here, because splitting a classic-script dependency
 *   graph is where this project has already made the same mistake twice
 *   (`feeBasis is not defined`, then `GRADE_ORDER is not defined`, both green
 *   through the unit suite and caught by the functional probe). It is a change
 *   that needs its own pass with the probe in the loop, not a rider on a guard.
 *   The ceiling below is set so that doing it registers as a large win rather
 *   than disappearing into headroom.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');

const ROOT = path.join(__dirname, '..');
const gz = (rel) => zlib.gzipSync(fs.readFileSync(path.join(ROOT, rel)), { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)}KB`;

/* The critical path is read out of the served HTML rather than listed here, so
   a script added to index.html is measured whether or not anyone remembers this
   file. That is the "one list, not a guard per surface" rule: the guard reads
   the surface instead of keeping its own copy of it. */
function criticalPath() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = ['index.html'];
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) files.push(m[1].replace(/^\.?\//, ''));
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
    files.push(m[1].replace(/^\.?\//, ''));
  }
  return files.filter((f) => !/^https?:/.test(f) && fs.existsSync(path.join(ROOT, f)));
}

const CATALOGUE = ['data/courses.js', 'data/institutions.js'];

test('the catalogue is not on the critical path', () => {
  /* The property the whole lazy split exists to protect, and the one a byte
     count cannot express. Regressing it would not throw, would not fail any
     other test, and would look like nothing except a slower first visit for
     every reader on a weak signal — which is precisely the reader this is for. */
  const onPath = criticalPath().filter((f) => CATALOGUE.includes(f));
  assert.deepEqual(onPath.join(', '), '',
    `index.html loads ${onPath.join(', ')} directly. The catalogue is deferred to `
    + 'PAGE_MODULE precisely so a reader who never opens Discover or Decide never pays '
    + `for it (${kb(CATALOGUE.reduce((n, f) => n + gz(f), 0))} gzipped today). Load it from `
    + 'PAGE_MODULE in js/app.js, not from the served HTML.');
});

test('the critical path stays inside its byte budget', () => {
  /* Tight headroom is the point. Nothing here should grow when the catalogue
     grows; if this fails, the question is not "raise the ceiling" but "what got
     wired to the wrong side of the split". Hence the breakdown in the message —
     a failure that reports only a total sends you hunting.

     Ratcheted 150 -> 125KB when data/labour-market.js came off this path and
     the total fell 145.8 -> 115.4KB, a 20.9% cut for every first-time reader.
     A ceiling left at its old value after a win is not a ratchet, it is
     headroom for the next regression to hide in.

     Ratcheted again 125 -> 109KB when data/funding.js came off it the same
     way: 114.7 -> 105.4KB, 8.1%. js/app.js read two things out of that file —
     FUNDING_SOURCES.length and the name and deadline of at most four records
     for the Application Clock — and carried all 10.1KB gzipped to do it. Both
     are precomputed into LANDING_STATS now, which cost 0.7KB there. */
  const CEILING = 109 * 1024;
  const files = criticalPath();
  const sizes = files.map((f) => [f, gz(f)]).sort((a, b) => b[1] - a[1]);
  const total = sizes.reduce((n, [, s]) => n + s, 0);
  assert.ok(total <= CEILING,
    `every reader downloads ${kb(total)} gzipped before they can do anything, over the `
    + `${kb(CEILING)} budget. Largest first:\n`
    + sizes.map(([f, s]) => `    ${kb(s).padStart(8)}  ${f}`).join('\n')
    + '\n  Move what only one route needs into PAGE_MODULE rather than raising this.');
});

test('catalogue records do not get fatter as the catalogue grows', () => {
  /* Adding courses is the project. Capping the catalogue's total size would
     fail on data that got better, which is the mistake the artisan entry-grade
     guard made when it counted distinct values. So the budget is per record:
     research costs nothing here, and a field duplicated onto 664 records does. */
  const PER_COURSE = 125;
  const ctx = vm.createContext({});
  for (const f of CATALOGUE) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  const { COURSES } = vm.runInContext('({ COURSES })', ctx);
  const bytes = gz('data/courses.js');
  const per = bytes / COURSES.length;
  assert.ok(per <= PER_COURSE,
    `data/courses.js is ${per.toFixed(1)} gzipped bytes per course across ${COURSES.length} `
    + `records (${kb(bytes)} total), over the ${PER_COURSE}-byte budget. This guard does not `
    + 'care how many courses there are — it fails when each one gets heavier, which is a '
    + 'field added to every record or a note pasted across many. Check what the last change '
    + 'added to every course before raising it.');
});
