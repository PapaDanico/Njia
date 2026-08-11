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
 * they will first earn. Kenya's informal sector absorbs 83.8% of all workers —
 * 18.1 million against 3.5 million in formal wage employment — so these
 * averages describe the destination of roughly one working Kenyan in six, and a
 * school-leaver with a certificate typically enters well below them. See
 * INFORMAL_ECONOMY below; that context travels with these figures.
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

/* THE INFORMAL ECONOMY — the context every earnings figure above needs.
 *
 * 83.8% of Kenyan employment is informal: 18.1 million people, against 3.5
 * million in formal wage employment. Of the 822,100 jobs created in 2025,
 * 87.2% were informal.
 *
 * This matters more than any single salary figure. Every sector earning in
 * SECTOR_EARNINGS is an average across *formal wage employment* — the
 * destination of roughly one working Kenyan in six. Presenting that ladder as
 * the normal outcome, without saying how narrow it is, misdescribes where this
 * user is statistically most likely to end up.
 *
 * That is not a counsel of despair and must never be written as one. It is why
 * Njia treats enterprise capital (YEDF) as funding rather than a footnote, why
 * business modelling sits in the catalogue, and why a trade certificate leading
 * to self-employment is a legitimate plan rather than a fallback. The informal
 * sector is not the failure case. For five in six workers it is the economy.
 */
const INFORMAL_ECONOMY = {
  source: 'KNBS Economic Survey 2026 (reporting 2025), cross-reported coverage, August 2026',
  informalSharePct: 83.8,
  informalWorkers: 18100000,
  formalSharePct: 16.2,
  formalWorkers: 3500000,
  newJobs2025: 822100,
  newJobsInformalPct: 87.2,
  largestInformalSectors: [
    { sector: 'Wholesale and retail trade, hotels and restaurants', workers: 10700000 },
    { sector: 'Manufacturing', workers: 3600000 }
  ],
  fastestGrowing: 'Construction, at 6.7% informal growth',
  reading: 'Five in six working Kenyans are in the informal sector, and it absorbed 87% of last year\'s new jobs. Formal salary figures describe the smaller share. Plan for a pathway that works either way — a qualification that lets you be hired *and* lets you trade on your own account is worth more here than one that only does the first.'
};

/* RECOGNITION OF PRIOR LEARNING — the route for people who already have the skill.
 *
 * Njia's entire model assumes you are choosing a course. For a large share of
 * the people it is built for, that is the wrong question. Kenya's informal
 * sector holds 83.8% of the workforce — mechanics, masons, tailors, welders,
 * cooks — many of whom are already competent and simply have no paper that says
 * so.
 *
 * This closes a loop the rest of this file already half-draws:
 *
 *   1. Five in six working Kenyans are informal (INFORMAL_ECONOMY).
 *   2. A *certified* artisan earns Ksh 2,500-3,000 a day; uncertified work pays
 *      a fraction of it (SKILLED_TRADES). The certificate is what earns the rate.
 *   3. RPL is how you get that certificate for skills you already have, without
 *      going back to school for years you cannot afford.
 *
 * That is the single most useful thing this platform can tell a working
 * twenty-five-year-old with ten years on the tools and nothing to show for it.
 */
const PRIOR_LEARNING = {
  source: 'TVETA / KNQA Recognition of Prior Learning Policy Framework (June 2021) and ILO reporting on RPL implementation, cross-reported August 2026',
  whatItIs: 'A structured assessment that certifies skills, knowledge and competence you gained through work, informal training or life experience, and converts them toward a formal qualification.',
  whoItIsFor: 'Artisans, technicians and tradespeople already working — the jua kali sector — who are competent but hold no certificate.',
  whoRunsIt: 'Led by TVETA with the Kenya National Qualifications Authority and ILO support. The push came from the Federation of Kenya Employers and the Kenya Jua Kali Association, who identified the need to validate informal skills.',
  scaleSoFar: 'Over 600 certificates awarded under the programme so far — real but early, so expect to have to ask for it rather than find it advertised.',
  whyItMatters: 'A certified artisan commands Ksh 2,500-3,000 a day; uncertified work pays a fraction of the same job. If you already have the skill, certification is the shortest distance between what you can do and what you get paid for it.',
  honestLimit: 'This is a young programme. Coverage across trades and counties is uneven, and you may need to approach TVETA or an accredited assessment centre directly. It is not yet a national service you can simply sign up to online.',
  clusters: ['tech', 'business', 'creator', 'carer']
};

/* WHERE THE ROOM ACTUALLY IS — the mechanism behind the capacity paradox.
 *
 * EDUCATION_PIPELINE records that middle-level colleges hold over 1.1 million
 * places against 293,869 placements. This is how that happens in practice.
 *
 * In the 2026 cycle, medicine, nursing, pharmacy and engineering were removed
 * from the KUCCPS portal outright once their slots were exhausted in the first
 * window. Those courses attract the most applicants nationally and have the
 * least government-funded capacity — and the limit is not arbitrary: regulators
 * (the Medical Practitioners and Dentists Council, the Engineers Board) cap
 * intake so the ratio of students to laboratory equipment and lecturers stays
 * workable. Meanwhile roughly 1.1 million vacancies sat open across national
 * polytechnics and specialised training institutions.
 *
 * The distinction a user needs: degree nursing is among the most oversubscribed
 * programmes in the country, while the KMTC diploma route into the same
 * profession runs at campuses in 45 counties and is reachable. Same field,
 * completely different odds. This is not an argument for lowering ambition — it
 * is an argument for knowing which door is open before the window closes.
 */
const COMPETITION_REALITY = {
  source: 'KUCCPS 2026 placement cycle reporting, cross-reported August 2026',
  fillFirst: ['Medicine and surgery', 'Nursing (degree)', 'Pharmacy', 'Architecture', 'Engineering'],
  whatHappens: 'These were removed from the portal entirely once slots were exhausted in the first application window, which closed on 6 May.',
  whyCapped: 'Intake is capped by professional regulators — the Medical Practitioners and Dentists Council, the Engineers Board — so that students-per-lecturer and students-per-laboratory ratios stay workable. The cap protects the quality of the qualification you would be getting.',
  whereTheRoomIs: 'Roughly 1.1 million vacancies remained across national polytechnics and specialised training institutions.',
  theSameFieldTwice: 'Degree nursing is among the most oversubscribed programmes in the country. The KMTC diploma route into the same profession runs at campuses in 45 counties and is reachable. Same field, completely different odds.',
  action: 'Apply early — the competitive programmes close in the first window, not at the published deadline. And put a reachable second and third choice on the form rather than three versions of the same long shot.'
};

/* HOW DEGREE PLACEMENT ACTUALLY WORKS — and why a mean grade is not the answer.
 *
 * Njia stores a `min_grade` per course and tells the user whether they meet it.
 * For certificates and diplomas that is close enough. For degrees it is not,
 * and the gap matters:
 *
 *   KUCCPS places degree applicants on WEIGHTED CLUSTER POINTS — computed from
 *   performance in the four subjects that specific programme requires, measured
 *   against the best candidates, to three decimal places. Every programme sits
 *   in one of about 18-20 subject clusters.
 *
 *   A CUT-OFF POINT is not a threshold set in advance. It is the cluster score
 *   of the LAST student competitively placed in that programme last cycle. It
 *   moves every year with demand, institutional capacity and how the cohort
 *   performed.
 *
 * Two consequences a student needs stated plainly. Meeting the mean grade makes
 * you eligible to apply, not placed. And chasing last year's cut-off is chasing
 * a number that no longer exists — it was an outcome, not a target.
 */
const PLACEMENT_MECHANICS = {
  source: 'KUCCPS placement guidance and 2026 cycle explainers, cross-reported August 2026',
  meanGradeRole: 'The mean grade (C+ and above for degrees) determines whether you may apply at all.',
  clusterPointsRole: 'Placement itself is decided on weighted cluster points — your performance in the four subjects that programme requires, ranked against every other applicant, to three decimal places.',
  cutOffTruth: 'A cut-off point is the cluster score of the last student placed in that programme last cycle, not a bar set in advance. It changes every year with demand, capacity and cohort performance.',
  doesNotGuarantee: 'Meeting the cut-off does not guarantee placement — programme capacity and competition still decide.',
  practicalAdvice: 'Do not compute cluster points by hand. The KUCCPS student portal calculates yours and shows them directly. Use last year\'s cut-offs to gauge how competitive a programme is, never as a score to aim at.'
};

/* THE STRUCTURAL CHANGE UNDER NJIA'S FEET.
 *
 * Kenya's first competency-based cohort entered senior school in January 2026.
 * Under 8-4-4 every learner followed a broadly similar curriculum to KCSE and
 * chose afterwards — which is the world Njia was designed for. Under CBE the
 * learner picks one of three pathways at Grade 10, on their KJSEA results, and
 * that choice shapes the subjects they take, the skills they build and the
 * courses open to them at Grade 12.
 *
 * The decision Njia exists to support has moved roughly three years earlier.
 * That is not a data point, it is a scope question for the platform, and it is
 * recorded here rather than in a strategy document because the catalogue and
 * the cluster model both have to answer it eventually.
 */
const CBE_PATHWAYS = {
  source: 'Ministry of Education CBE senior school framework and 2026 transition coverage, cross-reported August 2026',
  liveFrom: 'January 2026 — the first Grade 10 cohort',
  decisionPoint: 'Grade 10, at roughly age 14–15, on KJSEA results',
  pathways: [
    { name: 'STEM', covers: 'Science, technology, engineering and mathematics subjects', clusters: ['tech', 'numbers'] },
    { name: 'Social Sciences', covers: 'Humanities, business, languages and policy-facing subjects', clusters: ['people', 'business', 'carer'] },
    { name: 'Arts and Sports Science', covers: 'Creative, performance and sports subjects', clusters: ['creator'] }
  ],
  commonCore: 'English, Kiswahili or Kenyan Sign Language, community service learning and physical education are taken by everyone, alongside three pathway subjects.',
  implication: 'A Grade 10 pathway choice now narrows what is reachable at Grade 12. Njia currently meets people after KCSE, which under this system is after the decisive choice has already been made.'
};

/* THE PLACEMENT CALENDAR. Dates, not prose, so the app can work out what is
 * actually open today rather than shipping a claim that quietly goes stale.
 * Every window below is for the 2026 cycle. */
const PLACEMENT_CALENDAR = [
  { name: 'KUCCPS main application (degree, diploma, certificate, TVET)', opens: '2026-04-07', closes: '2026-05-06',
    note: 'The main window for the 2025 KCSE cohort.' },
  { name: 'KUCCPS second call — revise your choices', opens: '2026-05-16', closes: '2026-05-22',
    note: 'For applicants not placed in the first round.' },
  { name: 'KMTC March intake application', opens: '2026-01-07', closes: '2026-01-27',
    note: 'KMTC runs its own intake cycles through KUCCPS.' },
  { name: 'Inter-institutional transfer', opens: '2026-06-01', closes: '2026-08-14',
    note: 'If you were placed somewhere you cannot take up, this is the route to move.' },
  { name: 'Kenya Utalii College (Ronald Ngala, Kilifi)', opens: '2026-06-01', closes: '2026-08-23',
    note: 'Separate deadline from the main cycle.' },
  { name: 'KMTC September intake', opens: '2026-07-01', closes: '2026-09-30',
    note: 'Opens after university placement completes — a second chance for the 2025 cohort.' },
  { name: 'TVET placement (continuous)', opens: '2026-05-01', closes: '2026-12-31',
    note: 'TVET admission is continuous rather than a single annual exercise, and colleges report from May. This is the door that stays open longest.' }
];

/* THE YARDSTICK. Every figure in this file should be read against this.
 * Regulation of Wages (General) (Amendment) Order 2026, Gazette Supplement
 * No. 128, Legal Notices 95 and 96, in effect from 1 May 2026. */
const MINIMUM_WAGE = {
  source: 'Regulation of Wages (General) (Amendment) Order 2026 — Kenya Gazette Supplement No. 128, Legal Notices 95/96, effective 1 May 2026',
  urbanMonthlyKes: 16114,
  generalMonthlyKes: 7997,
  note: 'Ksh 16,114 a month is the statutory floor in major urban areas; Ksh 7,997 is the lower general rate. Skilled workers are set at roughly two to three times the unskilled rate.'
};

/* WHAT PEOPLE ACTUALLY START ON. The sector averages elsewhere in this file
 * include consultants and principals; these are entry figures, which is the
 * number a school-leaver is really asking for. */
const ENTRY_PAY = [
  {
    role: 'Nurse (KRCHN diploma), private hospital',
    monthlyKes: [20000, 35000],
    note: 'Entry level. Faster to get than a public post, and paid less for it.',
    clusters: ['carer']
  },
  {
    role: 'Nurse (KRCHN diploma), public scheme of service',
    monthlyKes: [50000, 50000],
    note: 'Materially better paid, but absorption is slow and budget-constrained at county level. UHC staff on short-term contracts moved to permanent and pensionable terms from 1 July 2026.',
    clusters: ['carer']
  },
  {
    role: 'Nurse, around five years in',
    monthlyKes: [70000, 70000],
    note: 'Progression is real — this is the same qualification, later.',
    clusters: ['carer']
  },
  {
    role: 'Teacher, TSC Grade B5 (diploma entry)',
    monthlyKes: [28600, 37100],
    note: 'The 2025–2029 CBA scale for Primary Teacher II, plus a Ksh 4,000 monthly commuter allowance at entry grade. Note the likely first step is an internship rather than this grade — check the terms of the post you are offered.',
    clusters: ['carer', 'people']
  },
  {
    role: 'Certified artisan (day rate, if worked ~22 days)',
    monthlyKes: [55000, 66000],
    note: 'Ksh 2,500-3,000 a day. This is the *ceiling* of a full month at full rate — the work is irregular, so treat it as the best case rather than the expectation.',
    clusters: ['tech', 'business']
  },
  {
    role: 'Online/freelance digital work (average)',
    monthlyKes: [7766, 7766],
    note: 'Below half the urban minimum wage, and only about 28% of trained participants earn anything at all.',
    clusters: ['tech', 'numbers', 'creator', 'business']
  }
];

/* THE DEBT ARITHMETIC NOBODY SETS OUT SIDE BY SIDE.
 *
 * HELB gives a one-year grace period after graduation. The penalty for not
 * starting repayment is Ksh 5,000 a month. World Bank data puts the average
 * time for a Kenyan university graduate to find a job at five years.
 *
 * Those three facts belong on the same page, because together they describe
 * a trap: a graduate who takes the average time to find work is exposed to
 * roughly four years of penalties after grace expires. That is not a reason
 * to avoid borrowing — it is a reason to know the minimum-payment rule, which
 * is the part that prevents it.
 */
const LOAN_REALITY = {
  source: 'HELB published terms and repayment reporting; World Bank graduate transition data; cross-reported August 2026',
  interestRatePct: 4,
  termYears: 10,
  gracePeriodMonths: 12,
  minimumMonthlyIfUnemployedKes: 1500,
  penaltyPerMonthKes: 5000,
  beneficiariesInDefault: 360000,
  averageYearsToFirstJob: 5,
  theTrap: 'Grace runs 12 months. The penalty for not starting is Ksh 5,000 a month — more than three times the Ksh 1,500 minimum payment HELB accepts from someone unemployed or underemployed. A graduate who takes the average five years to find work, and does nothing, is exposed to years of penalties that dwarf the payment that would have prevented them.',
  theAction: 'If you borrow, start paying the Ksh 1,500 minimum the month grace ends, employed or not. It is the single cheapest thing you can do with this information.'
};

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
    note: 'The sector grew over 6% in 2024, outpacing the wider economy — the fastest-expanding formal employer in the country.',
    clusters: ['tech', 'numbers']
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
    signal: 'Creative work increasingly sits inside tech companies, not media houses',
    note: 'Digital content, design and production have moved into the information and communication sector — which also means generative AI reaches them sooner.',
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

/* DIGITAL WORK — real, growing, and oversold in roughly equal measure.
 *
 * "Learn digital skills and earn online" is marketed hard to Kenyan youth, and
 * the participation numbers are genuinely large: digital work involvement grew
 * from about 600,000 in 2019 to 2.4 million by 2023, and Ajira Digital has
 * trained roughly 391,000 young people.
 *
 * The earnings tell a more sober story. Among digital content participants the
 * share earning any income rose from 5% to 28% — which also means roughly
 * seven in ten trained participants were earning nothing from it. Average
 * monthly earnings rose to about Ksh 7,766, well under the formal-sector
 * figures elsewhere in this file.
 *
 * And there is a connection worth stating plainly, because nobody selling
 * these courses will: the entry-level digital work most commonly trained for —
 * transcription, data entry — is the same category the WEF Future of Jobs
 * Report puts among the fastest *declining* roles as generative AI matures.
 * Training for it is not worthless, but it is training toward a shrinking
 * floor, and the escape is upward into work AI does not do well.
 */
const DIGITAL_WORK = {
  source: 'Ajira Digital programme reporting and Kenyan digital-economy coverage, cross-reported August 2026',
  participantsInDigitalWork: { 2019: 600000, 2023: 2400000 },
  ajiraTrained: 391000,
  ictCentres: 400,
  shareEarningIncomePct: { before: 5, after: 28 },
  averageMonthlyEarningsKes: { before: 2600, after: 7766 },
  honestReading: 'Participation is real and large, but roughly seven in ten trained participants were not earning from it, and average monthly earnings of about Ksh 7,766 sit well below the formal-sector figures elsewhere here. Treat online work as a supplement or a starting rung, not as a plan that replaces a qualification.',
  aiCaution: 'The entry-level digital work most commonly trained for — transcription and data entry — is in the same category the WEF puts among the fastest declining roles as generative AI matures. It is not worthless, but it is a shrinking floor. The way up is toward work that is harder to automate: client relationships, judgement, specialist domains.',
  clusters: ['tech', 'numbers', 'creator', 'business']
};

/* THE ABSORPTION GAP — vacancy is not the same as hiring.
 *
 * This is the correction that keeps the rest of this file honest. Njia now
 * carries KMTC nursing across 45 counties and names health and education as
 * Kenya's largest employers. All true. But a shortage of posts is not the same
 * as an opening you can walk into, and in both sectors the two have come
 * apart:
 *
 *   Health: Kenya needs 311,060 health workers and has 234,140 — a gap of
 *   76,920. And yet thousands of qualified nurses are unemployed, waiting on
 *   public-sector hiring that is budget-constrained rather than demand-
 *   constrained.
 *
 *   Teaching: a shortage of about 96,345 teachers, with junior schools alone
 *   short 72,000. And yet intern posts go rejected, because the Commission
 *   cannot afford to convert interns to permanent and pensionable terms.
 *
 * Both facts are real at once. A platform that quoted only the shortage would
 * be telling a seventeen-year-old that a nursing diploma leads straight to a
 * job, which is the same true-but-incomplete failure as quoting the widest BPO
 * figure. The shortage is real and it is a reason to train. The absorption
 * delay is also real and it is a reason to plan for it — private and
 * faith-based facilities, county contracts, NGO roles, and the possibility of
 * a wait.
 */
const ABSORPTION_GAP = {
  source: 'Kenya health labour market modelling (2021–2035) and TSC staffing reporting, cross-reported August 2026',
  sectors: [
    {
      sector: 'Health and nursing',
      shortage: 'Kenya needs 311,060 health workers against a supply of 234,140 — 75.3% of need met, 76,920 posts unfilled. The nurse-to-population ratio has risen to 22.7 per 10,000 but remains below the WHO-recommended 25, and far below the 60 needed for universal health coverage. The gap is projected to widen by 49% to 114,352 by 2031.',
      reality: 'Thousands of trained nurses are nonetheless unemployed or underemployed, waiting on delayed public-sector absorption. The constraint is the hiring budget, not the need.',
      planning: 'Train for it — the need is real and growing. But plan for the wait: private and faith-based facilities, county contracts and NGO roles absorb faster than national public hiring, and a first post may not be the one you expected.',
      clusters: ['carer']
    },
    {
      sector: 'Teaching',
      shortage: 'The Teachers Service Commission estimates a shortage of about 96,345 teachers — 38,054 in primary and 58,291 in post-primary. Junior schools alone are short at least 72,000, and recruitment drives run in the tens of thousands.',
      reality: 'Much of the hiring is on internship terms rather than permanent and pensionable, because of budget limits. That has driven rejected posts, low morale and litigation.',
      planning: 'Education remains Kenya\'s single largest formal wage employer and the shortage is genuine. Go in knowing the likely first step is an internship rather than a permanent post, and check the terms before you count on the salary.',
      clusters: ['carer', 'people']
    }
  ]
};

/* SKILLED TRADES — the hardest evidence against prestige bias in this file.
 *
 * Only 8,915 candidates who earned a degree place chose TVET instead. The
 * assumption behind that is that a degree pays better. In the trades, the
 * numbers say otherwise:
 *
 *   Kenya has roughly 5,000 engineers and architects, and fewer than 2,000
 *   trained plumbers, painters and masons. Two-thirds of developers name
 *   skilled-worker shortage as the main brake on construction. Certified
 *   artisan day rates have tripled since 2012.
 *
 * A caution that must travel with the day rate: it is a DAY RATE, not a
 * salary. Work is often irregular and seasonal, there is no employer pension
 * or leave, and the rate applies to *certified* artisans — the certificate is
 * the thing doing the work. Presenting 3,000 a day as though it were
 * guaranteed monthly income would be the same false precision this file
 * exists to remove.
 */
const SKILLED_TRADES = {
  source: 'KNBS construction labour index and Kenyan construction-sector reporting, cross-reported August 2026',
  dayRateKes: [2500, 3000],
  dayRate2012Kes: [500, 1000],
  supplyGap: 'Roughly 5,000 engineers and architects countrywide, against fewer than 2,000 trained plumbers, painters and masons.',
  demandSignal: 'Two-thirds of Kenyan developers report skilled-worker shortage as the main factor limiting construction activity. Demand for construction professionals is projected to rise from 260,000 to over 410,000 by 2035.',
  risingTrades: ['Carpenters', 'Painters', 'Welders', 'Mechanics', 'Plumbers', 'Masons', 'Electricians'],
  caution: 'These are day rates for *certified* artisans, not salaries. Work is often irregular and seasonal, and there is no employer pension, paid leave or sick pay. The certificate is what earns the rate — uncertified work pays a fraction of it.',
  reading: 'A certified artisan day rate of Ksh 2,500–3,000 compares well with what many diploma and degree holders start on. This is the clearest evidence in the dataset that the prestige ranking of degree over trade is not tracking the money.',
  clusters: ['tech', 'business']
};

/* The structural finding Njia is built around: the binding constraint on
 * Kenyan youth employment is not effort, it is the gap between what is taught
 * and what is demanded. Named plainly so the platform's premise is auditable
 * rather than assumed. */
const SKILLS_MISMATCH = {
  finding: 'Kenya\'s graduate employment problem is substantially structural, not motivational: higher education remains theory-weighted while employers seek practical experience, digital literacy and communication.',
  implication: 'Choosing a field is only half the decision. Evidence of applied skill — a portfolio, an attachment, a demonstrable project — is what closes the gap, which is why Njia treats prototyping as a module rather than advice.',
  sources: ['British Council, Higher Education Graduate Employability (Kenya)', 'Kenyan university employability research, cross-reported 2023–2026']
};

/* SKILLS_MISMATCH names "an attachment" as one of the things that closes the
 * employability gap, and until now Njia left it at that — as though it were a
 * thing that simply happens to you. It is not. Industrial attachment is a
 * *mandatory* component of most university and TVET programmes, it is
 * competitive, and students routinely discover this in the term it is due.
 *
 * The actionable part is that there is a single national portal for it, run
 * by NITA, and almost nobody entering a course is told about it at the point
 * where knowing early would help. Registering in year one costs nothing and
 * removes a scramble later.
 *
 * The 55,000 figure is NITA's own placement throughput, not the number of
 * places available on demand — stated as scale, never as a guarantee. */
const ATTACHMENT = {
  source: 'National Industrial Training Authority (NITA) industrial attachment scheme and Kenyan TVET/university programme requirements, cross-reported August 2026',
  isMandatory: 'Industrial attachment is a mandatory component of most university and TVET programmes in Kenya — not an optional extra you can decide against later.',
  placedPerYear: 55000,
  scale: 'NITA facilitates placement for more than 55,000 students a year across public and private institutions.',
  theCompetition: 'Places are contested. Thousands of students chase attachments in the same government bodies, state corporations and large firms every intake, and the institution does not guarantee you one.',
  whereToApply: 'NITA runs a national portal (ITAP), reached from nita.go.ke under Our Services → Industrial Attachment. You create an account, verify by email, and apply from there. Large employers such as KRA and Kenya Power also advertise their own intakes on fixed cycles.',
  theAdvice: 'Register in your first year, not the term the attachment is due. It costs nothing, and it converts a scramble into a queue you are already in.',
  whyItCompounds: 'Attachment is often the first real entry to the labour market, and a share of students are eventually hired by the organisation that took them. It is the cheapest experience you will ever acquire, and it is already built into your course.',
  honestLimit: 'The supply of quality places has not kept pace with enrolment, which is why the State Department for TVET is now pushing to bring industry into institutions rather than send every student out. Plan for the search to be real work.',
  clusters: ['tech', 'business', 'creator', 'carer', 'people', 'numbers']
};

/* The most misreported career story in Kenya, and a case study in why this
 * file exists.
 *
 * In September 2024 Kenya and Germany signed a Migration and Mobility
 * Partnership in Berlin. Kenyan headlines reported it as Germany opening
 * 250,000 jobs to Kenyans. That number is NOT in the agreement. Germany's
 * Interior Ministry publicly denied that the deal specifies any quota; the
 * figure came from Kenya's presidency describing an aspiration.
 *
 * Njia ships the correction as the headline finding, because a young person
 * making a plan around 250,000 guaranteed openings is making it around
 * something that does not exist. The agreement is real and genuinely useful.
 * The gate is not a quota — it is German language and formal recognition of
 * your qualification, and both take years to clear, not weeks.
 *
 * `theNumberYouHeard` must never be dropped when this record is rendered. */
const LABOUR_MOBILITY = {
  source: 'ILO reporting on the Kenya–Germany bilateral labour agreement; Kenya–Germany Migration and Mobility Partnership signed Berlin, 13 September 2024; German Skilled Immigration Act guidance, cross-reported August 2026',
  agreement: 'Kenya and Germany signed a Migration and Mobility Partnership in Berlin on 13 September 2024, covering labour mobility, apprenticeship, student training, worker welfare and return.',
  theNumberYouHeard: 'You have probably seen "Germany opens 250,000 jobs to Kenyans". That number is not in the agreement. Germany\'s Interior Ministry stated publicly that the deal specifies no quota at all — the figure came from Kenya\'s presidency describing an ambition. Treat it as a hope, not a vacancy list.',
  whatIsRealInIt: 'Germany waives its labour-market test for skilled workers from Kenya, grants a residence permit once you hold an approved job, and issues long-stay visas for study and vocational training (Ausbildung), with a route to work there afterwards.',
  sectors: ['Healthcare and nursing', 'Engineering', 'IT', 'Transport', 'Hospitality'],
  theRealGate: 'German language and formal recognition of your qualification — not the agreement. Both take years to clear, not weeks.',
  theGateDetail: 'Regulated professions such as nursing require German at B1–B2 depending on the federal state, plus formal recognition of your Kenyan qualification (Anerkennung), which takes up to four months once your documents are complete, usually alongside a concrete job offer.',
  theOpening: 'Since 1 March 2024 a Recognition Partnership lets you enter Germany and complete the recognition procedure there rather than finishing it first. IT specialists can qualify on demonstrated skill without a formal qualification.',
  honestReading: 'This is a real route and a narrow one. It rewards people who start German early and keep their certificates, transcripts and registration documents in order. It is not a plan for next year, and it is not a substitute for a plan in Kenya.',
  clusters: ['carer', 'tech', 'numbers', 'business']
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SECTOR_EARNINGS, LABOUR_MARKET_ANCHORS, YOUTH_EMPLOYMENT_MEASURES, FUTURE_OF_WORK, KENYA_DEMAND_SIGNALS, SKILLS_MISMATCH, AUTOMATION_EXPOSURE, METHOD_LINEAGE, EDUCATION_PIPELINE, AFRICA_OUTLOOK, INFORMAL_ECONOMY, SKILLED_TRADES, ABSORPTION_GAP, DIGITAL_WORK, MINIMUM_WAGE, ENTRY_PAY, LOAN_REALITY, CBE_PATHWAYS, PLACEMENT_CALENDAR, PLACEMENT_MECHANICS, COMPETITION_REALITY, PRIOR_LEARNING, ATTACHMENT, LABOUR_MOBILITY };
}
