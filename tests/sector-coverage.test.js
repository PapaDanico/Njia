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
      assert.ok(/publishes no fee|no fee structure|does not publish|no figure is shown/i.test(note),
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
