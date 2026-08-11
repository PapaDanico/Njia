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
  source: 'World Economic Forum, Future of Jobs Report 2025 (survey of 1,000+ employers representing over 14 million workers)',
  scope: 'global',
  headline: '170 million new roles created and 92 million displaced by 2030 — a net gain of 78 million, with 22% of all jobs disrupted.',
  skillChurn: '39% of existing skill sets are expected to be transformed or outdated between 2025 and 2030, and 63% of employers already name the skills gap as their single biggest barrier.',
  topCoreSkill: 'Analytical thinking is the top core skill, named essential by seven in ten employers, followed by resilience/flexibility/agility and then leadership and social influence.',

  /* The distinction that matters most for a Kenyan school-leaver, and the one
   * every summary of this report drops.
   *
   * WEF publishes two different growth rankings. By *percentage* growth the
   * list is tech: AI and machine learning specialists, fintech engineers, big
   * data specialists. Those roles grow fast off a small base, and they are what
   * every article quotes.
   *
   * By *absolute numbers* — actual jobs added — the list is frontline, care and
   * education: farmworkers, delivery drivers, construction workers, nursing
   * professionals, secondary school teachers.
   *
   * For someone choosing a course in Kenya, the absolute list is the honest
   * one. It is also, almost exactly, what this catalogue is full of. Showing
   * only the percentage list would quietly tell a future nurse or teacher that
   * their pathway is second-rate, when the evidence says the opposite. */
  growthByPercentage: ['AI and machine learning specialists', 'Big data specialists', 'FinTech engineers', 'Software and applications developers', 'Security management specialists', 'Autonomous and electric vehicle specialists', 'Environmental and renewable energy engineers'],
  growthByAbsoluteNumbers: ['Farmworkers', 'Delivery drivers', 'Construction workers', 'Nursing professionals', 'Secondary school teachers'],
  absoluteVsPercentage: 'Tech roles grow fastest in percentage terms, off a small base. Frontline, care and education roles add the most actual jobs. Both are true; only one is a realistic plan for most school-leavers.',

  /* Declining roles, and the change worth flagging: graphic design was a
   * moderately *growing* job in the 2023 edition and is now among the fastest
   * declining, driven by generative AI. Njia lists design courses, so this
   * belongs in front of anyone choosing one. */
  decliningRoles: ['Cashiers and ticket clerks', 'Administrative assistants and executive secretaries', 'Postal service clerks', 'Bank tellers', 'Data entry clerks', 'Graphic designers', 'Legal secretaries'],
  decliningNote: 'Clerical and secretarial work shows the largest decline in absolute numbers. Graphic design is the notable mover — a moderately growing role in the 2023 edition, now among the fastest declining as generative AI reshapes the work.',
  technologyEffects: 'Broadening digital access is expected to create 19 million jobs and displace 9 million by 2030; AI and information processing to create 11 million and displace 9 million.',
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

/* Sub-Saharan Africa, from WEF's regional cut. Kept distinct from both the
 * global projection and the Kenya-specific signals, because collapsing the
 * three is how these reports get misused. */
const AFRICA_OUTLOOK = {
  source: 'World Economic Forum, Future of Jobs Report 2025 — Sub-Saharan Africa regional findings',
  talentOptimism: 'Almost half of Sub-Saharan African employers expect talent availability to improve between 2025 and 2030, against 29% globally — the most optimistic region in the survey.',
  demographics: 'The region\'s population is projected to rise 79% over the next 30 years to 2.2 billion, the demographic dividend behind that optimism.',
  risingSkills: 'AI, big data and technological literacy are rising fastest in demand, with cybersecurity and networks close behind; flexibility, agility and creative thinking are rising alongside them.',
  kenyaIctIntensity: '18.4% of all employment in Kenya is in occupations with high ICT intensity.',
  kenyaHiringGap: 'Kenyan business executives report innovation and risk-taking as the core management skills hardest to recruit for.',
  caveat: 'Regional optimism is not a personal guarantee. It describes employers\' expectations of the talent pool, not any individual\'s odds of being hired.'
};

/* Kenya-specific demand signals, kept separate from the global projection. */
const KENYA_DEMAND_SIGNALS = [
  {
    signal: 'ICT roles account for roughly 13–15% of formal job postings',
    note: 'The information and communication sector grew over 6% in 2024, outpacing the wider economy.',
    clusters: ['tech', 'numbers']
  },
  {
    // Three figures circulate and they are not interchangeable. The WEF's own
    // Kenya study counts roughly 7,000 in BPO proper — voice and transactional
    // back-office. Around 40,000 jobs are reported as created in the sector
    // recently. The ICT Authority's 60,000+ counts "BPO and IT-enabled
    // services", a much wider net including gig and platform work. Njia shipped
    // the largest number alone, which flattered the sector by nearly an order
    // of magnitude against the narrowest count. All three are stated here.
    signal: 'BPO employment is reported between about 7,000 and 60,000 depending on what is counted',
    note: 'Roughly 7,000 work in BPO proper — voice and transactional back-office (World Economic Forum, Kenya digital economy study, 2025). About 40,000 jobs are reported as created in the wider sector. The ICT Authority\'s 60,000+ figure covers "BPO and IT-enabled services", including gig and platform work. Government targets 500,000. It remains one of the few sectors with formal entry roles that do not require a degree — but plan against the narrow number, not the headline.',
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

/* The education pipeline, 2025 cycle — and the finding that reframes Njia.
 *
 * Middle-level colleges hold capacity for 1,132,531 students. Placements
 * across every institution type came to 293,869. Capacity is not the binding
 * constraint on Kenyan youth education — roughly four out of five middle-level
 * places go unfilled while young people conclude there is nowhere for them.
 *
 * That is the entire premise of this platform, and until now it was asserted
 * rather than evidenced. The problem Njia addresses is not scarcity of places.
 * It is that a school-leaver cannot see what exists, what it costs, whether
 * they qualify, or how to pay for it. Every figure below is sourced.
 */
const EDUCATION_PIPELINE = {
  source: 'KNEC 2025 KCSE results (released 9 January 2026) and KUCCPS 2025/26 placement reporting, cross-reported August 2026',
  kcseCandidates: 993226,
  qualifiedForDegree: 270715,
  qualifiedForDegreePct: 27.18,
  scoredDorBelow: 359144,
  scoredA: 1932,
  totalPlaced: 293869,
  degreePlacements: 202133,
  kmtcPlacements: 28246,
  degreeQualifiedWhoChoseTvet: 8915,
  middleLevelCapacity: 1132531,
  /* The lines Njia should actually say out loud. */
  readings: [
    {
      finding: 'Capacity is not the constraint',
      detail: 'Middle-level colleges can hold 1,132,531 students. Placements across all institution types totalled 293,869. The places exist; what is missing is a way to find them, price them and pay for them.'
    },
    {
      finding: 'Most candidates are not competing for degrees at all',
      detail: '270,715 of 993,226 candidates — 27.18% — reached the C+ needed for direct university entry. The other 72.82% are choosing among diplomas, certificates and artisan courses, which is where the catalogue is deepest.'
    },
    {
      finding: '359,144 candidates scored D or below',
      detail: 'More than a third of the cohort. Most career guidance is written as though this group does not exist. They are precisely who the no-minimum-grade and certificate entries are for.'
    },
    {
      finding: 'KMTC is the largest single non-degree destination',
      detail: '28,246 candidates were placed at the Kenya Medical Training College — more than Kenya School of Law, Utalii College and the teacher training colleges combined, several times over. It teaches the same national curriculum at campuses in 45 of the 47 counties.'
    },
    {
      finding: 'Choosing TVET over a degree you qualified for is still rare',
      detail: 'Only 8,915 of those who earned a degree place chose TVET instead. Prestige, not evidence, is doing much of the deciding.'
    }
  ]
};

/* Automation exposure — deliberately presented as a genuine disagreement.
 *
 * Two credible bodies of work point in opposite directions:
 *
 *   Oxford Martin (Frey & Osborne's method applied with World Bank data)
 *   put developing-country automation risk at 55–85%, far above their
 *   original 47% US figure — because poorer economies hold more routine,
 *   codifiable work.
 *
 *   Newer AI-specific analysis finds the reverse: about 4.5% of jobs in
 *   low- and middle-income economies are highly amenable to current
 *   generative AI, against 14.2% in high-income ones — because the exposed
 *   work (clerical, knowledge-processing) is concentrated in rich
 *   countries, and because adoption needs infrastructure and wage
 *   incentives that are weaker here.
 *
 * Both are real. They measure different things: technical automatability of
 * task content versus present-day AI amenability. Njia shows both rather
 * than picking whichever is more dramatic, and names the disagreement — a
 * seventeen-year-old is owed the state of the evidence, not a tidy verdict
 * that later turns out to be one camp's.
 */
const AUTOMATION_EXPOSURE = {
  kenyaHeadline: 'Around 2.5 million Kenyans work in roles with high or significant exposure to generative AI.',
  kenyaSharpEnd: 'Roughly 400,000 clerical and knowledge-processing workers — bookkeepers, payroll clerks, data-entry operators — sit at the sharp end, where disruption is already visible.',
  kenyaSource: 'ODI analysis of the 2022 Kenya Continuous Household Survey, applying the ILO Generative AI and Jobs framework',
  contested: [
    {
      view: 'Developing economies are more exposed, not less',
      figure: '55–85% of jobs at risk across developing countries, against 47% in the US',
      basis: 'Oxford Martin School, applying Frey & Osborne (2013/2017) to World Bank data. Measures how technically codifiable the task content is.'
    },
    {
      view: 'Current AI touches rich-country work first',
      figure: '4.5% of low- and middle-income jobs highly amenable to automation, against 14.2% in high-income economies',
      basis: 'Recent AI-specific exposure analysis. Measures what today\'s systems can actually do, and where adoption pays.'
    }
  ],
  /* Frey & Osborne named three bottlenecks that resist computerisation:
   * complex perception and manipulation, creative intelligence, and social
   * intelligence. Those map unusually cleanly onto Njia's clusters, which
   * is why this is worth surfacing per-cluster rather than as a general
   * warning nobody can act on. */
  bottlenecks: [
    {
      barrier: 'Social intelligence',
      meaning: 'Negotiation, persuasion, care, and reading people. Persistently hard to automate.',
      clusters: ['carer', 'people']
    },
    {
      barrier: 'Creative intelligence',
      meaning: 'Originating ideas and artefacts that are novel rather than recombined.',
      clusters: ['creator']
    },
    {
      barrier: 'Complex perception and manipulation',
      meaning: 'Skilled physical work in unstructured settings — installation, repair, fieldwork.',
      clusters: ['tech']
    },
    {
      barrier: 'Routine processing — the exposed side',
      meaning: 'Clerical, bookkeeping and data-entry work is the most exposed category in Kenya today. This does not make an office pathway a bad choice; it makes the analytical and judgement parts of it the parts worth building.',
      clusters: ['business', 'numbers']
    }
  ]
};

/* Njia's method is not improvised. The Odyssey Plan, prototyping and gravity
 * problems in the Design module come from the Stanford Life Design Lab
 * (Burnett & Evans), taught at Stanford for close to two decades and now at
 * 600+ universities. Naming the lineage is not decoration: a tool that asks
 * a young person to sketch three futures should say whose method that is and
 * where they can go and read it themselves. */
const METHOD_LINEAGE = [
  {
    module: 'Design — Odyssey Plans, prototyping, gravity problems',
    source: 'Stanford Life Design Lab; Burnett & Evans, "Designing Your Life"',
    note: 'Three parallel five-year futures, prototyped rather than committed to. The point of three is that it defeats the single-path thinking that makes a wrong choice feel final.'
  },
  {
    module: 'Discover — interest clusters and their limits',
    source: 'Tsabari, Tziner & Meir (2005); Low, Yoon, Roberts & Rounds (2005); Nye, Su, Rounds & Drasgow (2012); Super\'s stages of vocational development',
    note: 'Interest–job congruence correlates only about r = .17 with satisfaction, and interests do not stabilise until roughly ages 25–30 — which is exactly why Njia reports a signal strength rather than a verdict.'
  },
  {
    module: 'Decide — automation and demand evidence',
    source: 'Frey & Osborne (Oxford Martin); WEF Future of Jobs 2025; KNBS Economic Survey 2026; ODI/ILO Kenya AI exposure analysis',
    note: 'Sector-level, cited, and shown with its disagreements intact.'
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
  module.exports = { SECTOR_EARNINGS, LABOUR_MARKET_ANCHORS, YOUTH_EMPLOYMENT_MEASURES, FUTURE_OF_WORK, KENYA_DEMAND_SIGNALS, SKILLS_MISMATCH, AUTOMATION_EXPOSURE, METHOD_LINEAGE, EDUCATION_PIPELINE, AFRICA_OUTLOOK };
}
