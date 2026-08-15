/* Njia — the open-data export must agree with the app, or it is worse than nothing.
 *
 * WHY THIS FILE EXISTS.
 *
 * open-data/ publishes the whole catalogue as CSV and JSON, and the column that
 * justifies its existence is fee_basis: whether each fee was published by the
 * institution, worked out from a published rate, or never published at all.
 * Anyone can produce a list of Kenyan courses and fees. Almost nobody says
 * which of their numbers they can actually stand behind.
 *
 * That makes a divergence between the export and the app the worst possible
 * failure here — worse than the export not existing. A file that says
 * "published" where the app says "derived" is a confident claim about
 * provenance that is itself unsourced, handed to someone who is going to cite
 * it. The generator therefore reads feeBasis() out of js/decide.js rather than
 * reimplementing it, and this file checks every row rather than trusting that.
 *
 * The staleness guard matters for the same reason. A stale export is not a
 * slightly-old export: fees and entry grades are the two things people act on,
 * and a CSV downloaded today carrying last month's catalogue looks exactly as
 * authoritative as a current one.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const { COURSES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));

const OUT = path.join(root, 'open-data');
const csvPath = path.join(OUT, 'njia-catalogue.csv');
const jsonPath = path.join(OUT, 'njia-catalogue.json');

/* Same extraction the generator and tests/sector-coverage.test.js use, so all
   three read one definition of the rule. */
function extractFn(source, name) {
  const at = source.indexOf(`function ${name}(`);
  if (at === -1) throw new Error(`${name}() not found`);
  let depth = 0;
  for (let i = source.indexOf('{', at); i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(at, i + 1); }
  }
  throw new Error('unbalanced braces');
}
const decideSource = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
const feeBasis = vm.runInNewContext(`${extractFn(decideSource, 'feeBasis')}; feeBasis`);

/* A real RFC 4180 reader. 444 of the 463 notes contain a comma or a quote, so a
   split(',') here would pass on a file no spreadsheet could open — the test
   would be checking a parser bug rather than the data. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

test('the export exists in both formats', () => {
  for (const p of [csvPath, jsonPath, path.join(OUT, 'index.html')]) {
    assert.ok(fs.existsSync(p), `${path.relative(root, p)} is missing — run node tools/build-open-data.mjs`);
  }
});

test('the export is not stale', () => {
  const newestSource = Math.max(
    fs.statSync(path.join(root, 'data', 'courses.js')).mtimeMs,
    fs.statSync(path.join(root, 'data', 'institutions.js')).mtimeMs,
    fs.statSync(path.join(root, 'js', 'decide.js')).mtimeMs
  );
  for (const p of [csvPath, jsonPath]) {
    assert.ok(fs.statSync(p).mtimeMs >= newestSource,
      `${path.basename(p)} is older than the data it describes. A stale export does not look `
      + 'stale to whoever downloads it — regenerate with node tools/build-open-data.mjs');
  }
});

test('every course with a known institution is exported, exactly once', () => {
  const known = new Set(INSTITUTIONS.map((i) => i.id));
  const expected = COURSES.filter((c) => known.has(c.institution_id));
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

  assert.equal(rows.length, expected.length,
    `the CSV has ${rows.length} rows for ${expected.length} exportable courses`);

  const ids = rows.map((r) => r.course_id);
  assert.equal(new Set(ids).size, ids.length, 'a course id appears twice in the export');

  const missing = expected.filter((c) => !ids.includes(c.id)).map((c) => c.id);
  assert.deepEqual(missing, [], `courses absent from the export: ${missing.join(', ')}`);
});

test('fee_basis in the export matches what the app renders, row for row', () => {
  const byId = new Map(COURSES.map((c) => [c.id, c]));
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

  const wrong = rows
    .map((r) => ({ id: r.course_id, said: r.fee_basis, real: feeBasis(byId.get(r.course_id)) }))
    .filter((x) => x.said !== x.real)
    .map((x) => `${x.id}: export says '${x.said}', the app shows '${x.real}'`);

  assert.deepEqual(wrong, [],
    'the export disagrees with the app about where a fee came from. This is the one column '
    + `the file exists for, so a mismatch is worse than no export at all: ${wrong.slice(0, 5).join('; ')}`);
});

test('CSV and JSON carry identical values', () => {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(json.courses.length, rows.length, 'CSV and JSON row counts differ');

  const mismatched = [];
  rows.forEach((r, i) => {
    const j = json.courses[i];
    for (const k of Object.keys(r)) {
      const want = j[k] === null || j[k] === undefined ? '' : String(j[k]);
      if (r[k] !== want) mismatched.push(`${j.course_id}.${k}`);
    }
  });
  assert.deepEqual(mismatched.slice(0, 8), [],
    `CSV and JSON disagree on these cells: ${mismatched.slice(0, 8).join(', ')}`);
});

test('the two empty cells mean what the documentation says they mean', () => {
  /* This is where a CSV usually lies. A blank reads as "no data" to one person
     and as zero to another, and both are wrong here in ways that change a
     decision: an empty grade is the MOST permissive value, and an empty fee is
     not free. */
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

  const gradeLies = rows.filter((r) => (r.min_grade === '') !== (r.open_entry === 'yes'))
    .map((r) => r.course_id);
  assert.deepEqual(gradeLies, [],
    `open_entry disagrees with a blank min_grade on: ${gradeLies.join(', ')}. The column exists `
    + 'so nobody has to infer open entry from an empty cell.');

  const feeLies = rows.filter((r) => r.tuition_kes === '' && r.fee_basis !== 'unpublished')
    .map((r) => `${r.course_id} (${r.fee_basis})`);
  assert.deepEqual(feeLies, [],
    `these rows have no fee but are not classified 'unpublished': ${feeLies.join(', ')}`);

  /* And the converse, which is the one that would actually mislead: a free
     course must carry 0, never a blank, or "free" and "unknown" become the same
     cell. */
  const free = rows.filter((r) => r.tuition_kes === '0');
  for (const r of free) {
    assert.notEqual(r.fee_basis, 'unpublished',
      `${r.course_id} shows a fee of 0 but is classified unpublished — free and unknown must not collapse`);
  }
});

test('the landing page states both empty-cell meanings', () => {
  /* The caveats have to be on the page someone lands on, not only in a header
     row they will never read. */
  const page = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  assert.match(page, /open entry/i, 'the page does not explain that a blank min_grade is open entry');
  assert.match(page, /does not mean free/i,
    'the page does not warn that a blank tuition figure is not the same as free');
  assert.match(page, /employment rate/i,
    'the page does not say why there is no employment-rate column — the absence is deliberate '
    + 'and needs stating, or it reads as an oversight');
});

test('the export is listed in the sitemap', () => {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes('/open-data/'),
    'sitemap.xml does not list /open-data/ — regenerate with node tools/build-static-pages.mjs');
});

test('the app links to the export in the served HTML', () => {
  /* Same reasoning as the county and grade pages: a link rendered by
     JavaScript leaves the page unlinked to a crawler. */
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /href="\.\/open-data\/"/,
    'index.html does not link to ./open-data/ in the served markup');
});
