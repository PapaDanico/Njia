/* Njia — decide.js — MODULE 3: The Evidence Engine
 * Course Matcher, Funding Finder, Feasibility Dashboard.
 * Depends on: data/institutions.js, data/courses.js, data/funding.js,
 * data/questions.js (CLUSTERS), js/app.js
 */

const GRADE_ORDER = ['E', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A'];
const GRADE_BUCKET_DEFAULT = { A: 'A-', B: 'B', C: 'C', D: 'D+' };

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

function getEffectiveGrade() {
  const f = AppState.decideFilters;
  if (f.grade) return f.grade;
  const bucket = AppState.questionnaire.results?.constraints?.grade;
  return bucket ? GRADE_BUCKET_DEFAULT[bucket] || null : null;
}

function renderDecidePage() {
  const el = document.getElementById('page-decide');
  if (!el) return;

  el.innerHTML = `
    <h1 class="mb-1">Decide</h1>
    <p class="text-secondary mb-2">Every recommendation answers three questions: Do I qualify? Can I afford it? Will it lead to work I care about?</p>
    <div class="data-disclaimer">
      <span aria-hidden="true">⚠️</span>
      <span>This MVP dataset (fees, employment rates, salaries, deadlines) is <strong>illustrative</strong> for demonstration — verify current figures directly with each institution or funder before deciding.</span>
    </div>
    <div class="odyssey-tabs">
      <button class="odyssey-tab ${AppState.decideFilters.activeTab === 'courses' ? 'active' : ''}" onclick="setDecideTab('courses')">🎓 Courses</button>
      <button class="odyssey-tab ${AppState.decideFilters.activeTab === 'funding' ? 'active' : ''}" onclick="setDecideTab('funding')">💰 Funding</button>
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
  if (budgetMax && course.total_fees_kes > budgetMax) score = Math.max(0, score - 25);

  return { score: Math.round(score), eligible };
}

function renderCourseMatcher(container) {
  const clusterOptions = ['all', ...Object.keys(CLUSTERS)];
  const grade = getEffectiveGrade();

  let filtered = COURSES.map((c) => ({ course: c, match: computeCourseMatch(c) }));
  if (AppState.decideFilters.cluster !== 'all') {
    filtered = filtered.filter((f) => f.course.cluster === AppState.decideFilters.cluster);
  }
  if (AppState.decideFilters.mode !== 'any') {
    filtered = filtered.filter((f) => f.course.mode === AppState.decideFilters.mode);
  }
  filtered.sort((a, b) => b.match.score - a.match.score);

  container.innerHTML = `
    <div class="filter-row" role="tablist" aria-label="Filter by career cluster">
      ${clusterOptions.map((c) => `
        <button class="filter-chip ${AppState.decideFilters.cluster === c ? 'active' : ''}" onclick="setDecideClusterFilter('${c}')">
          ${c === 'all' ? 'All Clusters' : CLUSTERS[c].short}
        </button>
      `).join('')}
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-1">
        <span class="caption">Max budget (2 yrs, Ksh)</span>
        <span class="text-sm">${AppState.decideFilters.budgetMax ? formatKes(AppState.decideFilters.budgetMax) : 'No limit'}</span>
      </div>
      <input type="range" min="0" max="750000" step="10000" value="${AppState.decideFilters.budgetMax || 750000}"
        oninput="setDecideBudgetFilter(this.value)" aria-label="Maximum budget">
      <div class="flex justify-between items-center mb-1 mt-2">
        <span class="caption">Your grade (for eligibility)</span>
      </div>
      <select onchange="setDecideGradeFilter(this.value)" style="width:100%;min-height:44px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem">
        <option value="">Not set</option>
        ${GRADE_ORDER.slice().reverse().map((g) => `<option value="${g}" ${grade === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>

    ${filtered.length === 0
      ? emptyState('🔍', 'No matching courses', 'Try widening your budget or clearing the cluster filter.', 'Clear Filters', 'clearDecideFilters()')
      : filtered.map(({ course, match }) => renderCourseCard(course, match)).join('')
    }
  `;
}

function renderCourseCard(course, match) {
  const inst = institutionById(course.institution_id);
  const saved = AppState.savedCourses.includes(course.id);
  const monthlyEstimate = Math.round(course.total_fees_kes / course.duration_months);

  return `
    <div class="card course-card">
      <span class="match-badge">${match.score}% Match${!match.eligible ? ' · Grade below requirement' : ''}</span>
      <h3>${escapeHtml(course.name)}</h3>
      <div class="institution-name">${escapeHtml(inst ? inst.name : 'Unknown institution')} · ${escapeHtml(inst ? inst.location : '')}</div>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Level</div><div class="meta-value">${escapeHtml(course.level)}</div></div>
        <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${course.duration_months} mo</div></div>
        <div class="meta-item"><div class="meta-label">Total Fees</div><div class="meta-value">${formatKes(course.total_fees_kes)}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value">${escapeHtml(course.min_grade || 'None')}</div></div>
        <div class="meta-item"><div class="meta-label">Employment Rate</div><div class="meta-value">${formatPercent(course.employment_rate)}</div></div>
        <div class="meta-item"><div class="meta-label">Median Salary</div><div class="meta-value">${formatKes(course.median_salary_kes)}/mo</div></div>
      </div>
      <p class="text-secondary text-sm mb-1">${escapeHtml(course.description)}</p>
      <div class="career-tags">${course.career_paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
      <p class="text-muted text-sm mb-2">📊 Feasibility: roughly <strong>${formatKes(monthlyEstimate)}/month</strong> over ${course.duration_months} months${inst?.has_workstudy ? ' · work-study available at this institution' : ''}.</p>
      <div class="btn-row">
        <button class="btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleSavedCourse('${course.id}')">${saved ? '★ Saved' : '☆ Save'}</button>
        <button class="btn btn-ghost btn-sm" onclick="startApplicationForCourse('${course.id}')">Start Application</button>
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
function clearDecideFilters() {
  AppState.decideFilters = { ...AppState.decideFilters, cluster: 'all', budgetMax: null, mode: 'any' };
  saveState();
  renderDecideTabContent();
}

function toggleSavedCourse(courseId) {
  const idx = AppState.savedCourses.indexOf(courseId);
  if (idx === -1) {
    AppState.savedCourses.push(courseId);
    showToast('Course saved.', 'success');
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

/* ---------- Funding Finder ---------- */
const FUNDING_TYPES = ['all', 'scholarship', 'loan', 'bursary', 'work_study', 'sponsorship'];

function renderFundingFinder(container) {
  const activeType = AppState.decideFilters.fundingType || 'all';
  const grade = getEffectiveGrade();

  let filtered = FUNDING_SOURCES;
  if (activeType !== 'all') filtered = filtered.filter((f) => f.type === activeType);

  container.innerHTML = `
    <div class="filter-row">
      ${FUNDING_TYPES.map((t) => `
        <button class="filter-chip ${activeType === t ? 'active' : ''}" onclick="setFundingTypeFilter('${t}')">
          ${t === 'all' ? 'All' : t.replace('_', ' ')}
        </button>
      `).join('')}
    </div>
    ${filtered.map((f) => renderFundingCard(f, grade)).join('')}
  `;
}

function setFundingTypeFilter(type) {
  AppState.decideFilters.fundingType = type;
  saveState();
  renderDecideTabContent();
}

function renderFundingCard(f, userGrade) {
  const eligible = meetsGradeRequirement(userGrade, f.min_grade);
  return `
    <div class="card">
      <span class="type-badge">${escapeHtml(f.type.replace('_', ' '))}</span>
      <h3>${escapeHtml(f.name)}</h3>
      <p class="text-secondary text-sm mb-2">${escapeHtml(f.description)}</p>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Coverage</div><div class="meta-value">${escapeHtml(f.coverage)}</div></div>
        <div class="meta-item"><div class="meta-label">Max Amount</div><div class="meta-value">${formatKes(f.max_amount_kes)}</div></div>
        <div class="meta-item"><div class="meta-label">Min Grade</div><div class="meta-value">${escapeHtml(f.min_grade || 'None')}${!eligible ? ' ⚠️' : ''}</div></div>
        <div class="meta-item"><div class="meta-label">Deadline</div><div class="meta-value">${escapeHtml(f.application_deadline || 'Rolling')}</div></div>
      </div>
      <p class="text-muted text-sm mb-1"><strong>Requirements:</strong> ${f.requirements.map(escapeHtml).join(', ')}</p>
      ${f.interest_rate ? `<p class="text-muted text-sm mb-1"><strong>Interest:</strong> ${escapeHtml(f.interest_rate)} · <strong>Repayment:</strong> ${escapeHtml(f.repayment_period || 'N/A')}</p>` : ''}
      ${f.website ? `<a href="${escapeHtml(f.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm mt-1" style="display:inline-flex">Visit Website ↗</a>` : ''}
    </div>
  `;
}
