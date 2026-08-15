/* Njia — the county provision analysis must not become a claim about Kenya.
 *
 * WHY THIS FILE EXISTS.
 *
 * /analysis/ publishes a table of 47 counties in which 23 rows read zero. That
 * is the most quotable artefact this project has ever produced and also the
 * most dangerous, because the zero means "Njia has not listed provision here"
 * and every reader's first instinct is to read it as "there is no provision
 * here". Those two sentences point at opposite actions. One is a worklist for
 * this repository; the other is an argument for defunding a college that
 * exists and is running.
 *
 * The page therefore carries the disclaimer in the first screen, in a bordered
 * block rather than a sentence in a paragraph, because this page will be
 * screenshotted into slide decks with the prose cropped off. This file fails
 * the build if that block goes, or if the meta description — which is what a
 * search result shows, and for many readers the only sentence they will read —
 * stops carrying it.
 *
 * THE OTHER FAILURE MODE IS ARITHMETIC THAT AGREES WITH ITSELF.
 *
 * The page states its headline figures in prose ("23 of Kenya's 47 counties",
 * "21 of those") and then prints a table those figures are supposed to
 * summarise. Nothing stops the prose being regenerated while a hand-edited
 * number stays behind, and a policy brief whose headline disagrees with its own
 * table is worse than one with no headline. So every figure asserted in the
 * text is recomputed here from data/courses.js and checked against what the
 * page actually says, rather than against what the generator believes it said.
 *
 * The eligibility ratchet in tests/sector-coverage.test.js guards the number
 * going the wrong way. This file guards the number being reported wrongly,
 * which is a different failure and was not previously covered anywhere.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { skipInCI } = require('./mtime-guard.js');

const root = path.join(__dirname, '..');
const { COURSES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));

const OUT = path.join(root, 'analysis');
const pagePath = path.join(OUT, 'index.html');
const csvPath = path.join(OUT, 'njia-county-provision.csv');

const GRADE_ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
const rank = (g) => (g == null ? GRADE_ORDER.length : GRADE_ORDER.indexOf(g));

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
const byCounty = new Map();
for (const c of COURSES) {
  const i = instById.get(c.institution_id);
  if (!i) continue;
  if (!byCounty.has(i.county)) byCounty.set(i.county, []);
  byCounty.get(i.county).push(c);
}
const truth = [...byCounty.entries()].map(([county, cs]) => ({
  county,
  courses: cs,
  atE: cs.filter((c) => rank('E') <= rank(c.min_grade)).length,
  atD: cs.filter((c) => rank('D') <= rank(c.min_grade)).length,
  artisan: cs.filter((c) => c.level === 'artisan').length
}));

const blindE = truth.filter((c) => c.atE === 0);
const blindD = truth.filter((c) => c.atD === 0);
const noArtisan = truth.filter((c) => c.artisan === 0);
const noArtisanSet = new Set(noArtisan.map((c) => c.county));
const blindNoTier = blindE.filter((c) => noArtisanSet.has(c.county));
const blindTierTooHigh = blindE.filter((c) => !noArtisanSet.has(c.county));

const exists = fs.existsSync(pagePath);
const page = exists ? fs.readFileSync(pagePath, 'utf8') : '';

test('the analysis exists in both formats', () => {
  for (const p of [pagePath, csvPath]) {
    assert.ok(fs.existsSync(p),
      `${path.relative(root, p)} is missing — run node tools/build-provision-analysis.mjs`);
  }
});

test('the analysis is not stale', skipInCI, () => {
  /* Same reasoning as the open-data staleness guard. A brief carrying last
     month's catalogue looks exactly as authoritative as a current one, and this
     one is designed to be printed and taken into a meeting where nobody can
     check it against the site. */
  const newest = Math.max(
    fs.statSync(path.join(root, 'data', 'courses.js')).mtimeMs,
    fs.statSync(path.join(root, 'data', 'institutions.js')).mtimeMs
  );
  for (const p of [pagePath, csvPath]) {
    assert.ok(fs.statSync(p).mtimeMs >= newest,
      `${path.basename(p)} is older than the catalogue it analyses — regenerate with `
      + 'node tools/build-provision-analysis.mjs');
  }
});

test('a zero is disclaimed as a fact about the catalogue, not about a county', () => {
  /* THE TEST THIS FILE IS FOR. The page shows 23 counties with a zero in the
     column that decides whether a school-leaver has anywhere to go. Read as a
     statement about Kenya it is false and damaging; read as a statement about
     this catalogue it is a worklist. Nothing but this paragraph separates the
     two, so nothing but a test keeps it there. */
  assert.match(page, /fact about this catalogue, not\s*about a county/i,
    'the analysis page no longer says that a zero describes the catalogue rather than the county. '
    + 'That sentence is the difference between a worklist and an argument for defunding a college '
    + 'that exists.');
  assert.match(page, /Every county in Kenya has public technical provision/i,
    'the page no longer states that every county has provision Njia may simply not have listed');
  assert.match(page, /<div class="limit">/,
    'the caveat is no longer in its own block. It was given a border and a background because '
    + 'this page gets screenshotted into slide decks with the surrounding prose cropped off.');
});

test('the meta description carries the caveat too', () => {
  /* For a large share of readers the search result IS the page. A description
     that says "23 counties list no course an E can enter" and stops has told
     them the false version and nothing else. */
  const m = page.match(/<meta name="description" content="([^"]+)"/);
  assert.ok(m, 'the analysis page has no meta description');
  assert.match(m[1], /Njia's catalogue|Njia has listed|not what each county runs/i,
    `the meta description states the finding without the qualification: "${m && m[1]}". `
    + 'This is the only sentence many readers will ever see.');
});

test('every headline figure in the prose matches the catalogue', () => {
  /* Recomputed from data/courses.js, not from the generator's own variables, so
     a hand-edit to the page or a drift in the rule shows up as a failure rather
     than as a brief that quietly disagrees with its own table. */
  const claims = [
    [`<strong>${blindE.length} of Kenya's 47 counties`, 'the count of counties with nothing reachable at E'],
    [`${blindNoTier.length} of those\n${blindE.length} list no artisan course at all`, 'the split between missing-tier and tier-above-E'],
    [`${noArtisan.length} counties list no artisan course`, 'the count of counties with no artisan provision']
  ];
  const wrong = claims.filter(([needle]) => !page.includes(needle)).map(([, what]) => what);
  assert.deepEqual(wrong, [],
    `the page's prose no longer states these correctly: ${wrong.join('; ')}. Expected `
    + `E-blind=${blindE.length}, of which no-artisan-tier=${blindNoTier.length} and `
    + `artisan-above-E=${blindTierTooHigh.length}; counties with no artisan course=${noArtisan.length}. `
    + 'Regenerate with node tools/build-provision-analysis.mjs.');
});

test('the stated totals agree with the table beneath them', () => {
  /* Added after the page shipped saying "144 institutions" while its own rows
     summed to 142 and the app's Decide rail also said 142. Two register entries
     carry no course, so INSTITUTIONS.length is not the catalogue size — and the
     figure a reader checks against is the one in the table, not the one in
     data/institutions.js.

     The headline-figure test above did not catch it because it named the three
     findings and stopped. Any number stated in prose has to be reconciled
     against the rows, not just the interesting ones. */
  const listed = new Set(
    COURSES.filter((c) => instById.has(c.institution_id)).map((c) => c.institution_id)
  );
  const courses = COURSES.filter((c) => instById.has(c.institution_id)).length;

  assert.match(page, new RegExp(`${listed.size}\\s*institutions`),
    `the page does not state ${listed.size} institutions — the number of institutions that actually `
    + `carry a course. data/institutions.js holds ${INSTITUTIONS.length} entries, but `
    + `${INSTITUTIONS.length - listed.size} of them have no course attached, so quoting the register `
    + "size makes the page's own total disagree with its own rows and with the app's Decide rail.");

  assert.ok(page.includes(`${courses} courses`) || page.includes(`of ${courses}`),
    `the page no longer states the catalogue size as ${courses} courses`);
});

test('the CSV agrees with the catalogue row for row', () => {
  const text = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  const header = text.shift().split(',');
  const rows = text.map((line) => {
    /* No quoted cells are expected here — county names and integers — but parse
       for them anyway rather than assume, because the assumption is exactly what
       would break silently if a county name ever gained a comma. */
    const cells = []; let cell = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) { if (ch === '"') { if (line[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += ch; }
      else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cell); cell = ''; }
      else cell += ch;
    }
    cells.push(cell);
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });

  assert.equal(rows.length, truth.length, `the CSV has ${rows.length} rows for ${truth.length} counties`);

  const byName = new Map(rows.map((r) => [r.county, r]));
  const wrong = [];
  for (const t of truth) {
    const r = byName.get(t.county);
    if (!r) { wrong.push(`${t.county} is missing from the CSV`); continue; }
    if (Number(r.courses) !== t.courses.length) wrong.push(`${t.county}.courses ${r.courses} != ${t.courses.length}`);
    if (Number(r.reachable_at_E) !== t.atE) wrong.push(`${t.county}.reachable_at_E ${r.reachable_at_E} != ${t.atE}`);
    if (Number(r.artisan) !== t.artisan) wrong.push(`${t.county}.artisan ${r.artisan} != ${t.artisan}`);
  }
  assert.deepEqual(wrong, [], `the CSV disagrees with the catalogue: ${wrong.slice(0, 6).join('; ')}`);
});

test('the analysis states what it does not measure', () => {
  /* Three absences that a reader will otherwise fill in for themselves, each in
     the flattering direction: that this is a census, that a published minimum is
     an absolute bar, and that the missing employment column is an oversight
     rather than a refusal to print a number Kenya does not publish. */
  assert.match(page, /not the TVETA register/i,
    'the page no longer says it is not a census of Kenyan provision');
  assert.match(page, /may admit below its published grade/i,
    'the page no longer notes that an institution may admit below its published minimum — '
    + 'a learner reading the E column as an absolute bar will not make the phone call');
  assert.match(page, /no employment rate and no salary column/i,
    'the page no longer explains that the missing employment figures are deliberate. '
    + 'An unexplained absence reads as an oversight and invites someone to fill it in.');
});

test('the analysis is reachable without JavaScript and from the sitemap', () => {
  /* Same rule as the county and grade pages: a link rendered client-side leaves
     the page unlinked to a crawler, and the audience for this one — a county
     education officer, a bursary committee — arrives by search. */
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /href="\.\/analysis\/"/,
    'index.html does not link to ./analysis/ in the served markup');
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes('/analysis/'),
    'sitemap.xml does not list /analysis/ — regenerate with node tools/build-static-pages.mjs');
});
