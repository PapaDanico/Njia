# Njia implementation plan: handover proposals, adapted

Written 13 November 2026. This is the executable form of the review of the
"NJIA Claude Implementation Handover". It supersedes nothing in `CLAUDE.md`,
which stays the standing instructions; it sits beside `UPGRADE-PLAN.md`, which
is the historical record.

## Stance, decided

- **No accounts and no server.** Learner data stays on the device. Everything
  below is built inside that constraint.
- **Declined as specified:** the relational data model, the counsellor and
  institution portal, mentorship, person-level analytics. **Deferred and gated
  on an owner decision:** an AI navigator. Reasons are in the review.
- **System fonts.** No new typefaces, so the critical path does not grow.
- **Every claim about Kenya is sourced, attributed, or absent.** Where a source
  could not be read, the page says so.

## Slices, in dependency order

Each slice is complete only when: unit tests pass, the functional probe passes,
every new page is in the axe sweep and clean in both schemes and both viewports,
payload ceilings hold, and the generators have been re-run in order.

| # | Slice | Depends on | Acceptance | Status |
|---|---|---|---|---|
| 0a | Exploration-aid label on the diagnostic, report and FAQ; unsourced claim removed | none | Property guarded on every surface by `tests/pathways.test.js` | **Shipped** (PR #158) |
| 0b | `/pathways/` and `/diagnostic/` | 0a | Ladder recomputed from the catalogue by a test; CBE facts attributed; no weights quoted | **Shipped** (PR #158) |
| 0c | Editorial light design system and measured space pass | none | Heights measured before and after; axe clean; dark scheme untouched | **Shipped** (PR #158) |
| 0d | NYOTA funding record, FAQ, pathways mention | none | Contested figures left empty; recorded in `CLAUDE.md` | **Shipped** (PR #158) |
| 1 | Freshness fields on funding (`checked_at`, `valid_until`) | none | An expired record cannot show as active on the clock or a card; a `checked_at` shows where attested; guard test | **Shipped** |
| 2 | `/privacy/` and `/accessibility/` | none | Describes only what the app does; states what was and was not tested; in served link, sitemap, `llms.txt`, axe sweep | **Shipped** |
| 3 | `/careers/` | none | Computed from `CATALOGUE_ROLES`; one page, not one per role; recomputed by a test | **Shipped** |
| 4 | Why-this-result panel in the report | none | Pure function, unit-tested, prints on the report; never scores free text | **Shipped** |
| 5 | Plan-from-course in Track | 1 | Check what the application checklist already does before building | **Already existed**; not rebuilt |
| 6 | `/methodology/` | 1, 2 | Every figure read from the generated stats; each stated limit asserted by a test; in served link, sitemap, `llms.txt`, axe sweep | **Shipped** |
| 7 | Rebuild `/research/` as a generated page | 6 | Figures from `summariseCatalogue()` with the app's `feeBasis()`; no script; print header and dark scheme; recomputed by a test; in the axe sweep | **Shipped** |
| 8 | Counsellor kit `/counsellors/` | 6 | 50-minute session plan and two printable handouts; grade table recomputed; handouts break onto their own sheets; in served link, sitemap, `llms.txt`, axe sweep | **Shipped** |
| 9 | Design pass: exhibits, shared sources footer, generated `/research/sources/` | 7, 8 | Exhibit titles computed from the data and asserted; footer on every generated guidance page; sources page generated from the register; axe clean | **Shipped** |

## Deliberately not in this plan

- **Photography and imagery.** The project holds no licensed imagery and will
  not generate or borrow any. An art-direction brief is the prerequisite.
- **CV builder, cover-letter scaffold, interview practice** (handover Epic E).
  Valuable and on-device, but each is a module of its own with its own states,
  print output and accessibility work. They are Phase 2 and are not started here.
- **A KNQF level table.** The descriptor table could not be read from here.
- **Anything needing a decision only the owner can make:** an AI provider and
  budget, a working mailbox on the project domain, counsel's review under the
  Data Protection Act 2019 before any feature stores or transmits learner data.

## Status log

Appended at the end of each slice with what was verified and what was not.

### 13 November 2026, slices 1 to 5

Verified on the final tree: unit suite 338 tests, 331 pass, 0 fail (7 mtime
guards skip under CI by design); functional probe 49/49; axe sweep 92 states,
0 violations. Generators re-run in order; `CACHE_VERSION` njia-v295.

- Slice 1: `valid_until` and `checked_at` on funding; expired calls leave the
  clock and say so on the card.
- Slice 2: `/privacy/` and `/accessibility/`, in the served link, sitemap and `llms.txt`.
- Slice 3: `/careers/`, computed from `CATALOGUE_ROLES`.
- Slice 4: `whyThisResult()` and a panel under the primary match; free text is never scored.
- Slice 5: Track already creates editable steps from a saved course, so nothing was added.

Not done: CV, cover-letter and interview tools, counsellor kit, `/methodology/`,
photography, KNQF table, and the unresolved C+ degree-floor lead.
Not observed from here: the production deploy of #157, and a visual check of the new
report panel in print (the sweep covers it for contrast and structure only).

### 13 November 2026, slice 6 and the review of PR #159

PR #159 (written with another AI tool) was merged after repair: it carried a syntax
error in `js/decide.js` and a literal `\n` in `index.html`, both fixed first. Its
`/research/` page is JS-only (no figures without script), has no print header or dark
scheme, and requests a `catalogue-indicators.json` that does not exist before falling
back to the open-data export. It was left as merged; rebuilding it as a generated page
is the next candidate. The KUCCPS source URL in `research/sources.json` was corrected to
`https://kuccps.net/Placem`. Not verified from here: the other six source URLs and their
"accessed" dates.

Slice 6: `/methodology/`, with figures read from `LANDING_STATS`. Unit suite 377 pass, 0 fail;
probe 49/49; axe 96 states, 0 violations; `CACHE_VERSION` njia-v297. Not checked:
the page on screen in print (the printable-sheet guard covers header and date only).

Lead: a January 2026 Capital FM report says some KUCCPS medical programmes accept C or
below; this bears on the C+ degree floor and is recorded, not acted on.

### 13 November 2026, slice 7: `/research/` rebuilt

The page written in PR #159 drew every figure with script, so a reader without JavaScript
and every crawler saw only "Loading", and it had never been in the axe sweep. It is now
generated by `tools/build-static-pages.mjs` from `summariseCatalogue()` and the app's own
`feeBasis()`, with fee groups, entry grades, level, ownership and a 47-row county table.
Removed: `research/research.js`, `research/research.css` and four tests that only exercised
that script (the indicator integration test stays). `/research/` and `/research/sources/`
joined the axe sweep: 104 states, 0 violations. Unit suite 369 pass, 0 fail (7 mtime guards
skip under CI); probe 49/49; `CACHE_VERSION` njia-v298. Checked on screen at 1440 and 390 in
both schemes and in print emulation. Not rebuilt: `/research/sources/`, still a hand-written
page with its own inline style and no print header; its URLs and "accessed" dates are unverified.

### 13 November 2026, slice 8: counsellor kit

`/counsellors/` replaces the declined counsellor portal: a 50-minute session plan, a grade-page
table, cautions for the facilitator, and two handouts (a learner worksheet and the questions to
ask an institution) that each print on their own sheet (4 A4 pages in all). It uses only pages
and facts the site already carries; the timings are labelled as a suggestion. Unit suite 372
pass, 0 fail (7 mtime guards skip under CI); probe 49/49; axe 108 states, 0 violations;
`CACHE_VERSION` njia-v299. Checked on screen at 1440 and in print emulation. Not checked: the
page at 390 on screen by eye (measured: no horizontal overflow), or used with a real class.

### 13 November 2026, slice 9: design pass (exhibits, footer, sources page)

Three changes toward a consultancy-grade finish, none adding a font, image or script.
- **Exhibit component** (label, action title computed from the data, unit, figure, source line)
  on `/research/` (fee groups, level and ownership, county) and the `/pathways/` ladder.
  `tests/research-page.test.js` recomputes each title; `tests/exhibits.test.js` requires every
  exhibit to be complete and numbered in order (both guards were broken and watched to fail).
- **Shared footer** on all nine generated guidance pages: scope sentence plus links to
  methodology, official sources, open data and privacy.
- **`/research/sources/`** is generated from `research/sources.json`, with the shared shell
  (print header, dark scheme). It says the review date is when an entry was written and that
  Njia has not confirmed every link is live. It joined the sitemap, `llms.txt` and SURFACES.

Unit suite 375 pass, 0 fail (7 mtime guards skip under CI); probe 49/49; axe 108 states, 0
violations; `CACHE_VERSION` njia-v300. Checked on screen at 1440 and 390 (dark) and in print
emulation. Not done: photography (needs an art-direction brief), the board-style report PDF,
a space measurement of the generated pages, and checking the register's URLs.

### 13 November 2026, whole-site audit and review of PR #166

Audit of `main` at `992d9e4`: unit suite 375 pass, 0 fail (7 mtime guards skip under CI); every
`js/`, `data/` and `sw.js` file parses (`node --check`); the five generators re-run in order
produce no diff; 69 generated pages carry 850 internal links with none broken, every sitemap URL
exists on disk, every page is in the sitemap, and every canonical matches its path. The plan table
rows were out of order (7, 8, 9, 6) and are fixed.

PR #166 (ChatGPT, R8 institution metadata and an R9 to R13 charter) was reviewed against the
handover checklist. Its description said "documentation only" while the diff added a tool, a test
and a data file; the description was corrected. Two defects were fixed on the branch: the
`checked_at` pattern was `/^\\d{4}.../` (a literal backslash), which rejected every valid date and
would have blocked any genuinely verified claim, now covered by a test that fails on the old
pattern; and the unverified overlay sat in `data/`, where the service-worker guard treats it as a
shipped file, so it moved to `docs/research/`. The research documents invent no figure and state
0 of 10 pilot institutions verified. Nothing was verified against a regulator from this build.

### 13 November 2026, slice 10: site shell (header, menu, footer)

The generated pages had no site navigation, only a back link, and the app's menu and footer
did not link the pages built this week. Now one module (`tools/site-shell.mjs`) writes the
header and footer for every generated page, and the app's header menu gains Explore and
Evidence dropdowns while its footer carries the same four columns. Headers print nothing;
the dated brief head still prints. `tests/site-shell.test.js` guards presence, repeated ids
and app-versus-shell link drift. Design record: `DESIGN.md`, "Site shell".

### 15 November 2026, slice 11: landing space pass, bars, focus fix and the benchmark

The landing page's economy block measured 1,598px at 1440, 27% of the page. The sector table is now
a full-width sourced table plus a three-column list of the nine unsourced sectors, and the three
long figure notes fold into details. The table also stopped clipping its growth and coverage
columns at 390px. WCAG 2.2 "focus not obscured" was failing under a keyboard walk and is fixed with
`scroll-padding`. `/research/` gained proportional bars. `docs/DESIGN-BENCHMARK-2026-11-15.md`
sets out eight measurable criteria drawn from official and secondary benchmarks and where Njia
stands on each. Production was confirmed on `7740434` (the shared shell) at the start of this work.

### Slice 12: table density and index charts (15 November 2026)
- Generated-page tables: line-height 1.4 and tighter cell padding. Measured at 1440 and 390 before and after: `/counties/nairobi/` 18,874 to 16,329px (-13.5%), `/grades/e/` 11,289 to 10,005px (-11.4%), Nairobi at 390 37,314 to 32,595px (-12.6%). Rows are not interactive, so touch targets are unchanged.
- `/counties/` and `/grades/` gained a computed finding, a unit line with source, and proportional bars (the county index also shows the count). `/counties/` went from 47 plain links to the same links plus bars; no new figures, all counted from the catalogue.
- `/help/` was inspected and left alone: it is prose (no tables), and folding answers into collapsed sections would hide them from print and from readers without JavaScript.
- Gates: unit suite 387 pass, 7 mtime guards skipped under CI; probe 49/49; axe 108 states, 0 violations.

### Slice 13: published small-count rule (15 November 2026)
- `/methodology/` gained "Small counts": the sector-table threshold (read from `MIN_SECTOR_SAMPLE` in `data/sectors.js`, not typed), the raw-count rule on county and grade pages, and an explicit statement that the open-data download has no suppression rule. A test fails if the stated threshold drifts from the shipped one (broken to 9 and watched to fail).
- Production confirmed at `0f5bace` (includes #170 and #171), Lighthouse 94/100/100/100/100.

### Slice 14: verification status on the source register (15 November 2026)
- `research/sources.json` gained a published `status_vocabulary` (verified_primary, verified_secondary, conflicting, outdated, unverified, inaccessible) and a `verification_status` on every source. All seven are `unverified`: no page in the register has been opened and read from this build, so none can honestly claim more. `/research/sources/` shows each status beside the entry. A test fails on an unknown status, a status missing from the page, or an unparseable URL.
- Follow-up 2 from the baseline (a plausibility check for truncated URLs) is only partly covered: the test checks that each URL parses and has a real host, which would not catch a path cut short, as `https://kuccps.net/Placem` was. No generic check can.

### Slice 15: a draw is shown as a draw everywhere (16 November 2026)
- Owner delegated the redesign decisions: keep the terracotta and ochre palette, keep the current navigation labels, spend effort on layout and content.
- Bug-sweep item NJ-004, confirmed: when two clusters tie, only the printed report said so. The home page said "You're matched as X", Connect said "Based on your X result", the shared summary said "Primary match: X", Decide scored the tied cluster listed second at 72 against 95 and called it "not strongest", and the report's suggested courses came from one of the tied clusters only.
- Fixed through two helpers in `js/app.js` (`resultTie`, `resultNames`); Decide scores every tied cluster as the top one and says the result was a draw. Driven in a browser with a forced tie: home, Connect, the results badge and the share text all name both clusters.
- Gates: unit suite 392 pass under `CI=1` (399 tests), probe 49/49, axe 108 states 0 violations. `CACHE_VERSION` njia-v303.
