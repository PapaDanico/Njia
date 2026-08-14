/* Njia — generate one static, crawlable page per county.
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
 * WHAT THESE PAGES MUST NOT BECOME.
 *
 * Doorway pages. Each one has to be genuinely useful to a person who lands on
 * it from a search — which is why it carries the actual course table and the
 * county's real limitations, including "no course here takes an E" where that
 * is true. A page that exists only to catch a query and bounce the reader into
 * an app is the thing search engines are right to punish, and the thing this
 * project would deserve to be punished for.
 *
 * RUN:  node tools/build-county-pages.mjs
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
<meta property="og:image" content="${SITE}/icons/og-image.jpg">
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

const counties = [...byCounty.keys()].sort();
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const county of counties) {
  const dir = path.join(OUT, slug(county));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), coursePage(county, byCounty.get(county)));
}
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(counties));

/* The sitemap is generated with them rather than maintained by hand, because a
 * hand-maintained list of 48 URLs is a list that goes stale. */
const today = process.env.NJIA_BUILD_DATE || new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE}/counties/`, priority: '0.8', changefreq: 'weekly' },
  ...counties.map((c) => ({ loc: `${SITE}/counties/${slug(c)}/`, priority: '0.7', changefreq: 'monthly' }))
];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED by tools/build-county-pages.mjs — do not hand-edit.

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
console.log(`wrote sitemap.xml with ${urls.length} URLs (lastmod ${today})`);
