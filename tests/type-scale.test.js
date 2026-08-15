/* Njia — the type scale, and the floor underneath it.
 *
 * WHY THIS FILE EXISTS.
 *
 * An audit of css/styles.css counted NINETEEN distinct sub-1rem font sizes:
 * 0.6, 0.65, 0.66, 0.68, 0.7, 0.72, 0.74, 0.75, 0.76, 0.78, 0.8, 0.8125, 0.82,
 * 0.85, 0.86, 0.88, 0.9, 0.92 and 0.95rem. Several of those are within a third
 * of a pixel of each other on screen. That is not a decision repeated nineteen
 * times, it is a decision never made — each value was chosen to make one
 * component look right, and none of them knew about the others.
 *
 * Seven of the nineteen rendered below 12px. The smallest carried real content
 * at 9.6px.
 *
 * WHY NO EXISTING TEST CAUGHT IT.
 *
 * All 56 axe states pass, and passed throughout. Contrast is fine, semantics
 * are fine, and there is no automated accessibility rule that asks whether
 * text is simply too small to read comfortably — WCAG governs contrast and
 * resize behaviour, not a minimum size. So this survived every sweep and every
 * deploy while being one of the clearest failures against the standard Njia
 * says it holds itself to.
 *
 * It matters for this audience specifically. Njia's readers are on cheap
 * Android phones, frequently outdoors in bright light, and a real share of the
 * adult-learner audience the app deliberately courts is over forty. 9.6px is
 * not a density choice for those readers, it is an exclusion — and it is the
 * same category of mistake as an entry grade recorded a tier too high: it
 * removes the information from the person least able to work around it.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

/* Comments stripped before matching. This file's own explanatory prose lists
   every banned value by name, and a scanner that reads comments would fail on
   the documentation describing what it forbids — a trap this repository has
   now walked into three separate times. */
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const STEPS = ['--fs-xs', '--fs-sm', '--fs-md', '--fs-lg'];

test('the small end of the scale is defined as tokens', () => {
  for (const step of STEPS) {
    assert.match(css, new RegExp(`${step}:\\s*[\\d.]+rem`),
      `${step} is not defined — the small type scale has been dismantled`);
  }
});

test('the floor is 12px and nothing is defined below it', () => {
  const m = css.match(/--fs-xs:\s*([\d.]+)rem/);
  assert.ok(m, '--fs-xs is missing');
  const px = parseFloat(m[1]) * 16;
  assert.ok(px >= 12,
    `--fs-xs is ${px}px. 12px is the floor: below it the label, badge and table `
    + 'furniture this step is used for stops being readable on a cheap phone in '
    + 'daylight, which is the device and the light Njia is actually read in.');
});

test('no rule sets a font-size below the floor by hand', () => {
  /* The failure mode is not someone lowering the token — it is someone adding
     `font-size: 0.7rem` to one new component because it looked right in that
     one place, which is exactly how the nineteen accumulated. */
  const offenders = [];
  for (const m of css.matchAll(/font-size:\s*([\d.]+)rem/g)) {
    const px = parseFloat(m[1]) * 16;
    if (px < 12) offenders.push(`${m[1]}rem (${px}px)`);
  }
  assert.deepEqual(offenders, [],
    `these hand-written font sizes render below the 12px floor: ${offenders.join(', ')}. `
    + 'Use one of the tokens instead — and if none of them fits, the answer is almost '
    + 'never a twentieth size.');
});

test('the scale stays a scale', () => {
  /* A cap on how many distinct hand-written sub-1rem sizes may exist at all.
     Set at zero deliberately: every one of them now has a token, so any new
     literal is a new step being introduced by accident. */
  const literals = new Set(
    [...css.matchAll(/font-size:\s*(0\.\d+)rem/g)].map((m) => m[1])
  );
  assert.deepEqual([...literals], [],
    `${literals.size} hand-written sub-1rem font sizes are back in the stylesheet `
    + `(${[...literals].join(', ')}). They were collapsed onto four tokens; adding `
    + 'literals alongside them is how the original nineteen happened.');
});

test('radii go through the token scale too', () => {
  /* Same shape of defect, smaller: the four radius tokens already existed and
     were already used nearly everywhere, and six declarations quietly bypassed
     them. 999px stays literal because a pill is not a step on a scale. */
  const literals = new Set(
    [...css.matchAll(/border-radius:\s*([\d.]+(?:px|rem))/g)].map((m) => m[1])
      .filter((v) => v !== '999px')
  );
  assert.deepEqual([...literals], [],
    `these border-radius values bypass the token scale: ${[...literals].join(', ')}`);
});
