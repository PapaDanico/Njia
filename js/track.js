/* Njia — track.js — MODULE 5: The Accountability System
 * Personal OKRs, Application Tracker, Progress Analytics.
 * Alumni Network outcomes require a shared backend — deferred (see README).
 */

/* Objective templates — the same fill-then-edit pattern as Odyssey.
 * Each carries its own key results, because "write two or three
 * measurable key results" is the step people actually stall on. */
const OKR_TEMPLATES = [
  { objective: 'Get accepted into a course I have chosen',
    krs: 'Shortlist 5 institutions\nConfirm fees and intake dates with each\nSubmit 3 applications' },
  { objective: 'Secure funding for my first year',
    krs: 'Submit the HEF application\nApply to my constituency NG-CDF bursary\nApply to one private scholarship' },
  { objective: 'Test whether this field is really for me',
    krs: 'Speak to 3 people doing the work\nSpend a day shadowing one of them\nWrite down what surprised me' },
  { objective: 'Improve the grade that is blocking my first choice',
    krs: 'Register for the retake\nStudy 5 hours a week\nSit the exam' },
  { objective: 'Save toward fees while I wait for the next intake',
    krs: 'Open a separate savings account\nSave a fixed amount monthly\nReach my target before the intake' }
];

function applyOkrTemplate(value, selectEl) {
  if (!value) return;
  const t = OKR_TEMPLATES.find((x) => x.objective === value);
  const obj = document.getElementById('okr-title');
  const krs = document.getElementById('okr-key-results');
  if (obj) { obj.value = value; obj.focus(); }
  if (krs && t && !krs.value.trim()) krs.value = t.krs;
  if (selectEl) selectEl.selectedIndex = 0;
}

function renderTrackPage() {
  const el = document.getElementById('page-track');
  if (!el) return;

  const doneApplications = AppState.applications.filter((a) => applicationStatus(a) === 'complete').length;
  const doneOkrs = AppState.okrs.filter((o) => okrStatus(o) === 'done').length;

  el.innerHTML = `
    <p class="page-eyebrow">Module 05 · Track</p>
    <h1 class="mb-1">Track</h1>
    <p class="text-secondary mb-2">Plans mean nothing without follow-through.</p>

    <div class="stats-row">
      <div class="stat"><div class="value">${AppState.okrs.length}</div><div class="label">OKRs</div></div>
      <div class="stat"><div class="value">${doneOkrs}</div><div class="label">OKRs Done</div></div>
      <div class="stat"><div class="value">${doneApplications}/${AppState.applications.length}</div><div class="label">Apps Done</div></div>
    </div>

    <div class="odyssey-tabs">
      <button type="button" class="odyssey-tab ${AppState.viewFilters.trackActiveTab === 'okrs' ? 'active' : ''}" onclick="setTrackTab('okrs')">${icon('target')}OKRs</button>
      <button type="button" class="odyssey-tab ${AppState.viewFilters.trackActiveTab === 'applications' ? 'active' : ''}" onclick="setTrackTab('applications')">${icon('clipboard')}Applications</button>
    </div>
    <div id="track-tab-content"></div>
  `;

  renderTrackTabContent();
}

function setTrackTab(tab) {
  AppState.viewFilters.trackActiveTab = tab;
  saveState();
  renderTrackPage();
}

function renderTrackTabContent() {
  const container = document.getElementById('track-tab-content');
  if (!container) return;
  if (AppState.viewFilters.trackActiveTab === 'okrs') renderOkrsTab(container);
  else renderApplicationsTab(container);
  replayFadeIn(container);
}

/* ---------- OKRs ---------- */
/* An OKR with no key results is not on track — there is nothing to track.
 *
 * The creation form requires at least one key result, so this only arises from
 * state saved before `keyResults` existed, which normalizeState() repairs to an
 * empty array. Without this guard such an OKR reports "on-track", can never
 * reach "done" because there is nothing to complete, and silently flips to
 * "at-risk" after 30 days with nothing the user can do to move it. Same shape
 * as the empty-steps application bug, on its sibling. */
function okrStatus(okr) {
  const keyResults = Array.isArray(okr.keyResults) ? okr.keyResults : [];
  if (keyResults.length === 0) return 'needs-key-results';
  const done = keyResults.filter((k) => k.done).length;
  if (done === keyResults.length) return 'done';
  if (done / keyResults.length < 0.34 && daysSince(okr.createdAt) > 30) return 'at-risk';
  return 'on-track';
}

function daysSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function renderOkrsTab(container) {
  const statusFilter = AppState.viewFilters.okrStatus;
  const sortBy = AppState.viewFilters.okrSort;

  let filtered = AppState.okrs.slice();
  if (statusFilter !== 'all') {
    filtered = filtered.filter((okr) => okrStatus(okr) === statusFilter);
  }

  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'progress') {
    filtered.sort((a, b) => {
      const aProgress = a.keyResults.filter((k) => k.done).length / (a.keyResults.length || 1);
      const bProgress = b.keyResults.filter((k) => k.done).length / (b.keyResults.length || 1);
      return bProgress - aProgress;
    });
  }

  container.innerHTML = `
    <div class="filter-row" style="margin-bottom:1rem;display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center">
      <label class="caption" style="margin:0;font-weight:500" for="okr-status-filter">Filter:</label>
      <select id="okr-status-filter" class="form-control" onchange="setOkrStatusFilter(this.value)">
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All OKRs</option>
        <option value="on-track" ${statusFilter === 'on-track' ? 'selected' : ''}>On Track</option>
        <option value="at-risk" ${statusFilter === 'at-risk' ? 'selected' : ''}>At Risk</option>
        <option value="done" ${statusFilter === 'done' ? 'selected' : ''}>Done</option>
        <option value="needs-key-results" ${statusFilter === 'needs-key-results' ? 'selected' : ''}>Needs key results</option>
      </select>
      <label class="caption" style="margin:0;font-weight:500" for="okr-sort-filter">Sort:</label>
      <select id="okr-sort-filter" class="form-control" onchange="setOkrSortBy(this.value)">
        <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Most Recent</option>
        <option value="progress" ${sortBy === 'progress' ? 'selected' : ''}>Progress (High to Low)</option>
      </select>
    </div>
    <button type="button" class="btn btn-primary mb-2" onclick="openOkrModal()">+ New OKR</button>
    ${filtered.length === 0
      ? emptyState('target', 'No OKRs yet', 'Turn your Odyssey Plan into a quarterly objective with 2–3 measurable key results.', '+ New OKR', 'openOkrModal()')
      : filtered.map((okr) => renderOkrItem(okr)).join('')
    }
  `;
}

function renderOkrItem(okr) {
  const status = okrStatus(okr);
  const done = okr.keyResults.filter((k) => k.done).length;
  const pct = Math.round((done / (okr.keyResults.length || 1)) * 100);
  const statusLabels = { 'on-track': 'On Track', 'at-risk': 'At Risk', done: 'Done', 'needs-key-results': 'Add key results' };

  return `
    <div class="card okr-item">
      <div class="okr-header">
        <h2>${escapeHtml(okr.title)}</h2>
        <span class="status-badge ${status}">${statusLabels[status]}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${okr.keyResults.map((kr, i) => `
        <div class="check-item ${kr.done ? 'done' : ''}">
          <input type="checkbox" id="kr-${okr.id}-${i}" ${kr.done ? 'checked' : ''} onchange="toggleKeyResult('${okr.id}', ${i})">
          <label for="kr-${okr.id}-${i}">${escapeHtml(kr.text)}</label>
        </div>
      `).join('')}
      <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="deleteOkr('${okr.id}')">Delete OKR</button>
    </div>
  `;
}

function openOkrModal() {
  openModal(`
    <h2 class="mb-2">New Quarterly OKR</h2>
    <label class="caption" for="okr-title">Objective</label>
    <input type="text" id="okr-title" maxlength="150" class="form-control" placeholder="e.g. Get accepted into a Counselling Diploma programme" style="width:100%;margin:0.4rem 0 0.8rem">
      <select class="odyssey-suggest form-control mt-1" aria-label="Insert an objective template"
        onchange="applyOkrTemplate(this.value, this)">
        <option value="">Stuck? Insert an objective…</option>
        ${OKR_TEMPLATES.map((t) => `<option value="${escapeHtml(t.objective)}">${escapeHtml(t.objective)}</option>`).join('')}
      </select>
    <label class="caption">Key Results (one per line, 2–3 recommended)</label>
    <textarea class="q-input mt-1" id="okr-key-results" maxlength="800" placeholder="Shortlist 5 institutions&#10;Sit and pass entrance requirements&#10;Submit HELB application"></textarea>
    <button type="button" class="btn btn-primary mt-2" onclick="createOkr()">Create OKR</button>
  `);
}

function createOkr() {
  const title = document.getElementById('okr-title')?.value.trim();
  const krText = document.getElementById('okr-key-results')?.value.trim();
  if (!title || !krText) {
    showToast('Add an objective and at least one key result.', 'error');
    return;
  }
  const keyResults = krText.split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ text, done: false }));
  AppState.okrs.push({ id: uid('okr'), title, keyResults, createdAt: new Date().toISOString() });
  saveState();
  closeModal();
  showToast('OKR created.', 'success');
  renderTrackPage();
}

function toggleKeyResult(okrId, index) {
  const okr = AppState.okrs.find((o) => o.id === okrId);
  if (!okr) return;
  okr.keyResults[index].done = !okr.keyResults[index].done;
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}

function deleteOkr(okrId) {
  AppState.okrs = AppState.okrs.filter((o) => o.id !== okrId);
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}

/* ---------- Applications ---------- */
/* [].every() is true, so an application carrying no steps would report
 * "complete" — a tracker congratulating someone for work they have not
 * started. This is reachable in practice, not just in theory:
 * normalizeState() gives an application saved before `steps` existed an
 * empty steps array, which is the right repair but lands straight here. */
function applicationStatus(app) {
  const steps = Array.isArray(app.steps) ? app.steps : [];
  if (steps.length === 0) return 'in-progress';
  return steps.every((s) => s.done) ? 'complete' : 'in-progress';
}

function renderApplicationsTab(container) {
  const statusFilter = AppState.viewFilters.appStatus;
  const sortBy = AppState.viewFilters.appSort || 'recent';
  let filtered = AppState.applications.slice();
  if (statusFilter !== 'all') {
    filtered = filtered.filter((app) => applicationStatus(app) === statusFilter);
  }
  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.courseName.localeCompare(b.courseName));
  } else if (sortBy === 'progress') {
    filtered.sort((a, b) => {
      const pctOf = (app) => app.steps.filter((s) => s.done).length / (app.steps.length || 1);
      return pctOf(b) - pctOf(a);
    });
  }

  const filterControls = AppState.applications.length > 0 ? `
    <div class="filter-row" style="margin-bottom:1rem;display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center">
      <label class="caption" style="margin:0;font-weight:500" for="app-status-filter">Filter:</label>
      <select id="app-status-filter" class="form-control" onchange="setApplicationStatusFilter(this.value)">
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Applications</option>
        <option value="in-progress" ${statusFilter === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="complete" ${statusFilter === 'complete' ? 'selected' : ''}>Complete</option>
      </select>
      <label class="caption" style="margin:0;font-weight:500" for="app-sort-filter">Sort:</label>
      <select id="app-sort-filter" class="form-control" onchange="setApplicationSortBy(this.value)">
        <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Most Recent</option>
        <option value="progress" ${sortBy === 'progress' ? 'selected' : ''}>Progress (High to Low)</option>
        <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Course Name (A-Z)</option>
      </select>
    </div>
  ` : '';

  container.innerHTML = filterControls + (AppState.applications.length === 0
    ? emptyState('clipboard', 'No applications tracked', "You haven't started an application yet. Pick a saved course and take the first step.", 'Browse Courses', "navigateTo('decide')")
    : filtered.length === 0
      ? emptyState('clipboard', 'No matching applications', 'Try clearing the status filter.', 'Clear Filter', "setApplicationStatusFilter('all')")
      : filtered.map((app) => renderApplicationTimeline(app)).join('')
  );
}

function setApplicationStatusFilter(status) {
  AppState.viewFilters.appStatus = status;
  saveState();
  renderApplicationsTab(document.getElementById('track-tab-content'));
}

function setApplicationSortBy(sortBy) {
  AppState.viewFilters.appSort = sortBy;
  saveState();
  renderApplicationsTab(document.getElementById('track-tab-content'));
}

function renderApplicationTimeline(app) {
  const doneCount = app.steps.filter((s) => s.done).length;
  return `
    <div class="card">
      <div class="flex justify-between items-center mb-2">
        <h2>${escapeHtml(app.courseName)}</h2>
        <span class="text-muted text-sm">${doneCount}/${app.steps.length}</span>
      </div>
      <div class="timeline">
        ${app.steps.map((step, i) => `
          <div class="timeline-item ${step.done ? 'complete' : ''}">
            <div class="timeline-dot"></div>
            <div class="flex justify-between items-center">
              <span>${escapeHtml(step.title)}</span>
              <button type="button" class="btn btn-ghost btn-sm" onclick="toggleApplicationStep('${app.id}', ${i})">${step.done ? 'Undo' : 'Mark Done'}</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="deleteApplication('${app.id}')">Remove Application</button>
    </div>
  `;
}

function toggleApplicationStep(appId, stepIndex) {
  const app = AppState.applications.find((a) => a.id === appId);
  if (!app) return;
  app.steps[stepIndex].done = !app.steps[stepIndex].done;
  saveState();
  renderApplicationsTab(document.getElementById('track-tab-content'));
}

function deleteApplication(appId) {
  AppState.applications = AppState.applications.filter((a) => a.id !== appId);
  saveState();
  renderApplicationsTab(document.getElementById('track-tab-content'));
}

function setOkrStatusFilter(status) {
  AppState.viewFilters.okrStatus = status;
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}

function setOkrSortBy(sortBy) {
  AppState.viewFilters.okrSort = sortBy;
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}
