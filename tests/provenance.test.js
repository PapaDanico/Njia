/* Data-provenance invariants — run with `node --test tests/*.test.js`.
 *
 * These exist because the failure they guard against already happened once.
 * A single `data_confidence` flag covered a whole course record while every
 * verification_note written against it described a fee. The consequence was
 * an invented employment rate rendering under a "Verified" badge, sorting the
 * results list, and picking the comparison table's winner. Nothing caught it,
 * because nothing was checking that a claim of verification was backed by a
 * source.
 *
 * The rule these tests encode: a figure may be presented as verified only if
 * a named source is attached to it. Anything else is an estimate and must be
 * marked as one.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const context = vm.createContext({ console, module: { exports: {} } });
for (const file of ['data/institutions.js', 'data/courses.js', 'data/funding.js', 'data/labour-market.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const grab = (name) => vm.runInContext(name, context);
const COURSES = grab('COURSES');
const INSTITUTIONS = grab('INSTITUTIONS');
const FUNDING_SOURCES = grab('FUNDING_SOURCES');
const SECTOR_EARNINGS = grab('SECTOR_EARNINGS');
const YOUTH_EMPLOYMENT_MEASURES = grab('YOUTH_EMPLOYMENT_MEASURES');
const KENYA_DEMAND_SIGNALS = grab('KENYA_DEMAND_SIGNALS');
const AUTOMATION_EXPOSURE = grab('AUTOMATION_EXPOSURE');
const METHOD_LINEAGE = grab('METHOD_LINEAGE');

/* ---------- provenance is per-field, and claims are backed ---------- */

test('no course carries the retired whole-record data_confidence flag', () => {
  // .map inside the vm realm returns that realm's Array, which deepStrictEqual
  // rejects against a local []; compare the joined ids instead.
  const stragglers = COURSES.filter((c) => c.data_confidence !== undefined).map((c) => c.id).join(', ');
  assert.equal(stragglers, '', 'data_confidence conflated fees with outcomes — use fees_confidence / outcomes_confidence');
});

test('every course declares both fee and outcome provenance', () => {
  const valid = ['verified', 'illustrative'];
  for (const c of COURSES) {
    assert.ok(valid.includes(c.fees_confidence), `${c.id} has fees_confidence ${JSON.stringify(c.fees_confidence)}`);
    assert.ok(valid.includes(c.outcomes_confidence), `${c.id} has outcomes_confidence ${JSON.stringify(c.outcomes_confidence)}`);
  }
});

test('a course claiming verified fees cites a source', () => {
  for (const c of COURSES.filter((x) => x.fees_confidence === 'verified')) {
    assert.ok(
      typeof c.verification_note === 'string' && c.verification_note.length > 40,
      `${c.id} claims verified fees with no substantive verification_note`
    );
  }
});

test('a course claiming verified outcomes cites a source', () => {
  // Currently none do, and that is correct: Kenya publishes no per-course
  // graduate outcome series. This test is the gate for the day one appears —
  // it must arrive with a citation, not just a flipped flag.
  for (const c of COURSES.filter((x) => x.outcomes_confidence === 'verified')) {
    assert.ok(
      typeof c.outcomes_note === 'string' && c.outcomes_note.length > 40,
      `${c.id} claims verified outcomes with no outcomes_note naming the tracer study`
    );
  }
});

test('a funding record claiming verification cites a source', () => {
  for (const f of FUNDING_SOURCES.filter((x) => x.data_confidence === 'verified')) {
    assert.ok(
      typeof f.verification_note === 'string' && f.verification_note.length > 40,
      `${f.id} claims verified with no substantive verification_note`
    );
  }
});

/* ---------- the sector layer cannot be shown without its caveat ---------- */

test('every sector earnings figure carries an entry-reality caveat', () => {
  // A sector average includes consultants and principals. Rendering it to a
  // school-leaver as "what this pays" would repeat the exact failure this
  // layer was built to correct, so the caveat travels with the number.
  for (const s of SECTOR_EARNINGS) {
    assert.ok(s.entryReality && s.entryReality.length > 40, `${s.id} has no entryReality caveat`);
    assert.ok(Number.isFinite(s.annualKes) && s.annualKes > 0, `${s.id} has a non-numeric annualKes`);
    assert.ok(Array.isArray(s.clusters) && s.clusters.length > 0, `${s.id} maps to no cluster`);
  }
});

test('sector earnings map only to clusters that exist', () => {
  const clusters = new Set(COURSES.map((c) => c.cluster));
  for (const s of SECTOR_EARNINGS) {
    for (const c of s.clusters) assert.ok(clusters.has(c), `${s.id} maps to unknown cluster ${c}`);
  }
  for (const d of KENYA_DEMAND_SIGNALS) {
    for (const c of d.clusters) assert.ok(clusters.has(c), `demand signal maps to unknown cluster ${c}`);
  }
});

test('every youth employment measure states what it actually counts', () => {
  // The reported range runs from ~12% to ~67% purely on definition. Showing a
  // number without its definition is how that range gets weaponised.
  assert.ok(YOUTH_EMPLOYMENT_MEASURES.length >= 3, 'show the range, not one figure');
  for (const m of YOUTH_EMPLOYMENT_MEASURES) {
    assert.ok(m.means && m.means.length > 30, `${m.label} does not say what it counts`);
    assert.ok(m.source, `${m.label} has no source`);
  }
});

test('every cluster a user can match into has labour-market evidence', () => {
  // The card is personalised to the matched cluster, so a cluster with no
  // sector and no demand signal renders an empty section — worst for `carer`,
  // which covers education and health, the two largest formal employers in
  // Kenya. A user must never reach their results and find nothing there.
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const cluster of clusters) {
    const hasSector = SECTOR_EARNINGS.some((s) => s.clusters.includes(cluster));
    const hasSignal = KENYA_DEMAND_SIGNALS.some((s) => s.clusters.includes(cluster));
    assert.ok(hasSector || hasSignal, `cluster "${cluster}" has no sector earnings and no demand signal`);
  }
});

test('automation exposure covers every cluster and keeps both sides of the estimate', () => {
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const cluster of clusters) {
    assert.ok(
      AUTOMATION_EXPOSURE.bottlenecks.some((b) => b.clusters.includes(cluster)),
      `cluster "${cluster}" has no automation guidance — it would render a heading with nothing under it`
    );
  }
  // The two headline estimates point in opposite directions. Dropping either
  // one turns a contested question into a false verdict, which is the exact
  // cherry-picking this codebase has already been corrected for once.
  assert.ok(AUTOMATION_EXPOSURE.contested.length >= 2, 'both sides of the automation estimate must be shown');
  for (const c of AUTOMATION_EXPOSURE.contested) {
    assert.ok(c.basis && c.basis.length > 30, `"${c.view}" does not say what it measures`);
  }
});

test('every module names the method it is built on', () => {
  assert.ok(METHOD_LINEAGE.length >= 3);
  for (const m of METHOD_LINEAGE) {
    assert.ok(m.source && m.source.length > 10, `${m.module} cites no source`);
    assert.ok(m.note && m.note.length > 30, `${m.module} does not explain why the method applies`);
  }
});

/* ---------- catalogue integrity ---------- */

test('every course points at an institution that exists', () => {
  const ids = new Set(INSTITUTIONS.map((i) => i.id));
  for (const c of COURSES) assert.ok(ids.has(c.institution_id), `${c.id} references unknown institution ${c.institution_id}`);
});

test('no institution lists the same programme twice', () => {
  // Added after a bulk import duplicated four OUK degrees: a probe using the
  // wrong key (institutionId, not institution_id) reported the institution as
  // empty, so records that already existed were appended a second time. A
  // duplicate is worse than a gap here — it doubles a programme's weight in
  // the results list and makes the catalogue look padded.
  const seen = new Map();
  for (const c of COURSES) {
    const key = `${c.institution_id}::${c.name.toLowerCase().trim()}`;
    assert.ok(!seen.has(key), `${c.id} duplicates ${seen.get(key)} — same programme at the same institution`);
    seen.set(key, c.id);
  }
});

test('course ids are unique', () => {
  const seen = new Set();
  for (const c of COURSES) {
    assert.ok(!seen.has(c.id), `duplicate course id ${c.id}`);
    seen.add(c.id);
  }
});
