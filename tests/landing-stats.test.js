/* Njia — the landing page's figures are precomputed, so they must be provably
 * identical to the live ones.
 *
 * WHY THIS FILE EXISTS.
 *
 * The landing page used to count its own numbers from the whole catalogue at
 * render time, deliberately: a hardcoded 469 goes stale the next time a course
 * is added, silently, on the most-read page on the domain. That instinct was
 * right and it cost 86.3KB gzipped on the critical path — data/courses.js,
 * data/institutions.js and js/decide.js — to display eight integers on a page
 * that shows no course. Measured over a gzipping server on throttled 3G,
 * DOMContentLoaded fell from 5,635ms to 3,693ms once they came off it.
 *
 * data/landing-stats.js is the trade, and this file is what makes the trade
 * safe. Every field is recomputed here from data/courses.js, data/institutions.js
 * and data/sectors.js, with the fee groups classified by feeBasis() read out of
 * js/decide.js — the same extraction the generator uses and the same one
 * tools/build-open-data.mjs uses. If the generated file has drifted by so much
 * as one course, the build fails.
 *
 * So the property the original live computation had is kept: the figures cannot
 * silently go stale. They simply are not counted on a reader's phone.
 *
 * NOT AN mtime GUARD. Those compare timestamps and carry no information in CI,
 * where git stamps every file with the moment it wrote it. This compares the
 * values themselves, which is strictly stronger and has no false positive — the
 * same reasoning as the artefacts job in .github/workflows/node.js.yml.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const { COURSES, DISTINCT_PROGRAMMES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));
const { SECTORS, sectorForCourse } = require(path.join(root, 'data', 'sectors.js'));

const statsPath = path.join(root, 'data', 'landing-stats.js');

function extractFn(source, name) {
  const at = source.indexOf(`function ${name}(`);
  if (at === -1) throw new Error(`${name}() not found in decide.js`);
  let depth = 0;
  for (let i = source.indexOf('{', at); i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(at, i + 1);
    }
  }
  throw new Error(`unbalanced braces reading ${name}() out of decide.js`);
}
const decideSource = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
const feeBasis = vm.runInNewContext(`${extractFn(decideSource, 'feeBasis')}; feeBasis`);

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
const listed = new Set(COURSES.filter((c) => instById.has(c.institution_id)).map((c) => c.institution_id));

const expected = {
  courses: COURSES.length,
  distinctProgrammes: DISTINCT_PROGRAMMES,
  institutions: listed.size,
  counties: new Set([...listed].map((id) => instById.get(id).county)).size,
  published: COURSES.filter((c) => feeBasis(c) === 'published').length,
  derived: COURSES.filter((c) => feeBasis(c) === 'derived').length
};

test('the generated landing stats exist', () => {
  assert.ok(fs.existsSync(statsPath),
    'data/landing-stats.js is missing — run node tools/build-landing-stats.mjs. Without it the '
    + 'landing page renders "undefined" where every one of its figures should be.');
});

test('every landing figure matches a live recount of the catalogue', () => {
  const { LANDING_STATS } = require(statsPath);
  const wrong = Object.entries(expected)
    .filter(([k, v]) => LANDING_STATS[k] !== v)
    .map(([k, v]) => `${k}: file says ${LANDING_STATS[k]}, catalogue says ${v}`);
  assert.deepEqual(wrong, [],
    `data/landing-stats.js has drifted from the catalogue:\n  ${wrong.join('\n  ')}\n`
    + 'Run node tools/build-landing-stats.mjs. These figures are the landing page\'s entire '
    + 'factual claim about what Njia contains.');
});

test('every sector route count matches a live recount', () => {
  /* 19 sectors matched against 469 course names is 8,911 regex tests to render
     a 19-row table, which is the other reason this moved to build time. The
     rule still lives in sectorForCourse(); the generator calls it rather than
     carrying a second copy of the matching. */
  const { LANDING_STATS } = require(statsPath);
  const wrong = SECTORS
    .map((s) => [s.id, COURSES.filter((c) => sectorForCourse(c)?.id === s.id).length])
    .filter(([id, n]) => LANDING_STATS.sectorRoutes[id] !== n)
    .map(([id, n]) => `${id}: file says ${LANDING_STATS.sectorRoutes[id]}, catalogue says ${n}`);
  assert.deepEqual(wrong, [],
    `sector route counts have drifted:\n  ${wrong.join('\n  ')}\nRun node tools/build-landing-stats.mjs.`);

  const stray = Object.keys(LANDING_STATS.sectorRoutes)
    .filter((id) => !SECTORS.some((s) => s.id === id));
  assert.deepEqual(stray, [],
    `landing-stats.js counts sectors that no longer exist: ${stray.join(', ')}`);
});

test('the catalogue is off the landing page\'s critical path', () => {
  /* The point of the whole change, and the thing most likely to be undone by
     someone adding a feature to the landing page and reaching for COURSES.
     If you need catalogue detail on the landing page, add a field to
     landing-stats.js — do not put 565KB back in front of first render. */
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const src of ['./data/courses.js', './data/institutions.js', './js/decide.js']) {
    assert.ok(!html.includes(`<script defer src="${src}">`),
      `index.html loads ${src} eagerly again. That is 86.3KB gzipped back on the critical path, `
      + 'and measured on throttled 3G it is about 1.9 seconds of DOMContentLoaded. Whatever needs '
      + 'it on the landing page should be a precomputed field in data/landing-stats.js instead.');
  }
  assert.ok(html.includes('<script defer src="./data/landing-stats.js">'),
    'index.html no longer loads data/landing-stats.js, so every landing figure renders undefined');
});

test('the service worker still precaches everything the app needs offline', () => {
  /* Making the catalogue lazy must not make it optional. The modules are
     injected at runtime, so nothing in the served HTML references them any
     more — CACHE_ASSETS is now the only thing guaranteeing an installed app
     still works on a train. */
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  for (const asset of ['./data/landing-stats.js', './data/courses.js', './data/institutions.js', './js/decide.js']) {
    assert.ok(sw.includes(`'${asset}'`),
      `sw.js no longer precaches ${asset}. Since it is no longer in index.html either, an installed `
      + 'app would have no copy of it at all and Decide would fail offline.');
  }
});

test('every page module declares the cross-module symbols it actually uses', () => {
  /* THE MISTAKE THIS CATCHES HAS NOW BEEN MADE TWICE.
   *
   * First: deferring js/decide.js while app.js still called feeBasis() from it,
   * which threw "feeBasis is not defined" on every load. Second, in this very
   * change: listing only the data files for Discover while js/discover.js sorts
   * report suggestions by GRADE_ORDER and filters by meetsGradeRequirement(),
   * both defined in decide.js — "GRADE_ORDER is not defined" on the results
   * screen. Both times the unit suite was green and the functional probe caught
   * it, because only the probe executes the page.
   *
   * A probe check catches the instance. This catches the class: it reads the
   * top-level declarations out of js/decide.js, finds which page modules
   * reference them, and requires PAGE_MODULE to list decide.js for those pages.
   * Same for COURSES and INSTITUTIONS against their data files.
   *
   * Deliberately textual rather than a real dependency graph. These are classic
   * scripts sharing a global scope with no import statements to read, so a
   * word-boundary search over the source is the available signal — and it errs
   * toward requiring a dependency that might be unnecessary, which costs a
   * cached file, rather than missing one, which is a ReferenceError in a
   * reader's face. */
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  const block = app.match(/const PAGE_MODULE = \{[\s\S]*?\n\};/);
  assert.ok(block, 'PAGE_MODULE is no longer declared as an object literal in js/app.js');

  const declared = {};
  for (const m of block[0].matchAll(/^\s{2}(\w+):\s*\[([^\]]*)\]/gm)) {
    declared[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  }
  assert.ok(Object.keys(declared).length >= 6,
    `only parsed ${Object.keys(declared).length} PAGE_MODULE entries — the literal's shape changed`);

  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const decideSymbols = [...strip(decideSource)
    .matchAll(/^(?:function|const|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);

  const PROVIDERS = [
    { file: 'js/decide.js', symbols: decideSymbols },
    { file: 'data/courses.js', symbols: ['COURSES', 'DISTINCT_PROGRAMMES'] },
    { file: 'data/institutions.js', symbols: ['INSTITUTIONS'] }
  ];

  const missing = [];
  for (const [page, scripts] of Object.entries(declared)) {
    const own = `js/${page}.js`;
    if (!fs.existsSync(path.join(root, own))) continue;
    const source = strip(fs.readFileSync(path.join(root, own), 'utf8'));
    for (const provider of PROVIDERS) {
      if (provider.file === own) continue;
      const used = provider.symbols.filter((s) => new RegExp(`\\b${s}\\b`).test(source));
      if (used.length && !scripts.includes(provider.file)) {
        missing.push(`${page} uses ${used.slice(0, 3).join(', ')}${used.length > 3 ? ` (+${used.length - 3})` : ''}`
          + ` from ${provider.file}, which PAGE_MODULE.${page} does not load`);
      }
    }
    /* Order matters as much as presence: a module evaluating a global at load
       time — decide.js builds its county list at module scope — throws if its
       data file is injected after it, and async=false makes that order the
       execution order. */
    for (const provider of PROVIDERS) {
      const i = scripts.indexOf(provider.file);
      const j = scripts.indexOf(own);
      if (i !== -1 && j !== -1 && i > j) {
        missing.push(`PAGE_MODULE.${page} lists ${provider.file} AFTER ${own}; `
          + 'injected scripts execute in insertion order, so the module runs before its data exists');
      }
    }
  }
  assert.deepEqual(missing, [],
    `page modules are missing dependencies they reference:\n  ${missing.join('\n  ')}\n`
    + 'This is a ReferenceError on the reader\'s screen, not a slow load.');
});
