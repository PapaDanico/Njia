# R9–R12: National pathways expansion — research and implementation charter

**Date:** 13 November 2026. **Status:** implementation-ready research charter, not a verified national dataset. **Repository:** PapaDanico/Njia. **Delivery:** draft PR for Claude review; no merge or deployment.

## Executive objective

Extend Njia from a post-secondary programme catalogue into an evidence-led **education → qualifications → occupations → employment/enterprise** decision system. Preserve the buildless, accountless, privacy-first static PWA architecture, and existing institution/course IDs. No invented tuition, entry grades, employment rates, salaries, accreditation or admissions windows. All new production facts require independently reviewable provenance.

## R9 — Course and qualification coverage

**Discovery universe:** university degrees and postgraduate awards; diplomas, certificates, artisan/craft and competency-based TVET; teacher education; nursing, allied health and specialist clinical training; aviation and aircraft maintenance; maritime, logistics and transport; agriculture, agribusiness and food systems; engineering, manufacturing and construction trades; digital, cybersecurity and AI; business, finance, insurance and professional certifications; public service and uniformed service recruitment pathways; legal and regulatory professions; creative arts and media; tourism and hospitality; environmental, energy and climate occupations; social care, disability support and rehabilitation; sport and recreation; apprenticeships, trade tests, RPL and non-degree short courses.

**Critical source distinction:** qualification recognised by an awarding body ≠ programme approved at a particular provider ≠ offered at a particular campus ≠ currently open for admission. Do not derive one from another.

**Research row grain:** `qualification_id + institution_id + campus_id + academic_year + intake`. Track awarding body, qualification framework, title/aliases, mode, duration, programme code, admissions criteria, source URL/title/issuer/date, approval scope, and unresolved conflicts.

**Source queue:** CUE, TVETA, KNQA, KUCCPS, institutional prospectuses, professional regulators, examining bodies and official sectoral training authorities. Use exact current documents; a directory listing is a lead until provider and campus are independently established.

**Coverage QA:** duplicate qualification aliases, missing institution references, institution/campus conflation, outdated prospectuses, subject-grade vs mean-grade confusion, unsupported current-intake claims, course-family gaps and disproportionate geographic omissions.

## R10 — Complete cost-of-study intelligence

Fees are **not** a single number. Research tuition, admission/registration, examination, laboratory/practical, placement/attachment, insurance, equipment, books, uniforms, accommodation, meals, transport, connectivity, licensing/exam attempts and graduation charges, with each charge labelled mandatory/conditional/optional.

**Fee key:** `institution + campus + programme + academic_year + intake + fee_category + student_category + payment_period`. Store `source_issuer`, `source_title`, `source_url`, `source_document_date`, `checked_at`, `applies_to`, `confidence`, `known_exclusions`. Differentiate `published_exact`, `published_range`, `derived_from_published_components`, `illustrative`, `not_published`, `unverified`, `outdated`.

**Financial UX:** show (a) published tuition, (b) published compulsory extras, (c) separately sourced living costs, (d) unknown components, (e) funding options and deadlines, (f) the resulting *known subtotal* only. Never label a subtotal 'total cost' if required components are unknown. Never treat a mean monthly allocation as an authorised institutional instalment plan.

**Kenyan financing routes to research:** HELB, Universities Fund/student-centred funding, TVET funding, KUCCPS placement context, county bursaries, NG-CDF bursaries, institutional scholarships, employer sponsorship, apprenticeships and professional-body scholarships. Each has its own eligibility, current window, documentary requirements and verification date; avoid claiming that all learners qualify.

**Fee pilot:** 30 sourced programmes across public/private universities, KMTC, national polytechnics, technical colleges, teacher-training, specialist institutions, artisan routes and professional credentials. No inferred provider-specific prices.

## R11 — Occupation and opportunity atlas

Construct a **career-to-qualification graph**, not one career per course. For each occupation record tasks, environment, interests, skills, tools, hazards where relevant, professional regulation, licensing, supervised practice, entry routes, advancement, transferable skills, adjacent occupations, employment contexts, self-employment options and entrepreneurship considerations.

**Initial 20 sectors:** agriculture and food systems; health and care; education; aviation and aerospace; maritime and fisheries; construction and built environment; manufacturing and maintenance; energy and utilities; environment and climate; digital and telecoms; finance and insurance; law and compliance; public administration; security and emergency services; logistics and supply chains; hospitality and tourism; creative industries; retail and commerce; social services; sport and recreation.

**Emerging / underrepresented pathways to research:** drone operations and geospatial services; EV diagnostics; battery and solar systems; climate-smart farming; irrigation technicians; cold-chain operations; medical equipment servicing; assistive technology; cybersecurity operations; data governance; industrial automation; water and sanitation; elderly care; aquaculture; circular economy and e-waste; food safety; technical sales and field service; rural microenterprise.

**Labour-market evidence:** dated KNBS, government/sectoral occupational studies, job postings and professional registers, each clearly labelled for scope and limitations. Vacancy counts are not graduate employment probabilities. Never fabricate salary medians or demand scores.

**Career graph pilot:** 60 occupation profiles across all 20 sectors; for each, seek two documented entry routes, one adjacent career and one verified institution/programme link where available. Missing links remain explicitly unknown.

## R12 — Learner profiling, counselling and personalised decision support

Use four independent, **voluntary** dimensions: interests in concrete tasks (RIASEC-inspired but original questions), self-reported strengths and learning preferences, values/work setting, and practical constraints (verified qualifications, subject grades, location, cost ceiling, available time and accessibility support needs).

**Recommendation flow:** 1) classify verified hard admissions/licensing requirements; 2) distinguish unknown from ineligible; 3) rank interests/values separately from affordability and entry eligibility; 4) diversify options across occupations, qualifications and training lengths; 5) show reasons, exclusions, alternatives and missing evidence; 6) allow overrides and a human counsellor discussion guide.

**No pseudoscience:** avoid claims of validated personality diagnosis, '92% chance of success', IQ/aptitude from school grades, guaranteed employability or deterministic career destiny. Explain that a preference match is a self-reflection aid. Free text is never silently scored. Use original questions rather than copying proprietary inventories.

**Safeguards:** no gender, ethnicity, religion, disability or inferred socioeconomic status as exclusionary filters; accessibility preferences inform support needs, not rejection. Store profile on-device only, with explicit reset/export controls. No account requirement or person-level analytics.

**Scenario testing:** high grades/low budget; D or E grade seeking a practical trade; adult career changer; learner with no grades entered; rural learner unable to relocate; learner needing accessible delivery; learner seeking professional licensure; learner prioritising self-employment; interest/grade mismatch; undecided learner with contradictory preferences. Validate that each scenario receives honest alternatives and clear uncertainty.

## R13 — Adjacent services and institutional tools

**Counsellor toolkit:** printable learner interview, source-check checklist, family cost conversation, alternative-route worksheet, referral guide and anonymised group-session material. Build on existing `/counsellors/` rather than duplicating it.

**Parent/guardian view:** financing timeline, hidden costs, affordability sensitivity and application documentation without exposing a learner's private answers by default.

**Institution correction workflow:** public evidence submission as an offline/downloadable template initially; no unreviewed crowdsourced edits to the catalogue. Add corrections only through source review and versioned commits.

**Scholarship and opportunity clock:** distinguish *open now*, *upcoming*, *closed*, *date unknown*; do not infer an opening from a prior cycle. All deadlines need dated official sources.

**Geographic access:** county filters, verified campuses, transport and relocation considerations. Do not infer exact travel times or living costs from county centroids.

**Accessibility and low-bandwidth:** mobile-first, keyboard navigation, offline fallback, print, dark mode and generated no-JS content where appropriate. English only; no Kiswahili/localisation proposals.

## Proposed research data products (optional overlays; no forced migration)

- `data/qualification-evidence.json` — qualification and awarding-body claims.
- `data/programme-offering-evidence.json` — provider/campus/intake links.
- `data/fee-evidence.json` — scoped fee components and provenance.
- `data/career-atlas.json` — occupation profiles, source-backed tasks and requirements.
- `data/pathway-edges.json` — verified progression/alternative-route relationships.
- `data/profiling-question-bank.json` — original, non-diagnostic task-preference prompts.
- `docs/research/*.csv` — unverified leads and source-check ledgers.

Every evidence claim: `issuer,title,url,document_date,checked_at,scope,observed_claim,not_established,confidence,conflicts,status`. A single blanket `verified: true` on an institution is not acceptable.

## Phased execution with acceptance gates

**Phase A — Coverage measurement:** audit current 1,392 course listings, 217 institutions, fee-group distribution, qualification aliases, county/campus coverage, existing career inventory and profiling logic. Recompute, never assume these counts remain current.

**Phase B — Source collection:** produce institution-specific ledgers for 30 fee pilots and 60 career profiles; official-source verification for course/qualification leads; every unresolved candidate retained as a lead, not invented production data.

**Phase C — Prototype:** optional, backwards-compatible evidence overlays and pure functions for fee subtotals, eligibility uncertainty, explainable preference ranking and alternative-route traversal. No new runtime dependency or backend.

**Phase D — User-facing integration:** verified course/fee detail, career cards, why-this-route explanations, financing view, printable plan and counsellor tools; reuse existing pages and design system.

**Phase E — Release gates:** native Node suite, JS syntax checks, generator order/idempotence, browser functional probe, axe light/dark, print, offline and low-bandwidth testing. Report tests run versus unavailable. Claude reviews draft PR; owner authorises merge/deployment.

## Important limits of this charter

This document **expands scope and specifies deliverables**; it does not falsely claim that the fee schedules, national registers, professional requirements or 60 occupation profiles have been independently researched. No specific new tuition amount, admission threshold, employment rate or accreditation status is approved for production by this charter.

## Handover coordination

This is an additive **R9–R13** expansion to `docs/research/institution-metadata-r8-2026-11-13.md` and Claude's R1–R7. Follow `CLAUDE.md` and `docs/CHATGPT-HANDOVER-2026-11-13.md`; do not repeat merged PR #159–#165; do not modify Netlify settings; submit reviewable changes only in draft PRs.
