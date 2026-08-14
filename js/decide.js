/* Njia — decide.js — MODULE 3: The Evidence Engine
 * Course Matcher, Funding Finder, Feasibility Dashboard.
 * Depends on: data/institutions.js, data/courses.js, data/funding.js,
 * data/questions.js (CLUSTERS), js/app.js
 */

const GRADE_ORDER = ['E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A'];
// Each bucket besides D corresponds to an "X and above" questionnaire option
// (e.g. "B to B+"), so defaulting to the floor of that range is the
// conservative choice — never overstates eligibility. The D bucket is the
// one inverted range ("D+ and below", spanning down to E) — there is no
// floor to default to safely, so it's deliberately absent here rather than
// reusing 'D+' (the range's ceiling), which would have silently overstated
// eligibility for the lowest-grade, most budget-constrained users.
// getEffectiveGrade() falls back to "unknown grade" for this bucket instead.
const GRADE_BUCKET_DEFAULT = { A: 'A-', B: 'B', C: 'C' };

/* Every level that actually has a record, lowest entry bar first.
 *
 * The level filter used to be a hardcoded ['certificate','diploma','degree'].
 * Adding the artisan tier to data/courses.js would have left those records
 * reachable only under "All Levels" — in the data, absent from the dropdown,
 * and invisible to precisely the learners the tier was added for. Deriving
 * the list means a level can never again exist in the catalogue but not in
 * the UI. LEVEL_ORDER only fixes the running order; a level missing from it
 * still appears, sorted to the end, rather than being dropped. */
const LEVEL_ORDER = ['artisan', 'certificate', 'diploma', 'degree'];
const LEVEL_LABELS = { artisan: 'Artisan', certificate: 'Certificate', diploma: 'Diploma', degree: 'Degree' };
const CATALOGUE_LEVELS = [...new Set(COURSES.map((c) => c.level))].sort((a, b) => {
  const rank = (l) => (LEVEL_ORDER.indexOf(l) === -1 ? Number.MAX_SAFE_INTEGER : LEVEL_ORDER.indexOf(l));
  return rank(a) - rank(b) || a.localeCompare(b);
});

function gradeRank(grade) {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx === -1 ? 0 : idx;
}

function meetsGradeRequirement(userGrade, minGrade) {
  if (!minGrade) return true;
  if (!userGrade) return true; // unknown grade — don't filter out, just don't claim eligibility
  return gradeRank(userGrade) >= gradeRank(minGrade);
}

/* estimateMark() stood here. It stamped "est." on any outcome figure whose
 * provenance was illustrative, with a tooltip explaining that Kenya publishes
 * no per-course graduate outcomes — and its own comment said it must never be
 * dropped for visual tidiness. It has not been: the figures it qualified were
 * fabricated for every record, so they were removed rather than labelled, and
 * a marker with nothing left to mark is dead code. The tooltip's point now
 * lives in data/courses.js, where the fields are held permanently null. */

function institutionById(id) {
  return INSTITUTIONS.find((i) => i.id === id);
}

// Only counties with at least one actual course — a handful of institutions
// in the directory (e.g. Egerton, KMTC-Kakamega) aren't paired with any
// course yet, and are each the only institution in their county, so
// including every institution's county here would offer filter options
// (like "Nakuru" or "Kakamega") that are guaranteed to return zero results.
const COURSE_INSTITUTION_IDS = new Set(COURSES.map((c) => c.institution_id));
const COUNTIES = [...new Set(INSTITUTIONS.filter((i) => COURSE_INSTITUTION_IDS.has(i.id)).map((i) => i.county))].sort();

/* Illustrative accommodation + upkeep planning estimate (Ksh/month) — a
 * rough budgeting aid, not verified data, since actual rent/upkeep varies
 * heavily by town and student. total_fees_kes elsewhere is tuition only,
 * which understates what a course really costs to complete. */
const ACCOMMODATION_ESTIMATE_KES_PER_MONTH = { onCampus: 4000, offCampus: 8000 };

function getEffectiveGrade() {
  const f = AppState.decideFilters;
  if (f.grade) return f.grade;
  const bucket = AppState.questionnaire.results?.constraints?.grade;
  return bucket ? GRADE_BUCKET_DEFAULT[bucket] || null : null;
}

function renderDecidePage() {
  const el = document.getElementById('page-decide');
  if (!el) return;

  const verifiedCount = COURSES.filter((c) => c.fees_confidence === 'verified').length
    + FUNDING_SOURCES.filter((f) => f.data_confidence === 'verified').length;
  const totalCount = COURSES.length + FUNDING_SOURCES.length;

  const counties = new Set(INSTITUTIONS.filter((i) => COURSE_INSTITUTION_IDS.has(i.id)).map((i) => i.county));
  const levels = new Set(COURSES.map((c) => c.level));
  // Only over published fees: Math.min(x, null) is 0, which would have
  // advertised the catalogue's cheapest course as free.
  const cheapest = COURSES.reduce((min, c) => (c.total_fees_kes == null ? min : Math.min(min, c.total_fees_kes)), Infinity);

  el.innerHTML = `
    <div class="module-header">
      <div class="module-header-main">
        <p class="page-eyebrow">Module 03 · Decide</p>
        <h1 class="mb-1">Decide</h1>
        <p class="text-secondary mb-2">Every recommendation answers three questions: Do I qualify? Can I afford it? Will it lead to work I care about?</p>
        <div class="data-disclaimer">
          ${icon('alert')}
          <!-- This sentence used to end "no figure marked est. has been
               measured", and rendered the est. badge inline as an example.
               Both outlived the thing they described: the employment rates
               and salaries were removed rather than labelled, so the copy
               was pointing at a marker that no longer appears anywhere. -->
          <span><strong>${verifiedCount} of ${totalCount} records</strong> have fees or terms cross-checked against a named public source — look for the ✓ Fees verified badge. <strong>You will not find an employment rate or a salary on a course here</strong>: Kenya does not publish graduate outcomes per course, so rather than print an estimate and label it, Njia prints nothing. Sourced pay ranges for the kind of work a cluster leads to appear with your Discover results. Always confirm fees with the institution before deciding.</span>
        </div>
        <div class="data-disclaimer data-disclaimer-open">
          <!-- Placed here rather than in the evidence layer on purpose: this is
               the one screen someone reaches when they are looking for a course
               and quietly assuming they are too old or scored too low to be
               here. The rule is the opposite of what most people assume. -->
          <span aria-hidden="true">↗</span>
          <span><strong>If you left school years ago, the door did not close.</strong> TVET placement takes <strong>any KCSE grade, A to E</strong>, from anyone who sat the exam <strong>from 2000 onward</strong> — not just this year's candidates. Intake runs continuously rather than in one annual window, across 251 public colleges, and you may hold up to 4 TVET choices alongside 6 degree choices in the same cycle. <span class="text-muted">KUCCPS 2026 placement cycle.</span></span>
        </div>
      </div>
      <aside class="module-header-aside">
        <p class="decide-rail-title">Catalogue coverage</p>
        <div class="coverage-grid">
          <div><span class="coverage-num num">${DISTINCT_PROGRAMMES}</span><span class="coverage-label">distinct programmes</span></div>
          <div><span class="coverage-num num">${COURSES.length}</span><span class="coverage-label">places to apply</span></div>
          <div><span class="coverage-num num">${INSTITUTIONS.length}</span><span class="coverage-label">institutions</span></div>
          <div><span class="coverage-num num">${counties.size}</span><span class="coverage-label">counties</span></div>
          <div><span class="coverage-num num">${levels.size}</span><span class="coverage-label">qualification levels</span></div>
          <div><span class="coverage-num num">${FUNDING_SOURCES.length}</span><span class="coverage-label">funding sources</span></div>
          ${/* Two OUK short courses genuinely cost nothing. Rendering that as
                a bare "0" reads as missing data rather than as the useful fact
                it is, so it says Free. */''}
          <div><span class="coverage-num num">${cheapest === 0 ? 'Free' : formatKes(cheapest).replace('Ksh ', '')}</span><span class="coverage-label">${cheapest === 0 ? 'lowest tuition in the catalogue' : 'lowest tuition (Ksh)'}</span></div>
        </div>
        <p class="coverage-note">Every figure computed from the dataset this build ships.</p>
      </aside>
    </div>
    <div class="odyssey-tabs">
      <button type="button" class="odyssey-tab ${AppState.decideFilters.activeTab === 'courses' ? 'active' : ''}" onclick="setDecideTab('courses')">${icon('grad-cap')}Courses</button>
      <button type="button" class="odyssey-tab ${AppState.decideFilters.activeTab === 'funding' ? 'active' : ''}" onclick="setDecideTab('funding')">${icon('coins')}Funding</button>
    </div>
    <div id="decide-tab-content"></div>
  `;

  renderDecideTabContent();
}

function setDecideTab(tab) {
  AppState.decideFilters.activeTab = tab;
  saveState();
  renderDecidePage();
}

function renderDecideTabContent() {
  const container = document.getElementById('decide-tab-content');
  if (!container) return;
  if (AppState.decideFilters.activeTab === 'courses') renderCourseMatcher(container);
  else renderFundingFinder(container);
  replayFadeIn(container);
}

/* ---------- Course Matcher ----------
 * scoreCourseMatch is deliberately pure (course + profile in, score out —
 * no AppState, no DOM) so `node --test tests/*.test.js` can exercise it directly.
 * It also returns a factor-by-factor breakdown that renderCourseCard shows
 * under "Why this match?", so the score is explainable, not an oracle. */
function scoreCourseMatch(course, profile) {
  const { hasResults, primary, secondary, grade, budgetMax, homeCounty, courseCounty } = profile;
  const breakdown = [];
  let score = 40;
  if (hasResults) {
    if (course.cluster === primary) {
      score = 95;
      breakdown.push({ factor: 'Career fit', detail: `${CLUSTERS[course.cluster].short} is your primary cluster — the strongest signal in your Discovery results.`, effect: 'up' });
    } else if (course.cluster === secondary) {
      score = 72;
      breakdown.push({ factor: 'Career fit', detail: `${CLUSTERS[course.cluster].short} is your secondary cluster — a good, but not strongest, fit.`, effect: 'up' });
    } else {
      score = 35;
      breakdown.push({ factor: 'Career fit', detail: `${CLUSTERS[course.cluster].short} is outside your two matched clusters.`, effect: 'down' });
    }
  } else {
    breakdown.push({ factor: 'Career fit', detail: 'Complete Discover to personalise this — without your results every course starts from the same baseline.', effect: 'neutral' });
  }

  // Locality. The catalogue now reaches 45 counties, largely because KMTC
  // teaches the same programmes at campuses nationwide. That is the point of
  // the expansion, but it means an identical course exists in dozens of
  // places, and without this a student in Kisumu would see the Lodwar campus
  // ranked exactly level with the one down the road. Studying near home is
  // often the difference between affordable and impossible — relocation means
  // rent, transport and being away from family support.
  //
  // Applied only when a county is actually selected: with "All Counties" there
  // is no home location to measure against, and inventing one would be worse
  // than staying silent.
  if (homeCounty && courseCounty) {
    if (courseCounty === homeCounty) {
      score += 3;
      breakdown.push({ factor: 'Location', detail: `Taught in ${courseCounty} — no relocation, so no rent or transport on top of fees.`, effect: 'up' });
    } else {
      score -= 3;
      breakdown.push({ factor: 'Location', detail: `Taught in ${courseCounty}, away from ${homeCounty} — budget for accommodation and travel on top of the fee.`, effect: 'down' });
    }
    score = Math.max(0, Math.min(100, score));
  }

  const eligible = meetsGradeRequirement(grade, course.min_grade);
  const gradeUnconfirmed = grade == null && !!course.min_grade;
  if (!eligible) {
    score = Math.min(score, 20);
    breakdown.push({ factor: 'Grade eligibility', detail: `Requires ${course.min_grade}; your grade (${grade}) is below it — the score is capped until that changes.`, effect: 'down' });
  } else if (gradeUnconfirmed) {
    // meetsGradeRequirement() treats an unknown grade as "don't claim
    // ineligible", which is right — but the UI still needs to show the
    // difference between "confirmed eligible" and "eligibility unverified".
    breakdown.push({ factor: 'Grade eligibility', detail: `Requires ${course.min_grade} — set your grade in the filters to confirm you qualify.`, effect: 'neutral' });
  } else if (course.min_grade) {
    // For a degree, meeting the mean grade makes you eligible to *apply* — it
    // does not mean you will be placed. KUCCPS decides degree placement on
    // weighted cluster points across the four subjects that programme requires,
    // and the "cut-off" is whatever the last student placed last cycle scored.
    // Saying "your grade meets it" and stopping there reads as "you're in",
    // which is the single most consequential thing this app could get wrong.
    const detail = course.level === 'degree'
      ? `Requires ${course.min_grade} — your grade (${grade}) meets it, so you can apply. Degree placement is decided on weighted cluster points in the four subjects this course requires, not on mean grade alone.`
      : `Requires ${course.min_grade} — your grade (${grade}) meets it.`;
    breakdown.push({ factor: 'Grade eligibility', detail, effect: 'up' });
  } else {
    breakdown.push({ factor: 'Grade eligibility', detail: 'No minimum grade requirement.', effect: 'up' });
  }

  if (budgetMax != null) {
    /* The penalty scales with HOW FAR over budget, and is read from the same
     * feasibilitySignal the card renders, so the score and the badge cannot
     * drift apart.
     *
     * It used to be a flat -25 for any overage at all. That made a course
     * Ksh 10,000 above budget rank identically to one Ksh 810,000 above it —
     * measured, both scored 15 — which is precisely backwards for this
     * catalogue. Fees here run from free to over Ksh 800,000, and the whole
     * point of showing over-budget courses rather than hiding them is that
     * something slightly out of reach may be reachable with a bursary while
     * something ten times over is not. A flat penalty threw that distinction
     * away at the moment the ranking needed it.
     *
     * The curve starts at 8 for a near miss and caps at 40 once tuition is
     * double the budget — past that, "further out of reach" stops carrying
     * useful information. */
    const feas = feasibilitySignal(course, budgetMax);
    if (feas.level === 'unknown') {
      // Neither rewarded nor punished. Penalising an unpublished fee would
      // bury the cheapest institutions in the catalogue — county VTCs are
      // where a learner with no money actually goes — and treating it as
      // affordable would be a claim the data does not support.
      breakdown.push({
        factor: 'Budget',
        detail: 'This centre does not publish a fee — ask them directly before you count it in or out.',
        effect: 'neutral'
      });
    } else if (feas.level === 'within') {
      breakdown.push({ factor: 'Budget', detail: 'Tuition fits within your maximum budget.', effect: 'up' });
    } else {
      const penalty = Math.min(40, Math.round(8 + (feas.overBy / budgetMax) * 32));
      score = Math.max(0, score - penalty);
      // Formatted inline rather than through formatKes(). That helper lives in
      // app.js, and scoreCourseMatch is deliberately AppState- and
      // document-free so tests/scoring.test.js can load it into a bare vm
      // context with only the data files — see that file's header. Reaching
      // for the helper here broke every test in it at once.
      const gap = `Ksh ${feas.overBy.toLocaleString('en-KE')}`;
      breakdown.push({
        factor: 'Budget',
        detail: feas.level === 'stretch'
          ? `${gap} above your budget — a stretch, and the kind of gap a bursary can close.`
          : `${gap} above your budget — shown rather than hidden, but treat it as a long shot without funding.`,
        effect: 'down'
      });
    }
  }

  return { score: Math.round(score), eligible, gradeUnconfirmed, breakdown };
}

/* Tuition vs the user's stated budget as a three-state signal. "Stretch"
 * means within 25% over — visible as a reachable-with-funding option
 * rather than silently lumped in with far-out-of-reach courses. Pure, tested. */
function feasibilitySignal(course, budgetMax) {
  if (budgetMax == null) return null;
  // Some institutions genuinely do not publish a fee — county vocational
  // training centres mostly say "contact the admissions office". That is
  // recorded as a null rather than a guessed number, and it has to be its
  // own state: `null <= budgetMax` is true in JavaScript, so without this
  // line an unpublished fee would report as comfortably "within budget"
  // and earn the affordability bonus. Not knowing is not the same as cheap.
  if (course.total_fees_kes == null) return { level: 'unknown', overBy: 0 };
  if (course.total_fees_kes <= budgetMax) return { level: 'within', overBy: 0 };
  const overBy = course.total_fees_kes - budgetMax;
  return course.total_fees_kes <= budgetMax * 1.25
    ? { level: 'stretch', overBy }
    : { level: 'over', overBy };
}

/* Fee comparator that sends unpublished fees to the end of the list in BOTH
 * directions. Subtracting a null yields NaN, and a NaN comparator makes
 * Array.prototype.sort's result implementation-defined — the unpublished
 * rows would have landed in arbitrary positions rather than obviously last. */
function byFee(a, b, dir) {
  if (a.total_fees_kes == null && b.total_fees_kes == null) return 0;
  if (a.total_fees_kes == null) return 1;
  if (b.total_fees_kes == null) return -1;
  return dir === 'asc'
    ? a.total_fees_kes - b.total_fees_kes
    : b.total_fees_kes - a.total_fees_kes;
}

/* How many months of the median graduate salary the tuition costs. A blunt
 * but honest return signal: a 12-month certificate that costs two months of
 * pay is a different proposition from a degree that costs fourteen. Pure.
 *
 * Retained because it is the correct arithmetic and it is unit-tested, but
 * nothing in the catalogue feeds it any more: every median_salary_kes was
 * invented and is now null, so this returns null for every real course. No
 * caller renders it. If per-course salary data is ever published and sourced,
 * this is ready; until then it is a function waiting for evidence. */
function paybackMonths(course) {
  if (!course.median_salary_kes || !course.total_fees_kes) return null;
  return Math.round((course.total_fees_kes / course.median_salary_kes) * 10) / 10;
}

/* The same signal, standing on sourced ground.
 *
 * Every per-course employment_rate and median_salary_kes in this catalogue was
 * illustrative — not one had been measured, because Kenya publishes no
 * per-course graduate outcomes. Marking them "(est.)" qualified each number
 * while leaving the *differences* between them intact, and the differences
 * were the fabrication: a learner reading 88% against 45% takes that as a
 * reason to choose, and there was nothing underneath it.
 *
 * ENTRY_PAY is different in kind. It is sourced — TSC CBA scales, published
 * artisan day rates — and each band is a range attached to a named role and
 * employer type rather than a point estimate per course.
 *
 * The course card deliberately shows NO pay figure at all, and arriving there
 * took two wrong turns worth recording, because both looked like fixes.
 *
 * The first replaced the per-course salary with the cluster's lowest-floor
 * ENTRY_PAY band, on the reasoning that the conservative end is the honest one
 * to plan against. It printed "entry pay for Nurse (KRCHN diploma), private
 * hospital" underneath a Diploma in Counselling Psychology — a real, sourced,
 * correctly-cited figure attached to a job the course does not lead to.
 * Swapping a fabricated number for an accurate but mislabelled one is not an
 * improvement.
 *
 * The second widened it to a cluster span, low floor to high ceiling, with the
 * roles named as examples. That produced "entry pay ... Ksh 20,000–70,000" for
 * carer, where the 70,000 comes from a band whose own note reads "around five
 * years in". The bands are not commensurable: some are entry level, one is
 * mid-career, and the cluster tags are coarse enough that numbers and creator
 * both resolve to freelance digital work. Averaging them into a range strips
 * the very caveats that make each one true.
 *
 * ENTRY_PAY is already presented properly on the results screen, one band at a
 * time, each with its role and its note intact — which is the only form in
 * which it is honest. A course card cannot summarise it without lying, so it
 * does not try. Tuition is on the card and is verified; what that tuition buys
 * is a question the evidence layer answers in its own words. */

function computeCourseMatch(course) {
  const results = AppState.questionnaire.results;
  return scoreCourseMatch(course, {
    hasResults: !!results,
    primary: results?.primary,
    secondary: results?.secondary,
    grade: getEffectiveGrade(),
    budgetMax: AppState.decideFilters.budgetMax,
    // Only meaningful once a county is chosen. Left null for "All Counties",
    // where there is no home location to rank against.
    homeCounty: AppState.decideFilters.county !== 'all' ? AppState.decideFilters.county : null,
    courseCounty: institutionById(course.institution_id)?.county || null
  });
}

function renderCourseMatcher(container) {
  const ownership = AppState.decideFilters.ownership || 'all';
  const clusterOptions = ['all', ...Object.keys(CLUSTERS)];
  const grade = getEffectiveGrade();

  // Budget only penalises match score (below) rather than hiding a course —
  // a great over-budget course should still be visible as "a stretch", not
  // disappear. Only cluster/mode/county can actually zero out this list.
  // Derived from the catalogue, not hardcoded. These were once a literal
  // ['all','certificate','diploma','degree'], which meant adding the artisan
  // tier to data/courses.js would have left artisan courses reachable only
  // under "All Levels" — present in the data, unfilterable in the UI, and
  // invisible to exactly the learners the tier exists for. Anything with a
  // record now gets an option; LEVEL_ORDER only decides the running order,
  // and a level missing from it still appears, at the end.
  const levelOptions = ['all', ...CATALOGUE_LEVELS];

  const modeOptions = ['any', 'full_time', 'evening', 'weekend', 'online'];
  const modeLabels = { any: 'Any Schedule', full_time: 'Full-Time', evening: 'Evening', weekend: 'Weekend', online: 'Online' };

  const matchesCluster = (course) => AppState.decideFilters.cluster === 'all' || course.cluster === AppState.decideFilters.cluster;
  const matchesMode = (course) => AppState.decideFilters.mode === 'any' || course.mode === AppState.decideFilters.mode;
  const matchesLevel = (course) => AppState.decideFilters.level === 'all' || course.level === AppState.decideFilters.level;
  const matchesCounty = (course) => {
    if (AppState.decideFilters.county === 'all') return true;
    return institutionById(course.institution_id)?.county === AppState.decideFilters.county;
  };
  const matchesSaved = (course) => !AppState.decideFilters.savedOnly || AppState.savedCourses.includes(course.id);
  // Public vs private is the single biggest driver of what a course costs,
  // so it deserves a filter rather than being buried in the institution name.
  const matchesOwnership = (course) => ownership === 'all'
    || institutionById(course.institution_id)?.ownership === ownership;

  let filtered = COURSES
    .filter((c) => matchesCluster(c) && matchesMode(c) && matchesLevel(c) && matchesCounty(c) && matchesSaved(c) && matchesOwnership(c))
    .map((c) => ({ course: c, match: computeCourseMatch(c) }));

  // Analytical layer: how much of the catalogue this grade actually unlocks.
  // A concrete answer to "is my grade the thing holding me back?".
  const gradeOpenPct = grade
    ? Math.round((COURSES.filter((c) => meetsGradeRequirement(grade, c.min_grade)).length / COURSES.length) * 100)
    : null;

  const sortOptions = { match: 'Best Match', fees_low: 'Lowest Fees', fees_high: 'Highest Fees', duration: 'Shortest Duration' };
  // Anyone who had 'employment' selected when it was removed still carries it
  // in saved state. Fall back rather than render a select with nothing
  // selected — which would show "Best Match" while state said otherwise.
  const sortBy = Object.hasOwn(sortOptions, AppState.decideFilters.sortBy) ? AppState.decideFilters.sortBy : 'match';
  if (sortBy !== AppState.decideFilters.sortBy) { AppState.decideFilters.sortBy = sortBy; saveState(); }
  // There is deliberately no "sort by employment rate" here. Every
  // employment_rate in the catalogue is illustrative — Kenya publishes no
  // per-course graduate outcomes, so not one of them has been measured.
  // Labelling the option "(est.)" was the old mitigation and it was not
  // enough: the label qualifies the number while the ordering still presents
  // a ranking the data cannot support. Sorting is a stronger claim than
  // display, so outcomes may be shown (marked est.) and may not rank.
  const sorters = {
    match: (a, b) => b.match.score - a.match.score,
    fees_low: (a, b) => byFee(a.course, b.course, 'asc'),
    fees_high: (a, b) => byFee(a.course, b.course, 'desc'),
    duration: (a, b) => a.course.duration_months - b.course.duration_months
  };
  filtered.sort(sorters[sortBy] || sorters.match);

  // Smarter empty state: name whichever filter is actually the blocker.
  let emptyMessage = 'Try clearing the cluster, level, mode or county filter.';
  if (filtered.length === 0 && AppState.decideFilters.savedOnly) {
    emptyMessage = AppState.savedCourses.length === 0
      ? 'You haven\'t saved any courses yet — browse below and tap ☆ Save on ones you like.'
      : 'None of your saved courses match your other filters — clear a filter to see them.';
  } else if (filtered.length === 0) {
    const countyOnlyBlocks = AppState.decideFilters.county !== 'all'
      && COURSES.some((c) => matchesCluster(c) && matchesMode(c) && matchesLevel(c) && !matchesCounty(c));
    const clusterOnlyBlocks = AppState.decideFilters.cluster !== 'all'
      && COURSES.some((c) => matchesCounty(c) && matchesMode(c) && matchesLevel(c) && !matchesCluster(c));
    const levelOnlyBlocks = AppState.decideFilters.level !== 'all'
      && COURSES.some((c) => matchesCluster(c) && matchesMode(c) && matchesCounty(c) && !matchesLevel(c));
    const modeOnlyBlocks = AppState.decideFilters.mode !== 'any'
      && COURSES.some((c) => matchesCluster(c) && matchesLevel(c) && matchesCounty(c) && !matchesMode(c));
    const blockers = [countyOnlyBlocks, clusterOnlyBlocks, levelOnlyBlocks, modeOnlyBlocks].filter(Boolean).length;
    if (blockers === 1) {
      if (countyOnlyBlocks) emptyMessage = 'Matching courses exist in other counties — try "All Counties" or a different one.';
      else if (clusterOnlyBlocks) emptyMessage = 'No courses in this cluster match your other filters — try "All Clusters".';
      else if (levelOnlyBlocks) emptyMessage = 'No courses at this level match your other filters — try "All Levels".';
      else if (modeOnlyBlocks) emptyMessage = 'No courses at this learning mode match your other filters — try "Any Schedule".';
    }
  }

  container.innerHTML = `
    <div class="decide-layout">
    <aside class="decide-rail" aria-label="Course filters">
    <p class="decide-rail-title">Filter the catalogue</p>
    <!-- Rendered unconditionally and hidden when empty, so saving your first
         course toggles an attribute instead of re-rendering the catalogue. -->
    <div class="filter-row" data-saved-row aria-label="Show saved courses only" ${AppState.savedCourses.length > 0 ? '' : 'hidden'}>
      <button type="button" data-saved-chip class="filter-chip ${AppState.decideFilters.savedOnly ? 'active' : ''}" onclick="toggleDecideSavedOnly()">
        ★ Saved Only (${AppState.savedCourses.length})
      </button>
    </div>

    <div class="filter-toolbar" aria-label="Course filters">
      <select class="form-control" aria-label="Filter by career cluster" onchange="setDecideClusterFilter(this.value)">
        ${clusterOptions.map((c) => `<option value="${c}" ${AppState.decideFilters.cluster === c ? 'selected' : ''}>${c === 'all' ? 'All Clusters' : CLUSTERS[c].short}</option>`).join('')}
      </select>
      <select class="form-control" aria-label="Filter by qualification level" onchange="setDecideLevelFilter(this.value)">
        ${levelOptions.map((l) => `<option value="${l}" ${AppState.decideFilters.level === l ? 'selected' : ''}>${l === 'all' ? 'All Levels' : escapeHtml(LEVEL_LABELS[l] || l)}</option>`).join('')}
      </select>
      <select class="form-control" aria-label="Filter by learning mode" onchange="setDecideModeFilter(this.value)">
        ${modeOptions.map((m) => `<option value="${m}" ${AppState.decideFilters.mode === m ? 'selected' : ''}>${modeLabels[m]}</option>`).join('')}
      </select>
      <select class="form-control" aria-label="Filter by public or private institution" onchange="setDecideOwnershipFilter(this.value)">
        <option value="all" ${ownership === 'all' ? 'selected' : ''}>Public &amp; private</option>
        <option value="public" ${ownership === 'public' ? 'selected' : ''}>Public only</option>
        <option value="private" ${ownership === 'private' ? 'selected' : ''}>Private only</option>
      </select>
      <select class="form-control" aria-label="Filter by county" onchange="setDecideCountyFilter(this.value)">
        <option value="all" ${AppState.decideFilters.county === 'all' ? 'selected' : ''}>All Counties</option>
        ${COUNTIES.map((county) => `<option value="${county}" ${AppState.decideFilters.county === county ? 'selected' : ''}>${escapeHtml(county)}</option>`).join('')}
      </select>
    </div>

    <div class="filter-toolbar" aria-label="Sort courses">
      <label class="caption" style="margin:0;font-weight:500;flex:none" for="course-sort-select">Sort:</label>
      <select id="course-sort-select" class="form-control" onchange="setDecideSortBy(this.value)">
        ${Object.entries(sortOptions).map(([key, label]) => `<option value="${key}" ${sortBy === key ? 'selected' : ''}>${label}</option>`).join('')}
      </select>
      <span class="filter-spacer" data-compare-spacer ${AppState.savedCourses.length >= 2 ? '' : 'hidden'}></span>
      <button type="button" data-compare-btn class="btn btn-ghost btn-sm" style="width:auto" onclick="openCourseComparison()" ${AppState.savedCourses.length >= 2 ? '' : 'hidden'}>${icon('scale')} Compare Saved</button>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-1">
        <span class="caption">Max budget (2 yrs, Ksh)</span>
        <span class="text-sm num">${AppState.decideFilters.budgetMax != null ? formatKes(AppState.decideFilters.budgetMax) : 'No limit'}</span>
      </div>
      <input type="range" min="0" max="750000" step="10000" value="${AppState.decideFilters.budgetMax != null ? AppState.decideFilters.budgetMax : 750000}"
        oninput="setDecideBudgetFilter(this.value)" aria-label="Maximum budget">
      <div class="flex justify-between items-center mb-1 mt-2">
        <span class="caption">Your grade (for eligibility)</span>
      </div>
      <select class="form-control" aria-label="Your grade (for eligibility)" onchange="setDecideGradeFilter(this.value)" style="width:100%">
        <option value="">Not set</option>
        ${GRADE_ORDER.slice().reverse().map((g) => `<option value="${g}" ${grade === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>

    </aside>

    <div class="decide-results">
      <p class="decide-count"><strong class="num">${filtered.length}</strong> of <span class="num">${COURSES.length}</span> places to apply match your filters${gradeOpenPct != null ? ` · your grade opens <strong class="num">${gradeOpenPct}%</strong> of them` : ''}</p>
      ${filtered.length === 0
        ? emptyState('search', 'No matching courses', emptyMessage, 'Clear Filters', 'clearDecideFilters()')
        : `<p class="decide-caveat text-muted text-sm">Cost-of-attendance totals below are illustrative and vary by town — plan against them, don't rely on them.</p>
           <div class="results-grid">${filtered.slice(0, AppState.decideFilters.visibleCount || DECIDE_PAGE_SIZE).map(({ course, match }) => renderCourseCard(course, match)).join('')}</div>
           ${filtered.length > (AppState.decideFilters.visibleCount || DECIDE_PAGE_SIZE)
             ? `<div class="results-more"><button type="button" class="btn btn-secondary" onclick="showMoreCourses()">Show ${Math.min(DECIDE_PAGE_SIZE, filtered.length - (AppState.decideFilters.visibleCount || DECIDE_PAGE_SIZE))} more · ${filtered.length - (AppState.decideFilters.visibleCount || DECIDE_PAGE_SIZE)} remaining</button></div>`
             : ''}`
      }
    </div>
    </div>
  `;
}

/* The filtered, scored, sorted result set. Extracted so that appending a page
 * in showMoreCourses() derives exactly the same list the renderer used — if
 * these two ever diverged, "Show more" would append cards from a different
 * ordering than the ones already on screen. */
function currentDecideResults() {
  const f = AppState.decideFilters;
  const ownership = f.ownership || 'all';
  const matchesCluster = (c) => f.cluster === 'all' || c.cluster === f.cluster;
  const matchesMode = (c) => f.mode === 'any' || c.mode === f.mode;
  const matchesLevel = (c) => f.level === 'all' || c.level === f.level;
  const matchesCounty = (c) => f.county === 'all' || institutionById(c.institution_id)?.county === f.county;
  const matchesSaved = (c) => !f.savedOnly || AppState.savedCourses.includes(c.id);
  const matchesOwnership = (c) => ownership === 'all' || institutionById(c.institution_id)?.ownership === ownership;

  // Mirrors renderDecideTabContent's sorters — no outcome-based ordering.
  // If these two ever drift, "Show more" appends from a different ordering
  // than the one on screen.
  const sorters = {
    match: (a, b) => b.match.score - a.match.score,
    fees_low: (a, b) => byFee(a.course, b.course, 'asc'),
    fees_high: (a, b) => byFee(a.course, b.course, 'desc'),
    duration: (a, b) => a.course.duration_months - b.course.duration_months
  };

  return COURSES
    .filter((c) => matchesCluster(c) && matchesMode(c) && matchesLevel(c) && matchesCounty(c) && matchesSaved(c) && matchesOwnership(c))
    .map((c) => ({ course: c, match: computeCourseMatch(c) }))
    .sort(sorters[f.sortBy] || sorters.match);
}

/* The catalogue reaches 45 counties, which means a filtered list can run to
 * well over a hundred cards. Rendering them all cost 450-530ms on a mid-range
 * Android at 4x CPU throttle — and that fires on every filter change, which is
 * the core interaction of the core module. Rendering a page at a time keeps it
 * responsive; the count line above still reports the true total, so nothing is
 * hidden, only deferred.
 *
 * The counter lives in decideFilters so it resets naturally whenever a filter
 * changes (each setter clears it) rather than leaking a stale offset between
 * different result sets. */
const DECIDE_PAGE_SIZE = 24;

/* Appends the next page rather than re-rendering the tab.
 *
 * Re-rendering cost 138ms at 4x CPU throttle and, worse, destroyed the button
 * the user had just activated — focus fell to <body>, so a keyboard user who
 * tabbed to "Show more" and pressed Enter was thrown back to the top of the
 * tab order with the list they had just expanded now unreachable without
 * re-tabbing the whole page. axe cannot detect that; only pressing the button
 * finds it.
 *
 * Appending keeps the button in the DOM, so focus stays where the user put it,
 * and only the new cards are built. */
function showMoreCourses() {
  const grid = document.querySelector('.results-grid');
  const moreWrap = document.querySelector('.results-more');
  const prev = AppState.decideFilters.visibleCount || DECIDE_PAGE_SIZE;
  const next = prev + DECIDE_PAGE_SIZE;
  AppState.decideFilters.visibleCount = next;
  saveState();

  // No grid to append to (shouldn't happen) — fall back to a full render.
  if (!grid || !moreWrap) { renderDecideTabContent(); return; }

  const filtered = currentDecideResults();
  grid.insertAdjacentHTML('beforeend',
    filtered.slice(prev, next).map(({ course, match }) => renderCourseCard(course, match)).join(''));

  const remaining = filtered.length - next;
  if (remaining <= 0) {
    // Nothing left: remove the control, but move focus somewhere sensible first
    // so it does not fall to <body> when the button disappears.
    const lastCard = grid.querySelector('.course-card:last-of-type');
    moreWrap.remove();
    if (lastCard) { lastCard.setAttribute('tabindex', '-1'); lastCard.focus({ preventScroll: true }); }
  } else {
    moreWrap.querySelector('button').textContent =
      `Show ${Math.min(DECIDE_PAGE_SIZE, remaining)} more · ${remaining} remaining`;
  }
}

function renderCourseCard(course, match) {
  const inst = institutionById(course.institution_id);
  const saved = AppState.savedCourses.includes(course.id);
  // Null when the institution publishes no fee — every derived cost line
  // below is suppressed rather than rendered as "Ksh 0/month".
  const feePublished = course.total_fees_kes != null;
  const monthlyEstimate = feePublished ? Math.round(course.total_fees_kes / course.duration_months) : null;

  const isVerified = course.fees_confidence === 'verified';

  // Online courses don't require relocating or renting near an institution,
  // so an accommodation estimate would overstate the real cost for them.
  const requiresRelocation = course.mode !== 'online';
  const accomRate = inst?.has_hostel ? ACCOMMODATION_ESTIMATE_KES_PER_MONTH.onCampus : ACCOMMODATION_ESTIMATE_KES_PER_MONTH.offCampus;
  const totalCostOfAttendance = !feePublished ? null
    : requiresRelocation ? course.total_fees_kes + accomRate * course.duration_months
    : course.total_fees_kes;

  return `
    <div class="card course-card">
      <div class="flex items-center gap-1" style="flex-wrap:wrap">
        <span class="match-badge"><span class="num">${match.score}%</span> Match${!match.eligible ? ' · Grade below requirement' : match.gradeUnconfirmed ? ' · Set your grade to confirm' : ''}</span>
        ${(() => {
          const feas = feasibilitySignal(course, AppState.decideFilters.budgetMax);
          if (!feas) return '';
          const copy = {
            unknown: 'Fee not published',
            within: 'Within budget',
            stretch: `Stretch · <span class="num">+${formatKes(feas.overBy)}</span>`,
            over: `Over budget · <span class="num">+${formatKes(feas.overBy)}</span>`
          }[feas.level];
          return `<span class="feas-chip feas-${feas.level}" title="Tuition compared with your maximum budget filter">${copy}</span>`;
        })()}
        ${isVerified ? '<span class="verified-badge" title="Fee figures cross-checked against a public source">✓ Verified estimate</span>' : ''}
      </div>
      <h2>${escapeHtml(course.name)}</h2>
      <div class="institution-name">${escapeHtml(inst ? inst.name : 'Unknown institution')} · ${escapeHtml(inst ? inst.location : '')}</div>
      <div class="course-tagline">
        ${inst ? `<span class="mini-tag mini-${inst.ownership}">${inst.ownership === 'public' ? 'Public' : 'Private'}</span>` : ''}
        ${course.mode === 'online' ? '<span class="mini-tag mini-online">Online</span>' : ''}
        ${inst?.has_hostel ? '<span class="mini-tag">Hostel</span>' : ''}
      </div>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Level</div><div class="meta-value">${escapeHtml(LEVEL_LABELS[course.level] || course.level)}</div></div>
        <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value num">${course.duration_months} mo</div></div>
        <div class="meta-item"><div class="meta-label">Tuition</div><div class="meta-value${feePublished ? ' num' : ''}">${feePublished ? formatKes(course.total_fees_kes) : 'Not published'}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value num">${escapeHtml(course.min_grade || 'None')}</div></div>
      </div>
      <p class="text-secondary text-sm mb-1">${escapeHtml(course.description)}</p>
      <div class="career-tags">${course.career_paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
      <p class="text-muted text-sm mb-1">Intakes: ${course.intake_months.map(escapeHtml).join(', ')}</p>
      ${feePublished ? `
      <p class="text-muted text-sm mb-2">Feasibility: roughly <strong class="num">${formatKes(monthlyEstimate)}/month</strong> over ${course.duration_months} months${inst?.has_workstudy ? ' · work-study available at this institution' : ''}.</p>
      <p class="text-muted text-sm mb-2">Full cost of attendance (illustrative): ${requiresRelocation
        ? `tuition + ~${formatKes(accomRate)}/month ${inst?.has_hostel ? 'on-campus hostel' : 'off-campus rent'} & upkeep ≈ <strong class="num">${formatKes(totalCostOfAttendance)}</strong> total.`
        : `<strong class="num">${formatKes(totalCostOfAttendance)}</strong> tuition only — this course is online, so no relocation or accommodation cost is assumed.`
      }</p>` : `
      <p class="text-muted text-sm mb-2"><strong>This centre does not publish its fees.</strong> County vocational training centres are usually the cheapest formal training available and often the only option without relocating — but you have to ring them to find out what it costs. Ask for the fee per term, what the county capitation covers, and whether tools or exam fees are separate. The Grade III trade test is charged by NITA on top of tuition.</p>`}
      ${/* For the 29 courses priced off the government's consolidated public-TVET
            fee, the tuition figure above is the PUBLISHED fee, not the invoice.
            Capitation covers Ksh 30,000 a year and the published student balance
            is Ksh 26,420 — so the number a family is actually asked for is a
            fraction of what the card otherwise shows. Left unsaid, it makes
            public TVET look further out of reach than it is, to precisely the
            readers with the least room. Matched on the verification note rather
            than on ownership, because KMTC is also a public TVET and prices off
            its own national structure, not this one. */''}
      ${typeof PUBLIC_TVET_CAPITATION !== 'undefined' && /consolidated annual public-TVET fee/.test(course.verification_note || '') ? `
        <p class="text-sm mb-2"><strong>You are not asked for all of that.</strong> ${escapeHtml(PUBLIC_TVET_CAPITATION.reading)}</p>
      ` : ''}
      ${isVerified ? `<details class="fee-provenance"><summary>How this fee was verified</summary><p class="text-muted text-sm">${escapeHtml(course.verification_note)}${typeof PUBLIC_TVET_CAPITATION !== 'undefined' && /consolidated annual public-TVET fee/.test(course.verification_note || '') ? ` ${escapeHtml(PUBLIC_TVET_CAPITATION.residual)}` : ''}</p></details>` : ''}
      <details class="match-why">
        <summary>Why ${match.score}% match?</summary>
        <ul>
          ${match.breakdown.map((b) => `<li class="match-why-${b.effect}"><strong>${escapeHtml(b.factor)}:</strong> ${escapeHtml(b.detail)}</li>`).join('')}
        </ul>
      </details>
      <div class="btn-row">
        <button type="button" data-save-btn="${course.id}" aria-pressed="${saved}" class="btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleSavedCourse('${course.id}')">${saved ? '★ Saved' : '☆ Save'}</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="startApplicationForCourse('${course.id}')">Start Application</button>
      </div>
    </div>
  `;
}

function setDecideClusterFilter(cluster) {
  AppState.decideFilters.cluster = cluster;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideBudgetFilter(value) {
  AppState.decideFilters.budgetMax = Number(value) >= 750000 ? null : Number(value);
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideOwnershipFilter(value) {
  AppState.decideFilters.ownership = value;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}

function setDecideGradeFilter(value) {
  AppState.decideFilters.grade = value || null;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideCountyFilter(county) {
  AppState.decideFilters.county = county;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideLevelFilter(level) {
  AppState.decideFilters.level = level;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideModeFilter(mode) {
  AppState.decideFilters.mode = mode;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function toggleDecideSavedOnly() {
  AppState.decideFilters.savedOnly = !AppState.decideFilters.savedOnly;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function setDecideSortBy(sortBy) {
  AppState.decideFilters.sortBy = sortBy;
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}
function clearDecideFilters() {
  AppState.decideFilters = { ...AppState.decideFilters, cluster: 'all', budgetMax: null, mode: 'any', county: 'all', level: 'all', ownership: 'all', savedOnly: false };
  AppState.decideFilters.visibleCount = DECIDE_PAGE_SIZE;
  saveState();
  renderDecideTabContent();
}

/* Saving used to re-render the whole tab, which on a 73-course catalogue
 * threw the user thousands of pixels away from the card they had just
 * scrolled to find — losing your place on the app's core action, on the
 * phones this app is built for. Now only the things that actually changed
 * are touched: the card's own button, the saved-only chip, and the
 * compare affordance. Scroll position survives, and so does the rest of
 * the DOM. */
function toggleSavedCourse(courseId) {
  const idx = AppState.savedCourses.indexOf(courseId);
  const nowSaved = idx === -1;
  if (nowSaved) {
    AppState.savedCourses.push(courseId);
    showToast('Saved. We\'ll remind you to apply.', 'success');
  } else {
    AppState.savedCourses.splice(idx, 1);
    showToast('Course removed from saved list.', 'info');
  }
  saveState();

  // If the saved-only filter is on, removing a course must actually drop
  // it from the list — that is a genuine change of contents, so re-render.
  if (AppState.decideFilters.savedOnly && !nowSaved) {
    renderDecideTabContent();
    return;
  }
  updateSavedAffordances(courseId, nowSaved);
}

function updateSavedAffordances(courseId, nowSaved) {
  const btn = document.querySelector(`[data-save-btn="${courseId}"]`);
  if (btn) {
    btn.textContent = nowSaved ? '★ Saved' : '☆ Save';
    btn.classList.toggle('btn-secondary', nowSaved);
    btn.classList.toggle('btn-primary', !nowSaved);
    btn.setAttribute('aria-pressed', String(nowSaved));
  }
  const count = AppState.savedCourses.length;
  const chip = document.querySelector('[data-saved-chip]');
  if (chip) chip.textContent = `★ Saved Only (${count})`;
  // The chip and compare button are always in the DOM, so crossing their
  // count thresholds is an attribute flip rather than a re-render.
  setHidden('[data-saved-row]', count === 0);
  setHidden('[data-compare-spacer]', count < 2);
  setHidden('[data-compare-btn]', count < 2);
}

function setHidden(selector, hidden) {
  const el = document.querySelector(selector);
  if (el) el.hidden = hidden;
}

function startApplicationForCourse(courseId) {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return;
  const exists = AppState.applications.find((a) => a.courseId === courseId);
  if (exists) {
    showToast('You already have an application tracked for this course.', 'info');
    navigateTo('track');
    return;
  }
  AppState.applications.push({
    id: uid('app'),
    courseId,
    courseName: course.name,
    createdAt: new Date().toISOString(),
    steps: [
      { id: uid('step'), title: 'Research admission requirements', done: false },
      { id: uid('step'), title: 'Submit application', done: false },
      { id: uid('step'), title: 'Secure funding / HELB', done: false },
      { id: uid('step'), title: 'Confirm enrolment', done: false },
      { id: uid('step'), title: 'Complete first semester', done: false }
    ]
  });
  saveState();
  showToast('Application tracker created — see it in Track.', 'success');
  navigateTo('track');
}

/* ---------- Course Comparison ---------- */
function openCourseComparison() {
  const courses = AppState.savedCourses.map((id) => COURSES.find((c) => c.id === id)).filter(Boolean).slice(0, 4);
  if (courses.length < 2) {
    showToast('Save at least 2 courses to compare them.', 'info');
    return;
  }
  // Rows with a `raw` getter + `better` direction get best-value shading —
  // audit-table style: mark the winner in each measurable dimension rather
  // than making the reader scan and compare digits themselves.
  const rows = [
    { label: 'Institution', get: (c) => institutionById(c.institution_id)?.name || 'Unknown institution', wrap: true },
    { label: 'Level', get: (c) => LEVEL_LABELS[c.level] || c.level },
    { label: 'Duration', get: (c) => `${c.duration_months} mo`, num: true, raw: (c) => c.duration_months, better: 'min' },
    { label: 'Tuition', get: (c) => (c.total_fees_kes == null ? 'Not published' : formatKes(c.total_fees_kes)), num: true, raw: (c) => c.total_fees_kes, better: 'min' },
    { label: 'Min Grade', get: (c) => c.min_grade || 'None', num: true },
    /* There were two more rows here: "Employment Rate (est.)" and "Median
     * Salary (est.)". They were shown without best-value shading, on the
     * reasoning that displaying an estimate is honest while crowning one is
     * not. That reasoning was sound and still did not go far enough — side by
     * side in a comparison table is precisely where a fabricated difference
     * gets read as a finding. Not one of those figures had been measured, so
     * the rows are gone rather than qualified.
     *
     * Nothing replaces them here. A sourced cluster pay band was tried and
     * removed — see entryPayBand's epitaph above — because collapsing bands
     * that range from entry level to five years in produces a range that is
     * false in a new way. The pay evidence is on the results screen, one band
     * at a time with its note. This table compares what is actually
     * comparable: cost, length, entry bar, and fit. */
    { label: 'Match Score', get: (c) => `${computeCourseMatch(c).score}%`, num: true, raw: (c) => computeCourseMatch(c).score, better: 'max' }
  ];
  const bestValue = (row) => {
    if (!row.raw) return null;
    // Nulls dropped before comparing. Math.min(...[67189, null]) is 0, which
    // would have shaded an unpublished fee as the cheapest course on the
    // table — the app crowning a winner on a figure it does not have.
    const values = courses.map(row.raw).filter((v) => v != null);
    if (new Set(values).size < 2) return null; // all equal — nothing to mark
    return row.better === 'min' ? Math.min(...values) : Math.max(...values);
  };
  const truncated = AppState.savedCourses.length > courses.length;
  openModal(`
    <h2 class="mb-2">Compare Saved Courses</h2>
    <p class="text-secondary text-sm mb-2">${truncated ? `Showing your first ${courses.length} saved courses — comparisons cap at 4 to stay readable.` : 'Side-by-side comparison of your saved courses.'}</p>
    <p class="comparison-hint">↔ Swipe or scroll sideways to see every course · shaded cells mark the best value in each measurable row</p>
    <div class="comparison-scroll">
      <table class="comparison-table">
        <thead>
          <tr>
            <th scope="col"></th>
            ${courses.map((c) => `<th scope="col">${escapeHtml(c.name)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const best = bestValue(row);
            return `
            <tr>
              <th scope="row">${row.label}</th>
              ${courses.map((c) => {
                const isBest = best != null && row.raw(c) === best;
                return `<td class="${row.num ? 'num' : ''}${row.wrap ? ' wrap' : ''}${isBest ? ' best' : ''}">${escapeHtml(String(row.get(c)))}</td>`;
              }).join('')}
            </tr>
          `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `);
}

/* ---------- Funding Finder ---------- */
const FUNDING_TYPES = ['all', 'scholarship', 'loan', 'bursary', 'work_study', 'sponsorship'];

function renderFundingFinder(container) {
  const activeType = AppState.decideFilters.fundingType || 'all';
  const grade = getEffectiveGrade();

  let filtered = FUNDING_SOURCES;
  if (activeType !== 'all') filtered = filtered.filter((f) => f.type === activeType);

  container.innerHTML = `
    <div class="card">
      <h2 class="mb-1">${icon('calendar')} Key Application Windows</h2>
      <p class="text-muted text-sm mb-2">Deadlines vary by funder and change yearly — always confirm the current cycle directly before your window closes.</p>
      <div class="cluster-secondary-list">
        ${FUNDING_SOURCES.map((f) => `
          <div class="cluster-row">
            <span>${escapeHtml(f.name)}</span>
            <span class="text-muted text-sm">${escapeHtml(f.application_deadline || 'Rolling')}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="filter-row" aria-label="Filter by funding type">
      <select class="form-control" onchange="setFundingTypeFilter(this.value)" style="width:100%;max-width:220px">
        ${FUNDING_TYPES.map((t) => `<option value="${t}" ${activeType === t ? 'selected' : ''}>${t === 'all' ? 'All Funding Types' : t.replace('_', ' ')}</option>`).join('')}
      </select>
    </div>
    <div class="results-grid">${filtered.map((f) => renderFundingCard(f, grade)).join('')}</div>
  `;
}

function setFundingTypeFilter(type) {
  AppState.decideFilters.fundingType = type;
  saveState();
  renderDecideTabContent();
}

function renderFundingCard(f, userGrade) {
  const eligible = meetsGradeRequirement(userGrade, f.min_grade);
  const gradeUnconfirmed = userGrade == null && !!f.min_grade;
  const isVerified = f.data_confidence === 'verified';
  return `
    <div class="card">
      <div class="flex items-center gap-1" style="flex-wrap:wrap">
        <span class="type-badge">${escapeHtml(f.type.replace('_', ' '))}</span>
        ${isVerified ? '<span class="verified-badge" title="Cross-checked against a public source">✓ Verified</span>' : ''}
      </div>
      <h2>${escapeHtml(f.name)}</h2>
      <p class="text-secondary text-sm mb-2">${escapeHtml(f.description)}</p>
      ${isVerified ? `<p class="text-muted text-sm mb-2" style="font-style:italic">${escapeHtml(f.verification_note)}</p>` : ''}
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Coverage</div><div class="meta-value">${escapeHtml(f.coverage)}</div></div>
        <div class="meta-item"><div class="meta-label">Max Amount</div><div class="meta-value num">${formatKes(f.max_amount_kes)}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value num">${escapeHtml(f.min_grade || 'None')}${!eligible ? ' ⚠️' : gradeUnconfirmed ? ' (set your grade)' : ''}</div></div>
        <div class="meta-item"><div class="meta-label">Deadline</div><div class="meta-value">${escapeHtml(f.application_deadline || 'Rolling')}</div></div>
      </div>
      <p class="text-muted text-sm mb-1"><strong>Requirements:</strong> ${f.requirements.map(escapeHtml).join(', ')}</p>
      ${/* Two fields that only HELB/HEF carries today, both surfaced rather
            than left in the data. The appeal route is the single action
            available to someone the band has priced out, and the legal status
            is a disclosure the funder and the Court of Appeal both said to
            make — a caveat that lives only in a source file protects nobody. */''}
      ${f.bandAppeal ? `<p class="text-sm mb-1"><strong>Your band can be appealed.</strong> ${escapeHtml(f.bandAppeal)}</p>` : ''}
      ${f.legalStatus ? `<details class="inline-detail"><summary>The legal status of this model — read before planning around it</summary><p class="text-sm">${escapeHtml(f.legalStatus)}</p></details>` : ''}
      ${f.interest_rate ? `<p class="text-muted text-sm mb-1"><strong>Interest:</strong> ${escapeHtml(f.interest_rate)} · <strong>Repayment:</strong> ${escapeHtml(f.repayment_period || 'N/A')}</p>` : ''}
      ${f.website ? `<a href="${escapeHtml(f.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm mt-1" style="display:inline-flex">Visit Website ↗</a>` : ''}
    </div>
  `;
}
