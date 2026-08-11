# Njia Upgrade Plan

Written after a systematic audit of the running platform in August 2026.
This is the standing plan: what was wrong, what has been fixed, and what
remains — with the honest reason each open item is still open.

## The finding that reframed everything

The platform was fabricating its central evidence.

Every course carried an `employment_rate` and a `median_salary_kes`. Both
were invented. A single `data_confidence` flag covered each whole record
while every verification note ever written described a *fee* — so made-up
outcome statistics rendered beneath a **"Verified" badge**, sorted the
results list, drove the payback calculation, and picked the comparison
table's winner.

A young person was being told one course beat another on evidence that did
not exist. Nothing caught it, because nothing checked that a claim of
verification was backed by a source.

That reframes the whole upgrade. Njia's differentiator was never the
questionnaire — plenty of tools have one. It is that the numbers can be
trusted. Everything below is ordered by that principle.

## Principles this plan is held to

1. **A figure may be presented as verified only if a named source is
   attached to it.** Anything else is an estimate and is marked as one.
2. **Provenance is per-field, not per-record.** A verified fee says nothing
   about an employment rate sitting in the same object.
3. **Never cherry-pick.** Where credible sources disagree — youth
   unemployment, automation exposure — show the range and name what each
   measure counts. Picking the figure that best dramatises Njia's own case
   is the same failure as inventing one.
4. **A caveat travels with its number.** A sector average that includes
   consultants is not a school-leaver's starting salary, and must never
   render without saying so.
5. **Rules are enforced by tests, not documented in prose.** Documentation
   describing a discipline nobody checks is how the original defect
   survived this long.

## Phase 1 — Data integrity (done)

| Item | State |
| --- | --- |
| Split `data_confidence` into `fees_confidence` / `outcomes_confidence` | Done, all 81 records |
| Mark every outcome figure `est.` wherever it renders | Done |
| Scope the "Verified" badge to fees explicitly | Done |
| Stop the employment sort presenting an estimate-ranked order as fact | Done — label reads "Highest Employment (est.)" |
| Enforce provenance in the test suite | Done — `tests/provenance.test.js` |

`outcomes_confidence` is `illustrative` on all 81 records, and that is the
honest end state rather than an outstanding task. Kenya publishes no
graduate outcomes per programme: government only recently began tracking
TVET graduates for three years post-completion, and no equivalent
university series exists. A course-level "78% employment rate" is not
merely unsourced — **it is unsourceable today**. The single published
tracer figure found (Kenya Coast National Polytechnic, 81.3% in work or
self-employment) is one institution and does not generalise to a course.

## Phase 2 — Evidence layer (done)

`data/labour-market.js` replaces fabricated per-course precision with real
figures at the level they actually exist: the sector.

- **Sector earnings** from KNBS Economic Survey 2026, each carrying an
  `entryReality` caveat naming what an entrant actually earns.
- **Whole-economy anchors** — average earnings, wage employment total,
  largest formal employers.
- **Youth unemployment as a range** (~12% to ~67%), with each definition
  named.
- **Kenya demand signals** — ICT share of postings, BPO employment,
  hiring intentions, the renewable-energy skills gap.
- **Automation exposure** — Frey & Osborne's three bottlenecks (social
  intelligence, creative intelligence, complex perception and
  manipulation) mapped to Njia's clusters, plus ODI/ILO Kenya-specific
  exposure, plus **both sides** of the contested developing-country
  estimate.
- **Method lineage** — the Design module's Odyssey Plans and prototyping
  come from the Stanford Life Design Lab (Burnett & Evans); Discover's
  limits come from the interest-congruence literature. Named so a reader
  can go and check the method themselves.

## Phase 3 — Scope (partially done)

| Item | State |
| --- | --- |
| Open University of Kenya programmes, fee-verified | Done — 16 records |
| Free / no-minimum-grade entry points | Done — first in the catalogue |
| Catalogue growth | Done — 73 → 81 courses, 30 → 38 fee-verified |
| Coverage of CUE's ~88 degree-awarding institutions | **Open — 86 institutions covered overall** |
| County coverage | **Done — 45 of 47** (KMTC has no campus in Kirinyaga or Samburu) |
| Per-institution fee structures for illustrative courses | **Open — 125 of 167 verified (75%)** |

OUK deserves its own note. It is the most accessible institution in the
catalogue for a Njia user: fully online, so no relocation or hostel cost;
CUE-accredited; KUCCPS and HELB eligible; and carrying the only courses in
the dataset that are free or open with no minimum grade. For a school-leaver
whose KCSE result closed other doors, those are the most useful rows the
platform ships.

## Phase 4 — What remains, and why

**County coverage — solved, and worth recording how.** This was the largest
open item, described here as a sourcing problem rather than an effort problem:
per-campus fees would mean one registrar call per institution. The way through
was to stop treating every institution as a separate sourcing task and find the
families that are *centrally priced*. KMTC publishes one national fee structure
across 98 campuses in 45 counties; public TVET now charges one consolidated
government-set annual fee. Two sources, forty-five counties. Coverage went from
12 counties to 45 and the verified share went **up**, 47% to 75%, because
everything added came with a published fee.

The remaining gap is distinct programmes rather than places. A student in any
of 45 counties can now find something near home; a student wanting an unusual
specialism still mostly has to look at the big urban institutions. Closing that
does need per-institution sourcing, and bulk-importing names without fees would
still inflate the catalogue while lowering the share anyone can trust.

**Upgrading provenance from cross-reported to primary.** Every figure in the
evidence layer was cross-checked across independent outlets reporting a
named primary source, because this environment's network policy blocks
`knbs.or.ke`, `weforum.org` and institutional sites directly. The register
records that as `cross-reported`, not primary. Anyone with direct access
should read the primary releases and upgrade the tier — and must not promote
a figure without having read it.

**Graduate outcome data.** Blocked upstream until Kenya's TVET tracer
programme publishes. When it does, `outcomes_confidence` can move to
`verified` — but only with a citation, which the test suite enforces.

**Annual re-verification.** Fees and funding deadlines move every cycle.
The register sets a cadence pegged to KCSE results season; a record whose
source is more than a year old should be treated as stale rather than
verified.

## How to check this work

```
node --test tests/*.test.js     # 56 tests, zero dependencies
```

Plus, for anything touching the UI: axe-core across all 56 states (7 pages ×
2 viewports × 2 colour schemes × 2 data states, full ruleset including WCAG
2.2), and a full click-through journey on a CPU-throttled phone viewport.
See `DESIGN.md` for why a desktop-only, WCAG-2.0-only audit is worse than no
audit at all.

## Appendix — external audit review (11 August 2026)

An external UI/UX and analytical audit was supplied listing 54 findings
across four severity bands. It was written against an older build (it cites
27 courses against the 81 shipped, `AppState.userProfile` which does not
exist, emoji navigation icons replaced some time ago, and 2 verified records
against the 38 shipped), so most findings were already resolved. Each was
nonetheless checked against current source rather than dismissed on the
document's age.

**Already fixed before the audit was written** — weighted scoring now reads
each question's `weight`; the division-by-zero that produced `NaN%` is
guarded; the saved-course 100% match override is gone; grade comparison uses
a full twelve-point scale rather than first-letter matching; the modal
already had `role="dialog"`, `aria-modal`, a Tab focus trap, ESC and
overlay-click close, and focus return.

**Genuinely live, now fixed:**

| Finding | Resolution |
| --- | --- |
| An application with no steps reported "complete" (`[].every()` is `true`) | `applicationStatus()` guards length and non-arrays; regression test added |
| No skip link | Added as the first focusable element, revealed on focus |
| No Content Security Policy | Added, origin-restricting |
| Modal `aria-labelledby` silently dropped when content led with `h2` | Heading lookup widened to `h1–h4` |
| Background scrolled behind an open modal | `body.modal-open { overflow: hidden }` |

The empty-steps bug deserves note because this plan's own Phase 1 work made
it *more* reachable: `normalizeState()` gives an application saved before
`steps` existed an empty array, which is the correct repair but landed
directly on a reader that treated empty as finished. A tracker congratulating
someone for work they have not started is precisely the kind of quiet
dishonesty this plan exists to remove.

**On the CSP, precisely.** The app uses inline `onclick` handlers throughout
and a pre-paint theme script, so `script-src` requires `'unsafe-inline'`.
This CSP therefore does **not** make Njia immune to injected script. What it
enforces is origin restriction — and for this product that is the
load-bearing part: `connect-src 'self'` means answers, saved courses and
plans cannot be transmitted to any third party, which is the privacy promise
Njia actually makes. Removing `'unsafe-inline'` requires replacing every
inline handler with `addEventListener`; worth doing, not yet done.

**Findings not adopted, with reasons:**

- *Hardcoded data with no update mechanism.* Correct as an observation, but
  fetching a JSON layer from a CDN would break the offline-first, zero-build,
  no-network guarantee that is the product's core claim. Data currency is
  handled by the re-verification cadence instead.
- *Add analytics instrumentation.* Directly contradicts "no accounts, no
  tracking, no analytics", which is stated to users on the landing page. The
  product cannot promise that and then measure them.
- *Celebration animation on results reveal.* Njia's results are frequently
  sobering — a modest interest signal, a course out of budget. Confetti over
  that would be tonally wrong and would overstate the finding's certainty.
- *NLP on free-text answers.* Worth doing; the audit is right that answers
  currently go unread. But keyword-boosting cluster scores from short text is
  easy to do badly and would inject an unvalidated signal into a scoring
  model this plan has just finished making honest. Surfacing the answers back
  to the user is the correct first step.
