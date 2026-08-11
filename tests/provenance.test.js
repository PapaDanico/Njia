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
const DISTINCT_PROGRAMMES = grab('DISTINCT_PROGRAMMES');
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
const CBE_PATHWAYS = grab('CBE_PATHWAYS');
const PLACEMENT_CALENDAR = grab('PLACEMENT_CALENDAR');
const COMPETITION_REALITY = grab('COMPETITION_REALITY');
const PRIOR_LEARNING = grab('PRIOR_LEARNING');
const ATTACHMENT = grab('ATTACHMENT');
const LABOUR_MOBILITY = grab('LABOUR_MOBILITY');
const ENTERPRISE_CAPITAL = grab('ENTERPRISE_CAPITAL');

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

test('placement windows are real dates that open before they close', () => {
  // The clock computes what is open from these dates. A hardcoded "applications
  // close in May" quietly becomes a lie in June; dates cannot.
  assert.ok(PLACEMENT_CALENDAR.length >= 5);
  for (const w of PLACEMENT_CALENDAR) {
    const opens = new Date(w.opens), closes = new Date(w.closes);
    assert.ok(!Number.isNaN(opens.getTime()), `${w.name} has an unparseable open date`);
    assert.ok(!Number.isNaN(closes.getTime()), `${w.name} has an unparseable close date`);
    assert.ok(opens < closes, `${w.name} closes before it opens`);
    assert.ok(w.note && w.note.length > 20, `${w.name} has no explanation`);
  }
  // TVET is the door that stays open longest, and that is the point of it —
  // if it ever stops being the latest-closing window, the copy saying so needs
  // rewriting.
  const latest = [...PLACEMENT_CALENDAR].sort((a, b) => new Date(b.closes) - new Date(a.closes))[0];
  assert.match(latest.name, /TVET/i, 'TVET should be the longest-open route');
});

test('CBE pathways map onto clusters the app actually has', () => {
  // The decision Njia supports moved to Grade 10 under CBE. The pathway-to-
  // cluster mapping is how the platform will eventually meet learners there,
  // so it must stay valid against the real cluster list.
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  assert.equal(CBE_PATHWAYS.pathways.length, 3, 'CBE defines three senior-school pathways');
  const mapped = new Set();
  for (const pth of CBE_PATHWAYS.pathways) {
    assert.ok(pth.clusters.length > 0, `${pth.name} maps to no cluster`);
    for (const c of pth.clusters) {
      assert.ok(clusters.includes(c), `${pth.name} maps to unknown cluster ${c}`);
      mapped.add(c);
    }
  }
  // Every cluster must be reachable from some pathway, or a learner on that
  // pathway would find part of the catalogue unexplained.
  for (const c of clusters) assert.ok(mapped.has(c), `cluster "${c}" is reachable from no CBE pathway`);
});

test('the oversubscribed list ships with where the room actually is', () => {
  // Naming the courses that fill first is only useful next to the alternative.
  // Telling a student medicine is full, and stopping, is discouragement; telling
  // them 1.1 million places sat open in polytechnics is navigation.
  const c = COMPETITION_REALITY;
  assert.ok(c.fillFirst.length >= 4);
  assert.ok(c.whereTheRoomIs && /1.1 million|polytechnic/i.test(c.whereTheRoomIs),
    'the alternative must be named, not just the closed door');
  assert.ok(c.action && c.action.length > 60, 'there must be an instruction, not only a diagnosis');
  // The cap is a quality safeguard, not an obstacle — saying so keeps the tone
  // honest rather than resentful.
  assert.match(c.whyCapped, /regulator|ratio|quality/i);
  // Degree nursing is listed as oversubscribed while the catalogue is full of
  // KMTC diploma nursing. If that distinction is ever dropped the catalogue
  // starts reading as a promise it cannot keep.
  assert.match(c.theSameFieldTwice, /diploma/i);
});

test('Recognition of Prior Learning ships with its honest limit', () => {
  // RPL is the route for someone who already has the skill — the majority
  // case in an economy where 83.8% of work is informal. But it is a young
  // programme with uneven coverage, and sending someone to chase a service
  // that may not exist in their county without warning them is worse than
  // not mentioning it.
  const r = PRIOR_LEARNING;
  assert.ok(r.honestLimit && r.honestLimit.length > 60, 'the maturity caveat must be substantive');
  assert.match(r.honestLimit, /uneven|young|not yet/i);
  assert.ok(r.whyItMatters.length > 60, 'the payoff must be concrete, not vague encouragement');
  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const c of r.clusters) assert.ok(clusters.includes(c), `RPL maps to unknown cluster ${c}`);
});

test('the Germany route always ships with the correction to the number', () => {
  // The single highest-risk record in the dataset. Kenyan headlines reported
  // the September 2024 Migration and Mobility Partnership as "Germany opens
  // 250,000 jobs to Kenyans". Germany's Interior Ministry denied that any
  // quota is in the agreement. A young person planning around 250,000
  // guaranteed openings is planning around something that does not exist,
  // so the correction is not optional context — it is the headline, and it
  // must name the number it is correcting.
  const m = LABOUR_MOBILITY;
  assert.ok(m.theNumberYouHeard, 'the correction must exist');
  assert.match(m.theNumberYouHeard, /250,000/, 'the correction must name the figure it corrects');
  assert.match(m.theNumberYouHeard, /not in the agreement|no quota/i);

  // The gate is language and recognition, not the treaty. If this record
  // ever renders as "Germany is hiring" without that, it misleads.
  // The gate is stated twice by design: a short form that stays visible in
  // the collapsed card, and the mechanics behind progressive disclosure.
  // Both must survive, or the block reads as "Germany is hiring".
  assert.match(m.theRealGate, /German/, 'the language requirement must be visible');
  assert.match(m.theRealGate, /recognition/i, 'qualification recognition must be visible');
  assert.match(m.theGateDetail, /B1|B2/, 'the language level belongs in the detail');
  assert.match(m.theGateDetail, /Anerkennung/i, 'the recognition procedure must be named');
  assert.match(m.honestReading, /narrow|not a substitute|not a plan for next year/i);

  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const c of m.clusters) assert.ok(clusters.includes(c), `mobility maps to unknown cluster ${c}`);
});

test('attachment is presented as mandatory and contested, not as a formality', () => {
  // SKILLS_MISMATCH already named "an attachment" as a thing that closes the
  // employability gap. Naming it without saying it is compulsory, competitive
  // and centrally administered is what left students discovering it late.
  const a = ATTACHMENT;
  assert.match(a.isMandatory, /mandatory/i);
  assert.ok(a.theCompetition.length > 60, 'the competition must be described, not implied');
  assert.match(a.whereToApply, /NITA|ITAP/, 'the actual portal must be named');
  assert.match(a.theAdvice, /first year/i, 'the timing advice is the actionable part');
  assert.ok(a.honestLimit.length > 60, 'the supply shortfall must travel with the scheme');

  // 55,000 is NITA's throughput, not a guarantee of a place on demand.
  assert.equal(typeof a.placedPerYear, 'number');
  assert.ok(a.placedPerYear > 0 && a.placedPerYear < 1000000, 'placement scale must be plausible');
  assert.ok(!/guarantee[ds]? you|assured/i.test(a.scale), 'throughput must not read as a guarantee');

  const clusters = [...new Set(COURSES.map((c) => c.cluster))];
  for (const c of a.clusters) assert.ok(clusters.includes(c), `attachment maps to unknown cluster ${c}`);
});

test('enterprise capital corrects the Hustler Fund before recommending anything', () => {
  // INFORMAL_ECONOMY says most new work is self-created. This record is the
  // answer to that, and its first job is a correction: the Hustler Fund is
  // what everyone names, and at ~Ksh 300 on a 14-day clock it is a
  // consumption instrument. Recommending capital without saying so would
  // point the most likely reader at the least suitable product.
  const c = ENTERPRISE_CAPITAL;
  assert.match(c.theMisconception, /not business capital/i);
  assert.equal(c.hustlerFund.averageLoanKes, 300);
  assert.equal(c.hustlerFund.tenureDays, 14);

  // Both default denominators must ship together. Quoting either alone is
  // the thing that makes the published range look like an error.
  assert.match(c.hustlerFund.defaultDispute, /15/, 'the value-based rate must be stated');
  assert.match(c.hustlerFund.defaultDispute, /64/, 'the borrower-based rate must be stated');
  assert.match(c.hustlerFund.defaultDispute, /value/i);
  assert.match(c.hustlerFund.defaultDispute, /borrow/i);

  // The Hustler Fund is criticised, not dismissed — it has genuinely the
  // cheapest rate in the country and a forced-savings component.
  assert.equal(c.hustlerFund.annualInterestPct, 8);
  assert.equal(c.hustlerFund.savingsWithheldPct, 5);

  // The real instrument, and the gate that is worth months of lead time.
  const r = c.realCapital;
  assert.ok(r.startupLoanKes < r.expansionFromKes, 'startup must be the smaller product');
  assert.ok(r.expansionFromKes < r.expansionCeilingKes, 'expansion must have headroom');
  assert.deepEqual([...r.ageRange], [18, 34]);
  assert.match(r.theGate, /five members|5 members/i);
  assert.match(r.theGate, /registration certificate/i);
  assert.match(r.interest, /interest-free/i);
  assert.match(r.interest, /5%/, 'the management fee must travel with "interest-free"');
  assert.match(c.theAdvice, /not a credit score/i);

  // The funds are mid-merger. Shipping amounts without that caveat would
  // send someone to an office where the forms have changed.
  assert.match(c.honestLimit, /Biashara/i);
  assert.match(c.honestLimit, /confirm|unfinished|change/i);
});

test('every course is distinguishable by name plus institution', () => {
  // Course names are NOT unique: KMTC teaches identical programmes at every
  // campus, so "Diploma in KRCHN" is 44 separate records. The Odyssey anchor
  // picker used to label options by name alone, which rendered 44 identical
  // lines and made the choice blind. Name + institution is the pairing that
  // disambiguates, so it has to stay unique.
  const byId = new Map(INSTITUTIONS.map((i) => [i.id, i]));
  const labels = new Map();
  for (const c of COURSES) {
    const home = byId.get(c.institution_id);
    const label = home ? `${c.name} — ${home.name}` : c.name;
    labels.set(label, (labels.get(label) || 0) + 1);
  }
  const collisions = [...labels.entries()].filter(([, n]) => n > 1);
  assert.deepEqual(collisions, [], `ambiguous picker labels: ${collisions.map(([l, n]) => `${n}x ${l}`).join('; ')}`);

  // And confirm the premise the fix rests on — bare names really do collide,
  // so this test is guarding something real rather than a hypothetical.
  const names = new Map();
  for (const c of COURSES) names.set(c.name, (names.get(c.name) || 0) + 1);
  assert.ok(Math.max(...names.values()) > 1, 'bare course names are expected to collide');
});

test('no course carries a measured outcome, so nothing may rank on one', () => {
  // The premise both guards below depend on. If Kenya ever publishes
  // per-course graduate outcomes and records start arriving as 'verified',
  // this fails loudly — which is the point. The restriction is a response to
  // the data being illustrative, not a permanent design opinion.
  const levels = new Set(COURSES.map((c) => c.outcomes_confidence));
  assert.deepEqual([...levels], ['illustrative'],
    'outcomes are no longer uniformly illustrative — revisit the sort and comparison restrictions');
});

test('the Decide sort offers no ordering built on illustrative outcomes', () => {
  // Sorting is a stronger claim than display: it tells the user "this one
  // first". Labelling the option "(est.)" qualified the number while the
  // ordering still asserted a ranking the data cannot support.
  const src = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const sortOptionsLines = src.split('\n').filter((l) => l.includes('const sortOptions'));
  assert.ok(sortOptionsLines.length > 0, 'sortOptions must exist to be checked');
  for (const line of sortOptionsLines) {
    assert.ok(!/employment|salary|outcome/i.test(line),
      `sort menu offers an outcome-based ordering: ${line.trim()}`);
  }
  // And no comparator keyed on the outcome fields anywhere in the module.
  assert.ok(!/^\s*employment:\s*\(a, b\)/m.test(src), 'an employment comparator is still defined');
  assert.ok(!/median_salary_kes\s*\?\?\s*0\)\s*-/.test(src), 'a salary comparator is still defined');
});

test('the comparison table shows outcome estimates but crowns no winner', () => {
  // A shaded "best value" cell is the app declaring a winner. Displaying an
  // estimate is honest; ranking one estimate above another is not, so the
  // outcome rows must carry no `better`/`raw` pair while the rows built on
  // verified fee and duration data still do.
  const src = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  for (const label of ['Employment Rate (est.)', 'Median Salary (est.)']) {
    const row = src.split('\n').find((l) => l.includes(`label: '${label}'`));
    assert.ok(row, `comparison row ${label} not found`);
    assert.ok(!/better:/.test(row), `${label} still marks a best value`);
    assert.ok(!/raw:/.test(row), `${label} still exposes a raw value for ranking`);
  }
  const tuition = src.split('\n').find((l) => l.includes("label: 'Tuition'"));
  assert.match(tuition, /better: 'min'/, 'verified fee data should still mark a best value');
});

test('breadth and reach are counted as separate claims', () => {
  // 167 records across 73 programme names: counting records as "courses"
  // overstates breadth more than twofold, because KMTC teaches one national
  // programme set at 44 campuses. Both numbers are true and answer different
  // questions, so no surface may quote one while implying the other.
  assert.equal(DISTINCT_PROGRAMMES, new Set(COURSES.map((c) => c.name)).size);
  assert.ok(DISTINCT_PROGRAMMES < COURSES.length,
    'if these ever match, the duplicate-campus shape has changed — recheck the copy');

  for (const file of ['app.js', 'decide.js']) {
    const src = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    for (const line of src.split('\n')) {
      if (!line.includes('COURSES.length')) continue;
      if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) continue;
      assert.ok(!/\bcourses\b/.test(line),
        `${file} labels a record count as "courses": ${line.trim()}`);
    }
  }
});

test('the CBE pathway record names the gate that closes at fourteen', () => {
  // Njia already teaches two gates: a mean grade decides whether you may
  // apply, cluster points decide placement. Under CBE a third sits ahead of
  // both — the three pathway subjects taken at Grade 10 ARE the subjects a
  // degree later requires. It is the only one of the three that cannot be
  // recovered from, so the record must say so in those terms.
  const p = CBE_PATHWAYS;
  assert.ok(p.theConstraint, 'the subject constraint must be stated');
  assert.match(p.theConstraint, /subject/i);
  assert.match(p.theConstraint, /grade/i, 'it must contrast against grades, which are recoverable');
  assert.match(p.theConstraint, /cannot|never/i, 'the irreversibility is the whole point');

  // The actionable half: where it is chosen, and that changing it has a window.
  assert.match(p.wherePathwaysAreChosen, /selection\.education\.go\.ke/);
  assert.match(p.changingIt, /Head of Junior School/i);
  assert.match(p.changingIt, /two weeks/i, 'the deadline is the actionable detail');
});

test('Njia records what it does not know about pathways, and refuses to gate on it', () => {
  // Two disciplines, both of which have to survive future editing.
  const p = CBE_PATHWAYS;

  // 1. The post-enrolment switching rules were searched for and not found.
  //    Silence would read as "cannot be changed"; a guess would be invention.
  assert.ok(p.whatIsNotPublished, 'the known gap must be recorded, not left silent');
  assert.match(p.whatIsNotPublished, /not found|less clearly published/i);

  // 2. Njia informs but does not filter the catalogue by pathway. Encoding an
  //    unsourced pathway-to-programme map into the matcher would repeat the
  //    exact fault this test file exists to prevent — invented data deciding
  //    what a person sees. Guard that the decision stays deliberate.
  // The reason has to stay precise. An earlier draft said the mapping "is
  // not published", which was wrong — both halves are. What is missing is the
  // bridge between CBE subject combinations and KUCCPS cluster requirements
  // still written in KCSE subjects. A vaguer reason invites someone to
  // "fix" it by building the filter on a guess.
  assert.match(p.whyNjiaDoesNotFilter, /does not filter/i);
  assert.match(p.whyNjiaDoesNotFilter, /bridge/i, 'the missing piece must be named as the bridge, not the whole map');
  assert.match(p.whyNjiaDoesNotFilter, /KUCCPS/, 'the placement-side source must be credited as published');
  assert.ok(!/not published in a form worth trusting/i.test(p.whyNjiaDoesNotFilter),
    'the old overstated reason must not come back');

  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  assert.ok(!/CBE_PATHWAYS|\bpathway\b/i.test(decide),
    'Decide must not filter or score on CBE pathway until the subject mapping is sourced');
});

test('pathways carry their tracks, and the design target is labelled as a target', () => {
  // You do not pick a pathway. You pick a coded three-subject combination
  // inside a track inside a pathway, and only from what your school offers —
  // so the tracks have to be present or the record describes the wrong unit.
  const p = CBE_PATHWAYS;
  for (const pathway of p.pathways) {
    assert.ok(Array.isArray(pathway.tracks) && pathway.tracks.length > 0,
      `pathway ${pathway.name} has no tracks`);
    for (const track of pathway.tracks) {
      assert.ok(track.name, `a track under ${pathway.name} has no name`);
      assert.ok(Array.isArray(track.subjects) && track.subjects.length > 0,
        `track ${track.name} lists no subjects — a track without its subjects is not usable`);
    }
  }
  assert.match(p.choiceUnit, /combination/i);
  assert.match(p.choiceUnit, /school/i, 'the school-level constraint is the part people miss');

  // Scale makes the school constraint concrete. 161 is sourced for STEM only;
  // the other two pathways' counts were not found, so no system-wide total may
  // be quoted — summing or extrapolating would be a guess dressed as
  // arithmetic, which is the failure mode this file exists to prevent.
  assert.equal(p.stemCombinationCount, 161);
  assert.match(p.scaleReading, /STEM/, 'the count must be attributed to STEM specifically');
  assert.match(p.scaleReading, /not sourced|does not quote a total/i,
    'the missing counts for the other pathways must be admitted');
  assert.ok(!/\btotal of \d|\ball three pathways carry \d/i.test(p.scaleReading),
    'no system-wide combination total may be asserted');

  // 60/25/15 is a curriculum-framework planning target, not an observed
  // placement outcome. Njia has spent this project removing figures that read
  // as measurements when they are not, so this one must say what it is.
  const spread = p.intendedSpread;
  assert.equal(spread.stemPct + spread.socialSciencesAndLanguagesPct + spread.artsAndSportsPct, 100,
    'the intended spread must account for the whole cohort');
  assert.match(p.intendedSpreadReading, /target|not a measured|planning/i,
    'the design target must not read as a measured outcome');
});

test('CBE provenance credits the publisher and admits the documents were not read', () => {
  // WebFetch is blocked for these hosts in this environment; search indexing
  // of the same publishers is not. That distinction matters: the figures are
  // attributed to the Ministry, KICD, KNEC and KUCCPS, but no PDF was read
  // line by line here, and the source string has to say so rather than imply
  // a direct reading.
  const src = CBE_PATHWAYS.source;
  assert.match(src, /selection\.education\.go\.ke/);
  assert.match(src, /KUCCPS/);
  assert.match(src, /could not be read directly|search indexing/i,
    'the retrieval limitation must travel with the source');
});

test('the maths fork ships with the exemption, which is the actionable half', () => {
  // The quietest irreversible choice in the system: which mathematics paper
  // you sit is decided by pathway and arrives looking like a timetable. The
  // rule alone is trivia. The exemption — that a non-STEM learner may be
  // permitted Core Mathematics on the strength of junior school results — is
  // the only part someone can act on, and it is the part nobody is told.
  const m = CBE_PATHWAYS.mathsFork;
  assert.match(m.theRule, /Core Mathematics/);
  assert.match(m.theRule, /Essential Mathematics/);
  assert.match(m.theBar, /Pure Sciences/);
  assert.match(m.theBar, /barred/i);

  assert.ok(m.theExemption, 'the exemption must exist — it is the whole point of the record');
  assert.match(m.theExemption, /outside STEM/i);
  assert.match(m.theExemption, /junior school/i, 'the condition on the exemption must be stated');
  assert.match(m.theAsk, /before your combination is registered/i,
    'the timing is what makes the exemption usable');

  // The degree list is specialist guidance, not a KUCCPS ruling. Njia has
  // spent this project separating "reported" from "regulated"; this record
  // must not quietly promote one to the other.
  assert.match(m.coreOpens, /almost certainly/i,
    'the degree list must be hedged — it is guidance, not published regulation');
  assert.match(m.confidence, /not a published KUCCPS requirement|informed guidance/i);
});

test('the exported report card carries the legend the screen carries', () => {
  // The PDF is the copy that leaves the app. It goes to a parent, a school or
  // a bursary office with no page around it to explain anything, and it used
  // to ship the screen's wording minus the two lines that made it true: a
  // "Four Elements" heading over three bars, percentages with nothing to read
  // them by, and a bare clock emoji standing in for "Income urgency".
  const src = fs.readFileSync(path.join(root, 'js', 'discover.js'), 'utf8');
  const start = src.indexOf('function renderShareableReportHTML');
  assert.ok(start > -1, 'the report card renderer must exist to be checked');
  const card = src.slice(start, src.indexOf('function openReportPreviewModal'));

  // Every assertion below runs against the EMITTED markup, not the raw
  // source: the comments explaining why the emoji and the bare heading were
  // removed naturally contain both, and a test that trips over its own
  // rationale — or worse, passes because of it — is not a test.
  const emitted = card
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');

  // A percentage on paper must say what kind of number it is.
  assert.match(emitted, /not a mark out of 100/i,
    'the clarity scores must say they are not a grade');
  assert.match(emitted, /Clarity Scores/,
    'the heading must name what the bars measure, as the screen does');

  // The heading promises four; three are bars and the fourth is the
  // constraints column, which has to say so.
  assert.match(emitted, /Necessity/,
    'the fourth Element must be named, or "Four Elements" shows three');

  // Constraint chips: real words, matching the on-screen labels. An emoji
  // carries no text for a screen reader and is first to fall back to tofu in
  // a print font.
  assert.match(emitted, /Income urgency:/, 'urgency must be labelled in words');
  assert.match(emitted, /Budget \(2yr\):/, 'budget must state its window, as the screen does');
  assert.ok(!/⏱/.test(emitted), 'the clock emoji must not come back as a label');

  // Applications are first-class in Track and belong in a progress summary
  // that already reports goals.
  assert.match(emitted, /applications complete/, 'applications must be reported, not only goals');
});

test('the catalogue reaches every county, and Samburu is not empty', () => {
  // KMTC's campuses carried this catalogue from 12 counties to 45, and the two
  // it does not serve — Kirinyaga and Samburu — sat open as "structurally
  // hard". That was true of the KMTC route, not of the counties: each has its
  // own registered public TVET college.
  //
  // Samburu is the one this guard exists for. It is among the counties where a
  // young person is least likely to be near any tertiary institution, and a
  // filter that silently returned nothing told them there was nothing.
  const COUNTIES = ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
    'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira',
    'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'];

  const covered = new Set(INSTITUTIONS.map((i) => i.county));
  const missing = COUNTIES.filter((c) => !covered.has(c));
  assert.deepEqual(missing, [], `counties with no institution: ${missing.join(', ')}`);

  // An institution with no courses is a pin on a map, not an option. Every
  // county must actually return something a person can apply to.
  const withCourses = new Set(
    INSTITUTIONS.filter((i) => COURSES.some((c) => c.institution_id === i.id)).map((i) => i.county)
  );
  const empty = COUNTIES.filter((c) => !withCourses.has(c));
  assert.deepEqual(empty, [], `counties whose institutions carry no courses: ${empty.join(', ')}`);
});

test('the HEF record says the model is under appeal, and that bands can be appealed', () => {
  // Two separate obligations, both previously missing.
  const hef = FUNDING_SOURCES.find((f) => f.id === 'f001');
  assert.ok(hef, 'the HELB/HEF record must exist');

  // 1. LEGAL STATUS. The High Court declared this model unconstitutional in
  //    Petition 412 of 2023 on 20 December 2024. It runs today only because
  //    the Court of Appeal stayed that judgment; the constitutional question
  //    is undecided. The Universities Fund says the model may change, and the
  //    Court directed that applicants be told so. Presenting the bands as
  //    settled is the one thing both the funder and the court said not to do.
  assert.ok(hef.legalStatus, 'the court position must travel with the record');
  assert.match(hef.legalStatus, /stay/i, 'the stay is why the model still operates');
  assert.match(hef.legalStatus, /unconstitutional/i);
  assert.match(hef.legalStatus, /412 of 2023/, 'the petition must be citable');
  assert.match(hef.legalStatus, /20 December 2024/, 'the judgment date must be exact');
  assert.match(hef.legalStatus, /pending|not decided|has not decided/i,
    'an unresolved appeal must not read as resolved');

  // 2. THE APPEAL ROUTE. The band decides affordability — roughly 70% covered
  //    at Band 1 against 30% at Band 5 — and it is set by an instrument
  //    reading declared circumstances, so it can be wrong. It is the only
  //    action available to someone the model has placed out of reach.
  assert.ok(hef.bandAppeal, 'the band appeal route must be stated');
  assert.match(hef.bandAppeal, /appeal/i);
  assert.match(hef.bandAppeal, /portal|window/i, 'where and when to appeal is the actionable part');

  // Both must reach the page. A caveat that lives only in a data file
  // protects nobody.
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  // Match the CONDITIONAL, not merely the identifier. Asserting that the
  // string "f.legalStatus" appears somewhere passes even when the branch has
  // been disabled to `${false ? ...}` — the identifier survives inside the
  // dead template. Checking the guard expression itself is what actually
  // fails when the field stops reaching the page.
  assert.match(decide, /\$\{f\.legalStatus \?/, 'legal status must be conditionally rendered');
  assert.match(decide, /\$\{f\.bandAppeal \?/, 'the appeal route must be conditionally rendered');
});

test('the cannot-afford-it answer orders the actions and admits what is unknown', () => {
  // The most acute moment this app can meet someone in: placed, and unable to
  // raise the household contribution. The answer is only useful if it is
  // ordered — appeal the band first because it is free and most overlooked,
  // stack bursaries second, talk to the institution third — and only honest
  // if it says plainly what is not published.
  const help = fs.readFileSync(path.join(root, 'js', 'help.js'), 'utf8');
  const q = help.split('\n').find((l) => l.includes('we cannot raise the money'));
  assert.ok(q, 'the answer must exist');

  // Ordering: the band appeal must come before the deferment conversation.
  const appealAt = q.indexOf('Appeal your band');
  const deferAt = q.indexOf('Deferment is arranged');
  assert.ok(appealAt > -1 && deferAt > -1, 'both steps must be present');
  assert.ok(appealAt < deferAt, 'the free, overlooked fix must be offered before deferment');

  // Deferment is an institution matter, not a KUCCPS one. Sending someone to
  // the wrong desk in a week that decides their year is a real cost.
  assert.match(q, /not with KUCCPS/i, 'deferment must be routed to the institution');
  assert.match(q, /before the reporting date/i, 'timing is the actionable part');

  // The unknown, stated as an unknown. Neither "your place is held" nor "you
  // will lose it" is publicly established, and guessing either way is worse
  // than saying so.
  assert.match(q, /will not guess/i, 'the gap must be named as a gap');
  assert.match(q, /not assume it is held/i);
  assert.match(q, /not assume it is lost/i);

  // It must not read as blame. Someone in this position already believes they
  // failed; the record is that the funding model produces this outcome.
  assert.match(q, /not a personal failure/i);
});

test('the update banner cannot stack, and the README describes the real strategy', () => {
  // Measured, not assumed: two CACHE_VERSION bumps with a tab left open fire
  // `updatefound` twice and, unguarded, append two identical banners. Unlike
  // showToast() this one has no duration and no dismiss control — "Reload" is
  // the only exit — so duplicates accumulate rather than fade. A burst of
  // deploys is exactly when they arrive; this project shipped six cache bumps
  // in a single session.
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  const start = app.indexOf('function showUpdateAvailableToast');
  assert.ok(start > -1, 'the update toast function must exist');
  const fn = app.slice(start, app.indexOf('\n}', start));

  assert.match(fn, /data-update-toast/, 'the banner must be identifiable to guard against');
  assert.match(fn, /querySelector\('\[data-update-toast\]'\)\)\s*return/,
    'a second banner must be refused before it is appended');

  // The README described the worker as "cache-first", which is backwards for
  // app code and is the misreading sw.js's own header exists to prevent: a
  // pure cache-first shell can never show a deployed update.
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const swLine = readme.split('\n').find((l) => l.includes('sw.js'));
  assert.ok(swLine, 'the README must document sw.js');
  assert.match(swLine, /network-first/i, 'app code is network-first');
  assert.ok(!/^.*Service Worker — cache-first offline strategy/.test(swLine),
    'the old backwards description must not return');
});
