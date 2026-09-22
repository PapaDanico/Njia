/* Njia — the standing-instructions document is data too, and it drifts.
 *
 * WHY THIS FILE EXISTS.
 *
 * CLAUDE.md is the first thing anyone working here reads, and by the time this
 * guard was written it was quoting 469 courses against a catalogue of 664, a
 * unit suite of 270 against 283, an institution register of 149 against 164,
 * and "twenty counties remain" three hundred lines above another paragraph in
 * the same file saying sixteen. Every one of those figures was true when it was
 * typed. None had anything watching it.
 *
 * That is the file's own rule turned on itself: "every coverage question with a
 * guard is answered; every one without is drifting." A document that instructs
 * people with stale numbers instructs them wrongly, and the specific failure it
 * invites is the one the file already warns about under /open-data/ — quoting a
 * figure from earlier in the session instead of re-measuring.
 *
 * WHAT THIS MEASURES, AND WHAT IT DELIBERATELY DOES NOT.
 *
 * Only figures that can be recomputed from the repository. The catalogue size
 * where CLAUDE.md asserts it, and the blind-county count against the ratchet
 * constant that actually governs it. Prose figures that record what something
 * WAS at the time of an incident are left alone on purpose — "it was 23", "40,
 * then 19, then zero", "56 states passed while text sat at 9.6px" are history,
 * and rewriting history to match the present is how you lose the lesson.
 *
 * So the rule for adding to this guard: assert a number only where the sentence
 * around it is a claim about the CURRENT state of the repository.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const DOC = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/courses.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/institutions.js'), 'utf8'), ctx);
const { COURSES, INSTITUTIONS } = vm.runInContext('({ COURSES, INSTITUTIONS })', ctx);

/* Each entry is a sentence CLAUDE.md asserts about the present, with the value
 * it should carry. The template must match exactly once — a claim that appears
 * twice is itself a drift risk, because someone will update one copy. */
const LIVE_CLAIMS = [];

/* The catalogue size USED to be pinned here, in two sentences, and every insert
 * then had to hand-edit both or the build went red. That is the institution
 * register's mistake repeated: a figure that moves every pass, stated as a
 * present-tense claim. The file's own rule covers it - "where a number will
 * keep moving, stop stating it" - so the sentences now describe the property
 * and this guard defends the ABSENCE of a pinned value, exactly as the
 * register one below does. */
test('CLAUDE.md does not pin a catalogue size that moves every pass', () => {
  const offenders = [
    /publishes all ([\d,]+) courses as CSV/,
    /\*\*every one\*\* of the ([\d,]+) notes/,
  ].map((re) => DOC.match(re)).filter(Boolean);
  assert.equal(offenders.length, 0,
    `CLAUDE.md pins the catalogue at ${offenders.map((o) => o[1]).join(' and ')}; it is now `
    + `${COURSES.length} and will move again. Describe the property rather than the count.`);
});

test('CLAUDE.md agrees with the ratchet on how many counties are blind to an E', () => {
  /* The constant in sector-coverage.test.js is what actually fails a build, so
   * it is the source of truth and the prose is what must follow it. */
  const suite = fs.readFileSync(path.join(ROOT, 'tests/sector-coverage.test.js'), 'utf8');
  const m = suite.match(/const E_GRADE_BLIND_COUNTIES = (\d+);/);
  assert.ok(m, 'E_GRADE_BLIND_COUNTIES is no longer declared where this guard looks for it.');
  const n = Number(m[1]);

  const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

  /* Two live claims, in two different sections, and they have disagreed with
   * each other before. */
  const remaining = DOC.match(/([A-Z][a-z]+) remain(?:s)? — lower the constant/);
  assert.ok(remaining, 'The "N remain — lower the constant" sentence has moved or gone.');
  assert.equal(remaining[1], WORDS[n],
    `CLAUDE.md says "${remaining[1]} remain" while E_GRADE_BLIND_COUNTIES is ${n} `
    + `(${WORDS[n]}). The constant is what fails a build; the prose must follow it.`);

  const finding = DOC.match(/\*\*(\d+) counties list nothing an E-grade leaver can enter/);
  assert.ok(finding, 'The /analysis/ finding sentence has moved or gone.');
  assert.equal(Number(finding[1]), n,
    `The /analysis/ paragraph in CLAUDE.md says ${finding[1]} blind counties while the `
    + `ratchet is at ${n}. /analysis/ itself is generated and correct; this is the copy.`);
});

test('CLAUDE.md does not quote an institution register that has moved on', () => {
  /* The register grew from 149 to 164 while a sentence in CLAUDE.md still said
   * "agree at 149" as a present-tense claim. The fix was to stop stating the
   * number there at all, so this guard defends the absence rather than a value:
   * any bare "agree at <number>" is the pattern coming back. */
  const offender = DOC.match(/agree at (\d+)\./);
  assert.equal(offender, null,
    `CLAUDE.md pins the institution register at ${offender && offender[1]}; it is now `
    + `${INSTITUTIONS.length} and will move again. State that the two counts must agree, `
    + 'not what they agree at.');
});
