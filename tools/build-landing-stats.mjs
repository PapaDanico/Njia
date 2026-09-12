/* Njia — precompute the landing page's aggregate figures.
 *
 * WHY THIS EXISTS.
 *
 * The landing page displays eight numbers derived from the catalogue: how many
 * courses, how many distinct programmes, how many institutions, how many
 * counties, how many fees the institution itself publishes, how many are
 * derived, and how many training routes lead into each KNBS sector. To produce
 * them it read the whole of data/courses.js (57.6KB gzipped), data/institutions.js
 * (11.7KB) and js/decide.js (28.7KB) — 86.3KB of the 215KB that blocked
 * DOMContentLoaded, to render eight integers on a page that shows no course.
 *
 * Measured on a throttled 3G connection (400kbps, 400ms RTT) over a gzipping
 * server, median of three runs:
 *
 *   before   FCP 2,008ms   DCL 5,635ms   9 render-blocking resources, 217KB
 *   after    FCP 2,000ms   DCL 3,693ms   6 render-blocking resources, 121KB
 *
 * DCL falls 1,942ms, or 34%. FIRST PAINT DOES NOT MOVE — it was never blocked
 * by these files, it is gated by the stylesheet, and claiming this makes the
 * page "appear two seconds faster" would be wrong. What it buys is the point at
 * which the page stops being a picture and starts answering taps, on the
 * connection this project's readers actually have.
 *
 * WHY IT IS GENERATED RATHER THAN HAND-WRITTEN.
 *
 * A hardcoded 469 is a number that goes stale the next time a course is added,
 * silently, on the most-read page on the domain. The whole reason the original
 * code computed these live was to stop exactly that, and this file has to keep
 * that property while moving the work to build time.
 *
 * WHY IT READS feeBasis() OUT OF decide.js.
 *
 * Same rule as tools/build-open-data.mjs: the fee-provenance counts are
 * classified by the app's own function, extracted by brace matching, never by a
 * second copy of the rule. Two implementations of one claim can disagree while
 * both look right alone — and this claim, "14 of 469 fees are published by the
 * institution", is the most load-bearing sentence on the landing page.
 *
 * tests/landing-stats.test.js recomputes every field from the catalogue and
 * fails if the generated file disagrees, so a stale artefact cannot ship.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const { COURSES, DISTINCT_PROGRAMMES } = require(path.join(root, 'data', 'courses.js'));
const { INSTITUTIONS } = require(path.join(root, 'data', 'institutions.js'));
const { SECTORS } = require(path.join(root, 'data', 'sectors.js'));
const { FUNDING_SOURCES } = require(path.join(root, 'data', 'funding.js'));

/* Same brace-matching extraction tools/build-open-data.mjs and two test files
   use. Deliberately not a regex: feeBasis() contains nested braces. */
function extractFn(source, name) {
  const at = source.indexOf(`function ${name}(`);
  if (at === -1) throw new Error(`${name}() not found in decide.js`);
  let depth = 0;
  for (let i = source.indexOf('{', at); i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(at, i + 1);
    }
  }
  throw new Error(`unbalanced braces reading ${name}() out of decide.js`);
}
const decideSource = fs.readFileSync(path.join(root, 'js', 'decide.js'), 'utf8');
const feeBasis = vm.runInNewContext(`${extractFn(decideSource, 'feeBasis')}; feeBasis`);

/* sectorForCourse lives in data/sectors.js, which stays eager because the
   landing page renders the sector table's real rows. Required rather than
   extracted for that reason. */
const { sectorForCourse } = require(path.join(root, 'data', 'sectors.js'));

const instById = new Map(INSTITUTIONS.map((i) => [i.id, i]));
/* Institutions that actually carry a course, never INSTITUTIONS.length. Two
   register entries have no course attached, and quoting the register size once
   told readers Njia covered places it could not send them to. */
const listed = new Set(COURSES.filter((c) => instById.has(c.institution_id)).map((c) => c.institution_id));

const stats = {
  courses: COURSES.length,
  distinctProgrammes: DISTINCT_PROGRAMMES,
  institutions: listed.size,
  counties: new Set([...listed].map((id) => instById.get(id).county)).size,
  published: COURSES.filter((c) => feeBasis(c) === 'published').length,
  derived: COURSES.filter((c) => feeBasis(c) === 'derived').length,
  /* PROVENANCE COMPLETENESS - the only "100%" this catalogue can honestly show.
   *
   * Completeness here is NOT every field populated. Kenya publishes no
   * per-course graduate outcomes, so employment_rate and median_salary_kes are
   * null on every record by decision, and llms.txt declares that refusal. Half
   * the catalogue has no fee because half of Kenyan TVET publishes none.
   * Reporting those as gaps to be closed would invite exactly the invented
   * figures this project spent months removing.
   *
   * What IS complete, and is the actual claim: every record states what it can
   * stand behind. Each carries a verification note and lands in exactly one of
   * the five fee bases, and every record with no fee says WHICH KIND of absence
   * it is. Computed here rather than asserted, so the landing page cannot claim
   * a completeness the data has stopped meeting. */
  withNote: COURSES.filter((c) => c.verification_note && c.verification_note.trim()).length,
  feeAbsent: COURSES.filter((c) => c.total_fees_kes == null).length,
  feeAbsentStated: COURSES.filter((c) => c.total_fees_kes == null
    && /does not publish|publishes no fee|could not be verified|not reachable/i
      .test(c.verification_note || '')).length,
  sectorRoutes: Object.fromEntries(
    SECTORS.map((s) => [s.id, COURSES.filter((c) => sectorForCourse(c)?.id === s.id).length])
  ),

  /* THE APPLICATION CLOCK'S FUNDING ROWS, AND THE COUNT BESIDE THEM.
   *
   * data/funding.js was 10.1KB gzipped on the critical path — the second
   * largest data file blocking first paint — and js/app.js read exactly two
   * things out of it: FUNDING_SOURCES.length for the landing figures, and the
   * name and deadline of at most four records for the Application Clock. The
   * other sixteen fields on each record (description, eligibility,
   * requirements, bandAppeal, legalStatus, verification_note, interest_rate,
   * repayment_period …) are Decide content, and every reader who never opened
   * Decide was paying for them before the page could answer a tap.
   *
   * That is the data/labour-market.js case exactly, and the same fix: the
   * landing page's slice is precomputed here, the full file moves to
   * PAGE_MODULE for the routes that read it. 10.1KB becomes 0.7KB.
   *
   * Precomputed rather than split into a second hand-written data file,
   * because a field subset of the same records IS a second copy and would be
   * free to drift — the reason this generator exists at all. The clock renders
   * at most four (`.slice(0, open.length ? 1 : 4)`), but ALL qualifying rows
   * are emitted: capping at four here would couple this file to that constant,
   * and the difference measured 0.47KB gzipped against a 9.4KB saving.
   *
   * The filter is the app's own: a row reaches the landing hero only if it is
   * `verified` and carries a deadline. tests/landing-stats.test.js recomputes
   * it, so a record losing its verification drops out of the clock here rather
   * than being announced to a reader on the strength of a stale artefact. */
  fundingSources: FUNDING_SOURCES.length,
  fundingDeadlines: FUNDING_SOURCES
    .filter((f) => f.data_confidence === 'verified' && f.application_deadline)
    .map((f) => ({ name: f.name, application_deadline: f.application_deadline }))
};

const out = `/* GENERATED by tools/build-landing-stats.mjs — do not hand-edit.
 *
 * The landing page's aggregate figures, precomputed so that rendering them does
 * not require the whole catalogue on the critical path. Regenerate whenever
 * data/courses.js, data/institutions.js, data/sectors.js or feeBasis() in
 * js/decide.js changes; tests/landing-stats.test.js recomputes every field and
 * fails the build if this file has drifted.
 *
 * published/derived are classified by feeBasis() read out of js/decide.js at
 * build time, not by a second copy of the rule.
 */
const LANDING_STATS = ${JSON.stringify(stats, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LANDING_STATS };
}
`;

fs.writeFileSync(path.join(root, 'data', 'landing-stats.js'), out);
console.log(`wrote data/landing-stats.js — ${stats.courses} courses, ${stats.institutions} institutions, `
  + `${stats.counties} counties, ${stats.published} published / ${stats.derived} derived fees, `
  + `${Object.keys(stats.sectorRoutes).length} sectors, `
  + `${stats.fundingDeadlines.length}/${stats.fundingSources} funding rows for the clock`);
