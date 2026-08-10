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
      <div class="icon-disc" aria-hidden="true" style="margin-bottom:0.75rem">${icon('compass')}</div>
      <p class="page-eyebrow">Module 01 · Discover</p>
      <h1>Discover</h1>
      <p>A 20-minute adaptive diagnostic across the Four Elements of career clarity — <strong>Identity, Community, Necessity, Horizon</strong> — the same model executive coaches use to help leaders find real direction, now built for you.</p>
    </div>
    <div class="card">
      <h2 class="mb-1">What to expect</h2>
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
        ${icon('mic')} <span id="voice-btn-label">Speak your answer</span>
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

/* ---------- Scoring ----------
 * computeClusterScores is deliberately pure (answers in, results out — no
 * AppState, no DOM) so `node --test tests/*.test.js` can exercise it directly. */
function computeClusterScores(answers) {
  const clusterTotals = {};
  Object.keys(CLUSTERS).forEach((c) => { clusterTotals[c] = 0; });

  const elementPoints = { identity: {}, community: {}, horizon: {} };
  ['identity', 'community', 'horizon'].forEach((e) => {
    Object.keys(CLUSTERS).forEach((c) => { elementPoints[e][c] = 0; });
  });

  const tags = {};

  Object.values(answers).forEach((ans) => {
    // A weight-2 question counts double — the questionnaire data has
    // carried per-question weights since day one, but scoring ignored
    // them until now. Answers saved without a weight count once.
    const weight = ans.weight > 0 ? ans.weight : 1;
    if (ans.scores) {
      Object.entries(ans.scores).forEach(([cluster, pts]) => {
        clusterTotals[cluster] = (clusterTotals[cluster] || 0) + pts * weight;
        if (elementPoints[ans.element]) {
          elementPoints[ans.element][cluster] = (elementPoints[ans.element][cluster] || 0) + pts * weight;
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

  return { clusterTotals, ranked, primary, secondary, elementScores, constraints, totalPoints };
}

/* How decisive is the primary-cluster result? Reported as the points margin
 * over the secondary cluster — an honest signal, not marketing. Pure, tested. */
function matchConfidence(ranked) {
  const top = ranked[0]?.[1] ?? 0;
  const second = ranked[1]?.[1] ?? 0;
  if (top <= 0) return { level: 'unclear', marginPts: 0, marginPct: 0 };
  const marginPts = top - second;
  const marginPct = Math.round((marginPts / top) * 100);
  const level = marginPct >= 25 ? 'clear' : marginPct >= 10 ? 'moderate' : 'close';
  return { level, marginPts, marginPct };
}

function finishQuestionnaire() {
  AppState.questionnaire.completed = true;
  AppState.questionnaire.results = {
    ...computeClusterScores(AppState.questionnaire.answers),
    computedAt: new Date().toISOString()
  };
  saveState();
  showToast('Discovery complete! Here are your results.', 'success');
  renderDiscoverPage();
}

/* Full cluster spread — every cluster with its share of total points, not
 * just the top two. Users routinely sit close between three clusters, and
 * hiding that flattens a real finding into a label. Pure, so it is tested. */
function clusterSpread(ranked, totalPoints) {
  const total = totalPoints || 1;
  return ranked.map(([id, pts], i) => ({
    id,
    points: pts,
    share: Math.round((pts / total) * 100),
    rank: i + 1
  }));
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
    constraints.grade && `<div class="meta-item"><div class="meta-label">Grade</div><div class="meta-value">${escapeHtml(constraints.grade)}</div></div>`,
    constraints.budget && `<div class="meta-item"><div class="meta-label">Budget (2yr)</div><div class="meta-value">${escapeHtml(constraints.budget.replace('_', ' '))}</div></div>`,
    constraints.urgency && `<div class="meta-item"><div class="meta-label">Income urgency</div><div class="meta-value">${escapeHtml(constraints.urgency)}</div></div>`,
    constraints.obligations && `<div class="meta-item"><div class="meta-label">Obligations</div><div class="meta-value">${escapeHtml(constraints.obligations)}</div></div>`
  ].filter(Boolean).join('');

  el.innerHTML = `
    <div class="print-only">${renderShareableReportHTML()}</div>

    <div class="discover-full-results">
      <h1 class="mb-2">This is what the data says about you</h1>

      <div class="cluster-primary">
        <span class="cluster-badge" style="background:${primaryC.color}22;color:var(--cluster-${primary}-ink)">Primary Cluster</span>
        <h2 style="color:var(--cluster-${primary}-ink)">${primaryC.name}</h2>
        <p class="text-secondary text-sm mt-1">${primaryC.description}</p>
        <div class="cluster-tags">${primaryC.paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
        ${(() => {
          const conf = matchConfidence(ranked);
          const confCopy = {
            clear: `a clear separation — the data points firmly at ${primaryC.name}.`,
            moderate: `a moderate separation — ${primaryC.name} leads, but keep your secondary cluster in view.`,
            close: `a close call — treat both clusters as live options and prototype both in the Design module.`,
            unclear: 'not enough scored answers to separate the clusters — consider retaking the diagnostic.'
          }[conf.level];
          return `<p class="confidence-line confidence-${conf.level}"><strong>Signal strength:</strong> <span class="num">+${conf.marginPts} pts</span> (${conf.marginPct}%) over your secondary cluster — ${confCopy}</p>`;
        })()}
        <button type="button" class="btn btn-primary btn-sm mt-2" onclick="openReportPreviewModal()">${icon('image')} Preview &amp; Share Report</button>
      </div>

      <div class="card">
        <span class="caption">Secondary Cluster</span>
        <h2 style="color:var(--cluster-${secondary}-ink)" class="mt-1">${secondaryC.name}</h2>
        <p class="text-secondary text-sm mt-1">${secondaryC.description}</p>
      </div>

      <div class="card">
        <h2 class="mb-2">Four Elements — Clarity Scores</h2>
        ${Object.entries(elementScores).map(([key, score]) => `
          <div class="score-row">
            <div class="score-label"><span>${elementLabels[key]}</span><span class="num">${score}%</span></div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${score}%;background:${primaryC.color}"></div></div>
            <p class="text-muted text-sm mt-1" style="font-size:0.75rem">${elementDescs[key]}</p>
          </div>
        `).join('')}
        <p class="text-muted text-sm mt-1">The fourth Element, Necessity, is shown below as your actual constraints rather than a clarity score.</p>
      </div>

      <div class="card">
        <h2 class="mb-1">Your full cluster spread</h2>
        <p class="text-muted text-sm mb-2">All six clusters, by share of your total points. Clusters within a few points of each other are effectively tied — treat them as live options, not runners-up.</p>
        <div class="spread-list">
          ${clusterSpread(AppState.questionnaire.results.ranked, AppState.questionnaire.results.totalPoints).map((row) => `
            <div class="spread-row${row.rank <= 2 ? ' spread-top' : ''}">
              <span class="spread-rank num">${row.rank}</span>
              <span class="spread-name">${escapeHtml(CLUSTERS[row.id].name)}</span>
              <span class="spread-bar"><span class="spread-fill" style="width:${row.share}%;background:${CLUSTERS[row.id].color}"></span></span>
              <span class="spread-share num">${row.share}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card evidence-card">
        <span class="caption">How much weight to put on this</span>
        <h2 class="mb-1 mt-1">An interest profile is a strong start, not a verdict</h2>
        <ul class="evidence-list">
          <li><strong>Interests predict what you choose and stick with better than how satisfied you will be.</strong> Across 53 studies, the match between interests and job only correlates about <span class="num">r&nbsp;=&nbsp;.17</span> with job satisfaction — roughly 3–6% of the variation. It is a real signal, and a modest one.</li>
          <li><strong>At your age, interests are still settling.</strong> Vocational interests keep firming up through the late teens and only reach their adult stability (about <span class="num">r&nbsp;=&nbsp;.70</span>) around ages 25–30. This is exactly why Njia asks you to design <em>three</em> futures rather than commit to one.</li>
          <li><strong>Alignment often dips right at the decision point.</strong> Research on students tracks interest–choice alignment rising through school and then dropping in the final year, under the pressure of imminent applications. If your result feels less certain than you expected, that is a documented pattern, not a personal failing.</li>
          <li><strong>Fit only pays off with action.</strong> Congruence predicts good outcomes when people act on it — informational interviews, prototypes, applications. The Connect and Track modules exist for that reason.</li>
        </ul>
        <p class="text-muted text-sm mt-2">Sources: Tsabari, Tziner &amp; Meir (2005) meta-analysis of congruence and satisfaction; Low, Yoon, Roberts &amp; Rounds (2005) on interest stability; Nye, Su, Rounds &amp; Drasgow (2012) on interests and performance; Super's stages of vocational development (crystallisation 14–18, specification 18–21). See Methodology for how these shape the Njia Method.</p>
      </div>

      ${constraintRows ? `<div class="card"><h2 class="mb-1">Necessity — Your Constraints</h2><p class="text-muted text-sm mb-2">The fourth Element. These feed the Decide module's course matcher directly.</p><div class="meta-grid">${constraintRows}</div></div>` : ''}

      <div class="card">
        <h2 class="mb-2">All Clusters</h2>
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
    </div>
  `;
}

// Single source of truth for "done" OKR count — reused by the report card
// and the WhatsApp/share summary so they can't drift out of sync with each
// other or with Track's own definition of done (js/track.js okrStatus).
function countDoneOkrs() {
  return AppState.okrs.filter((o) => okrStatus(o) === 'done').length;
}

/* ---------- Shareable report card — one compact layout feeding the PDF
 * export, the on-screen "Preview & Share" modal (screenshot-friendly),
 * and (via buildReportSummary) the WhatsApp/native-share text. */
function renderShareableReportHTML() {
  const results = AppState.questionnaire.results;
  if (!results) return '';
  const { primary, secondary, elementScores, constraints } = results;
  const primaryC = CLUSTERS[primary];
  const secondaryC = CLUSTERS[secondary];
  const dateStr = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  const elementLabels = { identity: 'Identity', community: 'Community', horizon: 'Horizon' };

  const constraintChips = [
    constraints.grade && `<span class="report-chip">Grade: ${escapeHtml(constraints.grade)}</span>`,
    constraints.budget && `<span class="report-chip">Budget: ${escapeHtml(constraints.budget.replace('_', ' '))}</span>`,
    constraints.urgency && `<span class="report-chip">⏱️ ${escapeHtml(constraints.urgency)}</span>`,
    constraints.obligations && `<span class="report-chip">Obligations: ${escapeHtml(constraints.obligations)}</span>`
  ].filter(Boolean).join('');

  const savedCourses = AppState.savedCourses
    .map((id) => COURSES.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const doneOkrs = countDoneOkrs();

  return `
    <div class="report-card">
      <div class="report-header">
        <img src="./icons/logo-lockup-report.png" alt="Njia" width="180" height="85" decoding="async" loading="lazy">
        <div class="report-header-meta">
          <span class="report-eyebrow">Career Pathway Report</span>
          <span class="report-date">${dateStr}</span>
        </div>
      </div>

      <div class="report-primary" style="border-color:${primaryC.color}">
        <span class="report-primary-label" style="color:${primaryC.color}">Primary Match</span>
        <h2 style="color:${primaryC.color}">${primaryC.name}</h2>
        <p>${primaryC.description}</p>
        <div class="report-paths">${primaryC.paths.slice(0, 4).map((p) => `<span class="report-path-tag">${escapeHtml(p)}</span>`).join('')}</div>
      </div>

      <p class="report-secondary-line">Also aligned with <strong style="color:${secondaryC.color}">${secondaryC.name}</strong>.</p>

      <div class="report-columns">
        <div class="report-elements">
          <span class="report-section-title">Four Elements</span>
          ${Object.entries(elementScores).map(([key, score]) => `
            <div class="report-bar-row">
              <span class="report-bar-label">${elementLabels[key]}</span>
              <div class="report-bar-track"><div class="report-bar-fill" style="width:${score}%;background:${primaryC.color}"></div></div>
              <span class="report-bar-pct num">${score}%</span>
            </div>
          `).join('')}
        </div>
        ${constraintChips ? `
          <div class="report-constraints">
            <span class="report-section-title">Your Constraints</span>
            <div class="report-chip-row">${constraintChips}</div>
          </div>` : ''}
      </div>

      ${savedCourses.length ? `
        <div class="report-courses">
          <span class="report-section-title">Considering</span>
          <ul>${savedCourses.map((c) => `<li>${escapeHtml(c.name)}</li>`).join('')}</ul>
        </div>` : ''}

      ${AppState.okrs.length ? `<p class="report-progress-line">${doneOkrs}/${AppState.okrs.length} goals completed so far.</p>` : ''}

      <div class="report-footer">
        <p>Built with <strong>Njia</strong> — a free, evidence-based career pathway diagnostic for Kenyan youth.</p>
        <p class="report-url">njiacareerpathways.netlify.app</p>
      </div>
    </div>
  `;
}

function openReportPreviewModal() {
  const html = renderShareableReportHTML();
  if (!html) return;
  openModal(`
    <h2 class="mb-2">Preview &amp; Share</h2>
    <p class="text-secondary text-sm mb-2">Screenshot this card to share directly, or use a button below.</p>
    ${html}
    <div class="btn-row mt-3">
      <button type="button" class="btn btn-secondary btn-sm" onclick="downloadReportPDF()">${icon('file')} PDF</button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="shareReportWhatsApp()">${icon('phone')} WhatsApp</button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="shareDiscoverResult()">${icon('link')} Copy / Share</button>
    </div>
  `);
}

const NJIA_SITE_URL = 'https://njiacareerpathways.netlify.app/';

function buildReportSummary() {
  const results = AppState.questionnaire.results;
  if (!results) return null;
  const primaryC = CLUSTERS[results.primary];
  const secondaryC = CLUSTERS[results.secondary];
  const { constraints } = results;

  const lines = [
    `🧭 *My Njia Career Report*`,
    '',
    `🎯 Primary match: *${primaryC.name}*`,
    `↳ ${primaryC.description}`,
    `🔹 Also aligned with: ${secondaryC.name}`
  ];

  const constraintBits = [
    constraints.grade && `🎓 Grade: ${constraints.grade}`,
    constraints.budget && `💰 Budget: ${constraints.budget.replace('_', ' ')}`
  ].filter(Boolean);
  if (constraintBits.length) lines.push('', ...constraintBits);

  const savedCourseNames = AppState.savedCourses
    .map((id) => COURSES.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 3)
    .map((c) => `• ${c.name}`);
  if (savedCourseNames.length) {
    lines.push('', '📚 Courses I\'m considering:', ...savedCourseNames);
  }

  if (AppState.okrs.length) {
    const doneCount = countDoneOkrs();
    lines.push('', `📈 Progress: ${doneCount}/${AppState.okrs.length} goals completed so far.`);
  }

  lines.push('', '_Built with Njia — a free, evidence-based career pathway diagnostic for Kenyan youth._');
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
    <h2 class="mb-2">Retake Discovery?</h2>
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
