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


/* ONE SHELL, SHARED BY ALL FOUR PAGE TYPES.
 *
 * These four templates each carried their own near-identical <style> block —
 * the same body rule, the same table rule, the same .cta — copied four times.
 * Three of the four said `max-width: 62rem` and the fourth said 48rem, and
 * nothing recorded whether that difference was a decision or a slip.
 *
 * WHAT 62rem COST. Measured at 1600px: the content column was 957px and the
 * page left ~320px of empty cream down each shoulder — 40% of the viewport
 * unused. That would merely be plain if the content were comfortable, and it
 * was not: inside those 957px the six-column county table wrapped "Open entry"
 * onto two lines, wrapped "Not published" onto two lines, wrapped "Ksh 134,378"
 * onto two lines, and wrapped nearly every institution name. Every row cost two
 * line-heights instead of one, so the Nairobi page ran to 7,800px of table.
 * The blank space was not the price of a comfortable measure — the reader was
 * paying for the margins twice, once in emptiness and once in scrolling.
 *
 * THE FIX IS NOT SIMPLY "WIDER". A 1500px line of prose is unreadable, so the
 * shell does not just uncap. It splits: a sticky rail holds the things a reader
 * refers back to (the heading, what the page contains, the calls to action, and
 * the county's institutions or the grade page's jump list), and the main column
 * holds the table. Prose keeps a sane measure because the rail caps at 18rem;
 * the table gets ~1130px because it is the thing that actually needed the room.
 * The rail earns its place rather than filling space: on a page that scrolls
 * for 6,000px, the "filter these by your grade" button and the list of
 * institutions stay on screen instead of being left behind at the top.
 *
 * This is the same rail-plus-content shape .landing-block already uses in the
 * app at 1024px+, so the static pages now read as part of the same site rather
 * than as a separate, narrower one.
 *
 * Below the split breakpoint nothing changes structurally: the grid does not
 * apply, the rail and the main column are ordinary blocks in source order, and
 * the page reads top to bottom exactly as it did.
 */
const SHELL_CSS = `
  /* Deliberately minimal and self-contained. These pages reuse the app's
     stylesheet for colour and type, but none of its layout JavaScript, so
     they render identically with scripting switched off. */
  body { max-width: min(96rem, 100%); margin: 0 auto; padding: 1.5rem clamp(1.1rem, 2.5vw, 2.25rem) 4rem; }
  .rail > :first-child { margin-top: 0; }
  .main > :first-child { margin-top: 0; }
  h1 { margin-top: .35rem; }
  .lede { font-size: 1.05rem; }
  table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: .94rem; }
  th, td { text-align: left; padding: .55rem .5rem; border-bottom: 1px solid var(--ink-veil, rgba(61,28,2,.12)); vertical-align: top; }
  thead th { font-size: .78rem; text-transform: uppercase; letter-spacing: .07em; }
  tbody th { font-weight: 600; }
  /* Level, entry grade, tuition and duration are short fixed tokens — "Artisan",
     "D-", "Ksh 134,378", "24 mo". Left to wrap they each cost a second line and
     doubled the height of every row in the table; there is no case where
     breaking "Ksh 134,378" across two lines helps anyone read it. The course and
     institution columns are the ones that genuinely need to wrap, and still do.

     Gated, because on a phone it is the wrong trade and measuring said so. At
     390px the county table went from 647px to 738px wide with nowrap on and the
     page got no shorter — 13,580px to 13,560px. The rows were never the
     constraint there, the 390px viewport was, so all nowrap bought was 91px
     more sideways scrolling inside .wrap. From 48rem up the table fits the
     screen outright and the second line is pure waste. */
  @media (min-width: 48rem) { .tok { white-space: nowrap; } }
  .open { font-weight: 700; }
  .muted { opacity: .7; }
  /* tabindex="0" is not decoration. A table wider than the viewport scrolls
     sideways inside this box, and a scroll container that cannot take focus
     cannot be scrolled by keyboard — so at 390px a keyboard-only reader could
     not reach the Tuition or Duration columns at all. axe rates it serious and
     found 76 instances across the generated pages, 21 of them on the D-plain
     grade page alone. The role and label come with it because a focus stop
     with no accessible name announces as nothing. Set in the markup rather
     than here: CSS cannot make an element focusable. */
  .wrap { overflow-x: auto; }
  .wrap:focus-visible { outline: 2px solid var(--accent, #C8860A); outline-offset: 2px; }
  .cta { display: inline-block; margin: .4rem .5rem .4rem 0; padding: .7rem 1.1rem; border-radius: .5rem;
         background: var(--primary, #8B2500); color: var(--bg, #F5E9D4); text-decoration: none; font-weight: 700; }
  .back { display: inline-block; margin-bottom: .75rem; }
  footer { margin-top: 2.5rem; font-size: .85rem; opacity: .8; }
  /* column-width rather than a column COUNT: a fixed count set at one breakpoint
     is wrong at every other width, and these lists run from 1 item to 47. */
  ul.cols { columns: 15rem; column-gap: 2rem; }
  ul.cols li { break-inside: avoid; }

  /* OPT-IN, AND NOT AT 1024px.
   *
   * Both halves of that were learned by measuring rather than reasoned out.
   *
   * Opt-in, because the grid targets body and the two index pages are a
   * heading and a list of links with no rail to put anything in. Applied to
   * them, their children would have auto-placed into two columns and the
   * layout would simply have been wrong — so the split is a class the two
   * table-bearing templates ask for, not something every page inherits.
   *
   * And not at 1024px, because the first version of this cut in there and made
   * the page WORSE: a 20rem rail plus the gap left the Nairobi table 621px,
   * narrower than the 957px it had before, so it began scrolling sideways and
   * every row wrapped harder. The document went from 9,099px to 12,074px — a
   * layout added to reclaim wasted space had spent 3,000px of extra scrolling
   * to do it. The rail only pays once what is left over still fits the table,
   * which for a six-column table is about 950px, so the cut is at 85rem. Below
   * that the page is a single full-width column, which at 1280px is already a
   * 1,200px table against the old 957px.
   */
  @media (min-width: 85rem) {
    body.split { display: grid; grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
                 column-gap: clamp(2rem, 3vw, 3rem); align-items: start; }
    /* min-width: 0 or the table's intrinsic width blows the column out and
       takes the rail's space back, which is the bug this layout exists to fix. */
    .split .main { min-width: 0; }
    .split .rail { position: sticky; top: 1.5rem;
            /* Nairobi lists 29 institutions, which is a rail taller than the
               viewport — pinned without this, its foot is simply unreachable. */
            max-height: calc(100vh - 3rem); overflow-y: auto; }
    .split .rail ul.cols { columns: auto; }
    /* The footer is a body-level landmark now (contentinfo), which makes it a
       third grid child — without this it would drop into the rail's column
       under the sticky box instead of closing the page across it. */
    .split > footer { grid-column: 1 / -1; }
  }

  /* The eligibility floor, as a figure block rather than a sentence. */
  .prov { margin: 1.1rem 0; padding: .85rem 0; border-top: 1px solid var(--ink-veil, rgba(61,28,2,.12));
          border-bottom: 1px solid var(--ink-veil, rgba(61,28,2,.12)); font-size: .88rem; }
  .prov > div { display: flex; justify-content: space-between; gap: 1rem; padding: .22rem 0; }
  .prov dt { color: inherit; opacity: .8; }
  .prov dd { margin: 0; font-family: var(--mono, ui-monospace, monospace); font-variant-numeric: tabular-nums;
             font-weight: 700; white-space: nowrap; }

  /* The printed brief's masthead. Absent from the screen page, which already
     has a heading and a back link and does not need a second identity. */
  .brief-head { display: none; }

  /* ---------- PRINT: a county page is a deliverable ----------------------
   *
   * Ctrl-P on a county page produces a branded provision brief — the mark, the
   * county, the eligibility floor, who runs what, and every course with its
   * fee and entry grade. It goes to a career teacher, a bursary committee or a
   * county education officer, which is the audience Njia has no other way of
   * reaching.
   *
   * No library and no server: the data is already in the page, so this is a
   * stylesheet, not a feature. That also means it works offline and from a
   * saved page, which matters for the offices that need it most.
   *
   * What gets dropped is anything that cannot be acted on from paper — the
   * buttons, the back link, the scroll affordances. What gets kept is every
   * figure and the provenance paragraph, because a brief whose numbers cannot
   * be checked is the thing this project exists not to publish. */
  @media print {
    @page { margin: 14mm 12mm; }
    body, body.split { display: block !important; max-width: none; padding: 0; font-size: 10pt; }
    .rail, .main { position: static !important; max-height: none !important; overflow: visible !important; }
    /* .jump-head goes with .jump. Hiding the list but keeping its heading
       left "Jump to a county" printed above nothing at all — anchors do not
       work on paper, so both halves have to go. */
    .cta, .back, .jump, .jump-head { display: none !important; }
    /* The scroll box must not clip on paper — there is no scrolling on paper,
       so an overflow container silently truncates the right-hand columns. */
    .wrap { overflow: visible !important; }
    table { font-size: 8.5pt; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    h2 { break-after: avoid; margin-top: 1.2em; }
    .brief-head {
      display: flex; align-items: center; gap: 10px;
      border-bottom: 2px solid var(--primary, #8B2500);
      padding-bottom: 6px; margin-bottom: 10px;
    }
    .brief-mark { width: 26px; flex: none; }
    .brief-mark svg { display: block; width: 100%; height: auto; }
    .brief-word { font-family: var(--serif, Georgia, serif); font-weight: 700; font-size: 15pt; line-height: 1; }
    .brief-tag { font-size: 6.5pt; letter-spacing: .08em; text-transform: uppercase; opacity: .75; }
    .brief-meta { margin-left: auto; text-align: right; font-size: 7.5pt; line-height: 1.35; }
    .prov { break-inside: avoid; }
    .prov > div { padding: .12rem 0; }
  }
`;

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

/* THE BRAND LOCKUP, INLINED RATHER THAN LINKED.
 *
 * A county page printed to PDF is a deliverable that leaves the site — it goes
 * to a career teacher, a bursary committee, a county education officer — so it
 * has to carry the mark. An <img src="/icons/logo-mark.svg"> would not reliably
 * do that: browsers routinely drop external images from print, and this project
 * has already shipped a PDF report whose logo never loaded. Inlined SVG cannot
 * fail that way.
 *
 * The comments are stripped on the way in. logo-mark.svg is 4.9KB and most of
 * it is prose explaining why the silhouette is a leaf and not a shield, which
 * is worth reading once in the source and not worth shipping 47 times. */
const BRAND_MARK = fs.readFileSync(path.join(root, 'icons', 'logo-mark.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/* WHAT A DECISION-MAKER NEEDS THAT A COURSE TABLE DOES NOT GIVE THEM.
 *
 * Njia already computes the eligibility floor — how many courses in a county an
 * E-grade learner can actually enter — and until now it existed only as a
 * constant in tests/sector-coverage.test.js. It is the most decision-changing
 * number the project holds and no reader could see it.
 *
 * "Nakuru lists 20 courses" and "an E-grade learner in Nakuru can enter 0 of
 * them" are the same catalogue described two ways, and only the second one
 * tells a county officer something they can act on. */
function provision(rows) {
  const grades = rows.map((r) => r.course.min_grade);
  const lowest = grades.some((g) => g == null)
    ? 'Open entry'
    : grades.filter(Boolean).sort((a, b) => rank(b) - rank(a))[0];
  return {
    courses: rows.length,
    openToE: rows.filter((r) => rank('E') <= rank(r.course.min_grade)).length,
    lowest,
    /* Deliberately "a fee figure or not" rather than the app's five-way fee
       basis. That classifier is guarded in tests and lives in js/decide.js;
       re-implementing it here would be a second copy free to drift, and this
       summary does not need the resolution. */
    withFee: rows.filter((r) => r.course.total_fees_kes != null).length
  };
}

/* Institutions with what a reader actually has to compare: who runs it, what
   levels it teaches, and the lowest door into the place. */
function institutionRows(rows) {
  const by = new Map();
  for (const r of rows) {
    if (!by.has(r.inst.id)) by.set(r.inst.id, { inst: r.inst, courses: [] });
    by.get(r.inst.id).courses.push(r.course);
  }
  return [...by.values()]
    .sort((a, b) => a.inst.name.localeCompare(b.inst.name))
    .map(({ inst, courses }) => {
      const grades = courses.map((c) => c.min_grade);
      const lowest = grades.some((g) => g == null)
        ? 'Open entry'
        : grades.filter(Boolean).sort((a, b) => rank(b) - rank(a))[0];
      const levels = [...new Set(courses.map((c) => c.level))]
        .sort((a, b) => Object.keys(LEVEL_LABEL).indexOf(a) - Object.keys(LEVEL_LABEL).indexOf(b))
        .map((l) => LEVEL_LABEL[l] || l);
      return { inst, n: courses.length, levels, lowest };
    });
}

/* One header for every printable sheet.
 *
 * It began as a county-only thing and the grade pages went without, which meant
 * the sheet a CAREER TEACHER prints — "what can a D+ actually do" — came off the
 * printer unbranded, undated and with no address on it, while the sheet for a
 * county officer was a proper brief. That is backwards: the teacher is the one
 * who photocopies it thirty times and hands it round a Form Four class, so it is
 * the copy most likely to be read by someone who has never heard of Njia and
 * needs to know where the numbers came from. */
function briefHead(title, detail) {
  return `
<div class="brief-head">
  <div class="brief-mark">${BRAND_MARK}</div>
  <div>
    <div class="brief-word">Njia</div>
    <div class="brief-tag">Data-driven career pathways for Kenyan youth</div>
  </div>
  <div class="brief-meta">
    <strong>${esc(title)}</strong><br>
    ${detail} &middot; njiacareerpathways.work
  </div>
</div>`;
}

function coursePage(county, rows) {
  const sorted = [...rows].sort((a, b) => rank(b.course.min_grade) - rank(a.course.min_grade)
    || a.course.name.localeCompare(b.course.name));
  const institutions = [...new Set(rows.map((r) => r.inst.name))].sort();
  const clusters = [...new Set(rows.map((r) => r.course.cluster))];
  const prov = provision(rows);
  const instRows = institutionRows(rows);
  const levels = [...new Set(rows.map((r) => r.course.level))];

  const title = `Courses in ${county} County — fees, entry grades and institutions | Njia`;
  const desc = `${rows.length} courses at ${institutions.length} institution${institutions.length === 1 ? '' : 's'} in `
    + `${county} County, Kenya, with entry grades and fees. ${levels.map((l) => LEVEL_LABEL[l]).join(', ')}.`;

  const rowsHtml = sorted.map(({ course: c, inst: i }) => `
        <tr>
          <th scope="row">${esc(c.name)}</th>
          <td>${esc(i.name)}</td>
          <td class="tok">${esc(LEVEL_LABEL[c.level] || c.level)}</td>
          <td class="tok">${c.min_grade ? esc(c.min_grade) : '<span class="open">Open entry</span>'}</td>
          <td class="tok">${c.total_fees_kes == null ? '<span class="muted">Not published</span>' : esc(money(c.total_fees_kes))}</td>
          <td class="tok">${c.duration_months} mo</td>
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
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  .rail h2 { font-size: 1rem; margin: 1.6rem 0 .4rem; }
  .rail ul { font-size: .88rem; line-height: 1.5; padding-left: 1.1rem; }
  .rail ul li { margin-bottom: .3rem; }
  caption { text-align: left; font-size: .85rem; opacity: .75; padding-bottom: .4rem; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="split">
${briefHead(`${county} County provision brief`, `${prov.courses} courses \u00b7 ${prov.openToE} open to an E`)}

<aside class="rail">
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<h1>Courses in ${esc(county)} County</h1>

<p class="lede"><strong>${rows.length} course${rows.length === 1 ? '' : 's'}</strong> at
${institutions.length} institution${institutions.length === 1 ? '' : 's'}, covering
${clusters.map((c) => esc(CLUSTER_LABEL[c] || c)).join(', ')}.</p>

<p>${esc(floorSentence(county, rows))}</p>

<!-- The eligibility floor, published. Njia has computed this number since the
     coverage metric was introduced and kept it in a test constant, where no
     reader could see it. "112 courses" and "15 of them open to an E" are the
     same county described twice, and only the second tells a school-leaver
     with an E, or the officer funding them, anything they can act on. -->
<dl class="prov">
  <div><dt>Courses listed</dt><dd>${prov.courses}</dd></div>
  <div><dt>Open to an E-grade learner</dt><dd>${prov.openToE}</dd></div>
  <div><dt>Lowest entry requirement</dt><dd>${esc(String(prov.lowest))}</dd></div>
  <div><dt>Institutions</dt><dd>${instRows.length}</dd></div>
  <div><dt>Showing a fee figure</dt><dd>${prov.withFee} of ${prov.courses}</dd></div>
</dl>

<p><a class="cta" href="/#decide">Filter these by your grade and budget &rarr;</a>
<a class="cta" href="/#discover">Take the 20-minute diagnostic</a></p>

<!-- Moved up out of the page foot. Sitting below the table it was a bulleted
     list one item to a line under 7,800px of rows, which meant nobody reading
     a course ever saw it; beside the table it answers "who actually runs these"
     while the reader is looking at the answer. -->
</aside>

<main class="main">
<div class="wrap" tabindex="0" role="region" aria-label="Course table for ${esc(county)} County">
<table>
  <caption>Every course Njia lists in ${esc(county)} County, lowest entry requirement first.</caption>
  <thead><tr><th scope="col">Course</th><th scope="col">Institution</th><th scope="col" class="tok">Level</th>
  <th scope="col" class="tok">Min grade</th><th scope="col" class="tok">Tuition</th><th scope="col" class="tok">Duration</th></tr></thead>
  <tbody>${rowsHtml}
  </tbody>
</table>
</div>

<h2>Institutions in ${esc(county)}</h2>
<div class="wrap" tabindex="0" role="region" aria-label="Institutions in ${esc(county)} County">
<table>
  <caption>Who runs the courses above, what levels they teach, and the lowest door into each.</caption>
  <thead><tr><th scope="col">Institution</th><th scope="col" class="tok">Ownership</th>
  <th scope="col">Levels taught</th><th scope="col" class="tok">Courses</th>
  <th scope="col" class="tok">Lowest entry</th></tr></thead>
  <tbody>${instRows.map((i) => `
    <tr><th scope="row">${esc(i.inst.name)}</th>
    <td class="tok">${esc(i.inst.ownership === 'public' ? 'Public' : 'Private')}</td>
    <td>${i.levels.map(esc).join(', ')}</td>
    <td class="tok">${i.n}</td>
    <td class="tok">${esc(String(i.lowest))}</td></tr>`).join('')}
  </tbody>
</table>
</div>

<h2>About these figures</h2>
<p>Fees are tuition only and most are worked out by applying a published rate to the
course rather than quoted by the institution for that course — the app shows which is
which on every card, and never shows a figure it cannot source. Entry grades and fees
change; confirm with the institution before you decide anything.</p>
<p>Njia does not publish employment rates or salaries per course, because Kenya does not
publish that data and an invented figure is worse than a missing one.</p>
</main>

<footer>
  <p><a href="/counties/">All 47 counties</a> &middot;
     <a href="/analysis/">How this county compares</a> &middot;
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
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  /* Forty-seven links and three lines of prose is not a rail-and-content page:
     no .split here, and a measure that stays readable at any width. */
  body { max-width: 68rem; }
  ul.counties { columns: 12rem; column-gap: 2rem; font-size: .95rem; line-height: 1.9; }
  ul.counties li { break-inside: avoid; }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
<h1>Courses by county</h1>
<p>${total} courses at ${new Set(COURSES.map((c) => c.institution_id)).size} institutions across all
${counties.length} counties, with the entry grade and fee on every one.</p>
<p><a class="cta" href="/#decide">Filter by your grade and budget &rarr;</a></p>
<ul class="counties">
${counties.map((c) => `  <li><a href="/counties/${slug(c)}/">${esc(c)}</a></li>`).join('\n')}
</ul>
</main>
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
  <h3 id="c-${slug(county)}">${esc(county)} <span class="count">${inCounty.length}</span></h3>
  <div class="wrap" tabindex="0" role="region" aria-label="Courses in ${esc(county)}"><table>
    <thead><tr><th scope="col">Course</th><th scope="col">Institution</th>
    <th scope="col" class="tok">Level</th><th scope="col" class="tok">Min grade</th><th scope="col" class="tok">Tuition</th></tr></thead>
    <tbody>${inCounty.map(({ course: c, inst: i }) => `
      <tr><th scope="row">${esc(c.name)}</th><td>${esc(i.name)}</td>
      <td class="tok">${esc(LEVEL_LABEL[c.level] || c.level)}</td>
      <td class="tok">${c.min_grade ? esc(c.min_grade) : '<span class="open">Open entry</span>'}</td>
      <td class="tok">${c.total_fees_kes == null ? '<span class="muted">Not published</span>' : esc(money(c.total_fees_kes))}</td></tr>`).join('')}
    </tbody>
  </table></div>`;
  }).join('');

  /* THE RAIL EARNS ITS SPACE HERE.
     A grade page is a stack of per-county tables — 21 of them on D plain — and
     the reader's second question, immediately after "what can I do at all", is
     "what can I do near me". Until now that meant scrolling several thousand
     pixels looking for a county heading. The rail was going to be mostly empty
     beside a page this long, so it holds the answer instead. */
  const jump = counties.map((c) => {
    const n = rows.filter((r) => r.inst.county === c).length;
    return `<li><a href="#c-${slug(c)}">${esc(c)}</a> <span class="count">${n}</span></li>`;
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
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  table { margin: .6rem 0 1.4rem; font-size: .92rem; }
  th, td { padding: .5rem .45rem; }
  thead th { font-size: .76rem; }
  h3 { margin-top: 1.8rem; scroll-margin-top: 1.5rem; }
  .count { font-size: .8rem; font-weight: 400; opacity: .7; }
  .rail h2 { font-size: 1rem; margin: 1.6rem 0 .4rem; }
  /* One county to a line is right in the rail and wrong on a phone, where the
     rail is not a rail — it is the top of the page, and 21 stacked links cost
     628px before the reader reaches a single course. Wrapped inline it costs
     about a quarter of that and still does the job, which on a 21,000px page
     matters more on the small screen than the large one. */
  .jump { list-style: none; padding: 0; font-size: .9rem; line-height: 1.55;
          display: flex; flex-wrap: wrap; gap: 0 .9rem; }
  @media (min-width: 85rem) { .jump { display: block; } .jump li { margin-bottom: .25rem; } }
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="split">
${briefHead(`What ${GRADE_ARTICLE(grade)} ${phrase} can study`, `${rows.length} courses \u00b7 ${counties.length} counties \u00b7 for career teachers and students`)}

<aside class="rail">
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>

<h1>Courses you can do with ${GRADE_ARTICLE(grade)} ${esc(phrase)}</h1>

<p class="lede"><strong>${rows.length} courses</strong> across
<strong>${counties.length} counties</strong> are open to a KCSE mean grade of ${esc(phrase)} —
${byLevel.join(', ')}.</p>

<p><strong>TVET placement takes any KCSE grade, A to E</strong>, from anyone who sat the exam
from 2000 onward — not only this year's candidates. Intake runs continuously rather than in a
single annual window, so a closed university deadline is not the end of the cycle.</p>

<p><a class="cta" href="/#decide">Filter these by county and budget &rarr;</a>
<a class="cta" href="/#discover">Find which of them suits you</a></p>

<h2 class="jump-head">Jump to a county</h2>
<ul class="jump">${jump}</ul>
</aside>

<main class="main">
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
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  /* Seven links: a single measure, like the county index. */
  body { max-width: 52rem; }
  li { margin: .5rem 0; font-size: 1.02rem; }
</style>
</head>
<body>
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
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
</main>
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
  /* Generated by tools/build-open-data.mjs, listed here because sitemap.xml has
     one owner. The export is the page most likely to be found by someone who
     wants to check Njia's figures rather than use them, which is an audience
     worth being crawlable for. */
  { loc: `${SITE}/open-data/`, priority: '0.6', changefreq: 'monthly' },
  /* Generated by tools/build-provision-analysis.mjs, listed here for the same
     reason. It is the cross-county view no single county page can give, and the
     audience for it — a county education officer, a bursary committee — arrives
     by search rather than through the app. */
  { loc: `${SITE}/analysis/`, priority: '0.6', changefreq: 'monthly' },
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
