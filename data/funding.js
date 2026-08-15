/* Njia — funding sources
 *
 * DATA PROVENANCE NOTICE: organisation names, websites and general
 * programme descriptions are real. Amounts, deadlines and eligibility
 * thresholds are illustrative approximations for MVP demonstration —
 * they change yearly and must be verified against each funder's current
 * call for applications before a user relies on them. Every record
 * carries `data_confidence: 'illustrative'` for this reason.
 */

const FUNDING_SOURCES = [
  {
    id: 'f001', name: 'HELB (Higher Education Loans Board)', type: 'loan',
    description: 'Kenya moved to a new Higher Education Funding (HEF) model in 2025/26: instead of a flat loan, students are placed into funding bands (by household means-testing) that mix a government scholarship, a HELB loan, and a household contribution. Apply via the HEF portal, not the old HELB-only process.',
    coverage: 'Scholarship + loan + household contribution, split by funding band. Band 1 (highest need): about 70% government scholarship, 25% loan, and up to Ksh 60,000 upkeep. Band 5 (lowest need): about 30% scholarship, 30% loan, 40% household contribution, and up to Ksh 40,000 upkeep. The band is set by HELB\'s Means Testing Instrument, which weighs parental background, school type, family size, marginalisation and disability — not your grade.', max_amount_kes: 60000,
    eligibility: 'Kenyan citizen, admitted to a HEF-recognised university or TVET institution, means-tested via the HEF portal',
    /* THE BAND IS APPEALABLE, AND ALMOST NOBODY APPEALS IT.
     *
     * The band decides whether a place is affordable at all — Band 1 carries
     * roughly a 70% scholarship, Band 5 roughly 30% with 40% falling on the
     * household. It is set by an instrument reading declared household
     * circumstances, so it can be set wrong, and there is a formal route to
     * contest it. The Court of Appeal expressly required students to be told
     * they may appeal a category they are dissatisfied with.
     *
     * Njia described how the bands work and never mentioned they can be
     * challenged, which is the one action available to someone the model has
     * placed out of reach. */
    bandAppeal: 'The band you are placed in can be appealed. It is set by the Means Testing Instrument reading your declared household circumstances, so it can be wrong — and the difference between Band 1 and Band 5 is roughly 40% of your fees. If your circumstances were misread or have changed, lodge an appeal through the HEF portal within the published appeal window rather than accepting the category.',
    /* THE MODEL IS OPERATING UNDER A STAY, NOT A SETTLED RULING.
     *
     * On 20 December 2024, in Petition 412 of 2023, the High Court declared
     * the model unconstitutional — no public participation, no legal
     * foundation, discriminatory in effect. The Court of Appeal stayed
     * execution of that judgment, which is why the model still runs, but it
     * has NOT ruled on the constitutional question and the appeal is
     * unresolved.
     *
     * This is not editorialising. The Universities Fund itself states the
     * model "may be subject to changes depending on the outcome of the
     * ongoing court appeal process", and the Court directed that current
     * beneficiaries and new applicants be told exactly that. Njia presented
     * the bands as settled fact, which is the one thing the funder and the
     * court both said not to do.
     *
     * No date is given for the stay: sources consulted disagreed on it, and a
     * wrong date on a legal claim is worse than no date. The judgment date and
     * petition number are firm. */
    legalStatus: 'This model is running under a court stay, not a settled ruling. In Petition 412 of 2023 the High Court declared it unconstitutional on 20 December 2024, for want of public participation and legal foundation. The Court of Appeal stayed that judgment — which is why the model still operates — but has not decided the constitutional question, and the appeal is still pending. The Universities Fund says outright that the model may change depending on the outcome. Apply through it, because it is what exists today; do not build a multi-year plan on the assumption that these bands survive unchanged.',
    min_grade: 'D+', application_deadline: 'Rolling, opens with each intake',
    website: 'https://helb.co.ke', application_url: 'https://portal.helb.co.ke',
    requirements: ['National ID', 'Admission letter', 'Parent/guardian ID', 'HEF means-testing form'],
    interest_rate: '4% per annum on the loan portion', repayment_period: 'Starts 1 year after completion, up to 15 years',
    data_confidence: 'verified',
    verification_note: 'Funding-model structure (bands, HEF portal, scholarship+loan+household split) confirmed via HELB/Tuko coverage of the 2025/26 funding model, July 2026. Exact band amounts vary by household means-testing and were not independently confirmed — check the HEF portal for your band.'
  },
  {
    id: 'f002', name: 'Equity Group Foundation — Wings to Fly', type: 'scholarship',
    description: 'Comprehensive SECONDARY-school scholarship (tuition, accommodation, books, uniform, pocket money, transport for 4 years). Relevant to tertiary pathways only through its continuation track: top-performing alumni can enter the Equity Leaders Program (ELP), which sponsors university/TVET study.',
    coverage: 'Full secondary-school support; tertiary via the ELP continuation track', max_amount_kes: null,
    eligibility: 'Financially challenged, top-performing learners entering secondary school; ELP tertiary track selects top KCSE-performing alumni',
    min_grade: null, application_deadline: 'Varies — check annually',
    website: 'https://equitygroupfoundation.com', application_url: 'https://equitygroupfoundation.com/wings-to-fly/',
    requirements: ['Means testing', 'KCPE results (secondary entry)', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme scope (4-year comprehensive secondary scholarship; 60,000+ scholars to date; ELP as the university/TVET continuation for top alumni) confirmed via equitygroupfoundation.com and Equity Group press releases, August 2026. No fixed cash value is published, so none is shown.'
  },
  {
    id: 'f003', name: 'Mastercard Foundation Scholars Program', type: 'scholarship',
    description: 'Comprehensive scholarship for academically talented but economically disadvantaged African youth, delivered through partner universities.',
    coverage: 'Full tuition, accommodation, upkeep, mentorship', max_amount_kes: 1500000,
    eligibility: 'Economically disadvantaged, strong academic record, leadership potential; first-time undergraduate applicants at a partner institution (in Kenya: USIU-Africa)',
    min_grade: 'B+', application_deadline: 'Varies by partner university',
    website: 'https://mastercardfdn.org', application_url: 'https://www.usiu.ac.ke/mastercard-foundation-scholars-program/',
    requirements: ['Academic transcripts', 'Financial need statement', 'Essays', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme structure (full-cost scholarship for first-time undergraduates via partner universities; USIU-Africa is the Kenyan partner) confirmed via usiu.ac.ke and mastercardfdn.org, August 2026. The Ksh 1.5M figure is an indicative full-cost estimate, not a published award value; the B+ minimum is indicative of the competitive bar, not a published cut-off.'
  },
  {
    id: 'f004', name: 'Zawadi Africa Education Fund', type: 'scholarship',
    description: 'Scholarship and mentorship programme for academically talented young African women facing financial hardship.',
    coverage: 'Tuition, upkeep, mentorship', max_amount_kes: 500000,
    eligibility: 'Female applicants who sat KCSE within the last two years with A plain or A-, demonstrated financial need, leadership and resilience; selected scholars go through a ~9-month preparation programme before applying to partner universities',
    min_grade: 'A-', application_deadline: 'Annually — check zawadiafrica.org for the current open call',
    website: 'https://zawadiafrica.org', application_url: 'https://www.zawadiafrica.org/apply-now/',
    requirements: ['Academic transcripts', 'Financial need statement', 'Personal essay'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Eligibility (female, KCSE within 2 years, A/A-, financial need; 9-month preparation then placement at partner universities) confirmed via zawadiafrica.org and programme call coverage, August 2026. The earlier B minimum shown here was wrong and has been corrected. No fixed award value is published; the amount shown is an indicative full-support estimate.'
  },
  {
    id: 'f005', name: 'National Government Constituency Development Fund (NG-CDF) Bursary', type: 'bursary',
    description: 'Constituency-level bursary disbursed to needy secondary, TVET and university students through the local NG-CDF office. Most bursary applications fail on missing documents rather than on merit — assemble the full list below before you start, write in clear CAPITAL letters, and do not submit an incomplete form, because incomplete forms are commonly disqualified outright.',
    coverage: 'Partial tuition, paid directly to the institution', max_amount_kes: 30000,
    eligibility: 'Resident of the constituency, demonstrated financial need; open to secondary, TVET and university students',
    min_grade: null, application_deadline: 'A short window in early January, and it is easy to miss — for the 2025/26 cycle forms were issued from 8 December and received only between 5 and 9 January. Watch ngcdf.go.ke and your constituency office from early December',
    website: 'https://ngcdf.go.ke', application_url: null,
    requirements: ['Application form from the local NG-CDF office', 'Fee structure from the institution', 'Admission or continuing-student letter', 'Student national ID or birth certificate', 'Parent/guardian national ID', 'Latest performance report or transcript', 'Form taken back to the school/college to be confirmed and stamped', 'If orphaned or living with disability: death certificate, or a letter from the chief or a community leader'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Award range (typically Ksh 5,000-30,000 per student per year, varying by constituency; some constituencies report up to 50,000), payment direct to institutions, and the 2025/26 application cycle confirmed via ngcdf.go.ke public notices and bursary guides, August 2026. Your constituency\'s actual range depends on its allocation — confirm at the local NG-CDF office. The 2025/26 window is documented in NG-CDF public notices: forms available from the NG-CDF office, bookshops and cyber cafes from 8 December 2025 and downloadable from ngcdf.go.ke/downloads, completed forms received at ward collection centres from 5 January 2026, deadline Friday 9 January 2026, and notices stating that incomplete forms or forms without the prescribed supporting documents are not processed. Dates are set per constituency and per financial year, so treat five days in early January as the pattern to plan around rather than as next cycle\'s date — confirm yours locally.'
  },
  {
    id: 'f006', name: 'County Government Bursary Fund', type: 'bursary',
    description: 'Devolved bursary fund administered by each county government for residents in tertiary institutions.',
    coverage: 'Partial tuition', max_amount_kes: 20000,
    eligibility: 'County resident, financial need, enrolled in a recognised institution',
    min_grade: null, application_deadline: 'Varies by county, typically per financial year',
    website: null, application_url: null,
    requirements: ['County bursary application form (ward or county office)', 'Fee structure from the institution', 'Admission or continuing-student letter', 'Chief or local administrator letter confirming you live in that ward/county', 'Student national ID or birth certificate', 'Parent/guardian national ID', 'Latest performance report or transcript', 'Form taken back to the school/college to be confirmed and stamped', 'If orphaned or living with disability: death certificate, or a letter from a community leader'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f007', name: 'Youth Enterprise Development Fund (YEDF)', type: 'loan',
    description: 'Government fund supporting youth-owned businesses and youth training in enterprise skills.',
    coverage: 'Business capital, not tuition — relevant if your pathway is self-employment after (or instead of) a course', max_amount_kes: 500000,
    eligibility: 'Kenyan youth aged 18-34, with a business idea or existing youth-led enterprise; group and individual products',
    min_grade: null, application_deadline: 'Rolling',
    website: 'https://www.youthfund.go.ke', application_url: 'https://www.youthfund.go.ke/our-products/',
    requirements: ['National ID', 'Business plan or group registration', 'Training certificate (for some products)'],
    interest_rate: 'Product-dependent — see the current product sheet', repayment_period: 'Product-dependent',
    data_confidence: 'verified',
    verification_note: 'Product structure confirmed via youthfund.go.ke product pages, August 2026: group products (e.g. Smart 25,000-200,000; Stawi 100,000-1M) and individual products (e.g. Vuka Startup 100,000-500,000; expansion/asset products up to 5M). The figure shown is the Vuka Startup ceiling — the most relevant first-business product for a young person starting out. Rates and terms vary by product; confirm the current sheet before applying.'
  },
  {
    id: 'f008', name: 'KCB Foundation — KCB Scholars Programme', type: 'scholarship',
    description: 'Full SECONDARY-school sponsorship (fees, mentorship, psychosocial support, career guidance) for bright but financially disadvantaged students. For post-secondary youth, the KCB Foundation\'s 2jiajiri programme funds vocational/technical skills training toward self-employment instead.',
    coverage: 'Full secondary sponsorship; vocational skills training via 2jiajiri', max_amount_kes: null,
    eligibility: 'Bright, financially disadvantaged students (secondary entry); 2jiajiri targets youth entering technical trades',
    min_grade: null, application_deadline: 'Annually — the 2026 application form is published on foundation.kcbgroup.com',
    website: 'https://foundation.kcbgroup.com', application_url: 'https://foundation.kcbgroup.com',
    requirements: ['Application form', 'Financial need documentation', 'Academic records'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme scope (full secondary sponsorship with mentorship; 2026 application form live on foundation.kcbgroup.com; 2jiajiri as the vocational-skills track) confirmed via foundation.kcbgroup.com, August 2026. No fixed cash value is published, so none is shown.'
  },
  {
    id: 'f009', name: 'Institutional Work-Study Programme', type: 'work_study',
    description: 'On-campus employment (library, admin, labs) offered by many universities and TVETs to offset fees while studying.',
    coverage: 'Partial fee offset via monthly wage', max_amount_kes: 40000,
    eligibility: 'Enrolled student in good standing at a participating institution',
    min_grade: null, application_deadline: 'Start of each semester',
    website: null, application_url: null,
    requirements: ['Enrolment confirmation', 'Application to institution\'s work-study office'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f010', name: 'Elimu Scholarship Programme (Ministry of Education / JKF)', type: 'scholarship',
    description: 'Government scholarship administered by the Jomo Kenyatta Foundation for needy and vulnerable learners, awarded across all 47 counties. The current cycle targets learners joining senior school; it matters to career planning as full multi-year support that frees household funds for tertiary study.',
    coverage: 'Full support for the school cycle: fees, transport, school kit, stipend', max_amount_kes: null,
    eligibility: 'Needy and vulnerable learners; county-based selection across all 47 counties',
    min_grade: null, application_deadline: 'Announced per cycle on education.go.ke — the 2026 call opened December 2025',
    website: 'https://www.education.go.ke', application_url: 'https://www.jkf.co.ke',
    requirements: ['Application per the official announcement', 'Proof of need/vulnerability', 'Academic records'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'This record previously described "Elimu" as a corporate CSR pool — that was wrong and has been corrected: the Elimu Scholarship is the Ministry of Education programme administered by the Jomo Kenyatta Foundation. 2026 cycle (senior-school entrants, all 47 counties, full support incl. transport/kit/stipend) confirmed via the official education.go.ke announcement and JKF, August 2026.'
  },
  {
    id: 'f011', name: 'TVET Government Funding (Capitation + HEF)', type: 'bursary',
    description: 'Public TVET training is government-subsidised: institutions receive per-student capitation, students apply for HEF scholarship/loan support, and from May 2026 public TVETs charge a single consolidated annual fee set by government. Plan for a real risk of not being funded: in 2025/26 TVET loan applications rose 8.3% to 339,726 while the number of students actually funded fell 46% to 157,376, and disbursements nearly halved to Ksh 5.8 billion from Ksh 10.7 billion. HELB attributed this to delays processing first-time applicants. Roughly two in five TVET applicants were funded. Apply early, and line up a county bursary or NG-CDF fallback rather than relying on HEF alone.',
    coverage: 'Subsidised public-TVET tuition; consolidated annual fee of Ksh 67,189 (incl. assessment) from May 2026', max_amount_kes: 67189,
    eligibility: 'Enrolled in a public TVETA-registered institution; HEF support is means-tested via the HEF portal',
    min_grade: null, application_deadline: 'Capitation is institutional; apply for HEF support with each intake',
    website: 'https://www.education.go.ke', application_url: 'https://portal.helb.co.ke',
    requirements: ['Admission to a registered public TVET institution', 'HEF application for scholarship/loan support'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Consolidated public-TVET annual fee of Ksh 67,189 (inclusive of assessment fees, effective May 2026) as announced by government and reported by Eastleigh Voice and sector coverage, August 2026; 2025/26 TVET capitation disbursements confirmed via Ministry of Education reporting. The funding-shortfall figures (applications 339,726, up 8.3%; students funded 157,376, down 46% from 291,252; disbursements Ksh 5.8bn from Ksh 10.7bn; HELB citing delays processing first-time applicants) come from HELB reporting cross-reported by Kenyan Wall Street and sector coverage, August 2026. Per-course billing may vary — confirm with the institution\'s registrar.'
  },
  {
    id: 'f012', name: 'Faith-Based / Community Sponsorship', type: 'sponsorship',
    description: 'Church, mosque, or community-organisation sponsorship of a promising student, common but informally arranged across Kenya.',
    coverage: 'Varies — partial to full tuition', max_amount_kes: 150000,
    eligibility: 'Active community/congregation member, demonstrated need and character references',
    min_grade: null, application_deadline: 'Informal — approach community leadership directly',
    website: null, application_url: null,
    requirements: ['Reference letter from community leader', 'Fee structure', 'Personal interview'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f013',
    name: 'Finlays Community Trust — TVET Scholarship',
    type: 'scholarship',
    description: 'The only scholarship in this list built for a learner with a D. Full tuition for a Level 5 certificate in automotive engineering, building and construction, electrical installation or plumbing technology, plus a start-up toolkit worth Ksh 50,000 on graduation and an industrial attachment at Browns Plantations Kenya. Forty places a year, split between Bomet and Kericho. It takes KCSE candidates from 2022, 2023 and 2024, so leaving school two years ago does not disqualify you.',
    coverage: 'Full tuition at Belgut TTI (Kericho) or Konoin TTI (Bomet), plus a Ksh 50,000 toolkit on graduation and an attachment placement',
    max_amount_kes: null,
    eligibility: 'Resident of Bomet or Kericho County; KCSE 2022, 2023 or 2024 with a mean grade of D or D+; admission secured at Konoin TTI or Belgut TTI',
    min_grade: 'D',
    application_deadline: 'Annual cycle — 2026 applications opened for the intake announced August 2026',
    website: 'https://finlayscommunitytrust.co.ke/tvet-scholarships/',
    application_url: 'https://finlayscommunitytrust.co.ke/tvet-scholarships/',
    requirements: [
      'Proof of residence in Bomet or Kericho County',
      'KCSE certificate from 2022, 2023 or 2024 showing D or D+',
      'Admission letter from Konoin TTI or Belgut TTI'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Eligibility (Bomet and Kericho residency, KCSE 2022-2024, mean grade D or D+), the four Level 5 course areas, the forty annual places, the Ksh 50,000 graduation toolkit and the Browns Plantations attachment are as published by Finlays Community Trust and cross-reported by Education News, The Star and Kenya News Agency, August 2026, which put the 2026 award at Ksh 8.3-8.7 million across 39-40 students. Reports differ on whether 39 or 40 were awarded in 2026 against a stated forty places a year, so the figure here is the published intake rather than either count. Confirm the current window with the Trust before applying.'
  },
  {
    id: 'f014',
    name: 'M-PESA Foundation — University of Embu TVET Scholarship',
    type: 'scholarship',
    description: 'Nationwide and built for the trades: 1,300 places across all 47 counties, covering full programme fees plus a monthly stipend for accommodation and upkeep, at the University of Embu TVET Institute. Craft certificates and diplomas in cosmetology, building and construction, mobile and electronic repairs, repair of two- and three-wheeled vehicles, electrical installation and maintenance, advanced welding, culinary arts and IT. The entry route matters as much as the money: alongside a KCSE mean grade of D plain, the Institute accepts a certificate in a relevant artisan course, and recognises prior learning from jua kali and other work experience — so not having sat KCSE is not automatically the end of it.',
    coverage: 'Full programme fees plus a monthly stipend for accommodation and upkeep',
    max_amount_kes: null,
    eligibility: 'Open to youth from all 47 counties. Entry by KCSE mean grade D plain, OR a certificate in a relevant artisan course, OR recognition of prior learning including jua kali and work experience',
    min_grade: 'D',
    application_deadline: 'By cohort — the first cohort closed 7 October 2024; watch embuni.ac.ke and Safaricom shops for the current call',
    website: 'https://uoemtvet.embuni.ac.ke',
    application_url: 'https://embuni.ac.ke',
    requirements: [
      'KCSE mean grade D plain, an artisan certificate in a related course, or evidence of prior learning',
      'Application form from embuni.ac.ke or a participating Safaricom shop'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme, the 1,300 places across 47 counties, the full-fees-plus-monthly-stipend coverage and the course list are as announced by the M-PESA Foundation and Safaricom in the joint launch with the University of Embu, September 2024, cross-reported by Business Quest and Africa Solutions Media Hub. Entry requirements (KCSE mean grade D plain, or a certificate in a relevant artisan course, or an equivalent determined by KNEC, with prior learning from the informal or formal sector - jua kali and work-related engagement - considered toward the minimum) are from the University of Embu TVET Institute prospectus. The 7 October 2024 deadline was for cohort one; no later cohort date has been sourced, so confirm the current call before relying on it. Training is at the Institute in Embu - budget for relocation if you live elsewhere.'
  }
];

/* THE STICKER PRICE IS NOT WHAT A PUBLIC-TVET STUDENT PAYS.
 *
 * Njia prices 29 courses off the government's consolidated annual public-TVET
 * fee of Ksh 67,189 and shows that figure, multiplied by course length, as
 * "Tuition". That is the published fee and it is correct — but it is not the
 * number a family is asked for.
 *
 * The government pays a capitation of Ksh 30,000 per trainee per year, and the
 * published expectation of the student or guardian is Ksh 26,420 a year, in two
 * instalments. So a card reading "Ksh 134,378 tuition" for a two-year diploma
 * is showing something like two and a half times what is actually invoiced.
 *
 * That is not a rounding problem. It sits directly on top of the budget filter
 * and the affordability scoring, and its whole effect is to make public TVET
 * look further out of reach than it is — to exactly the readers with the least
 * room, for whom a wrong number in that direction is the difference between
 * applying and not.
 *
 * WHAT DOES NOT RECONCILE, STATED PLAINLY: 67,189 − 30,000 = 37,189, not
 * 26,420. Both figures are reported consistently across independent sources
 * and the published arithmetic simply does not close — most likely because the
 * consolidated fee bundles components the 26,420 balance excludes. Njia does
 * not invent a reconciliation. It shows the published fee, the published
 * capitation and the published balance, names the gap, and tells the reader to
 * get the actual invoice from the registrar.
 */
/* The capitation structure a public-TVET family is actually billed against.
 *
 * This record previously reported the arithmetic as simply not closing:
 * Ksh 67,189 less the Ksh 30,000 capitation leaves Ksh 37,189, not the
 * Ksh 26,420 balance published alongside it. That was the wrong conclusion
 * drawn from the right observation. The two figures belong to two different
 * fee regimes, and subtracting across them is what failed — not the sources.
 *
 * Under the approved structure, the annual fee is Ksh 56,420, of which the
 * government pays Ksh 30,000 as capitation and the trainee carries Ksh 26,420
 * (raisable as a HELB loan). Those close exactly: 30,000 + 26,420 = 56,420.
 * The consolidated fee effective May 2026 is Ksh 67,189 — Ksh 10,769 above
 * the total that capitation plus the trainee balance was sized to cover.
 *
 * That residual is the number a family should be asking about, and it is the
 * reason this record exists: the widely-republished "capitation 30,000,
 * balance 26,420" pairing is quoted against the new fee all over the sector
 * press, and read that way it understates what a trainee owes. */
const PUBLIC_TVET_CAPITATION = {
  source: 'Government consolidated public-TVET fee announcement effective May 2026 (Eastleigh Voice, Education News and sector coverage), TVETA guidance on the approved annual fee for trainees placed by KUCCPS, and Ministry of Education TVET capitation reporting; the Ksh 30,000 per-trainee capitation has stood since FY 2018/19. Cross-reported August 2026.',
  consolidatedAnnualFeeKes: 67189,
  approvedAnnualFeeKes: 56420,
  governmentCapitationKes: 30000,
  publishedStudentBalanceKes: 26420,
  residualAboveFundedStructureKes: 10769,
  helbLoanKes: 40000,
  instalments: 2,
  reading: 'The government pays Ksh 30,000 a year per trainee directly to the institution, and the published trainee balance is Ksh 26,420 a year, payable in two instalments and raisable as a HELB loan. You are not asked for the full fee shown as tuition.',
  helbNote: 'A HELB loan of Ksh 40,000 is available to TVET students, of which Ksh 26,420 covers the fee balance and the remainder goes to upkeep. Funding is not assured — see the TVET funding record for how sharply the funded share fell in 2025/26.',
  residual: 'Ask about the gap. Capitation plus the trainee balance comes to Ksh 56,420, the approved annual fee — they close exactly. The consolidated fee effective May 2026 is Ksh 67,189, which is Ksh 10,769 higher. Published sources do not say who carries that difference, and the sector press quotes the 30,000/26,420 pairing against the new figure without noting it. Until capitation or the published balance is revised, treat Ksh 10,769 a year as the amount to raise with the registrar before you enrol.'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUNDING_SOURCES, PUBLIC_TVET_CAPITATION };
}
