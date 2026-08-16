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
const { skipInCI } = require('./mtime-guard.js');

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
    + 'Run `node tools/build-static-pages.mjs`.');

  const onDisk = fs.readdirSync(countiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const expected = counties.map(slug).sort();
  const stray = onDisk.filter((d) => !expected.includes(d));
  assert.deepEqual(stray, [],
    `these county pages describe counties the catalogue no longer covers: ${stray.join(', ')}`);
});

test('county pages are rebuilt when the catalogue changes', skipInCI, () => {
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
    + 'Run `node tools/build-static-pages.mjs`.');
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


/* GRADE PAGES — same rules, plus the one that only applies to them.
 *
 * "What can I do with a D+?" is the question this audience actually types, and
 * the pages exist to answer it. The failure mode is different from the county
 * pages: a page per grade for A, A-, B+ and B would each list 429-436 of 436
 * courses, which is the same page four times. That is duplicate content and
 * the doorway pattern by another route, so pages are only generated where the
 * grade genuinely narrows the catalogue.
 */
const GRADE_SLUG = {
  'C+': 'c-plus', C: 'c-plain', 'C-': 'c-minus',
  'D+': 'd-plus', D: 'd-plain', 'D-': 'd-minus', E: 'e'
};
const GRADE_PAGE_MAX_SHARE = 0.85;
const gradesDir = path.join(root, 'grades');
const ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
const gradeRank = (g) => (g == null ? ORDER.length : ORDER.indexOf(g));
const reachableAt = (g) => COURSES.filter((c) => gradeRank(g) <= gradeRank(c.min_grade));

test('a grade page exists exactly where the grade narrows the catalogue', () => {
  for (const [grade, dir] of Object.entries(GRADE_SLUG)) {
    const share = reachableAt(grade).length / COURSES.length;
    const exists = fs.existsSync(path.join(gradesDir, dir, 'index.html'));
    if (share > GRADE_PAGE_MAX_SHARE) {
      assert.ok(!exists,
        `a page exists for ${grade}, which reaches ${Math.round(share * 100)}% of the catalogue. `
        + 'That is near-identical to the full list and to every other high grade — duplicate '
        + 'content, which is the doorway pattern the county pages were built to avoid.');
    } else {
      assert.ok(exists,
        `${grade} reaches only ${Math.round(share * 100)}% of the catalogue but has no page. `
        + 'Run `node tools/build-static-pages.mjs`.');
    }
  }
  assert.ok(fs.existsSync(path.join(gradesDir, 'index.html')), 'the grades index is missing');
});

test('each grade page lists only courses that grade can actually enter', () => {
  /* The whole promise of the page. One course above the reader's grade on a
   * page titled "courses you can do with a D" is the same betrayal as an
   * invented fee: it looks like an answer and it is not. */
  const instById2 = new Map(INSTITUTIONS.map((i) => [i.id, i]));
  for (const [grade, dir] of Object.entries(GRADE_SLUG)) {
    const file = path.join(gradesDir, dir, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');

    /* Matched on the ROW, not the course name. Five institutions run a
     * "Bachelor of Science in Nursing" at B, B, C, C+ and C+; a name-only
     * check flagged the C page for listing the B ones when it was correctly
     * listing only the C one. The identity of a course here is
     * (name, institution), which is what the row carries. */
    const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
    const listed = (c) => {
      const i = instById2.get(c.institution_id);
      const name = c.name.replace(/&/g, '&amp;');
      const who = i.name.replace(/&/g, '&amp;');
      return rows.some((r) => r.includes(`>${name}</th>`) && r.includes(`>${who}</td>`));
    };

    const unreachable = COURSES
      .filter((c) => gradeRank(grade) > gradeRank(c.min_grade))
      .filter((c) => instById2.get(c.institution_id))
      .filter(listed);
    assert.deepEqual(unreachable.map((c) => `${c.id} (${c.min_grade})`), [],
      `the ${grade} page lists courses a ${grade} learner cannot enter`);

    const expected = reachableAt(grade).filter((c) => instById2.get(c.institution_id));
    const missing = expected.filter((c) => !listed(c)).map((c) => c.id);
    assert.deepEqual(missing, [], `the ${grade} page is missing courses it should list: ${missing.join(', ')}`);
  }
});

test('grade pages are rebuilt when the catalogue changes', skipInCI, () => {
  const newest = Math.max(
    fs.statSync(path.join(root, 'data', 'courses.js')).mtimeMs,
    fs.statSync(path.join(root, 'data', 'institutions.js')).mtimeMs
  );
  const stale = Object.values(GRADE_SLUG)
    .filter((d) => fs.existsSync(path.join(gradesDir, d, 'index.html')))
    .filter((d) => fs.statSync(path.join(gradesDir, d, 'index.html')).mtimeMs < newest);
  assert.deepEqual(stale, [],
    `these grade pages are older than the data they describe: ${stale.join(', ')}. `
    + 'Run `node tools/build-static-pages.mjs`.');
});

test('every grade page tells the reader TVET takes any grade', () => {
  /* The single most useful fact for someone who scored badly, and the reason
   * a low grade is not the end of the cycle. It belongs on the page they land
   * on, not three clicks into the app. */
  for (const dir of Object.values(GRADE_SLUG)) {
    const file = path.join(gradesDir, dir, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /any KCSE grade, A to E/,
      `the ${dir} page does not tell the reader TVET placement accepts any grade`);
    assert.match(html, /2000 onward/,
      `the ${dir} page does not say the door is open to earlier KCSE cohorts`);
  }
});

test('the sitemap is generated from the pages that exist', () => {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(xml, /GENERATED by tools\/build-static-pages\.mjs/,
    'sitemap.xml has been hand-edited again — 56 URLs maintained by hand is a list that goes stale');

  for (const county of counties) {
    assert.ok(xml.includes(`/counties/${slug(county)}/`),
      `sitemap.xml does not list ${county}, so it will not be crawled`);
  }
  assert.ok(xml.includes('<loc>https://njiacareerpathways.work/</loc>'),
    'the sitemap no longer lists the app itself');
  assert.ok(xml.includes('/grades/'), 'the sitemap does not list the grade pages');
  for (const [grade, dir] of Object.entries(GRADE_SLUG)) {
    if (!fs.existsSync(path.join(gradesDir, dir, 'index.html'))) continue;
    assert.ok(xml.includes(`/grades/${dir}/`), `sitemap.xml does not list the ${grade} page`);
  }

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
  assert.match(index, /\/grades\//,
    'nothing in the app links to /grades/, which leaves the grade pages unlinked to a crawler');
  assert.match(index, /\/counties\//,
    'nothing in the app links to /counties/, which leaves 48 pages with no internal links — '
    + 'the pattern search engines read as a doorway farm rather than part of the site');
});

test('every printable sheet carries the branded header', () => {
  /* The print header started as a county-only thing, so the sheet a CAREER
     TEACHER prints came off the printer unbranded, undated and with no address
     on it while the county officer's sheet was a proper brief. That is
     backwards — the teacher's copy is the one photocopied for a whole Form Four
     class, so it is most likely to reach someone who has never heard of Njia
     and needs to know where the numbers came from. */
  const pages = [
    ...fs.readdirSync(countiesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => path.join(countiesDir, e.name, 'index.html')),
    ...fs.readdirSync(gradesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => path.join(gradesDir, e.name, 'index.html'))
  ];
  const missing = pages.filter((p) => !/<div class="brief-head">/.test(fs.readFileSync(p, 'utf8')))
    .map((p) => path.relative(path.join(__dirname, '..'), p));
  assert.deepEqual(missing, [],
    `these pages print with no Njia header, date or address: ${missing.join(', ')}`);
});

test('every printable sheet is dated', () => {
  /* SPLIT OUT OF THE TEST ABOVE, WHICH FAILED ITS OWN FAILURE MESSAGE.
     That test says a page without the header prints with "no Njia header, date
     or address" — and then checks only that the header div exists. The header
     existed on all 53 pages and carried no date on any of them, so the guard
     passed while claiming to cover exactly what was missing. Found by
     print-emulating the pages and searching the rendered text for a date, which
     came back empty on county and analysis alike.

     Why it matters more here than on screen: these sheets are printed and
     carried away — photocopied for a Form Four class, taken into a bursary
     committee. The catalogue has gone 436 to 463 to 469 courses in months, so
     every figure on the sheet has a shelf life, and an undated copy from last
     year is indistinguishable from one printed this morning.

     Matches the long form the generator emits (16 August 2026) rather than an
     ISO string, because the reader is a person holding paper. */
  const dated = /\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d\b/;
  const pages = [
    ...fs.readdirSync(countiesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => path.join(countiesDir, e.name, 'index.html')),
    ...fs.readdirSync(gradesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => path.join(gradesDir, e.name, 'index.html')),
    path.join(__dirname, '..', 'analysis', 'index.html')
  ];
  /* .brief-meta rather than the whole .brief-head: the header nests several
     divs and an inline SVG, so a non-greedy match on the outer block closes at
     the first nested </div> and never reaches the line the date is on. That is
     how the first version of this guard reported all 54 pages undated when
     every one of them was correct. .brief-meta contains only <strong> and <br>,
     so the non-greedy match is exact there. */
  const undated = pages.filter((p) => {
    const meta = fs.readFileSync(p, 'utf8').match(/<div class="brief-meta">[\s\S]*?<\/div>/);
    return !meta || !dated.test(meta[0]);
  }).map((p) => path.relative(path.join(__dirname, '..'), p));
  assert.deepEqual(undated, [],
    `these printable sheets carry no date in their brief header: ${undated.slice(0, 5).join(', ')}`
    + `${undated.length > 5 ? ` (+${undated.length - 5} more)` : ''}. Regenerate with `
    + 'node tools/build-static-pages.mjs and node tools/build-provision-analysis.mjs.');
});

test('no grade sheet says "a E"', () => {
  /* GRADE_ARTICLE exists precisely for this and I hardcoded "a" in the print
     header anyway, which produced "What a E can study" on the sheet aimed at
     the readers with the fewest options. It reads as a typo to exactly the
     person it is for. */
  const bad = fs.readdirSync(gradesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(gradesDir, e.name, 'index.html'))
    .filter((p) => /\ba E\b/.test(fs.readFileSync(p, 'utf8')))
    .map((p) => path.basename(path.dirname(p)));
  assert.deepEqual(bad, [], `these grade pages contain "a E" instead of "an E": ${bad.join(', ')}`);
});

test('every published surface is reachable without JavaScript, from the sitemap, and from llms.txt', () => {
  /* ONE LIST, BECAUSE FIVE SCATTERED CHECKS IS HOW THE FIFTH ONE SHIPPED.
   *
   * "It works in the app and is absent from everything else" has now happened
   * five times in this repository — dark mode, the accessibility sweep, the
   * favicon, the print header, and the partnership proposal. The proposal was
   * linked from exactly one place: a footer link js/app.js draws client-side.
   * Not in the served index.html, not in the 53 generated pages, not in
   * sitemap.xml, not in llms.txt, with no landing page of its own. Its audience
   * is a funder or a ministry contact, and both arrive by search or by a
   * forwarded link — the two routes that cannot run JavaScript.
   *
   * There were already three guards for exactly this, one each in
   * open-data.test.js, provision-analysis.test.js and this file, each written
   * when its own surface shipped. That is the flaw: a per-surface guard has to
   * be remembered by the person adding the next surface, which is precisely the
   * thing that keeps not happening. This is a list. Add a surface, add a line,
   * and all three properties are checked at once.
   *
   * llms.txt is included because it is what ChatGPT Search, Perplexity, Gemini
   * and Claude read, and a surface missing from it is invisible to every answer
   * engine while looking perfectly fine in a browser. */
  const SURFACES = ['./counties/', './grades/', './open-data/', './analysis/', './docs/'];
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  const llms = fs.readFileSync(path.join(__dirname, '..', 'llms.txt'), 'utf8');

  const missing = [];
  for (const surface of SURFACES) {
    const bare = surface.replace('./', '/');
    if (!html.includes(`href="${surface}"`)) missing.push(`${surface} is not linked in the served index.html`);
    if (!xml.includes(`${bare}<`)) missing.push(`${surface} is not in sitemap.xml`);
    if (!llms.includes(bare)) missing.push(`${surface} is not named in llms.txt`);
  }
  assert.deepEqual(missing, [],
    `published surfaces are unreachable to something that does not run JavaScript:\n  ${missing.join('\n  ')}\n`
    + 'Regenerate with node tools/build-static-pages.mjs then node tools/build-structured-data.mjs, '
    + 'and add the link to the <noscript> block in index.html by hand.');
});
