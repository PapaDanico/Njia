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
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { skipInCI } = require('./mtime-guard.js');
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
/* Skipped in CI: git does not preserve mtimes, so this comparison has no
   information there. See tests/mtime-guard.js. */
test('the PNG icons are rebuilt whenever the source mark changes', skipInCI, () => {
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

/* EVERY RASTER OF THE MARK, NOT JUST THE FOUR IN icons/.
 *
 * The guard above covered the app icons and they were correct within minutes
 * of the mark being redrawn. icons/og-image.jpg was not covered and had no
 * generator at all — made once by hand and committed — so it kept the retired
 * shield. That is the single most visible surface Njia has: it is the picture
 * WhatsApp shows when a school-leaver forwards the link, which is how this app
 * actually spreads. The brand/ lockups were in the same position.
 *
 * The lesson is not "remember to rebuild". It is that an artefact with no
 * build step and no guard will drift, and the fix is to give it both. */
test('every generated raster of the mark is rebuilt when the mark changes', skipInCI, () => {
  const svgTime = fs.statSync(path.join(root, 'icons', 'logo-mark.svg')).mtimeMs;
  const derived = [
    'icons/og-image.jpg',
    'brand/lockup-stacked.png',
    'brand/lockup-stacked-dark.png',
    'brand/social-banner-16x9.png'
  ];
  const stale = derived.filter((f) => fs.statSync(path.join(root, f)).mtimeMs < svgTime);
  assert.deepEqual(stale, [],
    `these still render the previous mark: ${stale.join(', ')}. `
    + 'Run `node tools/build-og-image.mjs` and/or `node tools/build-brand-assets.mjs`. '
    + 'og-image.jpg is the one that matters most — it is what a shared link looks like.');
});

/* THE SHARE-CARD URL MUST MATCH THE BYTES IT POINTS AT.
 *
 * Social platforms cache a share card against its URL and keep it. That is why
 * rebuilding the card was not enough when the mark was redrawn: every link
 * already in circulation kept the old picture, and the only remedy on offer was
 * "re-scrape it in the Facebook debugger" — a manual step with no guard, that
 * nobody can verify worked, and that has to be remembered every single time.
 *
 * The URL now carries a content hash, so a changed card is a changed URL and
 * the platforms refetch on their own. That only holds while the hash in the
 * markup actually matches the file. A stale hash is worse than no hash: it
 * looks like cache-busting and busts nothing.
 */
test('the share-card URL carries the current hash of the share card', () => {
  const jpg = fs.readFileSync(path.join(root, 'icons', 'og-image.jpg'));
  const expected = crypto.createHash('sha256').update(jpg).digest('hex').slice(0, 10);

  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const refs = [...index.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"/g)]
    .map((m) => m[1]);
  assert.ok(refs.length >= 2, 'index.html no longer declares both og:image and twitter:image');

  for (const url of refs) {
    assert.ok(url.includes(`?v=${expected}`),
      `the share-card URL is ${url}, but icons/og-image.jpg hashes to ${expected}. `
      + 'Every link already shared points at a URL the platforms have cached against different '
      + 'bytes. Run `node tools/build-og-image.mjs`, then `node tools/build-static-pages.mjs`.');
  }

  /* All 54 generated pages must carry the same URL. One stale page is one
   * county whose shared links show the wrong card. */
  const stale = [];
  for (const dir of ['counties', 'grades']) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const sub of fs.readdirSync(base, { withFileTypes: true })) {
      const file = sub.isDirectory()
        ? path.join(base, sub.name, 'index.html')
        : path.join(base, sub.name);
      if (!file.endsWith('.html') || !fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf8');
      const m = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (m && !m[1].includes(`?v=${expected}`)) stale.push(path.relative(root, file));
    }
  }
  assert.deepEqual(stale.slice(0, 5), [],
    `these generated pages point at an outdated share card: ${stale.slice(0, 5).join(', ')}`
    + `${stale.length > 5 ? ` and ${stale.length - 5} more` : ''}. `
    + 'Run `node tools/build-static-pages.mjs`.');
});

test('the generators ship alongside the artefacts they generate', () => {
  /* A build step nobody can find is a build step nobody runs — and one that
   * never existed is why the share card went a rebrand out of date. */
  for (const [tool, what] of [
    ['build-icons.mjs', 'the PWA icons'],
    ['build-og-image.mjs', 'the link-share card'],
    ['build-brand-assets.mjs', 'the brand lockups and banner'],
    ['build-open-data.mjs', 'the CSV and JSON catalogue export'],
    ['build-provision-analysis.mjs', 'the county provision analysis and its CSV']
  ]) {
    assert.ok(fs.existsSync(path.join(root, 'tools', tool)),
      `tools/${tool} is gone, so ${what} can no longer be regenerated from the mark`);
  }
});

/* ---------- favicon.ico -------------------------------------------------
 *
 * The app's own tab was always fine: index.html declares an SVG favicon and a
 * PNG fallback. But /favicon.ico is requested by PATH rather than by link —
 * Google and most crawlers and link-preview services fetch that exact address
 * to decide what icon sits beside a search result — and it 404'd. Njia has
 * 57 URLs in its sitemap; every one of those results rendered with a blank
 * icon.
 *
 * It is also the asset most likely to rot unnoticed, because nothing in the
 * app ever loads it. Hence a guard that checks the bytes, not the filename. */
test('favicon.ico exists and is a real, well-formed icon', () => {
  const ico = path.join(root, 'favicon.ico');
  assert.ok(fs.existsSync(ico), 'favicon.ico is missing — run node tools/build-icons.mjs');

  const d = fs.readFileSync(ico);
  assert.equal(d.readUInt16LE(0), 0, 'ICO reserved field is not 0');
  assert.equal(d.readUInt16LE(2), 1, 'ICO type is not 1 (icon)');

  const count = d.readUInt16LE(4);
  assert.ok(count >= 3, `favicon.ico holds ${count} sizes; 16, 32 and 48 are the ones that get used`);

  const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  let end = 0;
  for (let i = 0; i < count; i++) {
    const e = 6 + i * 16;
    const declared = d.readUInt8(e) || 256;
    const size = d.readUInt32LE(e + 8);
    const offset = d.readUInt32LE(e + 12);
    const payload = d.subarray(offset, offset + size);

    assert.ok(payload.subarray(0, 8).equals(PNG_MAGIC),
      `entry ${i} is not a PNG payload — the packer wrote something malformed`);
    /* The IHDR dimensions must match what the directory entry claims. A
       mismatch is the classic way a hand-packed ICO renders as nothing at all
       while still looking like a valid file. */
    assert.equal(payload.readUInt32BE(16), declared,
      `entry ${i} declares ${declared}px but the PNG is ${payload.readUInt32BE(16)}px wide`);
    assert.equal(payload.readUInt32BE(20), declared,
      `entry ${i} declares ${declared}px but the PNG is ${payload.readUInt32BE(20)}px tall`);
    end = Math.max(end, offset + size);
  }
  assert.equal(end, d.length, 'favicon.ico is truncated or has trailing junk');
});

test('favicon.ico is not older than the mark it is drawn from', skipInCI, () => {
  const svg = fs.statSync(path.join(root, 'icons', 'logo-mark.svg')).mtimeMs;
  const ico = fs.statSync(path.join(root, 'favicon.ico')).mtimeMs;
  assert.ok(ico >= svg,
    'favicon.ico predates icons/logo-mark.svg. Nothing in the app loads it, so a stale '
    + 'one shows the retired brand in search results indefinitely — regenerate with '
    + 'node tools/build-icons.mjs');
});

test('every page offers an icon a browser without SVG support can use', () => {
  /* The 54 generated pages declared ONLY the SVG favicon. A browser that does
     not support SVG favicons — older Android WebView, several in-app browsers,
     which is precisely this audience's hardware — got no icon at all on them,
     while the app itself was fine. Same shape as the dark-scheme gap: the app
     is not the whole site. */
  const pages = [path.join(root, 'index.html'), path.join(root, 'open-data', 'index.html')];
  for (const dir of ['counties', 'grades']) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const e of fs.readdirSync(base, { withFileTypes: true })) {
      pages.push(e.isDirectory() ? path.join(base, e.name, 'index.html') : path.join(base, e.name));
    }
  }
  const bare = pages.filter((p) => fs.existsSync(p) && p.endsWith('.html'))
    .filter((p) => !/rel="icon"[^>]*\.(png|ico)"/.test(fs.readFileSync(p, 'utf8')))
    .map((p) => path.relative(root, p));
  assert.deepEqual(bare, [],
    `these pages declare only an SVG favicon, so a browser without SVG-favicon support shows `
    + `nothing: ${bare.slice(0, 6).join(', ')}`);
});
