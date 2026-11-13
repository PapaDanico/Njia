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
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '/'));

/* HELP_FAQ IS READ, NOT RESTATED.
 *
 * js/help.js ends in `window.renderHelpPage = ...` and exports nothing, so it
 * is evaluated in a vm with a window shim rather than required. That is
 * deliberate and it is the same rule /open-data/ follows for feeBasis(): a
 * second hand-written copy of the FAQ is a second thing free to drift, and the
 * structured-data generator already had to be stopped from making a third. */
const HELP = (() => {
  const src = fs.readFileSync(path.join(root, 'js', 'help.js'), 'utf8');
  const ctx = vm.createContext({ window: {}, document: {} });
  vm.runInContext(src, ctx);
  return vm.runInContext('({ HELP_FAQ, HELP_TUTORIALS, HELP_GLOSSARY })', ctx);
})();

const { EDUCATION_PIPELINE } = require('./data/labour-market.js');
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

/* Declared up here rather than beside the sitemap, because briefHead() needs it
   and a `const` read before its declaration is a temporal-dead-zone throw, not
   an undefined. Same NJIA_BUILD_DATE the CI artefact job pins, so a rebuild on
   an unchanged tree stays byte-identical instead of restamping 53 pages daily.
   Two renderings of one value: ISO for <lastmod>, which is a machine format the
   sitemap spec requires, and long-form for the printed sheet, which is read by
   a person holding a piece of paper. */
const BUILD_DATE = process.env.NJIA_BUILD_DATE || new Date().toISOString().slice(0, 10);
const BUILD_DATE_LABEL = new Date(`${BUILD_DATE}T00:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});

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
  th, td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid var(--ink-veil, rgba(61,28,2,.12)); vertical-align: top; }
  thead th { font-size: .78rem; text-transform: uppercase; letter-spacing: .07em; }
  tbody th { font-weight: 600; }
  /* A data table, not a list of paragraphs: one ruled header in the brand's
     ochre (a fill colour, so decorative only), aligned figures, and a row
     tint under the pointer so the eye can hold a line across six columns. */
  thead th { border-bottom: 2px solid var(--accent, #C8860A); color: var(--text-secondary); }
  td.tok, th.tok { font-variant-numeric: tabular-nums; }
  @media (hover: hover) { tbody tr:hover { background: rgba(200, 134, 10, .08); } }
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
  /* Link lists - the 47 counties, the grade pages' jump list, the help
   * contents - measured 16-20px tall on a 390px phone, so a thumb aimed at
   * Bomet lands on Baringo. Touch screens only: on a mouse the dense list is
   * the point, and on paper it is hidden. 44px is Apple's HIG floor and
   * clears WCAG 2.5.8 with room. */
  @media (pointer: coarse) {
    ul.counties a, .jump a, .toc a { display: inline-block; min-height: 44px; padding-block: .6rem; box-sizing: border-box; }
  }
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
 * needs to know where the numbers came from.
 *
 * AND IT HAS TO CARRY A DATE, which for a long time it did not.
 *
 * Print-emulating all four page families and searching the rendered text for a
 * date token returned nothing on any of them — county, grade and analysis alike
 * — while the app's own in-page report stamped "16 August 2026" correctly. The
 * branding shipped and the date did not, and nothing noticed because a print
 * stylesheet is only ever seen on paper.
 *
 * It matters more here than anywhere else in this project. These sheets are
 * designed to leave the internet: photocopied for a Form Four class, carried
 * into a bursary committee, filed in a county education office. The catalogue
 * has gone 436 to 463 to 469 courses inside a few months, so a brief quoting
 * "112 courses, 26 open to an E" is a claim with a shelf life. Undated, a sheet
 * printed last year is indistinguishable from one printed this morning — and
 * this repository already argues, about the staleness guards, that a brief
 * carrying last month's catalogue "looks exactly as authoritative as a current
 * one". The guard protects the file on disk. Only this line protects the paper. */
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
    ${detail}<br>
    ${BUILD_DATE_LABEL} &middot; njiacareerpathways.work
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
          <td class="tok">${c.duration_months == null ? 'Not published' : c.duration_months + ' mo'}</td>
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

/* THE PROPOSAL WAS PUBLISHED AND UNFINDABLE.
 *
 * docs/njia-pitch-deck-aug-2026.pdf was linked from exactly one place: a footer
 * link rendered client-side by js/app.js. Not in the served index.html, not in
 * any of the 53 generated pages, not in sitemap.xml, not in llms.txt, and with
 * no landing page of its own. That is the fifth instance of the pattern this
 * repository has already named four times — it works in the app and is absent
 * from everything else.
 *
 * It matters more for this file than for most. The audience is a funder, a
 * partner or a ministry contact, and every one of them arrives by search or by
 * a forwarded link, which are precisely the two routes that cannot see a link
 * the app draws after JavaScript runs.
 *
 * A landing page rather than a bare sitemap entry, for three reasons: a PDF
 * ranks poorly and previews badly when shared, a reader deserves to know what
 * they are about to download and how large it is before they spend the data,
 * and a learner who lands here by accident should be sent to the thing that is
 * actually for them rather than handed a funder deck.
 *
 * The size is read off the file rather than written down, because a figure
 * typed into prose beside a file that changes is a figure that goes wrong
 * quietly. */
const DECK_FILE = 'njia-pitch-deck-aug-2026.pdf';

/* THE PROPOSAL HAD NO WAY TO REPLY TO IT.
 *
 * The page above was written to make the deck findable, and it worked. What it
 * never carried was a route back: a funder or a county education officer could
 * read the whole case, download 2.6MB of deck, and then have no address to
 * write to. A conversion path that ends in a dead end is worse than one that
 * was never built, because the reader has already spent their attention.
 *
 * The address is a constant rather than prose in three places, so it can be
 * changed once. It must be a mailbox that has been shown to receive mail — a
 * personal address on a partnership page reads as a hobby, and a dead alias
 * reproduces the exact defect this block exists to close. */
/* THE ADDRESS IS GATED ON DELIVERABILITY, NOT ON WHICH DOMAIN IT SITS ON.
 *
 * partnerships@njiacareerpathways.work was the address this page wanted, and it
 * does not work. A raw DNS query for MX on njiacareerpathways.work returns
 * NOERROR with ZERO answers from 8.8.8.8, 1.1.1.1, 9.9.9.9 and 8.8.4.4, against
 * a control that resolves google.com's MX fine. The domain has no mail exchanger
 * at all, so anything sent there bounces. That is a verified negative rather
 * than an unknown, and publishing it anyway would be worse than carrying no
 * address: the reader writes, hears nothing, and concludes the project is dead.
 *
 * THE FLAG USED TO SAY "DOMAIN_MAIL_LIVE", AND THAT NAMED THE PROXY RATHER THAN
 * THE PROPERTY. The thing a funder needs is a mailbox that receives their mail.
 * The project domain was the preferred carrier of that property, not the
 * property itself — so the guard, and this constant, asserted the wrong noun,
 * which is the same trap as the artisan-variety count measuring spread instead
 * of evidence. A working address off-domain beats a dead one on it.
 *
 * The maintainer has designated njiacareerpathways@gmail.com as the project's
 * partnership mailbox. Two things had to be true before it could be published,
 * and both were checked rather than assumed:
 *
 *   - IT RECEIVES MAIL. The same four resolvers return five MX records for
 *     gmail.com, so this is a verified positive by the identical method that
 *     produced the verified negative above.
 *   - IT IS THE PROJECT'S MAILBOX AND ITS PUBLICATION WAS THE MAINTAINER'S
 *     CALL. A personal address on a funder-facing page is a disclosure decision
 *     that is not an agent's to make; this is a project alias, and the decision
 *     to advertise it was made by the maintainer explicitly. Do not substitute
 *     any individual's personal mailbox here on your own judgement.
 *
 * If the domain ever gets an MX record, move CONTACT_EMAIL back to
 * partnerships@njiacareerpathways.work — it is the stronger signal — and
 * re-run the MX query first. tests/partnership.test.js fails the build if an
 * address is published while MAIL_LIVE is false, if the published address sits
 * on the domain known to have no mail exchanger, or if llms.txt and the page
 * name different mailboxes. */
const MAIL_LIVE = true;
const CONTACT_EMAIL = 'njiacareerpathways@gmail.com';

/* The domain that is known, by query, to have no mail exchanger. Named here so
 * the guard checks a fact rather than a spelling, and so a future editor who
 * configures the MX has one place to look. */
const NO_MX_DOMAIN = 'njiacareerpathways.work';

/* A SECOND ROUTE, BECAUSE THE FIRST ONE CANNOT BE VERIFIED FROM HERE.
 *
 * Every host is egress-blocked in this build environment, so there is no way to
 * confirm that the alias above actually receives mail. Publishing an address
 * that might not exist would recreate the dead end this section was written to
 * close, only less visibly — the reader would write and hear nothing, which is
 * worse than finding no address at all.
 *
 * So the page carries a second route that is live today and needs nothing set
 * up: the repository's issue tracker. It is a strange thing to offer a funder
 * and a natural thing to offer the journalists, researchers and county analysts
 * who are the /open-data/ and /analysis/ audience, and it means the page
 * converts whether or not the mailbox is configured. */
const CONTACT_FALLBACK = 'https://github.com/PapaDanico/Njia/issues/new';
/* THE 48 ANSWERS THAT HAD NO URL.
 *
 * `HELP_FAQ` is six groups of question-and-answer pairs (48 when this was written), roughly
 * 4,600 words — the largest single body of prose this project has written, and
 * the closest thing it holds to what a learner actually types into a search
 * box: "can I do nursing with a D+", "does my data leave my phone", "is the
 * Germany 250,000 figure real". Every word of it lived inside the app, drawn
 * client-side by js/help.js, and a crawler that does not run JavaScript got
 * 2,980 characters of chrome from the served index.html and nothing else.
 *
 * The counties got static pages. The grades got static pages. /open-data/,
 * /analysis/ and /docs/ got static pages. Help never did, and nothing noticed,
 * because in the app it works perfectly. That is the sixth instance of the
 * pattern this file already names five times.
 *
 * ONE page, not forty-eight. A page per question would be forty-eight thin
 * documents differing by a paragraph, which is the doorway pattern the grade
 * pages were deliberately capped to avoid. Grouped under their own headings
 * with an id per question, one page carries the whole thing and still lets a
 * search engine deep-link a single answer.
 *
 * The content is READ from js/help.js at build time, never restated here. A
 * hand-written second copy is a second thing free to drift, and this project
 * has already had to stop a third copy being made — tools/build-structured-data.mjs
 * reads the same array for exactly this reason. */
const HELP_OUT = path.join(root, 'help');

function helpPage({ HELP_FAQ: groups, HELP_TUTORIALS: tutorials, HELP_GLOSSARY: glossary }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  /* All THREE structures, not just the FAQ. The first version of this page
     published HELP_FAQ alone and the tutorials and glossary stayed invisible —
     the same defect the page was written to fix, one third solved. The glossary
     is the sharpest of the three for search: "what is KUCCPS", "what does TVETA
     mean" are definitional queries a learner types verbatim, and sixteen of
     them were reachable only by tapping a tab inside a single-page app. */
  const toc = [
    '<li><a href="#how-njia-works">How Njia works</a></li>',
    ...groups.map((g) => `<li><a href="#${slug(g.group)}">${esc(g.group)}</a></li>`),
    '<li><a href="#glossary">Glossary</a></li>'
  ].join('\n');

  const tutorialBlock = `
<section>
<h2 id="how-njia-works">How Njia works</h2>
<p>Five steps, in the order most people take them. Every one is free, works on any
phone browser, and needs no account.</p>
${tutorials.map((t) => `<div class="faq">
  <h3 id="${slug(t.title)}">${esc(t.title)}</h3>
  <p class="meta">${esc(t.time)}</p>
  <ol>${t.steps.map((st) => `<li>${st}</li>`).join('')}</ol>
</div>`).join('\n')}
</section>`;

  const glossaryBlock = `
<section>
<h2 id="glossary">Glossary</h2>
<p>The ${glossary.length} abbreviations that appear on every Kenyan admission page,
in plain words.</p>
<dl class="glossary">
${glossary.map(([term, def]) => `  <dt id="${slug(term)}">${esc(term)}</dt>\n  <dd>${def}</dd>`).join('\n')}
</dl>
</section>`;
  const body = groups.map((g) => `
<section>
<h2 id="${slug(g.group)}">${esc(g.group)}</h2>
${g.items.map(([q, a]) => `<div class="faq">
  <h3 id="${slug(q).slice(0, 60)}">${esc(q)}</h3>
  <div>${a}</div>
</div>`).join('\n')}
</section>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>How Njia works, ${total} questions answered, and a glossary | Njia</title>
<meta name="description" content="How to use Njia in five steps, ${total} plain answers on KCSE grades, TVET and university entry, fees, HELB and bursaries, and a glossary of ${glossary.length} Kenyan admission terms.">
<link rel="canonical" href="${SITE}/help/">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<meta property="og:title" content="Questions about courses, fees and applying in Kenya">
<meta property="og:description" content="${total} plain answers for Kenyan school leavers — grades, fees, funding and applications.">
<meta property="og:image" content="${SITE}/icons/og-image.jpg?v=${OG_IMAGE}">
<meta property="og:url" content="${SITE}/help/">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  body { max-width: 60rem; }
  .faq { margin: 0 0 var(--space-5); }
  .faq h3 { font-size: 1.02rem; margin: 0 0 .35rem; }
  .faq > div { color: var(--text-secondary); max-width: var(--prose-max); }
  .faq p { margin: 0 0 .6rem; }
  section { margin-bottom: var(--space-7, 2.5rem); }
  .glossary dt { font-weight: 700; margin-top: var(--space-4); }
  .glossary dd { margin: .2rem 0 0; color: var(--text-secondary); max-width: var(--prose-max); }
  .toc { columns: 2; column-gap: 2rem; }
  @media (max-width: 40rem) { .toc { columns: 1; } }
  @media print { .toc, .cta { display: none; } .faq { break-inside: avoid; } }
</style>
</head>
<body>
${briefHead('Questions and answers', `${total} answers &middot; for career teachers and county officers`)}
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
<h1>How Njia works, and answers to ${total} questions</h1>
<p>${total} plain answers, written for school leavers and the people advising them.
Nothing here needs an account and nothing you read is tracked. If your question is
about a specific course or county, <a href="/counties/">browse by county</a> or
<a href="/grades/">start from your KCSE grade</a>.</p>
<ul class="toc">
${toc}
</ul>
${tutorialBlock}
${body}
${glossaryBlock}
<p><a class="cta" href="/#discover">Take the 20-minute diagnostic</a></p>
</main>
</body>
</html>
`;
}

const DOCS_OUT = path.join(root, 'docs');

function docsIndexPage(courseCount, institutionCount, countyCount) {
  const bytes = fs.statSync(path.join(DOCS_OUT, DECK_FILE)).size;
  const mb = (bytes / 1024 / 1024).toFixed(1);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Partnership proposal | Njia</title>
<meta name="description" content="Njia's partnership proposal for Kenya's education-to-employment transition, August 2026 — the case, the evidence base and what partnership looks like, as a PDF.">
<link rel="canonical" href="${SITE}/docs/">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  /* One document and a paragraph about it: a single measure, like the county
     and grade indexes. */
  body { max-width: 52rem; }
  li { margin: .45rem 0; }
  .dl { display: inline-block; margin: .3rem 0 .2rem; }
  .meta { color: var(--muted, #6b625a); font-size: .92rem; margin-top: .2rem; }
</style>
</head>
<body>
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
${briefHead('Partnership proposal', 'For funders, partners and county education offices')}
<h1>A Partnership Proposal for Kenya's Education-to-Employment Transition</h1>
<p>Njia is a free, open career-pathway platform for Kenyan school leavers. It lists
${courseCount} courses at ${institutionCount} institutions across ${countyCount} counties, with
entry grades, fees and — unusually — a column saying where each fee figure came from.</p>
<p>This proposal sets out the case for partnership: what the platform does, the evidence
behind it, what it deliberately refuses to claim, and where support would go.</p>
<p><a class="cta dl" href="/docs/${DECK_FILE}">Download the proposal (PDF, ${mb}&nbsp;MB)</a></p>
<p class="meta">August 2026 &middot; ${mb}&nbsp;MB PDF</p>
<h2>What partnership looks like</h2>
<p>Njia is free to every learner who uses it and intends to stay that way, so it is
funded from the institutional side rather than the student side. Four routes, in the
order they tend to fit:</p>
<ul>
<li><strong>County and institutional deployment.</strong> Kenya's National Policy Framework
on Career Guidance (2023) names career information as one of five thematic areas needing
resourcing, and most county education offices have no career-information system at all.
Njia already holds one, per county, with the provision analysis to show where the gaps are.</li>
<li><strong>Data licensing.</strong> The catalogue is published free as
<a href="/open-data/">CSV and JSON</a> and will remain so. What is licensable is the work
around it: bespoke extracts, a re-verification cadence against a named cycle, and
provenance auditing for organisations that need to cite the figures rather than browse them.</li>
<li><strong>Programme and research funding.</strong> The
<a href="/analysis/">county provision analysis</a> is the finding most likely to change how
money is allocated, and it is published in full rather than held back for a pitch.</li>
<li><strong>Institution listings.</strong> An institution may pay to have its provision
listed and kept current. It buys presence and accuracy, nothing else &mdash; see below.</li>
</ul>
<h2>Why this is worth funding</h2>
<p>The figures below are the platform's own, read from
<a href="/open-data/">the published dataset</a> and from the sourced labour-market record
that ships with it — ${esc(EDUCATION_PIPELINE.source)}.</p>
<ul>
<li><strong>${EDUCATION_PIPELINE.kcseCandidates.toLocaleString('en-KE')} KCSE candidates</strong>
sat the 2025 exam, and most choose what comes next with no data-driven way to decide.</li>
<li><strong>Capacity is not the constraint.</strong> Middle-level colleges can hold
${EDUCATION_PIPELINE.middleLevelCapacity.toLocaleString('en-KE')} students. Placements across
all institution types totalled 293,869 — roughly a quarter of the room available. The places
exist; what is missing is a way to find them, price them and pay for them.</li>
<li><strong>${(100 - EDUCATION_PIPELINE.qualifiedForDegreePct).toFixed(2)}% of candidates are not
competing for degrees at all.</strong> ${EDUCATION_PIPELINE.qualifiedForDegree.toLocaleString('en-KE')}
reached the C+ needed for direct university entry. Everyone else is choosing among diplomas,
certificates and artisan courses — the tier career guidance in Kenya covers worst.</li>
</ul>
<h2>Five ways to partner</h2>
<p>The four routes above are how Njia is funded. These are the five relationships that
actually move the number, and most of them cost nothing:</p>
<ul>
<li><strong>Schools.</strong> Embed Njia in career weeks and KCSE transition support. Zero
cost and zero data risk to students — nothing a learner enters leaves their phone. One
career teacher reaches a whole Form Four class, which is the distribution channel this
project otherwise lacks.</li>
<li><strong>Institutions.</strong> Universities, colleges and TVETs publish verified fees
and cut-offs and meet pre-matched applicants at the decision moment. Verified figures are
the contribution that matters most: only ${COURSES.filter((c) => c.fee_observed === true).length} of ${courseCount} fees in the catalogue were read off an institution's own published schedule, and the rest say so plainly rather than guessing.</li>
<li><strong>Employers and corporates.</strong> Sponsor sector or county coverage, offer
mentorship and site visits, and build early pipelines into growing sectors.</li>
<li><strong>NGOs and foundations.</strong> Fund county rollouts, offline access and reach
for marginalised youth, with auditable metrics that do not require tracking anyone.</li>
<li><strong>Government and agencies.</strong> Align with KUCCPS, TVETA, HELB and county
education offices to route learners into funded, accredited, real pathways.</li>
</ul>
<h2>Four levels of commitment</h2>
<p>Start anywhere. The first two cost nothing and move the needle today.</p>
<ul>
<li><strong>Join.</strong> List your institution, verify your fees and intakes, or register
as a mentor.</li>
<li><strong>Promote.</strong> Put Njia in front of your students, staff families or
community — career weeks, WhatsApp groups, radio.</li>
<li><strong>Support.</strong> Sponsor sector or county coverage, translations, offline packs
or data acquisition, with named attribution.</li>
<li><strong>Fund.</strong> Anchor multi-year sustainability. Grants or programme funding —
never paywalls, and never influence over results.</li>
</ul>
<h2>What we would report back</h2>
<p>Njia counts steps, never people. There are no accounts and no tracking, so partner
reporting is built from aggregate counts of milestones reached — questionnaire finished,
course shortlisted, application started — and from the catalogue itself, which anyone can
audit. What that means in practice:</p>
<ul>
<li><strong>Reach</strong> by county and by the tier a learner can actually enter, not just
totals.</li>
<li><strong>Match quality</strong> — the share of readers reaching a grade-eligible,
funded shortlist rather than an empty one. The
<a href="/analysis/">county provision analysis</a> is the honest baseline for that, including
the counties where the answer is currently zero.</li>
<li><strong>Evidence integrity</strong> — every figure cited, and unverifiable ones removed
rather than estimated. That is checked by the test suite on every deploy, not promised here.</li>
</ul>
<h2>What money cannot buy here</h2>
<p>This has to be said on the page rather than in a policy document nobody opens, because
the entire value of this catalogue is that its figures are not for sale:</p>
<ul>
<li><strong>Payment never affects ranking or ordering.</strong> No paid placement, no
featured slot, no thumb on the Course Matcher.</li>
<li><strong>Payment never affects a fee basis or an entry grade.</strong> A paid listing is
held to exactly the same provenance standard as every other record: a fee is published only
where someone read it off the institution's own schedule, and an unsourced figure is removed
rather than dressed up.</li>
<li><strong>A paid listing is disclosed as one</strong>, wherever it appears.</li>
<li>Njia remains independent and unaffiliated. If a listing cannot be honest, it is
declined and the money with it.</li>
</ul>
<h2>Getting in touch</h2>
${MAIL_LIVE ? `<p>One address, read by a person:
<a class="cta dl" href="mailto:${CONTACT_EMAIL}?subject=Njia%20partnership%20enquiry">${CONTACT_EMAIL}</a></p>` : ''}
<p><a class="cta dl" href="${CONTACT_FALLBACK}">Open an enquiry on the issue tracker</a></p>
<p class="meta">Useful things to include: who you are, which of the four routes above is
closest, and the county or institution involved. There is no form, no tracker and no
mailing list &mdash; the same reason the app has none.${MAIL_LIVE ? '' : ` Njia does not yet
advertise an email address, because the project domain has no mail exchanger configured and
anything sent to it would bounce silently &mdash; which is worse than no address at all. The
tracker is public, is read, and needs nothing set up.`}</p>
<p class="meta">Corrections to the catalogue are welcome on the same tracker, and are the
reason the data is published in full.</p>
<h2>If you are a student, this is not the page you want</h2>
<p>This document is written for funders and partners. If you are deciding what to study,
these are for you instead:</p>
<ul>
<li><a href="/grades/">What you can study with your KCSE grade</a> — from C plain down to E.</li>
<li><a href="/counties/">Every course by county</a> — 47 pages of entry grades and fees.</li>
<li><a href="/#discover">The 20-minute diagnostic</a> — free, and nothing you enter leaves your phone.</li>
</ul>
<h2>If you want to check the numbers</h2>
<p>Everything in the proposal comes from data published here in full:</p>
<ul>
<li><a href="/open-data/">The whole catalogue</a> as CSV and JSON, with a fee-provenance column.</li>
<li><a href="/analysis/">County provision analysis</a> — which counties list nothing a
school leaver with an E can enter, and why the gap is one missing tier.</li>
</ul>
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

fs.mkdirSync(HELP_OUT, { recursive: true });
fs.writeFileSync(path.join(HELP_OUT, 'index.html'), helpPage(HELP));

/* docs/ is NOT wiped and recreated the way counties/ and grades/ are: it holds
   the proposal PDF and two hand-written working documents, none of them
   generated. Only index.html is written here. */
fs.writeFileSync(path.join(DOCS_OUT, 'index.html'), docsIndexPage(
  COURSES.filter((c) => instById.has(c.institution_id)).length,
  new Set(COURSES.filter((c) => instById.has(c.institution_id)).map((c) => c.institution_id)).size,
  counties.length
));

/* ---- /pathways/ and /diagnostic/ ----------------------------------------
 * Two pages that answer questions a learner types into a search box and that
 * the app could only answer client-side: "what happens after Grade 9 under
 * CBE", and "is a career test any good". Both are generated, so a figure on
 * them is computed from the catalogue rather than typed, and both go through
 * the one SURFACES list (served link, sitemap, llms.txt).
 *
 * Every claim about Kenyan schooling here is attributed to where it was
 * reported, and where sources disagree the page says so instead of picking. The
 * placement criteria for the first CBE cohort are not final, and the page says
 * that rather than guessing at them. */
const GUIDANCE_OUT = { pathways: path.join(root, 'pathways'), diagnostic: path.join(root, 'diagnostic'), privacy: path.join(root, 'privacy'), accessibility: path.join(root, 'accessibility'), careers: path.join(root, 'careers') };

const DIAG_CLUSTERS = (() => {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root, 'data', 'questions.js'), 'utf8'), ctx);
  return vm.runInContext('Object.values(CLUSTERS).map((c) => c.name)', ctx);
})();

const LADDER = ['artisan', 'certificate', 'diploma', 'degree', 'short_course'].map((level) => {
  const rows = COURSES.filter((c) => c.level === level && instById.has(c.institution_id));
  return {
    level,
    places: rows.length,
    institutions: new Set(rows.map((c) => c.institution_id)).size,
    counties: new Set(rows.map((c) => instById.get(c.institution_id).county)).size,
    openToE: rows.filter((c) => c.min_grade == null || c.min_grade === 'E').length,
    withFee: rows.filter((c) => c.total_fees_kes != null).length
  };
});

function guidancePage({ dir, title, description, h1, detail, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Njia</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}/${dir}/">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/icons/logo-mark.svg">
<link rel="icon" href="/icons/icon-192x192.png">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/icons/og-image.jpg?v=${OG_IMAGE}">
<meta property="og:url" content="${SITE}/${dir}/">
<link rel="stylesheet" href="/css/styles.css">
<style>${SHELL_CSS}
  body { max-width: 60rem; }
  section { margin: 0 0 var(--space-10, 2.5rem); }
  section h2 { margin: 0 0 var(--space-3, .75rem); }
  section p { margin: 0 0 var(--space-4, 1rem); }
  section p, section li { max-width: var(--prose-max); }
  section ul { list-style: disc; padding-left: 1.25rem; margin: 0 0 var(--space-4, 1rem); }
  section li { margin: 0 0 var(--space-3, .75rem); line-height: 1.6; }
  .lede { margin: var(--space-3, .75rem) 0 var(--space-8, 2rem); max-width: var(--prose-max); }
  .note { border-left: 3px solid var(--accent); padding: .1rem 0 .1rem 1rem; color: var(--text-secondary); }
  .ladder { width: 100%; border-collapse: collapse; margin: var(--space-4) 0; }
  .ladder th, .ladder td { text-align: left; padding: .55rem .75rem .55rem 0; border-bottom: 1px solid var(--border); }
  .ladder td.num, .ladder th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .src { font-size: var(--fs-sm, .8125rem); color: var(--text-muted); }
  @media print { .cta { display: none; } section { break-inside: avoid; } }
</style>
</head>
<body>
${briefHead(h1, detail)}
<main>
<a class="back" href="/">&larr; Njia — data-driven career pathways for Kenyan youth</a>
<h1>${esc(h1)}</h1>
${body}
<p><a class="cta" href="/#discover">Take the 20-minute diagnostic</a></p>
</main>
</body>
</html>
`;
}

function pathwaysPage() {
  const L = Object.fromEntries(LADDER.map((r) => [r.level, r]));
  const rowsHtml = LADDER.filter((r) => r.places > 0).map((r) => `<tr>
  <th scope="row">${esc(LEVEL_LABEL[r.level])}</th>
  <td class="num">${r.places.toLocaleString('en-KE')}</td>
  <td class="num">${r.institutions.toLocaleString('en-KE')}</td>
  <td class="num">${r.counties}</td>
  <td class="num">${r.openToE.toLocaleString('en-KE')}</td>
  <td class="num">${r.withFee.toLocaleString('en-KE')}</td>
</tr>`).join('\n');
  const body = `
<p class="lede">Two school routes are running side by side in Kenya at the moment, and they lead to the same places: artisan and craft training, diplomas, degrees and work. This page sets out how they fit together, and what Njia can and cannot tell you about each. It needs no account and tracks nothing.</p>

<section>
<h2 id="kcse">The route most readers are on: KCSE</h2>
<p>After KCSE, most places in universities and colleges are applied for through KUCCPS, the national placement service, using your mean grade and, for many courses, subject grades beside it. Njia's catalogue is built on this route. Every course card carries its entry grade, and the <a href="/grades/">grade pages</a> show what is open from C plain down to E. A learner with an E can still enter artisan training and some certificates, and the <a href="/counties/">county pages</a> show where.</p>
</section>

<section>
<h2 id="cbe">The new route: junior school, senior school pathways and CBE</h2>
<p>These points are as reported by the news outlets named under each. The official sources are the Ministry of Education, KICD (curriculum designs) and KUCCPS, and anything that matters for your decision should be checked there.</p>
<ul>
<li><strong>Junior school ends at Grade 9</strong> with the Kenya Junior School Education Assessment (KJSEA). The first cohort sat it in 2025 and the Ministry said admission to senior school would begin on 12 January 2026. <span class="src">Reported by <a href="https://educationnews.co.ke/2025-kjsea-results-officially-released-as-placement-kicks-off/">Education News</a>.</span></li>
<li><strong>Senior school has three pathways</strong> in most descriptions: STEM, Social Sciences, and Arts and Sports Science. Some outlets still describe a fourth, Languages; reports on the rationalised design say Languages was folded into Social Sciences. <span class="src">Reported by <a href="https://thekenyatimes.com/latest-kenya-times-news/cbc-pathways-grade-10/">The Kenya Times</a>.</span></li>
<li><strong>Not every school offers every pathway or subject.</strong> Schools are described as triple-pathway or double-pathway, and subjects such as computer science and advanced laboratory sciences depend on a school's resources. <span class="src">Reported by <a href="https://thekenyatimes.com/education/cbc-categories-senior/">The Kenya Times</a>.</span></li>
<li><strong>Placement into senior school</strong>, as the Ministry described it, took account of learner choice, KJSEA performance, psychometric test results, regional equity and school capacity. Reports differ on how the parts were weighted, so Njia does not quote weights. <span class="src">Reported by <a href="https://www.kenyans.co.ke/news/119226-ministry-education-releases-grade-10-placement-kjsea-candidates-2025">Kenyans.co.ke</a>.</span></li>
<li><strong>Universities.</strong> KUCCPS has said it will place the first CBE learners from 2029 using a pathway model, with competency descriptors (Exceeding, Meeting, Approaching and Below Expectation) in place of the KCSE mean grade. The criteria are not final, and KUCCPS has said placement will follow requirements set by universities, colleges and regulators. <span class="src">Reported by <a href="https://radiogeneration.co.ke/education-and-career/91163/kuccps-to-place-first-cbe-learners-in-universities-using-pathway-model-from-2029">Radio Generation</a> and <a href="https://citizen.digital/article/kuccps-unveils-new-university-admission-system-under-cbe-n383208">Citizen Digital</a>.</span></li>
<li><strong>TVET.</strong> We found no published detail on how CBE learners will be placed into technical and vocational colleges.</li>
</ul>
<p class="note">Our reading, not a rule: a pathway sets the subjects you study, not the career you end up in, so keep your options broad until the placement criteria for your cohort are published. When you want to aim at a particular programme, look up its subject requirements now, because those are the part most likely to be written down in advance. Njia cannot yet tell a CBE learner which courses they will qualify for, and says so rather than guessing.</p>
</section>

<section>
<h2 id="ladder">The ladder in Njia's catalogue</h2>
<p>Qualifications in Kenya sit on a ladder. The Kenya National Qualifications Framework has ten levels, from basic education at Level 1 to the doctorate at Level 10, aligned to the East African Community framework and regulated by the Kenya National Qualifications Authority under the KNQF Act (<a href="https://www.knqa.go.ke/?p=549">KNQA</a>). Technical and vocational colleges are described as awarding qualifications at roughly Levels 3 to 6. Njia does not publish a level-by-level table because the descriptor table could not be read from here; the KNQA classification standard has it.</p>
<div class="wrap" tabindex="0" role="region" aria-label="Qualification ladder in Njia's catalogue">
<table class="ladder">
<caption>Places to apply in Njia's catalogue, by level of qualification</caption>
<thead><tr><th scope="col">Level</th><th scope="col" class="num">Places</th><th scope="col" class="num">Institutions</th><th scope="col" class="num">Counties</th><th scope="col" class="num">Open to an E</th><th scope="col" class="num">With a fee figure</th></tr></thead>
<tbody>
${rowsHtml}
</tbody>
</table>
</div>
<p class="src">A place is one course at one institution. Counted from Njia's catalogue on ${esc(BUILD_DATE_LABEL)}. A low count describes what Njia has listed, not what exists, and a fee figure may be published by the institution or derived from a published rate; <a href="/open-data/">the open data</a> says which for every course.</p>
</section>

<section>
<h2 id="moving-up">Moving up the ladder</h2>
<p>Most ladders are climbed one rung at a time, and a lower grade does not close the route. Some institutions publish a second way in beside the grade. Njia's course notes record, for example, a bridging certificate at Carlile College for applicants who do not meet the entry grade for its diploma, and a route into a diploma at the Kenya Wildlife Service Training Institute for applicants with a D+ and three years of relevant work. These are published by individual institutions, so confirm them with the institution: there is no single national rule that Njia can quote.</p>
<p>Not every route starts in a classroom. The NYOTA youth project says it aims to certify existing artisan skills through recognition of prior learning, alongside business grants and on-the-job experience for unemployed young people aged 18 to 29 (<a href="https://www.worldbank.org/en/results/2025/04/15/the-youth-dividend-investing-in-kenya-s-next-generation">World Bank</a>). Njia lists it under funding, with its limits and how to apply.</p>
<p>For help choosing between routes, the <a href="/diagnostic/">diagnostic page</a> explains what Njia's questionnaire can and cannot tell you, the <a href="/careers/">careers page</a> lists the roles courses lead to, and the <a href="/help/">questions and answers</a> cover grades, fees and funding.</p>
</section>`;
  return guidancePage({
    dir: 'pathways',
    title: 'Education and career pathways in Kenya: KCSE, CBE, TVET and university',
    description: 'How the KCSE and CBE routes fit together, what is reported about senior school pathways and university placement from 2029, and the qualification ladder in Njia\'s catalogue.',
    h1: 'Education and career pathways in Kenya',
    detail: 'KCSE, CBE, TVET and university &middot; for learners and career teachers',
    body
  });
}

function diagnosticPage() {
  const body = `
<p class="lede">Njia's questionnaire turns your answers into a shortlist of directions worth exploring, matched against real Kenyan courses, fees and funding. This page says plainly what it measures, how it counts, and what it is not, so you can decide how much weight to give it.</p>

<section>
<h2 id="what-it-is">What it is</h2>
<ul>
<li>A 20-minute questionnaire across four Elements: <strong>Identity</strong> (what you are drawn to), <strong>Community</strong> (who you want to work with), <strong>Necessity</strong> (your real constraints: grade, budget, timeline, obligations) and <strong>Horizon</strong> (where you want to end up).</li>
<li>Seven directions it can point to: ${DIAG_CLUSTERS.map(esc).join(', ')}.</li>
<li>Counting is fixed arithmetic. Each answer adds points to one or more directions, some questions count double, and the same answers always give the same result. There is no hidden model.</li>
<li>When two directions tie, the report says so instead of choosing one. The gap between first and second is shown as a margin, and the Element scores are clarity scores, not marks out of 100.</li>
<li>Your two written answers are printed back unchanged and are never scored.</li>
<li>Everything stays on your device. Nothing you answer is sent anywhere.</li>
</ul>
</section>

<section>
<h2 id="what-it-is-not">What it is not</h2>
<ul>
<li><strong>It is not a validated psychological test.</strong> It was designed by Njia and has no published reliability or validity figures.</li>
<li>It does not predict success or job satisfaction, it does not rank you against other people, and it has no pass mark or cut-off.</li>
<li>It does not decide anything. You can explore any direction whatever the result says, and a result that surprises you is as useful as one that confirms what you thought.</li>
</ul>
<p class="note">Use it the way you would use a good conversation: a prompt to look at options you had not considered, ideally talked through with a teacher, counsellor or someone who works in the field.</p>
</section>

<section>
<h2 id="evidence">Why Njia does not claim more</h2>
<p>Many career tools rest on Holland's six interest types (realistic, investigative, artistic, social, enterprising and conventional). The model is widely used, but the evidence that its structure holds across cultures is mixed: a structural meta-analysis by Rounds and Tracey found that the cross-cultural equivalence of Holland's circular ordering was not supported (<a href="https://experts.illinois.edu/en/publications/cross-cultural-structural-equivalence-of-riasec-models-and-measur/">Illinois Experts</a>), and work in South Africa describes limited evidence for diverse groups (<a href="https://jvrpsychometrics.co.za/blog/are-vocational-interests-valid-in-south-africa">JVR Psychometrics</a>). A continent-wide analysis of the model across 28 African countries exists (Morgan and de Bruin, 2018), and an African interest inventory has been studied with Ghanaian university students. We found no study validating a Holland-type inventory on Kenyan school-leavers. Absence of evidence is not evidence either way, which is why Njia presents its result as a prompt for exploration and not as a verdict.</p>
</section>

<section>
<h2 id="second-opinion">A free second opinion</h2>
<p>The U.S. Department of Labor publishes the <a href="https://www.onetcenter.org/tools.html">O*NET Interest Profiler</a> free of charge. It is a well-documented interest inventory, but it describes U.S. occupations, and it is intended for career exploration, planning and counselling rather than for hiring decisions. Treat its matches as ideas to look up in Kenya, not as Kenyan job titles.</p>
<p>Njia does not copy or adapt it. O*NET's licence allows copying the tool without modification (credit required), while modifying it requires a separate developer licence, so the honest options were to link to the original or to build something of our own. We chose to link, and to say what our own questionnaire is.</p>
<p class="src">Licence terms from <a href="https://www.onetcenter.org/license_tools.html">O*NET Career Exploration Tools Content License</a>.</p>
</section>`;
  return guidancePage({
    dir: 'diagnostic',
    title: 'About the Njia career diagnostic: what it measures and what it does not',
    description: 'What Njia\'s 20-minute career questionnaire measures, how it counts, why it is an exploration aid and not a validated test, and a free alternative to try.',
    h1: 'About the Njia diagnostic: what it measures and what it does not',
    detail: 'How the questionnaire works &middot; for learners and career teachers',
    body
  });
}

/* ---- /privacy/ and /accessibility/ ---------------------------------------
 * Trust pages. Each says only what the app does and what has actually been
 * tested, and says plainly where something has NOT been done. The privacy page
 * mirrors the in-app modal (index.html, openPrivacyModal) claim for claim, so
 * the two cannot disagree; tests/trust-pages.test.js holds the properties. */
function privacyPage() {
  const body = `
<p class="lede">Njia is built so that your answers never leave your phone. This page says exactly what that means, what is the one exception, and the single thing Njia does count. It needs no account because there is no account.</p>

<section>
<h2 id="on-your-device">What stays on your device</h2>
<p>Everything you enter in Njia (questionnaire answers, plans, saved courses and objectives) is kept in your browser's local storage on this device. None of it is sent to a server or shared with anyone. There are no accounts and nothing to sign in to.</p>
<p>Njia does not use cookies, trackers or third-party analytics: nothing from outside the app is loaded or told anything about you.</p>
</section>

<section>
<h2 id="exception">The one thing you type that can leave</h2>
<p>If you choose to submit the optional Feedback or Partner Inquiry form, whatever you type into that form is sent to us. It is the only data that leaves your device, and only if you submit it. Please leave out personal details you would not want read by a stranger.</p>
</section>

<section>
<h2 id="counting">The one thing Njia does count</h2>
<p>When someone finishes the questionnaire, saves a course, starts an application or downloads a report, Njia asks its own server for a small file named after that step. All that gets recorded is that the step happened once more than yesterday. Nothing about you goes with it: no name, no device or session number, no answers, not even which course. Two steps from you look exactly like one step from two different people, so there is no trail back to anybody. It is the same kind of record any website keeps of a page being opened.</p>
<p>It exists because, without knowing how many young people reach the end, Njia cannot be funded or taken up by a school. If your browser sends Do Not Track or Global Privacy Control, Njia counts nothing. Offline, it counts nothing either. Like any website, Njia's host also keeps ordinary request counts for the pages it serves.</p>
</section>

<section>
<h2 id="your-control">What you can do</h2>
<ul>
<li><strong>Back up and move.</strong> The privacy panel in the app exports a backup file, or copies the backup as text if your browser blocks downloads (the WhatsApp, Facebook and Instagram browsers often do). Nothing syncs automatically between devices.</li>
<li><strong>Wipe it.</strong> On a shared or borrowed phone, use Clear My Data before handing it back. It removes everything Njia stored on that device. It cannot recall a Feedback or Partner Inquiry you already sent.</li>
</ul>
</section>

<section>
<h2 id="limits">What this page does not claim</h2>
<p>Njia has not had a legal review under Kenya's Data Protection Act 2019. Because it holds no personal data on a server, little of the Act should apply, but that is our reading and not legal advice. If that changes, for example by adding accounts, this page changes first.</p>
</section>`;
  return guidancePage({
    dir: 'privacy',
    title: 'Privacy: what Njia keeps, what it counts, and what never leaves your phone',
    description: 'Njia keeps your answers on your device. What stays, the one form that can send data, the one step count it keeps, and how to back up or wipe your data.',
    h1: 'Privacy: what Njia keeps and what it counts',
    detail: 'Your data and this site &middot; for learners, parents and partners',
    body
  });
}

function accessibilityPage() {
  const body = `
<p class="lede">Njia is for readers on cheap phones, in bright light, on weak connections, many of them over forty. This page says what has been done to make it usable, what has been tested, and what has not.</p>

<section>
<h2 id="target">What Njia aims for</h2>
<p>The target is WCAG 2.2 at level AA. Njia does not claim to conform: automated tools find only part of the problems, and the claim would need a full manual audit that has not been recorded.</p>
</section>

<section>
<h2 id="done">What has been done</h2>
<ul>
<li><strong>Text size and contrast.</strong> Body text never falls below 12px, and text colours are held to the AA contrast ratio in both the light and dark schemes by automated checks.</li>
<li><strong>Keyboard.</strong> Interactive elements can be reached and used with a keyboard, and tables that scroll sideways can themselves be focused so their hidden columns are reachable.</li>
<li><strong>Structure.</strong> Pages use real headings in order, labelled regions and descriptive link text, and the app moves focus to the page heading when you change section.</li>
<li><strong>Motion and themes.</strong> Animation respects the reduced-motion setting, and light and dark schemes both follow your device.</li>
<li><strong>Print.</strong> Reports and the county and grade pages print as dated sheets.</li>
<li><strong>Weak connections.</strong> The app works offline once loaded, and the course catalogue is not on the path every first visit has to download.</li>
</ul>
</section>

<section>
<h2 id="tested">What has been tested</h2>
<p>An automated accessibility sweep (axe-core) runs over the app's routes and a sample of the generated pages, in the light and dark schemes, at phone and desktop widths, and it has been clean on each recent release. A scripted browser check drives the main flows, including a failing network, and measures what a reader would actually receive for items such as progress bars.</p>
</section>

<section>
<h2 id="not-tested">What has not been tested</h2>
<ul>
<li>No manual audit with screen readers (TalkBack, VoiceOver, NVDA) has been recorded.</li>
<li>No testing with people who use assistive technology has been recorded.</li>
<li>Reading level has not been tested with learners.</li>
</ul>
<p class="note">If something does not work for you, tell us: open an issue at <a href="https://github.com/PapaDanico/Njia/issues">github.com/PapaDanico/Njia/issues</a> and say which page and which device. Njia does not advertise an email address, because the project domain has no mail server configured and anything sent there would bounce silently.</p>
</section>`;
  return guidancePage({
    dir: 'accessibility',
    title: 'Accessibility: what Njia has done, what has been tested, and what has not',
    description: 'Njia\'s accessibility position: the WCAG 2.2 AA target, what has been built and automatically tested, and what has not been manually tested.',
    h1: 'Accessibility: what has been done and what has not',
    detail: 'Accessibility statement &middot; for readers and partners',
    body
  });
}

/* ---- /careers/ -------------------------------------------------------------
 * ONE page, not one per role. A page per job title would be several hundred
 * thin documents differing by a list of courses, which is the doorway pattern the
 * grade pages were capped to avoid. This is the cross-cutting view instead: for
 * each of the seven directions, the roles the most courses lead to, with the
 * levels those courses sit at and how many are open to a learner with an E.
 *
 * A "role" is a job title recorded against a course in the catalogue. It is not
 * an employment claim: Njia holds no employment rate or salary per course,
 * because Kenya does not publish either, and this page says so. */
const CAREER_DIRECTIONS = (() => {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root, 'data', 'questions.js'), 'utf8'), ctx);
  return vm.runInContext('Object.fromEntries(Object.entries(CLUSTERS).map(([k, v]) => [k, v.name]))', ctx);
})();
const CAREER_ROLES_PER_DIRECTION = 12;

const careerRows = (clusterId) => {
  const byRole = new Map();
  for (const c of COURSES) {
    if (c.cluster !== clusterId || !instById.has(c.institution_id)) continue;
    for (const role of c.career_paths || []) {
      const r = byRole.get(role) || { role, courses: 0, levels: new Set(), openToE: 0 };
      r.courses += 1;
      r.levels.add(c.level);
      if (c.min_grade == null || c.min_grade === 'E') r.openToE += 1;
      byRole.set(role, r);
    }
  }
  const LEVEL_ORDER = ['artisan', 'short_course', 'certificate', 'diploma', 'degree'];
  return [...byRole.values()]
    .sort((a, b) => b.courses - a.courses || (a.role.toLowerCase() < b.role.toLowerCase() ? -1 : 1))
    .slice(0, CAREER_ROLES_PER_DIRECTION)
    .map((r) => ({ ...r, levels: LEVEL_ORDER.filter((l) => r.levels.has(l)).map((l) => LEVEL_LABEL[l]) }));
};

function careersPage() {
  const sections = Object.entries(CAREER_DIRECTIONS).map(([id, name]) => {
    const rows = careerRows(id);
    return `
<section>
<h2 id="${slug(name)}">${esc(name)}</h2>
<div class="wrap" tabindex="0" role="region" aria-label="Roles for ${esc(name)}">
<table class="ladder">
<caption>Roles that the most ${esc(name)} courses lead to</caption>
<thead><tr><th scope="col">Role</th><th scope="col" class="num">Courses</th><th scope="col">Levels</th><th scope="col" class="num">Open to an E</th></tr></thead>
<tbody>
${rows.map((r) => `<tr><th scope="row">${esc(r.role)}</th><td class="num">${r.courses.toLocaleString('en-KE')}</td><td>${esc(r.levels.join(', '))}</td><td class="num">${r.openToE.toLocaleString('en-KE')}</td></tr>`).join('\n')}
</tbody>
</table>
</div>
</section>`;
  }).join('\n');
  const body = `
<p class="lede">A role here is a job title recorded against a course in Njia's catalogue. For each of the seven directions the questionnaire can point to, this page lists the roles that the most courses lead to, the levels those courses sit at, and how many are open to a learner with an E. It is a map of routes, not a forecast: Njia holds no employment rates or salaries per course, because Kenya does not publish them.</p>
<p class="src">Counted from the catalogue on ${esc(BUILD_DATE_LABEL)}. The ${CAREER_ROLES_PER_DIRECTION} most common roles are shown for each direction. A count describes what Njia has listed, not what exists. See <a href="/diagnostic/">what the questionnaire can and cannot tell you</a> and <a href="/pathways/">the pathways page</a> for how the levels fit together.</p>
${sections}`;
  return guidancePage({
    dir: 'careers',
    title: 'Careers by direction: the roles Kenyan courses lead to, and what level they start at',
    description: 'For each of seven career directions, the roles the most courses in Njia\'s catalogue lead to, the levels they start at, and how many are open to a learner with an E.',
    h1: 'Careers by direction: roles, levels and how to start',
    detail: 'Roles by direction &middot; for learners and career teachers',
    body
  });
}

for (const [dir, render] of [['careers', careersPage], ['pathways', pathwaysPage], ['diagnostic', diagnosticPage], ['privacy', privacyPage], ['accessibility', accessibilityPage]]) {
  fs.mkdirSync(GUIDANCE_OUT[dir], { recursive: true });
  fs.writeFileSync(path.join(GUIDANCE_OUT[dir], 'index.html'), render());
}

/* The sitemap is generated with them rather than maintained by hand, because a
 * hand-maintained list of 48 URLs is a list that goes stale. */
const today = BUILD_DATE;
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
  /* The partnership proposal's landing page. Low changefreq because the deck is
     dated and will be replaced rather than edited, and low priority because its
     audience is small — but it has to be in here at all, which it was not: the
     PDF was reachable only through a footer link the app drew client-side, so
     the one document written for people who arrive by search was the one
     document a search engine could not see. */
  { loc: `${SITE}/help/`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${SITE}/pathways/`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE}/careers/`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE}/diagnostic/`, priority: '0.7', changefreq: 'monthly' },
  { loc: `${SITE}/privacy/`, priority: '0.5', changefreq: 'yearly' },
  { loc: `${SITE}/accessibility/`, priority: '0.4', changefreq: 'yearly' },
  { loc: `${SITE}/docs/`, priority: '0.5', changefreq: 'yearly' },
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
console.log(`wrote help/index.html — ${HELP.HELP_TUTORIALS.length} tutorials, ${HELP.HELP_FAQ.reduce((n, g) => n + g.items.length, 0)} answers, ${HELP.HELP_GLOSSARY.length} glossary terms`);
console.log(`wrote sitemap.xml with ${urls.length} URLs (lastmod ${today})`);
