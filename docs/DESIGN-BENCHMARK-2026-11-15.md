# Njia design benchmark: what "international standard" can honestly mean here

**Prepared:** 15 November 2026. **Method:** web search only (the build cannot fetch pages), so each finding below rests on a search summary of the cited page, not a read of the whole page. Where the source is a third-party summary, that is stated. Re-check any figure or claim against the live source before quoting it.

## 1. A decision first: "McKinsey-grade" is not a standard you can certify

McKinsey publishes no design standard that a website can be audited against. The searches returned only third-party guides, and several say outright that they are unofficial summaries. So this document does not claim Njia "matches McKinsey". It does something checkable instead: it takes the practices those guides agree on, adds the standards that official bodies actually publish for education and finance information, and turns all of it into eight criteria Njia can be measured on (section 3).

## 2. What the benchmarks say

| Benchmark | Source type | What it teaches | Source |
|---|---|---|---|
| Consulting exhibit practice | **Secondary** (unofficial guides, not McKinsey) | A full-sentence action title that states the conclusion; one message per exhibit; the body exists to prove the title; a footer source note naming organisation, document and date | [Deckary](https://deckary.com/blog/consulting-slide-standards), [SlideModel](https://slidemodel.com/mckinsey-presentation-structure/) |
| Discover Uni (UK Office for Students and partners) | **Official** | Course comparison of up to seven courses; figures labelled with their base size; a published suppression rule (data shown only for at least 10 students, and for surveys at least half of a course); course-level versus subject-level data distinguished; weekly updates | [Guidance for comparing courses](https://discoveruni.gov.uk/about-our-data/guidance-comparing-courses/), [OfS](https://www.officeforstudents.org.uk/advice-and-guidance/student-information-and-data/discover-uni-and-unistats/) |
| College Scorecard (US Department of Education) | **Official data definition (IPEDS), secondary commentary** | Net price reported by income bracket and sourced to a named national collection; a personal net-price calculator; independent analysts (Brookings, New America) point out that a posted net price can differ from what a family pays, and that definitions are inconsistent. Missing or suppressed values are not zero | [IPEDS FAQ](https://nces.ed.gov/IPEDS/report-your-data/faq-average-net-price), [Brookings](https://www.brookings.edu/articles/college-prices-arent-skyrocketing-but-theyre-still-too-high-for-some/) |
| GOV.UK Design System | **Official** | WCAG 2.2 AA for header, footer and components; `header`, `main` and `footer` landmarks; a typography scale revised for accessibility | [WCAG 2.2 changes](https://design-system.service.gov.uk/accessibility/WCAG-2.2) |
| Financial Times Visual Vocabulary | **Official (FT graphics desk)** | Choose the chart from the message and the data relationship, not from habit | [FT Chart Doctor](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) |

**Not found:** nothing usable on Bloomberg or World Bank portal design, or on provenance and versioning conventions there. Treat those as unbenchmarked.

## 3. Eight criteria, and where Njia stands today

| # | Criterion | Njia on 15 November 2026 | Status |
|---|---|---|---|
| 1 | **Message-first exhibits**: action title, unit, source line, date, computed from the data | On `/research/` (3 exhibits) and the pathways ladder. Missing from county pages, grade pages, careers, counsellors, the landing page and the app's results screens | **Partial** |
| 2 | **Visual encoding of the key comparison** (FT principle) | Proportional bars on the fee, level and ownership exhibits only; every other comparison is a table or a number | **Gap** |
| 3 | **Provenance on every figure, plus a published base-size and suppression rule** (Discover Uni) | Provenance is Njia's strongest feature (five fee groups, per-record notes). A "too few to read as coverage" floor exists on the landing sector table. No single published rule, no base size on county and grade counts | **Partial** |
| 4 | **One coherent frame**: the same header, navigation and footer everywhere | Done in PR #168 (shared shell on all generated pages, app menu and footer carry the same links, a test fails on drift) | **Met** |
| 5 | **Density discipline**: page height measured, with a target | Landing 5,879px to about 5,500px at 1440 in this pass (-6%), and the economy block from 1,598px to 1,247px. Generated pages got taller by 2 to 7% when they gained a header and footer. Counties, grades and help have not had a space pass | **Partial** |
| 6 | **WCAG 2.2 AA, tested by method not by badge** | Axe: 0 violations across 108 states. A focus test found WCAG 2.2 "focus not obscured" failing (focus hidden under the sticky header or bottom nav on 8 of 69 keyboard steps on a phone, 5 on desktop); a scroll-padding fix cuts that to 2 and 1, the leftovers being a skip link mid-transition and a scroll region taller than the screen. Not yet tested: target size on every control, a screen reader, a real low-end phone | **Partial** |
| 7 | **Performance budget** | Critical path 1.5KB smaller after the shell PR; budget guarded by a test | **Met** |
| 8 | **Print and export** | Branded, dated brief head on generated pages; header and footer hidden on paper; a counsellor kit with handouts. No board-style report PDF yet | **Partial** |

## 4. What the benchmarks suggest Njia is missing, in order

1. **Charts, not only tables (criterion 2).** The FT principle is to pick the chart from the message. Njia has about six messages worth a visual: how much of the catalogue carries a fee (done), where provision is thin by county, what a given grade can reach, the funding ladder by grade, the cost of a route over its length, and sector growth against Njia's coverage. All six can be zero-dependency inline SVG or CSS bars computed in the generators.
2. **One published base-size and suppression rule (criterion 3).** Discover Uni's rule is simple and public. Njia should publish its own on `/methodology/` and apply it everywhere a count is shown: a small base is labelled, never silently rounded.
3. **A "last reviewed" and change log (criterion 3).** Discover Uni states its update cadence. Njia states a build date only. A generated `/changes/` page from the repository history would be cheap and is a strong credibility signal for funders.
4. **Exhibit anatomy on every data page (criterion 1).** County and grade pages open with a table. Each should open with a computed finding, a unit and a source line.
5. **Net-cost framing by funding band (College Scorecard).** Public university shillings cannot be computed (the retired unit cost is not a price), but the band shares can be shown as a small selector on the course card, with the limits stated the way Brookings states them for the Scorecard.
6. **A space pass on counties, grades and help (criterion 5)**, measured at 1440, 1920 and 390.
7. **Accessibility tests that axe cannot run (criterion 6):** target size on every control, a screen reader pass, and a real low-end phone.
8. **Photography and the board-style report PDF.** Both are blocked or large: photography needs your art-direction brief (no licensed imagery exists), and the report is a multi-day build.

## 5. What this branch changes

- Landing: the 21-row sector table is split into a full-width sourced table plus a three-column list of the nine sectors with no sourced growth figure; the three long figure notes fold into "Why this figure"; the phone layout stops clipping the growth and coverage columns (they were pushed off-screen behind a sideways scroll).
- Fixes WCAG 2.2 "focus not obscured" with `scroll-padding`.
- Adds proportional bars to the three `/research/` tables, computed from the same numbers, with the table kept as the accessible source.
- Re-cuts nothing in the data and removes no statement.

## 6. What this document does not claim

It does not claim Njia now looks like a consulting firm's site, that the eight criteria are the right ones for every reader, or that the benchmark sources are current: the search summaries may predate the live pages. The criteria are a measuring stick the owner can accept, change or reject.
