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
const EDUCATION_PIPELINE = grab('EDUCATION_PIPELINE');
const FUTURE_OF_WORK = grab('FUTURE_OF_WORK');
const AFRICA_OUTLOOK = grab('AFRICA_OUTLOOK');
const INFORMAL_ECONOMY = grab('INFORMAL_ECONOMY');
const SKILLED_TRADES = grab('SKILLED_TRADES');
const ABSORPTION_GAP = grab('ABSORPTION_GAP');
const DIGITAL_WORK = grab('DIGITAL_WORK');
const MINIMUM_WAGE = grab('MINIMUM_WAGE');
const ENTRY_PAY = grab('ENTRY_PAY');
const LOAN_REALITY = grab('LOAN_REALITY');

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

test('a nationally-priced programme costs the same at every campus', () => {
  // KMTC publishes one fee structure for all 98 campuses, so the same
  // programme at the same duration must not differ by location. Nairobi
  // carried a pre-source estimate of Ksh 280,000 for the KRCHN diploma while
  // every other campus showed the published Ksh 238,200 — the kind of drift
  // that makes a user think relocating is cheaper when it is not.
  const kmtc = COURSES.filter((c) => c.institution_id.startsWith('kmtc'));
  const byProgramme = new Map();
  for (const c of kmtc) {
    const key = `${c.name.toLowerCase().trim()}::${c.duration_months}`;
    if (!byProgramme.has(key)) byProgramme.set(key, new Set());
    byProgramme.get(key).add(c.total_fees_kes);
  }
  for (const [key, fees] of byProgramme) {
    assert.equal(fees.size, 1, `${key} has ${fees.size} different fees across KMTC campuses: ${[...fees].join(', ')}`);
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

/* ---------- the evidence base is internally consistent ---------- */

test('the education pipeline adds up and keeps its capacity finding', () => {
  const e = EDUCATION_PIPELINE;
  assert.ok(e.qualifiedForDegree < e.kcseCandidates, 'more qualified than sat is impossible');
  assert.ok(e.degreePlacements <= e.totalPlaced, 'degree placements cannot exceed total placements');
  assert.ok(e.scoredDorBelow < e.kcseCandidates);
  // The finding the whole platform rests on: places are not the scarce thing.
  assert.ok(e.middleLevelCapacity > e.totalPlaced * 3,
    'the capacity-vs-placement gap is the platform premise — if this ever inverts, the premise needs rewriting, not the number massaging');
  const pct = (e.qualifiedForDegree / e.kcseCandidates) * 100;
  assert.ok(Math.abs(pct - e.qualifiedForDegreePct) < 0.1, `stated ${e.qualifiedForDegreePct}% vs computed ${pct.toFixed(2)}%`);
  assert.ok(e.readings.length >= 4);
  for (const r of e.readings) assert.ok(r.detail && r.detail.length > 60, `"${r.finding}" is not explained`);
});

test('both job-growth rankings are kept, never just the tech one', () => {
  // WEF ranks growth two ways. By percentage it is AI and fintech; by actual
  // jobs added it is nursing, teaching and frontline work. Dropping the second
  // list would quietly tell a future nurse their pathway is second-rate.
  assert.ok(FUTURE_OF_WORK.growthByPercentage.length >= 5);
  assert.ok(FUTURE_OF_WORK.growthByAbsoluteNumbers.length >= 4);
  assert.ok(/nursing/i.test(FUTURE_OF_WORK.growthByAbsoluteNumbers.join(' ')),
    'nursing is in the absolute-growth list and the catalogue is full of it');
  assert.ok(/teacher/i.test(FUTURE_OF_WORK.growthByAbsoluteNumbers.join(' ')));
  assert.ok(FUTURE_OF_WORK.absoluteVsPercentage.length > 60, 'the distinction must be explained, not just listed');
});

test('declining roles are shown, including the ones Njia teaches', () => {
  // Graphic design moved from moderately growing to fastest declining. Njia
  // lists design courses, so hiding this would be self-serving.
  const d = FUTURE_OF_WORK.decliningRoles.join(' ');
  assert.ok(/graphic designer/i.test(d), 'graphic design decline must not be dropped');
  assert.ok(/clerical|data entry|cashier/i.test(d));
  assert.ok(FUTURE_OF_WORK.decliningNote.length > 60);
});

test('regional optimism ships with its caveat', () => {
  // "Africa is the most optimistic region" is about employers' view of the
  // talent pool, not any one person's hiring odds.
  assert.ok(AFRICA_OUTLOOK.caveat && AFRICA_OUTLOOK.caveat.length > 40);
  assert.ok(AFRICA_OUTLOOK.source.includes('World Economic Forum'));
});

test('the informal economy context ships alongside the formal salary figures', () => {
  // Every SECTOR_EARNINGS figure is formal wage employment — the destination of
  // roughly one working Kenyan in six. Showing that ladder as the normal
  // outcome, without saying how narrow it is, misdescribes where a school-leaver
  // is statistically most likely to end up.
  const i = INFORMAL_ECONOMY;
  assert.ok(i.informalSharePct > 50, 'if this ever drops below half, the framing needs rewriting');
  assert.ok(Math.abs((i.informalSharePct + i.formalSharePct) - 100) < 0.5, 'shares must sum to 100');
  assert.ok(i.informalWorkers > i.formalWorkers * 3);
  assert.ok(i.source && i.source.length > 20);
  // The reading must not frame informal work as failure — it is the economy for
  // five in six workers, and Njia's enterprise funding exists because of it.
  assert.ok(i.reading.length > 80, 'the reading must give an actual planning instruction');
  assert.ok(!/fallback|last resort|failure/i.test(i.reading), 'informal work must not be framed as a fallback');
});

test('artisan day rates never render as though they were salaries', () => {
  // Ksh 2,500-3,000 is a day rate for *certified* work, in a trade where the
  // work is often irregular and there is no pension or paid leave. Showing it
  // as monthly income would be exactly the false precision this file exists to
  // remove — this time in the flattering direction.
  const t = SKILLED_TRADES;
  assert.ok(t.caution && t.caution.length > 80, 'the day-rate caution must be substantive');
  assert.match(t.caution, /day rate/i, 'the caution must name it as a day rate');
  assert.match(t.caution, /irregular|seasonal/i, 'the caution must name the irregularity');
  assert.match(t.caution, /certif/i, 'the rate applies to certified artisans — that condition must be stated');
  assert.ok(t.dayRateKes[0] < t.dayRateKes[1], 'the rate is a range, not a point estimate');
  assert.ok(t.dayRate2012Kes[1] < t.dayRateKes[0], 'the 2012 comparison should show real growth');
  for (const c of t.clusters) {
    assert.ok([...new Set(COURSES.map((x) => x.cluster))].includes(c), `trades map to unknown cluster ${c}`);
  }
});

test('a shortage is never shown without the absorption reality beside it', () => {
  // Health needs 76,920 more workers while thousands of trained nurses wait on
  // budget-constrained hiring. Teaching is short 96,345 while intern posts go
  // rejected. Quoting only the shortage would tell a seventeen-year-old that a
  // nursing diploma leads straight to a job — the same true-but-incomplete
  // failure as quoting the widest BPO figure.
  assert.ok(ABSORPTION_GAP.sectors.length >= 2);
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const a of ABSORPTION_GAP.sectors) {
    assert.ok(a.shortage && a.shortage.length > 80, `${a.sector} shortage is not substantiated`);
    assert.ok(a.reality && a.reality.length > 60, `${a.sector} states a shortage with no absorption reality`);
    assert.ok(a.planning && a.planning.length > 60, `${a.sector} gives no planning instruction`);
    for (const c of a.clusters) assert.ok(clusters.includes(c), `${a.sector} maps to unknown cluster ${c}`);
  }
  // Carer is the cluster carrying 60+ KMTC nursing records; it must be covered.
  assert.ok(ABSORPTION_GAP.sectors.some((a) => a.clusters.includes('carer')),
    'the carer cluster carries the nursing expansion and must show the absorption gap');
});

test('online work is shown with its earnings reality and its AI exposure', () => {
  // "Learn digital skills and earn online" is marketed hard to Kenyan youth.
  // Participation is genuinely large, but roughly seven in ten trained
  // participants earn nothing from it, and the entry-level work most commonly
  // trained for — transcription, data entry — is what WEF puts among the
  // fastest declining roles under generative AI. Both must ship with it.
  const d = DIGITAL_WORK;
  assert.ok(d.shareEarningIncomePct.after < 50,
    'if most participants now earn, the "oversold" framing needs revisiting rather than keeping');
  assert.ok(d.averageMonthlyEarningsKes.after > 0);
  assert.ok(d.honestReading.length > 80, 'the earnings reality must be stated, not implied');
  assert.match(d.aiCaution, /declin/i, 'the AI caution must name the decline');
  assert.match(d.aiCaution, /transcription|data entry/i, 'it must name the specific roles being trained for');
  // The roles named here must actually appear in the WEF declining list, or the
  // two datasets have drifted apart and the connection is no longer supported.
  const declining = FUTURE_OF_WORK.decliningRoles.join(' ').toLowerCase();
  assert.ok(/data entry/.test(declining), 'the AI caution leans on the declining-roles list; keep them consistent');
});

test('every cluster gets a real starting figure, not just a sector average', () => {
  // The sector averages include consultants and principals and could never
  // answer "what will I actually start on" — the question a school-leaver is
  // really asking. ENTRY_PAY exists to answer it, so no cluster may be left
  // without one.
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const cluster of clusters) {
    assert.ok(ENTRY_PAY.some((e) => e.clusters.includes(cluster)),
      `cluster "${cluster}" has no entry-pay figure and would fall back to averages alone`);
  }
  for (const e of ENTRY_PAY) {
    assert.ok(e.monthlyKes[0] > 0 && e.monthlyKes[1] >= e.monthlyKes[0], `${e.role} has an incoherent range`);
    assert.ok(e.note && e.note.length > 30, `${e.role} states a figure with no context`);
  }
});

test('the minimum wage is present as the yardstick', () => {
  // Without it, "Ksh 7,766 a month" from online work reads as a number rather
  // than as less than half the urban legal floor.
  assert.ok(MINIMUM_WAGE.urbanMonthlyKes > MINIMUM_WAGE.generalMonthlyKes);
  assert.ok(MINIMUM_WAGE.source.includes('2026'), 'the wage order must be dated');
  const online = ENTRY_PAY.find((e) => /online|freelance/i.test(e.role));
  assert.ok(online.monthlyKes[1] < MINIMUM_WAGE.urbanMonthlyKes,
    'if online work ever clears the urban minimum wage, the "oversold" framing needs revisiting');
});

test('the loan trap is stated with the action that defuses it', () => {
  // Grace is 12 months, the penalty is Ksh 5,000/month, and the average
  // graduate takes five years to find work. Stating the trap without the
  // Ksh 1,500 minimum payment that prevents it would be alarming and useless.
  const l = LOAN_REALITY;
  assert.ok(l.penaltyPerMonthKes > l.minimumMonthlyIfUnemployedKes,
    'the trap only exists because the penalty exceeds the minimum payment');
  assert.ok(l.averageYearsToFirstJob * 12 > l.gracePeriodMonths,
    'the trap depends on job search outlasting grace');
  assert.ok(l.theAction && l.theAction.length > 60, 'never state the trap without the action');
  assert.match(l.theAction, /minimum/i, 'the action must name the minimum payment');
});
