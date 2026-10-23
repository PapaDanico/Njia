// Contrast gate (docs/DESIGN.md principle 4). Every text token is measured
// against every ground it can sit on, in both schemes, and fails under
// WCAG AA 4.5:1. Ported in spirit from UsalamaSMS scripts/check-brand.mjs.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');

function block(selector) {
  const i = css.indexOf(selector + ' {');
  assert.ok(i >= 0, `${selector} not found`);
  const j = css.indexOf('\n}', i);
  const tokens = {};
  for (const m of css.slice(i, j).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[m[1]] = m[2];
  return tokens;
}

function lum(hex) {
  const c = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const TEXT = ['text-primary', 'text-secondary', 'text-muted', 'primary', 'accent-ink',
  'success-ink', 'warn-ink', 'danger-ink'];
const GROUNDS = ['bg', 'bg-elevated', 'bg-card'];

const light = block(':root');
const dark = { ...light, ...block(':root[data-theme="dark"]') };

for (const [scheme, t] of [['light', light], ['dark', dark]]) {
  test(`text tokens clear 4.5:1 on every ground (${scheme})`, () => {
    const fails = [];
    for (const fg of TEXT) for (const bg of GROUNDS) {
      if (!t[fg] || !t[bg]) continue;
      const r = ratio(t[fg], t[bg]);
      if (r < 4.5) fails.push(`--${fg} ${t[fg]} on --${bg} ${t[bg]}: ${r.toFixed(2)}:1`);
    }
    assert.deepStrictEqual(fails, [], fails.join('\n'));
  });
}

test('white on the primary fill clears 4.5:1 (buttons)', () => {
  assert.ok(ratio(light['on-fill'], light.primary) >= 4.5);
});
