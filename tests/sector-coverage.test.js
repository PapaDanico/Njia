/* Industry sector coverage and fee-regime integrity.
 *
 * These tests exist because two records shipped with a fee derived from a
 * pricing rule that did not apply to their institution, and both were flagged
 * `fees_confidence: 'verified'`:
 *
 *   c046  Diploma in Hospitality Management, Kenya Utalii College — priced at
 *         Ksh 67,189 x 2 from the consolidated public-TVET rate. Utalii is a
 *         Ministry of Tourism state corporation and sets its own fees.
 *   c028  Diploma in Clinical Medicine and Surgery, KMTC Kakamega — priced at
 *         Ksh 67,189 x 3 from the same rate, while its 44 sibling records
 *         correctly used KMTC's own published schedule.
 *
 * Neither was a typo. Both were a whole category of error that nothing checked:
 * a record can name any fee basis it likes, and no test asked whether that
 * basis belonged to that institution. The first was found because a reader
 * asked about Utalii. The second was found only because the first prompted a
 * sweep. That is not a process.
 *
 * A wrong fee wearing a verification badge is the worst failure this app has,
 * because the badge is the thing telling a teenager to trust the number and
 * plan around it.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  SECTORS, FEE_REGIMES, DERIVATION_SIGNATURES, ECONOMY, MIN_SECTOR_SAMPLE,
  sectorForCourse, sectorPace, formalNewJobs
} = require('./sector-register.js');

const root = path.join(__dirname, '..');
const ctx = vm.createContext({});
for (const file of ['institutions.js', 'courses.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'data', file), 'utf8'), ctx);
}
const INSTITUTIONS = vm.runInContext('INSTITUTIONS', ctx);
const COURSES = vm.runInContext('COURSES', ctx);
const byId = Object.fromEntries(INSTITUTIONS.map((i) => [i.id, i]));

test('every institution declares a known fee regime', () => {
  for (const inst of INSTITUTIONS) {
    assert.ok(inst.fee_regime,
      `${inst.id} (${inst.name}) has no fee_regime — nothing can then check what its fees may be derived from`);
    assert.ok(FEE_REGIMES.includes(inst.fee_regime),
      `${inst.id} declares fee_regime '${inst.fee_regime}', which is not one of: ${FEE_REGIMES.join(', ')}`);
  }
});

test('no course derives its fee from a regime its institution is not on', () => {
  /* THE GUARD. This is the one that would have caught both shipped bugs. */
  for (const course of COURSES) {
    const inst = byId[course.institution_id];
    assert.ok(inst, `${course.id} points at unknown institution '${course.institution_id}'`);
    const note = course.verification_note || '';
    for (const [regime, signature] of Object.entries(DERIVATION_SIGNATURES)) {
      if (!signature.test(note)) continue;
      assert.equal(inst.fee_regime, regime,
        `${course.id} "${course.name}" at ${inst.id} derives its fee from the '${regime}' regime, `
        + `but that institution is on '${inst.fee_regime}'. This is exactly how c046 (Utalii) and `
        + `c028 (KMTC) shipped a fee computed from a rule that does not apply to them.`);
    }
  }
});

test('a verified fee always names where it came from', () => {
  for (const course of COURSES.filter((c) => c.fees_confidence === 'verified')) {
    const note = (course.verification_note || '').trim();
    assert.ok(note.length > 60,
      `${course.id} "${course.name}" claims fees_confidence 'verified' with no substantive note. `
      + 'Verified means a reader can check it, not that we believe it.');
    /* Only records that actually state a fee need a checkable figure. A record
     * with total_fees_kes: null is verifying an ABSENCE — that the institution
     * publishes no fee structure — which is a legitimate verified claim and the
     * honest alternative to guessing. It just cannot be asked to quote a
     * number it is specifically reporting does not exist. */
    if (course.total_fees_kes == null) {
      assert.ok(/publishes no fee|no fee structure|does not publish|no figure is shown|could not be verified|not reachable/i.test(note),
        `${course.id} "${course.name}" has no fee and claims verified, but its note does not say `
        + 'that the institution publishes none. Say why the figure is missing.');
    } else {
      assert.ok(/\d/.test(note),
        `${course.id} is marked verified but its note quotes no figure to check against`);
    }
  }
});

test('institutions on a corporation fee regime never claim a verified fee they cannot source', () => {
  /* Utalii's published figures genuinely conflict across sources — roughly
   * 77,700 a year, a diploma range of 88,000-92,000, a certificate range of
   * 80,000-85,000, and one one-year certificate at 125,900. While that is true,
   * no Utalii record may claim to be verified. If the college ever publishes a
   * single authoritative structure, source it and this test can be relaxed. */
  const conflicted = COURSES.filter((c) => byId[c.institution_id]
    && byId[c.institution_id].fee_regime === 'tourism_corporation');
  assert.ok(conflicted.length > 0, 'no tourism_corporation courses found — the exclusion note is stale');
  for (const course of conflicted) {
    assert.notEqual(course.fees_confidence, 'verified',
      `${course.id} "${course.name}" claims a verified fee, but published Utalii figures conflict `
      + 'across every available source. Disclose the conflict instead of picking a winner.');
  }
});

test('KMTC records use the KMTC schedule, not some other institution\'s', () => {
  /* 82,200 in Year 1 and 78,000 thereafter. Any KMTC total should be reachable
   * from that schedule for some whole number of years. c028 was not. */
  const reachable = new Set();
  for (let years = 1; years <= 5; years += 1) reachable.add(82200 + 78000 * (years - 1));
  for (const course of COURSES) {
    const inst = byId[course.institution_id];
    if (!inst || inst.fee_regime !== 'kmtc' || course.total_fees_kes == null) continue;
    assert.ok(reachable.has(course.total_fees_kes),
      `${course.id} "${course.name}" at ${inst.id} costs ${course.total_fees_kes}, which is not `
      + `reachable from KMTC's published schedule (82,200 then 78,000/year). Reachable totals: `
      + `${[...reachable].sort((a, b) => a - b).join(', ')}`);
  }
});

/* Counted through the SHIPPED assignment function, not a rule of this test's
 * own devising.
 *
 * These tests used to match on `c.name || c.description` while the app assigns
 * on name plus field, and independently per sector rather than first-match-wins.
 * Both differences mattered. The description text is loose enough that three
 * courses the app could not place at all — two ground-handling certificates and
 * a computing degree — still matched something here, so the blind-spot guard
 * reported a clean register while the reader-facing table silently dropped them.
 * And independent matching double-counted: one geothermal drilling certificate
 * counted under mining and energy at once, which is how the mining gap note came
 * to claim three records for a sector that holds one.
 *
 * Compared by id, not by identity: SECTORS here is the shipped list merged with
 * this suite's QA fields, so every entry is a fresh object and `===` against
 * what sectorForCourse returns is false for all of them — which reads as "every
 * sector has zero coverage" rather than as a bug in the comparison. */
const routesIn = (sector) => COURSES.filter((c) => {
  const s = sectorForCourse(c);
  return s && s.id === sector.id;
});

test('every declared industry sector actually has catalogue coverage', () => {
  /* An undeclared absence is indistinguishable from a decision. A sector that
   * falls below its floor has to say what is missing, in writing. */
  for (const sector of SECTORS) {
    const hits = routesIn(sector);
    if (hits.length < sector.expect) {
      assert.ok(sector.gap && sector.gap.length > 20,
        `Sector '${sector.name}' has ${hits.length} records against a floor of ${sector.expect}, `
        + 'and declares no gap. Write down what is missing and why, or source it.');
    }
    assert.ok(hits.length > 0,
      `Sector '${sector.name}' has no catalogue coverage at all. Njia is telling learners this `
      + 'industry does not exist.');
  }
});

test('every sector names an awarding body, a fee regime and a source', () => {
  for (const sector of SECTORS) {
    assert.ok(sector.awardingBodies.length > 0,
      `${sector.name} names no awarding body — then nobody can check the qualification is real`);
    assert.ok(sector.feeRegimes.length > 0, `${sector.name} names no fee regime`);
    for (const regime of sector.feeRegimes) {
      assert.ok(FEE_REGIMES.includes(regime),
        `${sector.name} lists unknown fee regime '${regime}'`);
    }
    assert.ok(sector.source && sector.source.length > 10,
      `${sector.name} cites no source for its awarding bodies`);
  }
});

test('the sector register stays honest about what it covers', () => {
  const ids = SECTORS.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size, 'duplicate sector ids');
  /* Every course must be CLAIMED by a sector, through the same call the landing
   * table and the course detail make. A course nothing claims is invisible to
   * both — it silently drops out of the sector totals a reader is comparing
   * against national growth rates, and its detail page shows no economy block
   * at all. */
  const unclaimed = COURSES.filter((c) => !sectorForCourse(c));
  assert.equal(unclaimed.length, 0,
    `${unclaimed.length} courses are claimed by no sector, so the register cannot see them and `
    + 'neither can the reader: '
    + unclaimed.slice(0, 8).map((c) => `${c.id} "${c.name}"`).join('; '));

  /* The floor is a reader-facing rule, not just a QA one: below it the landing
   * table prints the raw count and refuses the percentage. If nothing is ever
   * below it the rule is dead code, and if everything is, the register is not
   * describing a catalogue. */
  const thin = SECTORS.filter((s) => routesIn(s).length < MIN_SECTOR_SAMPLE);
  assert.ok(thin.length > 0 && thin.length < SECTORS.length,
    'the minimum-sample rule now applies to every sector or to none — recheck MIN_SECTOR_SAMPLE');
});

test('the economy figures a reader sees are sourced, or absent', () => {
  /* Njia may not show a growth rate it did not source. KNBS activity
   * classifications do not map one-to-one onto training sectors, and the
   * tempting fix — borrowing the nearest series and not saying so — is the
   * exact failure this app exists to avoid. A sector either names an exact
   * series, names the broader series it is a component of, or shows nothing. */
  for (const sector of SECTORS) {
    assert.ok(sector.knbs && sector.knbs.series,
      `${sector.name} names no KNBS series, so a reader cannot check where its figure came from`);
    assert.ok(['exact', 'component', 'unsourced'].includes(sector.knbs.mapping),
      `${sector.name} declares mapping '${sector.knbs.mapping}', which is not one of exact/component/unsourced`);
    if (sector.knbs.mapping === 'unsourced') {
      assert.equal(sector.knbs.growth, undefined,
        `${sector.name} is declared unsourced but carries a growth figure anyway`);
      assert.equal(sectorPace(sector), null,
        `${sector.name} is declared unsourced but sectorPace still returns a reading for it`);
    } else {
      assert.equal(typeof sector.knbs.growth, 'number',
        `${sector.name} claims a '${sector.knbs.mapping}' mapping with no growth figure`);
    }
    /* The caveat is not optional. A growth rate rendered without it is the
     * number being used as a sales pitch — mining's 14.9% is a rebound off a
     * contraction in a mostly-informal sector, and a reader given the figure
     * alone has been misled by something true. */
    assert.ok(sector.caution && sector.caution.length > 40,
      `${sector.name} ships no caution. Every figure on this page renders its caution beside it.`);
  }
  assert.ok(ECONOMY.source.includes('KNBS'), 'the economy figures no longer cite KNBS');
  /* 87.2% of 822,100 is ~717,000, which is the other headline the same survey
   * produced. If these ever stop reconciling, the landing copy that explains
   * the two numbers as one becomes false. */
  const informal = Math.round(ECONOMY.newJobs * (ECONOMY.informalSharePct / 100));
  assert.ok(Math.abs((ECONOMY.newJobs - informal) - formalNewJobs()) < 100,
    `the formal/informal split does not reconcile: ${ECONOMY.newJobs} total less ${informal} informal `
    + `is ${ECONOMY.newJobs - informal}, but formalNewJobs() returns ${formalNewJobs()}`);
  assert.equal(ECONOMY.formalNewJobs, undefined,
    'the formal remainder is stored again rather than derived — it will drift from newJobs the '
    + 'next time either input is corrected, which is exactly how it first shipped 29 short');
});

/* ---------- What the badge claims versus what was checked ----------
 *
 * An audit found the Decide notice telling readers that 274 of 371 records had
 * "fees or terms cross-checked against a named public source", with a single
 * "✓ Verified estimate" badge on every one of them. Of those 274, exactly 22
 * carried a fee the institution itself publishes. 200 were derived from a
 * national fee rule and 52 had no fee at all — and those 52 rendered the
 * verification tick directly above the words "Not published".
 *
 * These tests hold the three states apart so they cannot silently re-merge.
 */
/* THE SHIPPED CLASSIFIER, EXTRACTED AND RUN — not a second copy of it.
 *
 * This file used to keep its own three-line reimplementation, and it drifted
 * exactly as you would expect: the copy collapsed everything non-verified into
 * 'estimate' while the shipped one had grown an 'unsourced' branch, so the
 * guard was checking the catalogue against a classifier the app had stopped
 * using. It went on passing while 51 of 412 records were unaccounted for on the
 * page it was supposed to be guarding.
 *
 * Reading the real function out of decide.js and running it costs a brace
 * match, and it is the only version of this test that can be true by
 * construction rather than by somebody remembering to update two places. */
function extractFn(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `decide.js no longer defines ${name}()`);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unbalanced braces reading ${name}() out of decide.js`);
}

const decideSource = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
const feeBasis = vm.runInNewContext(`${extractFn(decideSource, 'feeBasis')}; feeBasis`);

/* The five outcomes the app renders a badge for. Exhaustive by assertion
 * below, not by hope. */
const FEE_BASES = ['published', 'national', 'illustrative', 'unpublished', 'unsourced'];

test('every course lands in exactly one named fee basis', () => {
  /* THE GUARD THAT WAS MISSING.
   *
   * feeBasis had a fifth outcome, 'estimate', that wore no badge and appeared
   * in no total. 48 courses fell into it while displaying a precise tuition
   * figure — the whole Kenya Utalii diploma range at Ksh 180,000 among them,
   * the very records whose mispricing prompted this classification in the
   * first place. Nothing was wrong with any individual record; the note on
   * each explained itself. What was wrong was that the summary claimed to
   * describe the catalogue and described 88% of it. */
  /* assert.equal on a length, not deepEqual on an array. COURSES is built
   * inside a vm context, so anything .filter() returns carries that realm's
   * Array.prototype and deepStrictEqual rejects it against a local [] even when
   * both are empty — a failure that reads as "[] is not []" and says nothing
   * about the catalogue. */
  const stray = COURSES.filter((c) => !FEE_BASES.includes(feeBasis(c)))
    .map((c) => `${c.id} -> ${feeBasis(c)}`);
  assert.equal(stray.length, 0,
    'these courses classify to a basis the page has no badge and no total for, '
    + `so they render bare and go uncounted: ${stray.join(', ')}`);

  const counts = COURSES.reduce((a, c) => { a[feeBasis(c)] = (a[feeBasis(c)] || 0) + 1; return a; }, {});
  const summed = FEE_BASES.reduce((n, b) => n + (counts[b] || 0), 0);
  assert.equal(summed, COURSES.length,
    `the five bases sum to ${summed} but the catalogue holds ${COURSES.length}. `
    + 'Whatever the page says about "all N of them" is then false.');
});

test('the Decide notice reports every basis, over the catalogue and nothing else', () => {
  for (const basis of FEE_BASES) {
    assert.ok(decideSource.includes(`${basis}:`), `FEE_BASIS_BADGE has no entry for '${basis}'`);
  }
  /* The denominator. It read COURSES.length + FUNDING_SOURCES.length while
   * every numerator counted course fees, so 12 funding records padded the
   * bottom of a ratio they could never appear in the top of. */
  assert.ok(!/const totalCount = COURSES\.length \+ FUNDING_SOURCES\.length/.test(decideSource),
    'the fee-provenance denominator has gone back to mixing courses with funding sources');
  assert.match(decideSource, /const totalCount = COURSES\.length/,
    'the fee-provenance total must be counted over courses alone');
  for (const name of ['publishedCount', 'nationalCount', 'illustrativeCount', 'unpublishedCount', 'unsourcedCount']) {
    assert.ok(decideSource.includes(`\${${name}}`), `the notice no longer prints ${name}`);
  }
});

test('no record shows a verification badge above a fee it does not have', () => {
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const unpublished = COURSES.filter((c) => feeBasis(c) === 'unpublished');
  assert.ok(unpublished.length > 0, 'no unpublished-fee records — this guard is stale');
  assert.match(decide, /unpublished: ''/,
    `${unpublished.length} records publish no fee. They must render no badge: a tick above `
    + '"Not published" reads as a guarantee attached to a blank.');
  /* Illustrative records DO carry a badge now — they display a real figure, and
   * showing it bare was the defect. What they must never carry is a tick: the
   * tick is the app's strongest claim, reserved for a fee the college itself
   * publishes, and 48 courses reading "✓" over a price the college does not
   * quote would be a worse failure than the silence it replaced. */
  const illustrative = COURSES.filter((c) => feeBasis(c) === 'illustrative');
  assert.ok(illustrative.length > 0, 'no illustrative-fee records — this guard is stale');
  const badge = decide.slice(decide.indexOf('illustrative:'), decide.indexOf('illustrative:') + 400);
  assert.ok(!badge.includes('✓'),
    `${illustrative.length} courses show a sourced figure that is not the college's own price. `
    + 'Their badge must not use the verification tick.');
  assert.match(decide, /verified-badge-illustrative/,
    'illustrative records must render a badge of their own, not none at all');
});

test('the catalogue notice states the real split, not one flattering total', () => {
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  assert.ok(!/have fees or terms cross-checked against a named public source/.test(decide),
    'the notice has reverted to the single overstated total');
  for (const name of ['publishedCount', 'nationalCount', 'unpublishedCount']) {
    assert.ok(decide.includes(name), `the notice no longer reports ${name}`);
  }
});

test('both screens count verification the same way', () => {
  /* The landing page and the Decide notice made the identical overstatement in
   * identical words, because the claim was computed twice. */
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  assert.ok(!/records with fees or terms cross-checked against a named source/.test(app),
    'the landing page has reverted to the overstated verification claim');
  assert.match(app, /feeBasis\(c\) === 'published'/,
    'the landing page must derive its figure from feeBasis, not from the raw confidence flag');
});

test('headline counts never claim institutions the catalogue cannot send anyone to', () => {
  const withCourses = new Set(COURSES.map((c) => c.institution_id));
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const orphans = INSTITUTIONS.filter((i) => !withCourses.has(i.id));
  assert.ok(!/landing-numbers-figure">\$\{INSTITUTIONS\.length\}/.test(app),
    `${orphans.length} institutions have no course (${orphans.map((i) => i.id).join(', ')}), `
    + 'so INSTITUTIONS.length overstates what a reader can actually apply to');
  assert.ok(!/coverage-num num">\$\{INSTITUTIONS\.length\}/.test(decide),
    'the Decide coverage rail is counting institutions with no courses');
});

test('no description claims to be the only or first of its kind when it is not', () => {
  /* c324 said it was "the only seafaring programme in this catalogue" and was
   * made false in the same session by adding marine engineering and a deck
   * rating at Bandari. A uniqueness claim is a fact about the whole dataset
   * asserted inside one record, which is the most fragile shape a claim has. */
  const CLAIMS = [
    { pattern: /only seafaring programme/i, matches: /seafar|marine engineering|deck/i },
    { pattern: /only paramedic route/i, matches: /paramedic|emergency medical/i }
  ];
  for (const claim of CLAIMS) {
    const claimants = COURSES.filter((c) => claim.pattern.test(c.description || ''));
    if (!claimants.length) continue;
    const rivals = COURSES.filter((c) => claim.matches.test(c.name));
    assert.equal(rivals.length, 1,
      `${claimants[0].id} claims to be the only one of its kind, but ${rivals.length} records match: `
      + rivals.map((c) => `${c.id} "${c.name}"`).join('; '));
  }
});

test('no new record ships a fee with no citation at all', () => {
  /* 40 legacy records carry a precise figure — some as high as Ksh 720,000 —
   * with no verification_note whatsoever. They are surfaced to readers as "Fee
   * not confirmed" rather than quietly rendered like any other estimate. This
   * caps the debt: the number may fall as records are sourced, never rise.
   * If you are adding a course and this test fails, write the note. */
  const LEGACY_CEILING = 40;
  const unsourced = COURSES.filter((c) => c.total_fees_kes != null && !c.verification_note);
  assert.ok(unsourced.length <= LEGACY_CEILING,
    `${unsourced.length} records state a fee with no citation, above the legacy ceiling of `
    + `${LEGACY_CEILING}. New records must carry a verification_note. Offenders: `
    + unsourced.slice(0, 5).map((c) => `${c.id} "${c.name}" (Ksh ${c.total_fees_kes})`).join('; '));
  if (unsourced.length < LEGACY_CEILING) {
    console.log(`  note: unsourced fees down to ${unsourced.length}; lower LEGACY_CEILING to lock the gain.`);
  }
});

test('the unsourced state is surfaced rather than hidden', () => {
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  assert.match(decide, /unsourced: '<span class="verified-badge verified-badge-unsourced"/,
    'unsourced records must carry a visible caveat, not render like a reasoned estimate');
  assert.ok(!/unsourced:\s*'<span[^>]*>✓/.test(decide),
    'the unsourced badge must not use a tick — it is the opposite of a verification claim');
  assert.match(decide, /unsourcedCount/, 'the catalogue notice must report the unsourced count');
});

/* ---------- Bounded, even when uncited ----------
 *
 * 40 records state a precise fee with no citation. They are surfaced to readers
 * as "Fee not confirmed" and capped by the test above so the count can only
 * fall — but "we cannot cite it" and "we have not checked it is sane" are
 * different admissions, and only the first is forced on us by a blocked network.
 *
 * Every one of those 40 was audited for internal plausibility: annual-equivalent
 * cost against what its fee regime charges. All 40 passed. What follows turns
 * that one-off audit into a standing bound, so a figure that implies an absurd
 * year — a total mistaken for an annual rate, a digit dropped, a 5-year degree
 * priced like a term — fails before it reaches a reader.
 *
 * The bands are calibrated from the shipped data with deliberate headroom, not
 * invented. Measured annual-equivalents at the time of writing:
 *
 *   kmtc                 79,400 –  82,200   (a published national schedule)
 *   ttc_consolidated     67,189 –  67,189   (one government rate)
 *   tvet_consolidated    50,000 – 110,000
 *   tourism_corporation  82,500 –  90,000
 *   parastatal_own_rate  57,000 – 251,800
 *   private_own_rate     52,500 – 470,000
 *   public_university         0 – 144,000   (0 is the free OUK courses)
 *
 * A band that merely fenced today's data would fail on the next legitimate
 * record, so each is widened to the range the sector plausibly supports. The
 * point is to catch an order-of-magnitude error, not to freeze the catalogue.
 */
const ANNUAL_BANDS = {
  kmtc: [60000, 120000],
  ttc_consolidated: [40000, 120000],
  tvet_consolidated: [20000, 200000],
  tourism_corporation: [50000, 250000],
  parastatal_own_rate: [30000, 600000],
  private_own_rate: [30000, 900000],
  /* Floor is 0, not a positive number: the Open University's free courses are a
   * real, deliberate 0 and must not be mistaken for a missing value. The
   * distinction matters elsewhere too — see feeBasis in decide.js. */
  public_university: [0, 400000]
};

test('no fee implies an implausible year for its kind of institution', () => {
  for (const course of COURSES) {
    const inst = byId[course.institution_id];
    if (!inst || course.total_fees_kes == null) continue;
    const band = ANNUAL_BANDS[inst.fee_regime];
    assert.ok(band, `no annual band defined for fee regime '${inst.fee_regime}'`);
    const perYear = Math.round(course.total_fees_kes / (course.duration_months / 12));
    assert.ok(perYear >= band[0] && perYear <= band[1],
      `${course.id} "${course.name}" at ${inst.id} costs Ksh ${course.total_fees_kes} over `
      + `${course.duration_months} months — Ksh ${perYear}/year, outside the ${band[0]}–${band[1]} `
      + `band for a '${inst.fee_regime}' institution. Usually this means a course total was entered `
      + 'as an annual rate or the other way round. Fix the figure, or widen the band and say why.');
  }
});

test('every fee regime has an annual band, so none escapes the check', () => {
  /* A regime added without a band would silently skip the guard above, which is
   * how a check quietly stops covering the thing it was written for. */
  for (const regime of FEE_REGIMES) {
    assert.ok(ANNUAL_BANDS[regime], `fee regime '${regime}' has no annual plausibility band`);
  }
});
