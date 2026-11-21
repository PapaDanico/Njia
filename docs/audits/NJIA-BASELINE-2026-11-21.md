# Njia baseline, 21 November 2026

Measured in this session on branch `claude/nifty-planck-01ix3a` (PR #192 head
`ad75dfd` plus this pass), Node 22.23.4, Playwright 1.63.0 with its bundled
Chromium. Every line below is a command that was run and its result.
`PASS`, `FAIL`, `BLOCKED` and `NOT RUN` mean what they say.

| Check | Command | Result |
|---|---|---|
| Unit suite | `CI=1 node --test tests/*.test.js` | PASS, 404 pass, 0 fail, 7 skipped (the mtime guards, which skip under CI by design) |
| Syntax | `node --check js/*.js` | PASS, every file |
| Institution metadata audit | `node tools/audit-institution-metadata.mjs` | PASS, exit 0 |
| National catalogue audit | `node tools/audit-national-catalogue.mjs` | PASS, exit 0 |
| Internal links (new) | `node --test tests/internal-links.test.js` | FAIL on the first run (2 dead links), PASS after the fix below |
| Functional probe | `node tests/functional-probe.mjs` | PASS, 49/49 |
| Accessibility sweep | `node tests/a11y-sweep.mjs` | PASS, 108 states, 0 violations |
| Horizontal overflow, 320 and 390px | Playwright over all 70 generated pages, plus 7 app routes at 320px | PASS, no page wider than its viewport |
| Print to A4 | Playwright `page.pdf({format:'A4'})` on all 70 pages, then `pdftotext -bbox` for the rightmost word | PASS, no text past the right margin (the widest, `/analysis/`, ends at 560pt of 596pt) |
| GitHub Actions | the run history of `node.js.yml` | BLOCKED. Jobs are never placed on a runner (`runner_id: 0`, no log). This is a repository setting, recorded in CLAUDE.md, and not a test result |
| External links | n/a | NOT RUN. This build has no egress, so a link that looks fine in a search snippet is not evidence it answers |

## Handover figures, reconciled

The handover read `data/landing-stats.js` at `9811fe8`. At the current head it
reads 1,476 listings: 13 published, 348 derived, 1,011 with no fee and **104
illustrative**. Those 104 are the "outside the three groups" the handover could
not place. `feeBasis()` returns exactly those five bases, and they sum to the
catalogue (the guard in `tests/provenance.test.js`).

## Handover items checked against the code

| Item | Finding |
|---|---|
| P0-01, a missing fee must not rank as cheapest | Already true. `byFee()` in `js/decide.js` sorts a null fee last in both directions, and the coverage tile's "lowest tuition" ignores nulls |
| P0-02, KUCCPS links | `research/sources.json` labels each link by `cycle` and `verification_status`. The 2025/26 and 2026 notices are titled "Historical", with "never quote as current". No site-wide internal-link check existed, and adding one found a real defect (below) |
| P0-04, claim hygiene | `tests/pathways.test.js` already bans the unsourced endorsement and requires "not a validated psychological test" on every surface describing the diagnostic. No new claim found |
| P1-10, salaries | No surface labels a sector wage as a starting or graduate salary. `paybackMonths()` is null for every record |
| P2-13, external `rel` | Every `target="_blank"` link carries `noopener` |

## Defect fixed in this pass

**NJIA-2026-11-21-01.** Two FAQ answers in `js/help.js` linked `./privacy/` and
`./terms/`. In the app, at the site root, that is correct. On the crawlable
`/help/` page it resolves to `/help/privacy/`, which does not exist, so the
links a reader follows to delete their data were dead on the indexed copy. Now
root-relative. `tests/internal-links.test.js` walks every committed HTML page
and fails on any internal href or src that lands nowhere. A break test (one
link put back) failed and named the page; restored, it passed.

## Not done, and why

The design-system rewrite, the screenshot matrix and the print/PDF samples (the
handover's Sprints 2 to 4) are not part of this pass. Measured, nothing at 320
or 390px overflows. The type floor, dark mode on generated pages, contrast and
print headers each already have a guard (see CLAUDE.md). A restyle should start
from a specific defect a reader meets, not from the rubric score, which the
handover itself calls a prioritisation device and not a measurement.

## An instrument error, recorded so the next audit does not repeat it

A first print check emulated print media in a 718px browser window and reported
the 12-column `/analysis/` table at 761px, which reads as "the fee column is cut
off the sheet". A real A4 PDF of the same page puts the last word at 560pt of
596pt: nothing is cut. Print media emulation in a window does not lay out a page
the way the print engine does. A CSS fix written for that false finding was
reverted. To measure print, print to PDF and read the coordinates.
