/* Njia — the dark scheme must reach the pages that have no JavaScript.
 *
 * WHY THIS FILE EXISTS.
 *
 * The app's dark scheme is keyed entirely to data-theme="dark", an attribute
 * an inline script in index.html stamps before first paint. That works for the
 * app and silently does not work for the 53 generated county and grade pages,
 * which carry no script on purpose. For as long as both have existed, a
 * learner opening a county page at night on a phone set to dark got cream.
 *
 * The fix is a mirrored block in css/styles.css under
 * @media (prefers-color-scheme: dark), keyed to :root:not([data-theme]).
 * Mirrors duplicate declarations, and duplicated declarations drift. The
 * drift is invisible in the place people look: a new dark rule added to the
 * app half would render correctly every time the author checked the app, and
 * be missing on 53 pages nobody opens in dark mode during development.
 *
 * So the guard is not "the mirror exists", it is "the mirror is complete and
 * identical". Those are different claims and only the second one is useful.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

/* Comments are stripped BEFORE any matching, not after.
 *
 * The first version of this guard scanned the raw stylesheet and immediately
 * failed on the explanatory comment introducing the mirror block, which names
 * the very selectors it is describing. The reflex is to reword the prose until
 * the test passes; that is backwards, because it leaves a scanner that reads
 * comments as code and makes the file's own documentation load-bearing. Strip
 * first, and prose can say whatever it needs to. */
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const DARK_PREFIX = ':root[data-theme="dark"]';
const MIRROR_PREFIX = ':root:not([data-theme])';

/* A brace-matching reader rather than a regex: several of these rules contain
   nested blocks and multi-line gradient values, and a non-greedy regex quietly
   truncates at the first inner brace it meets. */
function rulesStartingWith(source, prefix, from = 0, to = source.length) {
  const found = [];
  let at = from;
  while (true) {
    const start = source.indexOf(prefix, at);
    if (start === -1 || start >= to) break;
    const open = source.indexOf('{', start);
    if (open === -1) break;
    let depth = 0;
    let j = open;
    for (; j < source.length; j++) {
      if (source[j] === '{') depth++;
      else if (source[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    found.push({
      selector: source.slice(start, open).trim(),
      body: normalise(source.slice(open + 1, j))
    });
    at = j + 1;
  }
  return found;
}

/* Compare declarations, not formatting. The mirror is indented one level
   deeper because it sits inside a media query, and a whitespace-sensitive
   comparison would fail on that alone and teach everyone to ignore it. */
function normalise(body) {
  return body
    .split(';')
    .map((d) => d.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(';');
}

const mediaAt = css.indexOf('@media (prefers-color-scheme: dark)');

test('the no-JavaScript dark mirror exists at all', () => {
  assert.ok(mediaAt !== -1,
    'css/styles.css has no @media (prefers-color-scheme: dark) block — without it '
    + 'every generated page renders light regardless of the reader\'s system setting');
});

test('every data-theme="dark" rule has a twin in the mirror', () => {
  const appRules = rulesStartingWith(css, DARK_PREFIX, 0, mediaAt);
  const mirrored = rulesStartingWith(css, MIRROR_PREFIX, mediaAt);

  assert.ok(appRules.length > 0, 'no data-theme="dark" rules found — the selector moved');

  const mirrorBySelector = new Map(
    mirrored.map((r) => [r.selector.split(',').map((s) => s.trim()).join(','), r.body])
  );

  const missing = [];
  const differing = [];

  for (const rule of appRules) {
    /* Only the parts actually scoped to the dark attribute are mirrored — the
       .logo-mark rule is a list whose other parts are unconditional. */
    const scoped = rule.selector.split(',').map((s) => s.trim())
      .filter((s) => s.startsWith(DARK_PREFIX))
      .map((s) => s.replace(DARK_PREFIX, MIRROR_PREFIX));
    if (!scoped.length) continue;

    const key = scoped.join(',');
    if (!mirrorBySelector.has(key)) { missing.push(key); continue; }
    if (mirrorBySelector.get(key) !== rule.body) differing.push(key);
  }

  assert.deepEqual(missing, [],
    'these dark rules have no twin under prefers-color-scheme, so they apply in '
    + 'the app and not on the 53 generated pages');
  assert.deepEqual(differing, [],
    'these dark rules and their mirrors have drifted apart — the app and the '
    + 'generated pages would render different darks');
});

test('the mirror is keyed to no-attribute, never to not-light', () => {
  /* :not([data-theme="light"]) would ALSO match inside the app during the
     instant before the inline script runs, and on any future page that stamps
     a third value. :not([data-theme]) cannot match a stamped page at all,
     which is what makes this block provably unable to disturb the app's 32
     audited states. Keep it that way. */
  const block = css.slice(mediaAt);
  assert.ok(!block.includes(':not([data-theme="light"])'),
    'the mirror uses :not([data-theme="light"]), which can match inside the app — '
    + 'use :not([data-theme]) so it only ever reaches pages with no theme stamp');
});

test('the app still stamps a theme before first paint', () => {
  /* The safety argument above depends on this. If the inline stamp is ever
     removed, the mirror stops being app-neutral and this guard should be the
     thing that says so, rather than a reader discovering it. */
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(index, /dataset\.theme\s*=/,
    'index.html no longer stamps data-theme pre-paint — the prefers-color-scheme '
    + 'mirror was built on the assumption that the app always carries the attribute');
});
