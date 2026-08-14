/* Njia — industry sector register (QA side).
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
 * WHAT MOVED, AND WHY THIS FILE IS NOW HALF THE SIZE.
 *
 * The sector list itself — names, the match patterns, the awarding bodies —
 * has been promoted to data/sectors.js and ships to readers, alongside the
 * KNBS economics that gives a learner a reason to care which sector a course
 * sits in. This file no longer keeps a copy of any of that. It loads the
 * shipped file and adds only what belongs in QA: the coverage floor per sector,
 * the declared gap, and which fee regimes each sector may legitimately use.
 *
 * That split is deliberate and was learned the hard way one screen over: this
 * same test file kept its own reimplementation of the fee-basis classifier,
 * drifted from the shipped one, and went on passing while the app under-counted
 * 51 records. A guard holding a private copy of the thing it guards is not a
 * guard. Ids are asserted to match in both directions below, so a sector added
 * to one file and not the other fails rather than going quietly unchecked.
 *
 * FEE REGIMES. The field that would have caught both original bugs. Every
 * institution carries fee_regime, and a course may only derive its fee from the
 * regime its own institution is on:
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
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

/* QA-only fields, keyed by the shipped sector id.
 *
 * `expect` is the minimum number of catalogue records for the sector to count
 * as covered. It is a floor for "we have actually sourced this", not a target.
 * `gap` records what is known to be missing and is required to be non-empty
 * when a sector is thin — a declared gap is research, an undeclared one is an
 * accident. */
const SECTOR_QA = {
  health: {
    feeRegimes: ['kmtc', 'tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 40,
    gap: 'Over-represented relative to every other sector because KMTC runs 40-odd campuses and Njia lists them all. That is Kenya\'s shape, not a sourcing error, but it does mean cluster counts cannot be read as demand.',
    source: 'kmtc.ac.ke national fee structure 2025/26; TVET CDACC health curricula'
  },
  education: {
    feeRegimes: ['ttc_consolidated', 'public_university'],
    expect: 5,
    gap: 'Only primary teacher education is covered. Diploma in Secondary Teacher Education and ECDE are not yet sourced. Note the labour market: roughly 369,000 registered teachers are unemployed, so more supply here would not be a service.',
    source: 'TSC registration rules; KUCCPS TTC placement; see TEACHER_LABOUR_MARKET'
  },
  hospitality: {
    feeRegimes: ['tourism_corporation', 'tvet_consolidated', 'private_own_rate'],
    expect: 20,
    gap: 'Coverage outside the two Utalii campuses is thin, and Utalii\'s own published fees conflict across sources so every record here is illustrative rather than verified.',
    source: 'KUCCPS Utalii placement March 2026 and September 2026 Ronald Ngala intake'
  },
  built: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 15,
    gap: 'Quantity surveying and land surveying are barely present, and both are numerate routes that would help the thinnest cluster.',
    source: 'NCA contractor and worker accreditation; TVET CDACC construction curricula'
  },
  engineering: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 25,
    gap: '',
    source: 'TVET CDACC engineering curricula; NITA trade tests'
  },
  ict: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 20,
    gap: 'No route covers the online and platform work that is actually absorbing young Kenyans — remote support, BPO, digital freelancing — because none of it has a formal awarded qualification to point at.',
    source: 'TVET CDACC ICT Technician Level 6 and Computer Science Level 6 curricula'
  },
  finance: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 20,
    gap: 'Actuarial and statistics remain degree-only, so a learner without a C+ has no numerate route above certificate level except accountancy.',
    source: 'TVET CDACC Level 5 and 6 business curricula; KASNEB CPA ladder'
  },
  supplychain: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 10,
    gap: 'Clearing and forwarding, a real coastal employer, is not covered at all.',
    source: 'TVET CDACC Supply Chain Management Levels 5 and 6; Store Keeping Level 5'
  },
  admin: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 12,
    gap: '',
    source: 'TVET CDACC Human Resource Management Levels 5 and 6; Office Administration Levels 5 and 6'
  },
  agriculture: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 15,
    gap: 'Bukura publishes only its certificate fee, Baraka and Egerton publish nothing reachable, so most records here carry no figure. Aquaculture and agri-mechanisation are still unsourced.',
    source: 'TVET CDACC agriculture curricula'
  },
  creative: {
    feeRegimes: ['tvet_consolidated', 'public_university', 'private_own_rate'],
    expect: 15,
    gap: '',
    source: 'KIMC programmes; TVET CDACC creative curricula'
  },
  aviation: {
    feeRegimes: ['parastatal_own_rate', 'private_own_rate'],
    expect: 15,
    gap: 'Pilot training is absent: it is licensed separately by KCAA, costs several million shillings, and would be dishonest to list beside a Ksh 67,189 certificate without that context.',
    source: 'KCAA-approved training organisations; EASA and Kenya Aeronautical College published 2026 fees'
  },
  energy: {
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated', 'public_university'],
    expect: 8,
    gap: 'Neither MIOG nor the KenGen centre publishes a fee schedule, so every record here carries a null fee. Much of their provision is short-course and industry-sponsored rather than open entry.',
    source: 'Kenya Pipeline Company MIOG; KenGen Geothermal Training Centre, Olkaria'
  },
  maritime: {
    feeRegimes: ['parastatal_own_rate', 'tourism_corporation'],
    expect: 5,
    gap: 'Statutory STCW certification, medicals and endorsements sit outside the tuition figure and are not costed here.',
    source: 'Bandari Maritime Academy, Kenya Ports Authority'
  },
  water: {
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated'],
    expect: 4,
    gap: 'KEWI publishes no verifiable tuition schedule, so all fees here are null. Its Kitui and Tharaka Nithi campuses are not yet listed.',
    source: 'Kenya Water Institute, established by the KEWI Act 2001'
  },
  transport: {
    feeRegimes: ['parastatal_own_rate', 'tvet_consolidated'],
    expect: 5,
    gap: 'Fee figures circulating for the Railway Training Institute are short-course rates and must not be read as diploma fees; its diploma schedule is unpublished, so those records carry null.',
    source: 'Railway Training Institute; Kenya Institute of Highways and Building Technology'
  },
  legal: {
    feeRegimes: ['public_university', 'private_own_rate'],
    expect: 2,
    gap: 'Only the LLB is present. The paralegal and legal-clerk routes below degree level are unsourced, and the Advocates Training Programme at the Kenya School of Law — the mandatory step after an LLB — is not represented at all.',
    source: 'Council of Legal Education; CUE-chartered law faculties'
  },
  mining: {
    feeRegimes: ['tvet_consolidated', 'parastatal_own_rate', 'public_university'],
    expect: 10,
    /* This note said "three records" until sector assignment became
     * first-match-wins and could be counted properly. The other two were being
     * double-counted under energy — the old register tested every sector's
     * pattern independently, so a geothermal drilling course was mining AND
     * energy AND anything else that matched, and every sector's coverage looked
     * better than it was.
     *
     * The gap was then researched rather than left declared, and the search
     * produced a finding instead of a fix. Kenya's formal mining provision is
     * essentially one university. There is no TVET CDACC mining or quarrying
     * curriculum to point at and no county-polytechnic route that could be
     * sourced. So the floor stays unmet and the gap stays open: adding Taita
     * Taveta closed the "Njia has not looked" half of it and left the half that
     * matters, which is that the country trains almost nobody for this below
     * degree level. */
    gap: 'The fastest-growing sector in the KNBS Economic Survey 2026 — mining and quarrying expanded 14.9% in 2025, ahead of every other sector — and it is degree-or-nothing. Njia now lists Taita Taveta University, Kenya\'s designated mining centre of excellence and effectively its only mining school, but every mining route there is a five-year degree gated behind competitive engineering cluster points. A search for sub-degree provision found none to source: no TVET CDACC mining or quarrying curriculum, and no county polytechnic route. Meanwhile quarrying and small-scale mining employ large numbers informally across Kajiado, Machakos, Taita-Taveta and the coast. The gap is no longer that Njia has not looked; it is that a learner without a C+ has no formal way into the sector adding capacity fastest.',
    source: 'KNBS Economic Survey 2026; TVET CDACC extractives curricula'
  },
  personal: {
    feeRegimes: ['tvet_consolidated', 'private_own_rate'],
    expect: 8,
    gap: '',
    source: 'TVET CDACC beauty and textile curricula; NITA trade tests'
  }
};

/* Load the shipped register rather than restating it. data/sectors.js is a
 * browser global script with a CommonJS tail, so a bare require() would work —
 * but running it through vm keeps this identical to how every other test in
 * this suite loads shipped data, and keeps it working if that tail is ever
 * dropped for payload reasons. */
const shipped = vm.runInNewContext(
  `${fs.readFileSync(path.join(__dirname, '..', 'data', 'sectors.js'), 'utf8')}; ({ SECTORS, ECONOMY, MIN_SECTOR_SAMPLE, sectorForCourse, sectorPace, formalNewJobs })`
);

const missingQa = shipped.SECTORS.filter((s) => !SECTOR_QA[s.id]).map((s) => s.id);
if (missingQa.length) {
  throw new Error(`data/sectors.js ships ${missingQa.join(', ')} with no coverage floor or declared `
    + 'gap in tests/sector-register.js. A sector nobody wrote a floor for is a sector nothing checks.');
}
const orphanQa = Object.keys(SECTOR_QA).filter((id) => !shipped.SECTORS.some((s) => s.id === id));
if (orphanQa.length) {
  throw new Error(`tests/sector-register.js declares ${orphanQa.join(', ')}, which data/sectors.js `
    + 'no longer ships. Remove the stale entry rather than leaving a floor guarding nothing.');
}

const SECTORS = shipped.SECTORS.map((s) => ({ ...s, ...SECTOR_QA[s.id] }));

module.exports = {
  SECTORS,
  FEE_REGIMES,
  DERIVATION_SIGNATURES,
  ECONOMY: shipped.ECONOMY,
  MIN_SECTOR_SAMPLE: shipped.MIN_SECTOR_SAMPLE,
  sectorForCourse: shipped.sectorForCourse,
  sectorPace: shipped.sectorPace,
  formalNewJobs: shipped.formalNewJobs
};
