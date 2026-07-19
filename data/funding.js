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
    description: 'Full scholarship for high-achieving, financially needy students entering secondary school, with a university/TVET continuation track for alumni.',
    coverage: 'Full tuition, upkeep, mentorship', max_amount_kes: 400000,
    eligibility: 'Financially needy, high academic performance, Equity Leaders Program alumni prioritised',
    min_grade: 'B', application_deadline: 'Varies — check annually',
    website: 'https://equitygroupfoundation.com', application_url: 'https://equitygroupfoundation.com/wings-to-fly',
    requirements: ['Means testing', 'KCPE/KCSE results', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f003', name: 'Mastercard Foundation Scholars Program', type: 'scholarship',
    description: 'Comprehensive scholarship for academically talented but economically disadvantaged African youth, delivered through partner universities.',
    coverage: 'Full tuition, accommodation, upkeep, mentorship', max_amount_kes: 1500000,
    eligibility: 'Economically disadvantaged, strong academic record, leadership potential',
    min_grade: 'B+', application_deadline: 'Varies by partner university',
    website: 'https://mastercardfdn.org', application_url: 'https://mastercardfdn.org/scholars',
    requirements: ['Academic transcripts', 'Financial need statement', 'Essays', 'Recommendation letters'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f004', name: 'Zawadi Africa Education Fund', type: 'scholarship',
    description: 'Scholarship and mentorship programme for academically talented young African women facing financial hardship.',
    coverage: 'Tuition, upkeep, mentorship', max_amount_kes: 500000,
    eligibility: 'Female applicants, financial need, strong academic record',
    min_grade: 'B', application_deadline: 'Annually — typically early in the year',
    website: 'https://zawadiafrica.org', application_url: 'https://zawadiafrica.org/apply',
    requirements: ['Academic transcripts', 'Financial need statement', 'Personal essay'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f005', name: 'National Government Constituency Development Fund (NG-CDF) Bursary', type: 'bursary',
    description: 'Constituency-level bursary disbursed to needy secondary, TVET and university students through the local NG-CDF office.',
    coverage: 'Partial tuition', max_amount_kes: 15000,
    eligibility: 'Resident of the constituency, demonstrated financial need',
    min_grade: null, application_deadline: 'Varies by constituency, typically twice a year',
    website: 'https://ngcdf.go.ke', application_url: null,
    requirements: ['Application form from local NG-CDF office', 'Fee structure', 'Admission/school letter'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
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
    coverage: 'Business capital / training subsidy', max_amount_kes: 100000,
    eligibility: 'Kenyan youth aged 18–35, business idea or existing youth-led enterprise',
    min_grade: null, application_deadline: 'Rolling',
    website: 'https://youthfund.go.ke', application_url: 'https://youthfund.go.ke/apply',
    requirements: ['National ID', 'Business plan or group registration', 'Training certificate (for some products)'],
    interest_rate: 'Approx. 8% per annum (product-dependent)', repayment_period: 'Up to 3 years',
    data_confidence: 'illustrative'
  },
  {
    id: 'f008', name: 'KCB Foundation Scholarship Program', type: 'scholarship',
    description: 'Scholarship for bright, needy students, with additional support through the KCB 2jiajiri skills and enterprise programme.',
    coverage: 'Tuition + upkeep', max_amount_kes: 300000,
    eligibility: 'Financial need, strong academic performance',
    min_grade: 'B-', application_deadline: 'Annually',
    website: 'https://kcbfoundation.com', application_url: 'https://kcbfoundation.com/scholarship',
    requirements: ['Transcripts', 'Financial need documentation', 'Recommendation letter'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
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
    id: 'f010', name: 'Elimu Scholarship Fund (Corporate CSR Pool)', type: 'scholarship',
    description: 'Pooled term used here for various corporate CSR scholarship programmes (banks, telcos, manufacturers) supporting needy students annually.',
    coverage: 'Full or partial tuition', max_amount_kes: 200000,
    eligibility: 'Varies by sponsor — typically financial need + academic merit',
    min_grade: 'C+', application_deadline: 'Varies by sponsor, usually January–March',
    website: null, application_url: null,
    requirements: ['Transcripts', 'Financial need statement', 'Sponsor-specific application form'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
  },
  {
    id: 'f011', name: 'Jielimishe / TVET Capitation Support', type: 'bursary',
    description: 'Government capitation subsidy reducing TVET tuition for learners enrolled in registered technical institutions.',
    coverage: 'Partial tuition subsidy', max_amount_kes: 25000,
    eligibility: 'Enrolled in a TVETA-registered institution',
    min_grade: null, application_deadline: 'Processed automatically at enrolment by most institutions',
    website: 'https://tveta.go.ke', application_url: null,
    requirements: ['Admission to a registered TVET institution'],
    interest_rate: null, repayment_period: null,
    data_confidence: 'illustrative'
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
