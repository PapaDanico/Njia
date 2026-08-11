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
  decideFilters: { activeTab: 'courses', cluster: 'all', grade: null, budgetMax: null, mode: 'any', county: 'all', level: 'all', savedOnly: false, sortBy: 'match', visibleCount: 24 },
  // View-only UI state for Track and Design — kept separate from
  // decideFilters (Decide-module-scoped) so clearDecideFilters() can't
  // accidentally drop or corrupt unrelated modules' selections. Also holds
  // each module's active sub-tab, so — like Decide's own activeTab — it
  // survives navigating away and back instead of resetting to the first tab.
  viewFilters: { okrStatus: 'all', okrSort: 'recent', appStatus: 'all', appSort: 'recent', prototypeCluster: null, designActiveTab: 'odyssey', trackActiveTab: 'okrs', helpTab: 'faq' }
});

// Nested containers whose individual keys should survive a schema change —
// a plain Object.assign(defaults, parsed) replaces these wholesale, so a
// returning user's saved (older-shape) object silently drops any key added
// to defaultState() since they last saved, with no error and no obvious
// symptom beyond that one feature quietly misbehaving. Merge each one key-
// by-key instead, so `defaultState()` stays the single source of truth for
// backfilling new fields.
//
// Declared before the AppState = loadState() call below, on purpose: `const`
// bindings aren't initialized until execution reaches them, so referencing
// this from inside loadState() before this line had run would throw
// (loadState is a hoisted function declaration, but its call at module load
// happens top-to-bottom same as any other statement).
const MERGED_STATE_CONTAINERS = ['questionnaire', 'portfolio', 'decideFilters', 'viewFilters'];

let AppState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const defaults = defaultState();
    const merged = Object.assign(defaults, parsed);
    MERGED_STATE_CONTAINERS.forEach((key) => {
      if (parsed[key] && typeof parsed[key] === 'object') {
        merged[key] = Object.assign(defaultState()[key], parsed[key]);
      }
    });
    return normalizeState(merged);
  } catch (err) {
    console.warn('Njia: could not read saved state, starting fresh.', err);
    return defaultState();
  }
}

/* Repair the shape of a loaded state before any module renders from it.
 *
 * Njia is an installed PWA that updates itself in place, so a returning user
 * can arrive carrying state written by an older version whose collections had
 * a different shape — and a renderer that does `app.steps.every(...)` on an
 * entry saved before `steps` existed throws, leaving that module a blank page
 * with no way back except clearing site data (which silently destroys
 * everything else they saved). Persisted state is untrusted input; validate it
 * once, here, rather than guarding every read site forever.
 *
 * Repair beats discard: an entry missing a field gets the field back and keeps
 * the user's work. Only entries too malformed to identify are dropped.
 *
 * The three helpers below are function declarations, not `const` arrows, on purpose:
 * loadState() runs at module load (line ~45), which is *above* this point in
 * source order. `const` bindings sit in the temporal dead zone until execution
 * reaches them, so arrow versions would throw ReferenceError inside
 * normalizeState — and loadState's own catch would swallow it and hand back
 * defaultState(), silently wiping the user's saved work on every single load.
 */
function asArray(value) { return Array.isArray(value) ? value : []; }
function asObjects(value) { return asArray(value).filter((entry) => entry && typeof entry === 'object'); }
function asStrings(value) { return asArray(value).filter((entry) => typeof entry === 'string'); }

function normalizeState(state) {
  state.savedCourses = asStrings(state.savedCourses);
  state.gravityProblems = asObjects(state.gravityProblems);
  state.prototypeChecklist = asObjects(state.prototypeChecklist);
  state.mentors = asObjects(state.mentors);

  state.applications = asObjects(state.applications).map((app) => ({
    ...app,
    steps: asObjects(app.steps).map((step) => ({ ...step, done: step.done === true }))
  }));

  state.okrs = asObjects(state.okrs).map((okr) => ({
    ...okr,
    keyResults: asObjects(okr.keyResults).map((kr) => ({ ...kr, done: kr.done === true }))
  }));

  // A plan is identified by its template id; an unrecognised one can't be
  // rendered meaningfully, so it goes. `years` is padded, never truncated —
  // shortening it would delete something the user typed.
  state.odysseyPlans = asObjects(state.odysseyPlans)
    .filter((plan) => typeof plan.id === 'string')
    .map((plan) => {
      const years = asArray(plan.years).map((year) => (typeof year === 'string' ? year : ''));
      while (years.length < 5) years.push('');
      return { ...plan, years };
    });

  return state;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (err) {
    console.error('Njia: could not persist state (storage full or unavailable).', err);
    showToast('Could not save — device storage may be full.', 'error');
  }
  // Fired regardless of persistence success — in-memory state still changed,
  // so any future reactive view should still be able to re-render off it.
  document.dispatchEvent(new CustomEvent('njia-state-changed', { detail: { state: AppState } }));
}

function resetState() {
  AppState = defaultState();
  saveState();
}

/* ---------- Routing ---------- */
const PAGES = ['home', 'discover', 'design', 'decide', 'connect', 'track', 'help'];

function navigateTo(pageId) {
  if (!PAGES.includes(pageId)) return;
  AppState.currentPage = pageId;
  saveState();
  // focusHeading: true only for user-triggered navigation, not the initial
  // render — stealing focus on first load would be surprising, not helpful.
  renderRoute({ focusHeading: true });
}

const PAGE_LABELS = { home: '', discover: 'Discover', design: 'Design', decide: 'Decide', connect: 'Connect', track: 'Track', help: 'Help' };

// Nudge toward Track when there's saved-but-unstarted work — a subtle
// signal, not a notification count. Reactive to njia-state-changed too,
// so saving a course updates the badge without needing a page change.
function updateTrackBadge() {
  const needsAttention = AppState.savedCourses.length > 0 && AppState.applications.length === 0;
  document.querySelector('.nav-item[data-page="track"]')?.classList.toggle('has-badge', needsAttention);
}

// The header/mobile-menu CTA mirrors the hero CTA's completed-state
// wording — both live outside renderHomePage's innerHTML (header is
// static app-shell markup), so they need their own sync point.
function updateHeaderCta() {
  const text = AppState.questionnaire.completed ? 'Revisit Discovery' : 'Start Discovery';
  const headerBtn = document.getElementById('header-cta-btn');
  if (headerBtn) headerBtn.textContent = text;
  const mobileBtn = document.getElementById('mobile-menu-cta-btn');
  if (mobileBtn) mobileBtn.textContent = `${text} →`;
}

/* ---------- Header: grouped nav dropdowns + mobile menu ---------- */
function closeNavDropdowns() {
  document.querySelectorAll('.landing-nav-dropdown-menu.open').forEach((m) => m.classList.remove('open'));
  document.querySelectorAll('.landing-nav-dropdown-btn[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}

function toggleNavDropdown(btn) {
  const menu = btn.parentElement?.querySelector('.landing-nav-dropdown-menu');
  if (!menu) return;
  const wasOpen = menu.classList.contains('open');
  closeNavDropdowns();
  if (!wasOpen) {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// Kept as an alias — navigateTo() and the document click handler call it.
function closeModulesDropdown() { closeNavDropdowns(); }

/* Learn-menu links target landing sections; from a module page, go home
 * first and scroll once the landing has rendered. */
function goHomeAndScroll(id) {
  if (AppState.currentPage !== 'home') navigateTo('home');
  requestAnimationFrame(() => scrollToLanding(id));
}

/* The Application Clock CTA and funding links land directly on the
 * Decide module's Funding tab. */
function goToFundingTab() {
  AppState.decideFilters.activeTab = 'funding';
  navigateTo('decide');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  if (!menu || !toggle) return;
  const isOpen = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  if (!menu || !menu.classList.contains('open')) return;
  menu.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function navigateAndCloseMenu(page) {
  closeMobileMenu();
  navigateTo(page);
}

function scrollAndCloseMenu(id) {
  const wasOpen = document.getElementById('mobile-menu')?.classList.contains('open');
  closeMobileMenu();
  // Let the drawer's close transition (and the overflow:hidden release)
  // settle before scrolling, so the anchor lands where expected instead
  // of the mid-close layout shift throwing scrollIntoView off.
  if (wasOpen) setTimeout(() => scrollToLanding(id), 150);
  else scrollToLanding(id);
}

function renderRoute({ focusHeading = false } = {}) {
  PAGES.forEach((id) => {
    const el = document.getElementById(`page-${id}`);
    if (!el) return;
    el.classList.toggle('active', id === AppState.currentPage);
  });
  document.querySelectorAll('.nav-item').forEach((btn) => {
    const isActive = btn.dataset.page === AppState.currentPage;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  updateTrackBadge();
  updateHeaderCta();
  document.body.dataset.page = AppState.currentPage;
  closeMobileMenu();
  closeModulesDropdown();
  const label = document.getElementById('header-page-label');
  if (label) label.textContent = PAGE_LABELS[AppState.currentPage] ? `· ${PAGE_LABELS[AppState.currentPage]}` : '';
  window.scrollTo(0, 0);

  const renderers = {
    home: renderHomePage,
    discover: window.renderDiscoverPage,
    design: window.renderDesignPage,
    decide: window.renderDecidePage,
    connect: window.renderConnectPage,
    track: window.renderTrackPage,
    help: window.renderHelpPage
  };
  const renderFn = renderers[AppState.currentPage];
  if (typeof renderFn === 'function') renderFn();

  if (focusHeading) {
    const heading = document.getElementById(`page-${AppState.currentPage}`)?.querySelector('h1, h2');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}

/* ---------- Toast ---------- */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: 'check-circle', error: 'alert', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${icon(icons[type] || icons.info)}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ---------- Modal ---------- */
let modalPreviouslyFocused = null;

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((el) => el.offsetParent !== null);
}

function openModal(contentHtml) {
  const overlay = document.getElementById('modal-overlay');
  const sheet = document.getElementById('modal-sheet-content');
  const dialog = document.querySelector('.modal-sheet');
  if (!overlay || !sheet || !dialog) return;
  sheet.innerHTML = contentHtml;

  // Modal content is not consistently h3 — the comparison sheet leads with an
  // h2 — so looking for h3 alone silently dropped aria-labelledby and left the
  // dialog unnamed for screen readers. Take whichever heading comes first.
  const heading = sheet.querySelector('h1, h2, h3, h4');
  if (heading) {
    if (!heading.id) heading.id = uid('modal-h');
    dialog.setAttribute('aria-labelledby', heading.id);
  } else {
    dialog.removeAttribute('aria-labelledby');
  }

  modalPreviouslyFocused = document.activeElement;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  // Without this the page behind the sheet scrolls under the user's finger on
  // a phone, which reads as the modal having lost its place.
  document.body.classList.add('modal-open');

  const focusables = getFocusableElements(dialog);
  (focusables[0] || dialog).focus({ preventScroll: true });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (modalPreviouslyFocused && typeof modalPreviouslyFocused.focus === 'function') {
    modalPreviouslyFocused.focus({ preventScroll: true });
  }
  modalPreviouslyFocused = null;
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

function replayFadeIn(el) {
  if (!el) return;
  el.classList.remove('fade-in');
  void el.offsetWidth; // force reflow so the animation restarts on re-render
  el.classList.add('fade-in');
}

/* ---------- Theme ----------
 * data-theme is stamped pre-paint by the inline script in index.html;
 * this manager keeps the toggle button, meta theme-color and system-
 * preference changes in sync with it. */
const THEME_COLORS = { light: '#faf9f5', dark: '#16130f' };

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('njia-theme', next); } catch (e) { /* private mode */ }
  applyTheme(next);
}

function initTheme() {
  applyTheme(document.documentElement.dataset.theme || 'light');
  // Follow system changes only while the user hasn't made an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem('njia-theme'); } catch (err) { /* ignore */ }
    if (stored !== 'light' && stored !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
  });
}

/* Chrome icon from the sprite in index.html — see DESIGN.md: app chrome
 * uses stroke SVGs, emoji is reserved for content voice. */
function icon(name, cls = '') {
  return `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function emptyState(iconName, title, description, ctaLabel, ctaOnClick) {
  return `
    <div class="empty-state">
      <div class="icon-disc" aria-hidden="true">${icon(iconName)}</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(description)}</p>
      ${ctaLabel ? `<button type="button" class="btn btn-primary" style="width:auto;display:inline-flex" onclick="${ctaOnClick}">${escapeHtml(ctaLabel)}</button>` : ''}
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
    // The single most important number on this page. Middle-level colleges hold
    // capacity for 1,132,531 students; 293,869 were placed. The places are not
    // the scarce thing, which is the whole reason this platform exists — and
    // until this cycle's figures were sourced, Njia asserted that rather than
    // showing it.
    num: '1,132,531', label: 'middle-level places available · 293,869 filled',
    body: 'Middle-level colleges — diploma, certificate and artisan — have capacity for over 1.1 million students. Across every institution type, 293,869 candidates were placed. Roughly four in five places go unfilled while young people conclude there is nothing for them. The shortage is not of places. It is of a way to find them, price them, and pay for them.',
    source: 'Sources: KUCCPS 2025/26 placement reporting; middle-level capacity per KUCCPS, cross-reported August 2026.'
  },
  {
    // Deliberately shows the range, not one number. Kenyan youth unemployment
    // is reported anywhere from ~12% to ~67% purely on definition — age band,
    // and whether "unemployed" means the strict ILO test or the far broader
    // "not in adequate employment". A platform that picks the scariest figure
    // to make its own case is doing the thing Njia exists to correct.
    num: '15%–67%', label: 'youth unemployment, depending on what you count',
    body: 'The strict measure (ages 15–24, actively job-hunting) is about 15%. The fresh-graduate band, 20–29, runs near 32%. The broadest measure — ages 15–34 without adequate employment, including underemployment and informal work below skill level — reaches around 67%. All three are real; they answer different questions. Njia shows you which is which rather than picking the one that makes the strongest headline.',
    source: 'Sources: modelled ILO estimate, 2025; Kenyan labour force analysis; broad-measure reporting of KNBS data.'
  },
  {
    num: '8,915', label: 'degree-qualifiers who chose TVET instead',
    body: 'Of the candidates who qualified for a degree, only a small fraction chose a shorter, often cheaper TVET pathway. The assumption is that a degree pays better. Kenya has roughly 5,000 engineers and architects and fewer than 2,000 trained plumbers, painters and masons — and certified artisan day rates have tripled since 2012, to Ksh 2,500–3,000. Those are day rates for certified work, not salaries, and the work is often irregular. But the prestige ranking is not tracking the money.',
    source: 'Sources: KUCCPS 2025 placement announcement, Ministry of Education; KNBS construction labour index and construction-sector reporting, cross-reported August 2026.'
  }
];

const LANDING_PROCESS = [
  { page: 'discover', title: 'Discover your cluster', body: 'A 20-minute adaptive diagnostic across Identity, Community, Necessity and Horizon — a career-psychology model refined through decades of executive coaching research.' },
  { page: 'design', title: 'Design three futures', body: "A structured life-design technique: sketch the path you're already on, the one you'd choose if it disappeared, and the one you'd choose if money were no object." },
  { page: 'decide', title: 'Decide with evidence', body: 'Match your profile against real course fees, grade requirements, and funding sources — filtered by your actual budget and timeline, not a wish list.' },
  { page: 'connect', title: 'Connect with real people', body: "No algorithm replaces a conversation. Generate an outreach message and go talk to someone already doing the work." },
  { page: 'track', title: 'Track your follow-through', body: 'Turn the plan into quarterly OKRs and a step-by-step application tracker, so the diagnostic becomes a decision, not just an insight.' }
];

// Computed live from the bundled data files, not hardcoded — so this
// can't drift out of sync as courses/institutions/funding sources are
// added or removed. Mirrors the same verified-count logic Decide shows.
function renderNjiaNumbersCard() {
  const clusterCount = Object.keys(CLUSTERS).length;
  const countyCount = new Set(INSTITUTIONS.map((i) => i.county)).size;
  const verifiedCount = COURSES.filter((c) => c.fees_confidence === 'verified').length
    + FUNDING_SOURCES.filter((f) => f.data_confidence === 'verified').length;
  const totalRecords = COURSES.length + FUNDING_SOURCES.length;

  return `
    <div class="landing-numbers-card">
      <span class="landing-numbers-eyebrow">Njia in numbers</span>
      <h2 class="landing-numbers-title">What's actually in the app right now</h2>
      <div class="landing-numbers-grid">
        <div class="landing-numbers-item">
          <span class="landing-numbers-figure">${DISTINCT_PROGRAMMES}</span>
          <span class="landing-numbers-label">distinct programmes across ${clusterCount} career clusters, offered at ${COURSES.length} places you could apply</span>
        </div>
        <div class="landing-numbers-item">
          <span class="landing-numbers-figure">${INSTITUTIONS.length}</span>
          <span class="landing-numbers-label">institutions across ${countyCount} counties</span>
        </div>
        <div class="landing-numbers-item">
          <span class="landing-numbers-figure">${FUNDING_SOURCES.length}</span>
          <span class="landing-numbers-label">funding sources tracked</span>
        </div>
        <div class="landing-numbers-item">
          <span class="landing-numbers-figure">${verifiedCount}/${totalRecords}</span>
          <span class="landing-numbers-label">records with fees or terms cross-checked against a named source</span>
        </div>
      </div>
      <p class="landing-numbers-note">Computed from the dataset this app actually ships — not marketing copy. See Methodology for what "verified" means.</p>
    </div>
  `;
}

/* The Application Clock — Kanda's "Regulatory Clock" pattern powered by
 * Njia's verified funding records: real deadlines, sourced and dated. */
const LANDING_TOOLS = {
  find: [
    { page: 'discover', icon: 'compass', title: 'Discover', body: 'A 20-minute adaptive diagnostic across the Four Elements — with a signal-strength readout, not just a label.' },
    { page: 'design', icon: 'pen', title: 'Design', body: 'Sketch three five-year futures side by side, then name the constraints you can and cannot design around.' }
  ],
  make: [
    { page: 'decide', icon: 'chart', title: 'Decide', body: 'Courses and funding matched to your grades and budget — every match score explains itself.' },
    { page: 'connect', icon: 'users', title: 'Connect', body: 'Respectful outreach messages and a safety checklist for talking to people already doing the work.' },
    { page: 'track', icon: 'trend', title: 'Track', body: 'Quarterly OKRs and an application tracker, so the plan survives contact with the term calendar.' }
  ]
};

/* Placement windows that are actually open today, computed from dates rather
 * than written as prose — a hardcoded "applications close in May" quietly
 * becomes a lie in June. Sorted by urgency so the thing about to close leads.
 * Falls back to funding deadlines when no placement window is open. */
function openPlacementWindows(now = new Date()) {
  if (typeof PLACEMENT_CALENDAR === 'undefined') return [];
  const day = 24 * 60 * 60 * 1000;
  return PLACEMENT_CALENDAR
    .map((w) => ({ ...w, daysLeft: Math.ceil((new Date(w.closes + 'T23:59:59') - now) / day) }))
    .filter((w) => new Date(w.opens) <= now && w.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function renderApplicationClock() {
  const open = openPlacementWindows().slice(0, 3);
  const rows = FUNDING_SOURCES
    .filter((f) => f.data_confidence === 'verified' && f.application_deadline)
    .slice(0, open.length ? 1 : 4);
  return `
    <div class="landing-clock-card">
      <p class="landing-clock-title">The Application Clock</p>
      ${open.map((w) => `
        <div class="landing-clock-row">
          ${icon('calendar')}
          <div>
            <div class="landing-clock-name">${escapeHtml(w.name)}</div>
            <div class="landing-clock-when">${w.daysLeft === 0 ? 'Closes today' : w.daysLeft === 1 ? 'Closes tomorrow' : `${w.daysLeft} days left`} · closes ${escapeHtml(w.closes)}</div>
          </div>
        </div>
      `).join('')}
      ${rows.map((f) => `
        <div class="landing-clock-row">
          ${icon('calendar')}
          <div>
            <div class="landing-clock-name">${escapeHtml(f.name)}</div>
            <div class="landing-clock-when">${escapeHtml(f.application_deadline)}</div>
          </div>
        </div>
      `).join('')}
      <button type="button" class="landing-clock-btn" onclick="goToFundingTab()">Open all funding deadlines →</button>
    </div>
  `;
}

function renderHomePage() {
  const el = document.getElementById('page-home');
  if (!el) return;
  const completed = AppState.questionnaire.completed;
  const primaryCluster = AppState.questionnaire.results?.primary;

  el.innerHTML = `
    <div class="landing">

      <section class="landing-hero">
        <div class="landing-hero-main">
          <img class="landing-hero-logo" src="./icons/logo-mark-light-256.png" alt="Njia" width="64" height="64" decoding="async">
          <p class="landing-hero-eyebrow">Career pathway intelligence · Kenya</p>
          <span class="status-pill mb-2"><span class="dot" aria-hidden="true"></span>Research-backed method · Real Kenyan data · Always free</span>
          <h1 class="landing-h1">Career clarity shouldn't cost <span class="hl-gold">what consultants charge.</span></h1>
          <p class="landing-sub">The Njia Method fuses career psychology, life design and strategic life-portfolio planning into one free diagnostic — matched against real Kenyan course fees, grade cut-offs and funding sources.</p>
          <p class="landing-proverb"><em>"Penye nia, pana njia"</em> — where there's a will, there's a way. It's why we're called Njia.</p>
          <div class="landing-cta-row">
            <button type="button" class="btn btn-gold" onclick="navigateTo('discover')">${completed ? 'Revisit Your Discovery' : 'Start Your Discovery — 20 minutes, free'} →</button>
            <button type="button" class="btn btn-outline-dark" onclick="scrollToLanding('landing-process')">See how it works</button>
          </div>
          <div class="landing-trust-row">
            <span class="landing-trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 10V8a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h8V8a4 4 0 0 0-8 0v2Zm4 5a1.6 1.6 0 0 0-.8 3v1.4a.8.8 0 0 0 1.6 0V18a1.6 1.6 0 0 0-.8-3Z"/></svg> Stays on your device</span>
            <span class="landing-trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.9 0 3.6.65 4.95 1.75L5.75 16.95A7.95 7.95 0 0 1 12 4Zm0 16a7.9 7.9 0 0 1-4.95-1.75L18.25 7.05A7.95 7.95 0 0 1 12 20Z"/></svg> Free, no signup</span>
            <span class="landing-trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> About 20 minutes</span>
          </div>
          ${completed ? `<p class="text-sm mt-2" style="color:var(--landing-ink-muted)">You're matched as <strong style="color:var(--landing-ink)">${CLUSTERS[primaryCluster].name}</strong>. <a href="#" onclick="navigateTo('discover');return false" style="color:var(--primary-dark);font-weight:600">Jump back into Discover →</a></p>` : ''}
        </div>
        <div class="landing-hero-aside">
          ${renderApplicationClock()}
        </div>
      </section>

      ${AppState.savedCourses.length > 0 ? (() => {
        const savedCount = AppState.savedCourses.length;
        const hasApplication = AppState.applications.length > 0;
        const onclick = hasApplication ? "navigateTo('track');return false" : "goToSavedCourses();return false";
        const cta = hasApplication ? 'View your progress →' : 'Pick one and start →';
        return `
        <section class="landing-block-tight">
          <div class="landing-teaser-box">
            <span aria-hidden="true">${icon('pin')}</span>
            <span>You have <strong>${savedCount}</strong> saved course${savedCount === 1 ? '' : 's'} waiting. <a href="#" onclick="${onclick}">${cta}</a></span>
          </div>
        </section>`;
      })() : ''}

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

      <section class="landing-block" id="landing-evidence">
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
        <span class="landing-eyebrow">TWO TRACKS</span>
        <h2 class="landing-h2">Which side of the decision are you on?</h2>
        <p class="landing-h2-sub">Every tool is free, works offline, and computes on your device. Start wherever your question is.</p>
        <div class="landing-track-grid">
          <div class="landing-track-card">
            <span class="landing-track-eyebrow">Find your path</span>
            <h3>Still deciding what you're for</h3>
            <p>A research-backed diagnostic and a life-design canvas — for when the question is "which direction?", not "which college?".</p>
            <span class="landing-track-count">2 tools →</span>
          </div>
          <div class="landing-track-card track-make">
            <span class="landing-track-eyebrow">Make it happen</span>
            <h3>Direction chosen, now execute</h3>
            <p>Courses, fees and funding matched to your grades and budget, outreach to real people, and follow-through tracking.</p>
            <span class="landing-track-count">3 tools →</span>
          </div>
        </div>

        <div class="landing-tool-section">
          <span class="landing-eyebrow" style="color:var(--primary-dark)">FIND YOUR PATH</span>
          <div class="landing-tool-grid">
            ${LANDING_TOOLS.find.map((t) => `
              <button type="button" class="landing-tool-card" onclick="navigateTo('${t.page}')">
                <span class="icon-disc" aria-hidden="true">${icon(t.icon)}</span>
                <span><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.body)}</p></span>
                <span class="landing-tool-arrow" aria-hidden="true">→</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="landing-tool-section">
          <span class="landing-eyebrow" style="color:var(--success-ink)">MAKE IT HAPPEN</span>
          <div class="landing-tool-grid">
            ${LANDING_TOOLS.make.map((t) => `
              <button type="button" class="landing-tool-card" onclick="navigateTo('${t.page}')">
                <span class="icon-disc" aria-hidden="true">${icon(t.icon)}</span>
                <span><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.body)}</p></span>
                <span class="landing-tool-arrow" aria-hidden="true">→</span>
              </button>
            `).join('')}
          </div>
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

      <section class="landing-block" id="landing-privacy">
        <span class="landing-eyebrow">PRIVACY BY ARCHITECTURE</span>
        <h2 class="landing-h2">We cannot see your answers, because there is nowhere for them to go.</h2>
        <p class="landing-h2-sub">No accounts, no tracking, no analytics. Everything you enter — questionnaire answers, plans, saved courses — lives in this browser's local storage and is computed on your device. The only exception: the optional Feedback and Partner forms below, sent to us only if you submit them. Use "Clear My Data" (the header lock) any time, especially on a shared phone.</p>
        <div class="btn-row" style="max-width:420px">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openPrivacyModal()">Privacy &amp; your data</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openMethodologyModal()">Method &amp; sources</button>
        </div>
        <div class="mt-3">${renderNjiaNumbersCard()}</div>
      </section>

      <section class="landing-dark landing-final-cta">
        <h2 class="landing-h2">Start with clarity. It's free.</h2>
        <p class="landing-sub">Your answers never leave your device. No account, no cost, about 20 minutes.</p>
        <button type="button" class="btn btn-gold" style="width:auto;display:inline-flex;margin-top:0.5rem" onclick="navigateTo('discover')">${completed ? 'Revisit Your Discovery' : 'Start Your Discovery'} →</button>
      </section>

      <footer class="landing-footer">
        <div class="landing-footer-grid">
          <div class="landing-footer-brand">
            <div class="flex items-center gap-1"><img class="logo-mark" src="./icons/logo-mark-128.png" alt="" aria-hidden="true" width="28" height="28" decoding="async" loading="lazy"><strong style="color:#f8fafc">Njia</strong></div>
            <p>Data-driven career pathway guidance for Kenyan youth, built on research-backed career psychology and life-design methods.</p>
          </div>
          <div class="landing-footer-col">
            <p class="footer-col-label">Modules</p>
            ${LANDING_PROCESS.map((p) => `<button type="button" onclick="navigateTo('${p.page}')">${p.title}</button>`).join('')}
          </div>
          <div class="landing-footer-col">
            <p class="footer-col-label">Learn</p>
            <button type="button" onclick="navigateTo('help')">Help, tutorials &amp; glossary</button>
            <button type="button" onclick="openFaqModal()">Quick FAQ</button>
            <button type="button" onclick="openMethodologyModal()">Methodology &amp; data sources</button>
            <button type="button" onclick="openAboutModal()">About Njia</button>
            <a href="https://tveta.go.ke" target="_blank" rel="noopener noreferrer">TVETA registry ↗</a>
            <a href="https://helb.co.ke" target="_blank" rel="noopener noreferrer">HELB ↗</a>
          </div>
          <div class="landing-footer-col">
            <p class="footer-col-label">Company</p>
            <button type="button" onclick="openPartnersModal()">Products &amp; Partners</button>
            <button type="button" onclick="openFeedbackModal()">Give Feedback</button>
          </div>
          <div class="landing-footer-col">
            <p class="footer-col-label">Legal</p>
            <button type="button" onclick="openPrivacyModal()">Privacy &amp; your data</button>
            <button type="button" onclick="openTermsModal()">Terms of Use</button>
          </div>
        </div>
        <section class="footer-learn">
          <p class="footer-col-label">Learn the ground</p>
          <div class="footer-learn-grid">
            <button type="button" class="footer-learn-tile" onclick="navigateTo('help')">
              <strong>Help &amp; tutorials</strong><span>Step-by-step walkthroughs for every module</span>
            </button>
            <button type="button" class="footer-learn-tile" onclick="AppState.viewFilters.helpTab='glossary';navigateTo('help')">
              <strong>Glossary</strong><span>KUCCPS, HEF, TVETA and the rest, in plain language</span>
            </button>
            <button type="button" class="footer-learn-tile" onclick="openMethodologyModal()">
              <strong>Method &amp; sources</strong><span>How every figure is arrived at, and its limits</span>
            </button>
            <button type="button" class="footer-learn-tile" onclick="goToFundingTab()">
              <strong>Application clock</strong><span>Funding windows, with the current cycle noted</span>
            </button>
          </div>
        </section>

        <section class="footer-about">
          <p class="footer-col-label">About Njia</p>
          <p>Njia is an independent, free career-pathway tool for Kenyan youth — unaffiliated with KUCCPS, HELB or any institution. It fuses career psychology, life design and life-portfolio planning with real Kenyan course, fee and funding data, and computes everything on your device. Institution and funder names appear because they are real public bodies, not because of any partnership. Data marked ✓ Verified has been cross-checked against a named public source; everything else is illustrative and should be confirmed before you decide.</p>
        </section>

        <p class="landing-footer-sources">Sources: KUCCPS 2025/26 placement results · Ministry of Education (July 2026) · World Bank modeled ILO youth unemployment estimate, 2025. Fees and funding terms are cross-checked against named, dated sources where the badge says so. Employment rates and salaries are estimates, not measurements — Kenya publishes no graduate outcomes per course. See Methodology.</p>
        <div class="landing-footer-bottom">
          <div>
            <a href="#" onclick="openAboutModal();return false">About</a><a href="#" onclick="openPrivacyModal();return false">Privacy</a><a href="#" onclick="openTermsModal();return false">Terms</a><a href="#" onclick="openMethodologyModal();return false">Methodology</a><a href="#" onclick="openPartnersModal();return false">Partners</a><a href="#" onclick="navigateTo('help');return false">Help</a><a href="#" onclick="openFaqModal();return false">FAQ</a>
          </div>
          <span><em>Penye nia, pana njia.</em> © 2026 Njia · A free, open pathway for Kenyan youth.</span>
        </div>
      </footer>
    </div>
  `;
}

function scrollToLanding(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Home's saved-courses teaser jumps straight to the Saved Only view in
// Decide, instead of dropping the user back into the full unfiltered
// Course Matcher they'd have to re-search to find what they already saved.
function goToSavedCourses() {
  AppState.decideFilters.activeTab = 'courses';
  AppState.decideFilters.savedOnly = true;
  saveState();
  navigateTo('decide');
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.querySelector('.bottom-nav')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (btn) navigateTo(btn.dataset.page);
  });
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('nav-toggle');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !toggle?.contains(e.target)) {
      closeMobileMenu();
    }
    if (!e.target.closest('.landing-nav-dropdown')) closeModulesDropdown();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMobileMenu();
    closeModulesDropdown();
  });

  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key !== 'Tab') return;
    const dialog = document.querySelector('.modal-sheet');
    const focusables = getFocusableElements(dialog);
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Respect a deep-link hash (e.g. from manifest.json shortcuts) on first
  // load only — in-app tab navigation deliberately doesn't touch the URL.
  const hashPage = window.location.hash.replace('#', '');
  if (PAGES.includes(hashPage)) AppState.currentPage = hashPage;

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

    // A page loaded with no existing controller (first-ever visit, or after
    // clearing site data) gets its *first* controllerchange the moment the
    // new service worker takes control — that's not an update, just normal
    // startup, and reloading here would silently refresh first-time visitors
    // for no reason. Only treat it as "an update is ready" when a controller
    // already existed before this event fired.
    const hadControllerAtLoad = !!navigator.serviceWorker.controller;
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadControllerAtLoad) return;
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
  }
});

/* ---------- PWA install prompt ---------- */
const INSTALL_DISMISSED_KEY = 'njia_install_dismissed';
const INSTALL_ENGAGEMENT_DELAY_MS = 2 * 60 * 1000;
const sessionStartedAt = Date.now();
let deferredInstallPrompt = null;
let installBannerShown = false;

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Show the install banner only once the visitor has actually engaged —
// finished Discovery, or stuck around 2+ minutes — rather than the moment
// the browser makes beforeinstallprompt available, before they've seen
// any value from the app.
function maybeShowInstallBanner() {
  if (installBannerShown || !deferredInstallPrompt || isRunningStandalone()) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === '1'; } catch (err) { /* localStorage unavailable — proceed as not dismissed */ }
  if (dismissed) return;
  const engaged = AppState.questionnaire.completed || (Date.now() - sessionStartedAt) >= INSTALL_ENGAGEMENT_DELAY_MS;
  if (!engaged) return;
  installBannerShown = true;
  showInstallBanner();
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  maybeShowInstallBanner();
  setTimeout(maybeShowInstallBanner, INSTALL_ENGAGEMENT_DELAY_MS + 500);
});

document.addEventListener('njia-state-changed', maybeShowInstallBanner);
document.addEventListener('njia-state-changed', updateTrackBadge);
document.addEventListener('njia-state-changed', updateHeaderCta);

window.addEventListener('appinstalled', () => {
  hideInstallBanner();
  deferredInstallPrompt = null;
  showToast('Njia installed — find it on your home screen.', 'success');
});

function showInstallBanner() {
  document.getElementById('install-banner')?.classList.remove('hidden');
}

function hideInstallBanner() {
  document.getElementById('install-banner')?.classList.add('hidden');
}

function triggerInstallPrompt() {
  if (!deferredInstallPrompt) {
    hideInstallBanner();
    return;
  }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });
}

function dismissInstallBanner() {
  hideInstallBanner();
  try { localStorage.setItem(INSTALL_DISMISSED_KEY, '1'); } catch (err) { /* best effort — banner still hides for this session */ }
}

/* ---------- Offline / online indicator ---------- */
window.addEventListener('offline', () => {
  showToast('You are offline — Njia still works, your data is safe.', 'info', 5000);
});
window.addEventListener('online', () => {
  showToast('Back online.', 'success', 2000);
});

function showUpdateAvailableToast(registration) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  // Only ever one update banner.
  //
  // A single deploy produces a single toast — that path was measured and is
  // fine. The case this guards is TWO deploys while a tab stays open, which
  // fires `updatefound` once per deploy and, unguarded, appends a second
  // identical banner. Measured against a real installed build: two
  // CACHE_VERSION bumps with no reload gave two toasts without this line and
  // one with it.
  //
  // It matters because these are not ordinary toasts. showToast() takes a
  // duration and fades; this one carries no timeout and no dismiss control,
  // so "Reload" is the only way to clear it. Duplicates do not expire, they
  // accumulate — and a burst of deploys is exactly when they arrive.
  //
  // Guarded here rather than on the listener so every path into this function
  // is covered, whatever future code calls it.
  if (container.querySelector('[data-update-toast]')) return;
  const toast = document.createElement('div');
  toast.className = 'toast info';
  toast.setAttribute('data-update-toast', '');
  toast.innerHTML = `
    <span aria-hidden="true">⬆️</span>
    <span>A new version of Njia is ready.</span>
    <button type="button" class="btn btn-ghost btn-sm" style="width:auto;padding:0.3rem 0.7rem">Reload</button>
  `;
  const reloadBtn = toast.querySelector('button');
  reloadBtn.onclick = () => registration.waiting?.postMessage('skipWaiting');
  container.appendChild(toast);
}
