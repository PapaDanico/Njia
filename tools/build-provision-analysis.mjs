/* Njia — the county provision analysis: what the catalogue says about Kenya.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT ANOTHER COUNTY PAGE.
 *
 * /counties/<name>/ already answers a learner's question — what can I do here.
 * It carries that county's course table, its institutions, and the eligibility
 * floor sentence. A person deciding where to apply has what they need.
 *
 * A person deciding where to BUILD does not. The question a county education
 * officer, a bursary committee or a ministry desk actually asks is comparative:
 * which counties are worst served, on what dimension, and by how much. No
 * single county page can answer that, because the answer only exists across
 * all 47 at once. Until now the number that answers it — how many counties
 * offer nothing an E-grade leaver can enter — lived in a constant in
 * tests/sector-coverage.test.js, where the only readers were the test runner
 * and whoever edited the file.
 *
 * THE FINDING THIS PAGE EXISTS TO CARRY.
 *
 * 23 counties list nothing an E-grade learner can enter. TWENTY-ONE OF THOSE
 * TWENTY-THREE LIST NO ARTISAN COURSE AT ALL. The blindness is not a grade
 * problem that better filtering could solve, and it is not spread evenly across
 * the levels: it is one missing tier. Level 4 is the only door a learner with
 * an E has, and in 22 counties this catalogue records no door.
 *
 * The other two — Kakamega and Siaya — do list artisan courses, at D-, which
 * an E does not clear. They are a different failure and are named separately
 * rather than folded into the aggregate, because the fix is different: for the
 * 21 it is a missing institution, for these two it is a published minimum.
 *
 * WHAT THIS PAGE MUST NEVER LET A READER BELIEVE.
 *
 * That a zero here is a fact about a county. It is a fact about this
 * catalogue. Every county in Kenya has public technical provision; where this
 * page shows none, Njia has not listed it. A policy brief that blurs those two
 * is worse than no brief, because it is the kind of document that gets cited
 * in a room where nobody can check it, and "Turkana has no artisan training"
 * is a sentence that could defund the thing it misdescribes.
 *
 * That caveat is therefore not a footnote. It is in the first paragraph, in
 * the CSV header, in the <meta name="description">, and in a test.
 *
 * WHY THE FEE COLUMN IS HERE TOO.
 *
 * 14 of 463 course fees are published by the institution for that course, and
 * only 4 counties contain a single one. That is not a gap in Njia's research —
 * it is the finding. Kenyan TVET fee publication is close to non-existent at
 * course level, and a family cannot compare what nobody prints. Njia is the
 * only party that has counted it, because counting it requires having tried to
 * source all 463 one at a time.
 *
 * WHY A SEPARATE SCRIPT, GIVEN build-static-pages.mjs OWNS THE SITEMAP.
 *
 * Same arrangement as tools/build-open-data.mjs: this script owns its own
 * directory and nothing else, and build-static-pages.mjs lists /analysis/ in
 * the sitemap as a fixed URL. Two scripts writing sitemap.xml would clobber
 * each other depending on run order, which is exactly why that file has one
 * owner. One directory each, one sitemap, no race.
 *
 * RUN:  node tools/build-provision-analysis.mjs
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
const OUT = path.join(root, 'analysis');

/* feeBasis() is read out of js/decide.js rather than reimplemented, by the same
 * brace-matching reader tools/build-open-data.mjs and the test suite use. A
 * second copy of the rule could classify a fee one way in this brief and
 * another way on the card, and both would look right in isolation. */
function extractFn(source, name) {
  const at = source.indexOf(`function ${name}(`);
  if (at === -1) throw new Error(`${name}() not found in decide.js`);
  let depth = 0;
  for (let i = source.indexOf('{', at); i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(at, i + 1); }
  }
  throw new Error(`unbalanced braces reading ${name}() out of decide.js`);
}
const decideSource = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
const feeBasis = vm.runInNewContext(`${extractFn(decideSource, 'feeBasis')}; feeBasis`);

/* Worst grade last, so a learner qualifies when their grade sits at or below
 * the course minimum in this list. Identical to build-static-pages.mjs. */
const GRADE_ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
const rank = (g) => (g == null ? GRADE_ORDER.length : GRADE_ORDER.indexOf(g));
const reaches = (grade, course) => rank(grade) <= rank(course.min_grade);

const LEVELS = ['artisan', 'certificate', 'diploma', 'degree'];
const LEVEL_LABEL = {
  artisan: 'Artisan', certificate: 'Certificate', diploma: 'Diploma', degree: 'Degree'
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---- the table --------------------------------------------------------- */

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
const byCounty = new Map();
for (const c of COURSES) {
  const i = instById.get(c.institution_id);
  if (!i) continue;
  if (!byCounty.has(i.county)) byCounty.set(i.county, []);
  byCounty.get(i.county).push({ course: c, inst: i });
}

const counties = [...byCounty.keys()].sort().map((county) => {
  const rows = byCounty.get(county);
  const courses = rows.map((r) => r.course);
  const grades = courses.map((c) => c.min_grade);
  const bases = courses.map(feeBasis);
  return {
    county,
    institutions: new Set(rows.map((r) => r.inst.id)).size,
    courses: courses.length,
    levels: Object.fromEntries(LEVELS.map((l) => [l, courses.filter((c) => c.level === l).length])),
    /* Three rungs rather than one. A county can be closed to an E and open to a
       D, and the distance between those two learners is the whole subject of
       this page — collapsing it to a single "reachable" figure would hide the
       counties that are one published grade away from being open. */
    reach: {
      E: courses.filter((c) => reaches('E', c)).length,
      D: courses.filter((c) => reaches('D', c)).length,
      'C-': courses.filter((c) => reaches('C-', c)).length
    },
    lowest: grades.some((g) => g == null)
      ? 'Open entry'
      : grades.filter(Boolean).sort((a, b) => rank(b) - rank(a))[0],
    feePublished: bases.filter((b) => b === 'published').length,
    feeSourced: bases.filter((b) => b === 'published' || b === 'derived' || b === 'illustrative').length,
    feeAbsent: bases.filter((b) => b === 'unpublished' || b === 'unsourced').length
  };
});

const blindE = counties.filter((c) => c.reach.E === 0);
const blindD = counties.filter((c) => c.reach.D === 0);
const noArtisan = counties.filter((c) => c.levels.artisan === 0);
const noArtisanSet = new Set(noArtisan.map((c) => c.county));
/* The two failures are different problems with different fixes, so they are
   reported apart. See the header comment. */
const blindNoTier = blindE.filter((c) => noArtisanSet.has(c.county));
const blindTierTooHigh = blindE.filter((c) => !noArtisanSet.has(c.county));

const totals = {
  courses: COURSES.filter((c) => instById.has(c.institution_id)).length,
  /* Institutions that actually carry a course, NOT INSTITUTIONS.length.
   *
   * Two register entries — Mount Kenya University and Maseno University — are
   * listed with no course attached, so the register is 144 and the catalogue is
   * 142. This said 144 while the table beside it summed to 142, and the app's
   * own Decide rail said 142: a page whose stated total disagrees with its own
   * rows, which is the exact failure the prose guard exists to prevent. It got
   * through because the guard checked the three headline findings and not this
   * number. Caught by reading the rendered page against the running app. */
  institutions: counties.reduce((n, c) => n + c.institutions, 0),
  counties: counties.length,
  published: COURSES.filter((c) => feeBasis(c) === 'published').length,
  countiesWithPublished: counties.filter((c) => c.feePublished > 0).length
};

/* ---- the machine-readable companion ------------------------------------ */

const CSV_COLUMNS = [
  'county', 'institutions', 'courses',
  'artisan', 'certificate', 'diploma', 'degree',
  'lowest_entry', 'reachable_at_E', 'reachable_at_D', 'reachable_at_C_minus',
  'fee_published_by_institution', 'fee_sourced_any', 'fee_absent'
];
const csvCell = (v) => (/[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [
  CSV_COLUMNS.join(','),
  ...counties.map((c) => [
    c.county, c.institutions, c.courses,
    c.levels.artisan, c.levels.certificate, c.levels.diploma, c.levels.degree,
    c.lowest, c.reach.E, c.reach.D, c.reach['C-'],
    c.feePublished, c.feeSourced, c.feeAbsent
  ].map(csvCell).join(','))
].join('\n') + '\n';

/* ---- the page ---------------------------------------------------------- */

const OG_IMAGE = (() => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) throw new Error('index.html has no og:image — run tools/build-og-image.mjs first');
  return m[1];
})();

/* Inlined rather than linked, for the same reason the county briefs inline it:
   this sheet is printed and carried into a meeting, and browsers routinely drop
   external images from print. */
const BRAND_MARK = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();

/* Comma-separated for the long list, where it is a set being enumerated, and
   joined with "and" for the short one, where it is a sentence. "Kakamega, Siaya
   do list artisan courses" is not English, and this page is read aloud in
   meetings. */
const nameList = (list) => {
  const links = list.map((c) => c.county).sort()
    .map((n) => `<a href="/counties/${slug(n)}/">${esc(n)}</a>`);
  if (links.length > 3) return links.join(', ');
  return links.length < 2 ? links.join('') : `${links.slice(0, -1).join(', ')} and ${links.at(-1)}`;
};

/* ONLY THREE COLUMNS GET THE ALARM COLOUR, AND THAT IS A DELIBERATE CUT.
 *
 * The first version highlighted every zero in the table. Rendered, that meant
 * 34 highlighted zeros in the Degree column — where zero is not a gap, most
 * counties have no university and are not supposed to — and 43 in the
 * fee-published column, where zero is so nearly universal that marking it says
 * nothing about the county at all. The two zeros that are actually a finding,
 * artisan and reachable-at-E, were three colour-matched columns away from
 * noise and impossible to pick out of 47 rows.
 *
 * Emphasis spread across everything is not emphasis. These three are the
 * columns where a zero means a learner has nowhere to go; the rest are
 * description. The fee column is carried by the prose above instead. */
const ALARM_AT_ZERO = new Set(['artisan', 'E', 'D']);
const cell = (key, v) => `      <td class="n${v === 0 && ALARM_AT_ZERO.has(key) ? ' zero' : ''}">${v}</td>`;

const countyRow = (c) => `    <tr${c.reach.E === 0 ? ' class="flag"' : ''}>
      <th scope="row"><a href="/counties/${slug(c.county)}/">${esc(c.county)}</a></th>
      <td class="n">${c.institutions}</td>
      <td class="n">${c.courses}</td>
${LEVELS.map((l) => cell(l, c.levels[l])).join('\n')}
      <td>${esc(c.lowest)}</td>
${cell('E', c.reach.E)}
${cell('D', c.reach.D)}
${cell('C-', c.reach['C-'])}
${cell('feePublished', c.feePublished)}
    </tr>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>County provision analysis — where the gaps are | Njia</title>
<meta name="description" content="${blindE.length} of Kenya's 47 counties list no course an E-grade school-leaver can enter, and ${blindNoTier.length} of those list no artisan course at all. A county-by-county analysis of Njia's catalogue — which measures what Njia has listed, not what each county runs.">
<link rel="canonical" href="${SITE}/analysis/">
<meta property="og:title" content="County provision analysis — where the gaps are">
<meta property="og:description" content="${blindE.length} counties list nothing an E-grade leaver can enter. ${blindNoTier.length} of them list no artisan course at all.">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:url" content="${SITE}/analysis/">
<meta property="og:type" content="article">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>
  body { max-width: min(90rem, 100%); margin: 0 auto; padding: 1.5rem clamp(1.1rem, 2.5vw, 2.25rem) 4rem; }
  /* The app stylesheet zeroes paragraph margins and strips list markers because
     in the app every block sits inside a component that owns its spacing. A
     plain document page has no such component. */
  p { margin: 0 0 .9rem; }
  h1 { margin: .3rem 0 .6rem; }
  h2 { margin: 2.4rem 0 .6rem; }
  h3 { margin: 1.6rem 0 .4rem; }
  ul { margin: 0 0 .9rem; padding-left: 1.3rem; }
  li { list-style: disc; margin-bottom: .45rem; }
  .lede { font-size: 1.08rem; }
  .back { display: inline-block; margin-bottom: .5rem; }

  .brief-head { display: flex; align-items: center; gap: .75rem; padding-bottom: .8rem;
                margin-bottom: 1.2rem; border-bottom: 2px solid var(--border); }
  .brief-mark svg { width: 2.4rem; height: 2.4rem; display: block; }
  .brief-word { font-weight: 800; font-size: 1.15rem; letter-spacing: .01em; }
  .brief-tag { font-size: .8rem; opacity: .75; }
  .brief-meta { margin-left: auto; text-align: right; font-size: .78rem; opacity: .8; }

  /* The caveat is a component, not a sentence in a paragraph, because this is
     the page most likely to be screenshotted into a slide deck with the prose
     cropped off. */
  .limit { border-left: 4px solid var(--primary, #8B2500); background: rgba(139,37,0,.06);
           padding: .9rem 1.1rem; margin: 1.2rem 0 1.6rem; border-radius: 0 .5rem .5rem 0; }
  .limit p:last-child { margin-bottom: 0; }

  .figures { display: grid; gap: .8rem; margin: 1.4rem 0 1.8rem;
             grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); }
  .fig { border: 1px solid var(--border); border-radius: .6rem; padding: .9rem 1rem; }
  .fig b { display: block; font-family: var(--mono); font-variant-numeric: tabular-nums;
           font-size: 1.9rem; line-height: 1.1; }
  .fig span { display: block; font-size: .82rem; opacity: .85; margin-top: .25rem; }

  .wrap { overflow-x: auto; margin: 1rem 0; }
  table { width: 100%; border-collapse: collapse; font-size: .88rem; }
  .tkey { font-size: .84rem; opacity: .85; margin: 0 0 .5rem; max-width: 62rem; }
  th, td { text-align: left; padding: .4rem .55rem .4rem 0; border-bottom: 1px solid var(--border);
           vertical-align: top; }
  thead th { font-size: .78rem; text-transform: uppercase; letter-spacing: .03em; }
  .n { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right;
       padding-right: .8rem; white-space: nowrap; }
  /* A zero on this page is the point of the page, so it is marked rather than
     left to be found by eye in 47 rows of digits. */
  .zero { font-weight: 800; color: var(--primary, #8B2500); }
  /* The caption promises the closed counties are named in bold. A <th> is bold
     by default, so the first version made that promise and rendered all 47 rows
     identically — a distinction stated and not drawn is worse than none, because
     the reader trusts it and reads the wrong rows. The unflagged rows are
     therefore lightened so the flagged ones can be the bold ones. */
  tbody th { font-weight: 500; }
  tr.flag th { font-weight: 800; }

  .cta { display: inline-block; margin: .4rem .6rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
  code { font-family: var(--mono); font-size: .9em; }
  footer { margin-top: 2.5rem; font-size: .85rem; opacity: .8; }

  @media print {
    .back, .cta { display: none; }
    .wrap { overflow-x: visible; }
    table { font-size: 7.5pt; }
    a { text-decoration: none; color: inherit; }
    .limit { border-left-width: 3px; }
  }
</style>
</head>
<body>
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<div class="brief-head">
  <div class="brief-mark">${BRAND_MARK}</div>
  <div>
    <div class="brief-word">Njia</div>
    <div class="brief-tag">Data-driven career pathways for Kenyan youth</div>
  </div>
  <div class="brief-meta">
    <strong>County provision analysis</strong><br>
    ${totals.counties} counties &middot; ${totals.courses} courses &middot; njiacareerpathways.work
  </div>
</div>

<h1>Where the gaps are</h1>

<p class="lede"><strong>${blindE.length} of Kenya's 47 counties list no course a
school-leaver with an E can enter.</strong> ${blindNoTier.length} of those
${blindE.length} list no artisan course at all — so this is not a grade problem
that better filtering would solve. It is one missing tier.</p>

<div class="limit">
  <p><strong>Read every zero on this page as a fact about this catalogue, not
  about a county.</strong> Every county in Kenya has public technical provision.
  Where a row here shows none, Njia has not listed it — the institution exists
  and its courses are running.</p>
  <p>This page measures what a learner using Njia can currently find. It is a
  worklist for Njia before it is a finding about Kenya, and it is published in
  that spirit: if you know the college a row is missing, that is the most useful
  thing you can tell us.</p>
</div>

<div class="figures">
  <div class="fig"><b>${blindE.length}</b><span>counties with nothing an E-grade leaver can enter</span></div>
  <div class="fig"><b>${blindNoTier.length}</b><span>of those list no artisan course at all</span></div>
  <div class="fig"><b>${blindD.length}</b><span>counties still closed to a learner with a D</span></div>
  <div class="fig"><b>${totals.published}</b><span>of ${totals.courses} fees published by the institution for that course</span></div>
</div>

<p><a class="cta" href="/analysis/njia-county-provision.csv" download>Download this table as CSV</a>
<a class="cta" href="/open-data/">The full catalogue</a></p>

<h2>Finding 1 — the blindness is a missing tier, not a high bar</h2>

<p>Level 4 (artisan) is the only qualification a learner with an E can enter.
KUCCPS places at E for artisan; craft certificate generally opens at D and
diploma at C-. So a county with no artisan provision listed is a county closed
to the reader with the fewest alternatives, however many diplomas it runs.</p>

<p>${noArtisan.length} counties list no artisan course:
${nameList(noArtisan)}.</p>

<p>${blindNoTier.length} of those ${noArtisan.length} are among the
${blindE.length} counties showing zero courses reachable at E — so the missing
tier and the closed county are very nearly the same list.
<strong>The fix in those ${blindNoTier.length} is an institution, not a
filter.</strong> Eight counties were closed in a single
earlier pass by searching for the county's technical college and finding one that
had never been listed — every one of them already had a KMTC campus and a
university in the catalogue, and still read as blind, because the tier that was
missing was the only one that mattered to this learner.</p>

<h3>The two that are a different problem</h3>

<p>${nameList(blindTierTooHigh)} do list artisan courses, at a published minimum
of D-, which an E does not clear. That is a genuine published entry requirement
rather than a gap, so it is named here separately rather than folded into the
${blindNoTier.length}: the remedy is to confirm with the institution whether an
E is in practice admitted, not to go looking for a college that is already
listed.</p>

<h2>Finding 2 — almost nobody publishes a course fee</h2>

<p><strong>${totals.published} of ${totals.courses} course fees in this catalogue
were published by the institution for that specific course.</strong> Only
${totals.countiesWithPublished} of ${totals.counties} counties contain a single
one. Every other figure Njia shows is either derived from a published rate — the
government's consolidated public-TVET fee, a national schedule — or absent
entirely, and every card says which.</p>

<p>That is a finding about Kenyan fee publication, not about Njia's research.
A family comparing two colleges is comparing two numbers that mostly do not
exist in public, which is why the comparison is usually made by phoning around
and why it so often gets made badly. The <code>fee_published_by_institution</code>
column in the CSV is the count per county; the
<a href="/open-data/">full catalogue export</a> carries it per course.</p>

<h2>The table</h2>

${/* The key sits OUTSIDE the scroll container. As a <caption> it was as wide as
     the table, so on a 390px phone the sentence explaining which zeros matter
     was itself clipped at the viewport edge and only readable by scrolling the
     table sideways — the one piece of text on the page a reader must not miss,
     hidden behind a horizontal scroll. The <caption> stays for screen readers,
     shortened to what a table summary should be. */''}
<p class="tkey">All ${totals.counties} counties. "Reachable at" counts courses whose published minimum
that grade clears. Counties with nothing reachable at E are named in bold, and a zero is highlighted only
in the three columns where it means a learner has nowhere to go — artisan, at E, at D. A zero under Degree
is ordinary: most counties have no university and are not meant to.</p>

<div class="wrap" tabindex="0" role="region" aria-label="County provision table, scrollable">
<table>
  <caption class="visually-hidden">Provision in all ${totals.counties} counties: institutions, courses by
  level, lowest published entry grade, courses reachable at E, D and C-, and fees published by the
  institution.</caption>
  <thead>
    <tr>
      <th scope="col">County</th>
      <th scope="col" class="n">Inst.</th>
      <th scope="col" class="n">Courses</th>
${LEVELS.map((l) => `      <th scope="col" class="n">${LEVEL_LABEL[l]}</th>`).join('\n')}
      <th scope="col">Lowest entry</th>
      <th scope="col" class="n">At E</th>
      <th scope="col" class="n">At D</th>
      <th scope="col" class="n">At C-</th>
      <th scope="col" class="n">Fee pub.</th>
    </tr>
  </thead>
  <tbody>
${counties.map(countyRow).join('\n')}
  </tbody>
</table>
</div>

<h2>What this does and does not measure</h2>
<ul>
  <li><strong>It measures Njia's catalogue.</strong> ${totals.courses} courses at
  ${totals.institutions} institutions. It is not the TVETA register and does not
  claim to be a census of Kenyan provision.</li>
  <li><strong>"Reachable at E" counts published minimums.</strong> An institution
  may admit below its published grade; a learner should ring and ask. The column
  records what is printed, because that is what a learner can check before
  they travel.</li>
  <li><strong>There is no employment rate and no salary column,</strong> here or
  anywhere in Njia, because Kenya does not publish either per course. Any
  analysis offering you those figures per course is telling you something it
  cannot know.</li>
  <li><strong>Fees change and grades change.</strong> Confirm with the
  institution before anyone acts on a figure.</li>
</ul>

<h2>Using it</h2>
<p>Please attribute to Njia and link back. If you are citing a zero, cite it as
"not listed in Njia's catalogue" rather than "not available in the county" —
the difference is the whole point of the box at the top.</p>

<footer>
  <p><a href="/counties/">Browse by county</a> &middot;
     <a href="/grades/">Browse by grade</a> &middot;
     <a href="/open-data/">Open data</a> &middot;
     <a href="/">Njia home</a></p>
</footer>
</main>
</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'njia-county-provision.csv'), csv);
fs.writeFileSync(path.join(OUT, 'index.html'), page);

console.log(`wrote analysis/njia-county-provision.csv  ${counties.length} rows`);
console.log(`wrote analysis/index.html`);
console.log(`E-blind: ${blindE.length}  (no artisan tier: ${blindNoTier.length}, tier above E: ${blindTierTooHigh.length})`);
console.log(`D-blind: ${blindD.length}   counties with no artisan course: ${noArtisan.length}`);
console.log(`institution-published fees: ${totals.published}/${totals.courses} across ${totals.countiesWithPublished} counties`);
