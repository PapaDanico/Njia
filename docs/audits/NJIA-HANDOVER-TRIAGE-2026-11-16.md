# Triage of the two 16 November 2026 handovers (bug sweep and redesign)

**Prepared:** 16 November 2026 on `main` at `573de83` plus this branch. Session model: configured `claude-fable-5-2`; earlier turns in this session were served by `claude-sonnet-5-5` (read from the session record, not assumed).

## 1. A correction to Njia's own earlier work

PR #173 described `https://kuccps.net/Placem` as a truncated, broken URL and replaced it. **That was wrong.** A search on 16 November returns `https://kuccps.net/placem` as a real KUCCPS page whose title is "Placem", and the bug-sweep handover reports opening it. The path looked cut short and was not. The lesson: search for the URL itself before calling a link broken. The baseline document's section 3 is superseded by this note.

## 2. Bug-sweep handover: decision log

| Item | Decision | What was done or why not |
|---|---|---|
| NJ-001 historical notice used as general guidance | **Accepted, fixed here** | `kuccps-placement` now cites `https://kuccps.net/placem` as general guidance; the 2025/2026 notice is a separate entry titled "Historical"; the 2026 announcement is titled "Historical"; every source carries a `cycle`. A test fails if general guidance cites a year-specific URL (broken and watched to fail). |
| NJ-002 "accessed" confused with a search summary | **Accepted, fixed here** | Status vocabulary gains `search_lead`. The two KUCCPS placement entries are `search_lead`; the other six stay `unverified`. No entry claims `verified_primary`, because this build opened none. |
| NJ-007 bands and floors conflated | **Accepted in the register** | The general entry states the bands, the archive entry states the 2025/2026 floors, and the text says both can hold in scope. No course record's grade was changed: catalogue grades are per-institution published bars, not these national bands. |
| NJ-003, NJ-011 questionnaire not validated | Already in place | `/diagnostic/` and `/methodology/` say it is not a validated psychological test; a test bans the claim. No new scoring added. |
| NJ-004 tie handling across surfaces | **Deferred, real** | Needs a consumer-by-consumer read of `primary` in report, print and share. Not started. |
| NJ-005, NJ-006 fee pilot and regulator checks | **Blocked** | Institution schedules and regulator registers are on hosts this build cannot open. 23 private institutions were already attempted by search and refused (see `CLAUDE.md`). |
| NJ-008 CI red | Partly answered | The job is never placed on a runner (`runner_id: 0`, no log); the setting is under the repository's Actions settings, which this build cannot reach. Owner action. |
| NJ-009, NJ-010 salary and coverage caveats | Already in place | Course-level salary fields are null on all records; pages state that counts describe Njia's listings. |
| NJ-012 browser, print, offline retest | Run for this branch | See the PR for the probe and accessibility results on this head. A screen reader and a real low-end phone remain untested. |
| NJ-013 funding staleness | Already in place | Funding records carry `checked_at` / `valid_until` with an expiry guard (plan slice 1). |
| NJ-014 link tests miss semantic wrongness | **Accepted** | The new `cycle` test is exactly this class. It cannot judge whether a claim matches its page; that stays a human read. |

## 3. Redesign handover: advice

1. **Much of Sprint 1 is already shipped**: one shared header, menu and footer across the app and every generated page with a parity test (#168), exhibits with computed titles and source lines (#163, #169, #171), a design benchmark with eight measurable criteria (`docs/DESIGN-BENCHMARK-2026-11-15.md`), denser tables and index charts (#171).
2. **Its own gate comes first.** The handover requires an owner-approved visual direction before code. The proposed palette (ink `#17232B`, plum `#5C2134`, teal `#176C71`) replaces Njia's current terracotta and ochre identity. That is a rebrand and is the owner's decision; nothing here changes the palette.
3. **Three proposals conflict with standing constraints and need a ruling:** a six-item primary navigation that renames every section; global search across all object types (feasible without a server, but adds to the critical path, which has a byte budget); and photography (no licensed imagery exists).
4. **Benchmarking Harvard and McKinsey "current sites"** cannot be done from this build: pages cannot be opened, only searched. The existing benchmark document says so.
5. **Recommended order if approved:** (a) owner picks palette and navigation labels from rendered options; (b) tokens and shell; (c) homepage; (d) learner journeys; (e) reports. Each as its own draft PR with before/after measurements.

## 4. Not claimed

No page was opened from this build. No fee, grade, course or funding record was changed. The 67/100 score in the handovers is their rubric and is not adopted or re-scored here.
