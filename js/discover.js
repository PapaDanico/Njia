/* Njia — discover.js — MODULE 1: The Digital Questionnaire Engine
 * Adaptive questionnaire, Four Elements scoring, six-cluster matching.
 * Depends on: data/questions.js (CLUSTERS, QUESTIONNAIRE), js/app.js (AppState, helpers)
 */

const FLAT_QUESTIONS = QUESTIONNAIRE.flatMap((section) =>
  section.questions.map((q) => ({ ...q, sectionId: section.id, sectionTitle: section.title, sectionIcon: section.icon, sectionColor: section.color }))
);

function renderDiscoverPage() {
  const el = document.getElementById('page-discover');
  if (!el) return;

  if (AppState.questionnaire.completed && AppState.questionnaire.results) {
    renderDiscoverResults(el);
    return;
  }

  if (AppState.questionnaire.currentIndex === undefined) {
    renderDiscoverIntro(el);
    return;
  }

  renderDiscoverQuestion(el);
}

function renderDiscoverIntro(el) {
  el.innerHTML = `
    <div class="hero" style="padding-top:0.5rem">
      <div class="icon" style="font-size:3rem" aria-hidden="true">🧭</div>
      <h1>Discover</h1>
      <p>A 20-minute adaptive diagnostic across the Four Elements of career clarity — <strong>Identity, Community, Necessity, Horizon</strong> — the same model executive coaches use to help leaders find real direction, now built for you.</p>
    </div>
    <div class="card">
      <h3 class="mb-1">What to expect</h3>
      <p class="text-secondary text-sm">Answer honestly, not aspirationally. There are no wrong answers — some questions ask about constraints like budget and timeline so your recommendations are actually realistic for you.</p>
    </div>
    <button type="button" class="btn btn-primary" onclick="startDiscoverQuestionnaire()">Begin Discovery →</button>
  `;
}

function startDiscoverQuestionnaire() {
  AppState.questionnaire.currentIndex = 0;
  AppState.questionnaire.answers = AppState.questionnaire.answers || {};
  saveState();
  renderDiscoverPage();
}

function renderDiscoverQuestion(el) {
  const idx = AppState.questionnaire.currentIndex || 0;
  const total = FLAT_QUESTIONS.length;
  const q = FLAT_QUESTIONS[idx];

  if (!q) {
    finishQuestionnaire();
    return;
  }

  const existingAnswer = AppState.questionnaire.answers[q.id];
  const progressPct = Math.round((idx / total) * 100);

  let bodyHtml = '';
  if (q.type === 'single') {
    bodyHtml = q.options.map((opt, i) => `
      <button type="button" class="option-card ${existingAnswer && existingAnswer.optionIndex === i ? 'selected' : ''}"
        onclick="selectDiscoverOption(${idx}, ${i})">
        ${escapeHtml(opt.text)}
      </button>
    `).join('');
  } else if (q.type === 'text') {
    const val = existingAnswer ? existingAnswer.value : '';
    bodyHtml = `
      <textarea class="q-input" id="discover-text-input" placeholder="${escapeHtml(q.placeholder || '')}">${escapeHtml(val)}</textarea>
      <button type="button" class="voice-btn" id="voice-btn" onclick="toggleVoiceInput()">
        <span aria-hidden="true">🎙️</span> <span id="voice-btn-label">Speak your answer</span>
      </button>
      <button type="button" class="btn btn-primary mt-2" onclick="submitDiscoverText(${idx})">Continue →</button>
    `;
  }

  el.innerHTML = `
    <div class="q-progress-label">Question ${idx + 1} of ${total}</div>
    <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
    <div class="q-section-header">
      <span class="icon" aria-hidden="true">${q.sectionIcon}</span>
      <span class="caption">${escapeHtml(q.sectionTitle)}</span>
    </div>
    <h2 class="mb-2">${escapeHtml(q.text)}</h2>
    ${bodyHtml}
    <div class="btn-row mt-3">
      ${idx > 0 ? `<button type="button" class="btn btn-secondary" onclick="goToDiscoverQuestion(${idx - 1})">← Back</button>` : ''}
      ${q.type === 'text' ? '' : (existingAnswer ? `<button type="button" class="btn btn-ghost" onclick="goToDiscoverQuestion(${idx + 1})">Skip →</button>` : '')}
    </div>
  `;

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    document.getElementById('voice-btn')?.classList.add('hidden');
  }
}

function goToDiscoverQuestion(idx) {
  AppState.questionnaire.currentIndex = Math.max(0, idx);
  saveState();
  renderDiscoverPage();
}

function selectDiscoverOption(idx, optionIndex) {
  const q = FLAT_QUESTIONS[idx];
  const opt = q.options[optionIndex];
  AppState.questionnaire.answers[q.id] = {
    optionIndex, text: opt.text, scores: opt.scores || {}, tag: opt.tag || null, element: q.element, weight: q.weight || 0
  };
  saveState();
  setTimeout(() => goToDiscoverQuestion(idx + 1), 180);
  renderDiscoverQuestion(document.getElementById('page-discover'));
}

function submitDiscoverText(idx) {
  const q = FLAT_QUESTIONS[idx];
  const textarea = document.getElementById('discover-text-input');
  const value = textarea ? textarea.value.trim() : '';
  AppState.questionnaire.answers[q.id] = { value, element: q.element, weight: 0, scores: {} };
  saveState();
  goToDiscoverQuestion(idx + 1);
}

/* ---------- Voice input (Web Speech API — transcribes to text, no audio storage) ---------- */
let voiceRecognition = null;
let voiceActive = false;

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Voice input is not supported on this browser.', 'error');
    return;
  }
  const btn = document.getElementById('voice-btn');
  const label = document.getElementById('voice-btn-label');
  const textarea = document.getElementById('discover-text-input');

  if (voiceActive) {
    voiceRecognition?.stop();
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'en-KE';
  voiceRecognition.interimResults = false;
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    voiceActive = true;
    btn?.classList.add('recording');
    if (label) label.textContent = 'Listening… tap to stop';
  };
  voiceRecognition.onresult = (event) => {
    const transcript = Array.from(event.results).map((r) => r[0].transcript).join(' ');
    if (textarea) textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript;
  };
  voiceRecognition.onerror = () => {
    showToast('Could not capture voice input. Try typing instead.', 'error');
  };
  voiceRecognition.onend = () => {
    voiceActive = false;
    btn?.classList.remove('recording');
    if (label) label.textContent = 'Speak your answer';
  };
  voiceRecognition.start();
}

/* ---------- Scoring ---------- */
function finishQuestionnaire() {
  const clusterTotals = {};
  Object.keys(CLUSTERS).forEach((c) => { clusterTotals[c] = 0; });

  const elementPoints = { identity: {}, community: {}, horizon: {} };
  ['identity', 'community', 'horizon'].forEach((e) => {
    Object.keys(CLUSTERS).forEach((c) => { elementPoints[e][c] = 0; });
  });

  const tags = {};

  Object.values(AppState.questionnaire.answers).forEach((ans) => {
    if (ans.scores) {
      Object.entries(ans.scores).forEach(([cluster, pts]) => {
        clusterTotals[cluster] = (clusterTotals[cluster] || 0) + pts;
        if (elementPoints[ans.element]) {
          elementPoints[ans.element][cluster] = (elementPoints[ans.element][cluster] || 0) + pts;
        }
      });
    }
    if (ans.tag) tags[ans.tag] = true;
  });

  const ranked = Object.entries(clusterTotals).sort((a, b) => b[1] - a[1]);
  const totalPoints = ranked.reduce((sum, [, pts]) => sum + pts, 0) || 1;

  const primary = ranked[0][0];
  const secondary = ranked[1][0];

  const elementScores = {};
  ['identity', 'community', 'horizon'].forEach((e) => {
    const pts = Object.values(elementPoints[e]);
    const sum = pts.reduce((a, b) => a + b, 0);
    const max = Math.max(...pts, 0);
    elementScores[e] = sum > 0 ? Math.round((max / sum) * 100) : 0;
  });

  const constraints = {
    grade: Object.keys(tags).find((t) => t.startsWith('grade_'))?.replace('grade_', '') || null,
    urgency: Object.keys(tags).find((t) => t.startsWith('urgency_'))?.replace('urgency_', '') || null,
    budget: Object.keys(tags).find((t) => t.startsWith('budget_'))?.replace('budget_', '') || null,
    financial: Object.keys(tags).find((t) => t.startsWith('financial_'))?.replace('financial_', '') || null,
    obligations: Object.keys(tags).find((t) => t.startsWith('obligations_'))?.replace('obligations_', '') || null
  };

  AppState.questionnaire.completed = true;
  AppState.questionnaire.results = {
    clusterTotals, ranked, primary, secondary, elementScores, constraints, totalPoints,
    computedAt: new Date().toISOString()
  };
  saveState();
  showToast('Discovery complete! Here are your results.', 'success');
  renderDiscoverPage();
}

function renderDiscoverResults(el) {
  const { ranked, primary, secondary, elementScores, constraints } = AppState.questionnaire.results;
  const primaryC = CLUSTERS[primary];
  const secondaryC = CLUSTERS[secondary];

  const elementLabels = { identity: 'Identity', community: 'Community', horizon: 'Horizon' };
  const elementDescs = {
    identity: 'How clearly your strengths point to one direction',
    community: 'How clearly your ideal work environment points to one direction',
    horizon: 'How clearly your long-term vision points to one direction'
  };

  const constraintRows = [
    constraints.grade && `<div class="meta-item"><div class="meta-label">🎓 Grade</div><div class="meta-value">${escapeHtml(constraints.grade)}</div></div>`,
    constraints.budget && `<div class="meta-item"><div class="meta-label">💰 Budget (2yr)</div><div class="meta-value">${escapeHtml(constraints.budget.replace('_', ' '))}</div></div>`,
    constraints.urgency && `<div class="meta-item"><div class="meta-label">⏱️ Income urgency</div><div class="meta-value">${escapeHtml(constraints.urgency)}</div></div>`,
    constraints.obligations && `<div class="meta-item"><div class="meta-label">🏠 Obligations</div><div class="meta-value">${escapeHtml(constraints.obligations)}</div></div>`
  ].filter(Boolean).join('');

  el.innerHTML = `
    <div class="print-only">
      <img src="./icons/logo-mark-light-128.png" alt="Njia" width="48" height="48" decoding="async">
      <h2>Njia Career Report</h2>
      <div class="print-date">Generated ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <h2 class="mb-2">Your Results</h2>

    <div class="cluster-primary">
      <span class="cluster-badge" style="background:${primaryC.color}22;color:${primaryC.color}">Primary Cluster</span>
      <h2 style="color:${primaryC.color}">${primaryC.name}</h2>
      <p class="text-secondary text-sm mt-1">${primaryC.description}</p>
      <div class="cluster-tags">${primaryC.paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
      <div class="btn-row mt-2">
        <button type="button" class="btn btn-secondary btn-sm" onclick="downloadReportPDF()">📄 PDF Report</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="shareReportWhatsApp()">📱 WhatsApp</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="shareDiscoverResult()">🔗 Copy / Share</button>
      </div>
    </div>

    <div class="card">
      <span class="caption">Secondary Cluster</span>
      <h3 style="color:${secondaryC.color}" class="mt-1">${secondaryC.name}</h3>
      <p class="text-secondary text-sm mt-1">${secondaryC.description}</p>
    </div>

    <div class="card">
      <h3 class="mb-2">Four Elements — Clarity Scores</h3>
      ${Object.entries(elementScores).map(([key, score]) => `
        <div class="score-row">
          <div class="score-label"><span>${elementLabels[key]}</span><span>${score}%</span></div>
          <div class="score-bar-track"><div class="score-bar-fill" style="width:${score}%;background:${primaryC.color}"></div></div>
          <p class="text-muted text-sm mt-1" style="font-size:0.75rem">${elementDescs[key]}</p>
        </div>
      `).join('')}
      <p class="text-muted text-sm mt-1">The fourth Element, Necessity, is shown below as your actual constraints rather than a clarity score.</p>
    </div>

    ${constraintRows ? `<div class="card"><h3 class="mb-1">Necessity — Your Constraints</h3><p class="text-muted text-sm mb-2">The fourth Element. These feed the Decide module's course matcher directly.</p><div class="meta-grid">${constraintRows}</div></div>` : ''}

    <div class="card">
      <h3 class="mb-2">All Clusters</h3>
      <div class="cluster-secondary-list">
        ${ranked.map(([id, pts]) => `
          <div class="cluster-row">
            <span><span class="cluster-dot" style="background:${CLUSTERS[id].color}"></span>${CLUSTERS[id].name}</span>
            <span class="text-muted text-sm">${pts} pts</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="btn-row">
      <button type="button" class="btn btn-primary" onclick="navigateTo('design')">Build Odyssey Plan →</button>
      <button type="button" class="btn btn-secondary" onclick="navigateTo('decide')">See Matching Courses</button>
    </div>
    <button type="button" class="btn btn-ghost mt-2" onclick="confirmRetakeQuestionnaire()">Retake Discovery</button>
    <button type="button" class="btn btn-ghost mt-1" onclick="openFeedbackModal()">Was this helpful? Give feedback</button>
  `;
}

const NJIA_SITE_URL = 'https://njiacareerpathways.netlify.app/';

function buildReportSummary() {
  const results = AppState.questionnaire.results;
  if (!results) return null;
  const clusterName = CLUSTERS[results.primary].name;
  const lines = [`My Njia Career Report — ${clusterName}`];

  const savedCourseNames = AppState.savedCourses
    .map((id) => COURSES.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 3)
    .map((c) => `• ${c.name}`);
  if (savedCourseNames.length) {
    lines.push('', 'Courses I\'m considering:', ...savedCourseNames);
  }

  if (AppState.okrs.length) {
    const doneCount = AppState.okrs.filter((o) => o.keyResults.every((k) => k.done)).length;
    lines.push('', `Progress: ${doneCount}/${AppState.okrs.length} goals completed so far.`);
  }

  lines.push('', 'Built with Njia — a free, evidence-based career pathway diagnostic for Kenyan youth.');
  return lines.join('\n');
}

function shareDiscoverResult() {
  const summary = buildReportSummary();
  if (!summary) return;

  if (navigator.share) {
    navigator.share({ title: 'My Njia result', text: summary, url: NJIA_SITE_URL }).catch(() => {
      // user cancelled the native share sheet — no action needed
    });
    return;
  }

  navigator.clipboard?.writeText(`${summary}\n${NJIA_SITE_URL}`).then(() => {
    showToast('Result copied — paste it into WhatsApp or anywhere else.', 'success');
  }).catch(() => {
    showToast('Could not copy automatically — try again or share the link manually.', 'error');
  });
}

function shareReportWhatsApp() {
  const summary = buildReportSummary();
  if (!summary) return;
  const text = encodeURIComponent(`${summary}\n${NJIA_SITE_URL}`);
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
}

function downloadReportPDF() {
  showToast('Opening print dialog — choose "Save as PDF" as the destination.', 'info');
  setTimeout(() => window.print(), 300);
}

function confirmRetakeQuestionnaire() {
  openModal(`
    <h3 class="mb-2">Retake Discovery?</h3>
    <p class="text-secondary mb-3">This clears your previous answers and results. Your saved courses, Odyssey Plans and OKRs are not affected.</p>
    <div class="btn-row">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn btn-danger" onclick="retakeQuestionnaire()">Retake</button>
    </div>
  `);
}

function retakeQuestionnaire() {
  AppState.questionnaire = { answers: {}, completed: false, results: null, currentIndex: 0 };
  saveState();
  closeModal();
  renderDiscoverPage();
}
