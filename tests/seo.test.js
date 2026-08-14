/* WHAT THE STATIC COUNTY PAGES HAVE TO KEEP BEING.
 *
 * Njia is a single-page app, so for a long time a crawler saw under a thousand
 * characters of chrome and a sitemap with one URL in it. Netlify Analytics
 * showed what that cost: over thirty days the top locations for a product built
 * for Kenyan school-leavers were the United States and Canada — developer
 * traffic, Lighthouse runs and crawlers, not readers. Lighthouse scored SEO 100
 * throughout, because markup hygiene was never the problem. There was simply
 * nothing to rank for "TVET courses in Turkana".
 *
 * The county pages exist to be that something. These tests hold the two
 * properties that make them worth having and not worth punishing:
 *
 *   1. They stay in step with the data. A page listing courses the catalogue
 *      no longer has is worse than no page.
 *   2. They stay real content rather than doorways — every page carries its
 *      county's actual table and says plainly when nothing in that county is
 *      open to a low-grade learner.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { COURSES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const countiesDir = path.join(root, 'counties');

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
const counties = [...new Set(COURSES.map((c) => instById.get(c.institution_id))
  .filter(Boolean).map((i) => i.county))].sort();

test('every county with courses has a generated page, and no page is an orphan', () => {
  const missing = counties.filter((c) => !fs.existsSync(path.join(countiesDir, slug(c), 'index.html')));
  assert.deepEqual(missing, [],
    `these counties have courses but no page: ${missing.join(', ')}. `
    + 'Run `node tools/build-county-pages.mjs`.');

  const onDisk = fs.readdirSync(countiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const expected = counties.map(slug).sort();
  const stray = onDisk.filter((d) => !expected.includes(d));
  assert.deepEqual(stray, [],
    `these county pages describe counties the catalogue no longer covers: ${stray.join(', ')}`);
});

test('county pages are rebuilt when the catalogue changes', () => {
  /* Same blunt mtime instrument as the icon guard, for the same reason: it
   * needs no parsing and it fails in the situation that actually happens —
   * somebody edits the data and forgets the generator. A stale page publishes
   * a course list that is wrong to a reader arriving from a search engine. */
  const newest = Math.max(
    fs.statSync(path.join(root, 'data', 'courses.js')).mtimeMs,
    fs.statSync(path.join(root, 'data', 'institutions.js')).mtimeMs
  );
  const stale = counties
    .filter((c) => fs.statSync(path.join(countiesDir, slug(c), 'index.html')).mtimeMs < newest)
    .slice(0, 6);
  assert.deepEqual(stale, [],
    `these county pages are older than the data they describe: ${stale.join(', ')}${stale.length === 6 ? ' …' : ''}. `
    + 'Run `node tools/build-county-pages.mjs`.');
});

test('each county page carries that county\'s real courses, not a stub', () => {
  for (const county of counties) {
    const html = fs.readFileSync(path.join(countiesDir, slug(county), 'index.html'), 'utf8');
    const rows = COURSES.filter((c) => (instById.get(c.institution_id) || {}).county === county);

    /* Every course, by name. A doorway page would carry the county name and a
     * link; this one has to carry the thing the reader came for. */
    const absent = rows.filter((c) => !html.includes(c.name.replace(/&/g, '&amp;'))).map((c) => c.id);
    assert.deepEqual(absent, [],
      `${county} page is missing courses it should list: ${absent.join(', ')}`);

    assert.ok(html.includes(`Courses in ${county} County`), `${county} page has lost its heading`);
    assert.match(html, /<table[\s\S]*<\/table>/, `${county} page has no course table`);
  }
});

test('a county that fails its lowest-scoring learners says so on the page', () => {
  /* The pages must not read as a sales sheet. Where a county's lowest entry
   * requirement is above D-, the page tells the reader outright that nothing
   * on it is open to them and points them at the TVETA register — the same
   * honesty the app applies to a missing fee. */
  const ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const rank = (g) => (g == null ? ORDER.length : ORDER.indexOf(g));

  for (const county of counties) {
    const rows = COURSES.filter((c) => (instById.get(c.institution_id) || {}).county === county);
    const reachable = rows.some((c) => rank('E') <= rank(c.min_grade));
    if (reachable) continue;

    const html = fs.readFileSync(path.join(countiesDir, slug(county), 'index.html'), 'utf8');
    assert.match(html, /nothing on this page is open to you/,
      `${county} has no course an E-grade learner can enter, and the page does not say so. `
      + 'A page that lists only courses the reader cannot apply for, without saying that, '
      + 'is a doorway page.');
    assert.match(html, /TVETA register/,
      `${county} page tells the reader nothing is open to them without pointing anywhere useful`);
  }
});

test('the sitemap is generated from the pages that exist', () => {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(xml, /GENERATED by tools\/build-county-pages\.mjs/,
    'sitemap.xml has been hand-edited again — 49 URLs maintained by hand is a list that goes stale');

  for (const county of counties) {
    assert.ok(xml.includes(`/counties/${slug(county)}/`),
      `sitemap.xml does not list ${county}, so it will not be crawled`);
  }
  assert.ok(xml.includes('<loc>https://njiacareerpathways.work/</loc>'),
    'the sitemap no longer lists the app itself');

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(new Set(locs).size, locs.length, 'the sitemap lists a URL twice');
  for (const loc of locs) {
    assert.ok(loc.startsWith('https://njiacareerpathways.work/'),
      `sitemap URL does not use the canonical domain: ${loc}`);
  }
});

test('county pages load their assets from whatever host serves them', () => {
  /* Absolute asset URLs looked tidy and meant every deploy preview rendered
   * unstyled, because the stylesheet was fetched from the production domain
   * rather than the host under review. Canonical and the social tags are the
   * only things that genuinely need the real address. */
  const html = fs.readFileSync(path.join(countiesDir, slug(counties[0]), 'index.html'), 'utf8');
  assert.match(html, /href="\/css\/styles\.css"/,
    'the stylesheet is not root-relative, so these pages render unstyled anywhere but production');
  assert.match(html, /<link rel="canonical" href="https:\/\/njiacareerpathways\.work\//,
    'the canonical must name the real address');
  assert.ok(!/href="https:\/\/njiacareerpathways\.work\/css\//.test(html),
    'an absolute stylesheet URL is back');
});

test('the app links to the county pages, so they are not an island', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(index, /\/counties\//,
    'nothing in the app links to /counties/, which leaves 48 pages with no internal links — '
    + 'the pattern search engines read as a doorway farm rather than part of the site');
});
