/* Stale prose and orphaned assets.
 *
 * This is the failure mode that has cost this project the most, because nothing
 * about it looks like a bug. The code runs, the tests pass, the page renders —
 * and the words on it describe something that no longer exists.
 *
 * The ones that actually shipped:
 *
 *   - Copy ending "no figure marked est. has been measured", rendering the est.
 *     badge inline as an example, months after the employment rates it labelled
 *     were removed rather than labelled. The sentence pointed at a marker that
 *     appeared nowhere in the app.
 *   - `.est-mark` CSS for that badge, still styled, never emitted.
 *   - A share-card generator whose card had been deleted.
 *   - icons/logo-mark-72.png, referenced by nothing. A guard that scans source
 *     for broken references cannot see an orphan: the reference is what is
 *     missing, so there is nothing to scan.
 *   - A footer sources line naming datasets that had moved.
 *   - c324 claiming to be "the only seafaring programme in this catalogue"
 *     while two more sat at Bandari — written and invalidated inside one
 *     session.
 *
 * Two directions, and both are needed. Reference-to-file catches a link to
 * something deleted. File-to-reference catches something kept after its last
 * user went away. Only the first is a broken link; the second is dead weight
 * shipped to a reader on metered mobile data.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const SOURCE_FILES = [
  'index.html', 'manifest.json', 'sw.js', 'css/styles.css',
  ...fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`),
  ...fs.readdirSync(path.join(root, 'data')).filter((f) => f.endsWith('.js')).map((f) => `data/${f}`)
];
const ALL_SOURCE = SOURCE_FILES.map(read).join('\n');

test('every asset on disk is referenced by something that ships', () => {
  /* The direction a source-scanning guard cannot see. logo-mark-72.png sat in
   * icons/ for weeks after its last reference went away, and shipped to every
   * user who installed the app. */
  const assets = fs.readdirSync(path.join(root, 'icons'));
  const orphans = assets.filter((file) => !ALL_SOURCE.includes(file));
  assert.deepEqual(orphans, [],
    `these files are in icons/ but referenced nowhere: ${orphans.join(', ')}. Either wire them up `
    + 'or delete them — an unreferenced asset is bytes shipped to someone paying for mobile data.');
});

test('every asset referenced by the app exists on disk', () => {
  const referenced = new Set();
  for (const [, ref] of ALL_SOURCE.matchAll(/['"(]\.{0,2}\/?((?:icons|css|js|data)\/[\w.-]+\.\w+)['")]/g)) {
    referenced.add(ref);
  }
  const missing = [...referenced].filter((ref) => !fs.existsSync(path.join(root, ref)));
  assert.deepEqual(missing, [], `referenced but not on disk: ${missing.join(', ')}`);
});

test('the service worker caches every shipped script and nothing that is gone', () => {
  /* A stale CACHE_ASSETS entry makes install() reject outright — cache.addAll
   * is all-or-nothing — so the app silently stops working offline for everyone
   * who installs it after the deploy. */
  const sw = read('sw.js');
  const cached = [...sw.matchAll(/'\.\/([\w./-]+)'/g)].map((m) => m[1]).filter((p) => p.includes('.'));
  for (const asset of cached) {
    assert.ok(fs.existsSync(path.join(root, asset)),
      `sw.js caches './${asset}', which does not exist. cache.addAll rejects as a unit, so this `
      + 'breaks offline install for every user, not just this file.');
  }
  const html = read('index.html');
  for (const [, src] of html.matchAll(/<script[^>]+src="\.\/((?:js|data)\/[\w.-]+\.js)"/g)) {
    assert.ok(cached.includes(src),
      `index.html loads ${src} but sw.js does not cache it — the app would break offline`);
  }
});

test('no CSS class is styled that nothing ever emits', () => {
  /* .est-mark outlived the badge it styled. Scoped to the distinctive class
   * names this project owns, since a generic utility may legitimately be
   * unused, and checked against markup rather than against the stylesheet. */
  const css = read('css/styles.css');
  const markup = SOURCE_FILES.filter((f) => f !== 'css/styles.css').map(read).join('\n');
  const OWNED = /^\.(est-mark|share-card|verified-badge[\w-]*|data-disclaimer[\w-]*|coverage-[\w-]+|module-rail|brand-rule|cluster-supply|landing-numbers-[\w-]+|plan-life\d+|feas-[\w-]+|match-why[\w-]*|fee-provenance|odyssey-tab)$/;
  const declared = new Set();
  for (const [, selector] of css.matchAll(/^\s*(\.[\w-]+)(?=[\s,{:.])/gm)) declared.add(selector);
  /* Class names are not always written out in full. `feas-${feas.level}`
   * composes .feas-within, .feas-stretch and .feas-over at runtime, and a
   * literal substring search calls all three dead. So a class also counts as
   * emitted when its prefix appears immediately before a template hole —
   * checking the stem rather than demanding the whole name. */
  const emitted = (selector) => {
    const name = selector.slice(1);
    if (markup.includes(name)) return true;
    for (let cut = name.length - 1; cut > 2; cut -= 1) {
      if (markup.includes(`${name.slice(0, cut)}\${`)) return true;
    }
    return false;
  };
  const dead = [...declared].filter((s) => OWNED.test(s)).filter((s) => !emitted(s));
  assert.deepEqual(dead, [],
    `styled but never emitted: ${dead.join(', ')}. This is how .est-mark survived the badge it `
    + 'described. Delete the rule or emit the class.');
});

test('prose claims about the dataset match the dataset', () => {
  /* Copy that quotes a fact about the data has to be checkable against the
   * data, or it becomes a claim nobody re-reads. */
  const ctx = vm.createContext({});
  for (const file of ['institutions.js', 'courses.js']) {
    vm.runInContext(read(`data/${file}`), ctx);
  }
  const COURSES = vm.runInContext('COURSES', ctx);
  const INSTITUTIONS = vm.runInContext('INSTITUTIONS', ctx);
  const prose = [read('js/decide.js'), read('js/app.js'), read('index.html')].join('\n');

  /* Counts must be computed, never typed. A literal that happens to be right
   * today is a literal that is wrong after the next data change. */
  for (const [, literal] of prose.matchAll(/>(\d{3,4}) (?:courses|programmes|institutions)</g)) {
    assert.fail(`hard-coded dataset count "${literal}" found in markup — compute it from the data`);
  }

  /* Uniqueness claims: a statement about the whole dataset asserted inside one
   * record, which is the most fragile shape a claim can take. */
  const uniqueness = COURSES.filter((c) => /\bthe only\b/i.test(c.description || ''));
  for (const course of uniqueness) {
    const subject = (course.description.match(/the only ([\w\s]+?) (?:route|programme|option)/i) || [])[1];
    if (!subject) continue;
    const word = subject.trim().split(/\s+/)[0];
    const rivals = COURSES.filter((c) => new RegExp(word, 'i').test(c.name));
    assert.ok(rivals.length <= 1,
      `${course.id} claims to be "the only ${subject}", but ${rivals.length} records match "${word}": `
      + rivals.map((c) => `${c.id} "${c.name}"`).join('; '));
  }

  assert.ok(INSTITUTIONS.length > 0 && COURSES.length > 0, 'the dataset failed to load');
});

test('the service worker cache version was bumped for this change', () => {
  /* Network-first for app code, so a missed bump is not fatal — but icons are
   * cache-first and the install manifest is versioned, so a deploy that reuses
   * a version leaves installed users on stale icons indefinitely. */
  const sw = read('sw.js');
  const [, version] = sw.match(/CACHE_VERSION = 'njia-v(\d+)'/) || [];
  assert.ok(version, 'CACHE_VERSION is missing or no longer matches njia-vN');
  assert.ok(Number(version) >= 96,
    `CACHE_VERSION is njia-v${version}, behind the last known deploy. Bump it every deploy that `
    + 'changes a cached file.');
});

/* THE ICONS MUST NOT BE OLDER THAN THE MARK THEY RENDER.
 *
 * The brand mark was redrawn, icons/logo-mark.svg was updated, and the four
 * PNGs were not. Nothing caught it for a day, because the SVG favicon is only
 * used by browsers that prefer it: a desktop tab showed the new shield while
 * every PWA install, every apple-touch-icon and every PNG fallback showed the
 * previous logo — an orange "Y" on navy, a shape and a colour that are not in
 * this palette at all. Someone who installed Njia had a home-screen icon from
 * a brand that no longer existed, and the app looked abandoned rather than
 * rebranded.
 *
 * mtime is a blunt instrument and deliberately so: it needs no image decoding,
 * no dependency, and it fails in exactly the situation that actually occurs —
 * somebody edits the SVG and forgets to run tools/build-icons.mjs. A false
 * positive costs one command; the false negative shipped.
 *
 * If this fails: node tools/build-icons.mjs, then bump CACHE_VERSION in sw.js,
 * because the icons are served cache-first.
 */
test('the PNG icons are rebuilt whenever the source mark changes', () => {
  const svg = path.join(root, 'icons', 'logo-mark.svg');
  const svgTime = fs.statSync(svg).mtimeMs;
  const derived = [
    'icon-192x192.png', 'icon-512x512.png',
    'icon-maskable-192.png', 'icon-maskable-512.png'
  ];
  const stale = derived.filter((f) => fs.statSync(path.join(root, 'icons', f)).mtimeMs < svgTime);
  assert.deepEqual(stale, [],
    `these icons are older than icons/logo-mark.svg, so they still render the previous mark: `
    + `${stale.join(', ')}. Run \`node tools/build-icons.mjs\` and bump CACHE_VERSION in sw.js.`);
});

test('the icon generator ships alongside the icons it generates', () => {
  /* A build step nobody can find is a build step nobody runs. */
  assert.ok(fs.existsSync(path.join(root, 'tools', 'build-icons.mjs')),
    'tools/build-icons.mjs is gone, so the icons above can no longer be regenerated from the mark');
});
