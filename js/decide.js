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

function gradeRank(grade) {
  const idx = GRADE_ORDER.indexOf(grade);
  return idx === -1 ? 0 : idx;
}

function meetsGradeRequirement(userGrade, minGrade) {
  if (!minGrade) return true;
  if (!userGrade) return true; // unknown grade — don't filter out, just don't claim eligibility
  return gradeRank(userGrade) >= gradeRank(minGrade);
}

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

  const verifiedCount = COURSES.filter((c) => c.data_confidence === 'verified').length
    + FUNDING_SOURCES.filter((f) => f.data_confidence === 'verified').length;
  const totalCount = COURSES.length + FUNDING_SOURCES.length;

  el.innerHTML = `
    <p class="page-eyebrow">Module 03 · Decide</p>
    <h1 class="mb-1">Decide</h1>
    <p class="text-secondary mb-2">Every recommendation answers three questions: Do I qualify? Can I afford it? Will it lead to work I care about?</p>
    <div class="data-disclaimer">
      ${icon('alert')}
      <span>This MVP dataset (fees, employment rates, salaries, deadlines) is <strong>illustrative</strong> for demonstration — verify current figures directly with each institution or funder before deciding. <strong>${verifiedCount} of ${totalCount} records</strong> have been independently cross-checked against a public source — look for the ✓ Verified badge.</span>
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

/* ---------- Course Matcher ---------- */
function computeCourseMatch(course) {
  const results = AppState.questionnaire.results;
  let score = 40;
  if (results) {
    if (course.cluster === results.primary) score = 95;
    else if (course.cluster === results.secondary) score = 72;
    else score = 35;
  }
  const grade = getEffectiveGrade();
  const eligible = meetsGradeRequirement(grade, course.min_grade);
  if (!eligible) score = Math.min(score, 20);

  const budgetMax = AppState.decideFilters.budgetMax;
  if (budgetMax != null && course.total_fees_kes > budgetMax) score = Math.max(0, score - 25);

  // gradeUnconfirmed: this course has a grade requirement, but we don't
  // actually know the user's grade — meetsGradeRequirement() treats that as
  // "don't claim ineligible", which is right, but the UI still needs to show
  // the difference between "confirmed eligible" and "eligibility unverified"
  // rather than rendering both identically.
  return { score: Math.round(score), eligible, gradeUnconfirmed: grade == null && !!course.min_grade };
}

function renderCourseMatcher(container) {
  const clusterOptions = ['all', ...Object.keys(CLUSTERS)];
  const grade = getEffectiveGrade();

  // Budget only penalises match score (below) rather than hiding a course —
  // a great over-budget course should still be visible as "a stretch", not
  // disappear. Only cluster/mode/county can actually zero out this list.
  const levelOptions = ['all', 'certificate', 'diploma', 'degree'];
  const levelLabels = { certificate: 'Certificate', diploma: 'Diploma', degree: 'Degree' };

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

  let filtered = COURSES
    .filter((c) => matchesCluster(c) && matchesMode(c) && matchesLevel(c) && matchesCounty(c) && matchesSaved(c))
    .map((c) => ({ course: c, match: computeCourseMatch(c) }));

  const sortBy = AppState.decideFilters.sortBy || 'match';
  const sortOptions = { match: 'Best Match', fees_low: 'Lowest Fees', fees_high: 'Highest Fees', employment: 'Highest Employment Rate', duration: 'Shortest Duration' };
  const sorters = {
    match: (a, b) => b.match.score - a.match.score,
    fees_low: (a, b) => a.course.total_fees_kes - b.course.total_fees_kes,
    fees_high: (a, b) => b.course.total_fees_kes - a.course.total_fees_kes,
    employment: (a, b) => (b.course.employment_rate ?? 0) - (a.course.employment_rate ?? 0),
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
    ${AppState.savedCourses.length > 0 ? `
      <div class="filter-row" aria-label="Show saved courses only">
        <button type="button" class="filter-chip ${AppState.decideFilters.savedOnly ? 'active' : ''}" onclick="toggleDecideSavedOnly()">
          ★ Saved Only (${AppState.savedCourses.length})
        </button>
      </div>
    ` : ''}

    <div class="filter-toolbar" aria-label="Course filters">
      <select class="form-control" aria-label="Filter by career cluster" onchange="setDecideClusterFilter(this.value)">
        ${clusterOptions.map((c) => `<option value="${c}" ${AppState.decideFilters.cluster === c ? 'selected' : ''}>${c === 'all' ? 'All Clusters' : CLUSTERS[c].short}</option>`).join('')}
      </select>
      <select class="form-control" aria-label="Filter by qualification level" onchange="setDecideLevelFilter(this.value)">
        ${levelOptions.map((l) => `<option value="${l}" ${AppState.decideFilters.level === l ? 'selected' : ''}>${l === 'all' ? 'All Levels' : levelLabels[l]}</option>`).join('')}
      </select>
      <select class="form-control" aria-label="Filter by learning mode" onchange="setDecideModeFilter(this.value)">
        ${modeOptions.map((m) => `<option value="${m}" ${AppState.decideFilters.mode === m ? 'selected' : ''}>${modeLabels[m]}</option>`).join('')}
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
      ${AppState.savedCourses.length >= 2 ? `<span class="filter-spacer"></span><button type="button" class="btn btn-ghost btn-sm" style="width:auto" onclick="openCourseComparison()">${icon('scale')} Compare Saved</button>` : ''}
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
      <select class="form-control" onchange="setDecideGradeFilter(this.value)" style="width:100%">
        <option value="">Not set</option>
        ${GRADE_ORDER.slice().reverse().map((g) => `<option value="${g}" ${grade === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>

    ${filtered.length === 0
      ? emptyState('search', 'No matching courses', emptyMessage, 'Clear Filters', 'clearDecideFilters()')
      : `<div class="results-grid">${filtered.map(({ course, match }) => renderCourseCard(course, match)).join('')}</div>`
    }
  `;
}

function renderCourseCard(course, match) {
  const inst = institutionById(course.institution_id);
  const saved = AppState.savedCourses.includes(course.id);
  const monthlyEstimate = Math.round(course.total_fees_kes / course.duration_months);

  const isVerified = course.data_confidence === 'verified';

  // Online courses don't require relocating or renting near an institution,
  // so an accommodation estimate would overstate the real cost for them.
  const requiresRelocation = course.mode !== 'online';
  const accomRate = inst?.has_hostel ? ACCOMMODATION_ESTIMATE_KES_PER_MONTH.onCampus : ACCOMMODATION_ESTIMATE_KES_PER_MONTH.offCampus;
  const totalCostOfAttendance = requiresRelocation ? course.total_fees_kes + accomRate * course.duration_months : course.total_fees_kes;

  return `
    <div class="card course-card">
      <div class="flex items-center gap-1" style="flex-wrap:wrap">
        <span class="match-badge"><span class="num">${match.score}%</span> Match${!match.eligible ? ' · Grade below requirement' : match.gradeUnconfirmed ? ' · Set your grade to confirm' : ''}</span>
        ${isVerified ? '<span class="verified-badge" title="Fee figures cross-checked against a public source">✓ Verified estimate</span>' : ''}
      </div>
      <h3>${escapeHtml(course.name)}</h3>
      <div class="institution-name">${escapeHtml(inst ? inst.name : 'Unknown institution')} · ${escapeHtml(inst ? inst.location : '')}</div>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Level</div><div class="meta-value">${escapeHtml(course.level)}</div></div>
        <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value num">${course.duration_months} mo</div></div>
        <div class="meta-item"><div class="meta-label">Tuition</div><div class="meta-value num">${formatKes(course.total_fees_kes)}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value num">${escapeHtml(course.min_grade || 'None')}</div></div>
        <div class="meta-item"><div class="meta-label">Employment Rate</div><div class="meta-value num">${formatPercent(course.employment_rate)}</div></div>
        <div class="meta-item"><div class="meta-label">Median Salary</div><div class="meta-value num">${formatKes(course.median_salary_kes)}/mo</div></div>
      </div>
      <p class="text-secondary text-sm mb-1">${escapeHtml(course.description)}</p>
      <div class="career-tags">${course.career_paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
      <p class="text-muted text-sm mb-1">Intakes: ${course.intake_months.map(escapeHtml).join(', ')}</p>
      <p class="text-muted text-sm mb-2">Feasibility: roughly <strong class="num">${formatKes(monthlyEstimate)}/month</strong> over ${course.duration_months} months${inst?.has_workstudy ? ' · work-study available at this institution' : ''}.</p>
      <p class="text-muted text-sm mb-2">Full cost of attendance (illustrative): ${requiresRelocation
        ? `tuition + ~${formatKes(accomRate)}/month ${inst?.has_hostel ? 'on-campus hostel' : 'off-campus rent'} & upkeep ≈ <strong class="num">${formatKes(totalCostOfAttendance)}</strong> total. Varies by town — plan, don't rely on this figure.`
        : `<strong class="num">${formatKes(totalCostOfAttendance)}</strong> tuition only — this course is online, so no relocation or accommodation cost is assumed.`
      }</p>
      ${isVerified ? `<p class="text-muted text-sm mb-2" style="font-style:italic">${escapeHtml(course.verification_note)}</p>` : ''}
      <div class="btn-row">
        <button type="button" class="btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleSavedCourse('${course.id}')">${saved ? '★ Saved' : '☆ Save'}</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="startApplicationForCourse('${course.id}')">Start Application</button>
      </div>
    </div>
  `;
}

function setDecideClusterFilter(cluster) {
  AppState.decideFilters.cluster = cluster;
  saveState();
  renderDecideTabContent();
}
function setDecideBudgetFilter(value) {
  AppState.decideFilters.budgetMax = Number(value) >= 750000 ? null : Number(value);
  saveState();
  renderDecideTabContent();
}
function setDecideGradeFilter(value) {
  AppState.decideFilters.grade = value || null;
  saveState();
  renderDecideTabContent();
}
function setDecideCountyFilter(county) {
  AppState.decideFilters.county = county;
  saveState();
  renderDecideTabContent();
}
function setDecideLevelFilter(level) {
  AppState.decideFilters.level = level;
  saveState();
  renderDecideTabContent();
}
function setDecideModeFilter(mode) {
  AppState.decideFilters.mode = mode;
  saveState();
  renderDecideTabContent();
}
function toggleDecideSavedOnly() {
  AppState.decideFilters.savedOnly = !AppState.decideFilters.savedOnly;
  saveState();
  renderDecideTabContent();
}
function setDecideSortBy(sortBy) {
  AppState.decideFilters.sortBy = sortBy;
  saveState();
  renderDecideTabContent();
}
function clearDecideFilters() {
  AppState.decideFilters = { ...AppState.decideFilters, cluster: 'all', budgetMax: null, mode: 'any', county: 'all', level: 'all', savedOnly: false };
  saveState();
  renderDecideTabContent();
}

function toggleSavedCourse(courseId) {
  const idx = AppState.savedCourses.indexOf(courseId);
  if (idx === -1) {
    AppState.savedCourses.push(courseId);
    showToast('Saved. We\'ll remind you to apply.', 'success');
  } else {
    AppState.savedCourses.splice(idx, 1);
    showToast('Course removed from saved list.', 'info');
  }
  saveState();
  renderDecideTabContent();
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
  const rows = [
    { label: 'Institution', get: (c) => institutionById(c.institution_id)?.name || 'Unknown institution', wrap: true },
    { label: 'Level', get: (c) => c.level },
    { label: 'Duration', get: (c) => `${c.duration_months} mo`, num: true },
    { label: 'Tuition', get: (c) => formatKes(c.total_fees_kes), num: true },
    { label: 'Min Grade', get: (c) => c.min_grade || 'None', num: true },
    { label: 'Employment Rate', get: (c) => formatPercent(c.employment_rate), num: true },
    { label: 'Median Salary', get: (c) => `${formatKes(c.median_salary_kes)}/mo`, num: true },
    { label: 'Match Score', get: (c) => `${computeCourseMatch(c).score}%`, num: true }
  ];
  const truncated = AppState.savedCourses.length > courses.length;
  openModal(`
    <h3 class="mb-2">Compare Saved Courses</h3>
    <p class="text-secondary text-sm mb-2">${truncated ? `Showing your first ${courses.length} saved courses — comparisons cap at 4 to stay readable.` : 'Side-by-side comparison of your saved courses.'}</p>
    <p class="comparison-hint">↔ Swipe or scroll sideways to see every course</p>
    <div class="comparison-scroll">
      <table class="comparison-table">
        <thead>
          <tr>
            <th scope="col"></th>
            ${courses.map((c) => `<th scope="col">${escapeHtml(c.name)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <th scope="row">${row.label}</th>
              ${courses.map((c) => `<td class="${row.num ? 'num' : ''}${row.wrap ? ' wrap' : ''}">${escapeHtml(String(row.get(c)))}</td>`).join('')}
            </tr>
          `).join('')}
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
      <h3 class="mb-1">${icon('calendar')} Key Application Windows</h3>
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
      <h3>${escapeHtml(f.name)}</h3>
      <p class="text-secondary text-sm mb-2">${escapeHtml(f.description)}</p>
      ${isVerified ? `<p class="text-muted text-sm mb-2" style="font-style:italic">${escapeHtml(f.verification_note)}</p>` : ''}
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Coverage</div><div class="meta-value">${escapeHtml(f.coverage)}</div></div>
        <div class="meta-item"><div class="meta-label">Max Amount</div><div class="meta-value num">${formatKes(f.max_amount_kes)}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value num">${escapeHtml(f.min_grade || 'None')}${!eligible ? ' ⚠️' : gradeUnconfirmed ? ' (set your grade)' : ''}</div></div>
        <div class="meta-item"><div class="meta-label">Deadline</div><div class="meta-value">${escapeHtml(f.application_deadline || 'Rolling')}</div></div>
      </div>
      <p class="text-muted text-sm mb-1"><strong>Requirements:</strong> ${f.requirements.map(escapeHtml).join(', ')}</p>
      ${f.interest_rate ? `<p class="text-muted text-sm mb-1"><strong>Interest:</strong> ${escapeHtml(f.interest_rate)} · <strong>Repayment:</strong> ${escapeHtml(f.repayment_period || 'N/A')}</p>` : ''}
      ${f.website ? `<a href="${escapeHtml(f.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm mt-1" style="display:inline-flex">Visit Website ↗</a>` : ''}
    </div>
  `;
}
