# Njia Data Verification Register

Working register for the data-verification push. The platform's moat is
data honesty: a record is marked `verified` only when its load-bearing
claim is cross-checked against a citable source, and its
`verification_note` states exactly what was and was not confirmed, with
source and date.

## What "verified" means here

- **Courses**: the *fee* claim is verified (or transparently derived
  from a verified figure). Employment rates and median salaries remain
  illustrative on every record — no public tracer-study data exists yet
  (see Phase 2 below).
- **Funding**: the *programme structure, eligibility and amount/deadline*
  claims are verified. Where a funder publishes no cash value, the record
  shows none rather than inventing one.

## Source hierarchy

1. The organisation's own publication (fee structure PDF, official
   announcement, application form).
2. Government publications (Ministry of Education, ngcdf.go.ke, HELB/HEF).
3. Reputable Kenyan press reporting an official announcement (named and
   dated in the note).
4. Anything else — not sufficient. Leave `illustrative`.

## Catalogue size (August 2026)

167 courses across 86 institutions in **45 of Kenya's 47 counties**,
covering all six clusters and all three qualification levels. No county with
coverage has fewer than two courses. The expansion added real
CUE-chartered universities and TVETA-registered national polytechnics;
public-TVET fees are anchored to the verified consolidated annual fee,
which is why the verified count grew with the catalogue rather than being
diluted by it.

**125 of 167 course records now carry verified fees (75%).**

The county expansion came from a single structural insight: two institution
families have *government-set uniform fees*, so covering them does not require
one registrar call per campus. KMTC operates 98 campuses across 45 of the 47
counties under one published national fee structure (Ksh 82,200 in Year 1,
Ksh 78,000 thereafter), and public TVET now charges one consolidated annual
fee set by government. That is what took coverage from 12 counties to 45
without lowering the verified share — it raised it, from 47% to 75%.

The two counties still absent are **Kirinyaga and Samburu**, and that is a real
boundary rather than an arbitrary stopping point: they are the only two
counties where KMTC has no campus.

Note what this expansion is and is not. The same programme appears at many
campuses, so the course count grew faster than the range of distinct
programmes. That is the point — a student in Turkana filtering by their own
county previously saw nothing at all, and now sees a KRCHN diploma and a
community health certificate they can actually reach without relocating. It is
coverage of *access*, not of curriculum variety. The Open University
of Kenya accounts for 16 of them, all fee-verified — it is the most
accessible institution in the catalogue for a Njia user: fully online, so
no relocation or hostel cost, CUE-accredited, KUCCPS/HELB eligible, and
carrying the only courses in the dataset that are free (Business Modelling
for Entrepreneurs; Mental Health Awareness) or open with no minimum grade.
For a school-leaver whose KCSE result closed other doors, that is the
single most useful row in the catalogue.

For context on scale: CUE lists roughly 88 institutions authorised to award
degrees. Njia covers a curated subset, not the register. That is a
deliberate scope statement, not a claim of completeness — see Phase 2.

## Outcome statistics — the correction that mattered most

Until this revision every course carried an `employment_rate` and a
`median_salary_kes`. Both were invented. Worse, a single `data_confidence`
flag covered the whole record while every `verification_note` ever written
described a *fee* — so fabricated outcome figures rendered beneath a
"Verified" badge, sorted the results list, drove the payback calculation,
and picked the comparison table's winner. A young person was being told one
course beat another on evidence that did not exist.

Provenance is now per-field:

| Field | Flag | Current state |
| --- | --- | --- |
| `total_fees_kes` | `fees_confidence` | 38 of 81 verified, each citing a named dated source |
| `employment_rate`, `median_salary_kes` | `outcomes_confidence` | `illustrative` on every record, marked **est.** everywhere they render |

`outcomes_confidence` is illustrative on all 81 records and that is the
honest state, not an outstanding task. Kenya does not publish graduate
outcomes per programme: government only recently began tracking TVET
graduates for three years post-completion, and no equivalent series exists
for universities. A course-level "78% employment rate" is not merely
unsourced — it is unsourceable today. The one published tracer figure found
(Kenya Coast National Polytechnic, 81.3% of graduates in work or
self-employment) is a single institution and is not generalisable to a
course-level claim.

`tests/provenance.test.js` enforces the rule: any record claiming
verification must carry a substantive source note. Flipping a flag without
a citation fails the suite.

## Labour-market evidence layer (`data/labour-market.js`)

The honest replacement for fabricated per-course precision: real figures at
the level they actually exist — the sector.

| Record | Figure | Source |
| --- | --- | --- |
| Average annual earnings, all formal wage employment | Ksh 988,200 (2025) | KNBS Economic Survey 2026 |
| Private / public sector average | Ksh 1,000,000 / Ksh 874,300 | KNBS ES 2026 |
| Electricity, gas & steam | Ksh 2,619,109/yr | KNBS ES 2026 |
| Transportation & storage | Ksh 1,751,913/yr | KNBS ES 2026 |
| Information & communication | Ksh 1,438,060/yr | KNBS ES 2026 |
| Human health & social work | ~Ksh 116,200/mo | KNBS ES 2026 |
| Education | ~Ksh 94,610/mo | KNBS ES 2026 |
| Agriculture, forestry & fishing | ~Ksh 36,220/mo | KNBS ES 2026 |
| Largest formal employer: Education | 731,300 jobs | KNBS ES 2026 |

**Every one of these is an average across formal wage employment,
including senior staff. None is a starting salary.** Each record therefore
carries an `entryReality` caveat naming what an entrant actually earns, and
the test suite fails if any record lacks one. Showing a school-leaver
"education pays Ksh 94,610/month" without that caveat would replace one
falsehood with a better-dressed one.

**Provenance tier: cross-reported, not primary.** This session's network
policy blocks `knbs.or.ke`, `weforum.org` and institutional sites directly,
so every figure was cross-checked across independent outlets reporting the
named primary source rather than read from the source document. That is
recorded honestly rather than dressed up as primary verification. Anyone
with direct access should read the primary release and upgrade the tier —
do not promote a figure without having read it.

### Youth unemployment is reported between ~12% and ~67%

Not noise, and not licence to pick the most alarming number. The figures
measure different things — age band, and whether "unemployed" means the
strict ILO test or the far broader "not in adequate employment". Njia shows
the range with each definition named, because a young person deciding their
future deserves "it depends what you count" over a headline chosen for
effect.

## Status (August 2026)

### Funding — 9 of 12 verified

| ID | Record | Status | Basis |
|---|---|---|---|
| f001 | HELB / HEF | ✅ verified | HEF band model, HELB coverage (July 2026) |
| f002 | Wings to Fly | ✅ verified | equitygroupfoundation.com — 4-yr secondary + ELP tertiary track |
| f003 | Mastercard Foundation | ✅ verified | usiu.ac.ke / mastercardfdn.org — USIU-Africa is the Kenya partner |
| f004 | Zawadi Africa | ✅ verified | zawadiafrica.org — A/A− requirement (**corrected from B**) |
| f005 | NG-CDF Bursary | ✅ verified | ngcdf.go.ke 2025/26 notices — 5k–30k/yr typical range |
| f006 | County Bursary | ⏳ illustrative | Genuinely varies by county — verify per county (Phase 2) |
| f007 | YEDF | ✅ verified | youthfund.go.ke product pages — enterprise capital, not tuition |
| f008 | KCB Scholars | ✅ verified | foundation.kcbgroup.com — secondary programme + 2jiajiri (**reframed**) |
| f009 | Work-Study | ⏳ illustrative | Generic category; terms are per-institution (Phase 2) |
| f010 | Elimu Scholarship | ✅ verified | education.go.ke / jkf.co.ke (**corrected: Ministry/JKF, not corporate CSR**) |
| f011 | TVET Govt Funding | ✅ verified | Consolidated public-TVET fee Ksh 67,189/yr effective May 2026 |
| f012 | Faith/Community | ⏳ illustrative | Informal by nature — stays illustrative |

### Courses — 22 of 57 verified

| ID | Course | Status | Basis |
|---|---|---|---|
| c003 | KRCHN Nursing (KMTC) | ✅ verified | KMTC published fee range (July 2026), mid-range estimate |
| c004, c006, c016 (NTTI), c023, c027 (Eldoret Poly) | Public-TVET diplomas/certs ≥12mo | ✅ verified | Derived from the Ksh 67,189/yr consolidated fee, disclosed in each note |
| c026 | BCom Finance (UoN) | ✅ verified | UoN published fee range (July 2026), mid-range estimate |
| c012, c024 | Sub-year NTTI certificates | ⏳ illustrative | Consolidated-fee context noted; term-billing makes pro-rating unsafe |
| All other university/private courses | ⏳ illustrative | Need per-institution fee structures (Phase 2) |

### Institutions — names/locations real, accreditation asserted

All institutions are real and publicly known. `CUE Chartered` /
`TVETA Registered` labels still need a check against the current CUE
accreditation list and TVETA registry (Phase 2 — both registries are
published online but must be read record-by-record).

## Phase 2 — what needs a human (registrar calls / documents)

Priority order, highest user impact first:

1. **Per-institution fee structures** for the 19 illustrative courses —
   one call or fee-structure PDF per institution (KCA, Multimedia, KU,
   Moi, JKUAT, Strathmore, PAC, KMTC exact per-campus totals).
2. **Employment rates and median salaries** — no record has verified
   outcome data. Options: institution tracer studies (ask the registrar
   if one exists), KNBS labour reports, or drop the fields until real
   data exists (the UI already handles nulls).
3. **County bursary (f006)** — pick the 5–10 counties with most users
   and verify each county's current bursary window and range.
4. **Accreditation sweep** — CUE list + TVETA registry, record-by-record.

### Registrar call script (suggested)

> "I maintain a free career-guidance tool for Kenyan youth. Can you
> confirm for [course]: current total tuition for the full course, any
> non-tuition compulsory charges, the intake months for next year, and
> whether the institution has published a graduate tracer study?"

Log every confirmation in the record's `verification_note` with the
person/office and date, flip `data_confidence` to `verified`, and bump
the count below.

## Cadence

Fees and funding calls change **annually**. Every record's note carries
its verification date; re-verify each record before the KCSE results
release (typically January), when traffic peaks.


## Research method — what is reachable, and what is not

This matters because the platform's whole claim is verifiability, so the
limits of the sourcing have to be as legible as the figures.

**Direct fetching of primary sources is blocked.** Seventeen domains were
tested by two independent methods (`WebFetch` and `curl` through the session
proxy), including `weforum.org`, `knbs.or.ke`, `kmtc.ac.ke`, `cue.or.ke`,
`tveta.go.ke`, `kuccps.net`, `helb.co.ke`, `ilo.org`, `data.worldbank.org`,
`unesco.org`, `oxfordmartin.ox.ac.uk` and `odi.org`. Every one returns **403 —
organisation policy denial**, logged by the proxy itself. Control domains
(`api.github.com`, `registry.npmjs.org`) return 200, so the proxy is working;
the denial is policy, not failure.

**Search-with-domain-restriction is the channel that works.** Restricting a
web search to an authoritative domain returns that publisher's own pages and
their content, even though the pages cannot be fetched directly. That is how
the WEF Future of Jobs 2025 figures, the Sub-Saharan Africa regional cut and
the WEF Kenya digital-economy study were sourced.

**Every figure is therefore `cross-reported`, not `primary`.** Nothing here
was read from a source PDF. Where numbers disagree across reports, the
disagreement is recorded rather than resolved by preference. Anyone with
direct access should read the primary releases and upgrade the tier — and must
not promote a figure without having read it.

### Corrections this research pass forced

| Claim | Was | Now |
| --- | --- | --- |
| BPO employment | "more than 60,000 directly" | Reported between ~7,000 and 60,000 depending on definition — all three counts named |
| Job growth rankings | Percentage list only (AI, fintech, big data) | Both lists; the absolute list (nursing, teaching, frontline) shown alongside |
| Graphic design | Absent | Named as fastest-declining, driven by generative AI — Njia lists design courses |
| Placement framing | "~30% placed via KUCCPS" | Middle-level capacity 1,132,531 against 293,869 placed |

The BPO correction is the one worth dwelling on. Njia shipped the largest of
three circulating figures with no note that it was the broadest definition —
flattering the sector by nearly an order of magnitude against the narrowest
count, in a record a young person might plan around. It was caught only by
going to the WEF's own Kenya study rather than stopping at secondary coverage.

### The finding that reframes the platform

Middle-level colleges hold capacity for **1,132,531** students. Placements
across every institution type totalled **293,869**. Roughly four in five
middle-level places go unfilled while young people conclude there is nothing
for them.

Njia has always asserted that the problem is information rather than scarcity.
This is the first time that claim has been evidenced, and it is now the lead
statistic on the landing page. `tests/provenance.test.js` fails if the
capacity-to-placement gap ever inverts — because if it does, the premise needs
rewriting, not the number massaging.


## The informal economy — context every salary figure needs

| Measure | Figure |
| --- | --- |
| Informal share of total employment | **83.8%** (18.1 million people) |
| Formal wage employment | 16.2% (3.5 million) |
| New jobs created, 2025 | 822,100 |
| Share of those that were informal | **87.2%** |
| Largest informal sector | Wholesale/retail, hotels and restaurants — 10.7 million |

*Source: KNBS Economic Survey 2026, cross-reported August 2026.*

Every figure in `SECTOR_EARNINGS` is an average across **formal wage
employment** — the destination of roughly one working Kenyan in six. Njia had
a caveat gesturing at this ("the informal sector absorbs far more workers") but
never quantified it, so the formal salary ladder read as the normal outcome.

The note now renders directly above the earnings figures, and a test fails if
the informal share ever drops below half or if the wording frames informal work
as a fallback. It is not the failure case: for five in six workers it is the
economy, and it is why enterprise capital (YEDF) sits in the funding module
rather than in a footnote.

**Also confirmed, negatively:** searches restricted to `tveta.go.ke`,
`education.go.ke` and `kippra.or.ke` return no national TVET graduate tracer
study with employment outcomes. That is direct support for keeping
`outcomes_confidence: 'illustrative'` on every course — the data does not exist
to verify against, and this is now a checked absence rather than an assumption.
