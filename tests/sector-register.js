/* Njia — industry sector register.
 *
 * WHY THIS EXISTS.
 *
 * The catalogue grew by whatever happened to get researched that day. That is
 * how Kenya's flagship hospitality college ended up with one record priced off
 * a fee regime that does not apply to it and flagged "verified", and how a KMTC
 * clinical medicine diploma ended up with the same defect. Neither was found by
 * a test. One was found because a reader asked "Utalii college?" and the other
 * only because the first one prompted a systematic sweep.
 *
 * Opportunistic sourcing cannot answer the two questions that actually matter:
 *   - which industries does Njia cover, and which does it silently omit?
 *   - for each industry, who awards the qualification and who sets the fee?
 *
 * This register answers both, per sector, with the awarding body and the fee
 * regime named. tests/sector-coverage.test.js enforces it. A sector with no
 * catalogue presence has to be declared a gap in writing rather than simply
 * being absent, because an absence looks identical to a decision until someone
 * writes down which one it was.
 *
 * NOT SHIPPED. This lives in tests/ rather than data/ deliberately: it is a
 * research and QA artefact, the UI does not render it, and Njia's users are on
 * metered mobile data. If the app ever surfaces sector coverage to readers,
 * move it to data/ and add it to the service worker manifest then, not before.
 *
 * FEE REGIMES. The field that would have caught both bugs. Every institution
 * carries fee_regime, and a course may only derive its fee from the regime its
 * own institution is on:
 *
 *   tvet_consolidated   Public TVET on the government's consolidated Ksh 67,189
 *                       per year, inclusive of assessment, effective May 2026.
 *   ttc_consolidated    Public teacher training colleges, same headline rate.
 *   kmtc                Kenya Medical Training College. Ministry of Health
 *                       corporation with its own national structure: Ksh 82,200
 *                       in Year 1, Ksh 78,000 in each subsequent year.
 *   tourism_corporation Kenya Utalii College and Ronald Ngala Utalii College.
 *                       Ministry of Tourism state corporations that set their
 *                       own fees. Published figures conflict; see UTALII_FEE_NOTE.
 *   parastatal_own_rate Employer-owned institutes — the civil aviation
 *                       authority, Kenya Pipeline, KenGen, the ports authority,
 *                       the railway, the roads department, the revenue
 *                       authority, the water institute. Each a state
 *                       corporation under a line ministry with its own
 *                       schedule; several publish none at all.
 *   public_university   Public universities, differentiated unit cost.
 *   private_own_rate    Private universities and colleges, own published rates.
 */

const FEE_REGIMES = [
  'tvet_consolidated', 'ttc_consolidated', 'kmtc', 'tourism_corporation',
  'parastatal_own_rate', 'public_university', 'private_own_rate'
];

/* A note may only claim to DERIVE a fee from a regime the institution is on.
 * The distinction matters: the Utalii note names the Ksh 67,189 rate in order
 * to say it does not apply, which is the opposite of deriving from it — so the
 * signature has to match derivation language, not the bare figure. */
const DERIVATION_SIGNATURES = {
  /* Both public TVET and the teacher training colleges quote Ksh 67,189, so
   * these two patterns have to be mutually exclusive or every TTC record trips
   * the TVET rule. The TTC records say "first-year figure ... at public TTCs";
   * the TVET records say "consolidated annual public-TVET fee". */
  tvet_consolidated: /derived from the (?:government's )?consolidated annual public-TVET fee/i,
  ttc_consolidated: /derived from the Ksh 67,189 first-year figure/i,
  kmtc: /KMTC publishes one national fee structure/i
};

/* Sectors are the industry view, not the interest-cluster view. The clusters
 * (carer, maker, numbers...) describe a learner; these describe an economy, and
 * a gap here is a gap in what Njia can offer regardless of who is asking.
 *
 * `expect` is the minimum number of catalogue records for the sector to count
 * as covered. It is a floor for "we have actually sourced this", not a target.
 * `gap` records what is known to be missing and is required to be non-empty
 * when a sector is thin — a declared gap is research, an undeclared one is an
 * accident. */
const SECTORS = [
  {
    id: 'health',
    name: 'Health and care',
    awardingBodies: ['KMTC', 'Nursing Council of Kenya', 'Clinical Officers Council', 'TVET CDACC'],
    feeRegimes: ['kmtc', 'tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /nursing|clinical|health|medical|nutrition|pharm|laborator|counsell|social work|community develop/i,
    expect: 40,
    gap: 'Over-represented relative to every other sector because KMTC runs 40-odd campuses and Njia lists them all. That is Kenya\'s shape, not a sourcing error, but it does mean cluster counts cannot be read as demand.',
    source: 'kmtc.ac.ke national fee structure 2025/26; TVET CDACC health curricula'
  },
  {
    id: 'education',
    name: 'Education and teacher training',
    awardingBodies: ['KNEC', 'TSC (registration)'],
    feeRegimes: ['ttc_consolidated', 'public_university'],
    match: /teacher education|education|teaching/i,
    expect: 5,
    gap: 'Only primary teacher education is covered. Diploma in Secondary Teacher Education and ECDE are not yet sourced. Note the labour market: roughly 369,000 registered teachers are unemployed, so more supply here would not be a service.',
    source: 'TSC registration rules; KUCCPS TTC placement; see TEACHER_LABOUR_MARKET'
  },
  {
    id: 'hospitality',
    name: 'Hospitality and tourism',
    awardingBodies: ['Kenya Utalii College', 'TVET CDACC', 'Tourism Regulatory Authority'],
    feeRegimes: ['tourism_corporation', 'tvet_consolidated', 'private_own_rate'],
    match: /hospitality|hotel|culinary|food and beverage|food production|front office|housekeep|tour|travel|seafaring/i,
    expect: 20,
    gap: 'Coverage outside the two Utalii campuses is thin, and Utalii\'s own published fees conflict across sources so every record here is illustrative rather than verified.',
    source: 'KUCCPS Utalii placement March 2026 and September 2026 Ronald Ngala intake'
  },
  {
    id: 'built',
    name: 'Built environment and construction',
    awardingBodies: ['National Construction Authority', 'Engineers Board of Kenya', 'TVET CDACC', 'NITA'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /building|construction|masonry|plumb|carpent|architect|quantity survey|civil/i,
    expect: 15,
    gap: 'Quantity surveying and land surveying are barely present, and both are numerate routes that would help the thinnest cluster.',
    source: 'NCA contractor and worker accreditation; TVET CDACC construction curricula'
  },
  {
    id: 'engineering',
    name: 'Engineering, manufacturing and trades',
    awardingBodies: ['Engineers Board of Kenya', 'TVET CDACC', 'NITA'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /engineering|mechanic|electric|automotive|weld|fitter|machinist|fabricat|refrigerat|metal|processing technology|plant technician/i,
    expect: 25,
    gap: '',
    source: 'TVET CDACC engineering curricula; NITA trade tests'
  },
  {
    id: 'ict',
    name: 'ICT and digital',
    awardingBodies: ['TVET CDACC', 'KNEC', 'ICT Authority'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /information communication|information technology|computer|software|cyber|data sci|data analy|ict|networking|digital|instrumentation|control technician/i,
    expect: 20,
    gap: 'No route covers the online and platform work that is actually absorbing young Kenyans — remote support, BPO, digital freelancing — because none of it has a formal awarded qualification to point at.',
    source: 'TVET CDACC ICT Technician Level 6 and Computer Science Level 6 curricula'
  },
  {
    id: 'finance',
    name: 'Business, finance and accountancy',
    awardingBodies: ['KASNEB', 'TVET CDACC'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /account|financ|bank|tax|credit|econom|statistic|actuarial|audit|commerce|business management|business studies|sales|marketing|entrepreneur|customs/i,
    expect: 20,
    gap: 'Actuarial and statistics remain degree-only, so a learner without a C+ has no numerate route above certificate level except accountancy.',
    source: 'TVET CDACC Level 5 and 6 business curricula; KASNEB CPA ladder'
  },
  {
    id: 'supplychain',
    name: 'Procurement, supply chain and logistics',
    awardingBodies: ['TVET CDACC', 'KISM'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /supply chain|procure|logistic|store keep|stores|transport|clearing|forward/i,
    expect: 10,
    gap: 'Clearing and forwarding, a real coastal employer, is not covered at all.',
    source: 'TVET CDACC Supply Chain Management Levels 5 and 6; Store Keeping Level 5'
  },
  {
    id: 'admin',
    name: 'Administration, HR and public service',
    awardingBodies: ['TVET CDACC', 'IHRM'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /human resource|office administration|public administration|secretar|records|project management|governance|events management|security|emotional intelligence|leadership|communication/i,
    expect: 12,
    gap: '',
    source: 'TVET CDACC Human Resource Management Levels 5 and 6; Office Administration Levels 5 and 6'
  },
  {
    id: 'agriculture',
    name: 'Agriculture and agribusiness',
    awardingBodies: ['TVET CDACC', 'public universities'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /agri|farm|horticultur|animal|veterinar|food techn|fisher/i,
    expect: 5,
    gap: 'Badly under-sourced for a country where agriculture is the largest employer. Horticulture, dairy and agri-mechanisation all missing.',
    source: 'TVET CDACC agriculture curricula'
  },
  {
    id: 'creative',
    name: 'Creative, media and design',
    awardingBodies: ['KIMC', 'TVET CDACC', 'Media Council of Kenya'],
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    match: /journalis|media|film|television|music|graphic|design|fashion|photograph|animation|art/i,
    expect: 15,
    gap: '',
    source: 'KIMC programmes; TVET CDACC creative curricula'
  },
  {
    id: 'aviation',
    name: 'Aviation',
    awardingBodies: ['Kenya Civil Aviation Authority (KCAA)', 'IATA'],
    feeRegimes: ['parastatal_own_rate', 'private_own_rate'],
    match: /aviation|aeronautic|aircraft|avionic|cabin crew|flight/i,
    expect: 6,
    gap: 'Pilot training is absent: it is licensed separately by KCAA, costs several million shillings, and would be dishonest to list beside a Ksh 67,189 certificate without that context.',
    source: 'KCAA-approved training organisations; EASA and Kenya Aeronautical College published 2026 fees'
  },
  {
    id: 'energy',
    name: 'Energy, oil, gas and geothermal',
    awardingBodies: ['TVET CDACC', 'Kenya Pipeline Company (MIOG)', 'KenGen GTC', 'NEBOSH'],
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated', 'public_university'],
    match: /oil and gas|pipeline|geothermal|steamfield|drilling|solar|energy|electrical power/i,
    expect: 8,
    gap: 'Neither MIOG nor the KenGen centre publishes a fee schedule, so every record here carries a null fee. Much of their provision is short-course and industry-sponsored rather than open entry.',
    source: 'Kenya Pipeline Company MIOG; KenGen Geothermal Training Centre, Olkaria'
  },
  {
    id: 'maritime',
    name: 'Maritime and the blue economy',
    awardingBodies: ['Kenya Maritime Authority', 'Kenya Ports Authority (Bandari)', 'STCW'],
    feeRegimes: ['parastatal_own_rate', 'tourism_corporation'],
    match: /maritime|marine|seafar|port operations|shipping|deck/i,
    expect: 5,
    gap: 'Statutory STCW certification, medicals and endorsements sit outside the tuition figure and are not costed here.',
    source: 'Bandari Maritime Academy, Kenya Ports Authority'
  },
  {
    id: 'water',
    name: 'Water and sanitation',
    awardingBodies: ['Kenya Water Institute (KEWI Act 2001)', 'TVET CDACC'],
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated'],
    match: /water|sanitation|irrigation/i,
    expect: 4,
    gap: 'KEWI publishes no verifiable tuition schedule, so all fees here are null. Its Kitui and Tharaka Nithi campuses are not yet listed.',
    source: 'Kenya Water Institute, established by the KEWI Act 2001'
  },
  {
    id: 'transport',
    name: 'Rail, roads and transport infrastructure',
    awardingBodies: ['Railway Training Institute', 'KIHBT (State Department for Roads)', 'TVET CDACC'],
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated'],
    match: /railway|highway|road construction|transport|plant operation/i,
    expect: 5,
    gap: 'Fee figures circulating for the Railway Training Institute are short-course rates and must not be read as diploma fees; its diploma schedule is unpublished, so those records carry null.',
    source: 'Railway Training Institute; Kenya Institute of Highways and Building Technology'
  },
  {
    id: 'legal',
    name: 'Law and governance',
    awardingBodies: ['Council of Legal Education', 'Kenya School of Law', 'TVET CDACC'],
    feeRegimes: ['public_university', 'private_own_rate'],
    match: /law|legal|paralegal|theolog|governance|leadership/i,
    expect: 2,
    gap: 'Only the LLB is present. The paralegal and legal-clerk routes below degree level are unsourced, and the Advocates Training Programme at the Kenya School of Law — the mandatory step after an LLB — is not represented at all.',
    source: 'Council of Legal Education; CUE-chartered law faculties'
  },
  {
    id: 'personal',
    name: 'Beauty, personal care and services',
    awardingBodies: ['TVET CDACC', 'NITA'],
    feeRegimes: ['tvet_consolidated', 'private_own_rate'],
    match: /beauty|hairdress|cosmetolog|barber|tailor|garment|dressmak|leather/i,
    expect: 8,
    gap: '',
    source: 'TVET CDACC beauty and textile curricula; NITA trade tests'
  }
];

module.exports = { SECTORS, FEE_REGIMES, DERIVATION_SIGNATURES };
