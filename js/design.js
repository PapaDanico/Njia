/* Njia — design.js — MODULE 2: The Life & Career Studio
 * Odyssey Plan Builder, Life Portfolio Visualiser, Prototype Planner,
 * Gravity Problem Reframer. Depends on: js/app.js, data/questions.js (CLUSTERS)
 */

let designActiveTab = 'odyssey';

const ODYSSEY_TEMPLATE = [
  { id: 'life1', label: 'Life One', subtitle: "The path you're already on or considering", color: '#1ca0d0' },
  { id: 'life2', label: 'Life Two', subtitle: "What you'd do if Life One disappeared", color: '#6fae48' },
  { id: 'life3', label: 'Life Three', subtitle: 'What you\'d do if money or image were no object', color: '#ed8b2d' }
];

const PROTOTYPE_SUGGESTIONS = {
  carer: {
    conversations: ['Speak to a practicing counsellor or nurse about a typical week', 'Ask a social worker what they wish they knew before training'],
    experiences: ['Shadow a community health worker for a day', 'Volunteer at a clinic, school or NGO for a weekend']
  },
  creator: {
    conversations: ['Message a working designer or journalist about their portfolio', 'Ask a filmmaker how they got their first paid gig'],
    experiences: ['Complete one short online design or writing course', 'Build one small personal project this month']
  },
  business: {
    conversations: ['Interview a small business owner about their first year', 'Ask a salesperson what makes them exceed targets'],
    experiences: ['Run a one-week micro-hustle (selling, reselling, a service)', 'Attend a local business/entrepreneurship meetup']
  },
  tech: {
    conversations: ['Talk to a junior developer about their learning path', 'Ask an IT support technician what certifications actually mattered'],
    experiences: ['Complete one free coding or IT fundamentals course', 'Fix or set up a small tech project for someone you know']
  },
  people: {
    conversations: ['Ask an HR officer what skills they look for in juniors', 'Talk to a project coordinator about a typical project lifecycle'],
    experiences: ['Lead or co-organise one event, however small', 'Volunteer to coordinate a group project or church/community activity']
  },
  numbers: {
    conversations: ['Ask an accountant about the KASNEB/CPA pathway', 'Talk to a bank officer about entry-level requirements'],
    experiences: ['Build a simple personal budget or business ledger', 'Complete a free intro course in bookkeeping or Excel']
  },
  general: {
    conversations: ['Talk to two people in careers you\'re considering', 'Ask someone doing what you might want: "What surprised you?"'],
    experiences: ['Attend one open day at an institution you\'re considering', 'Shadow someone at work for half a day']
  }
};

function renderDesignPage() {
  const el = document.getElementById('page-design');
  if (!el) return;

  el.innerHTML = `
    <h1 class="mb-1">Design</h1>
    <p class="text-secondary mb-2">Design multiple viable futures, not just one — a life-design approach built for exploring options before committing.</p>
    <div class="odyssey-tabs" role="tablist">
      ${[['odyssey', '🗺️ Odyssey'], ['portfolio', '⚖️ Portfolio'], ['prototype', '✅ Prototype'], ['gravity', '🪨 Gravity']].map(([key, label]) => `
        <button type="button" class="odyssey-tab ${designActiveTab === key ? 'active' : ''}" role="tab" onclick="setDesignTab('${key}')">${label}</button>
      `).join('')}
    </div>
    <div id="design-tab-content"></div>
  `;

  renderDesignTabContent();
}

function setDesignTab(tab) {
  designActiveTab = tab;
  renderDesignPage();
}

function renderDesignTabContent() {
  const container = document.getElementById('design-tab-content');
  if (!container) return;
  if (designActiveTab === 'odyssey') renderOdysseyTab(container);
  else if (designActiveTab === 'portfolio') renderPortfolioTab(container);
  else if (designActiveTab === 'prototype') renderPrototypeTab(container);
  else if (designActiveTab === 'gravity') renderGravityTab(container);
  replayFadeIn(container);
}

/* ---------- Odyssey Plan Builder ---------- */
function ensureOdysseyPlans() {
  if (AppState.odysseyPlans.length === 0) {
    AppState.odysseyPlans = ODYSSEY_TEMPLATE.map((t) => ({
      ...t, years: ['', '', '', '', '']
    }));
    saveState();
  }
}

function renderOdysseyTab(container) {
  ensureOdysseyPlans();
  container.innerHTML = AppState.odysseyPlans.map((plan) => `
    <div class="card">
      <span class="caption" style="color:${plan.color}">${plan.label}</span>
      <h3 class="mb-1">${escapeHtml(plan.subtitle)}</h3>
      ${plan.years.map((val, i) => `
        <div class="odyssey-year-row">
          <div class="odyssey-year-badge">Y${i + 1}</div>
          <input type="text" value="${escapeHtml(val)}" placeholder="What are you doing in year ${i + 1}?"
            onchange="updateOdysseyYear('${plan.id}', ${i}, this.value)" aria-label="${plan.label} year ${i + 1}">
        </div>
      `).join('')}
    </div>
  `).join('') + `<p class="text-muted text-sm">Changes save automatically as you type.</p>`;
}

function updateOdysseyYear(planId, yearIndex, value) {
  const plan = AppState.odysseyPlans.find((p) => p.id === planId);
  if (!plan) return;
  plan.years[yearIndex] = value;
  saveState();
}

/* ---------- Life Portfolio Visualiser ---------- */
const PORTFOLIO_GAUGES = [
  { key: 'health', label: 'Health', icon: '💪', color: '#6fae48' },
  { key: 'work', label: 'Work', icon: '💼', color: '#1ca0d0' },
  { key: 'play', label: 'Play', icon: '🎮', color: '#ed8b2d' },
  { key: 'love', label: 'Love', icon: '❤️', color: '#ec4899' }
];

function renderPortfolioTab(container) {
  container.innerHTML = `
    <div class="card">
      <p class="text-secondary text-sm mb-2">Drag each slider to reflect how much time and energy that area of your life gets <em>right now</em> — not how you wish it were.</p>
      ${PORTFOLIO_GAUGES.map((g) => `
        <div class="portfolio-gauge">
          <div class="gauge-label"><span>${g.icon} ${g.label}</span><span id="gauge-val-${g.key}">${AppState.portfolio[g.key]}%</span></div>
          <input type="range" min="0" max="100" value="${AppState.portfolio[g.key]}" style="accent-color:${g.color}"
            oninput="updatePortfolioGauge('${g.key}', this.value)" aria-label="${g.label} level">
        </div>
      `).join('')}
    </div>
    <div class="card">
      <h3 class="mb-1">Reading your portfolio</h3>
      <p class="text-secondary text-sm">${portfolioInsight()}</p>
    </div>
  `;
}

function updatePortfolioGauge(key, value) {
  AppState.portfolio[key] = Number(value);
  const label = document.getElementById(`gauge-val-${key}`);
  if (label) label.textContent = `${value}%`;
  saveState();
}

function portfolioInsight() {
  const { health, work, play, love } = AppState.portfolio;
  const entries = [['Health', health], ['Work', work], ['Play', play], ['Love', love]];
  const lowest = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const highest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  if (highest[1] - lowest[1] < 15) return 'Your portfolio looks fairly balanced right now.';
  return `${highest[0]} is currently dominating your time (${highest[1]}%), while ${lowest[0]} is getting the least (${lowest[1]}%). As you explore paths in Discover and Decide, consider what a healthier balance would look like in your Odyssey Plans.`;
}

/* ---------- Prototype Planner ---------- */
function getSuggestedCluster() {
  const results = AppState.questionnaire.results;
  return results ? results.primary : 'general';
}

function ensurePrototypeChecklist() {
  const cluster = getSuggestedCluster();
  const suggestions = PROTOTYPE_SUGGESTIONS[cluster] || PROTOTYPE_SUGGESTIONS.general;
  const existingTexts = new Set(AppState.prototypeChecklist.map((i) => i.text));
  const toAdd = [];
  suggestions.conversations.forEach((text) => {
    if (!existingTexts.has(text)) toAdd.push({ id: uid('proto'), type: 'conversation', text, done: false });
  });
  suggestions.experiences.forEach((text) => {
    if (!existingTexts.has(text)) toAdd.push({ id: uid('proto'), type: 'experience', text, done: false });
  });
  if (toAdd.length) {
    AppState.prototypeChecklist = [...AppState.prototypeChecklist, ...toAdd];
    saveState();
  }
}

function renderPrototypeTab(container) {
  ensurePrototypeChecklist();
  const conversations = AppState.prototypeChecklist.filter((i) => i.type === 'conversation');
  const experiences = AppState.prototypeChecklist.filter((i) => i.type === 'experience');

  const renderList = (items) => items.map((item) => `
    <div class="check-item ${item.done ? 'done' : ''}">
      <input type="checkbox" id="chk-${item.id}" ${item.done ? 'checked' : ''} onchange="togglePrototypeItem('${item.id}')">
      <label for="chk-${item.id}">${escapeHtml(item.text)}</label>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="card">
      <h3 class="mb-1">💬 Prototype Conversations</h3>
      <p class="text-muted text-sm mb-2">Before committing years and money, talk to people already doing it.</p>
      ${renderList(conversations)}
    </div>
    <div class="card">
      <h3 class="mb-1">🔬 Prototype Experiences</h3>
      <p class="text-muted text-sm mb-2">Short, low-risk tastes of the work itself.</p>
      ${renderList(experiences)}
    </div>
  `;
}

function togglePrototypeItem(id) {
  const item = AppState.prototypeChecklist.find((i) => i.id === id);
  if (!item) return;
  item.done = !item.done;
  saveState();
  renderPrototypeTab(document.getElementById('design-tab-content'));
}

/* ---------- Gravity Problem Reframer ---------- */
function renderGravityTab(container) {
  container.innerHTML = `
    <div class="card">
      <h3 class="mb-1">🪨 Name a Gravity Problem</h3>
      <p class="text-muted text-sm mb-2">A gravity problem is a real constraint you can't solve directly (e.g. "I can't afford a 4-year degree right now"). Name it, then reframe your energy toward what you <em>can</em> design around.</p>
      <label class="caption" for="gravity-problem">The constraint</label>
      <textarea class="q-input mt-1" id="gravity-problem" placeholder="e.g. I cannot afford a 4-year degree right now"></textarea>
      <label class="caption mt-2" for="gravity-reframe" style="display:block">Your reframe (a certificate-to-diploma ladder? evening classes? work-study?)</label>
      <textarea class="q-input mt-1" id="gravity-reframe" placeholder="e.g. Start with a KMTC certificate, work part-time, upgrade to the diploma in year 2"></textarea>
      <button type="button" class="btn btn-primary mt-2" onclick="addGravityProblem()">Save Reframe</button>
    </div>
    <div id="gravity-list">
      ${AppState.gravityProblems.length === 0
        ? emptyState('🪨', 'No gravity problems yet', 'Once you name a constraint and its reframe, it will appear here.', null, null)
        : AppState.gravityProblems.map((g) => `
          <div class="card">
            <span class="caption">Constraint</span>
            <p class="mb-2">${escapeHtml(g.problem)}</p>
            <span class="caption">Reframe</span>
            <p class="text-secondary">${escapeHtml(g.reframe)}</p>
            <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="deleteGravityProblem('${g.id}')">Remove</button>
          </div>
        `).join('')
      }
    </div>
  `;
}

function addGravityProblem() {
  const problem = document.getElementById('gravity-problem')?.value.trim();
  const reframe = document.getElementById('gravity-reframe')?.value.trim();
  if (!problem || !reframe) {
    showToast('Fill in both the constraint and your reframe.', 'error');
    return;
  }
  AppState.gravityProblems.push({ id: uid('gravity'), problem, reframe, createdAt: new Date().toISOString() });
  saveState();
  showToast('Reframe saved.', 'success');
  renderGravityTab(document.getElementById('design-tab-content'));
}

function deleteGravityProblem(id) {
  AppState.gravityProblems = AppState.gravityProblems.filter((g) => g.id !== id);
  saveState();
  renderGravityTab(document.getElementById('design-tab-content'));
}
