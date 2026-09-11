/* Njia — functional probe. Drives the real app in a real browser.
 *
 * WHY THIS IS IN THE REPO.
 *
 * It used to live in a scratch directory and die with the session, and it was
 * rewritten from memory each time. Twice now it has reported the same false
 * failure — "level filter changes the result set — 24 -> 24" — because it
 * counted rendered .course-card elements against a pagination cap of 24. Both
 * times the filter was working perfectly: 371 records narrow to 76 artisan, 125
 * certificate, 136 diploma. Both times the false alarm cost real minutes of
 * investigation, and a probe that cries wolf is worse than no probe, because
 * the second failure it reports is the one nobody checks.
 *
 * It now asserts against the headline count the app itself renders — the
 * "N of M places to apply match your filters" line — which is the number a
 * user actually reads, and is not capped.
 *
 * WHY IT IS NOT IN `node --test`.
 *
 * The unit suite runs on zero dependencies, which is a deliberate property of
 * this project: `node --test tests/*.test.js` works on a clean checkout with no
 * npm install and no lockfile. This needs Playwright and a browser, so it stays
 * a separate command and says so when it cannot run.
 *
 * The unit suite cannot replace it. Two defects this week were invisible to 155
 * green tests and obvious one second after loading the page: a removed variable
 * still referenced further down the same function, which threw on render; and
 * a page-level `display: grid` that overrode `.page { display: none }` and
 * stacked three modules on top of each other. Static assertions do not execute
 * a page.
 *
 * RUN:
 *   node tests/functional-probe.mjs
 *   NODE_PATH=/path/to/node_modules node tests/functional-probe.mjs
 *
 * Requires a server on http://localhost:8080 (python3 -m http.server 8080).
 * Override with PROBE_URL. Exits 2 when tooling or the server is missing,
 * 1 on a real failure, 0 only when every check genuinely ran and passed.
 */

import { createRequire } from 'node:module';

/* Resolved through createRequire, not a static import, for the same reason
 * tests/a11y-sweep.mjs does it: NODE_PATH is a CommonJS mechanism and ESM
 * `import` ignores it, so `import { chromium } from 'playwright'` fails on a
 * machine that supplies the browser the documented way. require.resolve
 * honours it. Written as a plain import first, and it failed exactly as the
 * sweep's comment warned it would. */
const require = createRequire(import.meta.url);
const BASE = process.env.PROBE_URL || 'http://localhost:8080';

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not resolvable. This probe drives a real browser and is');
  console.error('deliberately outside the zero-dependency unit suite.\n');
  console.error('  npm i --no-save --prefix /tmp/njia-probe playwright');
  console.error('  NODE_PATH=/tmp/njia-probe/node_modules node tests/functional-probe.mjs\n');
  console.error('Set CHROMIUM_PATH if the browser is not at /opt/pw-browsers/chromium.');
  process.exit(2);
}

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

try {
  const response = await page.goto(BASE, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    console.error(`Cannot reach ${BASE}. Start a server first: python3 -m http.server 8080`);
    process.exit(2);
  }
} catch (e) {
  console.error(`Cannot reach ${BASE}: ${e.message}`);
  console.error('Start a server first: python3 -m http.server 8080');
  process.exit(2);
}
await page.waitForTimeout(600);

/* 1. The questionnaire, driven by clicking the actual buttons rather than by
 *    calling the scorer directly. Poking internals would assert that the maths
 *    works while saying nothing about whether a person can reach it — and a
 *    questionnaire nobody can finish scores nothing. */
await page.evaluate(() => { navigateTo('discover'); startDiscoverQuestionnaire(); });
await page.waitForTimeout(250);
for (let i = 0; i < 150; i += 1) {
  if (await page.evaluate(() => !!AppState.questionnaire.results)) break;
  const clicked = await page.evaluate(() => {
    const visible = (el) => el.offsetParent !== null;
    /* The two free-text questions are answered rather than skipped, because
       their answers now have to reach the report card and the Life Three
       Odyssey plan, and a run that leaves them blank asserts nothing about
       either. They were stored and never read by anything for as long as they
       existed. */
    const ta = document.getElementById('discover-text-input');
    if (ta && visible(ta)) {
      ta.value = ta.placeholder.includes('Odyssey')
        ? 'Run a community radio station in Kisumu'
        : 'Helping my younger siblings with their homework';
      const submit = [...document.querySelectorAll('#page-discover button')].filter(visible)
        .find((b) => /submitDiscoverText/.test(b.getAttribute('onclick') || ''));
      if (submit) { submit.click(); return true; }
    }
    const buttons = [...document.querySelectorAll('#page-discover button, #page-discover [onclick]')].filter(visible);
    const next = buttons.find((el) => /selectDiscoverOption/.test(el.getAttribute('onclick') || ''))
      || buttons.find((el) => /Next|Continue|results|Finish/i.test(el.innerText));
    if (!next) return false;
    next.click();
    return true;
  });
  if (!clicked) break;
  await page.waitForTimeout(40);
}
const quiz = await page.evaluate(() => AppState.questionnaire.results);
check('the questionnaire can be completed by clicking through it', !!quiz,
  quiz ? `primary=${quiz.primary}` : 'never reached a result');
check('cluster scores are non-zero', !!quiz && quiz.totalPoints > 0, quiz ? `${quiz.totalPoints} pts` : '');

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const persisted = await page.evaluate(() => AppState.questionnaire.results?.primary);
check('results survive a reload', !!quiz && persisted === quiz.primary, String(persisted));

/* 2. Filters. Asserted against the headline count, NOT the rendered card count.
 *    The card list is paginated at 24, so counting cards compares two numbers
 *    that are both the cap and reports a working filter as broken. */
/* navigateTo(), not a hash change. A hash-only goto is a same-document
 * navigation that can resolve before the router activates the page, and
 * innerText skips anything still display:none — so the headline below was read
 * from a hidden subtree and came back null while the app was working fine. */
await page.evaluate(() => navigateTo('decide'));
await page.waitForTimeout(500);

const headline = () => page.evaluate(() => {
  renderDecidePage();
  const m = document.body.innerText.match(/([\d,]+)\s+of\s+([\d,]+)\s+places to apply match/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
});
const setFilter = (key, value) => page.evaluate(([k, v]) => {
  AppState.decideFilters[k] = v; saveState();
}, [key, value]);

await setFilter('level', 'all');
const allCount = await headline();
check('the catalogue reports a headline count', allCount > 0, `${allCount} places`);

const levelCounts = {};
for (const level of ['artisan', 'certificate', 'diploma']) {
  await setFilter('level', level);
  levelCounts[level] = await headline();
}
await setFilter('level', 'all');
const levelsNarrow = Object.values(levelCounts).every((n) => n > 0 && n < allCount);
check('the level filter narrows the result set', levelsNarrow,
  Object.entries(levelCounts).map(([k, v]) => `${k}=${v}`).join(' ') + ` of ${allCount}`);
const levelsSumSane = Object.values(levelCounts).reduce((a, b) => a + b, 0) <= allCount;
check('level counts never exceed the whole catalogue', levelsSumSane);

await setFilter('cluster', 'numbers');
const numbersCount = await headline();
await setFilter('cluster', 'all');
check('the cluster filter narrows the result set', numbersCount > 0 && numbersCount < allCount,
  `numbers=${numbersCount} of ${allCount}`);

/* 3. Fee provenance is the core promise, so probe what a reader is told. */
const basis = await page.evaluate(() => {
  /* Counted into a bare object rather than a fixed set of keys. Written with
   * the four states that existed at the time, this produced `unsourced=NaN`
   * the moment a fifth was added — a probe that silently mis-reports is the
   * failure mode this file exists to avoid. */
  const counts = {};
  for (const c of COURSES) { const k = feeBasis(c); counts[k] = (counts[k] || 0) + 1; }
  const target = COURSES.find((c) => feeBasis(c) === 'unpublished');
  const inst = INSTITUTIONS.find((i) => i.id === target.institution_id);
  AppState.decideFilters.level = target.level;
  AppState.decideFilters.county = inst.county;
  renderDecidePage();
  const card = [...document.querySelectorAll('.course-card')]
    .find((el) => el.textContent.includes(target.name));
  const text = card ? card.innerText : '';
  AppState.decideFilters.level = 'all';
  AppState.decideFilters.county = 'all';
  renderDecidePage();
  return {
    counts,
    courseCount: COURSES.length,
    unpublishedShowsNoTick: !!card && !/✓ Fee (published|from)/.test(text),
    /* "Not shown", not "Not published". The old label claimed knowledge Njia
     * does not have: a public university DOES publish its fees, Njia simply
     * could not verify them, and telling a reader the university publishes
     * nothing sends them off looking for a thing that exists. The assertion
     * still checks the same intent — a fee-less course must say the figure is
     * absent — against wording that is true in both cases. */
    unpublishedSaysSo: /Not shown/.test(text),
    /* And it must never hand a university the county-VTC advice. That copy was
     * unconditional until eighteen invented university fees were nulled and
     * pushed CUE-chartered degrees into it, at which point DeKUT began telling
     * readers to budget for a NITA Grade III trade test on a BSc. */
    noVtcCopyOnADegree: !(/degree/i.test(text) && /Grade III trade test/i.test(text))
  };
});
const basisTotal = Object.values(basis.counts).reduce((a, b) => a + b, 0);
check('every course classifies into exactly one fee basis',
  basisTotal === basis.courseCount && Object.values(basis.counts).every(Number.isInteger),
  Object.entries(basis.counts).map(([k, v]) => `${k}=${v}`).join(' ') + ` (total ${basisTotal}/${basis.courseCount})`);
check('a course with no fee shows no verification tick', basis.unpublishedShowsNoTick);
check('a course with no fee says the figure is not shown', basis.unpublishedSaysSo);
check('a degree is never given the county-VTC fee advice', basis.noVtcCopyOnADegree);

/* 4. Saving, and recovery from corrupt storage. */
const saved = await page.evaluate(() => {
  AppState.savedCourses = COURSES.slice(0, 3).map((c) => c.id);
  saveState();
  return AppState.savedCourses.length;
});
check('courses can be saved', saved === 3, `${saved} saved`);

const repaired = await page.evaluate(() => {
  localStorage.setItem('njia_state', JSON.stringify({
    savedCourses: 'not-an-array', okrs: { nope: true }, questionnaire: null
  }));
  return true;
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const recovered = await page.evaluate(() => ({
  arr: Array.isArray(AppState.savedCourses),
  okrs: Array.isArray(AppState.okrs),
  usable: typeof renderDecidePage === 'function'
}));
check('malformed saved state is repaired, not fatal',
  repaired && recovered.arr && recovered.okrs && recovered.usable, JSON.stringify(recovered));

/* 5. Every module page renders without throwing, and none overflows. */
for (const route of ['home', 'discover', 'design', 'decide', 'connect', 'track', 'help']) {
  await page.evaluate((r) => navigateTo(r), route);
  await page.waitForTimeout(350);
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    visiblePages: [...document.querySelectorAll('.page')].filter((p) => getComputedStyle(p).display !== 'none').length
  }));
  check(`${route} renders one page, no horizontal overflow`,
    state.overflow <= 0 && state.visiblePages === 1,
    `overflow=${state.overflow}px visiblePages=${state.visiblePages}`);
}

check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || 'none');

/* 6. THE PRINTED REPORT — the surface these two bugs hid on.
 *
 * The report card was fixed twice in two separate PRs (#91 and #92, both
 * merged the same day from the same session), because neither fix added a
 * guard. The unit suite, functional probe and axe sweep were all green through
 * both defects, because all three run against a server where every request
 * succeeds and nothing ever calls emulateMedia('print').
 *
 * BUG 1 — clipped header. @media print used to zero .report-card's padding on
 * all four sides. .report-card::before is a 6px brand band pinned to the top
 * edge, and the card is overflow:hidden — so every printed report came out
 * with "CAREER PATHWAY REPORT" sheared along its top edge and its last letter
 * cut off at the right. On screen the card's 1.7rem padding hid it completely.
 *
 * BUG 2 — empty report. The report listed only saved courses. Finish the
 * questionnaire and print straight away and the sheet named an archetype but
 * nothing actionable. The fix suggests six courses when nothing is saved.
 *
 * Both checks require emulateMedia('print'), which is the only way to see
 * what @media print actually produces. This is the layer that would have
 * caught them first. */
await page.evaluate(() => navigateTo('discover'));
await page.waitForTimeout(350);
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(150);

const printReport = await page.evaluate(() => {
  const card = document.querySelector('.report-card');
  if (!card) return { found: false };
  // Read the padding NOW — with @media print active, before any DOM mutation —
  // so this is the value that determines whether the brand band is clipped.
  const paddingTop = getComputedStyle(card).paddingTop;

  // Clear saved courses so we test the "Courses Open To You" path, not
  // "Courses You Are Considering". The questionnaire was completed earlier
  // in this probe, so AppState.questionnaire.results is already set.
  const restore = AppState.savedCourses;
  AppState.savedCourses = [];
  renderDiscoverPage();   // re-render so the report picks up the empty list
  // Scope the title lookup to the courses block. querySelector('.report-section-title')
  // returns the FIRST one on the card — "Four Elements — Clarity Scores" — so the
  // original check reported a section it was not testing, and would have named the
  // wrong one in its own failure message.
  const title = document.querySelector('.report-courses .report-section-title');
  const rows = document.querySelectorAll('.report-courses .report-table tbody tr');
  const result = {
    found: true,
    paddingTop,
    sectionTitle: title ? title.textContent.trim() : null,
    courseRows: rows.length
  };
  // Leave the app as it was found. Section 7 runs after this one, and a probe
  // section that silently empties saved state couples the two together.
  AppState.savedCourses = restore;
  renderDiscoverPage();
  return result;
});
await page.emulateMedia({ media: null });   // restore screen media

check('printed report card has non-zero top padding (header not clipped)',
  printReport.found && printReport.paddingTop !== '0px',
  printReport.found ? `paddingTop=${printReport.paddingTop}` : 'report-card not found');

/* Assert BOTH halves of what this check's name claims: that rows appear, and
   that they are the *suggested* ones. Rows alone would still pass if the empty
   state silently fell back to listing saved courses, which is the defect. */
check('printed report suggests courses when nothing is saved',
  printReport.courseRows > 0 && printReport.sectionTitle === 'Courses Open To You',
  `courseRows=${printReport.courseRows} title=${JSON.stringify(printReport.sectionTitle)}`);

/* THE READER'S OWN SENTENCES, ON THE SHEET THEY CARRY AWAY.
 *
 * id_5 and ho_2 are the diagnostic's only free-text questions. Both were
 * stored and read back in exactly one place — refilling the textarea when
 * someone navigated backwards — and reached no result, no report and no
 * printed sheet. The app asked a young person to write something reflective
 * and discarded it.
 *
 * Asserted on the PRINTED card specifically: this is the artefact taken into a
 * conversation with a parent, a teacher or a bursary committee, and their own
 * words are the only thing on it that is not Njia's. */
const ownWords = await page.evaluate(() => {
  const el = document.querySelector('.report-words');
  return el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
});
check('the printed report carries the answers the reader wrote',
  !!ownWords && /lose track of time/.test(ownWords)
    && /younger siblings/.test(ownWords) && /community radio station/.test(ownWords),
  ownWords ? `${ownWords.length} chars` : 'section absent');
check('the report does not claim to score those answers',
  !!ownWords && /does not score these/.test(ownWords));

/* And the promise ho_2's own placeholder makes — "this feeds your Life Three
   Odyssey Plan" — which fed nothing: the plan opened blank and the reader
   retyped what they had just written. */
await page.evaluate(() => navigateTo('design'));
await page.waitForTimeout(1200);
const odyssey = await page.evaluate(() => [...document.querySelectorAll('.odyssey-plan-grid > .card')]
  .map((c) => ({
    label: (c.querySelector('.caption')?.innerText || '').trim(),
    echo: c.querySelector('.odyssey-echo')?.innerText.replace(/\s+/g, ' ').trim() || null
  })));
const lifeThree = odyssey.find((o) => /life three/i.test(o.label));
check('the Life Three plan shows what the reader wrote it would be',
  !!lifeThree && /community radio station/.test(lifeThree.echo || ''),
  lifeThree ? `echo=${JSON.stringify(lifeThree.echo)}` : 'Life Three plan not rendered');
check('the other Odyssey plans are not given that answer',
  odyssey.filter((o) => !/life three/i.test(o.label)).every((o) => o.echo === null),
  odyssey.map((o) => `${o.label}:${o.echo ? 'echo' : '-'}`).join(' '));

/* 7. THE DEGRADED NETWORK, WHICH NOTHING HERE HAD EVER TESTED.
 *
 * Every check above this line runs against a server where every request
 * succeeds. So did the 253 unit tests and the 64 accessibility states, and all
 * three were green while a single unreachable module froze the tab outright:
 * renderRoute() retried by awaiting a cached promise that resolved on failure,
 * so it re-entered on the next microtask and never yielded. Measured before the
 * fix — main thread silent for 6s, click timed out at 4s.
 *
 * Service workers are blocked for this section. With one installed the worker
 * serves the module from its precache and the failure cannot be reproduced at
 * all, which is a genuine second line of defence and exactly why the section
 * has to opt out of it: the exposure is the FIRST visit, before any cache
 * exists, which is also when a new reader on a weak signal arrives.
 *
 * Three checks, covering the class rather than the instance: it must not hang,
 * it must recover from a transient failure, and when it truly cannot load it
 * must say so and offer a way back. */
const degraded = await browser.newContext({ serviceWorkers: 'block' });

async function moduleFailure(failCount) {
  const p = await degraded.newPage();
  let requests = 0;
  await p.route('**/js/help.js', (r) => { requests += 1; return requests <= failCount ? r.abort() : r.continue(); });
  await p.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await p.waitForTimeout(1800);                      // the idle prefetch runs and fails
  await p.evaluate(() => navigateTo('help')).catch(() => {});
  await p.waitForTimeout(1500);                      // any retry completes
  const responsive = await Promise.race([
    p.evaluate(() => true),
    new Promise((r) => setTimeout(() => r(false), 4000))
  ]);
  const dom = await p.evaluate(() => {
    const el = document.getElementById('page-help');
    const h = el && el.querySelector('h1');
    return {
      heading: h ? h.textContent.trim() : null,
      retry: !!(el && el.querySelector('button[onclick^="retryPageModule"]'))
    };
  }).catch(() => ({ heading: null, retry: false }));
  await p.close();
  return { responsive, requests, ...dom };
}

const blip = await moduleFailure(1);
check('a dropped module request does not freeze the app',
  blip.responsive, blip.responsive ? 'main thread answered' : 'MAIN THREAD BLOCKED — the retry is unbounded again');
check('a transient module failure is retried, not latched',
  blip.requests >= 2 && blip.heading === 'How Njia works',
  `requests=${blip.requests} heading=${JSON.stringify(blip.heading)}`);

const dead = await moduleFailure(99);
check('a module that never loads renders a failure with a way back',
  dead.responsive && dead.retry && /didn't load/.test(dead.heading || ''),
  `responsive=${dead.responsive} retry=${dead.retry} heading=${JSON.stringify(dead.heading)} requests=${dead.requests}`);

await degraded.close();

/* 8. THE PDF BUTTON, ON THE BROWSERS THIS AUDIENCE ACTUALLY USES.
 *
 * downloadReportPDF() used to fire the milestone, promise a print dialog and
 * call window.print() unconditionally. Inside the Facebook, Instagram and
 * WhatsApp in-app browsers — and on the older Android WebViews CLAUDE.md names
 * as this audience's hardware — window.print() is absent or a silent no-op, so
 * the reader was told a dialog was opening and got nothing. The milestone fired
 * first, so `report-downloaded` counted a completed download on every failure:
 * a wrong number that looks like a real one, erring in the flattering
 * direction, which is the one thing tests/analytics.test.js exists to prevent.
 *
 * Nothing could see it. The unit suite has no browser, the a11y sweep does not
 * click, and the probe's own print check emulates print media rather than
 * pressing the button — media emulation does not go near window.print(). It
 * took reproducing the in-app browser to surface it, so the guard reproduces
 * the in-app browser.
 *
 * Both failure shapes are covered because they fail differently: a deleted
 * print throws, a no-op print returns cleanly, and only `beforeprint` separates
 * either from a real dialog. The happy path is asserted too — a fix that
 * silenced the milestone everywhere would pass a failure-only test while
 * breaking the measurement it was written to protect. */
async function pdfButton(shim) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  if (shim) await p.addInitScript(shim);
  const fired = [];
  await p.route('**/m/*', (r) => { fired.push(r.request().url().split('/').pop()); r.fulfill({ status: 200, body: '' }); });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => { navigateTo('discover'); startDiscoverQuestionnaire(); });
  await p.waitForTimeout(250);
  for (let i = 0; i < 150; i += 1) {
    if (await p.evaluate(() => !!AppState.questionnaire.results)) break;
    const clicked = await p.evaluate(() => {
      const visible = (el) => el.offsetParent !== null;
      const buttons = [...document.querySelectorAll('#page-discover button, #page-discover [onclick]')].filter(visible);
      const next = buttons.find((el) => /selectDiscoverOption/.test(el.getAttribute('onclick') || ''))
        || buttons.find((el) => /Next|Continue|results|Finish/i.test(el.innerText));
      if (!next) return false;
      next.click();
      return true;
    });
    if (!clicked) break;
    await p.waitForTimeout(40);
  }
  fired.length = 0;
  await p.evaluate(() => {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    downloadReportPDF();
  });
  await p.waitForTimeout(2200);   // clears the 300ms call and the 900ms decision
  const toasts = await p.evaluate(() => [...document.querySelectorAll('.toast')]
    .map((t) => t.innerText.replace(/\s+/g, ' ').trim()));
  await ctx.close();
  return { fired, last: toasts.length ? toasts[toasts.length - 1] : '' };
}

const printWorks = await pdfButton(null);
check('the PDF button still counts a real download when the dialog opens',
  printWorks.fired.includes('report-downloaded.txt'),
  `milestones=${printWorks.fired.join(',') || 'none'}`);

for (const [name, shim] of [
  ['window.print is missing', 'delete window.print;'],
  ['window.print is a silent no-op', 'window.print = function () {};']
]) {
  const r = await pdfButton(shim);
  check(`the PDF button does not count a download when ${name}`,
    !r.fired.includes('report-downloaded.txt'),
    `milestones=${r.fired.join(',') || 'none'}`);
  check(`the reader is told what happened when ${name}`,
    /cannot open a print dialog/.test(r.last),
    JSON.stringify(r.last.slice(0, 70)));
}

/* The backup button, same defect class as the PDF button one section up and
 * found by the same method — reproducing an in-app browser rather than reading
 * the source. It reported "Backup downloaded." unconditionally, so inside the
 * WhatsApp, Facebook and Instagram browsers, where a download anchor is inert,
 * a reader was told their data was safe and had nothing.
 *
 * It matters more than the PDF button because of what the app tells them to do
 * next: the privacy panel and the FAQ at /help/ both say to export a backup
 * BEFORE switching phones. A false success there is the last thing between a
 * reader and a wiped handset.
 *
 * There is no `beforeprint` equivalent for a download, so unlike the PDF button
 * this cannot be fixed by detecting the outcome — only by not asserting one.
 * These checks therefore assert the absence of a success claim, and the
 * presence of a route that survives the anchor being inert. The happy path is
 * asserted too: a fix that simply deleted the download would pass a
 * failure-only test while removing the feature. */
async function backupButton(shim) {
  const ctx = await browser.newContext({ acceptDownloads: true });
  const p = await ctx.newPage();
  if (shim) await p.addInitScript(shim);
  let downloaded = false;
  p.on('download', () => { downloaded = true; });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => {
    AppState.okrs.push({ id: 'probe', title: 'Work worth losing', keyResults: [{ text: 'kr', done: false }], createdAt: new Date().toISOString() });
    saveState();
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    exportMyData();
  });
  await p.waitForTimeout(1200);
  const toasts = await p.evaluate(() => [...document.querySelectorAll('.toast')]
    .map((t) => t.innerText.replace(/\s+/g, ' ').trim()));
  await ctx.close();
  return { downloaded, last: toasts.length ? toasts[toasts.length - 1] : '' };
}

const backupWorks = await backupButton(null);
check('the backup button still writes a real file where downloads work',
  backupWorks.downloaded, `download=${backupWorks.downloaded}`);

/* An anchor whose click is inert for download links — what the in-app browsers
   do. The attribute is supported, so feature detection cannot see this. */
const inertAnchor = `const orig = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download')) return;
    return orig.apply(this, arguments);
  };`;
for (const [name, shim] of [
  ['the download anchor is inert', inertAnchor],
  ['the download attribute is unsupported', 'delete HTMLAnchorElement.prototype.download;']
]) {
  const r = await backupButton(shim);
  check(`the backup button claims no success when ${name}`,
    !r.downloaded && !/backup downloaded|backup saved/i.test(r.last),
    `downloaded=${r.downloaded} toast=${JSON.stringify(r.last.slice(0, 60))}`);
  check(`the reader is pointed at a route that works when ${name}`,
    /copy backup text/i.test(r.last),
    JSON.stringify(r.last.slice(0, 80)));
}

/* The route itself has to exist and produce the data, not just be named in a
   toast. Clipboard is denied here so the fallback panel is what answers. */
const copyCtx = await browser.newContext();
const copyPage = await copyCtx.newPage();
await copyPage.addInitScript(`Object.defineProperty(navigator, 'clipboard', { get: () => undefined });`);
await copyPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const copied = await copyPage.evaluate(() => {
  AppState.okrs.push({ id: 'probe2', title: 'Work worth losing', keyResults: [], createdAt: new Date().toISOString() });
  saveState();
  copyBackupText();
  const el = document.getElementById('backup-text');
  return el ? el.value : '';
});
await copyCtx.close();
check('copying the backup falls back to text the reader can select',
  copied.includes('Work worth losing') && copied.includes('questionnaire'),
  `${copied.length} chars`);

/* TRACK: destructive actions confirm, and the OKR bar says how far along it is.
 *
 * Both found by driving the module rather than by the suite, which had no
 * browser and no coverage of Track's interactive state at all. Deleting an OKR
 * took one tap, removed it immediately and offered no undo — while "Clear My
 * Data", which destroys strictly more, was already behind a confirmation.
 *
 * The bar was measured against the accessibility tree, not guessed at: an empty
 * styled div exposes no node, so a reader got the objective, the status badge
 * and each key result and never a summary. The app's three other bars each sit
 * beside their own number as text and are deliberately left alone. */
const trackCtx = await browser.newContext();
const trackPage = await trackCtx.newPage();
await trackPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await trackPage.evaluate(() => {
  AppState.okrs = [{
    id: 'probe-okr', title: 'Get into a counselling diploma',
    keyResults: [{ text: 'Shortlist 5 institutions', done: true },
      { text: 'Sit the entrance test', done: false },
      { text: 'Submit HELB application', done: false }],
    createdAt: new Date().toISOString()
  }];
  AppState.applications = [{
    id: 'probe-app', courseId: 'c001', courseName: 'Diploma in Community Health',
    createdAt: new Date().toISOString(),
    steps: [{ title: 'Research admission requirements', done: true }, { title: 'Collect documents', done: false }]
  }];
  saveState();
  navigateTo('track');
});
await trackPage.waitForTimeout(700);

/* Scoped, because once the dialog is open there are TWO visible buttons reading
   "Delete OKR" — the card's and the dialog's confirm — and an unscoped
   querySelectorAll finds the card's first. The first version of this probe did
   exactly that and reported "confirming actually deletes the OKR" as a failure
   while the code was correct: a bad question, not a broken fix. */
const clickByText = (text, scope = 'body') => trackPage.evaluate(([t, sc]) => {
  const root = document.querySelector(sc);
  if (!root) return false;
  const el = [...root.querySelectorAll('button')].filter((b) => b.offsetParent !== null)
    .find((b) => b.innerText.trim() === t);
  if (!el) return false;
  el.click();
  return true;
}, [text, scope]);

const okrsBefore = await trackPage.evaluate(() => AppState.okrs.length);
await clickByText('Delete OKR');
await trackPage.waitForTimeout(400);
const afterFirstTap = await trackPage.evaluate(() => ({
  okrs: AppState.okrs.length,
  modalOpen: !!document.querySelector('#modal-overlay.open'),
  names: document.querySelector('.modal-sheet')?.innerText.includes('counselling diploma')
}));
check('deleting an OKR asks first instead of destroying it',
  okrsBefore === 1 && afterFirstTap.okrs === 1 && afterFirstTap.modalOpen,
  `before=${okrsBefore} after=${afterFirstTap.okrs} dialog=${afterFirstTap.modalOpen}`);
check('the OKR confirmation names the objective being deleted',
  afterFirstTap.names === true, `named=${afterFirstTap.names}`);

await trackPage.evaluate(() => closeModal());
await trackPage.waitForTimeout(300);
check('cancelling the OKR dialog keeps the OKR',
  (await trackPage.evaluate(() => AppState.okrs.length)) === 1);

await clickByText('Delete OKR');
await trackPage.waitForTimeout(300);
await clickByText('Delete OKR', '.modal-sheet');   // the confirm, not the card's button
await trackPage.waitForTimeout(400);
check('confirming actually deletes the OKR',
  (await trackPage.evaluate(() => AppState.okrs.length)) === 0,
  `okrs=${await trackPage.evaluate(() => AppState.okrs.length)}`);

await trackPage.evaluate(() => setTrackTab('applications'));
await trackPage.waitForTimeout(500);
await clickByText('Remove Application');
await trackPage.waitForTimeout(400);
const appAfterTap = await trackPage.evaluate(() => ({
  apps: AppState.applications.length,
  modalOpen: !!document.querySelector('#modal-overlay.open'),
  saysCourseKept: document.querySelector('.modal-sheet')?.innerText.includes('stays saved')
}));
check('removing an application asks first instead of destroying it',
  appAfterTap.apps === 1 && appAfterTap.modalOpen,
  `apps=${appAfterTap.apps} dialog=${appAfterTap.modalOpen}`);
check('the application dialog says the course itself is kept',
  appAfterTap.saysCourseKept === true, `stated=${appAfterTap.saysCourseKept}`);
await trackPage.evaluate(() => closeModal());

/* The bar, read the way an assistive technology reads it. */
await trackPage.evaluate(() => {
  AppState.okrs = [{
    id: 'probe-okr2', title: 'Get into a counselling diploma',
    keyResults: [{ text: 'a', done: true }, { text: 'b', done: false }, { text: 'c', done: false }],
    createdAt: new Date().toISOString()
  }];
  saveState(); setTrackTab('okrs');
});
await trackPage.waitForTimeout(600);
const bar = await trackPage.evaluate(() => {
  const el = document.querySelector('.okr-item .progress-track');
  if (!el) return null;
  return {
    role: el.getAttribute('role'),
    now: el.getAttribute('aria-valuenow'),
    text: el.getAttribute('aria-valuetext'),
    label: el.getAttribute('aria-label')
  };
});
check('the OKR progress bar states its value to a screen reader',
  !!bar && bar.role === 'progressbar' && bar.now === '33' && /1 of 3 key results done/.test(bar.text || ''),
  bar ? `role=${bar.role} valuenow=${bar.now} valuetext="${bar.text}"` : 'bar not rendered');
check('the OKR progress bar is named after its objective',
  !!bar && /counselling diploma/.test(bar.label || ''), bar ? `label="${bar.label}"` : '');
await trackCtx.close();

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
