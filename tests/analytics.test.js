/* WHAT MILESTONE COUNTING IS ALLOWED TO BE, ENFORCED RATHER THAN PROMISED.
 *
 * Njia shipped for months telling readers, in the privacy modal, that it ran
 * "no analytics of any kind". Adding a counter makes that sentence false, and
 * the failure this project keeps rediscovering is not a wrong number — it is a
 * true claim that quietly stopped being true while nothing checked.
 *
 * So the privacy properties are asserted here, against the shipped source,
 * rather than trusted to the comment that describes them:
 *
 *   1. A milestone sends the path and nothing else. No query string, no body,
 *      no second argument — the moment one appears, someone is attaching
 *      context, and context about a person is the whole thing being avoided.
 *   2. Every name fired has a marker file, and every marker file is fired.
 *      A name with no file logs a 404 and reads as "nobody got there"; a file
 *      with no caller is dead weight that implies a measurement not being taken.
 *   3. The service worker never answers these. If it ever caches or precaches
 *      one, every visit after the first is served locally and the count
 *      collapses to first-installs — an undercount indistinguishable from the
 *      app being unpopular, which is the most expensive way to be wrong here.
 *   4. The reader is told, in the privacy modal, in words.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const appSource = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const swSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const MODULES = ['app', 'discover', 'design', 'decide', 'connect', 'track', 'help'];
const moduleSources = Object.fromEntries(
  MODULES.map((m) => [m, fs.readFileSync(path.join(root, 'js', `${m}.js`), 'utf8')])
);
const allJs = Object.values(moduleSources).join('\n');

/* The declared list, read out of the shipped source so this file cannot drift
 * from it the way a hand-copied constant would. */
function declaredMilestones() {
  const m = appSource.match(/const MILESTONES = \[([^\]]*)\]/);
  assert.ok(m, 'js/app.js no longer declares a MILESTONES list');
  return m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
}

test('every milestone fired has a marker file, and every marker file is fired', () => {
  const declared = declaredMilestones();
  assert.ok(declared.length > 0, 'MILESTONES is empty — nothing is being counted');

  for (const name of declared) {
    const file = path.join(root, 'm', `${name}.txt`);
    assert.ok(fs.existsSync(file),
      `recordMilestone('${name}') would request /m/${name}.txt, which does not exist. `
      + 'That logs a 404 and the event never appears in analytics — it reads as nobody '
      + 'reaching that step, which is the one wrong answer that looks like a real result.');
  }

  const onDisk = fs.readdirSync(path.join(root, 'm'))
    .filter((f) => f.endsWith('.txt'))
    .map((f) => f.replace(/\.txt$/, ''));
  const orphans = onDisk.filter((n) => !declared.includes(n));
  assert.equal(orphans.length, 0,
    `these marker files are never requested by any code: ${orphans.join(', ')}. `
    + 'An unread marker implies a measurement that is not actually being taken.');

  /* Declared but never called is the subtler half: the name is legal, the file
   * exists, and the number is permanently zero for want of a call site. */
  const uncalled = declared.filter((n) => !allJs.includes(`recordMilestone('${n}')`));
  assert.equal(uncalled.length, 0,
    `these milestones are declared and have marker files but are never fired: ${uncalled.join(', ')}`);
});

test('a milestone carries the path and nothing else', () => {
  const fn = appSource.slice(appSource.indexOf('function recordMilestone('));
  const body = fn.slice(0, fn.indexOf('\nfunction '));

  const call = body.match(/fetch\(([^;]*)\)\s*\n?\s*\.catch/);
  assert.ok(call, 'recordMilestone no longer sends its event with a single fetch');
  const request = call[1];

  assert.ok(!request.includes('?'),
    'the milestone request has grown a query string. Anything after the ? is context '
    + 'about a person, which is precisely what this design exists to make impossible.');
  assert.ok(!/\bbody\s*:/.test(request),
    'the milestone request has grown a body — it must remain a bare GET for a static file');
  assert.match(request, /method:\s*'GET'/, 'the milestone request must stay a GET');
  assert.match(request, /cache:\s*'no-store'/,
    "without cache: 'no-store' the browser serves a repeat visit from its own cache "
    + 'and the count silently stops rising');

  /* No call site may pass a second argument. One name, no payload — that is the
   * property that makes two events from one reader indistinguishable from one
   * event from each of two readers. */
  const withArgs = [...allJs.matchAll(/recordMilestone\([^)]*\)/g)]
    .map((m) => m[0])
    .filter((c) => c.includes(','));
  assert.equal(withArgs.length, 0,
    `these calls pass more than a milestone name: ${withArgs.join(', ')}. `
    + 'A second argument is context, and context is how anonymous counting becomes tracking.');

  for (const signal of ['doNotTrack', 'globalPrivacyControl']) {
    assert.ok(body.includes(signal),
      `recordMilestone no longer honours ${signal}`);
  }
});

test('nothing identifying can reach a milestone request', () => {
  const fn = appSource.slice(appSource.indexOf('function recordMilestone('));
  const body = fn.slice(0, fn.indexOf('\nfunction '));
  /* uid() and AppState are the two things in this app that could make one
   * reader distinguishable from another. Neither belongs anywhere near here. */
  for (const forbidden of ['AppState', 'uid(', 'localStorage', 'STORAGE_KEY', 'Date.now', 'toISOString']) {
    assert.ok(!body.includes(forbidden),
      `recordMilestone references ${forbidden}. Anything drawn from stored state or a `
      + 'timestamp can correlate two requests into a session, which turns a count into a trail.');
  }
});

test('the service worker never answers a milestone request', () => {
  assert.match(swSource, /includes\('\/m\/'\)/,
    'sw.js no longer excludes /m/ from its fetch handler. Cached, every visit after the '
    + 'first is served locally and the count collapses to first-installs — an undercount '
    + 'that is indistinguishable from the app being unused.');

  const assets = swSource.slice(swSource.indexOf('const CACHE_ASSETS'), swSource.indexOf('self.addEventListener'));
  assert.ok(!assets.includes('/m/'),
    'a milestone marker has been added to CACHE_ASSETS, so it is precached at install '
    + 'and never requested again');

  /* The bypass has to come before the icon and network-first branches, or one
   * of them answers the request first and the early return never runs.
   * Comments are stripped before the ordering check: prose explaining the
   * mechanism mentions the same identifiers as the mechanism, and matching
   * against a comment would make this assertion pass or fail on wording. */
  const handler = stripBlockComments(swSource.slice(swSource.indexOf("addEventListener('fetch'")));
  assert.ok(handler.indexOf("includes('/m/')") < handler.indexOf('respondWith'),
    'the /m/ bypass now sits after a respondWith branch, so it can no longer take effect');
});

test('crawlers are kept out of the markers, so the count means people', () => {
  /* Every marker is reachable by anyone who types the URL, and that is fine —
   * they explain themselves and reveal nothing. The problem is automated
   * traffic: a crawler fetching /m/diagnostic-completed.txt is recorded exactly
   * like a school-leaver finishing the questionnaire. Without this line the
   * headline figure quietly becomes "people, plus Googlebot", and that is the
   * flattering direction, which is the direction this project distrusts. */
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  assert.match(robots, /^Disallow: \/m\/$/m,
    'robots.txt no longer excludes /m/. Crawler requests for the markers are '
    + 'indistinguishable from real readers reaching that step, so the usage figures '
    + 'would overstate — the one direction that must never happen by accident.');

  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(!sitemap.includes('/m/'),
    'the sitemap advertises a milestone marker, which invites exactly the crawler '
    + 'traffic robots.txt is excluding');
});

test('the reader is told what is counted', () => {
  /* Against the rendered copy, not the file: an HTML comment recording why the
   * old promise was withdrawn necessarily quotes the old promise. */
  const visible = indexSource.replace(/<!--[\s\S]*?-->/g, '');
  assert.ok(!/no analytics of any kind/i.test(visible),
    'the privacy modal has gone back to promising "no analytics of any kind" while '
    + 'milestone counting ships. This project removes a claim it cannot defend rather '
    + 'than leaving it standing with a caveat elsewhere.');

  const modal = visible.slice(visible.indexOf('function openPrivacyModal'));
  const body = modal.slice(0, modal.indexOf('function exportMyData'));

  for (const [claim, phrase] of [
    ['that something is counted at all', /Njia does count/i],
    ['that no identifier travels with it', /no device or session number/i],
    ['that Do Not Track is honoured', /Do Not Track/i]
  ]) {
    assert.match(body, phrase, `the privacy modal no longer states ${claim}`);
  }
});
