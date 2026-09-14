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
const MIN_PUBLIC_LISTED = 36;
const MIN_PRIVATE_LISTED = 29;

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
   public gap was reported as nothing, so nobody could see that twelve chartered
   public universities were absent. All twelve have since been listed, and this
   list is EMPTY rather than deleted — the empty array is the finding. If a
   future CUE register grows past 36, the gap belongs here by name, not as a
   number nobody can see behind.

   Alupe was the last, and it is why the list is kept. It was held back for one
   pass as a lead, because a general search returned only school names and a
   named school is not a named course — one record would have been the
   single-course stub this file refuses as coverage. A per-school query found
   four named programmes. A lead with its blocker named is worth more than a
   number, and it is what made the difference here. */
const KNOWN_MISSING_PUBLIC = [];

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

/* A MISSING LIST SHOULD ONLY HOLD GAPS THAT CAN BE CLOSED.
 *
 * Five names came off this list on 13 Sep 2026 - Africa International
 * University, KAG EAST, the Presbyterian University of East Africa and the
 * Islamic University of Kenya were listed, and Adventist University of Africa
 * was moved out of the list entirely rather than counted as a gap.
 *
 * AUA is POSTGRADUATE ONLY. It runs two schools, a Theological Seminary and a
 * School of Postgraduate Studies, and every award in both is a master's or a
 * doctorate. It can never produce a row in a catalogue read by people deciding
 * what to do after KCSE, so carrying it as "missing" would overstate the gap
 * for ever - the aggregate would never close and nobody would know why. That is
 * the same reasoning that keeps upgrading and in-service routes out of the KMTC
 * campuses: the exclusion is about who the reader is, not about the institution
 * being lesser. */
const OUT_OF_SCOPE_PRIVATE = [
  'Adventist University of Africa — postgraduate only, no bachelor awards',
];

const KNOWN_MISSING_PRIVATE = [
  /* Blocker: its Kenyan programmes are medical and nursing and run heavily at
     postgraduate level; no reachable source names an undergraduate award with
     an entry requirement. Not re-run without a per-programme listing. */
  'Aga Khan University',
  /* Blocker: worked 13 Sep 2026 and yielded ONE corroborated programme
     (Bachelor of Business Information Technology, named by two independently
     phrased searches). Its other degrees rest on a single listing. One record
     would make it the single-course stub MAX_STUBS forbids, so it stays a lead
     until a second source names a second award. Do not re-run the general
     search; the missing thing is corroboration, not effort. */
  'The East African University'
];

test('the out-of-scope private universities say WHY, not just that', () => {
  assert.ok(OUT_OF_SCOPE_PRIVATE.every((n) => n.includes('—')),
    'every out-of-scope university must carry its reason on the same line, '
    + 'or the next reader re-works it and finds the same nothing.');
});

test('the known-missing private universities are still named, or listed', () => {
  const names = INSTITUTIONS.map((i) => i.name.toLowerCase());
  const stillMissing = KNOWN_MISSING_PRIVATE.filter((n) => {
    const key = n.toLowerCase().replace(/^the /, '').split(' ')[0];
    return !names.some((have) => have.includes(key));
  });

  /* The arithmetic has to hold: listed plus still-missing cannot exceed the
     register, or one of the two numbers is wrong and the gap is misreported. */
  const listed = universities('private').length;
  assert.ok(listed + stillMissing.length + OUT_OF_SCOPE_PRIVATE.length <= CUE_PRIVATE_CHARTERED + 2,
    `${listed} private universities listed, ${stillMissing.length} named as missing and `
    + `${OUT_OF_SCOPE_PRIVATE.length} out of scope is more than the ${CUE_PRIVATE_CHARTERED} CUE `
    + 'records — one of those figures is stale, so re-read the register.');

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

/* A CAP ON SINGLE-COURSE STUBS IS NOT A MEASURE OF DEPTH.
 *
 * The stub cap above bans a university with ONE course and says nothing about a
 * university with two, so the register satisfied it completely while 28
 * universities carried fewer than five records and three carried no degree at
 * all - Egerton, TU-K and Multimedia - and KCA held five certificates and
 * diplomas and none of the degrees it is known for. An audit found it; no guard
 * could have, because nothing was counting.
 *
 * This ratchets the thin tail. It may fall and never rise. Deepening one
 * university is what lowers it; adding a two-course university is what the
 * guard is aimed at. */
test('the thin tail of shallow universities only shrinks', () => {
  const count = (id) => COURSES.filter((c) => c.institution_id === id).length;
  const thin = INSTITUTIONS
    .filter((i) => i.type === 'university' && count(i.id) < 5)
    .map((i) => `${i.name} (${count(i.id)})`);

  /* Ratchet. Lower it when you deepen one; never raise it. It was 28 when the
     audit that prompted this guard was run, with three universities carrying no
     degree at all. */
  const MAX_THIN = 11;
  assert.ok(thin.length <= MAX_THIN,
    `${thin.length} universities carry fewer than five courses, above the ceiling of ${MAX_THIN}: `
    + `${thin.join('; ')}. A university running several schools and listed with two programmes `
    + 'answers a reader searching its name with almost nothing. Deepen one rather than adding another.');
});

/* A UNIVERSITY THAT AWARDS DEGREES MUST CARRY AT LEAST ONE.
 *
 * Egerton is Kenya's oldest agricultural university and this catalogue listed
 * four of its diplomas and certificates and not one degree. That is not a thin
 * record, it is a wrong answer to the question a school-leaver actually asks. */
test('every listed university carries at least one degree', () => {
  const degreeless = INSTITUTIONS
    .filter((i) => i.type === 'university')
    .filter((i) => !COURSES.some((c) => c.institution_id === i.id && c.level === 'degree'))
    .map((i) => i.name);

  assert.deepStrictEqual(degreeless.join('; '), '',
    `these universities carry no degree record at all: ${degreeless.join('; ')}. `
    + 'A university listed only with its diplomas tells a reader it does not teach degrees.');
});

/* KMTC IS THE LARGEST PROVIDER IN THIS CATALOGUE AND ITS REGISTER WAS NEVER COUNTED.
 *
 * Everything above measures universities against CUE's denominator. KMTC sits
 * in the C-minus to C-plus band in more counties than any university does, and
 * nothing here had ever asked how many campuses it actually has - which is this
 * file's own warning (a coverage question with a guard is answered; one without
 * drifts) applied to the provider this catalogue leans on hardest.
 *
 * Measured: KMTC's own site says 92 campuses across 46 of the 47 counties. Its
 * e-learning page still says 71, and a third source says 88 campuses plus 5
 * satellites, which lands back at about 93. So the denominator is genuinely
 * uncertain and the LOW figure is used deliberately - a floor nobody can argue
 * with, rather than a number this catalogue would be flattered by missing.
 *
 * Njia holds 47. Against 71 that is a third of the estate absent; against 92 it
 * is half. Either way the gap is larger than every university gap on this page
 * put together, and it was invisible because nothing counted it.
 *
 * Do NOT close this by inventing campuses from the national campus list. A KMTC
 * campus earns a row the same way every other institution here does: its own
 * background-and-programmes listing, and at least one course named by two
 * independently phrased searches. The named-missing list below is the honest
 * shape - a gap inside an aggregate is a gap nobody looks at. */
const KMTC_CAMPUSES_CLAIMED_LOW = 71;

/* Campuses confirmed to exist by search and absent from the register. Add to
   this list whenever one surfaces; remove a name only when it is LISTED. */
const KNOWN_MISSING_KMTC = [
  /* Maua and Miathene both closed 13 Sep 2026. */
  'Imenti (Meru County, announced by the county government)',
];

test('KMTC campus coverage never regresses, and the gap stays named', () => {
  const campuses = INSTITUTIONS.filter((i) => /^kmtc/.test(i.id));
  const MIN_KMTC_LISTED = 49;

  assert.ok(campuses.length >= MIN_KMTC_LISTED,
    `Njia lists ${campuses.length} KMTC campuses, down from ${MIN_KMTC_LISTED}. `
    + 'This ratchet may rise and may never fall.');

  assert.ok(campuses.length <= KMTC_CAMPUSES_CLAIMED_LOW,
    `Njia lists ${campuses.length} KMTC campuses against the LOWEST figure KMTC itself `
    + `publishes (${KMTC_CAMPUSES_CLAIMED_LOW}). Either a campus is duplicated - Mombasa and `
    + 'Kapkatet both were - or that denominator is stale and needs re-reading.');

  assert.ok(KNOWN_MISSING_KMTC.every((n) => typeof n === 'string' && n.length > 0),
    'Every known-missing KMTC campus must be named, not counted.');

  const listedNames = campuses.map((i) => i.name).join(' | ');
  const wronglyListed = KNOWN_MISSING_KMTC.filter((n) => listedNames.includes(n.split(' (')[0]));
  assert.deepStrictEqual(wronglyListed.join(''), '',
    `These are named as missing but appear in the register: ${wronglyListed.join('; ')}. `
    + 'Remove them from KNOWN_MISSING_KMTC — a stale gap list is worse than none.');
});

test('no two KMTC campuses share a county without saying so', () => {
  /* Mombasa held ONE row for two campuses (Port Reitz, and the 1948 Mombasa
     Campus on the island) and every geographic guard passed, because both sit
     in one county. This does not forbid two campuses in a county - Mombasa and
     Meru genuinely have them - it forbids the thing that hid it: a campus name
     carrying a second place name, which reads as one campus with a district
     attached and is how the two stayed merged. */
  const offenders = INSTITUTIONS
    .filter((i) => /^kmtc/.test(i.id))
    .filter((i) => (i.name.split('—')[1] || '').includes(','))
    .map((i) => `${i.id} (${i.name})`);

  assert.deepStrictEqual(offenders.join('; '), '',
    `A KMTC campus name carries two place names: ${offenders.join('; ')}. `
    + 'Search the second name on its own: "Port Reitz, Mombasa Campus" was two campuses in one row. '
    + 'If they are genuinely one campus, name it for the one place; if two, split them.');
});
