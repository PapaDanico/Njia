/* Njia — the county provision brief.
 *
 * WHY THIS FILE EXISTS.
 *
 * A county page printed to PDF is a deliverable that leaves the site: it goes
 * to a career teacher, a bursary committee, a county education officer. That
 * audience is the one Njia has no other route to, and none of them will ever
 * open a browser devtools panel to notice that the masthead stopped rendering.
 *
 * A print stylesheet is also the single easiest thing in a codebase to break
 * without knowing. Nobody prints during development. The screen keeps looking
 * right while the paper output silently loses its logo, or clips the right-hand
 * columns of every table, or drops the provenance paragraph that is the only
 * reason the figures can be trusted.
 *
 * So the guard is on the parts that would fail silently, and specifically on
 * the two failures that have already happened once in this project: an asset
 * referenced rather than inlined (the PDF report whose logo never loaded), and
 * a scroll container that clips instead of scrolling when there is no scrolling
 * to be had.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const county = (slug) => fs.readFileSync(path.join(root, 'counties', slug, 'index.html'), 'utf8');
const SAMPLE = ['nairobi', 'baringo', 'turkana'];

test('the brief carries the mark as inline SVG, never as a linked file', () => {
  /* tools/build-og-image.mjs and the PDF report both learned this the hard
     way. Browsers routinely drop external images from print output, and a
     branded deliverable whose brand is missing is worse than an unbranded one
     because nobody notices until it is already in someone else's inbox. */
  for (const slug of SAMPLE) {
    const html = county(slug);
    const head = html.slice(html.indexOf('class="brief-head"'));
    assert.ok(head.includes('<svg'),
      `${slug} brief masthead has no inline <svg> — if it was changed to an <img>, `
      + 'the mark will be missing from the printed PDF on most browsers');
    assert.ok(!/class="brief-mark"[\s\S]{0,200}<img/.test(head),
      `${slug} brief masthead references an image file instead of inlining the mark`);
  }
});

test('the printed brief names the county and the site it came from', () => {
  /* A page of tables with no provenance is an anonymous handout. Whoever it is
     forwarded to has to be able to tell where it came from and go check. */
  for (const slug of SAMPLE) {
    const html = county(slug);
    assert.match(html, /County provision brief/,
      `${slug} brief does not identify itself as a provision brief`);
    assert.ok(html.includes('njiacareerpathways.work'),
      `${slug} brief does not say where it came from, so nobody receiving it can verify it`);
  }
});

test('print un-clips the scrollable tables', () => {
  /* .wrap is overflow-x: auto so a wide table scrolls on a phone. On paper
     there is no scrolling, so the same rule crops the right-hand columns
     silently — Tuition and Duration are the last two, and they are the ones a
     bursary committee is reading the sheet for. */
  const css = county('nairobi');
  const printBlock = css.slice(css.indexOf('@media print'));
  assert.match(printBlock, /\.wrap\s*\{[^}]*overflow:\s*visible/,
    'the print block does not reset .wrap overflow, so wide tables will be cropped '
    + 'at the page edge instead of printed in full');
});

test('print drops what cannot be acted on from paper, and keeps what can', () => {
  const html = county('nairobi');
  const printBlock = html.slice(html.indexOf('@media print'));
  for (const gone of ['.cta', '.back']) {
    assert.ok(printBlock.includes(gone),
      `${gone} is not hidden in print — a button on paper is ink spent on something `
      + 'nobody can click');
  }
  /* The provenance paragraph is not optional. Every figure in this brief is
     either sourced or absent, and the sentence that says so has to travel with
     the numbers. */
  assert.match(html, /never shows a figure it cannot source/,
    'the provenance paragraph has gone from the county page, so the printed brief '
    + 'would carry figures with nothing saying how they were arrived at');
});

test('the eligibility floor is published, not just computed', () => {
  /* THE NUMBER THAT WAS INVISIBLE.
   *
   * Njia has computed "how many courses here can an E-grade learner enter"
   * since the coverage metric was introduced, and kept it in a constant in
   * tests/sector-coverage.test.js where no reader could see it. It is the most
   * decision-changing figure the project holds.
   *
   * "112 courses in Nairobi" and "26 of them open to an E" describe the same
   * county, and only the second one tells a school-leaver with an E — or the
   * officer funding them — anything they can act on. */
  for (const slug of SAMPLE) {
    const html = county(slug);
    assert.match(html, /Open to an E-grade learner/,
      `${slug} does not publish its eligibility floor`);
    const m = html.match(/Open to an E-grade learner<\/dt><dd>(\d+)<\/dd>/);
    assert.ok(m, `${slug} eligibility floor is present but not machine-readable`);
  }
});

test('the floor figure agrees with the catalogue it claims to summarise', () => {
  /* A summary that drifts from its source is worse than no summary: it looks
     authoritative and is wrong. Recomputed here from the data rather than
     trusted from the page. */
  const { COURSES } = require(path.join(root, 'data', 'courses.js'));
  const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));
  const ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const rank = (g) => (g == null ? ORDER.length : ORDER.indexOf(g));
  const byId = new Map(INSTITUTIONS.map((i) => [i.id, i]));

  const NAMES = { nairobi: 'Nairobi', baringo: 'Baringo', turkana: 'Turkana' };
  for (const slug of SAMPLE) {
    const rows = COURSES.filter((c) => (byId.get(c.institution_id) || {}).county === NAMES[slug]);
    const expected = rows.filter((c) => rank('E') <= rank(c.min_grade)).length;
    const shown = Number(county(slug).match(/Open to an E-grade learner<\/dt><dd>(\d+)<\/dd>/)[1]);
    assert.equal(shown, expected,
      `${slug} publishes ${shown} courses open to an E but the catalogue has ${expected} — `
      + 'regenerate the pages');
  }
});
