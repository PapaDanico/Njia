/* Njia — app.js
 * Global state, routing, persistence, and shared UI utilities.
 * Loaded first; every other js/*.js file relies on `AppState` and the
 * helpers here (`Njia.*`) existing on the page already.
 */

const STORAGE_KEY = 'njia_state_v1';

const defaultState = () => ({
  currentPage: 'home',
  user: null,
  questionnaire: { answers: {}, completed: false, results: null },
  odysseyPlans: [],
  portfolio: { health: 50, work: 50, play: 50, love: 50 },
  prototypeChecklist: [],
  gravityProblems: [],
  savedCourses: [],
  applications: [],
  okrs: [],
  mentors: [],
  decideFilters: { activeTab: 'courses', cluster: 'all', grade: null, budgetMax: null, mode: 'any' }
});

let AppState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (err) {
    console.warn('Njia: could not read saved state, starting fresh.', err);
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (err) {
    console.error('Njia: could not persist state (storage full or unavailable).', err);
    showToast('Could not save — device storage may be full.', 'error');
  }
}

function resetState() {
  AppState = defaultState();
  saveState();
}

/* ---------- Routing ---------- */
const PAGES = ['home', 'discover', 'design', 'decide', 'connect', 'track'];

function navigateTo(pageId) {
  if (!PAGES.includes(pageId)) return;
  AppState.currentPage = pageId;
  saveState();
  renderRoute();
}

function renderRoute() {
  PAGES.forEach((id) => {
    const el = document.getElementById(`page-${id}`);
    if (!el) return;
    el.classList.toggle('active', id === AppState.currentPage);
  });
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === AppState.currentPage);
  });
  window.scrollTo(0, 0);

  const renderers = {
    home: renderHomePage,
    discover: window.renderDiscoverPage,
    design: window.renderDesignPage,
    decide: window.renderDecidePage,
    connect: window.renderConnectPage,
    track: window.renderTrackPage
  };
  const renderFn = renderers[AppState.currentPage];
  if (typeof renderFn === 'function') renderFn();
}

/* ---------- Toast ---------- */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ---------- Modal ---------- */
function openModal(contentHtml) {
  const overlay = document.getElementById('modal-overlay');
  const sheet = document.getElementById('modal-sheet-content');
  if (!overlay || !sheet) return;
  sheet.innerHTML = contentHtml;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

/* ---------- Shared utilities ---------- */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatKes(amount) {
  if (amount == null) return 'N/A';
  return `Ksh ${Number(amount).toLocaleString('en-KE')}`;
}

function formatPercent(fraction) {
  if (fraction == null) return 'N/A';
  return `${Math.round(fraction * 100)}%`;
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyState(icon, title, description, ctaLabel, ctaOnClick) {
  return `
    <div class="empty-state">
      <div class="icon" aria-hidden="true">${icon}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${ctaLabel ? `<button class="btn btn-primary" style="width:auto;display:inline-flex" onclick="${ctaOnClick}">${escapeHtml(ctaLabel)}</button>` : ''}
    </div>`;
}

/* ---------- Home page — the landing page. This does the selling; the
 * footer at the bottom carries secondary info (legal, sources, contact).
 * See css/styles.css "LANDING PAGE" block for the scoped light theme. */

const LANDING_EVIDENCE = [
  {
    num: '993,226', label: 'KCSE candidates, 2025',
    body: 'Nearly a million Kenyan youth face the exact same fork in the road every single year — most without a data-driven way to choose.',
    source: 'Source: KUCCPS / Ministry of Education, reported July 2026.'
  },
  {
    num: '~30%', label: 'placed via KUCCPS, 2025/26 cycle',
    body: '293,869 of 993,226 candidates secured a university or college place through the formal placement system — the rest navigate TVET, certificates, or gap years with far less structured guidance.',
    source: 'Source: KUCCPS 2025/26 placement results, July 2026.'
  },
  {
    num: '15.25%', label: 'youth unemployment (ages 15–24), 2025',
    body: 'A mismatched or unresearched course choice does not just cost fees — it compounds an already difficult youth labour market.',
    source: 'Source: World Bank, modeled ILO estimate (via Statista), 2025.'
  },
  {
    num: '8,915', label: 'degree-qualifiers who chose TVET instead',
    body: 'Out of 202,133+ candidates who qualified for a degree programme, only a small fraction chose a shorter, often cheaper TVET pathway — a visible sign of prestige bias over fit.',
    source: 'Source: KUCCPS 2025 placement announcement, Ministry of Education, July 2026.'
  }
];

const LANDING_PROCESS = [
  { page: 'discover', title: 'Discover your cluster', body: 'A 20-minute adaptive diagnostic across Identity, Community, Necessity and Horizon — the same Four Elements framework Harvard Business School uses with executives.' },
  { page: 'design', title: 'Design three futures', body: "Stanford's Odyssey Plan method: sketch the path you're already on, the one you'd choose if it disappeared, and the one you'd choose if money were no object." },
  { page: 'decide', title: 'Decide with evidence', body: 'Match your profile against real course fees, grade requirements, and funding sources — filtered by your actual budget and timeline, not a wish list.' },
  { page: 'connect', title: 'Connect with real people', body: "No algorithm replaces a conversation. Generate an outreach message and go talk to someone already doing the work." },
  { page: 'track', title: 'Track your follow-through', body: 'Turn the plan into quarterly OKRs and a step-by-step application tracker, so the diagnostic becomes a decision, not just an insight.' }
];

function renderHomePage() {
  const el = document.getElementById('page-home');
  if (!el) return;
  const completed = AppState.questionnaire.completed;
  const primaryCluster = AppState.questionnaire.results?.primary;

  el.innerHTML = `
    <div class="landing">

      <section class="landing-hero">
        <span class="landing-eyebrow">STANFORD · HARVARD · REAL KENYAN DATA</span>
        <h1 class="landing-h1">Career clarity shouldn't cost what <span class="hl-gold">Stanford charges.</span></h1>
        <p class="landing-sub">Njia turns Stanford's Life Design method, HBR's life-strategy framework and Harvard Business School's career-vision model into a free diagnostic — matched against real Kenyan course fees, grade cut-offs and funding sources.</p>
        <div class="landing-cta-row">
          <button class="btn btn-gold" onclick="navigateTo('discover')">${completed ? 'Revisit Your Discovery' : "Start Your Discovery — it's free"} →</button>
          <button class="btn btn-outline-dark" onclick="scrollToLanding('landing-process')">See how it works</button>
        </div>
        <div class="landing-trust-row">
          <span class="landing-trust-item">🔒 Stays on your device</span>
          <span class="landing-trust-item">🆓 Free, no signup</span>
          <span class="landing-trust-item">⏱️ About 20 minutes</span>
        </div>
        ${completed ? `<p class="text-sm mt-2" style="color:var(--landing-ink-muted)">You're matched as <strong style="color:var(--landing-ink)">${CLUSTERS[primaryCluster].name}</strong>. <a href="#" onclick="navigateTo('discover');return false" style="color:var(--primary-dark);font-weight:600">Jump back into Discover →</a></p>` : ''}
      </section>

      <section class="landing-dark landing-block-tight">
        <div class="landing-stats-grid">
          ${LANDING_EVIDENCE.map((s) => `
            <div>
              <div class="landing-stat-num">${s.num}</div>
              <div class="landing-stat-label">${escapeHtml(s.label)}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="landing-block">
        <span class="landing-eyebrow">THE GAP NJIA CLOSES</span>
        <h2 class="landing-h2">What the data actually says about Kenyan youth and career choice</h2>
        <p class="landing-h2-sub">Every number below is cited — not a vibe. This is the evidence base the questionnaire and course matcher are built on.</p>
        <div class="landing-evidence-grid">
          ${LANDING_EVIDENCE.map((s) => `
            <div class="landing-evidence-card">
              <div class="landing-evidence-num">${s.num}</div>
              <h3>${escapeHtml(s.label)}</h3>
              <p>${escapeHtml(s.body)}</p>
              <div class="landing-source">${escapeHtml(s.source)}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="landing-quote-section">
        <p class="landing-quote">Most Kenyan youth aren't uninformed — they're <span class="hl-gold">unmatched.</span> The data exists. The pathway was never personalised.</p>
        <p class="landing-quote-caption">That gap — between available data and personal decisions — is what every module in Njia is built to close.</p>
      </section>

      <section class="landing-block" id="landing-process">
        <span class="landing-eyebrow">THE NJIA METHOD</span>
        <h2 class="landing-h2">Five steps from confusion to a funded plan</h2>
        <p class="landing-h2-sub">Each step is a full module in the app — open any of them directly.</p>
        <div class="landing-process-list">
          ${LANDING_PROCESS.map((p, i) => `
            <div class="landing-process-card">
              <div class="landing-process-num">${i + 1}</div>
              <div>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.body)}</p>
                <a href="#" class="landing-link" onclick="navigateTo('${p.page}');return false">Open ${p.page[0].toUpperCase()}${p.page.slice(1)} →</a>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="landing-block">
        <span class="landing-eyebrow">A WORKED EXAMPLE</span>
        <h2 class="landing-h2">What a complete pathway looks like</h2>
        <p class="landing-h2-sub">This is an illustrative walkthrough, not a real user or testimonial — Njia is newly built and has no user outcomes to report yet.</p>
        <div class="landing-example-card">
          <span class="landing-example-tag">Hypothetical · "Shakinah"</span>
          <ol>
            <li>Completes the diagnostic in 20 minutes on her phone; scores as a primary <strong>People Leader</strong> with strong <strong>Carer</strong> signals.</li>
            <li>The Odyssey Plan Builder sketches three futures: a Counselling Psychology diploma, a Community Health certificate that ladders into nursing, and — if money were no object — a psychology degree abroad.</li>
            <li>The Course Matcher surfaces diplomas she qualifies for within her stated budget, each showing fees, grade requirements and illustrative employment outcomes.</li>
            <li>The Funding Finder surfaces HELB and county bursary options matching her eligibility.</li>
            <li>She generates two informational-interview messages and tracks her application as quarterly OKRs.</li>
          </ol>
        </div>
      </section>

      <section class="landing-dark landing-final-cta">
        <h2 class="landing-h2">Start with clarity. It's free.</h2>
        <p class="landing-sub">Your answers never leave your device. No account, no cost, about 20 minutes.</p>
        <button class="btn btn-gold" style="width:auto;display:inline-flex;margin-top:0.5rem" onclick="navigateTo('discover')">${completed ? 'Revisit Your Discovery' : 'Start Your Discovery'} →</button>
        <div class="landing-guarantee-box">
          <span aria-hidden="true">🔒</span>
          <span><strong>Privacy guarantee.</strong> Everything you enter — questionnaire answers, plans, saved courses — stays in this browser's local storage. Nothing is sent to a server. Use "Clear My Data" (header lock icon) any time, especially on a shared device.</span>
        </div>
      </section>

      <footer class="landing-footer">
        <div class="landing-footer-grid">
          <div class="landing-footer-brand">
            <div class="flex items-center gap-1"><span class="logo-mark" aria-hidden="true"></span><strong style="color:#f8fafc">Njia</strong></div>
            <p>Data-driven career pathway guidance for Kenyan youth, built on Stanford, HBR and HBS research.</p>
          </div>
          <div class="landing-footer-col">
            <h4>Modules</h4>
            ${LANDING_PROCESS.map((p) => `<button onclick="navigateTo('${p.page}')">${p.title}</button>`).join('')}
          </div>
          <div class="landing-footer-col">
            <h4>Resources &amp; Legal</h4>
            <button onclick="openPrivacyModal()">Privacy &amp; your data</button>
            <button onclick="openMethodologyModal()">Methodology &amp; data sources</button>
            <a href="https://tveta.go.ke" target="_blank" rel="noopener noreferrer">TVETA registry ↗</a>
            <a href="https://helb.co.ke" target="_blank" rel="noopener noreferrer">HELB ↗</a>
          </div>
        </div>
        <p class="landing-footer-sources">Sources: KUCCPS 2025/26 placement results · Ministry of Education (July 2026) · World Bank modeled ILO youth unemployment estimate, 2025. Course, fee and funding data inside the app is illustrative pending verification — see Methodology.</p>
        <div class="landing-footer-bottom">
          <div><a href="#" onclick="openPrivacyModal();return false">Privacy</a><a href="#" onclick="openMethodologyModal();return false">Methodology</a></div>
          <span>© 2026 Njia · A free, open pathway for Kenyan youth.</span>
        </div>
      </footer>
    </div>
  `;
}

function scrollToLanding(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

  renderRoute();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateAvailableToast(registration);
          }
        });
      });
    }).catch((err) => {
      console.warn('Njia: Service Worker registration failed.', err);
    });

    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
  }
});

function showUpdateAvailableToast(registration) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast info';
  toast.innerHTML = `
    <span aria-hidden="true">⬆️</span>
    <span>A new version of Njia is ready.</span>
    <button class="btn btn-ghost btn-sm" style="width:auto;padding:0.3rem 0.7rem">Reload</button>
  `;
  const reloadBtn = toast.querySelector('button');
  reloadBtn.onclick = () => registration.waiting?.postMessage('skipWaiting');
  container.appendChild(toast);
}
