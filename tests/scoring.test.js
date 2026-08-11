/* Unit tests for the pure scoring cores — run with `node --test tests/*.test.js`.
 *
 * The app is deliberately buildless (global scripts, no modules), so the
 * harness loads the real data + module files into one shared vm context —
 * the same way a browser would — and pulls the pure functions out of it.
 * No DOM stubs are needed: computeClusterScores and scoreCourseMatch are
 * kept AppState- and document-free precisely so this file stays simple.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const context = vm.createContext({ console });
for (const file of [
  'data/questions.js',
  'data/institutions.js',
  'data/courses.js',
  'js/discover.js',
  'js/decide.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const grab = (name) => vm.runInContext(name, context);
const computeClusterScores = grab('computeClusterScores');
const scoreCourseMatch = grab('scoreCourseMatch');
const meetsGradeRequirement = grab('meetsGradeRequirement');
const gradeRank = grab('gradeRank');
const matchConfidence = grab('matchConfidence');
const feasibilitySignal = grab('feasibilitySignal');
const clusterSpread = grab('clusterSpread');
const paybackMonths = grab('paybackMonths');
const COURSES = grab('COURSES');
const INSTITUTIONS = grab('INSTITUTIONS');
const CLUSTERS = grab('CLUSTERS');
const FLAT_QUESTIONS = grab('FLAT_QUESTIONS');

/* ---------- questionnaire data sanity ---------- */

test('every scored question carries a positive weight', () => {
  for (const q of FLAT_QUESTIONS) {
    if ((q.options || []).some((o) => o.scores && Object.keys(o.scores).length)) {
      assert.ok(q.weight > 0, `question ${q.id} has scored options but weight ${q.weight}`);
    }
  }
});

test('option scores only reference real clusters', () => {
  const known = new Set(Object.keys(CLUSTERS));
  for (const q of FLAT_QUESTIONS) {
    for (const o of q.options || []) {
      for (const cluster of Object.keys(o.scores || {})) {
        assert.ok(known.has(cluster), `question ${q.id} scores unknown cluster "${cluster}"`);
      }
    }
  }
});

/* ---------- computeClusterScores ---------- */

test('ranks the cluster with the most points as primary', () => {
  const r = computeClusterScores({
    a: { scores: { carer: 2 }, element: 'identity', weight: 1 },
    b: { scores: { carer: 2 }, element: 'community', weight: 1 },
    c: { scores: { tech: 2 }, element: 'horizon', weight: 1 }
  });
  assert.equal(r.primary, 'carer');
  assert.equal(r.secondary, 'tech');
  assert.equal(r.clusterTotals.carer, 4);
});

test('a weight-2 answer counts double', () => {
  const r = computeClusterScores({
    heavy: { scores: { tech: 2 }, element: 'identity', weight: 2 },
    light1: { scores: { carer: 2 }, element: 'identity', weight: 1 },
    light2: { scores: { carer: 1 }, element: 'community', weight: 1 }
  });
  // tech: 2×2 = 4 beats carer: 2+1 = 3 — unweighted, carer would have won
  assert.equal(r.primary, 'tech');
  assert.equal(r.clusterTotals.tech, 4);
  assert.equal(r.clusterTotals.carer, 3);
});

test('answers without a weight still count once', () => {
  const r = computeClusterScores({
    legacy: { scores: { business: 2 }, element: 'identity', weight: 0 },
    text: { value: 'free text answer', element: 'identity', weight: 0, scores: {} }
  });
  assert.equal(r.clusterTotals.business, 2);
  assert.equal(r.primary, 'business');
});

test('extracts constraint tags into named constraints', () => {
  const r = computeClusterScores({
    a: { scores: { carer: 2 }, element: 'identity', weight: 1, tag: 'grade_B' },
    b: { scores: { carer: 1 }, element: 'horizon', weight: 1, tag: 'budget_under_100k' }
  });
  assert.equal(r.constraints.grade, 'B');
  assert.equal(r.constraints.budget, 'under_100k');
  assert.equal(r.constraints.urgency, null);
});

test('element scores measure concentration, not volume', () => {
  const focused = computeClusterScores({
    a: { scores: { tech: 4 }, element: 'identity', weight: 1 }
  });
  const split = computeClusterScores({
    a: { scores: { tech: 2, carer: 2 }, element: 'identity', weight: 1 }
  });
  assert.equal(focused.elementScores.identity, 100);
  assert.equal(split.elementScores.identity, 50);
});

/* ---------- grade helpers ---------- */

test('grade comparison respects KCSE ordering', () => {
  assert.ok(gradeRank('A') > gradeRank('C+'));
  assert.ok(meetsGradeRequirement('B', 'C+'));
  assert.ok(!meetsGradeRequirement('D+', 'C'));
});

test('unknown grade never disqualifies', () => {
  assert.ok(meetsGradeRequirement(null, 'B'));
  assert.ok(meetsGradeRequirement(undefined, 'A'));
});

/* ---------- scoreCourseMatch ---------- */

const course = (over = {}) => ({
  cluster: 'tech', min_grade: 'C+', total_fees_kes: 200000, ...over
});

test('primary cluster with met grade scores 95', () => {
  const m = scoreCourseMatch(course(), { hasResults: true, primary: 'tech', secondary: 'carer', grade: 'B', budgetMax: null });
  assert.equal(m.score, 95);
  assert.ok(m.eligible);
  assert.ok(!m.gradeUnconfirmed);
});

test('secondary cluster scores 72, other clusters 35, no results 40', () => {
  const p = { hasResults: true, primary: 'carer', secondary: 'tech', grade: null, budgetMax: null };
  assert.equal(scoreCourseMatch(course({ min_grade: null }), p).score, 72);
  assert.equal(scoreCourseMatch(course({ cluster: 'business', min_grade: null }), p).score, 35);
  assert.equal(scoreCourseMatch(course({ min_grade: null }), { hasResults: false, grade: null, budgetMax: null }).score, 40);
});

test('failing the grade requirement caps the score at 20', () => {
  const m = scoreCourseMatch(course(), { hasResults: true, primary: 'tech', secondary: 'carer', grade: 'D', budgetMax: null });
  assert.equal(m.score, 20);
  assert.ok(!m.eligible);
});

test('over budget costs 25 points but never goes negative', () => {
  const p = { hasResults: true, primary: 'tech', secondary: 'carer', grade: 'B', budgetMax: 100000 };
  assert.equal(scoreCourseMatch(course(), p).score, 70);
  const floor = scoreCourseMatch(course({ cluster: 'business' }), { ...p, grade: 'D' });
  assert.ok(floor.score >= 0);
});

test('unknown grade against a requirement flags gradeUnconfirmed but stays eligible', () => {
  const m = scoreCourseMatch(course(), { hasResults: true, primary: 'tech', secondary: 'carer', grade: null, budgetMax: null });
  assert.ok(m.eligible);
  assert.ok(m.gradeUnconfirmed);
  assert.equal(m.score, 95);
});

/* ---------- matchConfidence ---------- */

test('confidence levels follow the margin between top two clusters', () => {
  assert.equal(matchConfidence([['tech', 20], ['carer', 10]]).level, 'clear');     // 50% margin
  assert.equal(matchConfidence([['tech', 20], ['carer', 17]]).level, 'moderate');  // 15% margin
  assert.equal(matchConfidence([['tech', 20], ['carer', 19]]).level, 'close');     // 5% margin
  assert.equal(matchConfidence([['tech', 0], ['carer', 0]]).level, 'unclear');
});

test('confidence reports the raw points margin', () => {
  const c = matchConfidence([['tech', 24], ['carer', 18]]);
  assert.equal(c.marginPts, 6);
  assert.equal(c.marginPct, 25);
});

/* ---------- feasibilitySignal ---------- */

test('feasibility is silent without a budget and three-state with one', () => {
  const c = course({ total_fees_kes: 200000 });
  assert.equal(feasibilitySignal(c, null), null);
  assert.equal(feasibilitySignal(c, 200000).level, 'within');
  assert.equal(feasibilitySignal(c, 180000).level, 'stretch'); // within 25% over
  assert.equal(feasibilitySignal(c, 100000).level, 'over');
  assert.equal(feasibilitySignal(c, 100000).overBy, 100000);
});

test('breakdown explains every factor that moved the score', () => {
  const m = scoreCourseMatch(course(), { hasResults: true, primary: 'tech', secondary: 'carer', grade: 'B', budgetMax: 100000 });
  // join() rather than deepEqual: breakdown is a vm-realm array, whose
  // Array.prototype differs from the test realm's and fails strict compare.
  const factors = Array.from(m.breakdown, (b) => b.factor);
  assert.equal(factors.join('|'), 'Career fit|Grade eligibility|Budget');
  assert.equal(m.breakdown[0].effect, 'up');
  assert.equal(m.breakdown[2].effect, 'down');
});


/* ---------- catalogue integrity ---------- */

test('every course points at a real institution and a real cluster', () => {
  const instIds = new Set(INSTITUTIONS.map((i) => i.id));
  const clusterIds = new Set(Object.keys(CLUSTERS));
  for (const c of COURSES) {
    assert.ok(instIds.has(c.institution_id), `${c.id} references missing institution ${c.institution_id}`);
    assert.ok(clusterIds.has(c.cluster), `${c.id} references missing cluster ${c.cluster}`);
  }
});

test('course ids and institution ids are unique', () => {
  const cIds = COURSES.map((c) => c.id);
  const iIds = INSTITUTIONS.map((i) => i.id);
  assert.equal(cIds.length, new Set(cIds).size, 'duplicate course id');
  assert.equal(iIds.length, new Set(iIds).size, 'duplicate institution id');
});

test('every cluster has at least three courses, so no result is a dead end', () => {
  for (const cluster of Object.keys(CLUSTERS)) {
    const n = COURSES.filter((c) => c.cluster === cluster).length;
    assert.ok(n >= 3, `cluster ${cluster} only has ${n} course(s)`);
  }
});

test('every verified record carries a verification note', () => {
  for (const c of COURSES) {
    if (c.data_confidence === 'verified') {
      assert.ok(c.verification_note && c.verification_note.length > 40,
        `${c.id} is marked verified without a substantive note`);
    }
  }
});

/* ---------- clusterSpread ---------- */

test('spread covers every cluster, ranked, with shares of the total', () => {
  const ranked = [['tech', 30], ['carer', 20], ['business', 10], ['people', 10], ['creator', 20], ['numbers', 10]];
  const spread = clusterSpread(ranked, 100);
  assert.equal(spread.length, 6);
  assert.equal(spread[0].id, 'tech');
  assert.equal(spread[0].share, 30);
  assert.equal(spread[0].rank, 1);
  assert.equal(spread[5].rank, 6);
});

test('spread survives a zero total without dividing by zero', () => {
  const spread = clusterSpread([['tech', 0], ['carer', 0]], 0);
  assert.equal(spread[0].share, 0);
  assert.ok(Number.isFinite(spread[0].share));
});

/* ---------- paybackMonths ---------- */

test('payback is tuition expressed in months of median salary', () => {
  assert.equal(paybackMonths({ total_fees_kes: 120000, median_salary_kes: 30000 }), 4);
  assert.equal(paybackMonths({ total_fees_kes: 67189, median_salary_kes: 20000 }), 3.4);
});

test('payback is null when either figure is missing', () => {
  assert.equal(paybackMonths({ total_fees_kes: 100000 }), null);
  assert.equal(paybackMonths({ median_salary_kes: 30000 }), null);
});


/* ---------- service-worker cache completeness ----------
 * CACHE_ASSETS in sw.js is hand-maintained. A module added without a
 * matching entry still works online and silently fails offline — for
 * users with no signal, which is precisely who this app is built for.
 * This guards that class of bug at commit time. */

test('every shipped js/css/data file is listed in the service worker cache', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const listed = new Set([...sw.matchAll(/'\.\/(js|data|css)\/([^']+)'/g)].map((m) => `${m[1]}/${m[2]}`));
  for (const dir of ['js', 'data', 'css']) {
    for (const file of fs.readdirSync(path.join(root, dir))) {
      assert.ok(listed.has(`${dir}/${file}`),
        `${dir}/${file} is shipped but missing from CACHE_ASSETS in sw.js — it would break offline`);
    }
  }
});

test('the service worker does not cache files that no longer exist', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'\.\/(js|data|css)\/([^']+)'/g)].map((m) => `${m[1]}/${m[2]}`);
  for (const rel of listed) {
    assert.ok(fs.existsSync(path.join(root, rel)),
      `sw.js caches ${rel}, which does not exist — install would fail and the app would never go offline`);
  }
});

/* ---------- locality ----------
 * Added when the catalogue reached 45 counties. KMTC teaches the same
 * programmes at campuses nationwide, so without a locality factor a student
 * in Kisumu would see the Lodwar campus ranked level with the one down the
 * road. Studying near home is frequently the difference between affordable
 * and impossible: relocation means rent, transport and losing family support.
 */

test('a course in the user\'s county outranks the same course elsewhere', () => {
  const course = COURSES.find((c) => c.institution_id === 'kmtc_turkana');
  const base = { hasResults: true, primary: course.cluster, secondary: null, grade: 'A', budgetMax: null };
  const home = scoreCourseMatch(course, { ...base, homeCounty: 'Turkana', courseCounty: 'Turkana' });
  const away = scoreCourseMatch(course, { ...base, homeCounty: 'Kisumu', courseCounty: 'Turkana' });
  assert.ok(home.score > away.score, `local ${home.score} should beat distant ${away.score}`);
});

test('locality says why, not just how much', () => {
  const course = COURSES.find((c) => c.institution_id === 'kmtc_turkana');
  const base = { hasResults: true, primary: course.cluster, secondary: null, grade: 'A', budgetMax: null };
  const away = scoreCourseMatch(course, { ...base, homeCounty: 'Kisumu', courseCounty: 'Turkana' });
  const factor = away.breakdown.find((b) => b.factor === 'Location');
  assert.ok(factor, 'a location penalty must be explained in the breakdown');
  assert.match(factor.detail, /accommodation|travel/i, 'the reason must name the real cost, not just the distance');
});

test('with no county selected, locality is silent rather than guessed', () => {
  // "All Counties" means there is no home location. Inventing one would be
  // worse than staying silent, so no Location factor should appear at all.
  const course = COURSES.find((c) => c.institution_id === 'kmtc_turkana');
  const r = scoreCourseMatch(course, { hasResults: true, primary: course.cluster, secondary: null, grade: 'A', budgetMax: null, homeCounty: null, courseCounty: 'Turkana' });
  assert.equal(r.breakdown.filter((b) => b.factor === 'Location').length, 0);
});

test('locality never pushes a score outside 0-100', () => {
  for (const c of COURSES.slice(0, 40)) {
    for (const [h, cc] of [['Nairobi', 'Nairobi'], ['Nairobi', 'Turkana']]) {
      const r = scoreCourseMatch(c, { hasResults: true, primary: c.cluster, secondary: null, grade: 'E', budgetMax: 1, homeCounty: h, courseCounty: cc });
      assert.ok(r.score >= 0 && r.score <= 100, `${c.id} scored ${r.score}`);
    }
  }
});
