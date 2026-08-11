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

81 courses across 43 institutions in 12 counties, covering all six
clusters and all three qualification levels. The expansion added real
CUE-chartered universities and TVETA-registered national polytechnics;
public-TVET fees are anchored to the verified consolidated annual fee,
which is why the verified count grew with the catalogue rather than being
diluted by it.

**38 of 81 course records now carry verified fees.** The Open University
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
