/* Njia — generate the static, crawlable pages: one per county, one per grade.
 *
 * WHY THIS EXISTS.
 *
 * Njia is a single-page app. Everything a reader values — 436 courses, 135
 * institutions, every fee, every entry grade — is rendered client-side by
 * navigateTo(). A crawler that does not execute JavaScript sees 987 characters
 * of chrome, and the sitemap has exactly one URL in it.
 *
 * Netlify Analytics made the cost visible: over 30 days the top locations were
 * the United States and Canada. For an app built for Kenyan school-leavers,
 * that is not an audience, it is developer traffic, Lighthouse runs and
 * crawlers. Njia was not being found by the people it exists for.
 *
 * The reason is structural rather than technical. Lighthouse scores SEO 100
 * because the markup hygiene is fine. But a learner does not search "career
 * pathway platform"; they search "TVET courses in Turkana", "courses I can do
 * with a D plain", "KMTC September intake". There was no page to rank for any
 * of it — one URL about the app, and nothing about their question.
 *
 * So each county gets a real page with its real courses in real HTML: names,
 * institutions, entry grades, fees, and the honest note about what the county
 * does and does not offer. No JavaScript required to read it. Every page links
 * into the app for the parts a static page cannot do.
 *
 * WHY GENERATED AND COMMITTED, NOT SERVER-RENDERED.
 *
 * The project is deliberately buildless — netlify.toml runs an echo. This
 * script is run by hand and its output is committed, exactly like
 * tools/build-icons.mjs and tools/build-og-image.mjs. Netlify still serves
 * static files it did not build. tests/seo.test.js fails the build if these
 * pages fall behind the data they describe.
 *
 * ONE SCRIPT, BECAUSE ONE SITEMAP.
 *
 * County pages and grade pages are separate ideas but a single sitemap.xml
 * lists both, and two scripts writing the same file would clobber each other
 * depending on which ran last. So this owns every generated page and the
 * sitemap together. It was called build-county-pages.mjs while it only made
 * counties; a name that describes half of what a script does is the kind of
 * thing this repository spends its comments apologising for.
 *
 * WHAT THESE PAGES MUST NOT BECOME.
 *
 * Doorway pages. Each one has to be genuinely useful to a person who lands on
 * it from a search — which is why it carries the actual course table and the
 * county's real limitations, including "no course here takes an E" where that
 * is true. A page that exists only to catch a query and bounce the reader into
 * an app is the thing search engines are right to punish, and the thing this
 * project would deserve to be punished for.
 *
 * RUN:  node tools/build-static-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '/'));

const { COURSES } = require('./data/courses.js');
const { INSTITUTIONS } = require('./data/institutions.js');

/* Root-relative for assets and internal links, absolute only for canonical,
 * og:url and og:image. Absolute asset URLs looked tidy and meant the pages
 * rendered unstyled on every deploy preview and on the netlify.app host — the
 * stylesheet was being fetched from the production domain, which is not where
 * the page under review lives. Canonical and the social tags genuinely need
 * the real address, and nothing else does. */
const SITE = 'https://njiacareerpathways.work';
const OUT = path.join(root, 'counties');

/* The share-card URL carries a content hash so social platforms refetch it when
 * the card changes, instead of a human being asked to re-scrape in the Facebook
 * debugger. It is read out of index.html rather than restated here, because two
 * places holding the same versioned URL is two places to drift — and a stale
 * hash on 54 pages would point every shared county link at a card the platform
 * has already cached under a different address. tools/build-og-image.mjs owns
 * the value; this reads it. */
const OG_IMAGE = (() => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) throw new Error('index.html has no og:image — run tools/build-og-image.mjs first');
  return m[1];
})();


const LEVEL_LABEL = {
  artisan: 'Artisan', certificate: 'Certificate', diploma: 'Diploma',
  degree: 'Degree', short_course: 'Short course'
};
const CLUSTER_LABEL = {
  carer: 'Caring and health', creator: 'Creative and making', maker: 'Technical trades',
  business: 'Business', tech: 'Technology', people: 'Working with people', numbers: 'Numbers and analysis'
};
/* Worst (highest index) first is the ORDER; a learner "qualifies" when their
 * grade sits at or below the course minimum in this list. */
const GRADE_ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
const rank = (g) => (g == null ? GRADE_ORDER.length : GRADE_ORDER.indexOf(g));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => (n == null ? null : `Ksh ${n.toLocaleString('en-KE')}`);

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
const byCounty = new Map();
for (const c of COURSES) {
  const i = instById.get(c.institution_id);
  if (!i) continue;
  if (!byCounty.has(i.county)) byCounty.set(i.county, []);
  byCounty.get(i.county).push({ course: c, inst: i });
}

/* The sentence that decides whether the page is honest. A county where the
 * lowest entry is C+ is a county where most readers of this page cannot apply
 * to anything on it, and saying so is more useful than a longer list. */
function floorSentence(county, rows) {
  const grades = rows.map((r) => r.course.min_grade);
  const open = grades.filter((g) => g == null).length;
  const lowest = grades.filter(Boolean).sort((a, b) => rank(b) - rank(a))[0];
  if (open > 0) {
    return `${open} of these ${rows.length} courses list no minimum grade at all, so they are open to any KCSE result.`;
  }
  /* Only E clears it. D- reads like a low bar and is not one — a learner with
   * an E cannot enter a D- course, so lumping the two together would tell
   * exactly the wrong reader that a route exists for them. tests/seo.test.js
   * caught this on Kakamega, where the lowest entry is Sigalagala's D-. */
  if (lowest === 'E') {
    return `The lowest entry requirement in ${county} is E, so there is a route here for a learner with any KCSE grade.`;
  }
  return `The lowest entry requirement Njia has found in ${county} is ${lowest}. `
    + `If you scored below that, nothing on this page is open to you — and that is a gap in this catalogue as much as in the county, `
    + `because every county in Kenya has public technical provision. Search the TVETA register for ${county} and ask what is running.`;
}

function coursePage(county, rows) {
  const sorted = [...rows].sort((a, b) => rank(b.course.min_grade) - rank(a.course.min_grade)
    || a.course.name.localeCompare(b.course.name));
  const institutions = [...new Set(rows.map((r) => r.inst.name))].sort();
  const clusters = [...new Set(rows.map((r) => r.course.cluster))];
  const levels = [...new Set(rows.map((r) => r.course.level))];

  const title = `Courses in ${county} County — fees, entry grades and institutions | Njia`;
  const desc = `${rows.length} courses at ${institutions.length} institution${institutions.length === 1 ? '' : 's'} in `
    + `${county} County, Kenya, with entry grades and fees. ${levels.map((l) => LEVEL_LABEL[l]).join(', ')}.`;

  const rowsHtml = sorted.map(({ course: c, inst: i }) => `
        <tr>
          <th scope="row">${esc(c.name)}</th>
          <td>${esc(i.name)}</td>
          <td>${esc(LEVEL_LABEL[c.level] || c.level)}</td>
          <td>${c.min_grade ? esc(c.min_grade) : '<span class="open">Open entry</span>'}</td>
          <td>${c.total_fees_kes == null ? '<span class="muted">Not published</span>' : esc(money(c.total_fees_kes))}</td>
          <td>${c.duration_months} mo</td>
        </tr>`).join('');

  /* ItemList of Course, which is what this page actually is. Only fields that
     are true of every entry are emitted — no invented ratings, no fake
     availability. provider is the real institution. */
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Courses in ${county} County, Kenya`,
    numberOfItems: rows.length,
    itemListElement: sorted.slice(0, 50).map((r, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      item: {
        '@type': 'Course',
        name: r.course.name,
        description: r.course.description,
        provider: {
          '@type': 'EducationalOrganization',
          name: r.inst.name,
          address: { '@type': 'PostalAddress', addressRegion: `${county} County`, addressCountry: 'KE' }
        }
      }
    }))
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/counties/${slug(county)}/">
<meta property="og:title" content="${esc(`Courses in ${county} County, Kenya`)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:url" content="${SITE}/counties/${slug(county)}/">
<meta property="og:type" content="article">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="stylesheet" href="/css/styles.css">
<style>
  /* Deliberately minimal and self-contained. These pages reuse the app's
     stylesheet for colour and type, but none of its layout JavaScript, so
     they render identically with scripting switched off. */
  body { max-width: 62rem; margin: 0 auto; padding: 1.5rem 1.1rem 4rem; }
  table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: .94rem; }
  th, td { text-align: left; padding: .55rem .5rem; border-bottom: 1px solid var(--ink-veil, rgba(61,28,2,.12)); vertical-align: top; }
  thead th { font-size: .78rem; text-transform: uppercase; letter-spacing: .07em; }
  tbody th { font-weight: 600; }
  .open { font-weight: 700; }
  .muted { opacity: .7; }
  .wrap { overflow-x: auto; }
  .cta { display: inline-block; margin: .4rem .5rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
  .back { display: inline-block; margin-bottom: 1rem; }
  footer { margin-top: 2.5rem; font-size: .85rem; opacity: .8; }
  ul.counties { columns: 2; font-size: .9rem; }
  @media (min-width: 48rem) { ul.counties { columns: 4; } }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<h1>Courses in ${esc(county)} County</h1>

<p><strong>${rows.length} course${rows.length === 1 ? '' : 's'}</strong> at
${institutions.length} institution${institutions.length === 1 ? '' : 's'}, covering
${clusters.map((c) => esc(CLUSTER_LABEL[c] || c)).join(', ')}.</p>

<p>${esc(floorSentence(county, rows))}</p>

<p><a class="cta" href="/#decide">Filter these by your grade and budget &rarr;</a>
<a class="cta" href="/#discover">Take the 20-minute diagnostic</a></p>

<div class="wrap">
<table>
  <caption>Every course Njia lists in ${esc(county)} County, lowest entry requirement first.</caption>
  <thead><tr><th scope="col">Course</th><th scope="col">Institution</th><th scope="col">Level</th>
  <th scope="col">Min grade</th><th scope="col">Tuition</th><th scope="col">Duration</th></tr></thead>
  <tbody>${rowsHtml}
  </tbody>
</table>
</div>

<h2>Institutions in ${esc(county)}</h2>
<ul>${institutions.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>

<h2>About these figures</h2>
<p>Fees are tuition only and most are worked out by applying a published rate to the
course rather than quoted by the institution for that course — the app shows which is
which on every card, and never shows a figure it cannot source. Entry grades and fees
change; confirm with the institution before you decide anything.</p>
<p>Njia does not publish employment rates or salaries per course, because Kenya does not
publish that data and an invented figure is worse than a missing one.</p>

<footer>
  <p><a href="/counties/">All 47 counties</a> &middot;
     <a href="/">Njia home</a> &middot;
     Free, no signup, works offline.</p>
</footer>
</body>
</html>
`;
}

function indexPage(counties) {
  const total = COURSES.length;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Njia',
    url: `${SITE}/`,
    description: 'Free, evidence-based career pathway guidance for Kenyan youth, '
      + 'matched against real Kenyan courses, fees and funding.'
  };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Courses by county in Kenya — all 47 counties | Njia</title>
<meta name="description" content="${esc(`Browse ${total} courses across all 47 Kenyan counties with entry grades and fees. Free and evidence-based.`)}">
<link rel="canonical" href="${SITE}/counties/">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="stylesheet" href="/css/styles.css">
<style>
  body { max-width: 62rem; margin: 0 auto; padding: 1.5rem 1.1rem 4rem; }
  ul.counties { columns: 2; font-size: .95rem; line-height: 1.9; }
  @media (min-width: 48rem) { ul.counties { columns: 4; } }
  .cta { display: inline-block; margin: .4rem .5rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
<h1>Courses by county</h1>
<p>${total} courses at ${new Set(COURSES.map((c) => c.institution_id)).size} institutions across all
${counties.length} counties, with the entry grade and fee on every one.</p>
<p><a class="cta" href="/#decide">Filter by your grade and budget &rarr;</a></p>
<ul class="counties">
${counties.map((c) => `  <li><a href="/counties/${slug(c)}/">${esc(c)}</a></li>`).join('\n')}
</ul>
</body>
</html>
`;
}


/* GRADE PAGES — the question this audience actually types.
 *
 * "What can I do with a D+?" is the single most-asked version of the thing
 * Njia answers, and until now there was no page for it. The county pages rank
 * for place; these rank for the constraint the reader is stuck with.
 *
 * NOT one page per grade. A page for A, A-, B+ or B would list 429-436 of the
 * 436 courses, which is the same page four times over — duplicate content, and
 * exactly the doorway pattern the county pages were built to avoid. A page
 * earns its place only where the grade genuinely narrows the catalogue, which
 * in practice means C and below:
 *
 *   C+ 425/436 (97%)   near-identical to the full list — not generated
 *   C  351 (80%)  C- 318 (73%)  D+ 212 (49%)  D 145 (33%)  D- 96 (22%)  E 92 (21%)
 *
 * The cut is at 85% reachable. It is a judgement, and it is written down here
 * rather than left implicit so the next person can move it deliberately. */
const GRADE_PAGE_MAX_SHARE = 0.85;

const GRADE_SLUG = {
  'C+': 'c-plus', C: 'c-plain', 'C-': 'c-minus',
  'D+': 'd-plus', D: 'd-plain', 'D-': 'd-minus', E: 'e'
};
const GRADE_PHRASE = {
  'C+': 'C+', C: 'C plain', 'C-': 'C-', 'D+': 'D+', D: 'D plain', 'D-': 'D-', E: 'E'
};
/* "a E" reads as a typo to exactly the reader this page is for. Only E takes
 * "an" among the grades that get a page — the rest start with a consonant
 * sound — so this is a lookup rather than a vowel rule. */
const GRADE_ARTICLE = (g) => (g === 'E' ? 'an' : 'a');

function reachableAt(grade) {
  return COURSES.filter((c) => rank(grade) <= rank(c.min_grade))
    .map((c) => ({ course: c, inst: instById.get(c.institution_id) }))
    .filter((r) => r.inst);
}

function gradePage(grade, rows) {
  const phrase = GRADE_PHRASE[grade];
  const counties = [...new Set(rows.map((r) => r.inst.county))].sort();
  const levels = [...new Set(rows.map((r) => r.course.level))];
  const byLevel = levels.map((l) => `${rows.filter((r) => r.course.level === l).length} ${LEVEL_LABEL[l].toLowerCase()}`);

  const title = `Courses you can do with ${GRADE_ARTICLE(grade)} ${phrase} in KCSE — ${rows.length} options | Njia`;
  const desc = `${rows.length} Kenyan courses open to a KCSE mean grade of ${phrase}, across `
    + `${counties.length} counties, with fees and institutions. Free and evidence-based.`;

  /* Grouped by county so the reader can find the ones near them, which is the
     second question after "what can I do at all". */
  const groups = counties.map((county) => {
    const inCounty = rows.filter((r) => r.inst.county === county)
      .sort((a, b) => a.course.name.localeCompare(b.course.name));
    return `
  <h3>${esc(county)} <span class="count">${inCounty.length}</span></h3>
  <div class="wrap"><table>
    <thead><tr><th scope="col">Course</th><th scope="col">Institution</th>
    <th scope="col">Level</th><th scope="col">Min grade</th><th scope="col">Tuition</th></tr></thead>
    <tbody>${inCounty.map(({ course: c, inst: i }) => `
      <tr><th scope="row">${esc(c.name)}</th><td>${esc(i.name)}</td>
      <td>${esc(LEVEL_LABEL[c.level] || c.level)}</td>
      <td>${c.min_grade ? esc(c.min_grade) : '<span class="open">Open entry</span>'}</td>
      <td>${c.total_fees_kes == null ? '<span class="muted">Not published</span>' : esc(money(c.total_fees_kes))}</td></tr>`).join('')}
    </tbody>
  </table></div>`;
  }).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `What courses can I do with ${GRADE_ARTICLE(grade)} ${phrase} in KCSE?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Njia lists ${rows.length} courses open to a KCSE mean grade of ${phrase}, across `
          + `${counties.length} Kenyan counties — ${byLevel.join(', ')}. TVET placement accepts any KCSE `
          + `grade from A to E from anyone who sat the exam from 2000 onward, and intake runs continuously `
          + `rather than in one annual window.`
      }
    }]
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/grades/${GRADE_SLUG[grade]}/">
<meta property="og:title" content="${esc(`Courses you can do with ${GRADE_ARTICLE(grade)} ${phrase} in Kenya`)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:url" content="${SITE}/grades/${GRADE_SLUG[grade]}/">
<meta property="og:type" content="article">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="stylesheet" href="/css/styles.css">
<style>
  body { max-width: 62rem; margin: 0 auto; padding: 1.5rem 1.1rem 4rem; }
  table { width: 100%; border-collapse: collapse; margin: .6rem 0 1.4rem; font-size: .92rem; }
  th, td { text-align: left; padding: .5rem .45rem; border-bottom: 1px solid var(--ink-veil, rgba(61,28,2,.12)); vertical-align: top; }
  thead th { font-size: .76rem; text-transform: uppercase; letter-spacing: .07em; }
  tbody th { font-weight: 600; }
  h3 { margin-top: 1.8rem; }
  .count { font-size: .8rem; font-weight: 400; opacity: .7; }
  .open { font-weight: 700; }
  .muted { opacity: .7; }
  .wrap { overflow-x: auto; }
  .cta { display: inline-block; margin: .4rem .5rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
  .lede { font-size: 1.05rem; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<h1>Courses you can do with ${GRADE_ARTICLE(grade)} ${esc(phrase)}</h1>

<p class="lede"><strong>${rows.length} courses</strong> across
<strong>${counties.length} counties</strong> are open to a KCSE mean grade of ${esc(phrase)} —
${byLevel.join(', ')}.</p>

<p><strong>TVET placement takes any KCSE grade, A to E</strong>, from anyone who sat the exam
from 2000 onward — not only this year's candidates. Intake runs continuously rather than in a
single annual window, so a closed university deadline is not the end of the cycle.</p>

<p><a class="cta" href="/#decide">Filter these by county and budget &rarr;</a>
<a class="cta" href="/#discover">Find which of them suits you</a></p>

${groups}

<h2>About these figures</h2>
<p>Entry grades are what the institution publishes, and published requirements sometimes
conflict — where they do, Njia shows the lower bar and tells you to confirm, because a reader
told to check keeps their options and a reader shown nothing does not. Fees are tuition only.
Confirm both with the institution before you decide.</p>

<footer>
  <p><a href="/grades/">All grades</a> &middot; <a href="/counties/">Browse by county</a> &middot;
     <a href="/">Njia home</a></p>
</footer>
</body>
</html>
`;
}

function gradeIndexPage(grades) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>What can I study with my KCSE grade? | Njia</title>
<meta name="description" content="Kenyan courses grouped by the KCSE mean grade they accept, from C plain down to E, with fees and institutions.">
<link rel="canonical" href="${SITE}/grades/">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="stylesheet" href="/css/styles.css">
<style>
  body { max-width: 48rem; margin: 0 auto; padding: 1.5rem 1.1rem 4rem; }
  li { margin: .5rem 0; font-size: 1.02rem; }
  .cta { display: inline-block; margin: .5rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
<a href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
<h1>What can I study with my KCSE grade?</h1>
<p><strong>TVET placement takes any grade, A to E</strong>, from anyone who sat KCSE from 2000
onward, and intake runs continuously. Pick your grade to see every course Njia lists that
accepts it.</p>
<ul>
${grades.map(([g, n]) => `  <li><a href="/grades/${GRADE_SLUG[g]}/">${esc(GRADE_PHRASE[g])}</a> — ${n} courses</li>`).join('\n')}
</ul>
<p>Grades above C+ are not listed separately because almost the whole catalogue is open to
them — <a href="/#decide">use Decide</a> to filter by county, budget and interest instead.</p>
<p><a class="cta" href="/#discover">Take the 20-minute diagnostic</a></p>
</body>
</html>
`;
}

const counties = [...byCounty.keys()].sort();
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const county of counties) {
  const dir = path.join(OUT, slug(county));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), coursePage(county, byCounty.get(county)));
}
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(counties));

const GRADES_OUT = path.join(root, 'grades');
fs.rmSync(GRADES_OUT, { recursive: true, force: true });
fs.mkdirSync(GRADES_OUT, { recursive: true });
const gradePages = [];
for (const grade of Object.keys(GRADE_SLUG)) {
  const rows = reachableAt(grade);
  if (rows.length / COURSES.length > GRADE_PAGE_MAX_SHARE) continue;
  const dir = path.join(GRADES_OUT, GRADE_SLUG[grade]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), gradePage(grade, rows));
  gradePages.push([grade, rows.length]);
}
fs.writeFileSync(path.join(GRADES_OUT, 'index.html'), gradeIndexPage(gradePages));

/* The sitemap is generated with them rather than maintained by hand, because a
 * hand-maintained list of 48 URLs is a list that goes stale. */
const today = process.env.NJIA_BUILD_DATE || new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE}/counties/`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${SITE}/grades/`, priority: '0.9', changefreq: 'weekly' },
  ...gradePages.map(([g]) => ({ loc: `${SITE}/grades/${GRADE_SLUG[g]}/`, priority: '0.8', changefreq: 'monthly' })),
  ...counties.map((c) => ({ loc: `${SITE}/counties/${slug(c)}/`, priority: '0.7', changefreq: 'monthly' }))
];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED by tools/build-static-pages.mjs — do not hand-edit.

  Njia's app is a single page, but the catalogue underneath it is not, and for
  a long time neither was crawlable: everything rendered client-side, so a
  search engine saw under a thousand characters of chrome and one URL. Netlify
  Analytics showed the result — the top locations for a Kenyan product were the
  United States and Canada, which is developer traffic and crawlers, not
  readers. A learner searches "TVET courses in Turkana", not "career pathway
  platform", and there was nothing to rank.

  These county pages are real content, not doorways: each carries its county's
  actual courses, entry grades and fees, and says plainly when nothing in that
  county is open to a low-grade learner.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

console.log(`wrote counties/index.html + ${counties.length} county pages`);
console.log(`wrote grades/index.html + ${gradePages.length} grade pages: ${gradePages.map(([g, n]) => `${g}=${n}`).join(' ')}`);
console.log(`wrote sitemap.xml with ${urls.length} URLs (lastmod ${today})`);
