/* Njia — publish the catalogue as machine-readable open data.
 *
 * WHY THIS EXISTS.
 *
 * Njia's claim is not that it has course data. Several sites have course data.
 * The claim is that every figure says where it came from, and that a figure
 * which cannot be sourced is absent rather than invented. That claim is
 * currently only checkable by a person clicking through the app one card at a
 * time.
 *
 * An export makes it checkable in bulk, by anyone, without asking permission —
 * a county education officer, a journalist, a researcher, or someone who simply
 * wants to argue that a number is wrong. THE PROVENANCE COLUMN IS THE PRODUCT.
 * A dump of 463 courses and fees is unremarkable; a dump that says of each fee
 * whether the college published it, whether Njia worked it out from a published
 * rate, or whether nobody publishes one at all is the thing nobody else emits.
 *
 * WHY fee_basis IS COMPUTED, NOT STORED.
 *
 * feeBasis() is read out of js/decide.js at build time by the same brace-
 * matching trick tests/sector-coverage.test.js uses, rather than being
 * reimplemented here. If the export classified fees by its own copy of the
 * rule, the CSV and the app could disagree about the same course while both
 * looked right in isolation — and the export would be quietly lying about the
 * one column it exists to publish. One rule, read from the place that renders
 * the badge.
 *
 * WHAT AN EMPTY CELL MEANS, WHICH IS THE USUAL WAY A CSV LIES.
 *
 * A blank in a spreadsheet reads as "no data" or as zero, depending on who is
 * looking, and both readings are wrong here in ways that matter:
 *
 *   min_grade blank   -> the course states NO minimum. It is open entry, which
 *                        is the most permissive value, not a missing one.
 *   tuition_kes blank -> no fee could be sourced. It is NOT free. A course that
 *                        is genuinely free carries 0 and says so in the note.
 *
 * Both are spelled out in the README sheet and in open-data/index.html, because
 * a caveat that lives only in a header row is a caveat nobody reads.
 *
 * RUN:  node tools/build-open-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '/'));

const { COURSES } = require('./data/courses.js');
const { INSTITUTIONS } = require('./data/institutions.js');

const SITE = 'https://njiacareerpathways.work';
const OUT = path.join(root, 'open-data');

/* Lifted verbatim from js/decide.js so the export cannot drift from the badge
 * the app renders. Same reader as the test suite uses. */
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

const BASIS_MEANING = {
  published: 'The institution publishes this figure for this course.',
  derived: 'Worked out by applying a published rate to this course. The rate is sourced; the total was calculated.',
  illustrative: 'Sourced, but not the institution\'s own price for this course.',
  unpublished: 'No fee published. The cell is empty — this does not mean free.',
  unsourced: 'A figure carrying no citation. Legacy records only; no new record may ship this way.'
};

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));

const rows = COURSES
  .map((c) => ({ c, i: instById.get(c.institution_id) }))
  .filter((r) => r.i)
  .sort((a, b) => a.i.county.localeCompare(b.i.county)
    || a.i.name.localeCompare(b.i.name)
    || a.c.name.localeCompare(b.c.name))
  .map(({ c, i }) => ({
    course_id: c.id,
    course_name: c.name,
    institution: i.name,
    institution_id: i.id,
    county: i.county,
    ownership: i.ownership,
    level: c.level,
    cluster: c.cluster,
    min_grade: c.min_grade == null ? '' : c.min_grade,
    open_entry: c.min_grade == null ? 'yes' : 'no',
    duration_months: c.duration_months == null ? '' : c.duration_months,
    tuition_kes: c.total_fees_kes == null ? '' : c.total_fees_kes,
    fee_basis: feeBasis(c),
    verification_note: c.verification_note || ''
  }));

const COLUMNS = Object.keys(rows[0]);

/* RFC 4180: quote everything containing a comma, quote or newline, and double
 * any embedded quote. The verification notes contain all three, and a naive
 * join would shear the file into nonsense at the first note with a comma in
 * it — which is most of them. */
const csvCell = (v) => {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [COLUMNS.join(',')]
  .concat(rows.map((r) => COLUMNS.map((k) => csvCell(r[k])).join(',')))
  .join('\n') + '\n';

const json = JSON.stringify({
  source: 'Njia — njiacareerpathways.work',
  generated_from: 'data/courses.js + data/institutions.js',
  course_count: rows.length,
  institution_count: new Set(rows.map((r) => r.institution_id)).size,
  county_count: new Set(rows.map((r) => r.county)).size,
  column_notes: {
    min_grade: 'Empty means the course states no minimum grade — open entry, the most permissive value, not a missing one.',
    tuition_kes: 'Empty means no fee could be sourced. It does NOT mean free; a genuinely free course carries 0.',
    fee_basis: BASIS_MEANING,
    verification_note: 'The provenance sentence shown on the course card. Every figure traces to one of these.'
  },
  courses: rows
}, null, 2) + '\n';

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'njia-catalogue.csv'), csv);
fs.writeFileSync(path.join(OUT, 'njia-catalogue.json'), json);

/* ---- the landing page ------------------------------------------------- */

const basisCounts = rows.reduce((a, r) => { a[r.fee_basis] = (a[r.fee_basis] || 0) + 1; return a; }, {});
const order = ['published', 'derived', 'illustrative', 'unpublished', 'unsourced'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OG_IMAGE = (() => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) throw new Error('index.html has no og:image — run tools/build-og-image.mjs first');
  return m[1];
})();

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Open data — the whole catalogue, with provenance | Njia</title>
<meta name="description" content="Download every course Njia lists as CSV or JSON, including how each fee was arrived at. ${rows.length} courses, ${new Set(rows.map((r) => r.institution_id)).size} institutions, all 47 counties.">
<link rel="canonical" href="${SITE}/open-data/">
<meta property="og:title" content="Njia open data — the whole catalogue, with provenance">
<meta property="og:description" content="Every course, fee and entry grade Njia lists, and how each figure was arrived at.">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:url" content="${SITE}/open-data/">
<meta property="og:type" content="article">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="stylesheet" href="/css/styles.css">
<style>
  body { max-width: 62rem; margin: 0 auto; padding: 1.5rem clamp(1.1rem, 2.5vw, 2.25rem) 4rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: .94rem; }
  th, td { text-align: left; padding: .5rem .5rem .5rem 0; border-bottom: 1px solid var(--border); vertical-align: top; }
  .n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 700; white-space: nowrap; text-align: right; width: 4em; padding-right: .8rem; }
  .cta { display: inline-block; margin: .4rem .6rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
  code { font-family: var(--mono); font-size: .9em; }
  /* The app stylesheet zeroes paragraph margins and strips list markers,
     because in the app every block sits inside a component that owns its own
     spacing. A plain document page has no such component, so without these it
     renders as one unbroken slab with headings touching the line above and
     bullets that are not bullets. */
  p { margin: 0 0 .9rem; }
  h1 { margin: .3rem 0 .6rem; }
  h2 { margin: 2rem 0 .6rem; }
  ul { margin: 0 0 .9rem; padding-left: 1.3rem; }
  li { list-style: disc; margin-bottom: .45rem; }
  .lede { font-size: 1.08rem; }
  .back { display: inline-block; margin-bottom: .5rem; }
  footer { margin-top: 2.5rem; font-size: .85rem; opacity: .8; }
</style>
</head>
<body>
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<h1>The whole catalogue, with its provenance</h1>

<p class="lede"><strong>${rows.length} courses</strong> at
${new Set(rows.map((r) => r.institution_id)).size} institutions across
${new Set(rows.map((r) => r.county)).size} counties, as a single file.</p>

<p>Plenty of places list Kenyan courses and fees. What this file adds is a
column saying <strong>where each fee came from</strong> — whether the college
published it, whether it was worked out from a published rate, or whether
nobody publishes one at all. That column is the reason to use this rather than
retyping a prospectus.</p>

<p><a class="cta" href="/open-data/njia-catalogue.csv" download>Download CSV</a>
<a class="cta" href="/open-data/njia-catalogue.json" download>Download JSON</a></p>

<h2>What is in the fee_basis column</h2>
<table>
  <thead><tr><th scope="col" class="n">Rows</th><th scope="col">Value</th><th scope="col">Meaning</th></tr></thead>
  <tbody>
${order.map((k) => `    <tr><td class="n">${basisCounts[k] || 0}</td><th scope="row"><code>${k}</code></th><td>${esc(BASIS_MEANING[k])}</td></tr>`).join('\n')}
  </tbody>
</table>

<h2>Two empty cells that do not mean what you expect</h2>
<p>A blank in a spreadsheet reads as "no data" or as zero depending on who is
looking, and both readings are wrong here.</p>
<ul>
  <li><strong>Empty <code>min_grade</code> means open entry</strong> — the course
  states no minimum. It is the most permissive value, not a missing one. There
  is an <code>open_entry</code> column carrying yes/no so you never have to
  infer it from a blank.</li>
  <li><strong>Empty <code>tuition_kes</code> means no fee could be sourced.</strong>
  It does not mean free. A course that genuinely costs nothing carries
  <code>0</code> and says so in its note.</li>
</ul>

<h2>What is deliberately absent</h2>
<p>There is no employment rate and no graduate salary column, because Kenya does
not publish either per course. Rather than print an estimate and label it, Njia
prints nothing. Any dataset that does offer you those figures per course is
telling you something it cannot know.</p>

<h2>Using it</h2>
<p>Please attribute to Njia and link back, and tell readers that fees and entry
grades change — confirm with the institution before anyone acts on a figure. A
formal licence has not been chosen yet; if you need specific terms, ask.</p>
<p>Found something wrong? That is the point of publishing it. Use the feedback
link in the app and say which <code>course_id</code>.</p>

<footer>
  <p><a href="/counties/">Browse by county</a> &middot;
     <a href="/grades/">Browse by grade</a> &middot;
     <a href="/">Njia home</a></p>
</footer>
</main>
</body>
</html>
`;

fs.writeFileSync(path.join(OUT, 'index.html'), page);

console.log(`wrote open-data/njia-catalogue.csv  ${rows.length} rows, ${(csv.length / 1024).toFixed(0)} KB`);
console.log(`wrote open-data/njia-catalogue.json ${(json.length / 1024).toFixed(0)} KB`);
console.log(`wrote open-data/index.html`);
console.log(`fee basis: ${order.map((k) => `${k}=${basisCounts[k] || 0}`).join(' ')}`);
console.log('\nRun `node tools/build-static-pages.mjs` so the sitemap picks up /open-data/.');
