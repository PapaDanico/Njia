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
for (const file of ['data/questions.js', 'data/institutions.js', 'data/courses.js', 'data/funding.js', 'data/labour-market.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const grab = (name) => vm.runInContext(name, context);
const CLUSTERS = grab('CLUSTERS');
const QUESTIONNAIRE = grab('QUESTIONNAIRE');
const COURSES = grab('COURSES');
const CATALOGUE_ROLES = grab('CATALOGUE_ROLES');
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
const TEACHER_LABOUR_MARKET = grab('TEACHER_LABOUR_MARKET');

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

test('the comparison table carries no fabricated outcome figures at all', () => {
  /* This guard used to allow the outcome rows so long as they crowned no
   * winner — displaying an estimate is honest, ranking one is not. That did
   * not go far enough. A comparison table is where a difference between two
   * numbers gets read as a finding, and every per-course employment rate and
   * median salary in this catalogue was invented, so the differences were the
   * fabrication. The rows are gone, and this now fails if they return. */
  const src = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  for (const label of ['Employment Rate', 'Median Salary']) {
    assert.ok(!src.includes(`label: '${label}`),
      `the comparison table has reintroduced a "${label}" row built on unmeasured data`);
  }
  const tuition = src.split('\n').find((l) => l.includes("label: 'Tuition'"));
  assert.match(tuition, /better: 'min'/, 'verified fee data should still mark a best value');
  // Tuition stays: it is verified per course and genuinely comparable.
  assert.ok(src.includes("label: 'Tuition'"), 'the table no longer compares cost');
});

test('no per-course outcome figure survives in the catalogue', () => {
  /* The fields are kept rather than deleted so that the guards written around
   * them keep their meaning, but nothing may put a number back in them: there
   * is no source that could justify one. Kenya publishes no per-course
   * graduate outcomes, which the app says on its own evidence page. */
  const withRate = COURSES.filter((c) => c.employment_rate != null);
  const withSalary = COURSES.filter((c) => c.median_salary_kes != null);
  assert.equal(withRate.length, 0,
    `${withRate.length} courses carry an employment_rate again (e.g. ${withRate[0]?.id}) — nothing can source one`);
  assert.equal(withSalary.length, 0,
    `${withSalary.length} courses carry a median_salary_kes again (e.g. ${withSalary[0]?.id})`);
});

test('the course card claims no pay figure of its own', () => {
  const src = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  assert.ok(!/meta-label">Employment Rate/.test(src),
    'the course card renders a per-course employment rate again');
  assert.ok(!/meta-label">Median Salary/.test(src),
    'the course card renders a per-course median salary again');
  /* Nor a synthesised one. Deriving a per-course pay figure from ENTRY_PAY was
   * tried twice and was wrong both times: the bands range from entry level to
   * five years in, and the cluster tags are coarse, so any collapse of them
   * into one number or range drops the caveat that made each band true. */
  // Comments are stripped first: the reasoning above is recorded in decide.js
  // in prose that names ENTRY_PAY, and a guard that trips on its own
  // explanation would only teach the next person to delete the explanation.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/ENTRY_PAY/.test(code),
    'decide.js is deriving a pay figure from ENTRY_PAY again — the bands do not collapse honestly');
});

test('the evidence layer shows each pay band with its own caveat', () => {
  /* The bands are only honest one at a time: "Entry level. Faster to get than
   * a public post" and "around five years in" are what stop 20,000 and 70,000
   * being read as one range. If the note is ever dropped for tidiness, the
   * numbers become the same lie a summary would have told. */
  const src = fs.readFileSync(path.join(root, 'js', 'discover.js'), 'utf8');
  const block = src.slice(src.indexOf('ENTRY_PAY'), src.indexOf('ENTRY_PAY') + 3000);
  assert.ok(/pay-role/.test(block), 'the evidence layer no longer names the role behind each band');
  assert.ok(/e\.note/.test(block), 'the evidence layer prints pay bands without their notes');
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

test('every manifest image exists and its declared size matches the file', () => {
  // A manifest that declares a size the file does not have fails silently:
  // the browser drops the asset and falls back to the minimal install chip,
  // with nothing in the console. These were generated by screenshotting the
  // running app, so a later re-capture at a different viewport is exactly how
  // the two drift apart.
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

  const pngSize = (rel) => {
    const buf = fs.readFileSync(path.join(root, rel));
    assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${rel} is not a PNG`);
    return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  };

  for (const img of [...manifest.icons, ...(manifest.screenshots || [])]) {
    assert.equal(pngSize(img.src), img.sizes, `${img.src} declares ${img.sizes}`);
  }

  // `id` pins app identity independently of start_url. Without it the browser
  // derives identity FROM start_url, so changing that later would register as
  // a different app and installed users would silently keep the old one.
  assert.ok(manifest.id, 'manifest must declare a stable id');

  // Android shows its richer install dialog only when screenshots are present,
  // and only uses narrow ones on a phone — which is nearly the whole audience.
  const shots = manifest.screenshots || [];
  assert.ok(shots.length > 0, 'screenshots drive the richer Android install UI');
  assert.ok(shots.some((s) => s.form_factor === 'narrow'), 'a phone screenshot is required');
  for (const s of shots) {
    assert.ok(s.label, `${s.src} needs a label — it is read out in the install dialog`);
  }

  // Deliberately NOT in the service worker precache: these are fetched by the
  // browser's install dialog, never by the app, and they are ~630KB. Caching
  // them would cost every offline user that much for no benefit.
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.ok(!/screenshots\//.test(sw), 'install-dialog screenshots must stay out of the offline cache');
});

/* ---------- the catalogue can deliver what the evidence layer promises ---------- */

/* Njia's sharpest evidence-layer claim is that certified trades pay: SKILLED_TRADES
 * reports a Ksh 2,500–3,000 artisan day rate against fewer than 2,000 trained
 * plumbers, painters and masons nationally, and concludes that "the certificate is
 * what earns the rate".
 *
 * For a long time the app made that argument and could not act on it. The
 * catalogue contained no masonry, no plumbing, no welding, no carpentry and no
 * motor-vehicle trade at any level, so a learner persuaded by the argument had
 * nowhere to apply. Telling someone a door pays well while showing them no door
 * is worse than staying quiet. */
test('every rising trade the evidence layer names has a course you can apply to', () => {
  // Trade name -> the word that identifies its programme in the catalogue.
  const programmeWord = {
    Carpenters: 'carpentry', Painters: 'painting', Welders: 'welding',
    Mechanics: 'mechanics', Plumbers: 'plumbing', Masons: 'masonry',
    Electricians: 'electrical'
  };
  const names = COURSES.map((c) => c.name.toLowerCase());
  const missing = SKILLED_TRADES.risingTrades.filter((trade) => {
    const word = programmeWord[trade];
    assert.ok(word, `no catalogue word mapped for rising trade ${trade} — update this test`);
    return !names.some((n) => n.includes(word));
  });
  assert.equal(missing.join(', '), '', 'evidence layer promotes these trades with no way in');
});

/* KUCCPS sets the minimum for an Artisan certificate at E and opens Level 4 to
 * KCSE mean grades C down to E. The grade selector has always offered E, so the
 * app invited a learner to declare it — and then returned five Open University
 * short certificates, none of them a trade and none residential. The floor was
 * real but undeclared. */
test('the lowest grade the app lets you select still reaches real courses', () => {
  const GRADES = ['E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A'];
  const rank = (g) => GRADES.indexOf(g);
  const reachable = COURSES.filter((c) => !c.min_grade || rank('E') >= rank(c.min_grade));

  assert.ok(reachable.length >= 10, `grade E reaches only ${reachable.length} courses`);
  // Not just "some records" — a trade, at a named institution, that ends in a
  // qualification. The five OUK short certificates alone satisfied a naive count.
  assert.ok(
    reachable.some((c) => c.level === 'artisan'),
    'grade E must reach the artisan tier, not only open-entry short certificates'
  );
});

/* The level filter was once a hardcoded ['certificate','diploma','degree'].
 * Adding artisan records would have left them reachable only under "All Levels":
 * present in the data, absent from the dropdown, invisible to the learners the
 * tier exists for. decide.js now derives the options from COURSES. */
test('every level in the catalogue is offered by the level filter', () => {
  const decide = fs.readFileSync(path.join(root, 'js/decide.js'), 'utf8');

  // Guard the derivation itself, not a symptom: a literal array of level names
  // is what the bug looked like, and what a future edit would most likely
  // reintroduce.
  assert.match(decide, /const CATALOGUE_LEVELS = \[\.\.\.new Set\(COURSES\.map/,
    'level options must be derived from COURSES, not hardcoded');
  assert.match(decide, /const levelOptions = \['all', \.\.\.CATALOGUE_LEVELS\]/,
    'the filter must consume the derived list');

  // Every level with a record needs a human-readable label, or the dropdown
  // renders a raw data value.
  const labels = decide.match(/const LEVEL_LABELS = \{([^}]*)\}/)[1];
  for (const level of new Set(COURSES.map((c) => c.level))) {
    assert.ok(labels.includes(`${level}:`), `level "${level}" has no LEVEL_LABELS entry`);
  }
});

/* ---------- an unpublished fee is a state, not a zero ---------- */

/* County vocational training centres are where a learner with no money and no
 * ability to relocate actually goes, and most of them publish no fee structure
 * — Maralal VTC directs enquiries to its admissions office. Recording that as
 * null is the honest option; recording it as 0, or copying a polytechnic's fee
 * across, would be inventing the number that matters most.
 *
 * Null then has to be handled everywhere, because JavaScript makes the wrong
 * answer the default one: `null <= budgetMax` is true, `Math.min(x, null)` is
 * 0, and `x - null` is NaN. */
test('a course with no published fee never claims to be affordable', () => {
  const unpriced = COURSES.filter((c) => c.total_fees_kes == null);
  assert.ok(unpriced.length > 0, 'fixture assumes at least one unpriced course exists');

  const decide = fs.readFileSync(path.join(root, 'js/decide.js'), 'utf8');

  // feasibilitySignal must branch on null BEFORE the <= comparison, or every
  // unpriced course reports "within budget" and earns the affordability bonus.
  const feas = decide.slice(decide.indexOf('function feasibilitySignal'));
  const nullGuard = feas.indexOf("course.total_fees_kes == null");
  const comparison = feas.indexOf("course.total_fees_kes <= budgetMax");
  assert.ok(nullGuard !== -1, 'feasibilitySignal must handle an unpublished fee');
  assert.ok(nullGuard < comparison,
    'the null check must precede the <= comparison — null <= n is true in JS');

  // Fee sorting must not subtract null (NaN makes sort order undefined).
  assert.match(decide, /function byFee\(a, b, dir\)/, 'fee sorting must route through byFee');
  assert.doesNotMatch(decide, /fees_low: \(a, b\) => a\.course\.total_fees_kes - b\.course\.total_fees_kes/,
    'raw subtraction reintroduces NaN ordering for unpublished fees');

  // "Cheapest in catalogue" must skip nulls: Math.min(x, null) is 0.
  assert.match(decide, /c\.total_fees_kes == null \? min : Math\.min/,
    'the cheapest-course figure must ignore unpublished fees');

  // The comparison table must not crown an unpublished fee as best value.
  assert.match(decide, /courses\.map\(row\.raw\)\.filter\(\(v\) => v != null\)/,
    'best-value must drop nulls before Math.min/Math.max');
});

/* An unpriced record must not quietly carry invented outcomes either. No tracer
 * study covers a county VTC, so copying a national polytechnic's illustrative
 * employment rate onto one would invent a figure for exactly the institutions a
 * reader is least able to check. */
test('unpriced courses do not carry invented outcome figures', () => {
  for (const c of COURSES.filter((x) => x.total_fees_kes == null)) {
    assert.equal(c.employment_rate, null, `${c.id} has no published fee but an employment rate`);
    assert.equal(c.median_salary_kes, null, `${c.id} has no published fee but a median salary`);
    /* Two different absences, and conflating them is its own small dishonesty.
     * "The institution publishes no fee" tells a reader there is nothing to
     * look up and they must ring and ask. "We could not verify it" tells them
     * the figure exists and Njia failed to reach it — worth searching for
     * themselves. Both are honest; pretending the second is the first is not. */
    assert.ok(/does not publish|publishes no fee|could not be verified|not reachable/i.test(c.verification_note || ''),
      `${c.id} must say in its verification_note why the fee is absent — either that the `
      + 'institution publishes none, or that we could not verify one that exists');
  }
});

/* The artisan tier was first added entirely at one national polytechnic in
 * Nairobi. That is a poor answer for a catalogue that covers 47/47 counties:
 * the learner most likely to need an artisan route is the least able to fund a
 * move to Kabete. A tier that exists only in the capital is a tier most of its
 * intended users cannot reach. */
test('the artisan tier is not confined to a single institution or county', () => {
  const artisan = COURSES.filter((c) => c.level === 'artisan');
  const byId = new Map(INSTITUTIONS.map((i) => [i.id, i]));
  const institutions = new Set(artisan.map((c) => c.institution_id));
  const counties = new Set(artisan.map((c) => byId.get(c.institution_id)?.county));

  assert.ok(artisan.length > 0, 'the artisan tier must exist');
  assert.ok(institutions.size >= 2, `artisan courses sit at only ${institutions.size} institution(s)`);
  // A ratchet, not a target. It started at 2 when the tier covered four
  // counties, went to 6 at eight, and is 9 now the tier covers eleven. Raise
  // it as coverage grows, never lower it to make a change pass — the whole
  // point is that reach cannot quietly regress.
  assert.ok(counties.size >= 9, `artisan courses reach only ${counties.size} county/counties`);
  // Every artisan record must resolve to a real institution — a typo in
  // institution_id would otherwise render as "Unknown institution".
  for (const c of artisan) {
    assert.ok(byId.has(c.institution_id), `${c.id} points at unknown institution ${c.institution_id}`);
  }
});

/* ---------- templates cannot reference fields that do not exist ---------- */

/* Renaming PUBLIC_TVET_CAPITATION.unreconciled to .residual left a live
 * template in decide.js pointing at the old key. Nothing failed — the card
 * simply rendered the string "undefined" to the user, on the very line whose
 * job is to explain a fee discrepancy. Property access on a missing key is
 * silent in JavaScript, so this needs a guard rather than vigilance. */
test('every capitation field the UI renders actually exists', () => {
  const decide = fs.readFileSync(path.join(root, 'js/decide.js'), 'utf8');
  const CAP = grab('PUBLIC_TVET_CAPITATION');
  const referenced = [...decide.matchAll(/PUBLIC_TVET_CAPITATION\.(\w+)/g)].map((m) => m[1]);

  assert.ok(referenced.length > 0, 'expected the capitation record to be rendered somewhere');
  for (const key of new Set(referenced)) {
    assert.ok(key in CAP, `decide.js renders PUBLIC_TVET_CAPITATION.${key}, which does not exist`);
    assert.notEqual(CAP[key], undefined, `PUBLIC_TVET_CAPITATION.${key} is undefined`);
  }
});

/* The capitation figures must stay internally consistent. The earlier version
 * of this record concluded the published arithmetic "did not add up", having
 * subtracted the Ksh 26,420 trainee balance from the Ksh 67,189 consolidated
 * fee. Those belong to two different fee regimes. Capitation plus the trainee
 * balance equals the approved annual fee exactly; the consolidated fee sits
 * above it by the residual. */
test('the capitation arithmetic closes', () => {
  const C = grab('PUBLIC_TVET_CAPITATION');
  assert.equal(
    C.governmentCapitationKes + C.publishedStudentBalanceKes, C.approvedAnnualFeeKes,
    'capitation + trainee balance must equal the approved annual fee'
  );
  assert.equal(
    C.consolidatedAnnualFeeKes - C.approvedAnnualFeeKes, C.residualAboveFundedStructureKes,
    'the residual must be the consolidated fee less the approved fee'
  );
});

/* ---------- the derived level filter holds for levels not yet invented ---------- */

/* LEVEL_ORDER fixes the display order of levels this build knows about. A
 * level added to data/courses.js but not to LEVEL_ORDER must still reach the
 * dropdown — sorted last rather than silently dropped, which is the failure
 * the hardcoded array produced in the first place. Exercised against a
 * synthetic catalogue so it tests the derivation, not today's data. */
test('a level missing from LEVEL_ORDER still reaches the filter', () => {
  const decide = fs.readFileSync(path.join(root, 'js/decide.js'), 'utf8');
  const derivation = decide.slice(decide.indexOf('const LEVEL_ORDER'),
    decide.indexOf('function gradeRank'));

  const run = (levels) => {
    const ctx = vm.createContext({ COURSES: levels.map((l) => ({ level: l })) });
    vm.runInContext(derivation, ctx);
    return { levels: vm.runInContext('CATALOGUE_LEVELS', ctx), labels: vm.runInContext('LEVEL_LABELS', ctx) };
  };

  // Known levels come back in LEVEL_ORDER sequence, lowest entry bar first.
  // .join() rather than deepEqual: an array built inside the vm realm is not
  // reference-equal to a local one, which deepStrictEqual rejects.
  assert.equal(run(['degree', 'artisan', 'diploma', 'certificate']).levels.join(),
    'artisan,certificate,diploma,degree');

  // An unknown level is kept, placed last, and deduplicated.
  const r = run(['diploma', 'apprenticeship', 'artisan', 'apprenticeship']);
  assert.equal(r.levels.join(), 'artisan,diploma,apprenticeship');

  // Two unknowns tie on rank and fall back to alphabetical, so the order is
  // stable rather than dependent on catalogue insertion order.
  assert.equal(run(['zeta', 'degree', 'alpha']).levels.join(), 'degree,alpha,zeta');

  // Empty catalogue must not throw or emit a phantom option.
  assert.equal(run([]).levels.length, 0);

  // The dropdown falls back to the raw value for an unlabelled level, so it
  // renders "apprenticeship" rather than "undefined".
  assert.equal(r.labels.apprenticeship, undefined);
  assert.match(decide, /LEVEL_LABELS\[l\] \|\| l/, 'the filter needs a label fallback');
});

/* A single-sex institution must say so on the card face, not in a collapsed
 * provenance note. Don Bosco Boys Technical Training Centre admits boys only;
 * that fact first lived in verification_note, which renders inside a closed
 * <details>, so a woman scrolling the artisan list would not have seen it
 * until after applying. Restrictions on who may apply belong in description,
 * which is always visible. */
test('single-sex admission is stated where a learner will actually read it', () => {
  const restricted = COURSES.filter((c) => /boys only|girls only|women only|men only/i.test(c.verification_note || ''));
  for (const c of restricted) {
    assert.match(c.description, /boys only|girls only|women only|men only/i,
      `${c.id} restricts who may apply but says so only in the provenance note`);
  }
});

/* KUCCPS sets the artisan minimum at KCSE grade E, which is still a floor: a
 * learner who never sat KCSE, or left before Form Four, clears none of it.
 * Faith-based and mission centres are the documented route that does not ask
 * for one — CITC admits on a KCPE certificate, YMCA takes school leavers who
 * did not finish, St. Kizito teaches primary school leavers, Don Bosco admits
 * by interview. If that tier ever disappears from the catalogue, the app is
 * back to telling those learners there is nothing for them. */
test('the catalogue keeps a route for a learner with no KCSE at all', () => {
  const openEntry = COURSES.filter((c) => !c.min_grade);
  const byId = new Map(INSTITUTIONS.map((i) => [i.id, i]));

  assert.ok(openEntry.length >= 10, `only ${openEntry.length} courses require no KCSE`);
  // Not just short online certificates — a trade, taught in person.
  const trades = openEntry.filter((c) => c.level === 'artisan' && c.mode !== 'online');
  assert.ok(trades.length >= 10, `only ${trades.length} in-person artisan routes need no KCSE`);
  assert.ok(new Set(trades.map((c) => c.institution_id)).size >= 3,
    'the no-KCSE route must not depend on a single provider');
  assert.ok(new Set(trades.map((c) => byId.get(c.institution_id)?.county)).size >= 2,
    'the no-KCSE route must exist in more than one county');
});

/* ---------- the domain being promoted is the one that gets indexed ---------- */

/* A search for "njiacareerpathways.work" returned nothing. The site was live
 * and Lighthouse scored SEO 96, so the markup was fine — the problem was that
 * the custom domain appeared nowhere in the repository. All five absolute
 * URLs pointed at the .netlify.app deploy subdomain, there was no canonical,
 * and there was no robots.txt or sitemap to invite a crawl at all.
 *
 * Two hosts serving identical content with no stated preference is duplicate
 * content: search engines pick a winner themselves and inbound links split
 * between the two. Meanwhile every WhatsApp share of the custom domain
 * advertised the deploy subdomain, because og:url said so.
 *
 * For a platform whose entire purpose is being found by Kenyan school
 * leavers, that is a distribution failure, not a cosmetic one. */
test('the custom domain is the canonical one, everywhere it is asserted', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const SITE = 'https://njiacareerpathways.work';

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, 'index.html must declare a canonical URL');
  assert.equal(canonical[1], `${SITE}/`, 'canonical must name the custom domain');

  // og:url and og:image are absolute by necessity — a relative OG image does
  // not resolve in WhatsApp or Facebook. Absolute means they can point at the
  // wrong host, which is exactly what happened.
  for (const [prop, tag] of [['og:url', 'property'], ['og:image', 'property'],
                             ['twitter:image', 'name']]) {
    const m = html.match(new RegExp(`<meta ${tag}="${prop}" content="([^"]+)"`));
    assert.ok(m, `${prop} must be present`);
    assert.ok(m[1].startsWith(SITE), `${prop} points at ${m[1]} — should be the custom domain`);
  }

  // Scoped to index.html this guard would have passed while the costliest
  // instances sat untouched in js/discover.js: NJIA_SITE_URL, which is what
  // WhatsApp shares, the native share sheet and the clipboard all send, plus
  // the URL printed on every downloaded report. Check every shipped file.
  const shipped = ['index.html', 'manifest.json', 'sw.js',
    ...fs.readdirSync(path.join(root, 'js')).map((f) => `js/${f}`),
    ...fs.readdirSync(path.join(root, 'data')).map((f) => `data/${f}`)];
  const offenders = shipped.filter((f) => {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    // Match the host only in URL/text position, not in prose explaining the fix.
    return /njiacareerpathways\.netlify\.app/.test(src.replace(/\/\*[\s\S]*?\*\/|^\s*(\/\/|\s*\*).*$/gm, ''));
  });
  assert.equal(offenders.join(', '), '',
    'these still send users to the .netlify.app deploy subdomain');
});

test('robots.txt and sitemap.xml exist, agree, and parse', () => {
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

  assert.match(robots, /^Sitemap:\s*https:\/\/njiacareerpathways\.work\/sitemap\.xml$/m,
    'robots.txt must point crawlers at the sitemap on the custom domain');
  assert.match(robots, /^Allow:\s*\//m, 'robots.txt must allow crawling');

  // The namespace is sitemaps.org, plural. Getting it wrong makes the file
  // unparseable to every crawler while still looking correct at a glance —
  // this was typed as sitemap.org on the first pass.
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/,
    'sitemap namespace must be sitemaps.org (plural)');

  const loc = sitemap.match(/<loc>([^<]+)<\/loc>/);
  assert.ok(loc, 'sitemap must contain a <loc>');
  assert.equal(loc[1], 'https://njiacareerpathways.work/');

  const lastmod = sitemap.match(/<lastmod>([^<]+)<\/lastmod>/)[1];
  assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, 'lastmod must be an ISO date');
  assert.ok(!Number.isNaN(Date.parse(lastmod)), `lastmod ${lastmod} is not a real date`);

  // Crawler-facing files, fetched by bots and never by the app. Precaching
  // them would cost every offline user bytes for something they never read —
  // same reasoning that keeps the install screenshots out.
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.ok(!/robots\.txt|sitemap\.xml/.test(sw),
    'crawler files must stay out of the offline cache');
});

/* Artisan entry grades must not be flattened to the national floor, and the
 * cost of getting this wrong is specific: KUCCPS artisan applicants get only
 * four choices, so an overstated eligibility does not merely disappoint, it
 * burns one of four.
 *
 * THIS GUARD USED TO COUNT DISTINCT VALUES, AND THAT WAS A PROXY.
 *
 * It required three or more distinct entry values across the artisan tier, on
 * the reasoning that institutions publish different bars — the comment cited
 * "Eldoret states D, Sigalagala D-, Meru D- or KCPE, Kabete E". Every one of
 * those four had already moved by the time it fired: Eldoret and Kisumu were
 * corrected to E when this repository decided that quoting a grade high is the
 * exclusionary direction, Meru admits without a grade, and the tier now holds
 * exactly two values, E and open.
 *
 * So the count fell to two and the guard failed on data that was more correct
 * than the data it was written against. A proxy that fires on a legitimate
 * convergence is not measuring the thing it is named after. What it was
 * defending is not variety — variety is an accident of which institutions are
 * listed — it is that no record claims the floor without evidence for the
 * floor.
 *
 * So it is asserted directly instead. A record sitting at E must say WHY E in
 * its own note: either the institution publishes E, or it publishes an
 * alternative route — a KCPE certificate, an interview, open entry — that a
 * learner with an E clears. A silent E is the flattening this guard exists to
 * stop, and unlike a value count it stays true however the catalogue grows.
 *
 * Grade never hides a course from the results list (only cluster, mode, level,
 * county and ownership filter), so recording a genuinely published stricter
 * figure costs no visibility. */
test('artisan entry grades reflect what each institution publishes', () => {
  const artisan = COURSES.filter((c) => c.level === 'artisan');

  /* An E must be argued for in the note, not merely typed. The alternation
     covers both routes to it: an institution that publishes E outright, and
     one whose published bar is a grade OR a non-grade alternative (a KCPE
     certificate, an interview, open entry, "and below") that an E clears. */
  /* The vocabulary has to cover how an institution actually words an open
     tier, not how this test would word it. The first pass matched only
     'open entry' and failed eight correct records at Lodwar, Mandera and
     Laisamis, whose published ladders read 'artisan courses open-ended' and
     'other course categories open'. Same failure this file already records
     for Don Bosco and St. Kizito: the records were right and the test was
     wrong. */
  const JUSTIFIES_E = /KCPE|interview|open entry|open-ended|categories open|courses open|primary school|school leaver|and below|downwards|grade of E|as an E|E grade|minimum for Level 4|artisan floor|KUCCPS/i;
  const unjustified = artisan
    .filter((c) => c.min_grade === 'E' && !JUSTIFIES_E.test(c.verification_note || ''))
    .map((c) => c.id);

  /* Compared as a joined string, not with deepEqual. COURSES is built inside a
     vm context, so arrays derived from it carry that realm's Array prototype
     and deepStrictEqual rejects them against a literal [] even when both are
     empty — which is why every other check in this file joins first. */
  assert.equal(unjustified.join(', '), '',
    `these artisan records sit at the KUCCPS floor of E without their note saying why: ${unjustified.join(', ')}. `
    + 'E is the most permissive value this tier can carry, so it has to be evidenced rather than assumed — '
    + 'either the institution publishes E, or it publishes an alternative route (a KCPE certificate, an '
    + 'interview, open entry) that a learner with an E clears. An artisan applicant gets four KUCCPS choices; '
    + 'an eligibility Njia overstated burns one of them.');

  // No artisan record may sit below the KUCCPS national floor of E. A value
  // beneath it would be a data-entry slip, not an institutional policy.
  const ORDER = ['E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A'];
  const belowFloor = artisan.filter((c) => c.min_grade !== null && ORDER.indexOf(c.min_grade) < ORDER.indexOf('E'));
  assert.equal(belowFloor.map((c) => c.id).join(', '), '', 'artisan records below the KUCCPS floor of E');

  // Anything above D+ is not an artisan bar — it is a craft or diploma
  // requirement pasted onto the wrong tier.
  const tooHigh = artisan.filter((c) => c.min_grade !== null && ORDER.indexOf(c.min_grade) > ORDER.indexOf('D+'));
  assert.equal(tooHigh.map((c) => `${c.id} (${c.min_grade})`).join(', '), '',
    'artisan records demanding more than D+ — that is a craft-level bar on an artisan record');

  // Every artisan record states its grade basis, because every one of them
  // departs from a single national rule.
  //
  // The first version of this alternation matched only the KUCCPS/grade
  // vocabulary and failed 11 records at Don Bosco and St. Kizito. Those
  // records were right and the test was wrong: they admit by interview, or
  // take primary school leavers, and say so explicitly — "Admission is by
  // interview rather than a KCSE grade, so min_grade is null". An open-entry
  // provider states its basis in the language of admission, not of grades.
  for (const c of artisan) {
    assert.ok(
      /KUCCPS|KCPE|mean grade|entry|minimum|admission|interview|school leaver|primary/i.test(c.verification_note || ''),
      `${c.id} gives no basis for its entry requirement`);
  }
});

/* Counting artisan counties is not the same as counting counties where the
 * learner this tier exists for can actually apply.
 *
 * Most polytechnics publish an artisan bar of D or D-, above the KUCCPS floor
 * of E, so a county can hold artisan records that an E-grade learner still does
 * not meet. The metric that matters is the one measured from the learner's
 * side: how many counties contain something they qualify for. It moved 5 to 6
 * when four polytechnics were added, and 6 to 9 only once the Vocational
 * Training Centres — which admit on a KCPE certificate — came in.
 *
 * A ratchet on the same terms as the county guard above. */
test('an E-grade learner can apply somewhere in a meaningful number of counties', () => {
  const ORDER = ['E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A'];
  const byId = new Map(INSTITUTIONS.map((i) => [i.id, i]));
  const reachable = COURSES.filter((c) => !c.min_grade || ORDER.indexOf('E') >= ORDER.indexOf(c.min_grade));
  const counties = new Set(reachable.map((c) => byId.get(c.institution_id)?.county));

  assert.ok(counties.size >= 9,
    `an E-grade learner has options in only ${counties.size} counties`);

  // Reach has to mean trades, not only the open-entry short certificates that
  // made the original count look survivable. Five OUK online certificates in
  // one county was the state this whole line of work started from.
  const artisanCounties = new Set(
    reachable.filter((c) => c.level === 'artisan').map((c) => byId.get(c.institution_id)?.county));
  assert.ok(artisanCounties.size >= 8,
    `an E-grade learner reaches artisan training in only ${artisanCounties.size} counties`);
});

/* ---------- teaching is listed with the queue attached ---------- */

/* Njia held no teacher training colleges at all, while teaching is one of the
 * largest destinations for a C-grade learner. Filling that gap is only
 * defensible with the employment reality attached.
 *
 * TSC employs about 431,831 teachers and has roughly 369,430 more trained,
 * registered and jobless — nearly nine waiting for every ten working — while
 * public schools are simultaneously short about 96,345 teachers. Both figures
 * are true and they describe different things: the shortage is of funded
 * posts, the backlog is of qualified people. A learner shown only the shortage
 * would conclude teaching is a safe bet, which is the opposite of what the
 * numbers say.
 *
 * So the warning leads the description, where it cannot be missed, rather than
 * sitting in the collapsed provenance note — the same treatment that Don Bosco
 * admitting boys only already gets. */
test('teacher training records carry the employment queue in the description', () => {
  /* Scoped to /Teacher Education/i this guard covered only the six diploma
   * records added alongside it, and passed while three Bachelor of Education
   * degrees already in the catalogue claimed employment rates of 70-72% with
   * no warning at all — for the same TSC labour market. A learner comparing a
   * B.Ed against the diploma would have seen "70%" on one and a queue warning
   * on the other, and reasonably chosen the degree.
   *
   * Guarding what you just wrote rather than the category it belongs to is the
   * same mistake the domain guard made when it checked index.html and left the
   * share URL broken. The scope is the pathway.
   *
   * Bachelor of Technology Education is deliberately outside it: that trains
   * TVET instructors, employed by training institutions rather than TSC, so
   * the school-teacher backlog does not describe its market and applying this
   * warning there would be its own inaccuracy. */
  const teaching = COURSES.filter((c) => /Teacher Education|Bachelor of Education/i.test(c.name));
  assert.ok(teaching.length >= 9, `only ${teaching.length} teaching records matched — has the naming changed?`);

  for (const c of teaching) {
    // Not merely present — leading. A caveat below the fold is a caveat most
    // readers never reach.
    assert.match(c.description.slice(0, 120), /369,000 trained teachers|not the safe default/,
      `${c.id} does not lead with the employment queue`);
  }

  // Njia's other records carry illustrative outcome estimates. Against a
  // backlog this size an invented employment rate is not merely unmeasured,
  // it is actively misleading — so these must stay null.
  const invented = teaching.filter((c) => c.employment_rate !== null || c.median_salary_kes !== null);
  assert.equal(invented.map((c) => c.id).join(', '), '',
    'teacher training records must not carry invented outcome figures');
});

test('the teacher labour market record states both sides of the paradox', () => {
  const T = TEACHER_LABOUR_MARKET;
  assert.ok(T, 'TEACHER_LABOUR_MARKET must be exported');

  // The shortage figure alone reads as opportunity. Only the pair is honest.
  assert.ok(T.registeredUnemployedTeachers > 0 && T.fundedPostShortage > 0,
    'both the backlog and the funded-post shortage must be recorded');
  assert.ok(T.registeredUnemployedTeachers > T.fundedPostShortage,
    'the backlog is the larger number — if that inverts, re-check the source');
  assert.match(T.theParadox, /funded posts/,
    'the paradox must explain that the shortage is of posts, not of people');

  // theRatio is prose derived from two numbers; prose drifts when numbers
  // change. Nearly nine per ten is 0.86 — assert the arithmetic still supports
  // the wording rather than trusting the sentence.
  const ratio = T.registeredUnemployedTeachers / T.tscEmployedTeachers;
  assert.ok(ratio > 0.8 && ratio < 0.95,
    `ratio is ${ratio.toFixed(2)} — the "nearly nine per ten" wording no longer matches`);
});

/* ---------- the exported PDF is the copy that travels ---------- */

/* The report leaves the app. It goes to a parent, a school, a bursary office —
 * readers with no app around it to fill in gaps. Two defects were found by
 * generating one and looking at it.
 *
 * The brand mark was loading="lazy" inside .print-only, which is display:none
 * until print media applies. A lazy image in a hidden subtree never enters the
 * viewport, so it was never fetched — measured naturalWidth 0 and zero network
 * requests — and print CSS reveals the block far too late to load it. Every
 * PDF exported shipped with no logo: no indication of where the document came
 * from. */
test('the report carries a brand mark that cannot fail to load', () => {
  /* This guard used to require an <img> in the report header that was not
   * lazy-loaded, because the mark sits in a display:none subtree and a lazy
   * image there is never fetched — every PDF exported before that fix went
   * out with no mark at all. The requirement was always "the mark is there
   * when the sheet prints"; a non-lazy <img> was just one way to get it.
   * The mark is inline vector now, which cannot fail to load because there
   * is nothing to fetch, so the guard checks the requirement and still
   * rejects a return to a lazily-fetched bitmap. */
  const discover = fs.readFileSync(path.join(root, 'js/discover.js'), 'utf8');
  const start = discover.indexOf('<div class="report-header">');
  assert.ok(start > -1, 'the report must have a header block');
  const header = discover.slice(start, discover.indexOf('report-header-meta', start));
  const inlineMark = /<use\s+href="#i-njia"/.test(header);
  const img = header.match(/<img[^>]*>/);
  assert.ok(inlineMark || img,
    'the report header carries no brand mark — it is the one element telling a bursary office where the sheet came from');
  if (img) {
    assert.ok(!/loading=["']lazy["']/.test(img[0]),
      'the report logo must not be lazy-loaded — it sits in a display:none subtree and will never be fetched');
  }

  // The print block must stay display:none on screen and visible in print, or
  // the report renders twice on the page.
  const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
  assert.match(css, /\.print-only\s*\{\s*display:\s*none/, '.print-only must be hidden on screen');
  assert.match(css, /\.print-only\s*\{\s*display:\s*block\s*!important/, '.print-only must be shown in print');
});

/* The shortlist was a bulleted list of bare course names — the thinnest section
 * on the page, carrying the most decision-relevant data Njia holds. A course
 * name alone tells a bursary officer nothing: not where it is taught, not what
 * it costs, not whether the learner's grade clears the bar. */
test('the report shortlist carries the facts a reader needs to act on', () => {
  const discover = fs.readFileSync(path.join(root, 'js/discover.js'), 'utf8');
  const block = discover.match(/report-courses[\s\S]*?report-progress/);
  assert.ok(block, 'the report must have a shortlist section');
  const table = block[0];

  for (const col of ['Course', 'Institution', 'Tuition', 'Entry']) {
    assert.ok(table.includes(`<th`) && new RegExp(`>${col}<`).test(table),
      `the shortlist must have a ${col} column`);
  }
  // An unpriced course must say so. A blank cell reads as free, which is the
  // same failure the Decide cards were fixed for.
  assert.match(table, /Not published/,
    'unpriced courses must say so rather than rendering an empty fee cell');
  // Eligibility is the first question anyone asks of a shortlist; the reader
  // should not have to compare two grades themselves.
  assert.match(table, /meetsGradeRequirement/,
    'the Entry column must compare each course against the learner\'s own grade');
});

/* One page is the whole requirement for this deliverable, and the constraint is
 * easy to break from a direction that looks like an improvement. Moving the
 * county to its own line under each institution read better — and added one
 * line per row, taking the report from 795px to 873px and the PDF from one page
 * to two. Measured, not guessed.
 *
 * The real check is a rendered page count, which needs a browser and so lives
 * in the drive script rather than here. What this guards is the specific shape
 * of that regression: any rule that grows a table row must be scoped to screen,
 * because print has no spare vertical room. */
test('the report shortlist adds no vertical lines in print', () => {
  const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');

  // The county span must be inline by default. A bare `display: block` outside
  // a screen-scoped block applies to print too.
  const base = css.match(/\.report-inst-county\s*\{[^}]*\}/);
  assert.ok(base, '.report-inst-county must be styled');
  assert.ok(!/display:\s*block/.test(base[0]),
    '.report-inst-county must not be display:block by default — it costs a line per row in print');

  // Where it does become a block, that rule has to sit inside a screen-only
  // media query. `@media (max-width: …)` without `screen` still matches print.
  const blockRules = [...css.matchAll(/@media([^{]*)\{((?:[^{}]|\{[^{}]*\})*)\}/g)]
    .filter((m) => /\.report-inst-county\s*\{[^}]*display:\s*block/.test(m[2]));
  assert.ok(blockRules.length > 0, 'the phone treatment for the county line must exist');
  for (const m of blockRules) {
    assert.match(m[1], /\bscreen\b/,
      `the county-as-block rule is in "@media${m[1].trim()}" — it must be scoped to screen or it applies to print`);
  }
});

/* ---------- the deploy stays buildless ---------- */

/* A production build failed on 12 August 2026 with npm ECONNRESET while
 * installing build plugins — on a site with no package.json, no lockfile, and
 * an echo for a build command. Nothing in the repository needs npm; the
 * plugins are the only reason it runs at all.
 *
 * That is the standing fragility, and it gets worse the moment anything here
 * acquires a dependency. These assertions are cheap insurance on the two
 * properties that keep a deploy from having anything to go wrong: no install
 * step, and no build step. */
test('the site stays dependency-free and buildless', () => {
  for (const f of ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']) {
    assert.ok(!fs.existsSync(path.join(root, f)),
      `${f} exists — Njia is deliberately dependency-free, and every install is a way for a deploy to fail`);
  }

  const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
  // publish must stay the repository root: every asset path in the app is
  // relative, and a subdirectory publish would serve an empty site.
  assert.match(toml, /^\s*publish\s*=\s*"\."/m, 'publish must remain the repository root');
  // The build command must remain a no-op. A real command here would give a
  // buildless site something to fail at.
  const cmd = toml.match(/^\s*command\s*=\s*"([^"]*)"/m);
  assert.ok(cmd, 'netlify.toml must pin a build command so a dashboard setting cannot replace it');
  assert.match(cmd[1], /^echo /, `build command is ${JSON.stringify(cmd[1])} — it must stay a no-op`);
});

/* ---------- a tie is reported, not awarded ---------- */

/* computeClusterScores sorts by score with no tiebreaker, and
 * Array.prototype.sort is stable — so equal scores came out in the order the
 * clusters happen to be declared in data/questions.js. Measured over 20,000
 * uniformly-random answer sets: 11.5% of runs ended in a top-two tie, and the
 * tie was awarded in exactly declaration order, carer first through numbers
 * last. Carer took 35.8% of ties against a fair share of 16.7%, which is most
 * of why it was named primary in 19.7% of all runs rather than 16.7%.
 *
 * An array index was choosing a learner's career direction. There is no honest
 * tiebreaker — identical scores mean the instrument cannot separate them — so
 * the fix reports the draw rather than inventing a winner. */
test('a tied top score is disclosed rather than resolved by declaration order', () => {
  const discover = fs.readFileSync(path.join(root, 'js/discover.js'), 'utf8');

  assert.match(discover, /tiedWithPrimary/,
    'computeClusterScores must report which clusters share the top score');
  assert.match(discover, /return \{[^}]*tiedWithPrimary/,
    'tiedWithPrimary must be returned, not merely computed');

  // matchConfidence must name a tie as its own level. Describing a zero-point
  // gap as a "close call" understates it on every surface that renders it.
  assert.match(discover, /marginPts === 0 \? 'tied'/,
    "matchConfidence must report an exact tie as level 'tied'");

  // Both surfaces a learner reads — the screen and the exported PDF — have to
  // say it. The PDF is the copy that travels with no app around it.
  assert.match(discover, /tied: `an exact draw/, 'the results screen must describe a draw');
  assert.match(discover, /This was a draw/, 'the exported report must describe a draw');

  const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
  assert.match(css, /\.confidence-tied\s*\{/, 'the tied state needs its own styling, not a fallback');
});

/* The six clusters are a RIASEC derivative, and the evidence closest to Njia's
 * own users says that structure may not hold for them. A platform that claims
 * to be research-backed has to carry the research that complicates it. */
test('the method lineage names its inheritance and its limits', () => {
  const modules = METHOD_LINEAGE.map((m) => m.module).join(' | ');
  const sources = METHOD_LINEAGE.map((m) => m.source).join(' | ');
  const notes = METHOD_LINEAGE.map((m) => m.note).join(' | ');

  assert.match(sources, /Holland/, 'the RIASEC inheritance must be named, not left implicit');
  assert.match(sources, /du Toit/, "the closest test to Njia's users must be cited");
  assert.match(notes, /may not hold/, 'the African-context limit must be stated, not softened away');
  assert.match(sources, /Krumboltz/, 'planned happenstance must be cited');
  assert.match(sources, /Kluve/, 'the youth-intervention evidence must be cited');
  assert.match(notes, /one in three|one youth employment programme in three/i,
    'the base rate for these interventions working must be stated plainly');
  assert.match(modules, /no home/, "the missing Realistic type must be recorded as a gap");
});

/* ---------- the seventh cluster is a whole cluster, not a label ---------- */

/* Holland's Realistic type — hands-on, tools, machines, building and repairing
 * — had no cluster here, and the questionnaire had no option describing that
 * disposition. The only "fixing" answer in sixteen questions was "fixing a
 * phone, computer, or learning a coding tutorial", scored purely as tech. A
 * learner who is excellent with their hands had nothing to select, so they
 * answered around it and were sorted somewhere else — while the artisan trades
 * sat under Tech Navigator, which describes systems and code, not welding.
 *
 * Adding the cluster without the rest is worse than not adding it: a cluster
 * with no questionnaire voice can never score, and a cluster with no evidence
 * renders a heading with nothing under it. These assert the whole thing
 * arrived. */
test('the Maker cluster can actually be reached and is not a dead end', () => {
  assert.ok(CLUSTERS.maker, 'the Maker cluster must exist');

  // It must be last. Object.keys order is what unbroken ties fall through, so
  // a new cluster at the front would change which name shows first on every
  // pre-existing tie.
  const keys = Object.keys(CLUSTERS);
  assert.equal(keys[keys.length - 1], 'maker',
    'maker must be declared last so it does not displace existing tie ordering');

  // A cluster with no questionnaire voice scores zero forever.
  const scoring = QUESTIONNAIRE.flatMap((s) => s.questions).filter((q) => (q.options || []).length);
  const voices = scoring.filter((q) => q.options.some((o) => o.scores && o.scores.maker));
  assert.ok(voices.length >= 6,
    `only ${voices.length} questions offer a Maker answer — it cannot compete on that`);

  // And it must not be an artisan-only ghetto. The whole ladder argument in
  // this codebase is artisan to craft to diploma; a cluster that dead-ends at
  // artisan tells the lowest-scoring learners their ceiling is fixed.
  const pool = COURSES.filter((c) => c.cluster === 'maker');
  assert.ok(pool.length > 20, `Maker holds only ${pool.length} courses`);
  const levels = new Set(pool.map((c) => c.level));
  assert.ok(levels.has('artisan') && levels.size >= 3,
    `Maker spans only ${[...levels].join(', ')} — it must ladder above artisan`);
});

/* Maker's career paths were built from the career_paths actually attached to
 * its courses, which is why it is the one cluster whose headline path is not
 * thinner than the catalogue behind it. That is the standard the other six are
 * measured against, so it should not quietly regress. */
test("Maker's advertised paths are backed by real courses", () => {
  const pool = COURSES.filter((c) => c.cluster === 'maker');
  const haystack = pool.map((c) => `${c.name} ${(c.career_paths || []).join(' ')}`).join(' | ').toLowerCase();
  const first = CLUSTERS.maker.paths[0].toLowerCase().split(/[ /&]+/)[0];
  const hits = pool.filter((c) =>
    `${c.name} ${(c.career_paths || []).join(' ')}`.toLowerCase().includes(first)).length;
  assert.ok(hits >= 5,
    `Maker leads with "${CLUSTERS.maker.paths[0]}" but only ${hits} courses match it`);
  // Every advertised path should find something, not just the first.
  for (const path of CLUSTERS.maker.paths) {
    const stem = path.toLowerCase().split(/[ /&]+/)[0];
    assert.ok(haystack.includes(stem), `Maker advertises "${path}" with nothing behind it`);
  }
});

/* ---------- Aspiration vs. supply ----------
 *
 * CLUSTERS[x].paths is hand-written. That is fine for describing a cluster,
 * and deliberately kept aspirational, but it was doing a second job nobody
 * had checked: paths[0] became the role in five years of Odyssey plan
 * suggestions. The creator cluster listed Graphic Design, Journalism, Fashion
 * Design, Architecture and Film & Media while its courses taught hairdressing,
 * beauty therapy and catering, so a creator learner designed a life around
 * graphic design that the catalogue could not start them on. CATALOGUE_ROLES
 * is the measured counterpart, and these guard the split between the two.
 */
test('CATALOGUE_ROLES covers every cluster with something real', () => {
  for (const id of Object.keys(CLUSTERS)) {
    const roles = CATALOGUE_ROLES[id];
    assert.ok(Array.isArray(roles) && roles.length,
      `Cluster "${id}" has no catalogue roles — the Odyssey plan would fall back to "the field"`);
    assert.ok(roles[0].courses >= 1,
      `Cluster "${id}" leads with "${roles[0].role}" backed by ${roles[0].courses} courses`);
  }
});

test('CATALOGUE_ROLES counts match the catalogue they claim to count', () => {
  for (const [id, roles] of Object.entries(CATALOGUE_ROLES)) {
    const pool = COURSES.filter((c) => c.cluster === id);
    for (const { role, courses } of roles) {
      const actual = pool.filter((c) => (c.career_paths || []).includes(role)).length;
      assert.equal(courses, actual,
        `${id}/"${role}" claims ${courses} courses, catalogue has ${actual}`);
    }
  }
});

/* Ordering must not depend on which record happened to be typed first.
 * An array index deciding which career leads is the precise defect that was
 * fixed in the cluster tie-break; the same mistake is available here. */
test('CATALOGUE_ROLES ordering is deterministic, not insertion order', () => {
  for (const [id, roles] of Object.entries(CATALOGUE_ROLES)) {
    for (let i = 1; i < roles.length; i++) {
      const prev = roles[i - 1];
      const cur = roles[i];
      assert.ok(prev.courses > cur.courses
        || (prev.courses === cur.courses && prev.role.toLowerCase() < cur.role.toLowerCase()),
        `${id}: "${prev.role}" (${prev.courses}) precedes "${cur.role}" (${cur.courses}) out of order`);
    }
  }
});

/* The two surfaces that a learner walks away with. The report is the sheet
 * handed to whoever is being asked for fees, so the job titles on it must be
 * ones the catalogue can train for; the results screen must show the measured
 * line rather than presenting the aspirational tags alone as an offer. */
test('the report and results screen are sourced from measured roles', () => {
  const src = fs.readFileSync(path.join(root, 'js', 'discover.js'), 'utf8');
  assert.ok(/report-paths[\s\S]{0,400}CATALOGUE_ROLES/.test(src),
    'The exported report still tags the learner with hand-written cluster paths');
  assert.ok(/CATALOGUE_ROLES\[primary\][\s\S]{0,700}cluster-supply/.test(src),
    'The results screen shows aspirational tags with no measured counterpart');
  assert.ok(src.includes('cluster-tags-label'),
    'The aspirational tags are unlabelled, so they read as an offer');
});

test('the Odyssey plan builds on roles the catalogue can start a learner on', () => {
  const src = fs.readFileSync(path.join(root, 'js', 'design.js'), 'utf8');
  const fn = src.slice(src.indexOf('function odysseySuggestions'));
  assert.ok(fn.includes('CATALOGUE_ROLES'),
    'odysseySuggestions does not consult the catalogue');
  assert.ok(!/const role\s*=\s*cluster\?\.paths/.test(fn),
    'odysseySuggestions still takes its role from the aspirational paths list');
});

/* "working as a Accounting" shipped for months. The roles are real job titles
 * now, several of them initialisms, so the article has to follow pronunciation
 * rather than spelling. Executed rather than pattern-matched: the function is
 * self-contained, so the test runs the real one. */
test('the Odyssey plan says "an HR Assistant", not "a HR Assistant"', () => {
  const src = fs.readFileSync(path.join(root, 'js', 'design.js'), 'utf8');
  const start = src.indexOf('function articleFor');
  assert.ok(start > -1, 'articleFor is gone — the a/an handling went with it');
  const body = src.slice(start, src.indexOf('\n}', start) + 2);
  const articleFor = vm.runInNewContext(`${body}; articleFor`);

  for (const [noun, want] of [
    ['HR Assistant', 'an'], ['ICT Support Assistant', 'an'], ['M&E Assistant', 'an'],
    ['Accounts Assistant', 'an'], ['Electrical Artisan', 'an'], ['Auditing Assistant', 'an'],
    ['Carpenter', 'a'], ['Registered Nurse', 'a'], ['Tailor', 'a'], ['Welder', 'a'],
    ['Beauty Therapist', 'a'], ['Data Analyst', 'a']
  ]) {
    assert.equal(articleFor(noun), want, `"${articleFor(noun)} ${noun}" is wrong`);
  }

  // Every role the app can actually reach must read correctly, not just the samples.
  for (const roles of Object.values(CATALOGUE_ROLES)) {
    for (const { role } of roles) {
      assert.match(articleFor(role), /^an?$/, `articleFor("${role}") returned nothing usable`);
    }
  }
});

test('the catalogue notice does not point at a badge that no longer exists', () => {
  /* The notice told readers "no figure marked est. has been measured" and
   * rendered the est. pill inline as an example, months after — and then
   * hours after — the figures it qualified were removed. Copy that
   * describes a marker outlives the marker unless something checks. */
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
  assert.ok(!/class="est-mark"/.test(decide),
    'the catalogue notice renders an est. badge again, but nothing marks figures est. any more');
  assert.ok(!/^\.est-mark\s*\{/m.test(css),
    'the .est-mark style is back without anything rendering it');
});

test('the brand mark is the same drawing in both places it is defined', () => {
  /* The mark lives twice: as icons/logo-mark.svg, which the PWA icon
   * generator and any external use read, and as the #i-njia sprite symbol,
   * which every in-app surface renders. Two copies of a drawing drift —
   * that is exactly how the old mark ended up as four PNGs that had to be
   * kept in step by hand. Compare the geometry, not the formatting. */
  const geometry = (src) => {
    /* Attribute order is formatting, so the extractor must not depend on it.
     * The first version required d= immediately after <path, and adding a
     * class to the shield outline — a purely presentational change, for the
     * standalone favicon's dark-scheme rule — dropped that path from one side
     * of the comparison and failed a guard that claims to ignore formatting.
     * Match the tag, then pull the attribute out of it. */
    const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]+)"`)) || [])[1];
    const paths = [...src.matchAll(/<path\b[^>]*>/g)]
      .map((m) => attr(m[0], 'd'))
      .filter(Boolean)
      .map((d) => d.replace(/\s+/g, ' ').trim());
    const circles = [...src.matchAll(/<circle\b[^>]*>/g)]
      .map((m) => ['cx', 'cy', 'r'].map((n) => attr(m[0], n)).join(','))
      .filter((c) => !c.includes('undefined'));
    return { paths, circles };
  };
  const file = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const symbol = html.slice(html.indexOf('<symbol id="i-njia"'));
  const inline = symbol.slice(0, symbol.indexOf('</symbol>'));

  const a = geometry(file), b = geometry(inline);
  assert.ok(a.paths.length >= 3, 'logo-mark.svg no longer contains the mark');
  assert.deepEqual(b.paths, a.paths, 'the #i-njia symbol and icons/logo-mark.svg draw different paths');
  assert.deepEqual(b.circles, a.circles, 'the marked terminal differs between the two definitions');
});

test('the icon sprite is hidden without display:none, so the mark still clips', () => {
  /* THE BUG THIS EXISTS TO STOP, WHICH SHIPPED FOR MONTHS.
   *
   * The brand mark clips its colour fields to the leaf with clip-path. In
   * Chromium that reference does NOT resolve from inside a <use> shadow clone
   * when the sprite defining it is display:none — and it fails silently:
   * getComputedStyle still reports url("#njia-leaf"), the element is found in
   * the DOM, and nothing throws. The fields simply render unclipped, so the
   * mark appeared as a full square of terracotta, brown and gold on every
   * in-app surface: header, landing hero, PDF report header.
   *
   * It went unnoticed because .landing-hero-logo carries border-radius, which
   * rounded the spilling square into something that read as a deliberate tile.
   * Confirmed by rendering the same symbol three ways — display:none, a
   * zero-size overflow-hidden box, and inline without <use>: only the first
   * failed, and the other two were pixel-identical.
   *
   * Any hiding technique that keeps the sprite rendered is fine. display:none
   * is the one that is not. */
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sprite = html.slice(0, html.indexOf('<symbol id="i-njia"'));
  const open = sprite.lastIndexOf('<svg');
  assert.notEqual(open, -1, 'the icon sprite <svg> has gone');
  const tag = sprite.slice(open, sprite.indexOf('>', open) + 1);

  assert.ok(!/display\s*:\s*none/.test(tag),
    'the icon sprite is display:none again. Chromium will not resolve the mark\'s '
    + 'clip-path from inside a <use> clone of a display:none sprite, and it fails '
    + 'silently — the brand mark renders as a square of colour with the leaf outline '
    + 'drawn over it, everywhere in the app at once. Hide it with '
    + 'position:absolute;width:0;height:0;overflow:hidden instead.');

  assert.match(tag, /width\s*:\s*0/,
    'the icon sprite no longer collapses to zero width, so it now takes layout space');
  assert.match(tag, /overflow\s*:\s*hidden/,
    'the icon sprite can overflow, which risks a stray scrollbar from a 0x0 box');
  assert.match(tag, /aria-hidden="true"/,
    'the icon sprite is exposed to assistive technology — it is a definition store, not content');
});

test('nothing renders the retired logo bitmaps', () => {
  /* The mark is vector now. The old PNG pair-per-scheme existed only
   * because a raster mark cannot take the page's ink, and leaving a
   * reference behind would quietly reintroduce the asset it replaced. */
  for (const file of ['index.html', 'js/app.js', 'js/discover.js', 'css/styles.css']) {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
    assert.ok(!/logo-mark-(light-)?\d+\.png|logo-lockup-report\.png/.test(code),
      `${file} still references a retired logo bitmap`);
  }
});
