/* Njia — the machine-readable layer must parse, and must not out-claim the app.
 *
 * WHY THIS FILE EXISTS.
 *
 * Structured data is the one part of a page written for a reader who cannot
 * push back. A person who sees a wrong fee can ring the college; a crawler that
 * ingests a wrong claim republishes it as a rich result, in a search listing,
 * to people who never reach the page at all. So the JSON-LD is held to the same
 * standard as a course card, and to one extra: it must not assert anything the
 * app does not.
 *
 * THREE FAILURE MODES, ALL OF WHICH LOOK FINE IN A BROWSER.
 *
 * 1. INVALID JSON. A trailing comma or an unescaped quote makes the whole block
 *    silently ignored — the page renders identically, and the markup does
 *    nothing at all. Nothing in a normal test run executes it, so it can be
 *    broken for months.
 *
 * 2. MARKUP LEAKING INTO TEXT FIELDS. The FAQ answers in js/help.js contain
 *    <strong>, <a> and entities because the app renders them as HTML. Copied
 *    raw into an Answer's text, a search engine shows a reader "Yes &mdash;
 *    <strong>any grade</strong>". The generator strips tags; this checks it did.
 *
 * 3. COUNTS THAT DRIFT FROM THE CATALOGUE. The Dataset descriptions state the
 *    course, institution and county counts. Those are the figures a researcher
 *    reads in Google Dataset Search before deciding whether to download, and a
 *    stale one is a claim about the data made by the data itself.
 *
 * WHY llms.txt IS GUARDED HERE TOO.
 *
 * It is the file answer engines read, and its most important content is the
 * list of things Njia does NOT claim — no employment rates, no public-university
 * fee, and above all that a zero in the county analysis describes the catalogue
 * rather than the county. An answer engine that ingests the finding without the
 * caveat will restate "Turkana has no artisan training" to someone who cannot
 * check it. That sentence is load-bearing and is tested, not trusted.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const { COURSES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));

const listed = COURSES.filter((c) => INSTITUTIONS.some((i) => i.id === c.institution_id));
const institutionsWithCourses = new Set(listed.map((c) => c.institution_id));
const counties = new Set(INSTITUTIONS.map((i) => i.county));

const PAGES = ['index.html', 'open-data/index.html', 'analysis/index.html'];

function blocks(file) {
  const p = path.join(root, file);
  assert.ok(fs.existsSync(p), `${file} is missing`);
  const html = fs.readFileSync(p, 'utf8');
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

test('every JSON-LD block on every page is valid JSON', () => {
  /* Invalid JSON-LD is not a degraded rich result, it is no rich result — the
     block is discarded whole and the page looks perfect. */
  const broken = [];
  for (const f of [...PAGES, 'counties/nairobi/index.html', 'grades/e/index.html']) {
    blocks(f).forEach((b, i) => {
      try { JSON.parse(b); } catch (e) { broken.push(`${f}[${i}]: ${e.message}`); }
    });
  }
  assert.deepEqual(broken, [], `unparseable structured data: ${broken.join('; ')}`);
});

test('the app front page describes itself to a crawler', () => {
  /* index.html is the most-linked URL on the domain and carried nothing at all
     while every county page carried an ItemList. A crawler arriving at the
     front door learned less than one arriving three clicks in. */
  const parsed = blocks('index.html').map((b) => JSON.parse(b));
  const types = parsed.flatMap((d) => (d['@graph'] || [d]).map((n) => n['@type']));
  for (const want of ['Organization', 'WebSite', 'FAQPage']) {
    assert.ok(types.includes(want),
      `index.html has no ${want} in its structured data — found ${types.join(', ') || 'nothing'}. `
      + 'Run node tools/build-structured-data.mjs');
  }
});

test('the FAQ markup is emitted as text, not as escaped HTML', () => {
  /* HELP_FAQ answers contain <strong> and <a> because the app renders them.
     Passed through raw, a search result reads "<strong>any grade</strong>". */
  const graph = blocks('index.html').flatMap((b) => JSON.parse(b)['@graph'] || []);
  const faq = graph.find((n) => n['@type'] === 'FAQPage');
  assert.ok(faq && Array.isArray(faq.mainEntity) && faq.mainEntity.length > 20,
    'the FAQPage block is missing or has collapsed');

  const dirty = faq.mainEntity
    .filter((q) => /<[a-z/][^>]*>|&(amp|lt|gt|quot|#39|mdash|nbsp);/i.test(`${q.name} ${q.acceptedAnswer.text}`))
    .map((q) => q.name.slice(0, 50));
  assert.deepEqual(dirty.slice(0, 4), [],
    `these FAQ entries carry raw markup or entities into the structured data, which a search `
    + `engine renders literally: ${dirty.slice(0, 4).join(' | ')}`);

  const empty = faq.mainEntity.filter((q) => !q.name || !q.acceptedAnswer?.text).length;
  assert.equal(empty, 0, `${empty} FAQ entries have an empty question or answer`);
});

test('the FAQ in structured data matches the app, question for question', () => {
  /* A third copy of the FAQ would be a third thing free to drift, which is why
     the generator reads HELP_FAQ rather than restating it. This checks that it
     really did, by evaluating the same source the app loads. */
  const helpSrc = fs.readFileSync(path.join(root, 'js', 'help.js'), 'utf8');
  const sandbox = {};
  vm.runInNewContext(`${helpSrc.slice(0, helpSrc.indexOf('const HELP_GLOSSARY'))}; this.__faq = HELP_FAQ;`, sandbox);
  const appCount = sandbox.__faq.reduce((n, g) => n + g.items.length, 0);

  const graph = blocks('index.html').flatMap((b) => JSON.parse(b)['@graph'] || []);
  const faq = graph.find((n) => n['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, appCount,
    `the structured-data FAQ has ${faq.mainEntity.length} questions and the app has ${appCount}. `
    + 'Regenerate with node tools/build-structured-data.mjs.');
});

test('both data pages declare themselves as a Dataset with a real download', () => {
  /* Dataset markup is what puts these into Google Dataset Search, a separate
     index with a separate audience. Without a distribution carrying a real
     contentUrl the entry is a description of a file nobody can fetch. */
  for (const [file, expectedFiles] of [
    ['open-data/index.html', ['/open-data/njia-catalogue.csv', '/open-data/njia-catalogue.json']],
    ['analysis/index.html', ['/analysis/njia-county-provision.csv']]
  ]) {
    const ds = blocks(file).map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Dataset');
    assert.ok(ds, `${file} has no Dataset block — run node tools/build-structured-data.mjs`);
    assert.ok(ds.description && ds.description.length > 80, `${file} Dataset has no substantive description`);

    const urls = (ds.distribution || []).map((d) => d.contentUrl);
    for (const want of expectedFiles) {
      assert.ok(urls.some((u) => u.endsWith(want)),
        `${file} Dataset does not offer ${want} — declared: ${urls.join(', ') || 'nothing'}`);
      assert.ok(fs.existsSync(path.join(root, want.replace(/^\//, ''))),
        `${file} Dataset advertises ${want}, which does not exist on disk`);
    }
  }
});

test('the Dataset descriptions state the current catalogue size', () => {
  /* These are the numbers a researcher reads before downloading. A stale count
     is the dataset making a false claim about itself. */
  const ds = blocks('open-data/index.html').map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Dataset');
  const text = `${ds.name} ${ds.description}`;
  for (const [n, what] of [
    [listed.length, 'courses'],
    [institutionsWithCourses.size, 'institutions'],
    [counties.size, 'counties']
  ]) {
    assert.ok(text.includes(String(n)),
      `the catalogue Dataset description does not state ${n} ${what} — it reads: `
      + `"${ds.description.slice(0, 140)}…". Regenerate with node tools/build-structured-data.mjs.`);
  }
});

test('the analysis Dataset carries the caveat, not just the finding', () => {
  /* THE ONE THAT MATTERS MOST. This description is ingested by machines and
     restated to people who never see the page. "23 counties have no artisan
     training" without "as listed by Njia" is a false and damaging sentence, and
     the structured data is the likeliest route by which it escapes. */
  const ds = blocks('analysis/index.html').map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Dataset');

  /* The first version of this test accepted "not a census" OR "what Njia has
     listed" — generic hedges. Deleting the sentence that actually explains what
     a ZERO means left both in place and the test passed, which I found by
     removing the sentence and watching nothing happen. A guard that accepts a
     paraphrase of the wrong claim is not guarding the claim. It now requires
     the specific one: a zero describes the catalogue, not the county. */
  assert.match(ds.description, /zero means Njia has not listed provision/i,
    'the analysis Dataset description no longer explains what a ZERO means. A machine reading it '
    + 'will restate "this county has no artisan training" as a fact about Kenya, to people who '
    + 'cannot check it. The generic "measures what Njia has listed" hedge is not enough — the '
    + 'sentence has to name the zero.');
});

test('llms.txt exists and leads with what Njia does not claim', () => {
  const p = path.join(root, 'llms.txt');
  assert.ok(fs.existsSync(p), 'llms.txt is missing — run node tools/build-structured-data.mjs');
  const txt = fs.readFileSync(p, 'utf8');

  assert.match(txt, /no employment rate|No employment rates/i,
    'llms.txt does not state that Njia publishes no employment rates. An answer engine will '
    + 'otherwise assume the absence is an oversight and fill it from somewhere worse.');
  assert.match(txt, /Differentiated Unit Cost|no single per-programme price/i,
    'llms.txt does not explain why there is no public-university fee');
  assert.match(txt, /not listed in Njia's catalogue|Njia has not listed provision/i,
    'llms.txt does not carry the zero caveat — the single sentence that stops "23 counties have '
    + 'no artisan training" being restated as a fact about Kenya');

  for (const url of ['/counties/', '/grades/', '/open-data/', '/analysis/']) {
    assert.ok(txt.includes(url), `llms.txt does not point at ${url}`);
  }
});

test('llms.txt is served, not blocked', () => {
  /* A discovery file excluded by robots.txt is a discovery file that does not
     exist. /m/ is the only intended exclusion and it must stay the only one. */
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  const blocking = disallowed.filter((d) => d !== '/' && '/llms.txt'.startsWith(d));
  assert.deepEqual(blocking, [], `robots.txt blocks llms.txt via: ${blocking.join(', ')}`);
});
