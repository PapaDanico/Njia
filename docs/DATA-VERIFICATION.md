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


## Skilled trades — the hardest evidence against prestige bias

| Measure | Figure |
| --- | --- |
| Certified artisan day rate | **Ksh 2,500–3,000** (up from Ksh 500–1,000 in 2012) |
| Engineers and architects countrywide | ~5,000 |
| Trained plumbers, painters and masons | **fewer than 2,000** |
| Developers naming skilled-worker shortage as the main brake on construction | two-thirds |
| Construction professional demand | 260,000 today → 410,000+ by 2035 |
| Fastest wage growth | Carpenters, painters, welders, mechanics |

*Sources: KNBS construction labour index; Kenyan construction-sector reporting, cross-reported August 2026.*

Only 8,915 candidates who earned a degree place chose TVET instead. The
assumption behind that is that a degree pays better. In the trades the numbers
say otherwise, and this is now stated on the landing page beside that figure
rather than left as an unexplained sign of "prestige bias".

**The caution is enforced, not optional.** Ksh 2,500–3,000 is a *day rate* for
*certified* work. The work is often irregular and seasonal, there is no
employer pension, paid leave or sick pay, and uncertified work pays a fraction
of it. `tests/provenance.test.js` fails if the caution stops naming the day
rate, the irregularity, or the certification condition — because presenting a
day rate as monthly income would be the same false precision this register
exists to remove, just in the flattering direction.


## The absorption gap — vacancy is not hiring

The correction that keeps the rest of this register honest.

| Sector | The shortage | And yet |
| --- | --- | --- |
| Health | Needs 311,060 workers, has 234,140 — 76,920 posts unfilled. Nurse ratio 22.7 per 10,000 against WHO's 25, and the 60 needed for UHC. Gap projected to widen 49% to 114,352 by 2031. | Thousands of trained nurses are unemployed or underemployed, waiting on delayed public-sector absorption. The constraint is the hiring budget, not the need. |
| Teaching | TSC estimates a shortage of ~96,345 teachers (38,054 primary, 58,291 post-primary); junior schools alone short 72,000+. | Much hiring is on internship rather than permanent and pensionable terms, driving rejected posts, low morale and litigation. |

*Sources: Kenya health labour market modelling 2021–2035; TSC staffing reporting; cross-reported August 2026.*

Njia now carries KMTC nursing across 45 counties and names health and education
as Kenya's largest employers. All true — and quoting only the shortage would
tell a seventeen-year-old that a nursing diploma leads straight to a job. That
is the same true-but-incomplete failure as quoting the widest BPO figure.

Both facts hold at once. The shortage is real and is a reason to train. The
absorption delay is real and is a reason to plan for it: private and
faith-based facilities, county contracts and NGO roles absorb faster than
national public hiring. `tests/provenance.test.js` fails if any sector states a
shortage without an absorption reality and a planning instruction beside it,
and specifically requires the `carer` cluster — which carries the nursing
expansion — to be covered.


## Online work — real, growing, and oversold

| Measure | Figure |
| --- | --- |
| Kenyans in digital work | ~600,000 (2019) → **2.4 million (2023)** |
| Trained through Ajira Digital | ~391,000 |
| Government ICT centres | 400+ |
| Share of participants earning any income | 5% → **28%** |
| Average monthly earnings | Ksh 2,600 → **Ksh 7,766** |

*Source: Ajira Digital programme reporting and Kenyan digital-economy coverage, cross-reported August 2026.*

"Learn digital skills and earn online" is marketed hard to Kenyan youth, and
participation is genuinely large. The earnings are more sober: the share
earning any income rose to 28%, which also means **roughly seven in ten trained
participants were earning nothing from it**, and average monthly earnings of
about Ksh 7,766 sit well below the formal-sector figures elsewhere in this
register.

**The connection nobody selling these courses will make:** the entry-level
digital work most commonly trained for — transcription and data entry — is the
same category the WEF Future of Jobs Report puts among the **fastest declining**
roles as generative AI matures. It is not worthless, but it is a shrinking
floor, and the way up is toward work that is harder to automate: client
relationships, judgement, specialist domains.

A test enforces that the AI caution names both the decline and the specific
roles, and cross-checks that those roles still appear in the declining list —
so the two datasets cannot drift apart and leave the claim unsupported.


## Entry pay — the question the averages could not answer

Sector averages include consultants and principals. They could never answer
"what will I actually start on", which is the question a school-leaver is
asking. These are entry figures.

| Role | Monthly | Note |
| --- | --- | --- |
| Nurse (KRCHN), private hospital | Ksh 20,000–35,000 | Faster to get than a public post, paid less for it |
| Nurse (KRCHN), public scheme of service | ~Ksh 50,000 | Better paid, slow county absorption |
| Nurse, ~5 years in | Ksh 70,000+ | Same qualification, later |
| Teacher, TSC Grade B5 (diploma entry) | Ksh 28,600–37,100 | Plus Ksh 4,000 commuter allowance; first step is often an internship |
| Certified artisan (~22 days at day rate) | Ksh 55,000–66,000 | **Best case, not expectation** — work is irregular |
| Online/freelance digital work (average) | Ksh 7,766 | Below half the urban minimum wage |

**The yardstick:** Kenya's urban minimum wage is **Ksh 16,114/month**
(Regulation of Wages (General) (Amendment) Order 2026, Gazette Supplement 128,
Legal Notices 95/96, effective 1 May 2026). Without it, "Ksh 7,766 from online
work" reads as a number rather than as less than half the legal floor.

A test fails if any cluster lacks an entry figure, and if online work ever
clears the urban minimum wage — because then the "oversold" framing needs
revisiting rather than keeping.

## The loan trap, and the action that defuses it

Three facts that are never set out together:

- HELB grace period after graduation: **12 months**
- Penalty for not starting repayment: **Ksh 5,000/month**
- Average time for a Kenyan university graduate to find a job: **five years** (World Bank)

A graduate who takes the average time and does nothing is exposed to years of
penalties. But HELB accepts **Ksh 1,500/month** from someone unemployed or
underemployed — a third of the penalty. Roughly 360,000 beneficiaries are in
default.

Njia states the trap **and** the action: start the Ksh 1,500 minimum the month
grace ends, employed or not. A test fails if the trap is ever stated without
it, because alarming a young person without telling them the cheap fix is worse
than saying nothing.

## Repetition audit

Twelve evidence layers were added quickly and facts began appearing in several
of them. A rendered-text audit found the results card running to **~1,000
words** with "shortage×4", "BPO×4" and "digital×4" per cluster.

Fixed by consolidation rather than deletion: entry pay and the decision-relevant
panels now lead, and sector averages, demand signals, automation exposure and
the future-of-work evidence moved behind a single disclosure. Duplicated
records were pruned — the BPO breakdown lives only in the online-work layer, and
two demand signals that restated the ICT and health stories were removed or
rewritten.

**Visible text fell from ~1,000 words to 260–486 per cluster**, every cluster
now leads with a real starting figure, and repeated-phrase counts are at or
near zero. Nothing was lost; it is one tap away instead of a wall to scroll.


## The structural change under Njia's feet

Kenya's first competency-based cohort entered senior school in **January 2026**.

Under 8-4-4 every learner followed a broadly similar curriculum to KCSE and
chose afterwards — the world Njia was designed for. Under CBE the learner picks
one of three pathways at **Grade 10, at roughly age 14–15**, on their KJSEA
results, and that choice shapes the subjects they take and the courses open to
them at Grade 12.

| Pathway | Covers | Njia clusters |
| --- | --- | --- |
| STEM | Science, technology, engineering, mathematics | tech, numbers |
| Social Sciences | Humanities, business, languages, policy | people, business, carer |
| Arts and Sports Science | Creative, performance, sports | creator |

**The decision Njia exists to support has moved roughly three years earlier.**
Njia currently meets people after KCSE, which under this system is *after the
decisive choice has already been made*. That is a scope question rather than a
data point, and it is recorded here because the catalogue and the cluster model
both have to answer it eventually. A test keeps the pathway-to-cluster mapping
valid and requires every cluster to be reachable from some pathway.

## The placement calendar — dates, not prose

The Application Clock previously showed only funding deadlines. It now computes
which placement windows are genuinely open **from dates**, because a hardcoded
"applications close in May" quietly becomes a lie in June.

| Window | Opens | Closes |
| --- | --- | --- |
| KUCCPS main application | 2026-04-07 | 2026-05-06 |
| KUCCPS second call | 2026-05-16 | 2026-05-22 |
| KMTC March intake | 2026-01-07 | 2026-01-27 |
| Inter-institutional transfer | 2026-06-01 | 2026-08-14 |
| Kenya Utalii College (Kilifi) | 2026-06-01 | 2026-08-23 |
| KMTC September intake | 2026-07-01 | 2026-09-30 |
| TVET placement (continuous) | 2026-05-01 | 2026-12-31 |

*Source: KUCCPS 2026 cycle announcements, cross-reported August 2026.*

TVET is deliberately the longest-open route, and a test fails if it ever stops
being — it is the door that stays open after the main cycle closes, which is
exactly the message a student who missed the window needs.


## How degree placement actually works — a correction to Njia's own model

Njia stores a `min_grade` per course and told the user whether they met it. For
certificates and diplomas that is close enough. For degrees it was misleading.

| Concept | What it actually is |
| --- | --- |
| Mean grade (C+ for degrees) | Decides whether you may **apply** |
| Weighted cluster points | Decides **placement** — performance in the four subjects that programme requires, ranked against every applicant, to three decimal places |
| Cut-off point | The cluster score of the **last student placed** last cycle. An outcome, not a bar set in advance |

*Source: KUCCPS placement guidance and 2026 cycle explainers, cross-reported August 2026.*

Two consequences now stated plainly in the app. **Meeting the mean grade makes
you eligible to apply, not placed** — the "Why this match?" breakdown says so
for degree courses specifically. And **chasing last year's cut-off is chasing a
number that no longer exists**; it moves annually with demand, capacity and
cohort performance, and meeting it still does not guarantee a place.

Njia previously said "your grade meets it" with a positive signal and stopped
there. A student reads that as "I am in". For the single most consequential
claim this app makes, that was too little of the truth.


## Where the room actually is — the mechanism behind the capacity paradox

`EDUCATION_PIPELINE` records that middle-level colleges hold over 1.1 million
places against 293,869 placements. This is how that happens in practice.

| Fills first | What happened | Where the room is |
| --- | --- | --- |
| Medicine and surgery, degree nursing, pharmacy, architecture, engineering | **Removed from the KUCCPS portal outright** once slots were exhausted in the *first* application window, which closed 6 May | Roughly **1.1 million vacancies** remained across national polytechnics and specialised training institutions |

*Source: KUCCPS 2026 placement cycle reporting, cross-reported August 2026. The
1.1 million figure independently corroborates the 1,132,531 middle-level
capacity recorded from the placement data.*

The cap is not arbitrary and the register says so: professional regulators —
the Medical Practitioners and Dentists Council, the Engineers Board — limit
intake so students-per-lecturer and students-per-laboratory ratios stay
workable. **The cap protects the quality of the qualification you would be
getting.**

**The distinction that matters most for this catalogue:** degree nursing is
among the most oversubscribed programmes in the country, while the KMTC diploma
route into the same profession runs at campuses in 45 counties and is genuinely
reachable. Same field, completely different odds. Njia ships 60+ KMTC nursing
records; if that distinction were ever dropped the catalogue would start reading
as a promise it cannot keep, so a test enforces it.

Naming the closed door without naming the open one is discouragement rather than
navigation, so a test also requires the alternative and an actual instruction —
apply early, because competitive programmes close in the first window rather
than at the published deadline, and put a reachable second and third choice on
the form rather than three versions of the same long shot.


## Bursaries fail on paperwork, not on merit

The most useful thing found about bursaries is not an amount. It is that
**most applications fail on missing documents**, and that incomplete forms are
commonly disqualified outright rather than returned for correction.

Njia listed three or four requirements per bursary. Both the NG-CDF and county
records now carry the full checklist:

- Application form (local NG-CDF office, or ward/county office)
- Fee structure from the institution
- Admission or continuing-student letter
- **Chief or local administrator letter** confirming ward/county residency (county bursaries)
- **Student national ID or birth certificate**
- **Parent/guardian national ID**
- **Latest performance report or transcript**
- **Form taken back to the school/college to be confirmed and stamped**
- If orphaned or living with disability: death certificate, or a letter from the chief or a community leader

Plus the instruction that actually changes the outcome: write in clear CAPITAL
letters and do not submit an incomplete form.

*Source: NG-CDF and county bursary application guidance, cross-reported August
2026. Requirements are process rather than amounts, so they generalise across
counties; the county record remains `illustrative` on its figures.*

This is the cheapest possible improvement to a real disbursement rate. A young
person who assembles nine documents before starting, rather than discovering the
ninth after the deadline, is materially more likely to be funded.

## The route for people who already have the skill

Njia's whole model assumed the user is choosing what to study. But 83.8% of
Kenyan workers are informal, and the day-rate data already showed the sharpest
fact in the trades: **the certificate is what earns the rate.** A competent
mason without paper and a certified one doing the identical job are paid
differently. Njia had nothing to say to the first person.

**Recognition of Prior Learning (RPL)** is the route, and it is badly
under-advertised.

| | |
| --- | --- |
| What it is | A structured assessment that certifies skills, knowledge and competence gained through work, informal training or life experience, and converts them toward a formal qualification |
| Who it is for | Artisans, technicians and tradespeople already working — the jua kali sector — competent but holding no certificate |
| Who runs it | TVETA with the Kenya National Qualifications Authority and ILO support; pushed for by the Federation of Kenya Employers and the Kenya Jua Kali Association |
| Scale so far | **Over 600 certificates** awarded under the programme |
| The honest limit | A young programme. Coverage across trades and counties is uneven. Not yet a national service you can sign up to online — expect to approach TVETA or an accredited assessment centre directly |

*Source: TVETA / KNQA Recognition of Prior Learning Policy Framework (June 2021)
and ILO reporting on RPL implementation, cross-reported August 2026. Confidence:
`cross-reported`. The 600-certificate figure is the weakest element — it is a
programme-to-date total with no published per-county or per-trade breakdown, so
Njia states it as "real but early" rather than as coverage.*

This completes a chain the dataset had already half-drawn: informal majority →
certification premium → **the mechanism for crossing it**. It ships with its
limit attached, because sending someone to a service that may not operate in
their county is worse than saying nothing.

## The attachment nobody plans for

`SKILLS_MISMATCH` already named "an attachment" as one of the things that
closes the employability gap — and then said nothing more, as though it were
something that happens to you. It is not.

| | |
| --- | --- |
| Status | **Mandatory** in most university and TVET programmes — not an optional extra |
| Who administers it | NITA, via a national portal (ITAP) at nita.go.ke → Our Services → Industrial Attachment |
| Scale | NITA facilitates **55,000+** placements a year, public and private sector |
| The competition | Thousands chase the same state corporations and large firms each intake; the institution does not guarantee a place |
| The actionable part | **Register in year one, not the term it falls due** |
| The honest limit | Supply of good places has not kept pace with enrolment — the State Department for TVET is now pushing to bring industry into institutions instead |

*Source: NITA industrial attachment scheme and Kenyan TVET/university programme
requirements, cross-reported August 2026. Confidence: `cross-reported`. The
55,000 figure is NITA's own placement throughput and is stated as scale, never
as availability on demand — a test asserts the copy cannot read as a guarantee.*

## Working abroad: the correction is the headline

This is the highest-risk record in the dataset, and it is in Njia specifically
because it is misreported.

Kenya and Germany signed a Migration and Mobility Partnership in Berlin on
**13 September 2024**. Kenyan coverage reported it as *"Germany opens 250,000
jobs to Kenyans."*

**That number is not in the agreement.** Germany's Interior Ministry stated
publicly that the deal specifies no quota. The figure came from Kenya's
presidency describing an ambition.

Njia leads with the correction rather than burying it, because a young person
planning around 250,000 guaranteed openings is planning around something that
does not exist. A test asserts the correction names the figure it corrects and
cannot be dropped from the record.

| | |
| --- | --- |
| What is genuinely in it | No German labour-market test for skilled workers from Kenya; residence permit once an approved job is held; long-stay visas for study and vocational training (Ausbildung) with a route to work afterwards |
| Where demand is | Healthcare and nursing, engineering, IT, transport, hospitality |
| **The actual gate** | German language and formal recognition of the qualification — *not* the agreement |
| Detail | Regulated professions (e.g. nursing) need German at **B1–B2** depending on federal state, plus recognition (*Anerkennung*), up to four months once documents are complete, usually with a concrete job offer |
| The 2024 opening | Since 1 March 2024 a Recognition Partnership permits entry before recognition is complete; IT specialists can qualify on demonstrated skill without a formal qualification |

*Source: ILO reporting on the Kenya–Germany bilateral labour agreement; the
signed Migration and Mobility Partnership; German Skilled Immigration Act
guidance. Cross-reported August 2026. Confidence: `cross-reported`.*

The gate is deliberately stated twice — a short form that stays visible in the
collapsed card, and the mechanics behind progressive disclosure — so that a
reader who never expands the block still cannot come away thinking the hard
part is getting a visa. A real route, and a narrow one.

## Capitalising yourself — the gap Njia's own headline finding left open

`INFORMAL_ECONOMY` says 83.8% of Kenyan workers are informal and 87.2% of last
year's new jobs were too. That is a statement that **most readers of this
platform will create their own work rather than be hired into it** — and Njia
then said nothing at all about capitalising yourself. The single most likely
path was the one path unserved.

### The correction that has to come first

The Hustler Fund is what almost everyone names, and **it is not business
capital.**

| | |
| --- | --- |
| Average loan | **~Ksh 300** |
| Repayment tenure | **14 days** |
| Product range | Ksh 500 – 50,000 |
| Annual interest | 8% — genuinely the cheapest credit in the country |
| Savings withheld | 5% of the amount borrowed |

It is not dismissed: the rate is real and the forced-savings component is
useful. But a fortnight loan of a few hundred shillings smooths a bad week — it
does not buy stock, tools or a lease. Analysts read the average ticket size as
a measure of how thin household margins are, not as evidence of enterprise.

### Why the default rate is published as both 15% and 64%

Both numbers are real, and they measure different things:

- **~15–20%** — share of the *value* lent that is currently unpaid
- **The large majority** — share of *borrowers* who have ever fallen behind

Njia ships both denominators rather than picking the one that suits the
argument, and a test asserts neither can be dropped. A reader who has seen one
headline needs to know why they have also seen the other.

### The instrument that actually finances a business

| | |
| --- | --- |
| Fund | Youth Enterprise Development Fund (est. 2006) |
| Age | 18–34 |
| Rausha (startup) | Ksh 100,000 |
| Inua (expansion) | From Ksh 200,000, graduating to Ksh 1,000,000 |
| Cost | **Interest-free**, one-time 5% management fee deducted before disbursement |
| **The gate** | Group loans: ≥5 members, 70% youth, youth leadership, active bank account, registration certificate from Registrar of Societies or Social Services. Individuals: a registered business |
| Where | Sub-county/constituency HQ, any Huduma Centre, or youthfund.go.ke |

The gate is **a group and a certificate, not a credit score** — which is the
part worth knowing early, because assembling five members and a registration
takes months. That is the actionable line, and it is the one kept visible in
the collapsed card.

*Source: Hustler Fund published terms and disbursement reporting; Youth
Enterprise Development Fund loan products and eligibility (youthfund.go.ke);
Kenyan economic analysis of Hustler Fund outcomes. Cross-reported August 2026.
Confidence: `cross-reported`.*

**Honest limit, and it is a live one:** government has announced a **Biashara
Fund** merging the Youth, Uwezo and Women Enterprise funds. As of 2026 the
individual funds still operate and the consolidation is unfinished, so the
branding and the forms will change. The copy says to confirm current terms at
the constituency office before planning around any figure, and a test asserts
that caveat cannot be dropped.

## Repetition audit, second pass — and the bug it uncovered

Measured against the live DOM in its **collapsed default state** across all
seven pages (the first pass wrongly force-expanded every `<details>`, which
counted text no user ever sees).

| Repeated string | Before | After |
| --- | --- | --- |
| `Diploma in Kenya Registered Community Health Nursing (KRCHN)` | **133x** | 3x |
| `Varies by town — plan, don't rely on this figure.` | 19x | 1x |
| Consolidated public-TVET fee provenance note | 7x | collapsed per card |

### The 133x was not a copy problem

It was the Odyssey **anchor-course picker**. Course names are not unique —
KMTC teaches identical programmes at every campus, so *Diploma in KRCHN* is
**44 separate records**. The picker labelled options by `course.name` alone,
so it rendered 44 identical lines and a user choosing an anchor course was
choosing blind. Options are now labelled `name — institution`, which takes
duplicate labels across the whole 167-course catalogue from **44 to zero**.
A test asserts that pairing stays unique, and also asserts that bare names
still collide, so the guard cannot quietly become vacuous.

The residual 3x is the three Odyssey plan selectors each listing the
catalogue — inherent to having three plans, and now distinguishable.

### Provenance was not stripped to win the count

127 of 167 courses carry a fee-verification note, but there are only **8
distinct notes** — 86 of them the same KMTC one. Rendering it open on every
card meant reading the same paragraph down the whole grid. It is now inside a
collapsed `<details class="fee-provenance">` **on the card**, so it still
travels wherever the card goes (comparison, saved views) rather than being
hoisted to a page-level footnote that a detached card would lose.

The one line genuinely moved is the cost-of-attendance caveat, which is
generic advice rather than provenance: it now sits once above the grid, where
it correctly applies to every card at once.

## Two claims Njia was making that its own data does not support

### 1. "167 courses" was breadth inflated more than twofold

| | |
| --- | --- |
| Course records | **167** |
| Distinct programme names | **73** |
| Institutions | 83 of 86 carry courses |
| Counties | 45 of 47 |

The catalogue holds one record per *programme-at-institution*. That is the right
shape for **"where could I apply"** — a KMTC diploma in Nairobi and the same
diploma in Kisumu are genuinely different options, with different commutes and
different competition. It is the wrong shape for **"how many courses are
there"**, because KMTC teaches one national programme set across 44 campuses.

Both numbers are true; they answer different questions. Every surface now says
which it means:

- Landing: *"73 distinct programmes across 6 career clusters, offered at 167
  places you could apply"*
- Coverage rail: `73 distinct programmes` / `167 places to apply`
- Results: *"X of 167 **places to apply** match your filters"*

A test scans `app.js` and `decide.js` and fails if any non-comment line pairs
`COURSES.length` with the word "courses". It also asserts
`DISTINCT_PROGRAMMES < COURSES.length`, so if the duplicate-campus shape ever
changes the copy gets rechecked rather than silently going stale.

### 2. Illustrative outcomes were still ranking results

Fees are **125 of 167 verified (75%)**. Outcomes are **0% verified** — every
`outcomes_confidence` in the catalogue is `illustrative`, because Kenya
publishes no per-course graduate outcomes (confirmed negatively against TVETA,
the education ministry and KIPPRA).

Those figures were nonetheless doing two ranking jobs:

- **A "Highest Employment (est.)" sort option.** The `(est.)` label was the
  earlier mitigation and it was not enough. A label qualifies the *number*
  while the ordering still asserts a *ranking* the data cannot support.
  **Removed.**
- **A shaded "best value" cell** on the Employment Rate and Median Salary rows
  of the comparison table. A shaded cell is the app declaring a winner between
  two invented figures. **Removed** — the values still show, marked `est.`

The principle, now encoded in tests: **sorting is a stronger claim than
display.** An estimate may be shown when it is marked as one; it may not decide
what comes first.

This closes the exact failure recorded at the top of `tests/provenance.test.js`
— *"an invented employment rate rendering under a Verified badge, sorting the
results list, and picking the comparison table's winner."* The badge was fixed
earlier in the project; the sorting and the winner were not, until now.

Returning users whose saved state still holds `sortBy: 'employment'` are healed
to `match` on render, so the dropdown cannot show one thing while state says
another.

**Also corrected:** the coverage rail rendered lowest tuition as a bare `0`,
which reads as missing data. Two OUK short courses genuinely cost nothing, so
it now reads **Free**.

*Each of the three new guards was negative-tested — reintroduce the violation
and the suite fails 1, restore and it passes 85.*

## The CBE pathway decision — settled, and what was decided

This was carried as an open scope question for several rounds. It is now closed.

### The finding that settled it

Under CBE, learners take **7 subjects** at senior school: 4 core (English,
Kiswahili or KSL, Community Service Learning, Physical Education) plus **3
pathway subjects**. And those three pathway subjects **become the subjects a
degree programme later requires.**

That makes the Grade 10 choice a harder gate than any grade. Njia already
teaches two gates:

| Gate | What it decides | Recoverable? |
| --- | --- | --- |
| Mean grade | Whether you may **apply** | Yes — retake |
| Weighted cluster points | **Placement**, ranked against every applicant | Yes — improve subjects |
| **CBE pathway subjects** | **Which programmes require subjects you hold** | **No** |

An A in Social Sciences subjects does not open engineering, because the
engineering cluster asks for subjects that pathway does not teach. **Grades can
be improved. A subject you never sat cannot be.**

### What was decided

**Njia does not become a Grade 10 pathway diagnostic.** Njia's own evidence card
states that vocational interests only reach adult stability (r ≈ .70) at ages
25–30, and that interest–choice alignment *dips* at decision points. Building an
interest-based diagnostic for 14-year-olds would contradict the research the
platform cites on its own results page. The Decide module — fees, funding,
placement, cut-offs — is also meaningless to someone in Grade 9.

**Njia does state the constraint, plainly, where someone will meet it.** This is
the third correction in the same family and it is recorded as such in the Help
answer, which explicitly ties it back to the grade/cluster-points correction.

**Njia does not filter the catalogue by pathway** — recorded in
`whyNjiaDoesNotFilter` and enforced by a test that fails if `decide.js` ever
references pathway. Filtering needs a verified map from each pathway's subjects
to every programme's required subjects. No such map is published in a form worth
trusting with someone's options, and a confident filter built on a guess would
quietly hide courses a person can actually do. **Inform, do not gate.** That
restriction is written to be lifted the moment the mapping is sourced.

### What is deliberately not answered

Whether, and how, a learner can switch pathway **once senior school has already
begun** is not clearly published. It was searched for and not found. Silence
would read as "cannot be changed"; a guess would be invention. The record carries
`whatIsNotPublished`, a test asserts it survives, and the Help answer says
outright that Njia will not guess and to ask the school and the portal directly.

What *is* verified: choices are made through the Ministry portal at
`selection.education.go.ke`, and a change before reporting is requested by a
parent through the Head of Junior School, at least two weeks before the January
reporting date.

*Source: Ministry of Education Grade 10 Selection and Placement System
(selection.education.go.ke), KICD Basic Education Curriculum Framework and senior
school curriculum designs, KNEC senior school placement material, and KUCCPS
degree cluster documentation. Retrieved August 2026 via search indexing of those
publishers. Confidence: `cross-reported`.*

> **Correction to an earlier version of this section.** It stated that
> `selection.education.go.ke` "is blocked by this environment's egress proxy, as
> are all `.go.ke` domains tried this session, so the primary source could not be
> read directly." That was too broad and it stopped research that should have
> continued. **`WebFetch` is blocked for these hosts; domain-restricted search is
> not.** Searching the publishers directly returned materially better material —
> the Ministry's coded subject-combination table, the pathway *track* structure,
> the curriculum framework's intended pathway spread, and the KUCCPS degree
> cluster document. What remains true is narrower: the PDFs themselves could not
> be read line by line here, so figures are attributed to the publisher rather
> than quoted from the document, and a test asserts that limitation travels with
> the source string.

### Timing

The first CBE cohort entered Grade 10 in January 2026 and reaches placement
around **2029**. Nothing here is broken for today's KCSE users. It was worth
doing now because Njia was silent for every parent or older sibling advising a
Grade 9 student today — and because `CBE_PATHWAYS` had been sitting in the
dataset **exported but never rendered anywhere**, which this also fixes.

## CBE, second pass — what searching the publishers directly turned up

Three findings the first pass missed, and one correction to its reasoning.

### The unit of choice is narrower than a pathway

A pathway is only the top level. Inside it sits a **track**, and inside that a
**coded three-subject combination** — and a school offers only some of them.

| Pathway | Tracks |
| --- | --- |
| STEM | Pure Sciences · Applied Sciences · Technical Studies |
| Social Sciences | Humanities · Business Studies · Languages · Foreign Languages · Religious Education |
| Arts and Sports Science | Performing and Visual Arts · Sports Science |

**The school you are placed in narrows your combination as much as the pathway
does.** That is the actionable part, and it argues for checking which
combinations a school actually offers *before* ranking it among your twelve
choices.

### The spread is a design target, not an accident

The Basic Education Curriculum Framework expects roughly **60%** of senior
school learners in STEM, **25%** in languages and social sciences, and **15%**
in sports science and the performing and visual arts.

This is recorded as `intendedSpread` and rendered explicitly as *"a planning
target rather than a measured result"* — it describes how the system was built,
not where the first cohort landed. A test fails if that framing is dropped,
because this project has spent its life removing figures that read as
measurements when they are not.

What it usefully tells a reader: choosing outside STEM puts you in a minority
the system planned for, not a mistake — and choosing STEM puts you in the stream
intended to be the most crowded.

### The no-filter reasoning was wrong, and is now precise

The earlier record said filtering was refused because the pathway-to-programme
map "is not published in a form worth trusting". **Both halves of it are
published:**

1. **CBE side** — the Ministry's full pathway/track/subject-combination table,
   with codes, at `selection.education.go.ke`.
2. **Placement side** — the KUCCPS degree cluster document, giving every
   programme's four required cluster subjects.

What genuinely does not exist is **the bridge**: an authoritative account of how
a CBE three-subject combination will satisfy cluster requirements that are still
written in KCSE subjects, for the first cohort reaching placement around 2029.

The decision not to filter stands — but for the accurate reason. Njia will not
invent the bridge, because that is precisely the rule that would decide whether
someone's options get hidden from them. A test now asserts the word "bridge"
survives in the stated reason and that the old overstated wording cannot return,
since a vaguer reason invites a future contributor to "fix" it by building the
filter on a guess.

## CBE, third pass — the maths fork

Pushing past "the PDFs can't be read" reached the actual subject lists, and one
rule that outranks everything else in this section.

### Track subjects, as published

| Pathway | Track | Subjects |
| --- | --- | --- |
| STEM | Pure Sciences | Physics · Chemistry · Biology · General Science |
| STEM | Applied Sciences | Computer Science · Home Science · Agriculture |
| STEM | Technical Studies | Aviation · Building Construction · Electricity · Metal Work · Power Mechanics · Woodwork · Media Technology · Marine and Fisheries Technology |
| Social Sciences | Humanities and Business Studies | Religious Education (CRE/IRE/HRE) · Business Studies · History and Citizenship · Geography |
| Social Sciences | Languages and Literature | Literature in English · Indigenous Languages · KSL · Fasihi ya Kiswahili · Arabic · French · German · Mandarin |
| Arts and Sports Science | Arts | Music and Dance · Theatre and Film · Fine Art |
| Arts and Sports Science | Sports Science | Physical Education · Sports and Recreation |

In Pure Sciences and Applied Sciences you take **at least two** subjects from
the track's own list plus one more from elsewhere in STEM.

### The quietest irreversible choice in the system

Senior school splits mathematics in two, and **which paper you sit is decided by
your pathway.** It does not look like a choice. It looks like a timetable.

| | |
| --- | --- |
| The rule | STEM learners take **Core Mathematics**; Social Sciences and Arts and Sports Science learners take **Essential Mathematics** |
| The bar | Pure Sciences learners **must** register Core Mathematics and are **barred** from Essential |
| Essential covers | Functional algebra, financial mathematics (interest, taxation, budgeting), basic statistics, measurement, applied quantitative reasoning |
| Core covers | The above plus advanced reasoning, algebra, statistics and problem-solving |
| Core is wanted by | Engineering, medicine, data science, actuarial science, architecture, economics, physical sciences |
| Essential suits | Law, journalism, creative arts, social work, business management, entrepreneurship, vocational trades |

### The exemption — the only part anyone can act on

**A learner outside STEM may be permitted to take Core Mathematics anyway,
provided their junior school assessment shows adequate preparation.**

Almost nobody is told this exists. It is the difference between a Social
Sciences learner keeping accounting, economics or actuarial science open and
quietly losing them at fourteen. The copy therefore leads on the *timing*: ask
before the combination is registered, and early enough that junior school
results can still be put forward.

A test asserts the exemption, its condition, and the "before your combination is
registered" timing all survive — the rule on its own is trivia, and only the
exemption is actionable.

### Provenance discipline on this section

The **rule** (who sits which paper, who is barred, that a permission provision
exists) is consistently reported across specialist education outlets.

The **list of degrees requiring Core Mathematics is informed specialist
guidance, not a published KUCCPS requirement.** It ships hedged as *"will almost
certainly want"*, carries an explicit confidence note, and **a test fails if that
hedge is ever removed** — this project has spent its life separating "reported"
from "regulated", and this record must not quietly promote one to the other.

*Source: Kenyan specialist education press reporting on the Ministry of
Education senior school mathematics structure and Grade 10 subject registration,
cross-reported August 2026. Confidence: `cross-reported`.*

### Scale — what makes the school constraint concrete

**STEM alone carries 161 subject combinations** across its three tracks. No
school offers anywhere close to that, which is precisely why the twelve schools
a learner ranks decide their real options as much as the pathway does.

Combination counts for Social Sciences and Arts and Sports Science were **not
found**. Njia therefore quotes the STEM figure only and states the gap — a
system-wide total would be a guess dressed as arithmetic. A test asserts the
count is attributed to STEM specifically, that the missing counts are admitted,
and **fails if any system-wide total is ever asserted**.

## Re-testing the negative that the sorting restriction rests on

Every `outcomes_confidence` in the catalogue is `illustrative` because Kenya
publishes no per-course graduate outcomes. That negative is load-bearing: it is
the reason the Decide sort offers no outcome-based ordering and the comparison
table crowns no winner on employment or salary.

A negative finding reached by a method that was itself limited is worth exactly
as much as the method. Since domain-restricted search turned out to reach
publishers that direct fetch could not — see the correction in the CBE section —
the finding was **re-tested in August 2026** against KUCCPS, TVETA, KNBS, the
Commission for University Education, KIPPRA and the Ministry of Education.

**It holds.** No Kenyan dataset giving employment rate or earnings *by course or
programme* was found. What the publishers carry is enrolment and programme
listings, not outcomes.

### The trap in those results, recorded because it is an easy mistake

The search surfaced tracer studies with precise, quotable employment figures —
for example **"97% of graduates employed, 75% within one month, 86% in permanent
positions."**

That study is **Tanzanian** — nursing graduates of Kairuki University in Dar es
Salaam. Others returned were Ethiopian and Indonesian. They are real studies
with real numbers, they appear in a search scoped to Kenyan education
publishers, and dropping one into a Kenyan course record would produce exactly
the failure this dataset was rebuilt to remove: a foreign, single-institution
figure rendering as though it described a Kenyan programme.

Njia takes none of them. The absence of Kenyan per-course outcome data is a fact
about Kenya, not a gap to be filled with the nearest available number.

*This re-test changes no data. It is recorded because the restriction it
supports is a deliberate reduction in what the app will do, and a restriction is
only as defensible as the evidence that it is still necessary.*

## The last two counties — 45 of 47 becomes 47 of 47

KMTC's campuses carried this catalogue from 12 counties to 45. The two it does
not serve, **Kirinyaga** and **Samburu**, were left open in this register as
"structurally hard".

That was true of the KMTC route. It was not true of the counties. Each has its
own registered public TVET college, and finding them took two searches.

| County | Institution | Location | Programmes added |
| --- | --- | --- | --- |
| Kirinyaga | Mwea Technical and Vocational College | Wang'uru, off the Nairobi–Embu highway | Certificates in General Agriculture, ICT, Automotive Engineering |
| Samburu | Samburu Technical and Vocational College | Archers Post | Diplomas in ICT, Electrical Engineering and Tourism Management; Certificate in Tour Guide Operations |

Both are TVETA-registered public institutions. Only programmes named in the
sources were added — no course list was inferred from what a college of that
type "usually" offers.

**Fees** use the same basis as every other public TVET record here: the
government's consolidated annual public-TVET fee of Ksh 67,189, scaled by
duration, with the existing verification note attached unchanged. **Entry
grades** follow the published KUCCPS thresholds — C- and above for diploma, D
plain and above for certificate. **Outcomes remain `illustrative`**, as they are
for all 174 records.

### Why Samburu was the one worth the effort

It is among the counties where a young person is least likely to be within
reach of any tertiary institution. A catalogue that silently returned nothing
for Samburu did not read as "we have no data" — it read as *there is nothing
here*. Archers Post has a public college running diplomas.

A test now asserts all 47 counties are present **and** that every county's
institutions actually carry courses, because an institution with no programmes
is a pin on a map rather than something to apply to. Both halves were
negative-tested: move the Samburu college to another county, or reassign
Kirinyaga's courses away, and the suite fails.

Catalogue after this pass: **174 places to apply · 80 distinct programmes · 88
institutions · 47 of 47 counties.**

## The funding model Njia sends people to is under appeal

Njia's HELB/HEF record described the funding bands as settled fact. They are not.

| | |
| --- | --- |
| Petition | **412 of 2023** |
| High Court judgment | **20 December 2024** — model declared **unconstitutional** for want of public participation and legal foundation, and discriminatory in effect |
| Court of Appeal | **Stayed** execution of that judgment — which is why the model still operates |
| Constitutional question | **Undecided.** The appeal is pending |

The Universities Fund states on its own site that the model *"may be subject to
changes depending on the outcome of the ongoing court appeal process"*, and the
Court directed that current beneficiaries **and new applicants** be told exactly
that.

So presenting the bands as fixed was the one thing both the funder and the court
said not to do. `legalStatus` now travels with the record and renders on the
funding card behind a disclosure titled *"read before planning around it"* — the
advice being: apply through it, because it is what exists today; do not build a
multi-year plan on the assumption these bands survive unchanged.

**No date is given for the stay.** Sources consulted disagreed on it, and a wrong
date on a legal claim is worse than no date. The judgment date and petition
number are firm and are what the record cites.

### The band can be appealed, and Njia never said so

The band decides whether a place is affordable at all — roughly a 70%
scholarship at Band 1 against 30% at Band 5, with 40% falling on the household.
It is set by the Means Testing Instrument reading *declared* household
circumstances, so **it can be set wrong**, and there is a formal route to contest
it. The Court of Appeal expressly required students to be told they may appeal a
category they are dissatisfied with.

Njia explained how the bands work and never mentioned they can be challenged —
which is the single action available to someone the model has priced out of a
place they were offered. `bandAppeal` now says so, and stays visible on the card
rather than sitting behind disclosure, because it is the actionable half.

*Source: Universities Fund (universitiesfund.go.ke) reporting of the Court of
Appeal decision and its own "subject to change" notice; High Court Petition 412
of 2023; contemporaneous Kenyan legal and education reporting. Cross-reported
August 2026.*

### A weak guard, caught and strengthened

The first version of the test asserted that the string `f.legalStatus` appeared
in `decide.js`. Disabling the branch to `${false ? ... }` left that identifier
sitting in the dead template, so the guard passed while the caveat had stopped
reaching the page. It now matches the **conditional** (`${f.legalStatus ?`),
which is what actually fails when the field stops rendering. Both guards
re-verified by disabling each branch in turn.
