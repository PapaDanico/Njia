/* Njia — the two things the LANDING PAGE needs, and only those.
 *
 * WHY THIS FILE IS SEPARATE FROM data/labour-market.js.
 *
 * `PLACEMENT_MECHANICS` and `PLACEMENT_CALENDAR` are read by js/app.js, which
 * every reader loads before they can do anything: the Application Clock in the
 * landing hero is built from the calendar, and the TVET-eligibility note under
 * it from the mechanics. They belong on the critical path.
 *
 * The other twenty-eight symbols in labour-market.js do not. They are Discover,
 * Decide and Connect content — sector earnings, entry pay, automation exposure,
 * the CBE pathway explainer — and while they shared a file with these two, the
 * whole 34.7KB gzipped of it was downloaded by every reader before first paint,
 * including everyone who never opened those pages. That is the same shape as
 * the split already in this project's history: 86.3KB of catalogue loaded "to
 * render eight integers on a page that shows no course".
 *
 * So the file was cut where the consumers actually divide, not where the
 * subject matter does. A placement date and a sector salary look like the same
 * kind of fact; one is needed at first paint and the other is not, and that is
 * the only distinction the reader pays for.
 *
 * data/labour-market.js is now loaded lazily by PAGE_MODULE for the three
 * routes that use it. It stays in CACHE_ASSETS: lazy must not mean optional,
 * or the app stops working offline — the rule this project learned when the
 * catalogue came off the critical path.
 */

/* HOW DEGREE PLACEMENT ACTUALLY WORKS — and why a mean grade is not the answer.
 *
 * Njia stores a `min_grade` per course and tells the user whether they meet it.
 * For certificates and diplomas that is close enough. For degrees it is not,
 * and the gap matters:
 *
 *   KUCCPS places degree applicants on WEIGHTED CLUSTER POINTS — computed from
 *   performance in the four subjects that specific programme requires, measured
 *   against the best candidates, to three decimal places. Every programme sits
 *   in one of about 18-20 subject clusters.
 *
 *   A CUT-OFF POINT is not a threshold set in advance. It is the cluster score
 *   of the LAST student competitively placed in that programme last cycle. It
 *   moves every year with demand, institutional capacity and how the cohort
 *   performed.
 *
 * Two consequences a student needs stated plainly. Meeting the mean grade makes
 * you eligible to apply, not placed. And chasing last year's cut-off is chasing
 * a number that no longer exists — it was an outcome, not a target.
 */
const PLACEMENT_MECHANICS = {
  source: 'KUCCPS placement guidance and 2026 cycle explainers, cross-reported August 2026',
  meanGradeRole: 'The mean grade (C+ and above for degrees) determines whether you may apply at all.',
  clusterPointsRole: 'Placement itself is decided on weighted cluster points — your performance in the four subjects that programme requires, ranked against every other applicant, to three decimal places.',
  cutOffTruth: 'A cut-off point is the cluster score of the last student placed in that programme last cycle, not a bar set in advance. It changes every year with demand, capacity and cohort performance.',
  doesNotGuarantee: 'Meeting the cut-off does not guarantee placement — programme capacity and competition still decide.',
  practicalAdvice: 'Do not compute cluster points by hand. The KUCCPS student portal calculates yours and shows them directly. Use last year\'s cut-offs to gauge how competitive a programme is, never as a score to aim at.',

  /* The rule almost nobody is told, and the reason this app should not
   * address only school leavers.
   *
   * TVET placement is not restricted to the current cohort. Any KCSE grade
   * from A to E qualifies, for anyone who sat the exam from 2000 onward, and
   * TVET intake runs continuously rather than through one annual window. That
   * means a 32-year-old who left school in 2012 with a D is eligible for the
   * same artisan and certificate programmes as this year's Form Four leaver —
   * and is more likely to have their own phone and their own fees.
   *
   * Njia's copy, its module numbering and its countdown clock all quietly
   * assume the reader just got their results. For the degree track that is
   * true. For the trades it is wrong by about twenty-five years of cohorts. */
  tvetEligibility: {
    grades: 'Any KCSE mean grade, A to E.',
    years: 'Anyone who sat KCSE from 2000 onward — not only this year\'s candidates.',
    intake: 'TVET placement is continuous, with reporting to colleges from May rather than a single annual window.',
    choices: 'An applicant may select up to 6 degree programmes and up to 4 TVET programmes — diploma, certificate or artisan — in the same cycle.',
    capacity: '251 public TVET colleges are open for placement this cycle, including 33 university-affiliated institutes.',
    whyItMatters: 'If you left school years ago and assumed the door closed behind you, it did not. The grade you got does not disqualify you from a trade, and the year you sat does not either.',
    source: 'KUCCPS 2026 placement cycle announcements, cross-reported March-April 2026'
  }
};

/* THE PLACEMENT CALENDAR. Dates, not prose, so the app can work out what is
 * actually open today rather than shipping a claim that quietly goes stale.
 * Every window below is for the 2026 cycle.
 *
 * A DATE IS A CLAIM, AND IT PERISHES FASTER THAN A FEE.
 *
 * On 8 September 2026 this file said the KMTC September intake ran
 * 1 July to 30 September. It did not: KUCCPS opened it on 24 July and closed
 * it on 11 August. The landing hero was therefore counting down "23 days
 * left" for a window that had been shut for four weeks — the exact failure
 * the -0 fix in tests/placement-clock.test.js was written to prevent, arriving
 * by the other route. Correct code cannot save a wrong date, and the two
 * bracketing dates had never been sourced; they were the shape of the intake
 * rather than its published window.
 *
 * That is the fee rule applied to time: a figure is either sourced or absent.
 * So every entry now carries `source` and `verified`, and
 * tests/placement-clock.test.js fails the build if a window that is still open
 * has not been re-checked inside 120 days. A stale closed window is invisible;
 * a stale OPEN one sends someone to a portal that will not take them, which is
 * the eligibility direction this project never rounds the wrong way. */
const PLACEMENT_CALENDAR = [
  { name: 'KUCCPS main application (degree, diploma, certificate, TVET)', opens: '2026-04-07', closes: '2026-05-06',
    note: 'The main window for the 2025 KCSE cohort.',
    source: 'KUCCPS media release "KUCCPS Opens Application Window for 2026 Placement to Universities and Colleges" (kuccps.net), cross-reported by People Daily and Teacher.co.ke',
    verified: '2026-09-08' },
  { name: 'KUCCPS second call — revise your choices', opens: '2026-05-16', closes: '2026-05-22',
    note: 'For applicants not placed in the first round.',
    source: 'KUCCPS first revision window, reported by The Kenya Times, "KUCCPS Reopens Portal For Second Revision For 2026 University Placement"',
    verified: '2026-09-08' },
  { name: 'KUCCPS second revision — a last pass at your choices', opens: '2026-05-27', closes: '2026-05-31',
    note: 'A further window for applicants who did not secure a course by 22 May. It was missing from this calendar entirely until the September 2026 sweep.',
    source: 'The Kenya Times, "KUCCPS Reopens Portal For Second Revision For 2026 University Placement" — second revision ran 27 to 31 May 2026',
    verified: '2026-09-08' },
  { name: 'KMTC March intake application', opens: '2026-01-07', closes: '2026-01-27',
    note: 'KMTC runs its own intake cycles through KUCCPS. 21,774 places across 36 programmes at 98 campuses.',
    source: 'KUCCPS "KMTC March 2026 Intake" advert (kuccps.net), and The Star, 8 January 2026, "KUCCPS opens applications for KMTC March 2026 intake"',
    verified: '2026-09-08' },
  { name: 'Inter-institutional transfer', opens: '2026-07-17', closes: '2026-08-14',
    note: 'If you were placed somewhere you cannot take up, this is the route to move. Open to the 2023, 2024 and 2025 KCSE cohorts.',
    source: 'The Star, 17 July 2026, "KUCCPS opens 2026 inter-institution transfer window for students", and Capital FM — a 30-day window closing 14 August 2026',
    verified: '2026-09-08' },
  { name: 'Kenya Utalii College (Ronald Ngala, Kilifi)', opens: '2026-06-01', closes: '2026-08-23',
    note: 'Separate deadline from the main cycle. Reopened in September — see the row below, which is the one still live.',
    source: 'KUCCPS "Opens September Intake Application for Utalii College\u2019s New Campus" (kuccps.net); the opening date is the cycle shape rather than a published day, which is why the closing date is the only one this row is relied on for',
    verified: '2026-09-08' },
  { name: 'KMTC September intake', opens: '2026-07-24', closes: '2026-08-11',
    note: 'Pre-service diploma and certificate programmes through the KUCCPS portal, for KCSE candidates from 2000 to 2025. In-service and upgrading applications go through KMTC\u2019s own admissions portal instead.',
    source: 'KUCCPS media release for the KMTC September 2026 intake (kuccps.net), The Star 24 July 2026, and The Eastleigh Voice — 34 programmes, 24 diploma and 10 certificate, closing 11 August 2026',
    verified: '2026-09-08' },
  { name: 'KMTC and Kenya Utalii College — reopened applications', opens: '2026-09-08', closes: '2026-09-14',
    note: 'A second chance for anyone who missed 11 August. KUCCPS reopened the portal for KMTC medical diploma and certificate programmes and for Kenya Utalii College hospitality and tourism courses, for the 2020 to 2025 KCSE cohorts.',
    source: 'People Daily, 8 September 2026, "KUCCPS reopens KMTC and Utalii College applications for September 2026 intake", quoting KUCCPS CEO Agnes Mercy Wahome; also Education News and Kahawatungu',
    verified: '2026-09-08' },
  { name: 'TVET placement (continuous)', opens: '2026-05-01', closes: '2026-12-31',
    note: 'TVET admission is continuous rather than a single annual exercise, and colleges report from May. This is the door that stays open longest.',
    source: 'KUCCPS 2026 placement coverage: TVET placement is continuous and colleges report from May, unlike the degree track. The 31 December bound is the calendar year, not a published deadline.',
    verified: '2026-09-08' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PLACEMENT_MECHANICS, PLACEMENT_CALENDAR };
}
