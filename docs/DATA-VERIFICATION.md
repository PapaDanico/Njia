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

57 courses across 35 institutions in 10 counties, covering all six
clusters (7–11 courses each) and all three qualification levels. The
expansion added real CUE-chartered universities and TVETA-registered
national polytechnics; public-TVET fees are anchored to the verified
consolidated annual fee, which is why the verified count grew with the
catalogue rather than being diluted by it.

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
