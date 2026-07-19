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

/* ---------- Home page ---------- */
const FEATURES = [
  { page: 'discover', icon: '🧭', title: 'Discover', desc: 'Find your career cluster' },
  { page: 'design', icon: '🎨', title: 'Design', desc: 'Build your Odyssey Plan' },
  { page: 'decide', icon: '📊', title: 'Decide', desc: 'Match courses & funding' },
  { page: 'connect', icon: '🤝', title: 'Connect', desc: 'Mentors & community' },
  { page: 'track', icon: '📈', title: 'Track', desc: 'OKRs & applications' },
  { page: 'decide', icon: '💰', title: 'Funding', desc: 'HELB, bursaries & more' }
];

function renderHomePage() {
  const el = document.getElementById('page-home');
  if (!el) return;
  const completed = AppState.questionnaire.completed;
  const savedCount = AppState.savedCourses.length;
  const okrCount = AppState.okrs.length;

  el.innerHTML = `
    <section class="hero">
      <div class="logo-mark-lg" aria-hidden="true"></div>
      <h1>Njia</h1>
      <p>Data-driven career pathway guidance for Kenyan youth — built on Stanford, HBR and HBS research, grounded in Kenyan institutional data.</p>
      ${!completed ? `<button class="btn btn-primary mt-3" style="max-width:280px;margin:1rem auto 0" onclick="navigateTo('discover')">Start Your Discovery →</button>` : ''}
    </section>

    <div class="stats-row">
      <div class="stat"><div class="value">${completed ? '✓' : '–'}</div><div class="label">Discovery</div></div>
      <div class="stat"><div class="value">${savedCount}</div><div class="label">Saved Courses</div></div>
      <div class="stat"><div class="value">${okrCount}</div><div class="label">Active OKRs</div></div>
    </div>

    <h2 class="mb-2">Explore Njia</h2>
    <div class="feature-grid">
      ${FEATURES.map((f) => `
        <button class="feature-card card-tap" onclick="navigateTo('${f.page}')">
          <span class="icon" aria-hidden="true">${f.icon}</span>
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
        </button>
      `).join('')}
    </div>
  `;
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
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Njia: Service Worker registration failed.', err);
    });
  }
});
