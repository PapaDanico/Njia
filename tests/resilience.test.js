/* Njia — the three things that must hold when something does not arrive.
 *
 * WHY THIS FILE EXISTS.
 *
 * An audit of commit 35db2ba found ten defects. The unit suite, the functional
 * probe and the accessibility sweep were all green through every one of them,
 * and the reason is structural rather than accidental: all three run against a
 * healthy local server where every request succeeds. Nothing in this repository
 * had ever asked what happens when a file does not turn up.
 *
 * The answer was that the app stopped. renderRoute() retried a page whose
 * module had not loaded by awaiting a cached promise and calling itself; the
 * promise resolved on failure as well as success, so the retry re-entered on
 * the next microtask, found the renderer still missing and asked again.
 * Microtasks drain before the event loop runs, so it never yielded. Measured in
 * Chromium with one module aborted: the main thread did not answer in six
 * seconds and a click on the navigation timed out. Not a degraded page — a dead
 * tab, on the cheap Android handsets and intermittent mobile connections this
 * project exists to serve.
 *
 * These are source-level guards rather than browser ones. The behavioural proof
 * lives in tests/functional-probe.mjs, which drives a real browser with a real
 * aborted request; what is checked here is that the three mechanisms which make
 * that behaviour possible are still present, because they are small enough to
 * be "simplified" away by someone who has not read this comment.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const app = read('js/app.js');
const sw = read('sw.js');
const discover = read('js/discover.js');

/* ---------------------------------------------------------------- A-1 ---- */

test('the lazy-module retry is bounded by an attempt count', () => {
  /* The single line that separates a failure state from a frozen tab. Without
     the attempts guard in the renderRoute branch, the retry re-enters an
     already-resolved promise forever. */
  assert.match(app, /const MODULE_MAX_ATTEMPTS = \d+/,
    'MODULE_MAX_ATTEMPTS is gone from js/app.js. The lazy-module retry is now unbounded, which '
    + 'freezes the tab rather than rendering an empty page.');
  assert.match(app, /moduleAttempts\[AppState\.currentPage\][\s\S]{0,40}<\s*MODULE_MAX_ATTEMPTS/,
    "renderRoute() no longer checks the attempt count before retrying a page module. That check is "
    + 'the whole fix: re-entering on a resolved promise with no ceiling is an unbounded microtask '
    + 'loop, and microtasks drain before the event loop, so the main thread never comes back.');
});

test('a settled module load is not treated as a successful one', () => {
  /* A script with a syntax error fires onload, not onerror. So the load event
     proves nothing about whether the module defined anything, and the only
     honest test is the renderer's own presence. Dropping the cached promise on
     failure is also what lets a later navigation make a genuinely new request
     rather than replaying a stale resolution — the difference between a dropped
     packet costing one page for one second and costing it for the session. */
  assert.match(app, /typeof window\[rendererName\(page\)\] !== 'function'\)\s*\{\s*\n\s*scripts\.forEach\(\(src\) => \{ delete scriptLoads\[src\]; \}\);/,
    'ensurePageModule() no longer discards the cached promise when the module failed to define its '
    + 'renderer. Two regressions in one: a parse error (which fires onload) is recorded as success, '
    + 'and a transient network failure is latched for the rest of the session.');
});

test('a page whose module never loads renders something the reader can act on', () => {
  assert.match(app, /function renderPageModuleFailure/,
    'the module failure state is gone. A page that cannot load its module now renders blank, which '
    + 'reads to a reader as "Njia is broken" rather than "this section did not download".');
  assert.match(app, /function retryPageModule/,
    'the retry entry point is gone, so a reader who fixes their connection has no way back into the '
    + 'page short of reloading the whole app.');
  const failure = app.match(/function renderPageModuleFailure[\s\S]*?\n}/);
  assert.ok(failure && /role="alert"/.test(failure[0]),
    'the failure state is no longer announced — a screen-reader user gets a silent page swap.');
  assert.ok(failure && /<h1>/.test(failure[0]),
    'the failure state no longer renders an h1. Every lazy page renders one, so without it the '
    + "document has no h1 at all and renderRoute's focusHeading has nothing to move focus to.");
});

/* ---------------------------------------------------------------- B-2 ---- */

test('the service worker does not cache bulk downloads', () => {
  /* Measured on the previous commit: a fresh install held 1.37MB, and one tap
     on the footer's partnership proposal took it to 3.92MB — a 2.5MB PDF
     written to a learner's phone by a single tap, for a document addressed to
     funders. Browsing the open-data files as well reached 4.86MB. Origin quota
     is shared, so this does not stay in the cache: it resurfaces as the "device
     storage may be full" toast in saveState(), which is the app dropping a
     reader's saved courses to keep a PDF. */
  assert.match(sw, /const BULK_DOWNLOAD_PATHS = \[[^\]]*'\/docs\/'[^\]]*\]/,
    "sw.js no longer excludes /docs/ from the opportunistic cache. One tap on the partnership "
    + "proposal writes 2.5MB to the reader's device — 186% growth in the app's cache for a file "
    + 'no learner opens.');
  assert.match(sw, /BULK_DOWNLOAD_PATHS = \[[^\]]*open-data\/njia-catalogue\./,
    'sw.js no longer excludes the bulk CSV/JSON export from the opportunistic cache.');
  assert.match(sw, /!isBulkDownload\(event\.request\.url\)/,
    'the fetch handler no longer consults isBulkDownload() before cache.put(), so the exclusion '
    + 'list is declared and never applied — which looks exactly like a working guard.');
});

test('excluding bulk downloads did not quietly break offline', () => {
  /* The exclusion is only safe because neither path was ever precached, so
     neither was ever guaranteed offline — they were cached by accident, for
     whoever happened to tap them once. If someone adds one to CACHE_ASSETS
     later, these two rules contradict each other and this test says so. */
  const assets = sw.match(/const CACHE_ASSETS = \[[\s\S]*?\];/);
  assert.ok(assets, 'CACHE_ASSETS is no longer declared in sw.js');
  for (const prefix of ['/docs/', 'njia-catalogue.']) {
    assert.ok(!assets[0].includes(prefix),
      `CACHE_ASSETS precaches ${prefix} while the fetch handler excludes it from caching. Those two `
      + 'rules disagree: install would fetch it and every later request would refuse to refresh it.');
  }
});

/* ---------------------------------------------------------------- A-2 ---- */

test('report suggestions put the reader\'s own county first', () => {
  /* Openness and fee alone are not enough to order this list. Every KMTC
     certificate ties at D+ and Ksh 82,200, so both keys are exhausted and the
     order falls through to catalogue order — which put four of six suggestions
     in Turkana, West Pokot, Marsabit and Lodwar for a reader whose stated
     constraints were "obligations: high, income urgency: high".

     That inverts this project's own coverage argument, which exists because the
     reader who cannot move away from home is the one the catalogue was failing. */
  assert.match(discover, /const homeCounty = AppState\.decideFilters/,
    'the report no longer reads the county the reader set in Decide, so its suggestions are drawn '
    + 'from the whole of Kenya regardless of where the reader can actually go.');
  assert.match(discover, /\[\.\.\.nearby, \.\.\.farther\]\.slice\(0, 6\)/,
    'report suggestions no longer place same-county courses first. A tie-break would not do: with '
    + 'openness and fee tied across a whole tier, the sort never reaches a third key at all.');
});

test('the report says how many suggestions are in the reader\'s county', () => {
  /* A soft preference that is not stated is indistinguishable from no
     preference. A reader who set a county filter and reads a list containing
     other counties has to be told that was a decision; a reader whose county
     genuinely lists nothing has to be told that too, because "nothing near me"
     is something they can act on and a silently national list is not. */
  assert.match(discover, /Njia lists none of these in \$\{escapeHtml\(homeCounty\)\}/,
    'the report no longer tells a reader when none of its suggestions are in their county. That '
    + 'sentence is the difference between a soft preference and a silent one.');
  assert.match(discover, / in \$\{escapeHtml\(homeCounty\)\}; the rest are elsewhere in Kenya/,
    'the report no longer states the split between local and national suggestions.');
});
