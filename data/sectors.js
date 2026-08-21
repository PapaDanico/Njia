/* Njia — data/sectors.js — the industry view of the catalogue.
 *
 * WHY THIS IS SHIPPED, WHEN THE REGISTER IT GREW FROM IS NOT.
 *
 * tests/sector-register.js exists to check the catalogue against itself: which
 * industries Njia covers, who awards each qualification, which fee regime each
 * institution is on. That is a QA artefact and its header says so — it stays in
 * tests/ and no user sees it.
 *
 * This file is the part a reader needs, and it is a different job. A learner
 * choosing between a course in health and a course in mining is choosing
 * between two positions in an economy, and until now Njia had nothing at all to
 * say about that. It could tell you a course costs Ksh 67,189 and needs a C-.
 * It could not tell you that the sector it leads into grew 14.9% last year
 * while the one everybody recommends grew 3.1%.
 *
 * WHAT IS DELIBERATELY ABSENT.
 *
 * A figure is here only if it was sourced. KNBS publishes national-accounts
 * growth for its own activity classifications, which do not map one-to-one onto
 * training sectors, and several of the series Njia would want were not
 * obtained. Those carry `mapping: 'unsourced'` and render as an explicit "not
 * sourced" rather than an estimate, a proxy or a plausible-looking blank.
 *
 * `mapping` is the honesty field:
 *   exact       The KNBS series and this training sector describe the same
 *               activity. The growth figure is that sector's.
 *   component   This training sector is one part of a broader published series.
 *               The figure is the parent's and is labelled as such — aviation
 *               is inside transportation and storage, not equal to it.
 *   unsourced   KNBS publishes a relevant series; Njia has not sourced its 2025
 *               figure. Nothing is shown.
 *
 * WHAT GROWTH DOES NOT MEAN. A sector growing fast is not a job offer, and
 * Njia must never let it read as one. Mining grew 14.9% off a 7.8% contraction
 * the year before — a rebound, on a small base, and most of the work is
 * informal quarrying. Every record below carries `caution` for exactly this
 * reason, and the UI is required to render it beside the figure, not behind a
 * disclosure.
 */

/* KNBS Economic Survey 2026, reporting calendar year 2025. The whole-economy
 * baseline: a sector figure is only meaningful against it. */
const ECONOMY = {
  year: 2025,
  gdpGrowth: 4.6,
  prevGdpGrowth: 4.7,
  /* Shares of GDP by broad grouping. These three are the only shares sourced;
   * per-sector shares are not published in the summary Njia could reach. */
  broadShares: [
    { id: 'services', label: 'Services', share: 55.0 },
    { id: 'agriculture', label: 'Agriculture', share: 23.2 },
    { id: 'industry', label: 'Industry', share: 16.3 }
  ],
  /* THE FIGURE THAT REFRAMES EVERY OTHER ONE ON THIS PAGE. Two headlines
   * circulated from the same survey — "822,100 new jobs" and "717,000 new
   * jobs" — and they are the same number. 87.2% of 822,100 is 716,871. One
   * outlet reported the total, the other the informal share. Njia states both
   * and reconciles them, because a learner told only the first will plan for a
   * formal job that, on these figures, roughly one new post in eight is. */
  newJobs: 822100,
  informalSharePct: 87.2,
  /* Deliberately NOT stored. The formal remainder is 822,100 less 87.2% of
   * itself, and writing the answer down as a fixed figure means storing a
   * number that has to be kept in step with two others by hand — the first
   * version of this file said 105,200 where the arithmetic gives 105,229.
   * It is derived at render time and rounded to the nearest hundred, because
   * 87.2% is itself a rounded share and a figure like 105,229 claims a
   * precision the input does not have. */
  wageEmployment: 3320000,
  prevWageEmployment: 3210000,
  wagePrivate: 2250000,
  wagePublic: 1070000,
  totalEmployment: 21600000,
  prevTotalEmployment: 20800000,
  /* Largest formal employers by headcount, of the sectors reported. Not a
   * ranking of all sectors — only those Njia sourced. */
  largestFormalEmployers: [
    { label: 'Manufacturing', workers: 366600 },
    { label: 'Education', workers: 251100 }
  ],
  source: 'KNBS Economic Survey 2026 (figures for calendar year 2025), cross-reported August 2026.'
};

/* The formal remainder of the year's new jobs, to the nearest hundred. */
function formalNewJobs() {
  return Math.round((ECONOMY.newJobs * (1 - ECONOMY.informalSharePct / 100)) / 100) * 100;
}

/* A sector below this many catalogue records does not get a share quoted.
 *
 * Borrowed from a sister tool's auction analytics, which refuses to publish a
 * median from fewer than a handful of prints on the grounds that a median of
 * two numbers is an anecdote. The same applies here and Njia was not doing it:
 * mining has one record, and "0.3% of the catalogue" invites a reader to
 * conclude something about mining rather than about our sourcing. Below the
 * floor the UI states the raw count and says coverage is thin, full stop. */
const MIN_SECTOR_SAMPLE = 8;

/* Sectors are the industry view, not the interest-cluster view. Clusters
 * (carer, creator, numbers...) describe a learner; these describe an economy.
 *
 * `match` is the single source of truth for which courses belong to a sector
 * and is shared with tests/sector-register.js, which loads this file rather
 * than keeping a second copy. Order matters: the first match wins, so the
 * narrow sectors are listed before the broad ones they would otherwise be
 * swallowed by (maritime before transport, aviation before engineering).
 */
const SECTORS = [
  {
    id: 'aviation',
    name: 'Aviation',
    broad: 'services',
    /* `air cargo`, `ground handling` and `passenger service` were added after
     * three catalogue records turned out to belong to no sector at all — two of
     * them the ground-handling courses this register was extended to cover in
     * the first place. The old pattern had `passenger handling`, and the
     * catalogue says "Passenger Service and Ground Handling". */
    match: /aviation|aeronautic|aircraft|avionic|cabin crew|flight|air traffic|airport operations|passenger (?:handling|service)|air cargo|ground handling|navaids|surveillance engineering|dispatch/i,
    awardingBodies: ['Kenya Civil Aviation Authority', 'IATA'],
    knbs: { series: 'Transportation and storage', mapping: 'component', growth: 3.7 },
    caution: 'Aviation is a small part of a broad transport series, so the 3.7% is the parent\'s and not aviation\'s own. Licensing sits with KCAA and is separate from the college award — budget for the licence as well as the course.'
  },
  {
    id: 'maritime',
    name: 'Maritime and the blue economy',
    broad: 'services',
    match: /maritime|marine|seafar|port operations|shipping|deck/i,
    awardingBodies: ['Kenya Maritime Authority', 'Kenya Ports Authority', 'STCW'],
    knbs: { series: 'Transportation and storage', mapping: 'component', growth: 3.7 },
    caution: 'Statutory STCW certification, medicals and endorsements sit outside the tuition figure and are not costed in this catalogue.'
  },
  {
    id: 'mining',
    name: 'Mining, quarrying and extractives',
    broad: 'industry',
    match: /mining|quarry|geolog|earth science|extract|drilling|petroleum/i,
    awardingBodies: ['TVET CDACC', 'State Department for Mining'],
    knbs: { series: 'Mining and quarrying', mapping: 'exact', growth: 14.9, prev: -7.8 },
    caution: 'The fastest-growing sector in the survey — and a rebound from a 7.8% contraction the year before, on a small base, driven largely by minerals for cement. Most quarrying work is informal and unwaged. Read this as movement, not as vacancies.'
  },
  {
    id: 'hospitality',
    name: 'Hospitality and tourism',
    broad: 'services',
    match: /hospitality|hotel|culinary|food and beverage|food production|front office|housekeep|tour|travel/i,
    awardingBodies: ['Kenya Utalii College', 'TVET CDACC', 'Tourism Regulatory Authority'],
    knbs: { series: 'Accommodation and food service activities', mapping: 'exact', growth: 15.6 },
    caution: 'The strongest growth of any sector reported, but hospitality is seasonal and heavily casualised, and a good year for arrivals is not the same as a permanent contract.'
  },
  {
    id: 'built',
    name: 'Built environment and construction',
    broad: 'industry',
    match: /building|construction|masonry|plumb|carpent|architect|quantity survey|civil|concrete|painting and decoration/i,
    awardingBodies: ['National Construction Authority', 'Engineers Board of Kenya', 'TVET CDACC', 'NITA'],
    knbs: { series: 'Construction', mapping: 'exact', growth: 6.8, prev: -0.7 },
    caution: 'A rebound from a contraction, not a run of growth. Certified trades earn day rates rather than salaries, so the money is real but the month is not guaranteed.'
  },
  {
    id: 'admin',
    name: 'Administration, HR and public service',
    broad: 'services',
    match: /human resource|office administration|public administration|international relations|diplomacy|secretar|records|librar|information science|archiv|project management|governance|events management|security|emotional intelligence|leadership|disaster management|disaster risk|resilience|political science|criminolog|penolog|security studies|librar|information science|archiv|cctv|alarm/i,
    awardingBodies: ['TVET CDACC', 'IHRM'],
    knbs: { series: 'Public administration and defence', mapping: 'component', growth: 8.3 },
    caution: 'Growth in public administration is measured as government activity, and hiring into it is capped by the wage bill rather than by demand. Most administrative work is in the private sector, which this series does not cover.'
  },
  {
    id: 'finance',
    name: 'Business, finance and accountancy',
    broad: 'services',
    /* `insur` added after the College of Insurance records were claimed by no
     * sector at all — the pattern had `financ` and `actuarial` but nothing that
     * matched the word insurance itself, so two records went invisible to both
     * the register and the landing table. */
    match: /account|financ|insur|bank|tax|credit|econom|statistic|actuarial|audit|commerce|business management|business administration|business studies|sales|marketing|entrepreneur|customs|co-?operative|sacco|microfinance/i,
    awardingBodies: ['KASNEB', 'TVET CDACC'],
    knbs: { series: 'Financial and insurance activities', mapping: 'exact', growth: 6.5 },
    caution: 'The sector grows faster than the economy, but entry is gated by professional papers — the KASNEB ladder runs years past the college award and costs money at each stage.'
  },
  {
    id: 'ict',
    name: 'ICT and digital',
    broad: 'services',
    /* `comput`, not `computer`: the catalogue holds a "Mathematics and
     * Computing" degree that matched nothing. */
    match: /information\s+(?:and\s+)?communication|information technology|comput|software|cyber|data sci|data analy|ict|telecom|information systems|networking|digital|instrumentation|control technician/i,
    awardingBodies: ['TVET CDACC', 'KNEC', 'ICT Authority'],
    knbs: { series: 'Information and communication', mapping: 'exact', growth: 4.8 },
    caution: 'Close to the whole-economy rate, despite being the sector most often described as booming. The online and platform work actually absorbing young Kenyans sits largely outside this measure — and outside any formal qualification Njia can point at.'
  },
  {
    id: 'supplychain',
    name: 'Procurement, supply chain and logistics',
    broad: 'services',
    match: /supply chain|procure|logistic|storekeep|store keep|stores|purchasing|supplies|clearing|forward/i,
    awardingBodies: ['TVET CDACC', 'KISM'],
    knbs: { series: 'Transportation and storage', mapping: 'component', growth: 3.7 },
    caution: 'Procurement is a component of a broad transport and storage series rather than a series of its own, so this figure describes the neighbourhood, not the job.'
  },
  {
    id: 'transport',
    name: 'Rail, roads and transport infrastructure',
    broad: 'services',
    match: /railway|highway|road construction|transport|plant operation/i,
    awardingBodies: ['Railway Training Institute', 'KIHBT', 'TVET CDACC'],
    knbs: { series: 'Transportation and storage', mapping: 'exact', growth: 3.7 },
    caution: 'Below the whole-economy rate. Much of the training here is run by state corporations for their own intake rather than open entry.'
  },
  {
    id: 'agriculture',
    name: 'Agriculture and agribusiness',
    broad: 'agriculture',
    match: /agri|farm|horticultur|environmental science|environmental management|conservation|wildlife|animal|veterinar|food techn|food science|crop protection|fisher|livestock|range management|pastoral/i,
    awardingBodies: ['TVET CDACC', 'public universities'],
    knbs: { series: 'Agriculture, forestry and fishing', mapping: 'exact', growth: 3.1, share: 23.2 },
    caution: 'Nearly a quarter of the entire economy and the largest single employer in the country, growing slower than the economy as a whole. Most of that work is on smallholdings and is not waged employment — which is the argument for agribusiness and processing rather than against agriculture.'
  },
  {
    id: 'engineering',
    name: 'Engineering, manufacturing and trades',
    broad: 'industry',
    match: /engineering|\bengine\b|mechanic|electric|automotive|weld|fitter|machinist|fabricat|refrigerat|metal|processing technology|plant technician/i,
    awardingBodies: ['Engineers Board of Kenya', 'TVET CDACC', 'NITA'],
    knbs: { series: 'Manufacturing', mapping: 'unsourced' },
    caution: 'Manufacturing is the largest formal employer in the country at 366,600 workers, and its share of the economy has been drifting down for over a decade. Njia did not source its 2025 growth figure, so none is shown.'
  },
  {
    id: 'health',
    name: 'Health and care',
    broad: 'services',
    match: /nursing|clinical|health|medical|nutrition|pharm|laborator|biolog|biochem|hiv|counsell|psycholog|sports science|social work|community develop/i,
    awardingBodies: ['KMTC', 'Nursing Council of Kenya', 'Clinical Officers Council', 'TVET CDACC'],
    knbs: { series: 'Human health and social work activities', mapping: 'unsourced' },
    caution: 'Njia lists more health courses than any other sector, because KMTC runs some forty campuses and every one is catalogued. That is the shape of Kenya\'s public training estate, not a measure of demand, and it must not be read as one.'
  },
  {
    id: 'education',
    name: 'Education and teacher training',
    broad: 'services',
    match: /teacher education|education|teaching/i,
    awardingBodies: ['KNEC', 'TSC (registration)'],
    knbs: { series: 'Education', mapping: 'unsourced' },
    caution: 'Education employs 251,100 people formally, second only to manufacturing — and roughly 369,000 trained teachers are already TSC-registered and waiting for a post. The bottleneck is funded posts, not qualified people.'
  },
  {
    id: 'creative',
    name: 'Creative, media and design',
    broad: 'services',
    match: /journalis|media|film|television|music|graphic|design|fashion|photograph|animation|fine art|visual art|performing art|creative art|art and design|mass communication|public communication|corporate communication|public relations/i,
    awardingBodies: ['KIMC', 'TVET CDACC', 'Media Council of Kenya'],
    knbs: { series: 'Information and communication', mapping: 'component', growth: 4.8 },
    caution: 'Broadcast and film sit inside the information and communication series; design, fashion and craft do not, and are spread across manufacturing and other services. No single published figure covers this sector.'
  },
  {
    id: 'energy',
    name: 'Energy, oil, gas and geothermal',
    broad: 'industry',
    match: /oil and gas|pipeline|geothermal|steamfield|solar|energy|electrical power/i,
    awardingBodies: ['TVET CDACC', 'Kenya Pipeline (MIOG)', 'KenGen GTC', 'NEBOSH'],
    knbs: { series: 'Electricity and water supply', mapping: 'unsourced' },
    caution: 'Training here is largely run by state corporations, much of it short-course and industry-sponsored rather than open entry, and neither MIOG nor the KenGen centre publishes a fee schedule.'
  },
  {
    id: 'water',
    name: 'Water and sanitation',
    broad: 'industry',
    match: /water|sanitation|irrigation/i,
    awardingBodies: ['Kenya Water Institute', 'TVET CDACC'],
    knbs: { series: 'Water supply, sewerage and waste management', mapping: 'unsourced' },
    caution: 'KEWI publishes no verifiable tuition schedule, so every fee in this sector is unconfirmed.'
  },
  {
    id: 'legal',
    name: 'Law and governance',
    broad: 'services',
    match: /law|legal|paralegal|theolog/i,
    awardingBodies: ['Council of Legal Education', 'Kenya School of Law'],
    knbs: { series: 'Professional, scientific and technical activities', mapping: 'unsourced' },
    caution: 'Only the degree route is catalogued, and the Advocates Training Programme that follows it is a further mandatory year with its own fee. There is no sourced route into legal work below degree level.'
  },
  {
    id: 'personal',
    name: 'Beauty, personal care and services',
    broad: 'services',
    match: /beauty|hairdress|cosmetolog|barber|tailor|garment|clothing|dressmak|leather/i,
    awardingBodies: ['TVET CDACC', 'NITA'],
    knbs: { series: 'Other service activities', mapping: 'unsourced' },
    caution: 'Almost all of this work is self-employment or informal, which national wage statistics do not capture at all. The absence of a figure here is a fact about the statistics, not about the earnings.'
  }
];

/* Which sector a course belongs to. First match wins — see the ordering note on
 * SECTORS. Returns null rather than a catch-all "other": a course no sector
 * claims is a gap in the register, and a test says so. */
function sectorForCourse(course) {
  if (!course) return null;
  const hay = `${course.name || ''} ${course.field || ''}`;
  return SECTORS.find((s) => s.match.test(hay)) || null;
}

/* Sector growth read against the whole economy, which is the only reading that
 * means anything. Returns null where nothing was sourced. */
function sectorPace(sector) {
  const g = sector && sector.knbs && typeof sector.knbs.growth === 'number' ? sector.knbs.growth : null;
  if (g === null) return null;
  const diff = g - ECONOMY.gdpGrowth;
  return {
    growth: g,
    diff,
    level: diff >= 3 ? 'well-ahead' : diff >= 0.5 ? 'ahead' : diff > -0.5 ? 'in-line' : 'behind',
    label: diff >= 3 ? 'Growing well ahead of the economy'
      : diff >= 0.5 ? 'Growing ahead of the economy'
        : diff > -0.5 ? 'Growing in line with the economy'
          : 'Growing more slowly than the economy'
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ECONOMY, SECTORS, MIN_SECTOR_SAMPLE, sectorForCourse, sectorPace, formalNewJobs };
}
