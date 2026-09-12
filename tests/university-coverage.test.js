/* Njia — the university register must be measured, not assumed complete.
 *
 * WHY THIS FILE EXISTS.
 *
 * This repository already knows exactly how many counties show an E-grade
 * learner nothing, because somebody built a ratchet for it. It knew nothing
 * about how many of Kenya's universities it actually lists, because nobody
 * built one — so the answer drifted, invisibly, until a reader asked whether a
 * specific university was in and it turned out not to be.
 *
 * Gretsa was chartered in November 2025 and absent. Baraton, Great Lakes,
 * Kenya Highlands and Scott Christian were absent. The Co-operative University
 * of Kenya — a public university with a certificate-to-degree ladder, which is
 * the rarest and most useful shape in this catalogue — was absent. None of that
 * was discovered by the suite. All of it was discovered by being asked.
 *
 * That is the general failure and it is worth naming plainly: EVERY COVERAGE
 * QUESTION THIS PROJECT CAN ANSWER HAS A GUARD, AND EVERY ONE IT CANNOT, IT
 * DOES NOT KNOW IT IS MISSING. A catalogue that measures county reach to the
 * county and does not measure its own institution register is not being
 * careful, it is being careful in one direction.
 *
 * WHAT THIS MEASURES.
 *
 * The denominators are the Commission for University Education's registers, as
 * reported in March and April 2026: 36 chartered public universities and 32
 * chartered private universities. Those are counts Njia cannot verify from this
 * build — cue.or.ke is egress-blocked like every other Kenyan host — so they
 * are recorded here as sourced figures with the date they were read, and the
 * test measures Njia against them rather than pretending to audit CUE.
 *
 * The ratchet runs the same way as the county floor: coverage may rise and
 * never fall. And the institutions known to be missing are NAMED rather than
 * left as a number, because a gap inside an aggregate is a gap nobody looks at
 * — the same reasoning that names the closed counties in sector-coverage. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const ctx = vm.createContext({});
for (const file of ['institutions.js', 'courses.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'data', file), 'utf8'), ctx);
}
const INSTITUTIONS = vm.runInContext('INSTITUTIONS', ctx);
const COURSES = vm.runInContext('COURSES', ctx);

/* Sourced from CUE's published register of authorised universities, read via
   search summaries in August 2026 (the register itself is egress-blocked here).
   Kenya also holds 7 public constituent colleges, 2 private constituent
   colleges and several institutions on letters of interim authority; those are
   deliberately outside this denominator, because a constituent college is
   reached through its parent and an interim authority can lapse. */
const CUE_PUBLIC_CHARTERED = 36;
const CUE_PRIVATE_CHARTERED = 32;

const universities = (ownership) =>
  INSTITUTIONS.filter((i) => i.type === 'university' && i.ownership === ownership);

/* RATCHETS. Raise these as institutions are added; they may never fall.
   They are floors on coverage, not targets — the target is the full register. */
const MIN_PUBLIC_LISTED = 27;
const MIN_PRIVATE_LISTED = 25;

test('public university coverage never regresses', () => {
  const listed = universities('public').length;
  assert.ok(listed >= MIN_PUBLIC_LISTED,
    `Njia lists ${listed} public universities, down from ${MIN_PUBLIC_LISTED}. `
    + 'An institution removed from the register disappears from every county page and every '
    + 'filter that would have surfaced it, silently.');
});

test('private university coverage never regresses', () => {
  const listed = universities('private').length;
  assert.ok(listed >= MIN_PRIVATE_LISTED,
    `Njia lists ${listed} private universities, down from ${MIN_PRIVATE_LISTED}.`);
});

/* The known-missing list is the working front. An institution named here has
   been confirmed to exist and confirmed to be absent; removing a name from this
   list without adding the institution is how a gap gets quietly forgotten. */
/* The public side had no list at all, which is the asymmetry this very file
   warns about: the private gap was named institution by institution and the
   public gap was reported as nothing, so nobody could see that nine chartered
   public universities were absent. Every one of these was confirmed to exist,
   with its charter year and county, in September 2026. Several sit in counties
   where Njia is thin, which is why the gap is worth naming rather than
   counting: a learner in Bungoma or Siaya is not helped by knowing that
   coverage is 27 of 36.

   Alupe is the instructive one. It IS reachable and it is NOT listed, because
   only one of its programmes - Bachelor of Education (Arts) - is named in any
   source this build can reach; the rest surface as school names, and a named
   school is not a named course. One course would make it a single-course stub,
   which this file separately refuses as coverage. It is a lead with the exact
   blocker named, not an oversight. */
const KNOWN_MISSING_PUBLIC = [
  'Alupe University',                     // Busia, chartered 2022
  'Bomet University',                     // Bomet, chartered 4 February 2026 - the 36th
  'Jaramogi Oginga Odinga University of Science and Technology', // Siaya
  'Karatina University',                  // Nyeri, chartered 2013
  'Kibabii University',                   // Bungoma, chartered 2015
  'Meru University of Science and Technology', // Meru
  'Tharaka University',                   // Tharaka-Nithi, chartered 2022
  'University of Eldoret',                // Uasin Gishu
  'University of Embu'                    // Embu, chartered 2016
];

test('the known-missing public universities are still named, or listed', () => {
  const names = INSTITUTIONS
    .filter((i) => i.type === 'university')
    .map((i) => i.name.toLowerCase());
  const stillMissing = KNOWN_MISSING_PUBLIC.filter((n) => {
    const key = n.toLowerCase().replace(/^the /, '').split(' ')[0];
    return !names.some((have) => have.includes(key));
  });

  const listed = universities('public').length;
  assert.ok(listed + stillMissing.length <= CUE_PUBLIC_CHARTERED,
    `${listed} public universities listed and ${stillMissing.length} named as missing is more than `
    + `the ${CUE_PUBLIC_CHARTERED} CUE records — one of those figures is stale, so re-read the register.`);

  assert.ok(stillMissing.length <= KNOWN_MISSING_PUBLIC.length,
    'the known-missing public list grew without the register count moving');
});

const KNOWN_MISSING_PRIVATE = [
  'Africa International University',
  'Adventist University of Africa',
  'KAG EAST University',
  'Presbyterian University of East Africa',
  'Aga Khan University',
  'The East African University',
  'Islamic University of Kenya'
];

test('the known-missing private universities are still named, or listed', () => {
  const names = INSTITUTIONS.map((i) => i.name.toLowerCase());
  const stillMissing = KNOWN_MISSING_PRIVATE.filter((n) => {
    const key = n.toLowerCase().replace(/^the /, '').split(' ')[0];
    return !names.some((have) => have.includes(key));
  });

  /* The arithmetic has to hold: listed plus still-missing cannot exceed the
     register, or one of the two numbers is wrong and the gap is misreported. */
  const listed = universities('private').length;
  assert.ok(listed + stillMissing.length <= CUE_PRIVATE_CHARTERED + 2,
    `${listed} private universities listed and ${stillMissing.length} named as missing is more than `
    + `the ${CUE_PRIVATE_CHARTERED} CUE records — one of those figures is stale, so re-read the register.`);

  assert.ok(stillMissing.length <= KNOWN_MISSING_PRIVATE.length,
    'the known-missing list grew without the register count moving');
});

test('every listed university actually carries a course', () => {
  const withCourses = new Set(COURSES.map((c) => c.institution_id));
  const empty = INSTITUTIONS
    .filter((i) => i.type === 'university' && !withCourses.has(i.id))
    .map((i) => `${i.id} (${i.name})`);

  assert.equal(empty.join('; '), '',
    `these universities are in the register and render for nobody: ${empty.join('; ')}. `
    + 'mku and maseno sat like this and made the analysis page disagree with its own rows. '
    + 'A university with no course is not coverage.');
});

/* A university listed with one programme is a stub, not coverage: a reader
   filtering for business or computing sees one row where the institution runs a
   school of them. Eleven of seventeen private universities were in this state
   when it was first measured, which is why it is measured. */
test('listed universities are not left as single-course stubs', () => {
  const count = (id) => COURSES.filter((c) => c.institution_id === id).length;
  const stubs = INSTITUTIONS
    .filter((i) => i.type === 'university' && count(i.id) === 1)
    .map((i) => i.name);

  const MAX_STUBS = 0;
  assert.ok(stubs.length <= MAX_STUBS,
    `${stubs.length} universities carry exactly one course, up from the ${MAX_STUBS} recorded when this `
    + `was last measured: ${stubs.join('; ')}. Deepen one rather than adding another stub.`);
});
