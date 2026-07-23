# Njia — Data-Driven Career Pathway for Kenyan Youth

Njia (Swahili for "Pathway") is a Progressive Web App that helps Kenyan youth
make evidence-based career decisions. It fuses three research-backed
methodologies — career psychology (the Four Elements model), life design
(Odyssey Planning), and strategic life-portfolio planning — with real Kenyan
institutional data (TVET/university courses, fees, funding, and employment
outcomes). See "The Njia Method" in-app (footer → Methodology) for the full
breakdown.

Built as vanilla HTML/CSS/JS — no framework, no build step, no npm install
required to run it. Works offline after first load, installs to the home
screen, and runs on low-end Android devices with intermittent connectivity.

## ⚠️ Data verification checklist — read before any real launch

**Course fees, employment rates, salaries, and funding amounts/deadlines in
`data/courses.js` and `data/funding.js` are illustrative estimates**, built
to demonstrate the schema and UI — they are **not** sourced from live
TVETA/CUE registries, institution registrars, or KNBS labour statistics.
Every record carries a `data_confidence: 'illustrative'` field, and the
Decide module shows a disclaimer banner for this reason.

Institution names, types, locations and accrediting bodies (`data/institutions.js`)
are real, publicly known Kenyan institutions, but have not been individually
re-verified against current TVETA/CUE registries at time of writing.

Before any user makes a real financial or enrolment decision using this
app, someone must:
1. Confirm each institution's current accreditation status directly with
   TVETA (tveta.go.ke) or CUE (cue.or.ke).
2. Replace illustrative fees/intake months with figures obtained from each
   institution's admissions office or official fee structure document.
3. Replace illustrative `employment_rate` / `median_salary_kes` with
   verifiable data (institution tracer studies, KNBS, or direct alumni
   surveys) or remove those fields until real data exists.
4. Confirm current funding amounts/deadlines directly with each funder
   (HELB, Equity Group Foundation, Mastercard Foundation, etc.) — these
   change annually.

## Module status (MVP scope)

This build implements everything that can run **client-only, with no
backend**, per the original brief's own architecture constraint
(`localStorage`, no server). Modules that inherently require a backend are
explicitly scoped down rather than faked:

| Module | Status | Notes |
|---|---|---|
| 1. Discover | ✅ Full | Adaptive questionnaire, Four Elements clarity scoring, six-cluster matching, voice-to-text input (Web Speech API, transcribes to text — no audio storage) |
| 2. Design | ✅ Full | Odyssey Plan Builder (3 plans × 5 years), Life Portfolio gauges, Prototype Planner, Gravity Problem Reframer |
| 3. Decide | ✅ Full | Course Matcher (grade/budget/cluster filters, match %), Funding Finder, inline feasibility estimate |
| 4. Connect | ⚠️ Scoped down | Real mentor matching and peer cohorts need a live backend and a vetted volunteer directory (Phase 2). This build ships an informational-interview message generator and cluster-based "who to look for" guidance instead of fabricated mentor profiles. |
| 5. Track | ✅ Full | Personal OKRs, application tracker with timeline, progress stats. Alumni outcome feedback loop needs shared/backend data (Phase 2). |

All state persists to `localStorage` on-device only. Nothing is sent to a
server. A "Clear My Data" control is available from the header lock icon —
important since many users share devices.

## File structure

```
├── index.html          # App shell, page containers, script loading order
├── manifest.json        # PWA manifest
├── sw.js                 # Service Worker — cache-first offline strategy
├── css/styles.css        # Full design system (warm paper/ink/terracotta theme)
├── js/
│   ├── app.js            # AppState, routing, toast/modal, home page
│   ├── discover.js        # Module 1
│   ├── design.js           # Module 2
│   ├── decide.js            # Module 3
│   ├── connect.js            # Module 4
│   └── track.js               # Module 5
├── data/
│   ├── questions.js       # Questionnaire sections + six career clusters
│   ├── institutions.js     # 18 Kenyan institutions
│   ├── courses.js           # 27 courses across all six clusters
│   └── funding.js             # 12 funding sources
└── icons/                # PWA install icons (generated from brand logo)
```

## Running locally

No build step. Any static file server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

Opening `index.html` directly via `file://` also works for quick checks,
though the Service Worker only activates when served over `http(s)://`.

## Deploying to Netlify

1. Push this repository to GitHub (or drag-and-drop the folder in the
   Netlify dashboard).
2. In Netlify: **Add new site → Import an existing project**, select this
   repo.
3. Build settings: leave **Build command** empty and set **Publish
   directory** to the repository root (`.`) — there is nothing to build.
4. Deploy. Netlify serves static files with HTTPS by default, which is
   required for the Service Worker and installability to work.
5. Optional: add a custom domain under **Domain settings**. No code changes
   are needed — every asset path in this app is relative (`./css/...`,
   `./js/...`), so it works at the domain root or any subdirectory.

## Accessibility & performance notes

- Visible focus states on all interactive elements; touch targets are
  48×48px minimum (the modal close button is the one 44×44px exception).
- Respects `prefers-reduced-motion`. The theme is a single warm light
  palette (paper background, ink text, terracotta accent) with serif
  display headings — system fonts only, no webfonts shipped.
- No external fonts/scripts — everything loads from this repo, keeping the
  app installable and functional with zero third-party network calls.

## Roadmap (Phase 2+)

- Verified institutional dataset (replace illustrative fees/outcomes).
- Real mentor-matching backend and moderated peer cohorts.
- HELB/funder API integrations where available.
- Machine learning on outcome data once a real user base exists.
