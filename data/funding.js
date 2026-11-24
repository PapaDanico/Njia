/* Njia — funding sources
 *
 * DATA PROVENANCE NOTICE. This header used to read "Every record carries
 * `data_confidence: 'illustrative'`", which stopped being true a long time
 * before anyone noticed: eleven of the fifteen records are now `'verified'`
 * and carry a `verification_note` naming what was read and when.
 *
 * That is not a harmless stale comment. `data_confidence` is not
 * documentation — js/decide.js renders a verification tick from it, and
 * js/app.js decides which deadlines reach the landing hero's Application
 * Clock by filtering on it. So the file's own description of its provenance
 * was weaker than what the app displays from it, which is the one direction
 * this project treats as a defect: the next person to edit here would have
 * believed nothing needed sourcing, and downgraded a real citation to match a
 * comment.
 *
 * What is actually true, per record:
 *
 *   `verified`     — the programme, its coverage and its stated entry bar
 *                    were read from a reachable source, named in
 *                    `verification_note`. The app shows a tick and may put
 *                    the deadline on the landing page.
 *   `illustrative` — the organisation and programme are real; the amounts and
 *                    thresholds are approximations that must be checked
 *                    against the funder's current call.
 *
 * Amounts and deadlines change every cycle in both tiers. `verified` means
 * sourced, not permanent.
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
    legalStatus: 'This model is running under a court stay, not a settled ruling. In Petition 412 of 2023 the High Court declared it unconstitutional on 20 December 2024, for want of public participation and legal foundation. The Court of Appeal stayed that judgment — which is why the model still operates — but has not decided the constitutional question, and the appeal is still pending. The Universities Fund says outright that the model may change depending on the outcome. Apply through it, because it is what exists today; do not build a multi-year plan on the assumption that these bands survive unchanged. A replacement is already in Parliament: the Tertiary Education, Placement and Funding Bill 2026 would create a Tertiary Education Funding Authority taking over what HELB, the Universities Fund and the placement service do now, and would move students at universities, KMTC, TVET colleges and teacher training colleges onto it from first year to sixth. Until it becomes law nothing changes \u2014 the September 2026 intake was admitted under the existing model \u2014 so apply exactly as described above, and expect the administering body to be renamed under you rather than the money to disappear.',
    min_grade: 'D+', application_deadline: 'Rolling, opens with each intake',
    website: 'https://helb.co.ke', application_url: 'https://portal.helb.co.ke',
    requirements: ['National ID', 'Admission letter', 'Parent/guardian ID', 'HEF means-testing form'],
    interest_rate: '4% per annum on the loan portion', repayment_period: 'Starts 1 year after completion, up to 15 years',
    data_confidence: 'verified',
    verification_note: 'Funding-model structure (bands, HEF portal, scholarship+loan+household split) confirmed via HELB/Tuko coverage of the 2025/26 funding model, July 2026. Re-checked 8 September 2026: the Court of Appeal stay still holds, the existing model was used for the September 2026 intake per the Education CS, 159,551 HEF applications had been filed by 20 August 2026, and the Tertiary Education, Placement and Funding Bill 2026 (TEFA) is before Parliament \u2014 Education News, Daily Nation and Kenyans.co.ke. Exact band amounts vary by household means-testing and were not independently confirmed — check the HEF portal for your band.'
  },
  {
    id: 'f002', name: 'Equity Group Foundation — Wings to Fly', type: 'scholarship',
    description: 'Comprehensive SECONDARY-school scholarship (tuition, accommodation, books, uniform, pocket money, transport for 4 years). Relevant to tertiary pathways only through its continuation track: top-performing alumni can enter the Equity Leaders Program (ELP), which sponsors university/TVET study, and the Foundation also runs a TVET Scholarship Programme that has funded 4,039 alumni into technical and vocational training in Kenya and the DRC. It is for Wings to Fly and Elimu scholars, not an open call.',
    coverage: 'Full secondary-school support; tertiary via the ELP continuation track', max_amount_kes: null,
    eligibility: 'Financially challenged, top-performing learners entering secondary school; ELP tertiary track selects top KCSE-performing alumni',
    min_grade: null, application_deadline: 'Varies — check annually',
    website: 'https://equitygroupfoundation.com', application_url: 'https://equitygroupfoundation.com/wings-to-fly/',
    requirements: ['Means testing', 'KCPE results (secondary entry)', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme scope (4-year comprehensive secondary scholarship; 60,000+ scholars to date; ELP as the university/TVET continuation for top alumni) confirmed via equitygroupfoundation.com and Equity Group press releases, August 2026. The 4,039 TVET scholarships and the TVET Scholarship Programme are reported by equitygroupfoundation.com and Citizen Digital, September and November 2026. No fixed cash value is published, so none is shown.'
  },
  {
    id: 'f003', name: 'Mastercard Foundation Scholars Program', type: 'scholarship',
    description: 'Comprehensive scholarship for academically talented but economically disadvantaged African youth, delivered through partner universities.',
    coverage: 'Full tuition, accommodation, upkeep and mentorship for the whole degree', max_amount_kes: null,
    eligibility: 'Economically disadvantaged, strong academic record, leadership potential; first-time undergraduate applicants at a partner institution (in Kenya: USIU-Africa)',
    min_grade: 'C+', application_deadline: 'Varies by partner university',
    website: 'https://mastercardfdn.org', application_url: 'https://www.usiu.ac.ke/mastercard-foundation-scholars-program/',
    requirements: ['Academic transcripts', 'Financial need statement', 'Essays', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Programme structure (full-cost scholarship for first-time undergraduates via partner universities; USIU-Africa is the Kenyan partner) confirmed via usiu.ac.ke and mastercardfdn.org, August 2026. No amount is recorded: the Ksh 1,500,000 previously shown here was an indicative full-cost estimate rather than a published award value, and the Foundation publishes none. The grade shown is USIU-Africa\'s own published aggregate KCSE minimum for direct entry, because admission to the partner university is what you must first win; selection for the scholarship itself runs far above it and the Foundation publishes no cut-off. The B+ shown here previously was indicative of that competition rather than a published bar, and quoting it removed the card from readers who meet the university\'s actual requirement.'
  },
  {
    id: 'f004', name: 'Zawadi Africa Education Fund', type: 'scholarship',
    description: 'Scholarship and mentorship programme for academically talented young African women facing financial hardship.',
    coverage: 'Tuition, upkeep, mentorship', max_amount_kes: null,
    eligibility: 'Female applicants who sat KCSE within the last two years with A plain or A-, demonstrated financial need, leadership and resilience; selected scholars go through a ~9-month preparation programme before applying to partner universities',
    min_grade: 'A-', application_deadline: 'Annually — check zawadiafrica.org for the current open call',
    website: 'https://zawadiafrica.org', application_url: 'https://www.zawadiafrica.org/apply-now/',
    requirements: ['Academic transcripts', 'Financial need statement', 'Personal essay'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Eligibility (female, KCSE within 2 years, A/A-, financial need; 9-month preparation then placement at partner universities) confirmed via zawadiafrica.org and programme call coverage, August 2026. The earlier B minimum shown here was wrong and has been corrected. No amount is recorded: the Ksh 500,000 previously shown here was an indicative full-support estimate rather than a published award value, and the Fund publishes none.'
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
    description: 'Devolved bursary fund run by each county for its own residents in tertiary institutions, need-tested with no grade bar - one of the few sources that still reaches a learner whose KCSE mean closed the merit scholarships. It is allocated ward by ward, so the office that decides is local to you. The scale is real: Nairobi budgeted Ksh 595 million for 2025/26, disbursed Ksh 297.5 million in ward bursaries at Ksh 3.5 million to each of its 85 wards and issued 43,978 cheques, with a further Ksh 262.9 million under a County Executive Scholarship Programme that covers tertiary study; Nakuru budgeted Ksh 447 million and released Ksh 284.4 million to more than 57,000 learners. Apply every financial year - an award does not roll over.',
    coverage: 'Partial tuition',
    /* NO PER-STUDENT AMOUNT IS PUBLISHED, and the 20,000 that sat here was
     * illustrative - a plausible figure with nothing behind it, which is the
     * placeholder trap arriving in the funding table rather than the catalogue.
     * What counties publish is the POOL, not the award: what a given learner
     * receives varies by county, by ward and by how many apply that year. The
     * sourced pool figures are in the description so a reader can size it for
     * themselves; Njia does not divide one by the other and call it an award. */
    max_amount_kes: null,
    eligibility: 'County resident, financial need, enrolled in a recognised institution. No minimum grade - need-tested, not merit-tested',
    min_grade: null, application_deadline: 'Varies by county, typically per financial year',
    website: null, application_url: null,
    requirements: ['County bursary application form (ward or county office)', 'Fee structure from the institution', 'Admission or continuing-student letter', 'Chief or local administrator letter confirming you live in that ward/county', 'Student national ID or birth certificate', 'Parent/guardian national ID', 'Latest performance report or transcript', 'Form taken back to the school/college to be confirmed and stamped', 'If orphaned or living with disability: death certificate, or a letter from a community leader'],
    interest_rate: null, repayment_period: null,
    verification_note: 'Mechanism and scale corroborated across two counties and several independent outlets, September 2026: Nairobi County reported a Ksh 595 million bursary allocation for 2025/26, Ksh 297.5 million disbursed in ward bursaries at Ksh 3.5 million across 85 wards, 43,978 cheques issued, and a separate Ksh 262.9 million County Executive Scholarship Programme reaching tertiary students; Nakuru County reported a Ksh 447 million allocation with Ksh 284.4 million released to more than 57,000 learners. No county publishes a per-student award, so none is recorded - the pool figures are quoted as pools and Njia does not divide one by the other.',
    data_confidence: 'verified'
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
    coverage: 'Partial fee offset via monthly wage', /* What a work-study place pays depends on the institution, the role and
     * the hours, and no institution here publishes a rate. 40,000 was a
     * plausible figure with nothing behind it. */
    max_amount_kes: null,
    eligibility: 'Enrolled student in good standing at a participating institution',
    min_grade: null, application_deadline: 'Start of each semester',
    website: null, application_url: null,
    requirements: ['Enrolment confirmation', 'Application to institution\'s work-study office'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f010', name: 'Elimu Scholarship Programme (Ministry of Education / JKF)', type: 'scholarship',
    description: 'NOT FOR SCHOOL-LEAVERS - this is a SENIOR-SCHOOL scholarship, selected on KJSEA results rather than KCSE, so if you already hold a KCSE grade this is not your route and HELB, the HEF portal or your county bursary are. Government scholarship administered by the Jomo Kenyatta Foundation for needy and vulnerable learners across all 47 counties: applicants sit KJSEA in a public junior school and need an achievement level of Meeting to Exceeding Expectation (Levels 5 to 8), and learners with special needs and disabilities qualify regardless of achievement level. Applications run through scholarship.jkf.co.ke, with a JKF toll-free line on 0800 724 695. It still matters to career planning: full multi-year support through secondary frees household money for the tertiary fees this catalogue prices.',
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
    description: 'Public TVET training is government-subsidised: institutions receive per-student capitation, students apply for HEF scholarship/loan support, and from May 2026 public TVETs charge a single consolidated annual fee set by government. Plan for a real risk of not being funded: in 2025/26 TVET loan applications rose 8.3% to 339,726 while the number of students actually funded fell 46% to 157,376, and disbursements nearly halved to Ksh 5.8 billion from Ksh 10.7 billion. HELB attributed this to delays processing first-time applicants. Roughly two in five TVET applicants were funded. Apply early, and line up a county bursary or NG-CDF fallback rather than relying on HEF alone. WHERE YOU TRAIN DECIDES WHAT YOU CAN GET: for 2026 the 272 public TVET colleges under the Ministry of Education are eligible for both the government scholarship and the HELB loan, but the 153 public colleges run by other ministries - KMTC among them - are eligible for the HELB loan ONLY, with no government scholarship. A TVET student\'s HELB loan is reported at up to about Ksh 40,000 a year, of which Ksh 26,400 goes to the institution as tuition and the rest is upkeep. The 2026/27 first-time window opened on the HEF portal in July 2026 and, after an extension directed by the Ministry of Education because some first-time applicants had been locked out, closed on 21 September 2026, so the next opportunity is the following cycle, so the next opportunity is the following cycle.',
    coverage: 'Subsidised public-TVET tuition; consolidated annual fee of Ksh 67,189 (incl. assessment) from May 2026', max_amount_kes: 67189,
    eligibility: 'Enrolled in a public TVETA-registered institution; HEF support is means-tested via the HEF portal',
    min_grade: null, application_deadline: 'Capitation is institutional; apply for HEF support with each intake',
    website: 'https://www.education.go.ke', application_url: 'https://portal.helb.co.ke',
    requirements: ['Admission to a registered public TVET institution', 'HEF application for scholarship/loan support'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Consolidated public-TVET annual fee of Ksh 67,189 (inclusive of assessment fees, effective May 2026) as announced by government and reported by Eastleigh Voice and sector coverage, August 2026; 2025/26 TVET capitation disbursements confirmed via Ministry of Education reporting. The funding-shortfall figures (applications 339,726, up 8.3%; students funded 157,376, down 46% from 291,252; disbursements Ksh 5.8bn from Ksh 10.7bn; HELB citing delays processing first-time applicants) come from HELB reporting cross-reported by Kenyan Wall Street and sector coverage, August 2026. The 2026 eligibility split (272 Ministry of Education TVET colleges eligible for scholarship and loan; 153 colleges under other ministries, including KMTC, eligible for the HELB loan only), the up-to-Ksh-40,000 TVET loan with Ksh 26,400 paid to the institution as tuition, and the 10 July to 8 September 2026 first-time window are reported by Education News, Capital FM, People Daily and Kenyans.co.ke from the KUCCPS and HELB eligibility lists, September 2026. Per-course billing may vary — confirm with the institution\'s registrar. The extension of the 2026/27 first-time university and TVET deadline to 21 September 2026 is reported by Kenyans.co.ke (two articles) and Eastleigh Voice. Reports disagree on the original cut-off (31 August in one, 8 September in another), so it is not recorded.'
  },
  {
    id: 'f012', name: 'Faith-Based / Community Sponsorship', type: 'sponsorship',
    description: 'Church, mosque, or community-organisation sponsorship of a promising student, common but informally arranged across Kenya.',
    coverage: 'Varies — partial to full tuition', /* This record describes an informal arrangement in its own description, so
     * there is by definition no published award to quote. 150,000 was a
     * plausible figure with nothing behind it. */
    max_amount_kes: null,
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
    application_deadline: 'Annual cycle. The 2026 round was awarded in August 2026 and no window is open now; ask the Trust when the next round opens.',
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
    verification_note: 'Eligibility (Bomet and Kericho residency, KCSE 2022-2024, mean grade D or D+), the four Level 5 course areas, the forty annual places, the Ksh 50,000 graduation toolkit and the Browns Plantations attachment are as published by Finlays Community Trust and cross-reported by Education News, The Star and Kenya News Agency, August 2026, Reports put the 2025 award at Sh8.7 million across 40 students (The Star, July 2025) and the 2026 award at Sh8.3 million across 39 students (Education News, Kenya News Agency, August 2026); both are pools and are not divided, and the stated intake is forty places a year. The Trust’s own 2026 call page gives a closing date of 30 April 2026, which no second source repeats, so it is not recorded. Confirm the current window with the Trust before applying.'
  },
  {"id":"f015","name":"Wolfson Education Fund — AMIU Community Health Scholarship","type":"scholarship","description":"A needs-based scholarship sitting in the part of the funding landscape this catalogue finds thinnest: it reaches a learner with a C-, where almost every other scholarship here either ends at KCSE or begins at C+. Partial tuition for the Diploma in Community Health at Amref International University, and it is open to applicants from marginalised communities in Kenya, South Sudan and Somalia rather than to one county.","coverage":"Partial tuition for the Diploma in Community Health at Amref International University, Nairobi","max_amount_kes":null,"eligibility":"From a marginalised community in Kenya, South Sudan or Somalia; demonstrably needy and unable to raise fees from any other source; KCSE mean grade of C- or equivalent, with C- in English or Kiswahili and C- in one of Mathematics, Biology, Chemistry, Agriculture or Home Science","min_grade":"C-","application_deadline":"Call-based rather than annual — confirm the current window with AMIU admissions before applying","website":"https://amref.ac.ke/scholarships-2/","application_url":"https://amref.ac.ke/scholarships-2/","requirements":["KCSE certificate showing a mean grade of C- or better, with C- in English or Kiswahili","C- in one of Mathematics, Biology, Chemistry, Agriculture or Home Science","Evidence of financial need and that fees cannot be raised from another source","Evidence of coming from a marginalised community in Kenya, South Sudan or Somalia"],"interest_rate":null,"repayment_period":null,"data_confidence":"verified","verification_note":"The partnership, the named programme, the C- mean grade, the subject minima, the three countries and the needs test are published by Amref International University on its own scholarships page and were returned by two independently phrased searches, the second naming no grade. NO AMOUNT IS RECORDED and that is deliberate: the award is described as PARTIAL tuition with no published figure or percentage, so any number here would be invented. NO DEADLINE IS RECORDED either - the call for applications reachable from this build is dated August 2023, and a stale open window is an instruction to go somewhere that will not take you, which is the one direction this project refuses to err in. Ring AMIU admissions for the current call and the size of the award. AMIU separately advertises full scholarships for its pre-service Kenya Registered Community Health Nursing programme; that is a different award with its own terms and is not covered by this record."},
  {"id":"f016","name":"DAFI Scholarship (UNHCR) — Windle International Kenya","type":"scholarship","description":"The tertiary funding route for refugees and asylum-seekers in Kenya, run by UNHCR since 1992 and administered here by Windle International Kenya. It is one of very few scholarships on this list that reaches TVET: accredited technical and vocational programmes of two years or more leading to a certificate or diploma qualify alongside university degrees. It covers tuition, fees, study materials, food, transport and accommodation, and it prioritises women and girls to close the gender gap in refugee tertiary education.","coverage":"Tuition and institutional fees, study materials, food, transport and accommodation, plus mentoring and the DAFI student club and alumni network","max_amount_kes":null,"eligibility":"Valid refugee or asylum-seeker status in Kenya (Government of Kenya refugee ID and UNHCR protection document); original academic documents from a recognised institution; demonstrated financial need; not already holding another scholarship; not in an immediate resettlement process. An age ceiling applies — see the note.","min_grade":"C-","application_deadline":"Annual call, opening around April or May — confirm the current window with Windle International Kenya","website":"https://help.unhcr.org/kenya/helpful-services/education/","application_url":"https://help.unhcr.org/kenya/helpful-services/education/","requirements":["Government of Kenya refugee ID card and UNHCR protection document","Original KCSE or equivalent academic certificates","Admission letter from a recognised university, college or TVET institution","Evidence of financial need and of community contribution"],"interest_rate":null,"repayment_period":null,"data_confidence":"verified","verification_note":"UNHCR Kenya and Windle International Kenya both publish the programme, and Windle Trust International has been UNHCR's DAFI implementing partner since 2005. THE ENTRY GRADE IS RECORDED AT THE LEAST EXCLUSIONARY FIGURE ANY SOURCE STATES, BECAUSE TWO SOURCES DISAGREE AND THE SCOPES DIFFER: the Kenya call gives a minimum KCSE mean of C plain for male applicants and C- for female applicants, while a second source gives C+ and attaches it specifically to university study. Those can both hold — a degree needs the higher bar to be placed at all, while a two-year TVET diploma is reachable lower down — but Njia has not confirmed that reading, so treat C- as the floor for a female applicant to a TVET programme and expect to be asked for more at a university. The age limit is stated as 26 and below in the Kenya call and as under 28 elsewhere; confirm both the grade and the age with Windle International Kenya before applying. No award amount is published in any source reachable from this build, so none is shown. Njia does not verify refugee status and nothing here affects it."},
  {"id":"f017","name":"Rattansi Educational Trust — Institutional Bursary","type":"bursary","description":"One of Kenya's oldest education philanthropies, supporting needy students since the 1950s across universities, national polytechnics and tertiary colleges, public and private alike. It is need-based rather than merit-based and is designed to close a fee balance, so it is normally held alongside HELB, an NG-CDF bursary and a county bursary rather than instead of them. YOU DO NOT APPLY TO THE TRUST DIRECTLY: each participating institution vets and pre-qualifies its own neediest students and the Trust then allocates against that list, so the application starts at your dean of students or financial aid office.","coverage":"A partial award against an outstanding fee balance, paid to the institution","max_amount_kes":null,"eligibility":"Registered at a participating university, national polytechnic or tertiary college; demonstrated financial need; applications made through your own institution, not to the Trust. Open regardless of faith or community.","min_grade":null,"application_deadline":"Set by each institution, not by the Trust — ask your dean of students for the current window","website":"https://www.rattansieducationaltrust.or.ke/","application_url":"https://www.rattansieducationaltrust.or.ke/apply.htm","requirements":["Latest fee statement verified by your faculty accountant","Death certificate(s) of parent(s) if orphaned","Any other document evidencing level of need","Your institution’s own Rattansi application form, from its student portal or bookshop"],"interest_rate":null,"repayment_period":null,"data_confidence":"verified","verification_note":"The Trust's own application page states that applications are made through the respective institutions, and three institutions corroborate it independently by publishing their own Rattansi calls with their own forms and windows — the Technical University of Kenya, Masinde Muliro University of Science and Technology and Moi University. The required documents above are as the Trust lists them. NO AWARD AMOUNT IS RECORDED: figures circulate for a typical per-semester award and none could be verified against the Trust or a participating institution, so quoting one would put a number on a card that nothing here stands behind. The Trust publishes a list of the institutions that disburse the bursary; check yours is on it before assuming your college participates. Offices are on Koinange Street, Nairobi."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f018","name":"Government Scholarship (HEF portal — Universities Fund / SD-TVET)","type":"scholarship","description":"THE SINGLE MOST IMPORTANT APPLICATION ON THIS LIST, and the one most often missed: funding is not automatic with a KUCCPS placement. You apply on the Higher Education Financing portal, and a Means Testing Instrument places your household in a band that fixes what share of the course cost the government pays as a scholarship, what HELB lends you, and what your household must find. It runs from 70% of course cost at the top of need down to 30%. University students are funded through the Universities Fund; TVET trainees placed by the Ministry through the State Department for TVET, on the same portal. You must reapply every year.","coverage":"30% to 70% of programme cost as a non-repayable scholarship, the balance covered by a HELB loan and a household contribution","eligibility":"KUCCPS-placed in a public university, or Ministry-placed in a TVET institution on the HELB approved list. NOT available to private-university or self-sponsored/Module II students, who may take the HELB loan only.","min_grade":null,"application_deadline":"First-time applications open around July after placement results. The 2026/27 window closed on 21 September 2026 after an extension. Later years apply through the HELB App or *642#","website":"https://www.hef.co.ke","application_url":"https://www.hef.co.ke","requirements":["Your own email address and phone number","KCPE and KCSE index numbers and years","National ID or Maisha Card, both sides (birth certificate if under 18)","Bank account or M-PESA number in your own name","Parents’ or guardians’ ID numbers and registered phone numbers","Death certificate(s) for deceased parent(s) — this materially affects your assessed band","Two guarantors’ ID numbers and phone numbers","Admission letter"],"data_confidence":"verified","verification_note":"The band shares are the same published SCFM figures Njia carries in SCFM_HOUSEHOLD_SHARE and explains on the help page, read from that one constant rather than restated here. The exclusion of private-university and self-sponsored students from the scholarship while the HELB loan remains open to them is corroborated against KUCCPS published eligibility. NO DEADLINE DATE IS RECORDED AS FACT: the window moves every cycle and a date that has passed is worse than none, so the month range is given and the portal is the thing to check. The requirement list is as published for a first-time application."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f019","name":"Equity Leaders Program (Equity Group Foundation)","type":"scholarship","description":"For top KCSE performers only. Selected scholars take a paid six-month internship in an Equity Bank branch on a monthly stipend, with part of it held back and released when they start university to build a saving habit, followed by leadership development and support into university including placement into universities abroad. It is the post-secondary arm of the Wings to Fly and Elimu programmes rather than a separate open application.","coverage":"Paid six-month internship at Ksh 50,000 a month with part deferred to university entry, leadership development, mentorship and university placement support","eligibility":"Top KCSE performers: Wings to Fly and Elimu scholars attaining A or A-, the top boy and girl in each sub-county with an A plain, and national top scorers at 84 points.","min_grade":"A-","application_deadline":"Selection follows the release of KCSE results; the 2026 cohort was announced in February 2026","website":"https://equitygroupfoundation.com","application_url":"https://equitygroupfoundation.com","requirements":["KCSE results at the stated level","Selection is by Equity Group Foundation from results rather than by open application"],"data_confidence":"verified","verification_note":"The 2026 cohort of 733 scholars, the Ksh 50,000 monthly stipend, the six-month paid internship, the deferred portion released at university entry and the three selection routes (A or A- for Wings to Fly and Elimu scholars, A plain for the top boy and girl per sub-county, 84 points for national top scorers) are reported by Equity Group Holdings and cross-reported by The Standard, Capital Business and Business Today in February 2026. Cohort size moves every year — 750 was reported for 2025 — so the figure is not a quota to plan against. RECORDED AT A- BECAUSE THAT IS THE LOWEST GRADE ANY OF THE THREE ROUTES ADMITS, and it is the Wings to Fly and Elimu route, not the open one."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f020","name":"KCB Foundation Scholarships (with KISE for learners with disabilities)","type":"scholarship","description":"MOSTLY A SECONDARY-SCHOOL SCHOLARSHIP, AND THAT MATTERS BEFORE YOU APPLY: the main award covers Form 1 to Form 4 for students leaving primary school, with tertiary support only for exceptional candidates continuing from within the programme. Its disability stream, run with the Kenya Institute of Special Education, is the reason it is listed here — it reserves places specifically for learners with visual, hearing and physical disabilities, which very little else on this list does. There is also a KCB Scholars athletics stream for talented student-athletes from disadvantaged backgrounds.","coverage":"Full secondary scholarship covering fees, books and uniform, with mentorship and psychosocial support; tertiary support for exceptional continuing candidates","eligibility":"Primarily students who have completed KCPE and are entering secondary school, selected on need and performance. The disability stream is for learners with visual, hearing or physical disabilities.","min_grade":null,"application_deadline":"Announced annually — watch the Foundation’s scholarships page and national press after KCPE results","website":"https://foundation.kcbgroup.com/programs/scholarships/","application_url":"https://foundation.kcbgroup.com/programs/scholarships/","requirements":["KCPE results","Evidence of financial need","Disability documentation for the KISE-managed stream"],"data_confidence":"verified","verification_note":"The KISE partnership covering 451 scholarships for persons with disabilities, the annual intake of 240 post-KCPE scholarships with 40 places reserved for learners with disabilities, the coverage of fees, books and uniform, and the statement that tertiary support is for exceptional candidates are published by KCB Foundation and corroborated by KISE. LISTED WITH ITS LEVEL STATED IN THE FIRST LINE RATHER THAN OMITTED: a school-leaver who already has a KCSE grade cannot enter the main programme, and a record that reads as an open tertiary scholarship would cost them an application. If you are already past secondary school and have a disability, the NCPWD route is the one to work."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f021","name":"NCPWD Education Assistance (National Council for Persons with Disabilities)","type":"bursary","description":"The government's own education support for registered persons with disabilities, administered by the National Council for Persons with Disabilities. Unlike most disability funding in Kenya it reaches beyond secondary school into college and university. Registration with NCPWD is the gate: it issues the disability card that county disability funds, the HEF means-testing instrument and several corporate schemes all ask for, so registering is worth doing whether or not you apply here.","coverage":"Education assistance towards fees; amount set case by case","eligibility":"Persons with disabilities registered with NCPWD and holding an NCPWD card; enrolled in or admitted to an educational institution.","min_grade":null,"application_deadline":"Applications are received through NCPWD offices — confirm the current cycle with your county NCPWD office","website":"https://ncpwd.go.ke/education-assistance/","application_url":"https://ncpwd.go.ke/education-assistance/","requirements":["NCPWD registration card","Admission letter and fee structure","Medical or assessment report supporting registration","National ID or birth certificate"],"data_confidence":"verified","verification_note":"NCPWD publishes an education assistance programme on its own domain and is the statutory body that registers persons with disabilities in Kenya, which is what makes the card a prerequisite elsewhere — declaring disability status raises the assessed need band in the HEF means-testing instrument, and several county and corporate schemes require NCPWD registration. NO AWARD AMOUNT AND NO DEADLINE ARE RECORDED: neither is published in any source reachable from this build, and the Council assesses applications individually. Ask at your county NCPWD office rather than assuming a national window."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f022","name":"Ashinaga Africa Initiative","type":"scholarship","description":"Fully funded undergraduate study abroad — Japan, the United States, the United Kingdom and elsewhere — built specifically for students who have lost one or both parents. It carries leadership development and an expectation that scholars contribute back to their home communities. DEGREE LEVEL ONLY, so it does not reach a certificate or diploma candidate, and it is highly competitive; but for an orphaned student with strong results it is one of very few full undergraduate routes that exists at all.","coverage":"Full funding for undergraduate study abroad, plus leadership development and preparatory training","eligibility":"Students who have lost one or both parents, with strong academic results and demonstrated leadership. Degree-level study abroad.","min_grade":"A-","application_deadline":"Annual call — check ashinaga.org for the current window","website":"https://www.ashinaga.org/","application_url":"https://www.ashinaga.org/","requirements":["Death certificate(s) of deceased parent(s)","KCSE results","Evidence of leadership and community contribution"],"data_confidence":"illustrative","verification_note":"LISTED ON THE MAINTAINER'S OWN FUNDING GUIDE AND NOT INDEPENDENTLY CORROBORATED IN THIS BUILD, and the record says so rather than wearing a confidence it has not earned. What the guide states — fully funded undergraduate study abroad for orphaned students, with leadership development and a give-back expectation — is recorded; the entry grade is Njia's own reading of a competitive full international undergraduate award rather than a published bar, which is why it is flagged illustrative. Confirm the current call, the eligible countries and the actual academic requirement on ashinaga.org before spending time on it."},
  {"interest_rate":null,"repayment_period":null,"max_amount_kes":null,"id":"f023","name":"Chevening Scholarship (UK Government)","type":"scholarship","description":"NOT FOR SCHOOL-LEAVERS, and that is the first thing to know: Chevening funds a one-year taught master's in the UK and requires around 2,800 hours of work experience plus an undergraduate degree good enough for a UK postgraduate offer. It is recorded here so that a Njia reader can see where this route begins rather than discovering years later that it existed — it is what a certificate or diploma today can eventually lead to, not something to apply for now.","coverage":"Full: tuition (to a cap), monthly stipend, return airfare and arrival and departure allowances for a one-year UK master's","eligibility":"Kenyan citizen with an undergraduate degree, around 2,800 hours of work experience, admission to three eligible UK master's courses, and a commitment to return to Kenya for two years after the award.","min_grade":null,"application_deadline":"Opens around August and closes early October for the following academic year","website":"https://www.chevening.org","application_url":"https://www.chevening.org","requirements":["Undergraduate degree transcript","Evidence of about 2,800 hours of work experience","Offers or applications for three eligible UK master’s courses","Two references and English language requirement"],"data_confidence":"illustrative","verification_note":"Listed from the maintainer's funding guide, which gives the August-to-October window, the 2,800-hour work-experience requirement, the three-course rule and the two-year return commitment. NOT INDEPENDENTLY CORROBORATED IN THIS BUILD and deliberately carrying no specific closing date, because Chevening's deadline moves every cycle and a stale date on a card sends someone to a closed portal. RECORDED WITH ITS LEVEL IN THE FIRST SENTENCE: Njia's catalogue is read mostly by people choosing a certificate, diploma or first degree, and a postgraduate award presented without that warning costs them the week they spend on it."},
  {
    id: 'f024',
    name: 'National Youth Service (NYS) — free technical and vocational training',
    type: 'sponsorship',
    description: 'Reaches a learner with a D plain, which almost nothing else on this list does. You enlist voluntarily, serve six months of paramilitary national service, and are then sent to one of the 17 NYS technical and vocational institutions to train in a course of your choosing. Two independent sources state the training is free of charge to recruits. During service you are paid a monthly stipend and given accommodation, meals and uniforms. Courses run at artisan, craft certificate, technician and diploma level and include several trades that are hard to find funded anywhere else — plant operation, plant mechanics, welding and fabrication, motor vehicle mechanics, panel beating and spray painting, ICT, clothing and textile, agriculture and hospitality.',
    coverage: 'Free technical and vocational training at an NYS institution, after a paid six-month national service with accommodation, meals and uniforms provided',
    max_amount_kes: null,
    eligibility: 'Kenyan citizen aged 18 to 24 with a valid national ID; KCSE mean grade of D plain or above; a valid Certificate of Good Conduct; willing to undertake six months of paramilitary training first',
    min_grade: 'D',
    application_deadline: 'Recruitment runs annually and is announced through NYS channels and local media — confirm the current window before travelling to a recruitment centre',
    website: 'https://www.nys.go.ke/',
    application_url: 'https://nys.ecitizen.go.ke/',
    requirements: [
      'Kenyan national identity card, aged 18 to 24',
      'KCSE certificate showing a mean grade of D plain or above',
      'Certificate of Good Conduct'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The age range, the D plain KCSE minimum, the Certificate of Good Conduct, the compulsory six-month paramilitary service and the progression into NYS technical and vocational institutions are stated by two independently phrased searches, September 2026, the second naming no grade. That second search and a third both state the training is free of charge to recruits and give the estate as 22 camps and 17 TVET institutions; the stipend, accommodation, meals and uniforms are reported for the service period. No amount is recorded because none is published: the value here is that the training carries no fee rather than an award of a stated size. Recruitment is currently voluntary. Confirm the intake with NYS before making plans around it.'
  },
  {
    id: 'f025',
    name: 'Generation Kenya — fully sponsored short training with job placement',
    type: 'sponsorship',
    description: 'Not a scholarship toward a college course, and not a KNQF qualification — this is a short, employer-linked training programme, and it is listed because it asks for no KCSE grade at all. The route is open to anyone aged 18 or over, which reaches the reader whose mean grade closed every merit scholarship on this list. Programmes reported include digital freelancing and admin support work, digital customer service and sewing machine operation. The admin support programme runs eight weeks of classroom training followed by six weeks of apprenticeship. Training is funded by donors; the organisation reports that 84 per cent of graduates since 2015 have been placed into work through a network of more than 350 employer partners.',
    coverage: 'Donor-funded tuition for a short employer-linked programme, plus apprenticeship and job-placement support',
    max_amount_kes: null,
    eligibility: 'Aged 18 or over. No KCSE mean grade is published as a requirement. A commitment fee of Ksh 3,000 is charged, payable in two instalments.',
    min_grade: null,
    application_deadline: 'Cohorts run through the year — check the current intake on the Generation Kenya site',
    website: 'https://kenya.generation.org/',
    application_url: 'https://kenya.generation.org/learners-faq/',
    requirements: [
      'Aged 18 or over',
      'Commitment fee of Ksh 3,000, payable in two instalments'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The 18-and-over entry with no grade bar, the donor funding, the Ksh 3,000 commitment fee payable in two instalments, the eight-week plus six-week structure of the admin support programme and the 84 per cent placement rate across more than 350 employer partners are published by Generation Kenya and repeated by a second source, September 2026. The Ksh 3,000 is recorded because it is a real cost to the learner and they should know about it before they arrive: note that it is a commitment fee charged by the training provider itself, which is a different thing from the application fee that Njia warns about on the help page, and no genuine scholarship in Kenya charges you to apply for it. No award amount is recorded because none is published.'
  },
  {
    id: 'f026',
    checked_at: '2026-11-08',
    name: 'KeNHA TVET Scholarships — Mombasa–Mariakani highway communities',
    type: 'scholarship',
    description: 'The lowest entry bar of any award in this list: the published minimum qualification is a KCPE certificate, not a KCSE mean grade, so a learner whose KCSE closed every other door here can still apply. The Kenya National Highways Authority funds technical and vocational training for unemployed young people living in the communities beside the Mombasa–Mariakani (A8/A109) highway project, from financing provided by the German development bank KfW, the European Investment Bank and the EU–Africa Infrastructure Trust Fund. It is reported as covering tuition, training materials and a monthly allowance. The courses named in the call are six-month trades — electrical installation, plumbing, masonry, carpentry, motor vehicle mechanics, welding and fabrication, hairdressing, beauty therapy, and refrigeration and air conditioning — and the call is open to people who left school without finishing. Selection is run with the national government and county education officers. Geographically narrow — Kwale, Mombasa and Kilifi counties only — but within those three it reaches further down the grade range than anything else Njia holds.',
    coverage: 'Reported as full sponsorship covering tuition, training materials and a monthly allowance at a TVET institution',
    max_amount_kes: null,
    eligibility: 'Unemployed young person aged 18 to 35 living in a community abutting the Mombasa–Mariakani highway project, in Kwale, Mombasa or Kilifi County; minimum qualification a KCPE certificate; able to read and write. No KCSE mean grade is published as a requirement.',
    min_grade: null,
    application_deadline: 'Issued as a periodic call for applications rather than on a fixed annual date — calls were published in 2022, 2023, 2025 and 2026 (the 2026 call closed on 23 July 2026), so watch the scholarships page',
    website: 'https://kenha.co.ke/document-category/scholarships/',
    application_url: 'https://kenha.co.ke/document-category/scholarships/',
    requirements: [
      'KCPE certificate as the minimum qualification',
      'Proof of residence in a community abutting the highway project in Kwale, Mombasa or Kilifi',
      'Aged 18 to 35 and unemployed'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The scheme, the three target counties, the unemployed-youth focus and the KfW, EIB and EU-AITF financing behind it are published by KeNHA in its calls for applications, September 2026. The 18-to-35 age range, the KCPE minimum qualification, the read-and-write requirement and the coverage of tuition, training materials and a monthly allowance come from a second source summarising the same call and are corroborated by press reporting describing it as a scholarship with a monthly stipend for KCPE certificate holders. The nine named six-month courses, the eligibility of school leavers who did not finish and have no diploma-level training, and selection through national government and county education officers are from a third search of the 2025 call, September 2026. No amount is recorded because none is published, and no closing date is recorded because this is a periodic call rather than a fixed annual window: read the current advert on the KeNHA scholarships page before applying.'
  },
  {
    id: 'f027',
    name: 'KPC Foundation — INUKA and INUKA Plus (learners with disabilities)',
    type: 'scholarship',
    description: 'YOU CANNOT APPLY DIRECTLY TO THE TERTIARY AWARD, and that is the first thing to know: INUKA Plus extends support to students who were already INUKA secondary-school scholars and performed well, not to the public. What is open is the INUKA secondary programme itself, which takes one girl and one boy living with a disability from each of the 47 counties every year — so if you are still in or entering senior school this is a route worth working, and if you have already left school the NCPWD record in this list is the one for you. It is recorded here because the tertiary stream reaches TVET, college and university alike, which very little disability funding in Kenya does, and because it shows a school-leaver with a disability what a full funded pathway looks like from the start.',
    coverage: 'Tuition, accommodation, meals and assistive devices for the course duration, plus uniforms at secondary level, a needs-based stipend and annual mentorship on life skills and career planning',
    max_amount_kes: null,
    eligibility: 'INUKA Plus: top-performing students continuing from the INUKA secondary programme into a TVET institution, college or university — not an open application. INUKA secondary: one girl and one boy living with a disability from each of the 47 counties each year.',
    min_grade: null,
    application_deadline: 'The secondary intake is announced annually — the 2026 call was for learners entering Grade 10. Watch the KPC Foundation pages.',
    website: 'https://www.kpc.co.ke/corporate-social-investment/',
    application_url: 'https://www.kpc.co.ke/corporate-social-investment/',
    requirements: [
      'Documentation of disability — NCPWD registration is the card most Kenyan schemes ask for',
      'For INUKA Plus: existing INUKA scholarship beneficiary with strong secondary results',
      'For the secondary intake: county of residence and KJSEA or equivalent results'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The INUKA Plus launch, its restriction to top-performing continuing INUKA beneficiaries, its reach into TVET institutions, colleges and universities, and its coverage of tuition, accommodation, meals, assistive devices and mentorship are published by Kenya Pipeline Company and corroborated by Techish Kenya, Capital FM, KBC and Business Now across December 2024 to April 2026. The INUKA secondary intake of one girl and one boy living with a disability per county is reported in the same coverage, as is a KPC Foundation agreement with NCPWD in October 2025. THE KSH 41 MILLION A YEAR, AND THE KSH 160 MILLION OVER FOUR YEARS, ARE THE PROGRAMME POOL AND NOT AN AWARD: Njia does not divide a pool by a beneficiary count to produce a figure, so no amount is recorded. LISTED WITH ITS CLOSED ENTRY IN THE FIRST LINE rather than omitted, because a record reading as an open tertiary scholarship would cost a school-leaver an application they cannot make.'
  },
  {
    id: 'f028',
    checked_at: '2026-11-08',
    name: 'M-PESA Foundation and University of Embu TVET Scholarships',
    type: 'scholarship',
    description: 'Asks for no KCSE mean grade at all: a KCSE or KCPE certificate qualifies, and so can prior learning from work in the formal or informal sector. The scholarships cover all programme fees and pay a monthly stipend for accommodation and upkeep, for craft certificates, diplomas and other qualifications at the University of Embu TVET Institute. Courses named in the call are cosmetology, building and construction, mobile and electronic repairs, repair of two- and three-wheeled vehicles, electrical installation and maintenance, advanced welding, culinary arts and information technology. The programme was launched in September 2024 for 1,300 young people; the first cohort of 400 started in October 2025, and a second-cohort call for 650 places, drawn from counties named in the call, followed in May 2026 and closed on 12 June 2026. The second call adds basic tools of trade on graduation. Cohorts recur, so ask the University of Embu TVET Institute when the next one opens before planning on it. For the craft certificates themselves, the Institute prospectus gives a KCSE mean grade of D plain, or a certificate in a relevant artisan course, with prior learning counted toward it, so the route that needs no grade is artisan-level entry or recognition of prior learning.',
    coverage: 'All programme fees, a monthly stipend for accommodation and upkeep, and (from the second cohort) basic tools of trade on graduation',
    max_amount_kes: null,
    eligibility: 'Aged 15 to 30. A KCSE or KCPE certificate, or recognised prior learning from the formal or informal sector. No KCSE mean grade is published as a requirement.',
    min_grade: null,
    application_deadline: 'Cohort-based. The first cohort closed on 7 October 2024 and a second-cohort call closed on 12 June 2026 (programmes starting July 2026). No third-cohort date is published in any source reachable from this build, so confirm with the University of Embu TVET Institute.',
    website: 'https://uoemtvet.embuni.ac.ke/',
    application_url: 'https://embuni.ac.ke/call-for-2nd-cohort-university-of-embu-tvet-scholarships-3/',
    requirements: [
      'KCSE or KCPE certificate, or evidence of prior learning',
      'Aged 15 to 30',
      'Application form, available online from the University of Embu or at Safaricom shops in the target counties'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The partnership, the 1,300 places, the 15-to-30 age range, entry on a KCSE or KCPE certificate or on prior learning, full fees plus a monthly accommodation and upkeep stipend, the named courses and the application routes are published by the University of Embu on its own domain and in the M-PESA Foundation and Safaricom press releases of 9 September 2024. Sources describe the beneficiaries as drawn from all 47 counties while also saying paper forms were distributed through Safaricom shops in 10 target counties; both are recorded because they are not the same claim, and a reader outside those ten should apply online. No amount is recorded because none is published. No open date is recorded: the two published windows closed in October 2024 and on 12 June 2026, the second per the May 2026 call published by the University of Embu and application form.'
  },
  {
    id: 'f029',
    name: 'KCB Foundation 2Jiajiri — sponsored vocational training for out-of-school youth',
    type: 'sponsorship',
    description: 'Built for young people who are out of school, and it asks for no KCSE grade. 2Jiajiri sponsors vocational training at accredited TVET institutions, then adds business mentorship and coaching, a startup toolkit for qualified graduates, and access to single-digit-interest loans through KCB Bank. It runs two streams: a Skiller category for people with no prior vocational training or work experience, taking them from basic to advanced level, and an Apprentice category for people who already have practical skills but no formal training or certificate. Courses named include hairdressing and beauty therapy, plumbing, motor vehicle mechanics, tailoring and dressmaking, electrical installation, masonry, welding, and food and beverage. This is a different programme from the KCB Foundation secondary scholarship listed separately; that one is for learners entering Form 1.',
    coverage: 'Sponsored vocational training at an accredited TVET institution, plus mentorship, a startup toolkit for qualified graduates and access to single-digit-interest KCB loans',
    max_amount_kes: null,
    eligibility: 'Out-of-school young women and men aged 18 to 35. Two streams: Skiller (no prior vocational training or work experience) and Apprentice (existing practical skills without formal certification). No KCSE mean grade is published as a requirement.',
    min_grade: null,
    application_deadline: 'Calls are issued in cohorts through partnerships with individual constituency NG-CDF offices and counties, and the constituencies change from one cohort to the next. Ask your constituency NG-CDF office whether a 2Jiajiri cohort is open, and watch the KCB Foundation page. Shortlisted applicants are interviewed at the training institution.',
    website: 'https://foundation.kcbgroup.com/programs/2jiajiri/',
    application_url: 'https://foundation.kcbgroup.com/programs/2jiajiri/',
    requirements: [
      'Aged 18 to 35 and out of school',
      'National identity card',
      'For the Apprentice stream, evidence of existing practical skills'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The programme, its 2016 launch, the 18-to-35 out-of-school eligibility, the Skiller and Apprentice streams, sponsored training at accredited TVETs, business development services, startup toolkits and access to single-digit-interest KCB loans are published by KCB Foundation on its own domain and described in the same terms by the Mastercard Foundation, which co-funds it under Young Africa Works, and by Capital FM and Education News reporting on county cohorts, September 2026. KCB reports 22,959 youth trained and 5,594 businesses incubated since launch. No amount is recorded because none is published; the value is the sponsorship of the course rather than an award of a stated size. No date is recorded because intakes are cohort-based and often county-specific. The constituency route is corroborated across several 2025 and 2026 cohorts (Education News, HapaKenya, TechAfrica News and KCB Group), which name different NG-CDF partner constituencies each time, 14 in one 2026 call alone, with interviews held at the designated training institutions; no single constituency list is recorded because each one is specific to its cohort.'
  },
  {
    id: 'f030',
    checked_at: '2026-11-19',
    name: 'NYOTA - government youth grants, training and work experience (dial *254#)',
    type: 'sponsorship',
    description: 'Built for unemployed, underemployed and low-income young people aged 18 to 29 (up to 35 for persons with disabilities) whose education stops at Form Four or below, so no KCSE grade is needed and holding a diploma or degree may rule you out of some grants. NYOTA, the National Youth Opportunities Towards Advancement project, is a five-year Government of Kenya project financed by the World Bank. Reported support has three strands: a business track (a short business training, then a start-up grant of up to Ksh 50,000), on-the-job experience placements, and skills support that the project says includes certifying existing artisan skills through recognition of prior learning. You apply free of charge by dialling *254# and choosing the NYOTA option, and nobody may charge you to register. The on-the-job track is reported to pay a stipend of Ksh 6,000 a month. Rounds open and close, so there is no fixed annual date: an October 2025 round closed on 12 October and a second phase of payments was launched in July 2026. Some reports say people who defaulted on Hustler Fund loans may be excluded, so confirm before relying on a place.',
    coverage: 'A start-up grant of up to Ksh 50,000 on the business track after short business training, plus on-the-job experience placements and skills support, free to apply for',
    max_amount_kes: 50000,
    eligibility: 'Kenyan citizen aged 18 to 29 (up to 35 for persons with disabilities), unemployed, underemployed or in low-income work, with education at Form Four or below; a national ID and a SIM card registered in your name. No KCSE mean grade is published as a requirement.',
    min_grade: null,
    application_deadline: 'Run in rounds rather than on an annual date: an October 2025 round closed on 12 October and a second phase of payments was launched in July 2026. Dial *254# or check youth.go.ke to see whether a round is open before planning on it.',
    website: 'https://youth.go.ke/',
    application_url: 'https://youth.go.ke/',
    requirements: [
      'Kenyan citizen aged 18 to 29, or up to 35 with a disability',
      'Education at Form Four or below',
      'National identity card and a SIM card registered in your name',
      'Dial *254# and choose the NYOTA option. It is free: never pay to register'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The programme, its World Bank financing and five-year span, the age and Form Four limits, the identity and SIM requirements, the Ksh 50,000 business grant and the *254# application route are reported consistently by the World Bank project page and by The Star, Business Today, Nairobi Leo and Pulse. Sources disagree on the target number of youth (800,000 or 820,000) and one outlet gives 18 to 35 for all youth, so neither is recorded as a figure; 18 to 29 is the majority reading. The October 2025 closing date and the July 2026 second phase are each from one outlet, so no open date is recorded. The Hustler Fund exclusion is from one secondary source and is flagged as a report. A monthly stipend of Ksh 6,000 during the on-the-job experience track is now reported by Citizen Digital and Kenyans.co.ke independently, so it is stated in the description; it is not the figure in the amount field, which is the business grant.'
  },
  {
    id: 'f031',
    checked_at: '2026-11-19',
    name: 'German government (KfW), Ministry of Education and Equity Group Foundation - TVET scholarships in food and agriculture',
    type: 'scholarship',
    description: 'One of the few awards in this list aimed squarely at agriculture, the sector this catalogue covers most thinly against its share of the economy. Germany, through its development bank KfW, is financing 1,200 scholarships with the Ministry of Education and Equity Group Foundation for Kenyans aged 18 to 35 studying a Level 5 certificate or a Level 6 diploma in food and agriculture-related disciplines at 51 partner TVET institutions. You must first be admitted to one of the partner institutions, so the entry bar is the bar for the course itself: a craft certificate (Level 5) takes a KCSE mean grade of D plain through KUCCPS. The reported window closed on 18 November 2026; ask a partner institution or Equity Group Foundation whether another intake follows before planning on it.',
    coverage: 'Scholarship for a Level 5 certificate or Level 6 diploma in food and agriculture at a partner TVET institution; the published reports do not state an amount or exactly which costs are covered',
    max_amount_kes: null,
    eligibility: 'Kenyan aged 18 to 35, admitted to a food or agriculture-related Level 5 certificate or Level 6 diploma at one of the 51 partner TVET institutions. Admission comes first; the scholarship does not place you.',
    min_grade: 'D',
    application_deadline: 'The reported window closed on 18 November 2026. No later intake is published in any source reachable from this build.',
    website: 'https://equitygroupfoundation.com/',
    application_url: 'https://equitygroupfoundation.com/',
    requirements: [
      'Aged 18 to 35',
      'Admission to a food or agriculture-related Level 5 or Level 6 programme at one of the 51 partner TVET institutions',
      'The application made through the route named in the current call'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The 1,200 scholarships, the KfW financing, the partnership with the Ministry of Education and Equity Group Foundation, the 18 to 35 age range, the Level 5 and Level 6 scope, the food and agriculture focus, the 51 partner institutions and the admission-first rule are from the German Embassy announcement as reported by Kenyans.co.ke, November 2026; a second search returned the same programme with a closing date of 18 November 2026 at 4:30 pm. The D plain minimum is the published KUCCPS bar for a Level 5 craft certificate, recorded because admission to such a programme is a condition of the award; a Level 6 diploma asks more. No amount is recorded because none is published, and no open date is recorded because the reported window has closed.'
  },
  {
    id: 'f032',
    checked_at: '2026-11-19',
    name: 'KeNHA TVET Scholarships - Horn of Africa Gateway project (Isiolo, Meru, Wajir and Garissa)',
    type: 'scholarship',
    description: 'A separate KeNHA scheme from its Mombasa-Mariakani one, for the north. Under the World Bank-financed Horn of Africa Gateway Development Project, the Kenya National Highways Authority sponsors one-year technical courses for unemployed young people living in Isiolo, Meru, Wajir and Garissa. It is reported as covering tuition and boarding and paying a monthly subsistence stipend for the length of the course. Priority goes to applicants living with a disability, orphans, young people from single-parent families and young single parents. Forms are free from KeNHA regional offices in Isiolo and Garissa, area chiefs and county commissioners, and must be signed and stamped by the area chief or assistant county commissioner as proof of residence. Courses examined by KNEC, CDACC or a national polytechnic require a KCSE certificate.',
    coverage: 'Reported as tuition, boarding and a monthly subsistence stipend for a one-year course',
    max_amount_kes: null,
    eligibility: 'Kenyan citizen aged 18 to 35, unemployed, resident in Isiolo, Meru, Wajir or Garissa, with residence confirmed by the area chief or assistant county commissioner. A KCSE certificate for courses examined by KNEC, CDACC or a national polytechnic; no KCSE mean grade is published.',
    min_grade: null,
    application_deadline: 'The June 2026 call gave 23 July 2026; one later report gives a November 2026 date that could not be confirmed against a KeNHA notice. Check kenha.co.ke before applying.',
    website: 'https://kenha.co.ke/document-category/scholarships/',
    application_url: 'https://kenha.co.ke/document-category/scholarships/',
    requirements: [
      'Aged 18 to 35, unemployed, and resident in Isiolo, Meru, Wajir or Garissa',
      'Application form signed and stamped by the area chief or assistant county commissioner',
      'KCSE certificate for courses examined by KNEC, CDACC or a national polytechnic'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The programme, its World Bank financing under the Horn of Africa Gateway Development Project, the four counties, the 18 to 35 age range, the one-year course length, the coverage, the priority groups, the free forms and the residence stamp are from the KeNHA call for applications and application form published on kenha.co.ke in June 2026, and reported by Kenyans.co.ke and Kahawatungu. The 23 July 2026 closing date is on the KeNHA form; a later report gives 26 November, which no KeNHA notice reachable from this build confirms, so no open date is recorded. No amount is recorded because none is published.'
  },
  {
    id: 'f033',
    checked_at: '2026-11-19',
    name: 'NITA and the Government of Denmark - Kenya TVET Project construction-trade scholarships',
    type: 'scholarship',
    description: 'Reaches below the bar of almost every other award here: a KCSE D minus for school leavers, and no grade at all for construction workers entering through work experience or recognition of prior learning. The National Industrial Training Authority and the Danish Ministry of Foreign Affairs fund training in building and construction trades (carpentry, plumbing, electrical work and solar installation) at NITA training centres, covering tuition, examination and certification fees. Training runs two terms at the centre followed by a three-month industrial attachment arranged by NITA, and ends in a National Skills Certificate. Two further categories serve construction workers aged 18 to 35 without formal training and workers seeking recognition of prior learning. Women were strongly encouraged to apply. The call found is for the September 2025 intake at NITA Athi River; ask NITA whether a later intake is open.',
    coverage: 'Tuition, examination and certification fees, two terms of training and a three-month industrial attachment',
    max_amount_kes: null,
    eligibility: 'KCSE mean grade of D minus or above with an interest in building and construction trades; or a construction worker aged 18 to 35 without formal training; or a worker seeking recognition of prior learning.',
    min_grade: null,
    application_deadline: 'The call found was for the September 2025 intake at NITA Athi River. No 2026 intake is published in any source reachable from this build, so check nita.go.ke.',
    website: 'https://www.nita.go.ke/',
    application_url: 'https://www.nita.go.ke/',
    requirements: [
      'KCSE mean grade D minus or above, or construction work experience, or a recognition-of-prior-learning claim',
      'An interest in carpentry, plumbing, electrical work or solar installation'
    ],
    interest_rate: null,
    repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'The NITA and Danish Ministry of Foreign Affairs partnership under the Kenya TVET Project, the D minus minimum, the four trades, the fee coverage, the two terms plus three-month attachment, the National Skills Certificate, the further categories and the encouragement to women are reported consistently by The Kenya Times (May 2025), Opportunities for Young Kenyans and CampusBiz, summarising the NITA call. The September 2025 intake at NITA Athi River is from one listing. The minimum grade field is left empty rather than D minus because two of the three routes ask for no KCSE grade, and quoting D minus would hide the award from an E-grade worker who qualifies. No amount is recorded because none is published, and no open date is recorded because the only intake found has passed.'
  },
  {"id": "f034", "checked_at": "2026-11-19", "name": "Bomet County Full Scholarship (VTC trainees)", "type": "scholarship", "description": "Bomet County Government scholarship that pays full tuition for needy learners. Each year it covers Form One day scholars and NEWLY ADMITTED trainees at any of the county's 33 vocational training centres (VTCs). No KCSE grade bar is published. You must live in Bomet and have an admission letter from a registered VTC. Priority goes to orphans, learners with a chronic illness or disability, and families displaced by disasters. Earlier county forms say it covers tuition only, at the published fees structure, so you still meet boarding and personal costs. Apply on the county form, available from county education offices, ward administrators or bomet.go.ke. It runs as an annual call; the 2026 window closed on 6 February 2026, so ask the county when the next round opens. Bomet also hosts the separate Finlays/Browns trust scholarships at Konoin and Belgut TTIs.", "coverage": "Tuition support; see the description for what it covers and who selects", "max_amount_kes": null, "eligibility": "Bomet residents newly admitted to one of the county's 33 VTCs, needy, with proof of admission; priority to orphans, chronically ill or disabled learners and disaster-displaced families. No KCSE grade bar published.", "min_grade": null, "application_deadline": "No open window published on 19 November 2026; ask the provider when the next round opens.", "website": "https://bomet.go.ke/", "application_url": "https://bomet.go.ke/", "requirements": ["Bomet residents newly admitted to one of the county's 33 VTCs, needy, with proof of admission; priority to orphans, chronically ill or disabled learners and disaster-displaced families. No KCSE grade bar published."], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "Reported by independent sources (educationnews.co.ke, bomet.go.ke) and re-checked in November 2026. No award amount is recorded because none is published per learner; pools are quoted only as pools and are not divided. No open date is recorded. What was found and not recorded: The task brief mentioned a three-year tuition term, but no source states a VTC duration. The county's older scholarship covers the full four years of secondary school, and that is not a VTC figure. No award amount was published, so none is recorded. Bomet reported 625 VTC full scholarships in one earlier round (bomet.go.ke), but that figure is a cohort count, not an amount."},
  {"id": "f035", "checked_at": "2026-11-19", "name": "Elgeyo Marakwet County free VTC tuition", "type": "bursary", "description": "Elgeyo Marakwet County has waived tuition for every student joining its county vocational training centres (VTCs). This is a fee waiver, not an application-based scholarship: if you enrol at a county VTC you pay no tuition, and accommodation is the main cost left. The county runs 18 VTCs, with two more nearly built, under a plan for one in every ward. It is also hiring 40 instructors to deal with staff shortages. Governor Wisley Rotich announced the waiver at an Iten Youth Polytechnic graduation. No KCSE grade bar applies to the waiver; the VTC's own entry rules do. The reports give no start date, so before you budget on it, confirm with the VTC that the waiver covers your intake. The policy covers county VTCs only. Technical training institutes and national polytechnics in the county are on the national TVET fee and the HEF scholarship route instead.", "coverage": "Tuition support; see the description for what it covers and who selects", "max_amount_kes": null, "eligibility": "Anyone enrolling at an Elgeyo Marakwet county VTC; no grade bar for the waiver itself.", "min_grade": null, "application_deadline": "No open window published on 19 November 2026; ask the provider when the next round opens.", "website": "https://www.kenyanews.go.ke/elgeyo-marakwet-county-government-to-offer-free-vtc-training/", "application_url": "https://www.kenyanews.go.ke/elgeyo-marakwet-county-government-to-offer-free-vtc-training/", "requirements": ["Anyone enrolling at an Elgeyo Marakwet county VTC; no grade bar for the waiver itself."], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "Reported by independent sources (educationnews.co.ke, kenyanews.go.ke) and re-checked in November 2026. No award amount is recorded because none is published per learner; pools are quoted only as pools and are not divided. No open date is recorded. What was found and not recorded: Neither report gives the date the waiver took effect, how it is funded, or a per-trainee value, so no amount is recorded."},
  {"id": "f036", "checked_at": "2026-11-19", "name": "Turkana County Education Fund (bursaries and scholarships)", "type": "bursary", "description": "A statutory county fund, set up under the Turkana County Education Fund Act 2023, that pays bursaries, scholarships and a small higher-education loan scheme to Turkana residents. It is not limited to secondary school or university: in one reported phase 7,204 learners in colleges and TVET institutions were supported, alongside 2,880 university students and 13,334 secondary students. The governor has publicly urged school-leavers towards technical courses. It is need-based and no KCSE grade bar is published, so it can reach a learner whose grade closed every merit scholarship. The county announced Sh430 million for bursaries in May 2026. That is a pool, not a per-student award, and Njia does not divide it. Apply through the county's education department or your ward bursary committee when the call is advertised. No open window was reachable on 19 November 2026.", "coverage": "Tuition support; see the description for what it covers and who selects", "max_amount_kes": null, "eligibility": "Needy Turkana residents at secondary, college/TVET and university level; no grade bar published.", "min_grade": null, "application_deadline": "No open window published on 19 November 2026; ask the provider when the next round opens.", "website": "https://turkana.go.ke/", "application_url": "https://turkana.go.ke/", "requirements": ["Needy Turkana residents at secondary, college/TVET and university level; no grade bar published."], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "Reported by independent sources (kenyanews.go.ke, eastleighvoice.co.ke, standardmedia.co.ke) and re-checked in November 2026. No award amount is recorded because none is published per learner; pools are quoted only as pools and are not divided. No open date is recorded. What was found and not recorded: Pool figures conflict across dated reports: Sh534 million at the January 2024 launch (80% or Sh427m for bursaries, 12% or Sh64m for scholarships), Sh430 million in a later year, and a county statement of Ksh 26 million for the Higher Education Loan Scheme. None is an individual award, so no amount is recorded."},
  {"id": "f037", "checked_at": "2026-11-19", "name": "Safaricom Foundation Wezesha Vijana / TVET Mashinani", "type": "scholarship", "description": "A Safaricom Foundation programme with Catholic Relief Services (CRS), known as Wezesha Vijana and as TVET Mashinani. It pays full TVET scholarships for marginalised and underprivileged youth in Nairobi, Isiolo and Marsabit, with training at partner institutions such as Kibondeni College, Uhuru Polytechnic and Nyeri National Polytechnic. The first year, from 2023, sponsored 333 youth: 160 in Nairobi (105 women, 55 men) and at least 73 in Marsabit. A second Isiolo cohort of 115 was reported in October 2025, and the stated aim is 2,400 youth by the end of the project. This is NOT an open national application. Beneficiaries are chosen on need and community recommendation through CRS, Caritas and the county governments. If you live in one of the three counties, ask your county youth office or the local Caritas office how selection works. No KCSE grade bar is published. The last cohorts reported ran in 2023 to 2025 and no current call was found, so ask whether a new cohort is open.", "coverage": "Tuition support; see the description for what it covers and who selects", "max_amount_kes": null, "eligibility": "Marginalised or underprivileged youth in Nairobi, Isiolo and Marsabit counties, selected on need and community recommendation; no grade bar published. CRS site listings mention ages 18 to 34 (not corroborated).", "min_grade": null, "application_deadline": "No open window published on 19 November 2026; ask the provider when the next round opens.", "website": "https://safaricom.co.ke/media-center-landing/press-releases/safaricom-foundation-partners-with-catholic-relief-services-to-launch-wezesha-vijana-tvet-program", "application_url": "https://safaricom.co.ke/media-center-landing/press-releases/safaricom-foundation-partners-with-catholic-relief-services-to-launch-wezesha-vijana-tvet-program", "requirements": ["Marginalised or underprivileged youth in Nairobi, Isiolo and Marsabit counties, selected on need and community recommendation; no grade bar published. CRS site listings mention ages 18 to 34 (not corroborated)."], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "Reported by independent sources (safaricom.co.ke, the-star.co.ke, standardmedia.co.ke) and re-checked in November 2026. No award amount is recorded because none is published per learner; pools are quoted only as pools and are not divided. No open date is recorded. What was found and not recorded: The age bracket of 18 to 34 appears only in CRS staffing listings, so it is not recorded as eligibility. A separate Ksh 130 million Safaricom Foundation TVET investment, focused on plumbing, welding, food and beverage and electrical, was reported, but its date and relation to this programme could not be settled. No 2026 intake was found."},
  {"id": "f038", "checked_at": "2026-11-19", "name": "Nakuru County VTC capitation and tuition support", "type": "bursary", "description": "Nakuru County pays a capitation grant to its county vocational training centres (VTCs) for every enrolled learner. The county says that it fully covers tuition and learning materials at its VTCs, and needy trainees can get a county bursary towards the lunch programme. Because the grant goes to the VTC, not to the trainee, there is no form to fill: enrol at a Nakuru county VTC and the support follows. No KCSE grade bar applies beyond the VTC's own entry rules. This covers county VTCs only; national polytechnics and TTIs in Nakuru are on the national TVET fee and HEF route. Confirm with the centre what the capitation covers before you budget on it.", "coverage": "Tuition support; see the description for what it covers and who selects", "max_amount_kes": null, "eligibility": "Trainees enrolled at Nakuru county VTCs; no grade bar beyond VTC entry; lunch bursary for needy trainees.", "min_grade": null, "application_deadline": "No open window published on 19 November 2026; ask the provider when the next round opens.", "website": "https://nakuru.go.ke/governor-susan-kihika-champions-vocational-training-transformation/", "application_url": "https://nakuru.go.ke/governor-susan-kihika-champions-vocational-training-transformation/", "requirements": ["Trainees enrolled at Nakuru county VTCs; no grade bar beyond VTC entry; lunch bursary for needy trainees."], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "Reported by independent sources (nakuru.go.ke, famousnakuru.co.ke) and re-checked in November 2026. No award amount is recorded because none is published per learner; pools are quoted only as pools and are not divided. No open date is recorded. What was found and not recorded: The per-learner capitation is given as Sh30,000 in several county publications and in a county graduation report for 2023/24. It is not recorded as an award amount because it is paid to the institution, not to the learner. The period (per year or per course) is not stated consistently, and it is not clear whether the Sh480 million total covers one year or several. Enrolment figures also differ: 6,250 in one county report and 6,850 in another."},
  {"id": "f039", "checked_at": "2026-11-21", "name": "Kisumu County VTC subsidy and bursaries", "type": "bursary", "description": "For anyone who enrols at one of Kisumu County's 28 county vocational training centres (VTCs), whatever their KCSE grade. The county reports paying a subsidy of Ksh 15,000 for every trainee, which comes off the fee bill, and runs a separate need-tested bursary for VTC trainees. The subsidy is paid to the VTC, so there is no form for it: enrol and it is deducted. For the bursary, ask the VTC or the county education office how to apply. This covers county VTCs only, not national polytechnics or TVCs.", "coverage": "County subsidy of a reported Ksh 15,000 per trainee, paid to the VTC and deducted from fees; a separate need-tested county VTC bursary", "max_amount_kes": null, "eligibility": "Trainee enrolled at a Kisumu County VTC; no KCSE grade bar beyond the VTC's own entry rules; the bursary is need-tested", "min_grade": null, "application_deadline": "No open window published on 21 November 2026; ask the VTC or the county education office.", "website": "https://www.kisumu.go.ke/kisumu-county-donates-ksh-38-million-equipment-to-vocational-training-centers/", "application_url": null, "requirements": ["Admission to a Kisumu County VTC", "For the bursary: evidence of need, as set by the county"], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "The Ksh 15,000 per-trainee subsidy is stated by the governor as reported by Kenya News Agency, the county's own site and Education News (2026), and the county's 2024 statement calls it partial payment of applicable fees. It is not recorded as an award amount because it is paid to the institution, its period is not stated, and the 2024 county VET policy gives Ksh 40,000. The 2025/26 capitation budget (Sh125.5 million) and the VTC bursary (Ksh 11.9 million, reported by KNA) are pools and are not divided."},
  {"id": "f040", "checked_at": "2026-11-21", "name": "Kenya Blue Economy Skills Training (KBEST): scholarships at partner colleges (Coast and Lake Victoria)", "type": "scholarship", "description": "For young people, especially young women, training in blue-economy trades at partner vocational training centres and national polytechnics in the Coast and Lake Victoria counties: marine engine repair, marine refrigeration, basic safety and firefighting, baking, and accommodation and hospitality operations. KBEST is a seven-year programme funded by the Government of Canada (Global Affairs Canada) and run by Colleges and Institutes Canada with Kenya's Ministry of Education, and it partners with Equity Group Foundation to provide scholarships and other student support for girls and women. Partner institutions named include Mtongwe VTC (Likoni), Kisauni VTC and the Kenya Coast National Polytechnic. No award amount is published. Ask the partner institution whether support is open for its next intake.", "coverage": "Scholarships and other financial support for blue-economy TVET training at partner VTCs and national polytechnics; no per-learner amount published", "max_amount_kes": null, "eligibility": "Admitted to a KBEST-partner TVET institution in the Coast or Lake Victoria counties; priority to young women", "min_grade": null, "application_deadline": "No open window published on 21 November 2026; ask the partner institution.", "website": "https://www.nscc.ca/international/projects/project/kenya-blue-economy-skills-training.asp", "application_url": null, "requirements": ["Admission to a KBEST-partner TVET institution in a blue-economy course"], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "The programme, its funder (Global Affairs Canada) and its implementer (Colleges and Institutes Canada with the Ministry of Education) are confirmed by the Government of Canada project browser, a Ministry of Blue Economy release, NSCC International's project pages and TVETA. CICan's own page states the Equity Group Foundation partnership for scholarships and student support for girls and women. Mombasa courses at Mtongwe and Kisauni VTCs are reported by zakenya.com. What was found and not recorded: sources disagree on the end year (2028 against 2022 to 2029) and on the number of partner institutions (22 against 24); one implementing-college page gives 1,250 of 5,472 learners receiving financial support; and one aggregator describes a 2026 call for ages 18 to 29 closing 6 October 2026, which no second source repeats and which is past."},
  {"id": "f041", "checked_at": "2026-11-21", "name": "Kakamega County: Barasa Jamii Scholarship and county polytechnic bursaries", "type": "scholarship", "description": "For Kakamega County residents from underprivileged families, by two routes. The Barasa Jamii Scholarship, run with ACCES (African Canadian Continuing Education Society) Kenya, pays full scholarships for university study: 89 students in 2026, its fifth cohort, and 333 since 2022. Separately, the county pays bursaries to trainees in its county polytechnics and capitation to the polytechnics themselves; its November 2025 round reportedly paid Ksh 5,000 to each of about 5,870 trainees across 68 county polytechnics, one round's figure rather than a standing award. No grade bar is published for either route. Polytechnic support follows enrolment, and the scholarship is selected by the county. Ask the county education office when the next round opens.", "coverage": "Jamii: full scholarship for university study (89 awards in 2026). County polytechnics: need-tested bursary plus capitation paid to the polytechnics. No standing per-learner amount published.", "max_amount_kes": null, "eligibility": "Kakamega County resident from an underprivileged family; admitted to a university (Jamii) or enrolled at a Kakamega county polytechnic (bursary)", "min_grade": null, "application_deadline": "No open window published on 21 November 2026; ask the county education office.", "website": "https://kakamega.go.ke/?p=16867", "application_url": null, "requirements": ["Proof of Kakamega residence", "Evidence of need", "Admission letter"], "interest_rate": null, "repayment_period": null, "data_confidence": "verified", "verification_note": "The 2026 Jamii awards (89 full scholarships, fifth cohort, with ACCES Kenya; 333 students since 2022) are reported by the county's own site, Morning Mail (24 August 2026) and Education News. The polytechnic bursary (Ksh 30 million, November 2025, about 5,870 trainees at Ksh 5,000) and capitation (Ksh 56 million for about 16,000 trainees, May 2026) are reported by the county and Education News; pools are not divided. What was found and not recorded: the 2025 Jamii cohort was reported at at least Ksh 40,000 per year per student, which is a floor; one report gives polytechnic capitation at Ksh 15,000 a year, paid to the institution; a KNA page calls an award round the third cohort rather than the fifth; and an undated county page gives a Ksh 240 million bursary for 59,200 students that conflicts with the 2026 figures."},
  {"interest_rate": null, "repayment_period": null, "application_url": null, "data_confidence": "verified", "checked_at": "2026-11-24", "id": "f042", "name": "KMTC and Beyond Zero: full scholarship for the Certificate in Community Health Nursing", "type": "scholarship", "description": "A fully paid route into nursing at a C- mean grade. The Beyond Zero initiative and KMTC sponsor the two-year Certificate in Community Health Nursing in full for the September 2026 intake, with priority for applicants from selected ASAL counties, underserved minorities and vulnerable groups; female applicants are encouraged, and graduates are expected to serve their home communities. Apply through KMTC's advert for each intake and ask whether a later intake is sponsored.", "coverage": "Full course sponsorship; no shilling amount published.", "max_amount_kes": null, "eligibility": "KCSE mean C- with C- in English or Kiswahili and in Biology, and a D or D+ in one of Mathematics, Physics or Chemistry; priority to selected ASAL counties and marginalised groups", "min_grade": "C-", "application_deadline": "Per KMTC intake; the September 2026 call is past and no later call was published on 24 November 2026.", "website": "https://kmtc.ac.ke", "requirements": ["KCSE certificate", "Evidence of home county", "KMTC application"], "verification_note": "KMTC's own September 2026 Beyond Zero advert, Kenyans.co.ke, Education News and the Kenya Times agree on a full scholarship for the two-year certificate at a C- mean grade with ASAL priority. One guide gives the length as two and a half years; KMTC's notices say two. The subject grades are reported as D in one source and D+ in another for the third subject."},
  {"interest_rate": null, "repayment_period": null, "application_url": null, "data_confidence": "verified", "checked_at": "2026-11-24", "id": "f043", "name": "Murang'a County Inua Masomo transition bursary", "type": "bursary", "description": "A one-off payment to help Murang'a day-school leavers who scored C+ and above move to university or college. In 2026, over 300 students from the 2025 KCSE received Ksh 10,000 each; the programme is described as reaching the top performers of each day secondary school, so a C+ alone may not secure it. The amount changes between rounds (Ksh 15,000 in 2022). Ask the county education office when the next round opens.", "coverage": "One-off transition payment; Ksh 10,000 per student in the 2026 round.", "max_amount_kes": 10000, "eligibility": "Murang'a resident who sat KCSE at a day secondary school in the county with a C+ or above", "min_grade": "C+", "application_deadline": "Paid once a year after KCSE results; no 2027 round announced on 24 November 2026.", "website": "https://muranga.go.ke/bursaries.php", "requirements": ["KCSE result slip", "Day-school leaving certificate", "Admission letter"], "verification_note": "Education News and Kenya News Agency report the 2026 round at Ksh 10,000 each to over 300 students; the county's bursary page lists the programme. The award amount is published for that round only."}
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

/* WHAT A FEE-LESS CARD CAN STILL TELL A READER, VERIFIABLY.
 *
 * 743 records carry no figure, and 459 of those are public-university degrees
 * where no per-programme price EXISTS to find - the SCFM sets what a student
 * pays from an assessed household band. The card said so and stopped, which
 * reads to someone deciding where to apply as "there is nothing to know".
 * There is: the band SHARES are published, they are percentages of the course
 * cost, and a reader who knows their band can work out their own number.
 *
 * This is the tier-benchmark architecture again - shown at render time, never
 * written into total_fees_kes - applied to a published METHOD rather than to a
 * median. It names the instrument in every case, because a guideline a reader
 * cannot check is worth no more than a fee they cannot check. */
const SCFM_HOUSEHOLD_SHARE = {
  source: 'Higher Education Funding model band structure as published for 2025/26 (HELB Means Testing Instrument; Universities Fund; cross-reported in sector press, August 2026). The same figures are carried in the SCFM answer on /help/ and must agree with it.',
  bands: 5,
  householdSharePctMin: 0,
  householdSharePctMax: 40,
  scholarshipPctMax: 70,
  scholarshipPctMin: 30,
  portal: 'the HEF portal',
  reading: 'What you pay is a percentage of the course cost, set by your assessed band: the household share runs from nothing in Band 2 up to about 40% in Band 5, with the government scholarship covering 70% down to 30% and a HELB loan over the rest. A cheaper programme therefore costs you less in shillings at the same band. Apply on the HEF portal and appeal the band if your circumstances were misread.',
  privateExclusion: 'At a private university you can take the HELB loan but NOT the government scholarship, which is reserved for public universities and the Open University of Kenya - so the same band leaves a much larger share with your household.'
};

/* THE NATIONAL UNIVERSITY FEE SCHEDULE, SEPTEMBER 2025.
 *
 * From 1 September 2025 the Ministry of Education replaced per-programme
 * pricing at public universities with a schedule of 14 cost-based clusters,
 * each with a minimum and maximum fee payable per SEMESTER, for new and
 * continuing students. Where a student falls inside the range depends on
 * their funding assessment. The ranges below are those reported consistently
 * across outlets and re-sighted by a search that named no figure; clusters
 * whose readings disagree carry both, and economics, education and ICT are
 * left out because no consistent reading was found.
 *
 * Shown on the card, never written into total_fees_kes: it is a range that
 * depends on the reader's band, not a price for the course. The programme is
 * placed in a cluster by its NAME, which is Njia's judgement, and the card
 * says so. Patterns are tested in order; `exclude` wins over `match`. */
const SCFM_FEE_CLUSTERS_2025 = {
  effective: '1 September 2025',
  source: 'Ministry of Education national cluster fee schedule for public universities, effective 1 September 2025, as reported by The Star (31 July and 5 September 2025), The Standard, Kenya Times, Money254, Eastleigh Voice, Business Radar, Nairobi Wire, Kenya Insights and Education News; no 2026/27 revision was found when checked in November 2026.',
  clusters: [
    { name: 'education (arts)', match: 'education \\(arts|education arts', range: 'Ksh 7,525 to 30,101 a semester, the same group as business and economics' },
    { name: 'education (science)', match: 'education \\(science|education science|special needs education', range: 'Ksh 11,628 to 46,512 a semester, the same group as the applied sciences' },
    { name: 'food sciences and nutrition', match: 'food science|food and nutrition', range: 'Ksh 11,401 to 45,603 a semester' },
    { name: 'veterinary medicine and pharmacy', match: 'veterinary medicine|pharmacy', range: 'from about Ksh 12,343 a semester in the pre-clinical years up to Ksh 75,000 in the clinical years; outlets disagree on the clinical floor (Ksh 19,152 or 20,546)' },
    { name: 'medicine and dentistry', match: 'medicine and (bachelor of )?surgery|mbchb|dental surgery|dentistry', range: 'about Ksh 12,960 to 51,840 a semester in the pre-clinical years and Ksh 22,371 to 75,000 in the clinical years (one outlet gives the pre-clinical floor as Ksh 12,343)' },
    { name: 'nursing and health sciences', match: 'nursing|clinical medicine|medical laboratory', range: 'Ksh 14,400 to 57,600 a semester' },
    { name: 'engineering and surveying', match: 'engineering|surveying', exclude: 'software', range: 'Ksh 14,256 to 57,024 a semester' },
    { name: 'architecture', match: 'architecture', range: 'from Ksh 12,960 a semester, with a ceiling reported as Ksh 51,840 by one outlet and Ksh 57,888 by another' },
    { name: 'law, agribusiness and related programmes', match: '\\blaws?\\b|\\bllb\\b|agribusiness|aviation management|maritime management|fine arts?\\b|theatre|food service', range: 'Ksh 9,690 to 38,760 a semester' },
    { name: 'agriculture, natural resources and wildlife', match: 'agricultur|animal (science|production|health)|horticultur|natural resource|wildlife|crop (science|protection)|range management|agronomy', exclude: 'biotechnolog|engineering|economics', range: 'Ksh 9,720 to 38,880 a semester' },
    { name: 'applied sciences', match: 'biochemistry|biotechnolog|microbiology|environmental science', exclude: 'agricultur|medical', range: 'Ksh 11,628 to 46,512 a semester' },
    { name: 'business, commerce and economics', match: 'commerce|business administration|business management|\\beconomics\\b', exclude: 'information technology|agribusiness|agricultur', range: 'Ksh 7,525 to 30,101 a semester (one outlet gives this group as Ksh 6,814 to 27,097)' },
    { name: 'applied humanities and social sciences', match: 'international relations|anthropolog|psycholog|public administration|social work|development studies', exclude: 'medical psycholog', range: 'Ksh 6,982 to 27,927 a semester' },
    { name: 'public and allied health sciences', match: 'public health|environmental health|community health|radiograph|medical psycholog|physical therap|physiotherap|sports? science', range: 'Ksh 13,082 to 52,326 a semester (one outlet prints the ceiling as Ksh 52,236)' },
    { name: 'basic sciences', match: '\\b(mathematics|physics|chemistry|biology)\\b', exclude: 'comput|economics|industrial|analytical|applied|bio(chem|technolog)|medical|education|statistic|actuarial', range: 'Ksh 10,659 to 42,636 a semester; some outlets list physics and applied chemistry in the applied sciences group instead (Ksh 11,628 to 46,512)' },
    { name: 'applied social sciences and arts (professional)', match: 'hospitality|tourism|journalism|mass communication|media studies|library', range: 'Ksh 9,690 to 38,760 a semester' },
    { name: 'basic humanities and social sciences', match: '\\b(geography|history|philosophy|sociology|linguistics)\\b', range: 'Ksh 5,814 to 23,256 a semester' },
  ],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUNDING_SOURCES, PUBLIC_TVET_CAPITATION, SCFM_HOUSEHOLD_SHARE, SCFM_FEE_CLUSTERS_2025 };
}
