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
      <textarea class="q-input" id="discover-text-input" maxlength="1000" placeholder="${escapeHtml(q.placeholder || '')}">${escapeHtml(val)}</textarea>
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

  /* Which clusters actually share the top score.
   *
   * This sort has no tiebreaker, and Array.prototype.sort is stable, so equal
   * scores come out in the order Object.entries walked them — which is the
   * order the clusters happen to be declared in data/questions.js. Measured
   * over 20,000 uniformly-random answer sets: 11.5% of runs end in a top-two
   * tie, and the tie is awarded in exactly the declaration order, carer first
   * through numbers last. Carer took 35.8% of ties against a fair share of
   * 16.7%, which is most of the reason it was named primary in 19.7% of all
   * runs rather than the expected 16.7%.
   *
   * An array index was deciding which career direction a learner was told to
   * take. There is no honest tiebreaker available — if two clusters score
   * identically the instrument genuinely cannot separate them — so the fix is
   * to stop hiding it rather than to invent a rule. `primary` still names one,
   * because every surface needs something to render, but `tiedWithPrimary`
   * lets those surfaces say the truth: this was a draw. */
  const topScore = ranked[0][1];
  const tiedWithPrimary = topScore > 0
    ? ranked.filter(([, pts]) => pts === topScore).map(([id]) => id)
    : [];

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

  return { clusterTotals, ranked, primary, secondary, tiedWithPrimary, elementScores, constraints, totalPoints };
}

/* How decisive is the primary-cluster result? Reported as the points margin
 * over the secondary cluster — an honest signal, not marketing. Pure, tested. */
function matchConfidence(ranked) {
  const top = ranked[0]?.[1] ?? 0;
  const second = ranked[1]?.[1] ?? 0;
  if (top <= 0) return { level: 'unclear', marginPts: 0, marginPct: 0 };
  const marginPts = top - second;
  const marginPct = Math.round((marginPts / top) * 100);
  /* An exact tie is not a "close call", it is the instrument failing to
   * separate two clusters at all, and it happens in 11.5% of runs. Reported as
   * its own level so no surface has to describe a zero-point gap as a margin. */
  const level = marginPts === 0 ? 'tied'
    : marginPct >= 25 ? 'clear' : marginPct >= 10 ? 'moderate' : 'close';
  return { level, marginPts, marginPct };
}

/* HOW MUCH OF THIS RESULT IS THE INSTRUMENT, AND HOW MUCH IS ONE ANSWER?
 *
 * The confidence line reports the primary cluster's margin over the secondary.
 * That is a real statistic and it answers the wrong question. A learner about
 * to plan five years does not need to know how far ahead the winner finished;
 * they need to know whether the winner would still have won on a slightly
 * different day.
 *
 * This is a leave-one-out sensitivity check, which is the standard way to ask
 * that of a small instrument. Drop each answer in turn, re-score the rest, and
 * count how often the primary cluster survives. It is exact rather than
 * sampled — the questionnaire is short enough to re-score completely — so the
 * number is a measurement, not an estimate.
 *
 * Njia's questionnaire is a bespoke instrument. It inherits its structure from
 * Holland's RIASEC, and du Toit and de Bruin's South African work supports that
 * structure in an African sample, but this specific item set has never been
 * psychometrically validated: no published alpha, no test-retest coefficient,
 * no criterion study. That is stated in the methodology and it is the honest
 * position. What this function does is the one reliability claim the app can
 * make from its own evidence, on this learner's own answers, without borrowing
 * a number from a study of a different instrument.
 *
 * Pure, so it is testable without a browser. */
function primaryStability(answers) {
  const ids = Object.keys(answers || {});
  if (ids.length < 3) return null;
  const base = computeClusterScores(answers).primary;
  let held = 0;
  for (const drop of ids) {
    const subset = {};
    for (const id of ids) if (id !== drop) subset[id] = answers[id];
    if (computeClusterScores(subset).primary === base) held += 1;
  }
  const pct = Math.round((held / ids.length) * 100);
  /* Bands are deliberately blunt. A result that survives every re-score is
   * robust; one that flips on a third of them is a genuine tie the margin line
   * would have hidden behind a single winner's name. */
  const level = pct === 100 ? 'stable' : pct >= 80 ? 'mostly-stable' : pct >= 60 ? 'sensitive' : 'unstable';
  return { held, of: ids.length, pct, level };
}

function finishQuestionnaire() {
  AppState.questionnaire.completed = true;
  AppState.questionnaire.results = {
    ...computeClusterScores(AppState.questionnaire.answers),
    stability: primaryStability(AppState.questionnaire.answers),
    computedAt: new Date().toISOString()
  };
  saveState();
  /* The headline number: how many people actually finish. Fired here rather
   * than on the results render, which also runs on every reload of a completed
   * questionnaire and would count one person many times. */
  recordMilestone('diagnostic-completed');
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

/* The labour-market reality check, filtered to the user's matched cluster.
 *
 * Interest fit answers "what suits me". This answers "what does that pay, and
 * who is actually hiring" — the question every Kenyan parent asks next, and
 * the one a career tool that ducks it has no business calling itself
 * evidence-based.
 *
 * Every earnings figure ships with its entryReality caveat, because a sector
 * average includes consultants and principals and is emphatically not a
 * school-leaver's starting salary. The caveat is not decoration; rendering
 * the number without it would repeat the fabricated-statistics failure this
 * whole layer exists to correct. tests/provenance.test.js enforces that the
 * caveat exists on every record.
 */
/* Automation exposure for the user's cluster.
 *
 * Frey & Osborne named three bottlenecks that resist computerisation —
 * social intelligence, creative intelligence, and complex perception and
 * manipulation — and those map unusually cleanly onto Njia's clusters, which
 * is what makes this worth showing per-cluster instead of as a general
 * warning nobody can act on.
 *
 * The two headline estimates disagree, and both are shown. Oxford Martin put
 * developing-country risk far above rich-country risk; newer AI-specific work
 * finds the opposite. Presenting only the alarming one would be the same
 * cherry-picking this codebase has already been corrected for once.
 */
function renderAutomationBlock(primaryCluster) {
  if (typeof AUTOMATION_EXPOSURE === 'undefined') return '';
  const mine = AUTOMATION_EXPOSURE.bottlenecks.filter((b) => b.clusters.includes(primaryCluster));
  if (!mine.length) return '';

  return `
    <h3 class="mt-2 mb-1">How exposed is this to automation?</h3>
    ${mine.map((b) => `
      <p class="text-secondary text-sm mb-1"><strong>${escapeHtml(b.barrier)}.</strong> ${escapeHtml(b.meaning)}</p>
    `).join('')}
    <p class="text-secondary text-sm mb-1">${escapeHtml(AUTOMATION_EXPOSURE.kenyaHeadline)} ${escapeHtml(AUTOMATION_EXPOSURE.kenyaSharpEnd)}</p>
    <details class="automation-detail">
      <summary>The two big estimates disagree — here is how</summary>
      ${AUTOMATION_EXPOSURE.contested.map((c) => `
        <p class="text-sm mb-1"><strong>${escapeHtml(c.view)}:</strong> ${escapeHtml(c.figure)}. <span class="text-muted">${escapeHtml(c.basis)}</span></p>
      `).join('')}
      <p class="text-muted text-sm">They measure different things — how codifiable the work is, versus what today's systems can actually do and where adoption pays. Njia shows both rather than the more dramatic one.</p>
    </details>
  `;
}

function renderLabourMarketCard(primaryCluster) {
  if (typeof SECTOR_EARNINGS === 'undefined') return '';
  const sectors = SECTOR_EARNINGS.filter((s) => s.clusters.includes(primaryCluster));
  const signals = KENYA_DEMAND_SIGNALS.filter((s) => s.clusters.includes(primaryCluster));
  const entry = typeof ENTRY_PAY !== 'undefined' ? ENTRY_PAY.filter((e) => e.clusters.includes(primaryCluster)) : [];
  const absorption = typeof ABSORPTION_GAP !== 'undefined' ? ABSORPTION_GAP.sectors.filter((a) => a.clusters.includes(primaryCluster)) : [];
  const trades = typeof SKILLED_TRADES !== 'undefined' && SKILLED_TRADES.clusters.includes(primaryCluster);
  const digital = typeof DIGITAL_WORK !== 'undefined' && DIGITAL_WORK.clusters.includes(primaryCluster);
  const mobility = typeof LABOUR_MOBILITY !== 'undefined' && LABOUR_MOBILITY.clusters.includes(primaryCluster);
  if (!sectors.length && !signals.length && !entry.length) return '';

  const money = (n) => `Ksh ${n.toLocaleString()}`;
  const range = (a, b) => (a === b ? money(a) : `${money(a)}–${money(b)}`);
  const monthly = (annual) => money(Math.round(annual / 12));

  return `
    <div class="card evidence-card">
      <span class="caption">The labour market you are entering</span>
      <h2 class="mb-1 mt-1">What this field actually pays — and who is hiring</h2>

      ${entry.length ? `
        <p class="text-secondary text-sm mb-2">The honest starting point. Kenya's urban minimum wage is ${money(MINIMUM_WAGE.urbanMonthlyKes)} a month — read every figure here against it.</p>
        <div class="pay-list">
          ${entry.map((e) => `
            <div class="pay-row">
              <div class="pay-row-head">
                <span class="pay-role">${escapeHtml(e.role)}</span>
                <span class="pay-figure num">${range(e.monthlyKes[0], e.monthlyKes[1])}<span class="pay-per">/mo</span></span>
              </div>
              <p class="pay-note">${escapeHtml(e.note)}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${absorption.map((a) => `
        <div class="absorption-note">
          <span class="caption">${escapeHtml(a.sector)} — vacancies are not the same as job offers</span>
          <p class="text-sm mt-1 mb-1"><strong>And yet:</strong> ${escapeHtml(a.reality)}</p>
          <p class="text-sm"><strong>So:</strong> ${escapeHtml(a.planning)}</p>
          <details class="inline-detail"><summary>The numbers behind this</summary><p class="text-sm">${escapeHtml(a.shortage)}</p></details>
        </div>
      `).join('')}

      ${digital ? `
        <div class="absorption-note">
          <span class="caption">Online work — real, and oversold</span>
          <p class="text-sm mt-1 mb-1">${escapeHtml(DIGITAL_WORK.honestReading)}</p>
          <p class="text-sm">${escapeHtml(DIGITAL_WORK.aiCaution)}</p>
        </div>
      ` : ''}

      ${trades ? `
        <div class="informal-note">
          <p class="text-sm mb-1"><strong>The trades are short of people.</strong> ${escapeHtml(SKILLED_TRADES.supplyGap)} Certified day rates have risen from ${range(SKILLED_TRADES.dayRate2012Kes[0], SKILLED_TRADES.dayRate2012Kes[1])} in 2012 to <strong>${range(SKILLED_TRADES.dayRateKes[0], SKILLED_TRADES.dayRateKes[1])} a day</strong>.</p>
          <p class="text-sm mb-1">${escapeHtml(SKILLED_TRADES.caution)}</p>
          ${typeof PRIOR_LEARNING !== 'undefined' ? `
            <p class="text-sm"><strong>Already have the skill but no certificate?</strong> <strong>Recognition of Prior Learning</strong> is how you get one without going back to school: ${escapeHtml(PRIOR_LEARNING.whatItIs.charAt(0).toLowerCase() + PRIOR_LEARNING.whatItIs.slice(1))} ${escapeHtml(PRIOR_LEARNING.scaleSoFar)} Help explains who to approach.</p>
          ` : ''}
        </div>
      ` : ''}

      ${typeof INFORMAL_ECONOMY !== 'undefined' ? `
        <div class="informal-note">
          <p class="text-sm mb-1"><strong>${INFORMAL_ECONOMY.informalSharePct}% of Kenyan workers are informal</strong> — ${(INFORMAL_ECONOMY.informalWorkers / 1000000).toFixed(1)}m against ${(INFORMAL_ECONOMY.formalWorkers / 1000000).toFixed(1)}m in formal wage jobs, and ${INFORMAL_ECONOMY.newJobsInformalPct}% of last year's new jobs.</p>
          <p class="text-sm">${escapeHtml(INFORMAL_ECONOMY.reading)}</p>
        </div>
      ` : ''}

      ${typeof ENTERPRISE_CAPITAL !== 'undefined' ? (() => {
        const cap = ENTERPRISE_CAPITAL;
        return `
        <div class="informal-note">
          <p class="text-sm mb-1"><strong>If you will create your own work, the question is what you can raise.</strong> ${escapeHtml(cap.theMisconception)}</p>
          <p class="text-sm"><strong>Start early:</strong> ${escapeHtml(cap.theAdvice)}</p>
          <details class="inline-detail"><summary>What the Youth Enterprise Fund actually lends, and the Hustler Fund terms</summary>
            <p class="text-sm">The <strong>${escapeHtml(cap.realCapital.name)}</strong> lends ${money(cap.realCapital.startupLoanKes)} to start, and from ${money(cap.realCapital.expansionFromKes)} up to ${money(cap.realCapital.expansionCeilingKes)} to expand, for ages ${cap.realCapital.ageRange[0]}–${cap.realCapital.ageRange[1]}. ${escapeHtml(cap.realCapital.interest)}</p>
            <p class="text-sm mt-1"><strong>The gate:</strong> ${escapeHtml(cap.realCapital.theGate)} ${escapeHtml(cap.realCapital.whereToApply)}</p>
            <p class="text-sm mt-1"><strong>Hustler Fund, in proportion:</strong> ${escapeHtml(cap.hustlerFund.reading)}</p>
            <p class="text-sm mt-1"><strong>On the default rate you have seen:</strong> ${escapeHtml(cap.hustlerFund.defaultDispute)}</p>
            <p class="text-sm mt-1"><strong>Expect this to move:</strong> ${escapeHtml(cap.honestLimit)}</p>
          </details>
        </div>
      `; })() : ''}

      ${typeof ATTACHMENT !== 'undefined' && ATTACHMENT.clusters.includes(primaryCluster) ? `
        <div class="absorption-note">
          <span class="caption">The step inside your course that most people plan for too late</span>
          <p class="text-sm mt-1 mb-1">${escapeHtml(ATTACHMENT.isMandatory)}</p>
          <p class="text-sm"><strong>Do this early:</strong> ${escapeHtml(ATTACHMENT.theAdvice)}</p>
          <details class="inline-detail"><summary>Where to register, and why it is contested</summary>
            <p class="text-sm">${escapeHtml(ATTACHMENT.whereToApply)}</p>
            <p class="text-sm mt-1">${escapeHtml(ATTACHMENT.theCompetition)} ${escapeHtml(ATTACHMENT.scale)} ${escapeHtml(ATTACHMENT.honestLimit)}</p>
          </details>
        </div>
      ` : ''}

      ${mobility ? `
        <div class="absorption-note">
          <span class="caption">Working abroad — start with the number that is wrong</span>
          <p class="text-sm mt-1 mb-1">${escapeHtml(LABOUR_MOBILITY.theNumberYouHeard)}</p>
          <p class="text-sm mb-1"><strong>What is real:</strong> ${escapeHtml(LABOUR_MOBILITY.whatIsRealInIt)}</p>
          <p class="text-sm"><strong>The actual gate:</strong> ${escapeHtml(LABOUR_MOBILITY.theRealGate)}</p>
          <details class="inline-detail"><summary>What clearing that gate actually involves</summary>
            <p class="text-sm">${escapeHtml(LABOUR_MOBILITY.theGateDetail)}</p>
            <p class="text-sm mt-1">${escapeHtml(LABOUR_MOBILITY.theOpening)}</p>
            <p class="text-sm mt-1">${escapeHtml(LABOUR_MOBILITY.honestReading)}</p>
          </details>
        </div>
      ` : ''}

      <details class="evidence-more">
        <summary>Sector averages, demand signals and the future-of-work evidence</summary>

        ${sectors.length ? `
          <h3 class="mt-2 mb-1">Sector averages</h3>
          <p class="text-muted text-sm mb-2">Averages across formal wage employment, including senior staff — a ceiling, not a starting point.</p>
          ${sectors.map((s) => `
            <div class="sector-row">
              <div class="sector-row-head">
                <span class="sector-name">${escapeHtml(s.sector)}</span>
                <span class="sector-figure num">${monthly(s.annualKes)}<span class="sector-per">/mo avg</span></span>
              </div>
              <p class="sector-reality">${escapeHtml(s.entryReality)}</p>
            </div>
          `).join('')}
        ` : ''}

        ${signals.length ? `
          <h3 class="mt-2 mb-1">Demand signals in Kenya</h3>
          <ul class="evidence-list">
            ${signals.map((s) => `<li><strong>${escapeHtml(s.signal)}.</strong> ${escapeHtml(s.note)}</li>`).join('')}
          </ul>
        ` : ''}

        ${renderAutomationBlock(primaryCluster)}

        <h3 class="mt-2 mb-1">Which jobs are actually growing</h3>
        <p class="text-secondary text-sm mb-1">${escapeHtml(FUTURE_OF_WORK.absoluteVsPercentage)}</p>
        <div class="growth-split">
          <div>
            <span class="caption">Fastest by percentage</span>
            <p class="text-muted text-sm">${FUTURE_OF_WORK.growthByPercentage.slice(0, 5).map((r) => escapeHtml(r)).join(' · ')}</p>
          </div>
          <div>
            <span class="caption">Most jobs added</span>
            <p class="text-muted text-sm">${FUTURE_OF_WORK.growthByAbsoluteNumbers.map((r) => escapeHtml(r)).join(' · ')}</p>
          </div>
        </div>
        <p class="text-muted text-sm mt-1"><strong>Declining:</strong> ${FUTURE_OF_WORK.decliningRoles.map((r) => escapeHtml(r)).join(' · ')}. ${escapeHtml(FUTURE_OF_WORK.decliningNote)}</p>

        <h3 class="mt-2 mb-1">The skills that keep paying</h3>
        <p class="text-secondary text-sm mb-1">${escapeHtml(FUTURE_OF_WORK.skillChurn)} ${escapeHtml(FUTURE_OF_WORK.topCoreSkill)}</p>
      </details>

      <p class="text-muted text-sm mt-2">Earnings: ${escapeHtml(LABOUR_MARKET_ANCHORS.source)}. Minimum wage: ${escapeHtml(MINIMUM_WAGE.source)}. Skills outlook: ${escapeHtml(FUTURE_OF_WORK.source)} (global scope). Figures were cross-checked across independent reports rather than read from the primary releases — see Methodology in Help.</p>
    </div>
  `;
}

function renderDiscoverResults(el) {
  const { ranked, primary, secondary, elementScores, constraints, stability } = AppState.questionnaire.results;
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
        <p class="cluster-tags-label">Fields this cluster points toward</p>
        <div class="cluster-tags">${primaryC.paths.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join('')}</div>
        ${(() => {
          /* The tags above are aspirational and stay that way — a learner
             should hear that their type leads toward architecture even while
             Njia holds no architecture course. What was dishonest was letting
             them read as an offer. This line is the measured other half:
             what the catalogue can actually train you for, counted from it.
             Where the two disagree — creator points at Graphic Design and
             Journalism, and holds hairdressing and catering — the learner now
             sees the gap instead of discovering it in the Decide module. */
          const roles = CATALOGUE_ROLES[primary] || [];
          if (!roles.length) return '';
          const places = COURSES.filter((c) => c.cluster === primary).length;
          return `<p class="cluster-supply"><strong>In Njia's catalogue today:</strong> ${
            roles.slice(0, 5).map((r) => `${escapeHtml(r.role)} <span class="num">${r.courses}</span>`).join(', ')
          } — from ${places} course${places === 1 ? '' : 's'} you could apply to. Counted from the catalogue, not chosen by hand.</p>`;
        })()}
        ${(() => {
          const conf = matchConfidence(ranked);
          const confCopy = {
            tied: `an exact draw — ${primaryC.name} and ${secondaryC.name} scored identically, so neither is your answer. Prototype both in the Design module rather than taking the one shown first.`,
            clear: `a clear separation — the data points firmly at ${primaryC.name}.`,
            moderate: `a moderate separation — ${primaryC.name} leads, but keep your secondary cluster in view.`,
            close: `a close call — treat both clusters as live options and prototype both in the Design module.`,
            unclear: 'not enough scored answers to separate the clusters — consider retaking the diagnostic.'
          }[conf.level];
          return conf.level === 'tied'
            ? `<p class="confidence-line confidence-tied"><strong>Signal strength:</strong> ${confCopy}</p>`
            : `<p class="confidence-line confidence-${conf.level}"><strong>Signal strength:</strong> <span class="num">+${conf.marginPts} pts</span> (${conf.marginPct}%) over your secondary cluster — ${confCopy}</p>`;
        })()}
        ${(() => {
          /* Sits directly under the margin line because the two answer
             different questions and are easy to confuse. Margin says how far
             ahead the winner finished; this says whether the winner survives
             re-scoring without each answer in turn. A learner can have a wide
             margin and an unstable result, or a narrow margin that never
             flips — which is exactly why one number was not enough. */
          const st = stability;
          if (!st) return '';
          const copy = {
            stable: 'your result did not change once. Plan around it.',
            'mostly-stable': 'your result is robust, with a few answers carrying real weight.',
            sensitive: 'a handful of single answers can flip this. Read your full spread below before committing.',
            unstable: 'single answers move this result. Treat the top two clusters as genuinely tied, and prototype both.'
          }[st.level];
          return `<p class="confidence-line confidence-${st.level === 'stable' ? 'strong' : st.level === 'mostly-stable' ? 'moderate' : 'close'}"><strong>Stability:</strong> re-scored <span class="num">${st.of}</span> times, each without one of your answers, your primary cluster held <span class="num">${st.held}</span> times (<span class="num">${st.pct}%</span>) — ${copy}</p>`;
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

      ${renderLabourMarketCard(primary)}

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
  /* Guarded: results saved to localStorage before tie detection existed have
     no tiedWithPrimary, and a returning user must not hit an undefined. */
  const tiedTop = Array.isArray(results.tiedWithPrimary) ? results.tiedWithPrimary : [];
  const isTie = tiedTop.length > 1;
  const dateStr = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  const elementLabels = { identity: 'Identity', community: 'Community', horizon: 'Horizon' };

  const constraintChips = [
    constraints.grade && `<span class="report-chip">Grade: ${escapeHtml(constraints.grade)}</span>`,
    // Labels match renderDiscoverResults' meta grid exactly. They used to
    // differ: this card said "Budget: low" where the screen said
    // "Budget (2yr)", and rendered urgency as a bare "⏱️ high" — a clock emoji
    // standing in for the words "Income urgency". On screen that is merely
    // terse. On the PDF it is the whole label, and the PDF is the copy that
    // travels to a parent, a school or a bursary office with no app around it
    // to disambiguate. "high" what? Emoji also carry no text for a screen
    // reader and are the first glyphs to fall back to tofu in a print font.
    constraints.budget && `<span class="report-chip">Budget (2yr): ${escapeHtml(constraints.budget.replace('_', ' '))}</span>`,
    constraints.urgency && `<span class="report-chip">Income urgency: ${escapeHtml(constraints.urgency)}</span>`,
    constraints.obligations && `<span class="report-chip">Obligations: ${escapeHtml(constraints.obligations)}</span>`
  ].filter(Boolean).join('');

  const savedCourses = AppState.savedCourses
    .map((id) => COURSES.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 5);

  /* A REPORT WITH NO COURSES IN IT ANSWERS THE WRONG QUESTION.
   *
   * This section used to render only what the reader had saved, so anyone who
   * finished the questionnaire and printed straight away got a sheet naming
   * their archetype and nothing they could act on — no course, no institution,
   * no fee. That is the half of the page a parent, a teacher or a bursary
   * committee actually reads.
   *
   * So when nothing is saved the report suggests, from the same catalogue the
   * app uses and under the reader's own constraints: their primary cluster,
   * filtered by their grade where they gave one. Ordered most-open-entry first
   * and cheapest first within that, because the reader this project exists for
   * is the one for whom a D and a fee are the binding constraints — showing
   * them a C+ degree at the top of the page is showing them a door that is
   * shut.
   *
   * Six, not five: a saved list is a decision already taken and five is plenty,
   * while a suggested list is a starting point and wants enough spread to show
   * that more than one kind of thing is open. Both still fit the page.
   *
   * AND WHERE THE COURSE IS HAS TO COUNT, which the first version left out.
   *
   * Openness and fee alone put four of six suggestions in Turkana, West Pokot,
   * Marsabit and Lodwar for a reader whose own constraints read "obligations:
   * high, income urgency: high". Not a bug in the sort — every KMTC certificate
   * ties at D+ and Ksh 82,200, so both keys are exhausted and the order falls
   * through to however the catalogue happens to be written.
   *
   * That inverts this project's own coverage argument. The eligibility-floor
   * work exists because the reader who cannot move away from home is the one
   * the catalogue was failing; handing that same reader a shareable sheet
   * headed "Courses Open To You" listing campuses several hundred kilometres
   * away is worse than a short list, because it looks researched.
   *
   * So county leads, taken from the filter the reader already set in Decide.
   * Not as a tie-break — a tie-break would hide the fact that distance was
   * weighed at all — and not as a hard filter either, because a county with two
   * courses in it would then produce a two-row report and no hint that more
   * exists. Nearby first, the rest after, and the legend says which is which. */
  const homeCounty = AppState.decideFilters && AppState.decideFilters.county !== 'all'
    ? AppState.decideFilters.county
    : null;
  const countyOf = (c) => INSTITUTIONS.find((i) => i.id === c.institution_id)?.county || null;

  const eligible = savedCourses.length ? [] : COURSES
    .filter((c) => c.cluster === results.primary)
    .filter((c) => !constraints.grade
      || typeof meetsGradeRequirement !== 'function'
      || meetsGradeRequirement(constraints.grade, c.min_grade))
    .sort((a, b) => {
      /* Open entry first, then the lowest published minimum. GRADE_ORDER runs
         E-first, so a LOWER index is a more open door and ascending is right;
         null sorts ahead of everything as -1. Written the other way round at
         first, which put an A-grade degree at the top of a report meant for the
         reader with the fewest options. */
      const openness = (x) => (x.min_grade == null ? -1 : GRADE_ORDER.indexOf(x.min_grade));
      const byOpen = openness(a) - openness(b);
      if (byOpen !== 0) return byOpen;
      /* Then cheapest, with unpriced records last rather than treated as free. */
      const fee = (x) => (x.total_fees_kes == null ? Infinity : x.total_fees_kes);
      return fee(a) - fee(b);
    });

  const nearby = homeCounty ? eligible.filter((c) => countyOf(c) === homeCounty) : [];
  const farther = homeCounty ? eligible.filter((c) => countyOf(c) !== homeCounty) : eligible;
  const suggested = [...nearby, ...farther].slice(0, 6);
  const nearbyShown = homeCounty ? suggested.filter((c) => countyOf(c) === homeCounty).length : 0;

  const reportCourses = savedCourses.length ? savedCourses : suggested;

  const doneOkrs = countDoneOkrs();

  // Applications count as progress too. `applicationStatus` lives in track.js,
  // which loads after this module — guarded so the card still renders if the
  // report is ever built before Track is on the page.
  const apps = Array.isArray(AppState.applications) ? AppState.applications : [];
  const doneApps = typeof applicationStatus === 'function'
    ? apps.filter((a) => applicationStatus(a) === 'complete').length
    : 0;
  const progressLines = [
    apps.length ? `${doneApps}/${apps.length} applications complete` : '',
    AppState.okrs.length ? `${doneOkrs}/${AppState.okrs.length} goals completed` : ''
  ].filter(Boolean);

  return `
    <div class="report-card">
      <div class="report-header">
        ${/* NOT loading="lazy". This image lives inside .print-only, which is
              display:none until print media applies. A lazy image in a hidden
              subtree never enters the viewport, so the browser never fetches
              it — measured: naturalWidth 0, zero network requests — and by the
              time print CSS reveals the block there is no opportunity left to
              load. Every PDF exported before this shipped with no brand mark
              at all, which is the one element telling a parent, school or
              bursary office where the document came from. */''}
        <!-- Drawn rather than fetched. The lockup used to be a 180x85 PNG,
             and getting it to appear in the exported PDF at all took a fight
             (see the note above about lazy loading). Vector markup in the
             same document cannot fail to load, has nothing to decode before
             print, and prints at the printer's resolution instead of at 2x
             screen density. -->
        <div class="report-lockup">
          <svg viewBox="0 0 64 96" width="28" height="42" role="img" aria-label="Njia"><use href="#i-njia"/></svg>
          <span class="report-lockup-text">
            <strong>Njia</strong>
            <span>Career Pathways · Kenya</span>
          </span>
        </div>
        <div class="report-header-meta">
          <span class="report-eyebrow">Career Pathway Report</span>
          <span class="report-date">${dateStr}</span>
        </div>
      </div>

      <div class="report-primary" style="border-color:${primaryC.color}">
        <span class="report-primary-label" style="color:${primaryC.color}">Primary Match</span>
        <h2 style="color:${primaryC.color}">${primaryC.name}</h2>
        <p>${primaryC.description}</p>
        <!-- Measured roles, not primaryC.paths. The report is the sheet a
             learner hands to a parent or a sponsor to argue for fees, so the
             job titles on it have to be ones the catalogue can actually train
             them for. Same four tags, same height — the one-page fit holds. -->
        <div class="report-paths">${((CATALOGUE_ROLES[primary] || []).length
          ? CATALOGUE_ROLES[primary].slice(0, 4).map((r) => r.role)
          : primaryC.paths.slice(0, 4)
        ).map((label) => `<span class="report-path-tag">${escapeHtml(label)}</span>`).join('')}</div>
      </div>

      ${isTie
        ? `<p class="report-secondary-line"><strong>This was a draw.</strong> ${tiedTop.map((id) => escapeHtml(CLUSTERS[id].name)).join(' and ')} scored identically, so treat them as equally matched — the questionnaire cannot separate them, and the one printed above is not the winner.</p>`
        : `<p class="report-secondary-line">Also aligned with <strong style="color:${secondaryC.color}">${secondaryC.name}</strong>.</p>`}

      <div class="report-columns">
        <div class="report-elements">
          ${/* "Four Elements" over three bars was the screen's wording minus
                the two lines that made it true. renderDiscoverResults titles
                this "Four Elements — Clarity Scores", describes what each bar
                measures, and says outright that the fourth Element, Necessity,
                appears as constraints rather than a score. The card dropped all
                of it, leaving a heading that promises four rows and shows
                three, above percentages with nothing to read them by. A
                standalone artifact cannot borrow context from the page that
                made it. */''}
          <span class="report-section-title">Four Elements — Clarity Scores</span>
          <p class="report-legend">How concentrated each Element is on one cluster. A clarity score, <strong>not a mark out of 100</strong> — 60% is not a pass and 90% is not a distinction.</p>
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
            ${/* Naming Necessity here is what makes the heading opposite it
                  honest — the fourth Element is present, it is simply reported
                  as the constraints themselves rather than as a clarity score,
                  because a "how concentrated" figure over budget and grade
                  would mean nothing. */''}
            <span class="report-section-title">Necessity — Your Constraints</span>
            <p class="report-legend">The fourth Element, shown as your actual constraints rather than a score.</p>
            <div class="report-chip-row">${constraintChips}</div>
          </div>` : ''}
      </div>

      ${/* This was a bulleted list of bare course names, and it was the
            thinnest section on the page while holding the most useful data
            Njia has. "Diploma in Counselling Psychology" tells a parent or a
            bursary officer nothing they can act on: not where it is taught,
            not what it costs, not whether the learner's grade clears the bar.
            All of that is already in the catalogue.

            A table, because these are four facts about each of several rows
            and a reader needs to compare them down a column. Entry grade
            carries an explicit tick or cross against the learner's own grade —
            eligibility is the first question anyone asks of a shortlist, and
            making the reader compute it from two numbers is a poor use of the
            one page. Unpriced records say so rather than showing a blank cell
            that reads as free. */''}
      ${reportCourses.length ? `
        <div class="report-courses">
          <span class="report-section-title">${savedCourses.length ? 'Courses You Are Considering' : 'Courses Open To You'}</span>
          ${savedCourses.length ? '' : `<p class="report-legend">Njia has not been told what you have chosen yet, so these are the ${suggested.length} closest matches in the catalogue for ${escapeHtml(CLUSTERS[results.primary]?.name || 'your result')}${constraints.grade ? ` that ${/^[AE]/.test(constraints.grade) ? 'an' : 'a'} ${escapeHtml(constraints.grade)} can enter` : ''} — most open first.${/* Say the mix out loud. A reader who set a county filter and then reads a
                list containing other counties needs to know that was a decision and
                not an oversight; a reader whose county genuinely has nothing needs
                to know that too, because "nothing near me" is information they can
                act on and a silently national list is not. */
              homeCounty
                ? (nearbyShown === suggested.length
                    ? ` All ${suggested.length} are in ${escapeHtml(homeCounty)}.`
                    : nearbyShown
                      ? ` ${nearbyShown} ${nearbyShown === 1 ? 'is' : 'are'} in ${escapeHtml(homeCounty)}; the rest are elsewhere in Kenya.`
                      : ` Njia lists none of these in ${escapeHtml(homeCounty)}, so all are elsewhere in Kenya.`)
                : ''} They are a starting point, not a shortlist.</p>`}
          <table class="report-table">
            <thead>
              <tr><th>Course</th><th>Institution</th><th class="ra">Tuition</th><th class="ra">Entry</th></tr>
            </thead>
            <tbody>
              ${reportCourses.map((c) => {
                const inst = INSTITUTIONS.find((i) => i.id === c.institution_id);
                const fee = c.total_fees_kes === null || c.total_fees_kes === undefined
                  ? 'Not published'
                  : `Ksh ${c.total_fees_kes.toLocaleString('en-KE')}`;
                // meetsGradeRequirement lives in decide.js. Guarded so the
                // report still renders if it is ever built before that module.
                const known = constraints.grade && typeof meetsGradeRequirement === 'function';
                const eligible = known ? meetsGradeRequirement(constraints.grade, c.min_grade) : null;
                const gradeCell = !c.min_grade
                  ? 'Open'
                  : `${escapeHtml(c.min_grade)}${eligible === null ? '' : eligible ? ' ✓' : ' ✕'}`;
                return `<tr>
                  <td>${escapeHtml(c.name)}</td>
                  ${/* County in its own span rather than concatenated with a
                        separator, so narrow screens can drop it to a second
                        line instead of wrapping the institution name mid-word.
                        Two elements, one cell — the table keeps its semantics. */''}
                  <td>${inst ? `${escapeHtml(inst.name)}${inst.county ? `<span class="report-inst-county">${escapeHtml(inst.county)}</span>` : ''}` : '—'}</td>
                  <td class="ra">${escapeHtml(fee)}</td>
                  <td class="ra${eligible === false ? ' report-ineligible' : ''}">${gradeCell}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          ${constraints.grade ? `<p class="report-legend">Entry column compares each course's minimum grade against your ${escapeHtml(constraints.grade)}. ✓ you meet it, ✕ you do not — a course you do not yet qualify for is still listed, because grades can be improved and requirements change.</p>` : ''}
        </div>` : ''}

      ${/* The card reported goals and silently omitted applications, which are
            a first-class object in Track and the more concrete of the two — an
            application in flight is the thing a parent, school or bursary
            office actually wants to see on a career report. The line also used
            to sit bare under the course list with no heading, reading as an
            orphaned fourth bullet. Both halves are reported here, under a
            title, and only when there is something to report. */''}
      ${progressLines.length ? `
        <div class="report-progress">
          <span class="report-section-title">Progress So Far</span>
          <p class="report-progress-line">${progressLines.join(' · ')}</p>
        </div>` : ''}

      <div class="report-footer">
        <p>Built with <strong>Njia</strong> — a free, evidence-based career pathway diagnostic for Kenyan youth.</p>
        <p class="report-url">njiacareerpathways.work</p>
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

/* The address every share carries: WhatsApp, the native share sheet, the
 * clipboard, and the footer of every printed report. This was the .netlify.app
 * deploy subdomain, which meant the product's whole growth loop — a learner
 * sending their result to a friend or showing a printout to a parent — pointed
 * at the deploy target rather than the domain being promoted. WhatsApp is the
 * channel that matters most for this audience, so it was also the costliest
 * place to have it wrong. */
const NJIA_SITE_URL = 'https://njiacareerpathways.work/';

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
  recordMilestone('report-downloaded');
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
