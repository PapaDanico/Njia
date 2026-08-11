/* Unit tests for persisted-state repair — run with `node --test tests/*.test.js`.
 *
 * Njia is an installed PWA that updates in place, so state written by an
 * older version arrives in a newer one with collections of a different
 * shape. Before normalizeState() existed, five realistic cases of that
 * (an application saved before `steps`, an odyssey plan saved before
 * `years`, an OKR saved before `keyResults`, and any collection that had
 * become null or an object) each threw inside a renderer and left the
 * module a blank page — recoverable only by clearing site data, which
 * destroys everything else the user saved.
 *
 * These tests pin both halves of the contract: nothing throws, *and* the
 * user's actual work survives the repair.
 *
 * js/app.js is a browser script that reads localStorage and touches the DOM
 * at load, so the harness stubs just enough of both for the module to
 * evaluate. The stubs are deliberately minimal — if a future change to
 * app.js needs more of the DOM at load time, that is worth noticing here.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadApp() {
  const noop = () => {};
  const stubEl = new Proxy({}, {
    get: (_, prop) => (prop === 'classList' ? { add: noop, remove: noop, toggle: noop, contains: () => false }
      : prop === 'style' ? {}
      : prop === 'dataset' ? {}
      : typeof prop === 'string' && prop.startsWith('set') ? noop
      : noop),
    set: () => true
  });
  const store = new Map();
  const context = vm.createContext({
    console: { ...console, warn: noop, error: noop },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    document: {
      getElementById: () => stubEl,
      querySelector: () => stubEl,
      querySelectorAll: () => [],
      addEventListener: noop,
      dispatchEvent: noop,
      documentElement: stubEl,
      body: stubEl,
      createElement: () => stubEl
    },
    window: { matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }), addEventListener: noop },
    navigator: { serviceWorker: { register: () => Promise.resolve(), addEventListener: noop } },
    CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    setTimeout: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop })
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(path.join(root, 'js/app.js'), 'utf8'), context, { filename: 'js/app.js' });
  return { normalizeState: vm.runInContext('normalizeState', context), defaultState: vm.runInContext('defaultState', context) };
}

const { normalizeState, defaultState } = loadApp();
const repair = (patch) => normalizeState(Object.assign(defaultState(), patch));

/* Objects built inside the vm context carry that realm's prototypes, so
 * deepStrictEqual rejects a structurally identical array as "not
 * reference-equal". Round-tripping through JSON drops the realm and
 * compares the shape we actually care about. */
const plain = (value) => JSON.parse(JSON.stringify(value));
const sameShape = (actual, expected, message) => assert.deepEqual(plain(actual), expected, message);

/* ---------- collections survive a wrong type without throwing ---------- */

test('a collection that is null, a string or an object becomes an empty array', () => {
  for (const bad of [null, undefined, 'c001', { a: 1 }, 42, false]) {
    const s = repair({ savedCourses: bad, applications: bad, okrs: bad, odysseyPlans: bad, mentors: bad });
    for (const key of ['savedCourses', 'applications', 'okrs', 'odysseyPlans', 'mentors']) {
      assert.ok(Array.isArray(s[key]), `${key} should be an array for input ${JSON.stringify(bad)}`);
    }
  }
});

test('savedCourses keeps only string ids', () => {
  sameShape(repair({ savedCourses: ['c001', 42, null, { id: 'c9' }, 'c002'] }).savedCourses, ['c001', 'c002']);
});

/* ---------- older-schema entries are repaired, not discarded ---------- */

test('an application saved before steps[] existed gains an empty steps array', () => {
  const s = repair({ applications: [{ id: 'a1', courseId: 'c001', courseName: 'Nursing' }] });
  assert.equal(s.applications.length, 1, 'the application itself must be kept');
  sameShape(s.applications[0].steps, []);
  assert.equal(s.applications[0].courseName, 'Nursing', 'the user-visible fields must survive');
  // This is the exact call renderTrackPage() makes; it must not throw.
  assert.doesNotThrow(() => s.applications.filter((a) => a.steps.every((x) => x.done)));
});

test('an OKR saved before keyResults[] existed keeps its title', () => {
  const s = repair({ okrs: [{ id: 'o1', title: 'Get into a diploma programme' }] });
  assert.equal(s.okrs[0].title, 'Get into a diploma programme');
  sameShape(s.okrs[0].keyResults, []);
});

test('an odyssey plan saved before years[] existed is padded to five years', () => {
  const s = repair({ odysseyPlans: [{ id: 'plan-1', label: 'Life 1', subtitle: 'The plan I am on' }] });
  sameShape(s.odysseyPlans[0].years, ['', '', '', '', '']);
  assert.equal(s.odysseyPlans[0].subtitle, 'The plan I am on');
});

/* ---------- repair must never delete what the user typed ---------- */

test('a short years[] is padded, never truncated, and keeps every entry', () => {
  const s = repair({ odysseyPlans: [{ id: 'plan-1', years: ['finish KCSE', 'start diploma'] }] });
  sameShape(s.odysseyPlans[0].years, ['finish KCSE', 'start diploma', '', '', '']);
});

test('a years[] longer than five is kept whole rather than cut', () => {
  const long = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  sameShape(repair({ odysseyPlans: [{ id: 'plan-1', years: long }] }).odysseyPlans[0].years, long);
});

test('non-string year slots become empty strings without shifting the others', () => {
  const s = repair({ odysseyPlans: [{ id: 'plan-1', years: ['keep me', null, 7, {}, 'tail'] }] });
  sameShape(s.odysseyPlans[0].years, ['keep me', '', '', '', 'tail']);
});

test('malformed steps are dropped but real ones are kept in order', () => {
  const s = repair({ applications: [{ id: 'a1', steps: ['junk', { id: 's1', title: 'Apply', done: true }, null, { id: 's2', title: 'Enrol', done: false }] }] });
  sameShape(s.applications[0].steps.map((x) => x.title), ['Apply', 'Enrol']);
});

/* ---------- done flags are real booleans ---------- */

test('a done flag that is a truthy or falsy non-boolean is coerced, not trusted', () => {
  const s = repair({
    applications: [{ id: 'a1', steps: [{ id: 's1', done: 'false' }, { id: 's2', done: 1 }, { id: 's3' }] }],
    okrs: [{ id: 'o1', keyResults: [{ text: 'kr', done: 'yes' }, { text: 'kr2', done: true }] }]
  });
  // The string 'false' is truthy in JS — left alone it would render a step the
  // user never completed as done, and silently inflate their progress.
  sameShape(s.applications[0].steps.map((x) => x.done), [false, false, false]);
  sameShape(s.okrs[0].keyResults.map((x) => x.done), [false, true]);
});

/* ---------- entries too malformed to identify are dropped ---------- */

test('an odyssey plan with no id is dropped, since its identity is unrecoverable', () => {
  assert.equal(repair({ odysseyPlans: [{ label: 'Life 1' }, { id: 'plan-2' }] }).odysseyPlans.length, 1);
});

test('repair is idempotent — running it twice changes nothing', () => {
  const once = repair({ applications: [{ id: 'a1' }], okrs: [{ id: 'o1' }], odysseyPlans: [{ id: 'plan-1', years: ['x'] }], savedCourses: ['c001', 3] });
  sameShape(normalizeState(JSON.parse(JSON.stringify(once))), plain(once));
});

test('a default state passes through unchanged', () => {
  sameShape(normalizeState(defaultState()), plain(defaultState()));
});

/* ---------- an empty step list is not a finished application ---------- */

test('an application with no steps reports in-progress, never complete', () => {
  // [].every() is true, so the naive check congratulated someone for work they
  // had not started. This is reachable through normalizeState(), which gives an
  // application saved before `steps` existed an empty array — the right repair,
  // landing on the wrong reader.
  const { applicationStatus } = loadTrack();
  assert.equal(applicationStatus({ id: 'a1', steps: [] }), 'in-progress');
  assert.equal(applicationStatus({ id: 'a2' }), 'in-progress', 'a missing steps array must not throw or read as done');
  assert.equal(applicationStatus({ id: 'a3', steps: 'nope' }), 'in-progress', 'a non-array must not throw');
  assert.equal(applicationStatus({ id: 'a4', steps: [{ done: true }, { done: true }] }), 'complete');
  assert.equal(applicationStatus({ id: 'a5', steps: [{ done: true }, { done: false }] }), 'in-progress');
});

function loadTrack() {
  const noop = () => {};
  const ctx = vm.createContext({
    console: { ...console, warn: noop, error: noop },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: noop },
    AppState: { applications: [], okrs: [], viewFilters: {} },
    saveState: noop, escapeHtml: (x) => x, icon: () => '', formatKes: () => '', uid: () => 'x'
  });
  ctx.globalThis = ctx;
  vm.runInContext(fs.readFileSync(path.join(root, 'js/track.js'), 'utf8'), ctx, { filename: 'js/track.js' });
  return { applicationStatus: vm.runInContext('applicationStatus', ctx) };
}
