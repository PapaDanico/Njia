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
