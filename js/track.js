/* Njia — track.js — MODULE 5: The Accountability System
 * Personal OKRs, Application Tracker, Progress Analytics.
 * Alumni Network outcomes require a shared backend — deferred (see README).
 */

let trackActiveTab = 'okrs';

function renderTrackPage() {
  const el = document.getElementById('page-track');
  if (!el) return;

  const doneApplications = AppState.applications.filter((a) => a.steps.every((s) => s.done)).length;
  const doneOkrs = AppState.okrs.filter((o) => okrStatus(o) === 'done').length;

  el.innerHTML = `
    <h1 class="mb-1">Track</h1>
    <p class="text-secondary mb-2">Plans mean nothing without follow-through.</p>

    <div class="stats-row">
      <div class="stat"><div class="value">${AppState.okrs.length}</div><div class="label">OKRs</div></div>
      <div class="stat"><div class="value">${doneOkrs}</div><div class="label">OKRs Done</div></div>
      <div class="stat"><div class="value">${doneApplications}/${AppState.applications.length}</div><div class="label">Apps Done</div></div>
    </div>

    <div class="odyssey-tabs">
      <button type="button" class="odyssey-tab ${trackActiveTab === 'okrs' ? 'active' : ''}" onclick="setTrackTab('okrs')">🎯 OKRs</button>
      <button type="button" class="odyssey-tab ${trackActiveTab === 'applications' ? 'active' : ''}" onclick="setTrackTab('applications')">📋 Applications</button>
    </div>
    <div id="track-tab-content"></div>
  `;

  renderTrackTabContent();
}

function setTrackTab(tab) {
  trackActiveTab = tab;
  renderTrackPage();
}

function renderTrackTabContent() {
  const container = document.getElementById('track-tab-content');
  if (!container) return;
  if (trackActiveTab === 'okrs') renderOkrsTab(container);
  else renderApplicationsTab(container);
  replayFadeIn(container);
}

/* ---------- OKRs ---------- */
function okrStatus(okr) {
  const total = okr.keyResults.length;
  const done = okr.keyResults.filter((k) => k.done).length;
  if (total > 0 && done === total) return 'done';
  if (done / (total || 1) < 0.34 && daysSince(okr.createdAt) > 30) return 'at-risk';
  return 'on-track';
}

function daysSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function renderOkrsTab(container) {
  const statusFilter = AppState.decideFilters?.okrStatus || 'all';
  const sortBy = AppState.decideFilters?.okrSort || 'recent';

  let filtered = AppState.okrs;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((okr) => okrStatus(okr) === statusFilter);
  }

  if (sortBy === 'recent') {
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'progress') {
    filtered = filtered.sort((a, b) => {
      const aProgress = b.keyResults.filter((k) => k.done).length / (b.keyResults.length || 1);
      const bProgress = a.keyResults.filter((k) => k.done).length / (a.keyResults.length || 1);
      return bProgress - aProgress;
    });
  }

  container.innerHTML = `
    <div class="filter-row" style="margin-bottom:1rem;display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center">
      <label class="caption" style="margin:0;font-weight:500" for="okr-status-filter">Filter:</label>
      <select id="okr-status-filter" onchange="setOkrStatusFilter(this.value)" style="min-height:44px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem;font-size:0.95rem">
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All OKRs</option>
        <option value="on-track" ${statusFilter === 'on-track' ? 'selected' : ''}>On Track</option>
        <option value="at-risk" ${statusFilter === 'at-risk' ? 'selected' : ''}>At Risk</option>
        <option value="done" ${statusFilter === 'done' ? 'selected' : ''}>Done</option>
      </select>
      <label class="caption" style="margin:0;font-weight:500" for="okr-sort-filter">Sort:</label>
      <select id="okr-sort-filter" onchange="setOkrSortBy(this.value)" style="min-height:44px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem;font-size:0.95rem">
        <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Most Recent</option>
        <option value="progress" ${sortBy === 'progress' ? 'selected' : ''}>Progress (High to Low)</option>
      </select>
    </div>
    <button type="button" class="btn btn-primary mb-2" onclick="openOkrModal()">+ New OKR</button>
    ${filtered.length === 0
      ? emptyState('🎯', 'No OKRs yet', 'Turn your Odyssey Plan into a quarterly objective with 2–3 measurable key results.', '+ New OKR', 'openOkrModal()')
      : filtered.map((okr) => renderOkrItem(okr)).join('')
    }
  `;
}

function renderOkrItem(okr) {
  const status = okrStatus(okr);
  const done = okr.keyResults.filter((k) => k.done).length;
  const pct = Math.round((done / (okr.keyResults.length || 1)) * 100);
  const statusLabels = { 'on-track': 'On Track', 'at-risk': 'At Risk', done: 'Done' };

  return `
    <div class="card okr-item">
      <div class="okr-header">
        <h3>${escapeHtml(okr.title)}</h3>
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
    <h3 class="mb-2">New Quarterly OKR</h3>
    <label class="caption" for="okr-title">Objective</label>
    <input type="text" id="okr-title" placeholder="e.g. Get accepted into a Counselling Diploma programme" style="width:100%;min-height:44px;margin:0.4rem 0 0.8rem;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem">
    <label class="caption">Key Results (one per line, 2–3 recommended)</label>
    <textarea class="q-input mt-1" id="okr-key-results" placeholder="Shortlist 5 institutions&#10;Sit and pass entrance requirements&#10;Submit HELB application"></textarea>
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
function applicationStatus(app) {
  return app.steps.every((s) => s.done) ? 'complete' : 'in-progress';
}

function renderApplicationsTab(container) {
  const statusFilter = AppState.decideFilters?.appStatus || 'all';
  let filtered = AppState.applications;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((app) => applicationStatus(app) === statusFilter);
  }

  const filterControls = AppState.applications.length > 0 ? `
    <div class="filter-row" style="margin-bottom:1rem">
      <label class="caption" style="margin:0;font-weight:500" for="app-status-filter">Filter:</label>
      <select id="app-status-filter" onchange="setApplicationStatusFilter(this.value)" style="min-height:44px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem;font-size:0.95rem">
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Applications</option>
        <option value="in-progress" ${statusFilter === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="complete" ${statusFilter === 'complete' ? 'selected' : ''}>Complete</option>
      </select>
    </div>
  ` : '';

  container.innerHTML = filterControls + (AppState.applications.length === 0
    ? emptyState('📋', 'No applications tracked', "You haven't started an application yet. Pick a saved course and take the first step.", 'Browse Courses', "navigateTo('decide')")
    : filtered.length === 0
      ? emptyState('📋', 'No matching applications', 'Try clearing the status filter.', 'Clear Filter', "setApplicationStatusFilter('all')")
      : filtered.map((app) => renderApplicationTimeline(app)).join('')
  );
}

function setApplicationStatusFilter(status) {
  AppState.decideFilters = AppState.decideFilters || {};
  AppState.decideFilters.appStatus = status;
  saveState();
  renderApplicationsTab(document.getElementById('track-tab-content'));
}

function renderApplicationTimeline(app) {
  const doneCount = app.steps.filter((s) => s.done).length;
  return `
    <div class="card">
      <div class="flex justify-between items-center mb-2">
        <h3>${escapeHtml(app.courseName)}</h3>
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
  AppState.decideFilters = AppState.decideFilters || {};
  AppState.decideFilters.okrStatus = status;
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}

function setOkrSortBy(sortBy) {
  AppState.decideFilters = AppState.decideFilters || {};
  AppState.decideFilters.okrSort = sortBy;
  saveState();
  renderOkrsTab(document.getElementById('track-tab-content'));
}
