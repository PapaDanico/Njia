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
