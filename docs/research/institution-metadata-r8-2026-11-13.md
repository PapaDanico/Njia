# R8 — Post-secondary institution metadata: baseline and verification ledger

**Prepared:** 13 November 2026. **Status:** desk audit of repository schema only; **no regulator records or live institution websites independently opened** in this pass. **Scope:** `data/institutions.js` on `main` at `992d9e4eec5d0dd008504daac01a1fb07ac48d10`. This is a research deliverable, **not** a verified national registry.

## Why this workstream exists

The current directory supplies a useful discovery index, but its `accreditation` field is free-text and its `website` field is not evidence that a specific campus or programme is currently approved. The file's own provenance notice explicitly says its entries have not been cross-checked line by line against current CUE/TVETA registers. Do not display these labels as verified approval without a source check.

The catalogue's previously reported **217 institution records** are listings in Njia, not the count of all recognised Kenyan institutions or physical campuses. Recompute from source before publishing any revised number.

## Observed existing fields

`id`, `name`, `ownership`, `type`, `location`, `county`, `accreditation`, `website`, `modes`, `has_workstudy`, `has_hostel`, `fee_regime`.

**Observed structural risks:** (1) `accreditation` mixes regulator, legal status, programme body and narrative caveats in one string; (2) `type: 'tvet'` is broad enough to mix specialised colleges and vocational institutions; (3) `location` is prose, not a campus identifier; (4) `has_hostel` and `has_workstudy` are booleans with no source date; (5) `website` has no explicit source-verification status; (6) no structured institution/campus/programme approval relationship is represented in these observed fields.

## Proposed normalized metadata — research schema, not a migration instruction

Keep existing IDs stable. Propose a separate, reviewable `data/institution-evidence.json` keyed by `institution_id`, rather than adding speculative properties to every production record. Suggested fields:

| Entity / grain | Fields | Required evidence |
|---|---|---|
| Institution | `institution_id`, `legal_name`, `trading_name`, `ownership`, `institution_category`, `regulator`, `regulator_reference`, `institution_status` | Dated official regulator register or institution legal record |
| Campus | `campus_id`, `institution_id`, `campus_name`, `county`, `physical_location`, `campus_status` | Named campus on official institutional or regulator source |
| Programme offering | `course_id`, `institution_id`, `campus_id`, `programme_code`, `qualification_level`, `offering_status`, `intake_year` | Current institution prospectus / placement listing; separate approval evidence where applicable |
| Programme approval | `approval_body`, `approval_reference`, `approval_scope`, `approval_status`, `effective_date` | Regulator approval for the **specific** programme and campus, if required |
| Admissions | `application_route`, `kuccps_participation`, `entry_grade`, `subject_requirements`, `intake_deadline` | Current cycle documentation, not prior-year cutoffs |
| Costs / facilities | `fee_schedule_url`, `fee_year`, `hostel_status`, `workstudy_status` | Official, dated institution-specific source |
| Evidence | `source_issuer`, `source_title`, `source_url`, `document_date`, `checked_at`, `claim_scope`, `confidence`, `reviewer_note` | Record exact claim and what it does not establish |

Every claim may have a different source, date and status. Avoid a single institution-wide `verified: true` switch.

## Priority verification queue

| Priority | Record group | First check | Never infer |
|---|---|---|---|
| P0 | Institutions with ambiguous legal/accreditation text | Match current CUE or TVETA institution register and category | Charter or current status from an old description |
| P0 | KMTC and other multi-campus institutions | Official campus list and campus-specific offerings | That a programme at one campus runs at another |
| P0 | Universities with several campuses | Official campus list, CUE status and programme approvals | Main-campus approval covering every satellite |
| P1 | National polytechnics, technical and vocational colleges | TVETA registration and current institution identity | Registration implies current KUCCPS intake |
| P1 | Teacher training, medical, specialist and professional colleges | Correct sector regulator plus programme-specific authority | TVETA alone covers every qualification |
| P1 | Institutions with non-institutional or stale website URLs | Official institution-owned domain and contact page | An aggregator or regulator page is the institution website |
| P2 | Hostels, work-study and study modes | Dated institutional source for each campus | One campus's facilities apply nationally |

**Specific lead, not verified finding:** `ilu` (International Leadership University) currently has an accreditation narrative mentioning an interim authority and a reported 2026 charter not confirmed from a second source. Resolve against the current CUE record before presenting a charter claim. Do not silently convert that narrative to a categorical status.

## Claim-level research ledger template

| institution_id | campus_id | claim_type | issuer | exact document title | URL | document date | checked_at | scope | observed claim | not established | confidence | conflicts | action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ilu | — | legal_status | **UNVERIFIED** | — | — | — | — | Kenya institution | Existing record includes conflicting historical/current status language | Current charter status | low | Needs current CUE confirmation | Research only |

For all further rows, record only documents actually opened or clearly label search snippets as leads. A website URL stored in the catalogue is **not** an opened source.

## Implementation sequence and acceptance gates

1. **Inventory:** Parse `INSTITUTIONS` and `COURSES`; report exact counts by institution type, ownership and county; duplicate IDs; reused names; unmatched `institution_id`; multiple campus-name patterns; non-institutional domains. Never interpret missing data as negative status.
2. **Source register:** For each candidate, identify CUE, TVETA, KUCCPS or other competent authority and the official institutional site. Log verified, inaccessible and contradictory sources separately.
3. **Evidence pilot:** Select 10 diverse records (public/private university, national polytechnic, technical college, vocational centre, KMTC campus, teacher-training and specialist institution). Populate the research ledger; do not change production accreditation claims yet.
4. **Schema pilot:** Create a small optional evidence overlay for reviewed records. Unknown status stays `null` / `unverified`. Keep existing app and generated pages working without it.
5. **Reconcile:** Only after reviewed evidence, propose explicit UI copy that distinguishes institution registration, campus recognition, programme approval and current offering.
6. **QA:** Unit checks for referential integrity, duplicate campus IDs, provenance, stale source dates and programme-campus mismatch. Browser, print and dark-mode checks for any changed UI. Regenerate artifacts in the sequence specified in `docs/CHATGPT-HANDOVER-2026-11-13.md`.

**Definition of done:** An inspectable evidence ledger and reviewed pilot records; no invented figures; no blanket verified badges; all new structured claims attributable to source and scope; no production deployment without Claude's review and the owner's approval.

## Handover alignment

This is an **additional R8 workstream**, not a replacement for R1–R7. Follow `CLAUDE.md` and `docs/CHATGPT-HANDOVER-2026-11-13.md` for source handling, testing, generator order and draft-PR workflow. The current work is documentation only: **no production catalogue entries have been modified or independently verified**.
