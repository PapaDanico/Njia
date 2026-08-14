/* Colour-contrast invariants — run with `node --test tests/*.test.js`.
 *
 * These exist because the failure they guard against shipped. A count in the
 * results screen was dimmed to `opacity: 0.75` as a tasteful de-emphasis. It
 * composited to 3.84:1 against the card it sat on — under the 4.5:1 floor for
 * text that size — and the number dimmed was the evidence in the sentence, so
 * the least readable thing on the line was the part that made it true.
 *
 * Two things let it through, and both are worth naming because neither was a
 * missing test so much as a test that could not see:
 *
 *   1. Every contrast ratio this project has ever quoted — in commit messages,
 *      in pull requests, in review notes — was computed by a throwaway script
 *      that died with the session. Nothing in the repository had ever checked
 *      one, so every published figure was a claim rather than an assertion.
 *
 *   2. The axe sweep reports 28 clean states, but it navigates between pages
 *      without completing the questionnaire, so it had never once scanned the
 *      screen the diagnostic actually produces.
 *
 * This file closes the first hole and needs no browser to do it: the palette
 * is literal hex in two blocks of styles.css, and opacity compositing is
 * arithmetic. Checked against the real thing — the bug above recomputes here
 * as 3.85:1 where the browser measured 3.84:1.
 *
 * What it cannot do is know which colour lands on which surface at runtime;
 * that needs a browser and lives in tests/a11y-sweep.mjs, which is not part of
 * this suite. So the rule here is deliberately blunt: the palette must be safe
 * on every surface it could be used on, and anything that dims text has to be
 * declared and measured rather than merely looking tasteful.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');

/* ---------- WCAG 2.1 relative luminance and contrast ---------- */
const channels = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
/* Opacity composites in gamma space, which is why a 0.92 barely moves a ratio
 * and a 0.75 halves one. */
const composite = (fg, bg, alpha) => fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);

/* ---------- Palette ---------- */
const blockAfter = (marker) => {
  const at = css.indexOf(marker);
  assert.ok(at > -1, `styles.css no longer contains ${marker} — the palette moved`);
  const open = css.indexOf('{', at);
  const close = css.indexOf('\n}', open);
  return css.slice(open, close);
};
const hexTokens = (text) => {
  const out = {};
  for (const [, name, value] of text.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) out[name] = value;
  return out;
};
const LIGHT = hexTokens(blockAfter(':root {'));
const DARK = { ...LIGHT, ...hexTokens(blockAfter(':root[data-theme="dark"]')) };

/* Surfaces that text is actually set on. --bg-input is excluded deliberately
 * and not for convenience: despite the name it backs no input, only the three
 * bar tracks (.progress-track, .score-bar-track, .spread-bar), which carry no
 * text. --pink is excluded for the same kind of reason — it appears exactly
 * once in the stylesheet, inside a background gradient, and is never a colour. */
const TEXT_SURFACES = ['--bg', '--bg-elevated', '--bg-card'];
/* --plan-* joined this list the hard way. The Odyssey plan accents are text
 * colours that end in a number rather than in "ink", so the original pattern
 * skipped them, and when the palette moved they shipped at 4.44:1 and 4.33:1
 * with this suite green — axe found them, not the guard that exists to find
 * exactly this. A naming convention is not a category. */
const isInk = (name) => name !== '--pink'
  && (/ink$/.test(name) || /^--text-(primary|secondary|muted)$/.test(name) || /^--plan-life\d+$/.test(name));

test('the palette holds AA on every surface it can be used on, in both schemes', () => {
  for (const [scheme, tokens] of [['light', LIGHT], ['dark', DARK]]) {
    const inks = Object.keys(tokens).filter(isInk);
    assert.ok(inks.length >= 12, `${scheme}: only ${inks.length} ink tokens found — the palette parse is wrong`);
    for (const ink of inks) {
      for (const surface of TEXT_SURFACES) {
        assert.ok(tokens[surface], `${scheme}: ${surface} is missing`);
        const ratio = contrast(channels(tokens[ink]), channels(tokens[surface]));
        assert.ok(ratio >= 4.5,
          `${scheme}: ${ink} on ${surface} is ${ratio.toFixed(2)}:1, under the 4.5:1 floor`);
      }
    }
  }
});

test('the excluded tokens are excluded for the stated reason, not for convenience', () => {
  // If --pink ever becomes a text colour, or --bg-input ever backs text, the
  // exclusions above stop being true and this suite would be quietly lying.
  assert.equal((css.match(/color:\s*var\(--pink\)/g) || []).length, 0,
    '--pink is now used as a text colour and can no longer be excluded from the matrix');
  const inputUses = [...css.matchAll(/[^-\w]background:\s*var\(--bg-input\)/g)].length;
  assert.ok(inputUses > 0, '--bg-input is unused — the exclusion note is stale');
  assert.equal((css.match(/--bg-input[^;]*;\s*[^}]*color:/g) || []).length, 0,
    '--bg-input now sits under text and must join TEXT_SURFACES');
});

/* ---------- Dimmed text ----------
 *
 * Every `opacity` below 1 in the stylesheet has to be listed here with a
 * measured consequence. This is the guard the shipped bug would have tripped:
 * `.cluster-supply .num` was added with `opacity: 0.75` and no entry.
 *
 * The ratios are measured in a browser (tests/a11y-sweep.mjs prints them), not
 * assumed, because which colour lands on which surface is a runtime question.
 */
const DIMMED = [
  {
    selector: '.landing-nav-dropdown-btn .caret',
    opacity: 0.7,
    effective: { light: 4.11, dark: 6.25 },
    floor: 3.0,
    why: 'aria-hidden disclosure glyph. Not text for 1.4.3, but it is the only '
       + 'cue that the item opens a menu, so 1.4.11 non-text contrast applies at 3:1. '
       + 'Was 0.6 and composited to 2.89:1 on the old palette. Re-measured on the brand colours.'
  },
  {
    selector: '.btn:disabled',
    opacity: 0.5,
    effective: { light: null, dark: null },
    floor: 0,
    why: 'WCAG 1.4.3 exempts inactive user interface components from contrast '
       + 'requirements. A disabled control that looks disabled is the point.'
  },
  {
    selector: '.meta-value.is-estimate',
    opacity: 0.92,
    effective: { light: 10.41, dark: 12.94 },
    floor: 4.5,
    why: 'Real text. Measured well clear at both schemes — 0.92 barely moves a '
       + 'ratio that starts near 15:1.'
  }
];

test('every dimmed rule in the stylesheet is declared and measured', () => {
  const found = [...css.matchAll(/([^\n{}]+)\{[^}]*opacity:\s*(0?\.\d+)/g)]
    .map(([, sel, value]) => ({ selector: sel.trim().replace(/\s+/g, ' '), opacity: Number(value) }))
    // A rule that restores full opacity on hover/focus is not a dimming.
    .filter((r) => r.opacity < 1);

  for (const rule of found) {
    const declared = DIMMED.find((d) => rule.selector.includes(d.selector));
    assert.ok(declared,
      `"${rule.selector}" dims to ${rule.opacity} with no entry in DIMMED. Measure what it `
      + 'composites to before shipping it — this is exactly how a 3.84:1 count reached production.');
    assert.equal(rule.opacity, declared.opacity,
      `"${rule.selector}" is now ${rule.opacity}, but DIMMED records ${declared.opacity} and its measured ratios`);
  }

  for (const entry of DIMMED) {
    assert.ok(found.some((r) => r.selector.includes(entry.selector)),
      `DIMMED lists "${entry.selector}" but the stylesheet no longer dims it — drop the stale entry`);
    for (const [scheme, ratio] of Object.entries(entry.effective)) {
      if (ratio === null) continue;
      assert.ok(ratio >= entry.floor,
        `${entry.selector} measures ${ratio}:1 in ${scheme}, under its own ${entry.floor}:1 floor`);
    }
  }
});

/* The arithmetic above is only worth anything if it agrees with a browser.
 * These are the two numbers that were measured against the real thing. */
test('the compositing model reproduces the bug it exists to catch', () => {
  /* Re-measured in a browser when the palette moved to the supplied brand
   * colours: --text-secondary #5C3410 on --bg-card #EFDFC2. These numbers
   * come from getComputedStyle in Chromium, not from the model below —
   * pinning what the model itself computes would make this test circular
   * and it would agree with anything. */
  const secondary = channels(LIGHT['--text-secondary']);
  const card = channels(LIGHT['--bg-card']);
  assert.ok(Math.abs(contrast(secondary, card) - 8.19) < 0.05,
    'the undimmed ratio no longer matches the 8.19:1 measured in the browser');
  const dimmed = contrast(composite(secondary, card, 0.75), card);
  assert.ok(Math.abs(dimmed - 4.42) < 0.05,
    `the model computes ${dimmed.toFixed(2)}:1 where the browser measured 4.42:1 — `
    + 'the compositing math has drifted from what actually renders');
  assert.ok(dimmed < 4.5, 'the bug this file exists for no longer reproduces');
});
