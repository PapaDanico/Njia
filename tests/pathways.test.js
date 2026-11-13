/* Njia — the pathways and diagnostic pages, and the claims the diagnostic makes.
 *
 * WHY THIS FILE EXISTS.
 *
 * The questionnaire's intro told readers it was "the same model executive
 * coaches use to help leaders find real direction". Nothing in this repository
 * sources that, and the scoring code's own comment says the instrument has no
 * published reliability or validity figures. A claim the interface makes and the
 * code disclaims is the paraphrase trap's older sibling, and it sat on the
 * screen every reader sees first. These guards assert the PROPERTY (the
 * instrument is described as an exploration aid, on every surface that
 * describes it) rather than one phrasing.
 *
 * The pathways ladder is counted from the catalogue at build time; the test
 * recomputes it from data/courses.js rather than from the generator's own
 * variables, so a page that disagrees with the data fails here. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = vm.createContext({});
for (const f of ['institutions.js', 'courses.js']) vm.runInContext(read(`data/${f}`), ctx);
const INSTITUTIONS = vm.runInContext('INSTITUTIONS', ctx);
const COURSES = vm.runInContext('COURSES', ctx);
const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('the pathways ladder agrees with a live recount of the catalogue', () => {
  const page = read('pathways/index.html');
  const LABEL = { artisan: 'Artisan', certificate: 'Certificate', diploma: 'Diploma', degree: 'Degree', short_course: 'Short course' };
  const fmt = (n) => n.toLocaleString('en-KE');
  const problems = [];
  for (const level of Object.keys(LABEL)) {
    const rows = COURSES.filter((c) => c.level === level && instById.has(c.institution_id));
    if (!rows.length) continue;
    const expected = [
      rows.length,
      new Set(rows.map((c) => c.institution_id)).size,
      new Set(rows.map((c) => instById.get(c.institution_id).county)).size,
      rows.filter((c) => c.min_grade == null || c.min_grade === 'E').length,
      rows.filter((c) => c.total_fees_kes != null).length
    ].map(fmt);
    const row = page.match(new RegExp(`<th scope="row">${LABEL[level]}</th>([\\s\\S]*?)</tr>`));
    if (!row) { problems.push(`${level}: no row`); continue; }
    const got = [...row[1].matchAll(/<td class="num">([^<]*)<\/td>/g)].map((m) => m[1]);
    if (got.join('|') !== expected.join('|')) problems.push(`${level}: page ${got.join(',')} vs data ${expected.join(',')}`);
  }
  assert.deepEqual(problems, [], `the pathways page is stale against the catalogue:\n  ${problems.join('\n  ')}\nRegenerate with node tools/build-static-pages.mjs then build-structured-data.mjs.`);
});

test('the pathways page says the CBE placement criteria are not final and quotes no weights', () => {
  const t = text(read('pathways/index.html'));
  assert.match(t, /criteria are not final/, 'the page must say the university placement criteria for the first CBE cohort are not final');
  assert.match(t, /we found no published detail on how CBE learners will be placed into technical and vocational colleges/i);
  assert.doesNotMatch(t, /\b\d+\s*(%|per ?cent)\b/i,
    'the pathways page must not quote placement weights or uptake percentages: sources disagree and none is official');
});

test('the diagnostic is described as an exploration aid on every surface that describes it', () => {
  const surfaces = {
    'diagnostic page': text(read('diagnostic/index.html')),
    'discover intro and report (js/discover.js)': read('js/discover.js'),
    'help FAQ (js/help.js)': read('js/help.js'),
    'help page': text(read('help/index.html'))
  };
  const missing = Object.entries(surfaces)
    .filter(([, body]) => !/not a validated psychological test/i.test(body))
    .map(([name]) => name);
  assert.deepEqual(missing, [], `these surfaces do not say the diagnostic is not a validated psychological test: ${missing.join('; ')}`);
});

test('no shipped surface credits the diagnostic to a source the repository cannot cite', () => {
  const shipped = ['index.html', 'js/app.js', 'js/discover.js', 'js/help.js', 'help/index.html', 'diagnostic/index.html', 'docs/index.html', 'llms.txt'];
  const offenders = shipped.filter((f) => /executive coaches/i.test(read(f)));
  assert.deepEqual(offenders, [], `unsourced endorsement claim on: ${offenders.join(', ')}`);
});

test('the diagnostic page states the O*NET licence position and does not embed the instrument', () => {
  const t = text(read('diagnostic/index.html'));
  assert.match(t, /without modification/i);
  assert.match(t, /modifying it requires a separate developer licence/i);
  assert.match(t, /we chose to link/i);
  const items = ['Build kitchen cabinets', 'Lay brick or tile', 'Study space travel'];
  const copied = items.filter((i) => read('data/questions.js').includes(i));
  assert.deepEqual(copied, [], 'O*NET Interest Profiler items must not be copied into the questionnaire');
});
