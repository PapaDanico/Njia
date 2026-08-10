/* Njia — labour market evidence layer
 *
 * WHY THIS FILE EXISTS
 *
 * The course catalogue used to carry a per-course `employment_rate` and
 * `median_salary_kes` that were invented. They looked like measurement, they
 * sorted the results list, and they decided the comparison table's winner.
 * They are now labelled as estimates everywhere (see data/courses.js).
 *
 * This file is the honest replacement: figures that actually exist, at the
 * level they actually exist at — the sector, not the course — each carrying
 * its own source and its own caveat.
 *
 * THE CAVEAT THAT MATTERS MOST
 *
 * Every earnings figure below is an average across *formal wage employment*
 * in that sector. It includes principals, consultants and senior engineers.
 * It is not a starting salary, and for most Njia users it is not the number
 * they will first earn. Kenya's informal sector absorbs far more workers than
 * the formal one, and a school-leaver with a certificate typically enters well
 * below these averages.
 *
 * Presenting a sector average to a seventeen-year-old as "what this career
 * pays" would repeat the exact failure this file was written to correct, in
 * more respectable clothing. Every surface that renders these figures must
 * carry `entryReality` alongside the average. That is enforced, not advisory:
 * see tests/provenance.test.js.
 *
 * SOURCING AND ITS LIMITS
 *
 * These figures come from the KNBS Economic Survey 2026 (reporting on 2025) as
 * reported by Kenyan financial and news outlets. This session's network policy
 * blocks knbs.or.ke directly, so figures were cross-checked across independent
 * outlets rather than read from the primary PDF. That is recorded per record as
 * `provenance: 'cross-reported'` rather than 'primary'. Anyone with access to
 * the primary release should verify and upgrade the tier — do not silently
 * promote a figure to 'primary' without having read the source document.
 */

/* Average annual earnings per employee in formal wage employment, 2025.
 * Source: KNBS Economic Survey 2026, via cross-reported coverage (Aug 2026). */
const SECTOR_EARNINGS = [
  {
    id: 'electricity',
    sector: 'Electricity, gas, steam and air conditioning supply',
    annualKes: 2619109,
    clusters: ['tech'],
    entryReality: 'Technician and artisan entry roles start far below this. The average is lifted by engineers and utility management in a small, highly qualified workforce.'
  },
  {
    id: 'transport',
    sector: 'Transportation and storage',
    annualKes: 1751913,
    clusters: ['business'],
    entryReality: 'Logistics clerks and drivers sit well under the average, which includes aviation, rail and senior freight management.'
  },
  {
    id: 'health',
    sector: 'Human health and social work activities',
    annualKes: 1394400,
    clusters: ['carer'],
    entryReality: 'A newly qualified KRCHN nurse earns a fraction of this. The average includes doctors, consultants and specialists after years of practice.'
  },
  {
    id: 'ict',
    sector: 'Information and communication',
    annualKes: 1438060,
    clusters: ['tech', 'numbers', 'creator'],
    entryReality: 'Junior developer and BPO entry pay is a long way below the average, which is pulled up by telecoms and senior engineering. This sector does, however, have unusually short ladders for people who keep building.'
  },
  {
    id: 'education',
    sector: 'Education',
    annualKes: 1135320,
    clusters: ['carer', 'people'],
    entryReality: 'A newly posted teacher earns well under this. The average spans the whole service, including long-tenured senior staff. Education is nonetheless Kenya\'s single largest formal wage employer.'
  },
  {
    id: 'agriculture',
    sector: 'Agriculture, forestry and fishing',
    annualKes: 434640,
    clusters: ['business'],
    entryReality: 'The lowest formal-sector average in the economy, and much agricultural work is informal and seasonal on top of that. Agri-technology and value-addition roles pay materially better than field labour.'
  }
];

/* Whole-economy anchors, 2025. Same source and same provenance caveat. */
const LABOUR_MARKET_ANCHORS = {
  averageAnnualEarningsKes: 988200,
  privateSectorAnnualKes: 1000000,
  publicSectorAnnualKes: 874300,
  wageEmploymentTotal: 3300000,
  largestWageEmployers: [
    { sector: 'Education', jobs: 731300 },
    { sector: 'Manufacturing', jobs: 388564 },
    { sector: 'Public administration', jobs: 375100 }
  ],
  source: 'KNBS Economic Survey 2026 (reporting 2025), cross-reported coverage, August 2026'
};

/* Youth unemployment: reported between 11.9% and 67% depending on definition.
 *
 * This spread is not noise and it is not a reason to pick the most alarming
 * number. Different figures measure different things — age band, and whether
 * "unemployed" means the strict ILO test (actively seeking work in a reference
 * period) or the far broader "not in adequate employment". Njia shows the
 * range and names the definitions, because a young person deciding their
 * future deserves to know the honest answer is "it depends what you count",
 * not a scary headline chosen for effect.
 */
const YOUTH_EMPLOYMENT_MEASURES = [
  {
    label: 'Youth unemployment, ages 15–24 (strict ILO definition)',
    value: '15.3%',
    means: 'Out of work, available for work, and actively looking during the survey period.',
    source: 'Modelled ILO/Statista series for 2025'
  },
  {
    label: 'Youth aged 20–29 (fresh-graduate band)',
    value: '~32%',
    means: 'The age band most Njia users enter after college — notably worse than the headline rate.',
    source: 'Kenyan labour force analysis, 2020 data'
  },
  {
    label: 'Youth aged 15–34 lacking adequate employment',
    value: 'up to ~67%',
    means: 'The broadest measure: includes underemployment and informal work below skill level. Not the same thing as unemployment.',
    source: 'Broad-measure reporting of KNBS labour force data'
  }
];

/* Future-of-work evidence. Global findings, flagged as global — Kenya-specific
 * skill demand is captured separately in KENYA_DEMAND_SIGNALS below, because
 * applying a global projection to Nairobi without saying so is how these
 * reports get misused. */
const FUTURE_OF_WORK = {
  source: 'World Economic Forum, Future of Jobs Report 2025',
  scope: 'global',
  headline: '170 million new roles created and 92 million displaced by 2030 — a net gain of 78 million.',
  skillChurn: '39% of existing skill sets are expected to be transformed or outdated between 2025 and 2030.',
  fastestGrowingSkills: [
    'AI and big data',
    'Networks and cybersecurity',
    'Technological literacy',
    'Creative thinking',
    'Resilience, flexibility and agility',
    'Curiosity and lifelong learning'
  ],
  interpretation: 'The two fastest-growing skill families are cognitive (analytical thinking, critical assessment) and socio-emotional (resilience, flexibility, leadership) — not any single tool. This is the evidence base for Njia treating adaptability as a career asset rather than a soft extra.'
};

/* Kenya-specific demand signals, kept separate from the global projection. */
const KENYA_DEMAND_SIGNALS = [
  {
    signal: 'ICT roles account for roughly 13–15% of formal job postings',
    note: 'The information and communication sector grew over 6% in 2024, outpacing the wider economy.',
    clusters: ['tech', 'numbers']
  },
  {
    signal: 'BPO and IT-enabled services employ more than 60,000 people directly',
    note: 'One of the few sectors offering formal entry roles to candidates without a degree; Kenya has a national BPO policy pushing further growth.',
    clusters: ['business', 'tech']
  },
  {
    signal: 'Banking and financial services report the strongest hiring intentions',
    note: 'Alongside agriculture and ICT, per Central Bank of Kenya survey coverage, 2026.',
    clusters: ['numbers', 'business']
  },
  {
    signal: 'Education is Kenya\'s single largest formal wage employer, at roughly 731,300 jobs',
    note: 'Ahead of manufacturing (~388,600) and public administration (~375,100). Teaching remains the largest structured entry route into formal employment in the country.',
    clusters: ['carer', 'people']
  },
  {
    signal: 'Human health and social work is among the better-paying sectors in the economy',
    note: 'It sits well above the national average earnings figure, and demand is structural rather than cyclical — but entry requires the qualification ladder, not just interest.',
    clusters: ['carer']
  },
  {
    signal: 'Creative and media roles ride the same ICT expansion',
    note: 'The information and communication sector grew over 6% in 2024; digital content, design and production work increasingly sits inside it rather than in traditional media houses.',
    clusters: ['creator']
  },
  {
    signal: 'Renewable energy is a standout skills gap',
    note: 'Kenya is the largest off-grid solar market in the world, accounting for roughly 74% of East African solar home system sales.',
    clusters: ['tech']
  }
];

/* The structural finding Njia is built around: the binding constraint on
 * Kenyan youth employment is not effort, it is the gap between what is taught
 * and what is demanded. Named plainly so the platform's premise is auditable
 * rather than assumed. */
const SKILLS_MISMATCH = {
  finding: 'Kenya\'s graduate employment problem is substantially structural, not motivational: higher education remains theory-weighted while employers seek practical experience, digital literacy and communication.',
  implication: 'Choosing a field is only half the decision. Evidence of applied skill — a portfolio, an attachment, a demonstrable project — is what closes the gap, which is why Njia treats prototyping as a module rather than advice.',
  sources: ['British Council, Higher Education Graduate Employability (Kenya)', 'Kenyan university employability research, cross-reported 2023–2026']
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SECTOR_EARNINGS, LABOUR_MARKET_ANCHORS, YOUTH_EMPLOYMENT_MEASURES, FUTURE_OF_WORK, KENYA_DEMAND_SIGNALS, SKILLS_MISMATCH };
}
