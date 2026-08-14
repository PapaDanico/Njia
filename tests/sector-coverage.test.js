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
const { SECTORS, FEE_REGIMES, DERIVATION_SIGNATURES } = require('./sector-register.js');

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

test('every declared industry sector actually has catalogue coverage', () => {
  /* An undeclared absence is indistinguishable from a decision. A sector that
   * falls below its floor has to say what is missing, in writing. */
  for (const sector of SECTORS) {
    const hits = COURSES.filter((c) => sector.match.test(c.name) || sector.match.test(c.description || ''));
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
  /* Every course should fall into at least one sector. A course nothing matches
   * means the register has a blind spot, which is the failure mode this whole
   * file exists to prevent. */
  const unmatched = COURSES.filter((c) =>
    !SECTORS.some((s) => s.match.test(c.name) || s.match.test(c.description || '')));
  assert.ok(unmatched.length === 0,
    `${unmatched.length} courses match no declared sector, so the register cannot see them: `
    + unmatched.slice(0, 8).map((c) => `${c.id} "${c.name}"`).join('; '));
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
const feeBasis = (course) => {
  if (course.fees_confidence !== 'verified') return 'estimate';
  if (course.total_fees_kes == null) return 'unpublished';
  return /derived from|scaled to course duration|multiplied out by course length|pro-rated/i
    .test(course.verification_note || '') ? 'national' : 'published';
};

test('the fee-basis classifier agrees with the one the app ships', () => {
  /* If decide.js and this file drift apart, the notice starts quoting numbers
   * that no longer describe the badges beside it. */
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  assert.match(decide, /function feeBasis\(course\)/, 'decide.js no longer defines feeBasis');
  assert.match(decide, /derived from\|scaled to course duration\|multiplied out by course length\|pro-rated/,
    'the derivation pattern in decide.js has changed but this test still uses the old one');
  for (const state of ['published', 'national', 'unpublished', 'estimate']) {
    assert.ok(decide.includes(`${state}:`), `FEE_BASIS_BADGE has no entry for '${state}'`);
  }
});

test('no record shows a verification badge above a fee it does not have', () => {
  const decide = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
  const unpublished = COURSES.filter((c) => feeBasis(c) === 'unpublished');
  assert.ok(unpublished.length > 0, 'no unpublished-fee records — this guard is stale');
  assert.match(decide, /unpublished: ''/,
    `${unpublished.length} records publish no fee. They must render no badge: a tick above `
    + '"Not published" reads as a guarantee attached to a blank.');
  assert.match(decide, /estimate: ''/, 'illustrative records must not carry a verification badge');
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
