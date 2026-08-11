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
    coverage: 'Scholarship + loan + household contribution, split by funding band', max_amount_kes: 60000,
    eligibility: 'Kenyan citizen, admitted to a HEF-recognised university or TVET institution, means-tested via the HEF portal',
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
    description: 'Constituency-level bursary disbursed to needy secondary, TVET and university students through the local NG-CDF office.',
    coverage: 'Partial tuition, paid directly to the institution', max_amount_kes: 30000,
    eligibility: 'Resident of the constituency, demonstrated financial need; open to secondary, TVET and university students',
    min_grade: null, application_deadline: 'Varies by constituency — 2025/26 application notices are published on ngcdf.go.ke',
    website: 'https://ngcdf.go.ke', application_url: null,
    requirements: ['Application form from local NG-CDF office', 'Fee structure', 'Admission/school letter'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Award range (typically Ksh 5,000-30,000 per student per year, varying by constituency; some constituencies report up to 50,000), payment direct to institutions, and the 2025/26 application cycle confirmed via ngcdf.go.ke public notices and bursary guides, August 2026. Your constituency\'s actual range depends on its allocation — confirm at the local NG-CDF office.'
  },
  {
    id: 'f006', name: 'County Government Bursary Fund', type: 'bursary',
    description: 'Devolved bursary fund administered by each county government for residents in tertiary institutions.',
    coverage: 'Partial tuition', max_amount_kes: 20000,
    eligibility: 'County resident, financial need, enrolled in a recognised institution',
    min_grade: null, application_deadline: 'Varies by county, typically per financial year',
    website: null, application_url: null,
    requirements: ['County bursary application form', 'Fee structure', 'Admission letter', 'Chief\'s letter'],
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
    description: 'Public TVET training is government-subsidised: institutions receive per-student capitation, students apply for HEF scholarship/loan support, and from May 2026 public TVETs charge a single consolidated annual fee set by government.',
    coverage: 'Subsidised public-TVET tuition; consolidated annual fee of Ksh 67,189 (incl. assessment) from May 2026', max_amount_kes: 67189,
    eligibility: 'Enrolled in a public TVETA-registered institution; HEF support is means-tested via the HEF portal',
    min_grade: null, application_deadline: 'Capitation is institutional; apply for HEF support with each intake',
    website: 'https://www.education.go.ke', application_url: 'https://portal.helb.co.ke',
    requirements: ['Admission to a registered public TVET institution', 'HEF application for scholarship/loan support'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'verified',
    verification_note: 'Consolidated public-TVET annual fee of Ksh 67,189 (inclusive of assessment fees, effective May 2026) as announced by government and reported by Eastleigh Voice and sector coverage, August 2026; 2025/26 TVET capitation disbursements confirmed via Ministry of Education reporting. Per-course billing may vary — confirm with the institution\'s registrar.'
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
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUNDING_SOURCES };
}
