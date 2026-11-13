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
| 7 | Rebuild `/research/` as a generated page | 6 | Figures from `summariseCatalogue()` with the app's `feeBasis()`; no script; print header and dark scheme; recomputed by a test; in the axe sweep | **Shipped** |
| 8 | Counsellor kit `/counsellors/` | 6 | 50-minute session plan and two printable handouts; grade table recomputed; handouts break onto their own sheets; in served link, sitemap, `llms.txt`, axe sweep | **Shipped** |
| 9 | Design pass: exhibits, shared sources footer, generated `/research/sources/` | 7, 8 | Exhibit titles computed from the data and asserted; footer on every generated guidance page; sources page generated from the register; axe clean | **Shipped** |
| 6 | `/methodology/` | 1, 2 | Every figure read from the generated stats; each stated limit asserted by a test; in served link, sitemap, `llms.txt`, axe sweep | **Shipped** |

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
