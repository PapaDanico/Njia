# Baseline and triage of the 15 November 2026 evidence audit handover

**Prepared:** 15 November 2026, on `main` at `3ccce11`. Every figure below was recomputed here, not copied from the handover. Where a check could not be run, it says so.

## 1. Handover figures, re-measured

| Handover claim | Re-measured | Verdict |
|---|---|---|
| 1,392 listings, 722 programmes, 217 institutions, 47 counties | 1,392 / 722 / 217 / 47 (`data/landing-stats.js`; 1,392 and 217 also counted directly from the data files) | Confirmed |
| 14 published, 327 derived, 945 fee absent | `feeBasis()` gives published 14, derived 327, unpublished 945, illustrative 106 (sum 1,392) | Confirmed |
| "106 residual listings have an unconfirmed fee-basis label" | They are `illustrative` in the app's own classifier, shown with the badge "Illustrative: see the note" ("a sourced figure, but not this college's own published price for this course") | Resolved: label confirmed |
| 30 funding sources | 30 | Confirmed |
| Legacy `employment_rate` / `median_salary_kes` need auditing | Non-null on **0** of 1,392 records. The remaining references in `js/decide.js`, `js/app.js`, `data/labour-market.js` and tests are guards and comments that say no figure is shown | No unsupported course-level figure ships |
| `research/sources.json` KUCCPS URL needs independent resolution | `https://kuccps.net/Placem` is **truncated**, so the link on `/research/sources/` is broken | **Real defect, fixed in this PR** (see section 3) |
| No test suite was run in the audit | Run here: see section 2 | n/a |

The handover's 67/100 is its own expert rubric and is not adopted or re-scored here: the data needed to score "scientific validity" or "accessibility in a real browser" cannot be produced by this build.

## 2. What was actually run

| Command | Result |
|---|---|
| `CI=1 node --test tests/*.test.js` | 395 tests, 388 pass, 0 fail, 7 mtime guards skipped under `CI=1` |
| `node --check js/*.js` | all files parse |
| `node tools/audit-institution-metadata.mjs` | exit 0; its own notes say accreditation text and websites are not verified |
| `node tools/audit-national-catalogue.mjs` | exit 0; no orphan institution references, invalid grades, invalid fees or possible duplicate offerings |
| `node tests/functional-probe.mjs` | 49/49 (last run on the merged `/methodology/` change) |
| `NODE_PATH=/tmp/njia-a11y/node_modules node tests/a11y-sweep.mjs` | 108 states, 0 violations (same run) |

Node v22.23.4. Not run: a screen reader, a real low-end phone, a live-site fetch (egress blocked). The CI check "Unit suite and artefact freshness" is red on every commit because no runner is placed, which is not a pass.

## 3. The one factual change in this PR

> **Superseded on 16 November 2026.** The URL described below as truncated was real (`https://kuccps.net/placem`, titled "Placem"). See `NJIA-HANDOVER-TRIAGE-2026-11-16.md`.

`research/sources.json` entry `kuccps-placement`: URL changed from the truncated `https://kuccps.net/Placem` to `https://kuccps.net/degree-application-20252026-placement-cycle`, which a search on 15 November 2026 returned as KUCCPS's page for the 2025/2026 cycle. The page itself could not be opened from the build, so the claim text now says it rests on a search summary. The summary gave degree C+, diploma C-, craft certificate D and artisan E, with KCSE candidates from 2000 to 2024 (C to E) able to apply to Level 4 to 6. The earlier claim listed ranges (diploma "C/C-", certificate "D+/D", artisan "D-/E") that the official figures do not match. One news outlet gives D+ for certificates; the entry records that conflict and defers to the official page.

This changes a research-lead file and the page generated from it. It does not change any course record, grade or fee in the catalogue.

## 4. What this PR does not do, and why

- **No fee, grade or course record changed.** The handover asks for a 30-programme official-fee pilot and 10 regulator checks. Both need institution fee schedules and regulator registers, which sit on hosts this build cannot reach. `CLAUDE.md` records 23 private institutions attempted and refused for exactly this reason, so repeating the searches would reproduce the same refusals.
- **No new scoring or "four-panel" recommendation.** The handover and the merged NCERA protocol both say not to build confidence scores before validation. Admission, affordability and opportunity are already separate in the app (grade filter, fee basis and guidance, sector evidence); a four-field redesign is a product decision for the owner.
- **No 60-occupation / KeSCO crosswalk.** Needs the KLMIS classification, which could not be read here.
- **Exploratory labelling of the questionnaire** is already shipped: `/diagnostic/` and `/methodology/` say it is not a validated psychological test and a test enforces it.

## 5. Candidates for the next pass (not started)

1. Add a claim-level `checked_at` / `verification_status` vocabulary to `research/sources.json`, using the handover's seven statuses, so "accessed" can no longer imply a page was opened when only a search summary was read.
2. A guard that every `sources.json` URL has a plausible path (this defect was a truncation, which no current test could see).
3. Re-read the `kuccps-placement` claim against the live page when a route to it exists.
