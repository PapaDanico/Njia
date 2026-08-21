/* Njia — institution directory
 *
 * DATA PROVENANCE NOTICE (read before editing):
 * Institution names, types, locations and accrediting bodies below are
 * real, publicly known Kenyan institutions — safe to treat as factual.
 * However this MVP dataset has NOT been cross-checked line-by-line against
 * live TVETA/CUE registries, so treat `website` as a starting point for
 * verification, not a guarantee of current accreditation status.
 * See data/courses.js for the illustrative-data disclaimer that applies
 * to fees, intake dates and outcomes.
 */

const INSTITUTIONS = [
  { id: 'uon', name: 'University of Nairobi', ownership: 'public', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://uonbi.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'ku', name: 'Kenyatta University', ownership: 'public', type: 'university', location: 'Kahawa, Nairobi', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://ku.ac.ke', modes: ['full_time', 'evening', 'online'], has_workstudy: true, has_hostel: true, fee_regime: 'public_university' },
  { id: 'jkuat', name: 'Jomo Kenyatta University of Agriculture and Technology (JKUAT)', ownership: 'public', type: 'university', location: 'Juja', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://jkuat.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true, fee_regime: 'public_university' },
  { id: 'strathmore', name: 'Strathmore University', ownership: 'private', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://strathmore.edu', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'mku', name: 'Mount Kenya University', ownership: 'private', type: 'university', location: 'Thika', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://mku.ac.ke', modes: ['full_time', 'evening', 'online', 'weekend'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'moi', name: 'Moi University', ownership: 'public', type: 'university', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'CUE Chartered', website: 'https://mu.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'egerton', name: 'Egerton University', ownership: 'public', type: 'university', location: 'Njoro', county: 'Nakuru', accreditation: 'CUE Chartered', website: 'https://egerton.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'public_university' },
  { id: 'maseno', name: 'Maseno University', ownership: 'public', type: 'university', location: 'Maseno', county: 'Kisumu', accreditation: 'CUE Chartered', website: 'https://maseno.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'tuk', name: 'The Technical University of Kenya (TU-K)', ownership: 'public', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://tukenya.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'multimedia', name: 'Multimedia University of Kenya', ownership: 'public', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://mmu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'kmtc', name: 'Kenya Medical Training College (KMTC) — Nairobi Campus', ownership: 'public', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kakamega', name: 'Kenya Medical Training College (KMTC) — Kakamega Campus', ownership: 'public', type: 'tvet', location: 'Kakamega', county: 'Kakamega', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'ntti', name: 'Nairobi Technical Training Institute (NTTI)', ownership: 'public', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://ntti.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: false, fee_regime: 'tvet_consolidated' },
  { id: 'ekp', name: 'Eldoret National Polytechnic', ownership: 'public', type: 'tvet', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'TVETA Registered', website: 'https://eldoretpolytechnic.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'mombasa_poly', name: 'Mombasa Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Mombasa', county: 'Mombasa', accreditation: 'TVETA Registered', website: 'https://mombasapoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kisumu_poly', name: 'Kisumu National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kisumu', county: 'Kisumu', accreditation: 'TVETA Registered', website: 'https://kisumupoly.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'pac', name: 'Pan Africa Christian University (PAC)', ownership: 'private', type: 'university', location: 'Ruaka, Nairobi', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://pau.ac.ke', modes: ['full_time', 'evening', 'weekend'], has_workstudy: true, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'kca', name: 'KCA University', ownership: 'private', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://kcau.ac.ke', modes: ['full_time', 'evening', 'weekend', 'online'], has_workstudy: true, has_hostel: false, fee_regime: 'private_own_rate' },
  /* --- Expansion: further CUE-chartered universities and TVETA-registered
   * national polytechnics, widening county coverage beyond Nairobi/Kiambu.
   * All are real, publicly known institutions; the provenance notice at the
   * top of this file applies to every record here too. --- */
  { id: 'usiu', name: 'United States International University - Africa (USIU-Africa)', ownership: 'private', type: 'university', location: 'Kasarani, Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://usiu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'daystar', name: 'Daystar University', ownership: 'private', type: 'university', location: 'Athi River', county: 'Machakos', accreditation: 'CUE Chartered', website: 'https://daystar.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'cuea', name: 'Catholic University of Eastern Africa (CUEA)', ownership: 'private', type: 'university', location: 'Karen, Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://cuea.edu', modes: ['full_time', 'evening', 'weekend'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'kemu', name: 'Kenya Methodist University (KeMU)', ownership: 'private', type: 'university', location: 'Meru', county: 'Meru', accreditation: 'CUE Chartered', website: 'https://kemu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'dekut', name: 'Dedan Kimathi University of Technology (DeKUT)', ownership: 'public', type: 'university', location: 'Nyeri', county: 'Nyeri', accreditation: 'CUE Chartered', website: 'https://dkut.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'public_university' },
  { id: 'mmust', name: 'Masinde Muliro University of Science and Technology (MMUST)', ownership: 'public', type: 'university', location: 'Kakamega', county: 'Kakamega', accreditation: 'CUE Chartered', website: 'https://mmust.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'tum', name: 'Technical University of Mombasa (TUM)', ownership: 'public', type: 'university', location: 'Mombasa', county: 'Mombasa', accreditation: 'CUE Chartered', website: 'https://tum.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'kisii_uni', name: 'Kisii University', ownership: 'public', type: 'university', location: 'Kisii', county: 'Kisii', accreditation: 'CUE Chartered', website: 'https://kisiiuniversity.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'machakos_uni', name: 'Machakos University', ownership: 'public', type: 'university', location: 'Machakos', county: 'Machakos', accreditation: 'CUE Chartered', website: 'https://mksu.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  { id: 'kiambu_poly', name: 'Kiambu National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kiambu', county: 'Kiambu', accreditation: 'TVETA Registered', website: 'https://kiambupoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'nyeri_poly', name: 'Nyeri National Polytechnic', ownership: 'public', type: 'tvet', location: 'Nyeri', county: 'Nyeri', accreditation: 'TVETA Registered', website: 'https://thenyeripoly.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kabete_poly', name: 'Kabete National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kabete, Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kabetepoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'meru_poly', name: 'Meru National Polytechnic', ownership: 'public', type: 'tvet', location: 'Meru', county: 'Meru', accreditation: 'TVETA Registered', website: 'https://merupoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'sigalagala', name: 'Sigalagala National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kakamega', county: 'Kakamega', accreditation: 'TVETA Registered', website: 'https://sigalagalanationalpolytechnic.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'rvti', name: 'Rift Valley Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'TVETA Registered', website: 'https://rvti.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kimc', name: 'Kenya Institute of Mass Communication (KIMC)', ownership: 'public', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kimc.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'utalii', name: 'Kenya Utalii College', ownership: 'public', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://utalii.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tourism_corporation' },
  /* --- Open University of Kenya: the country's first fully virtual public
   * university (chartered 3 August 2023, based at Konza Technopolis). It
   * matters disproportionately for this audience — no relocation, rolling
   * admission, and published fees well below campus study. --- */
  { id: 'ouk', ownership: 'public', type: 'university', name: 'The Open University of Kenya (OUK)', location: 'Konza Technopolis (fully online)', county: 'Machakos', accreditation: 'CUE Chartered', website: 'https://ouk.ac.ke', modes: ['online'], has_workstudy: false, has_hostel: false, fee_regime: 'public_university' },

  /* --- Further CUE-chartered private universities and private colleges,
   * so the directory is not skewed to public institutions. --- */
  { id: 'kabarak', ownership: 'private', type: 'university', name: 'Kabarak University', location: 'Nakuru', county: 'Nakuru', accreditation: 'CUE Chartered', website: 'https://kabarak.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'anu', ownership: 'private', type: 'university', name: 'Africa Nazarene University (ANU)', location: 'Ongata Rongai', county: 'Kajiado', accreditation: 'CUE Chartered', website: 'https://anu.ac.ke', modes: ['full_time', 'evening', 'weekend'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'zetech', ownership: 'private', type: 'university', name: 'Zetech University', location: 'Ruiru', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://zetech.ac.ke', modes: ['full_time', 'evening', 'weekend'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'riara', ownership: 'private', type: 'university', name: 'Riara University', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://riarauniversity.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'spu', ownership: 'private', type: 'university', name: "St Paul's University", location: 'Limuru', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://spu.ac.ke', modes: ['full_time', 'evening', 'weekend'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'kim', ownership: 'private', type: 'tvet', name: 'Kenya Institute of Management (KIM)', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kim.ac.ke', modes: ['full_time', 'evening', 'weekend', 'online'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'nibs', ownership: 'private', type: 'tvet', name: 'Nairobi Institute of Business Studies (NIBS)', location: 'Ruiru', county: 'Kiambu', accreditation: 'TVETA Registered', website: 'https://nibs.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'kmtc_turkana', name: 'Kenya Medical Training College (KMTC) — Lodwar Campus', ownership: 'public', type: 'tvet', location: 'Lodwar', county: 'Turkana', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_west_pokot', name: 'Kenya Medical Training College (KMTC) — Kapenguria Campus', ownership: 'public', type: 'tvet', location: 'Kapenguria', county: 'West Pokot', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_marsabit', name: 'Kenya Medical Training College (KMTC) — Marsabit Campus', ownership: 'public', type: 'tvet', location: 'Marsabit', county: 'Marsabit', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_wajir', name: 'Kenya Medical Training College (KMTC) — Wajir Campus', ownership: 'public', type: 'tvet', location: 'Wajir', county: 'Wajir', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_mandera', name: 'Kenya Medical Training College (KMTC) — Mandera Campus', ownership: 'public', type: 'tvet', location: 'Mandera', county: 'Mandera', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_nyamira', name: 'Kenya Medical Training College (KMTC) — Nyamira Campus', ownership: 'public', type: 'tvet', location: 'Nyamira', county: 'Nyamira', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_baringo', name: 'Kenya Medical Training College (KMTC) — Kabarnet Campus', ownership: 'public', type: 'tvet', location: 'Kabarnet', county: 'Baringo', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_embu', name: 'Kenya Medical Training College (KMTC) — Embu Campus', ownership: 'public', type: 'tvet', location: 'Embu', county: 'Embu', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kitui', name: 'Kenya Medical Training College (KMTC) — Kitui Campus', ownership: 'public', type: 'tvet', location: 'Kitui', county: 'Kitui', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_garissa', name: 'Kenya Medical Training College (KMTC) — Garissa Campus', ownership: 'public', type: 'tvet', location: 'Garissa', county: 'Garissa', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kericho', name: 'Kenya Medical Training College (KMTC) — Kericho Campus', ownership: 'public', type: 'tvet', location: 'Kericho', county: 'Kericho', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_bomet', name: 'Kenya Medical Training College (KMTC) — Bomet Campus', ownership: 'public', type: 'tvet', location: 'Bomet', county: 'Bomet', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_homabay', name: 'Kenya Medical Training College (KMTC) — Homa Bay Campus', ownership: 'public', type: 'tvet', location: 'Homa Bay', county: 'Homa Bay', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_siaya', name: 'Kenya Medical Training College (KMTC) — Siaya Campus', ownership: 'public', type: 'tvet', location: 'Siaya', county: 'Siaya', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_migori', name: 'Kenya Medical Training College (KMTC) — Migori Campus', ownership: 'public', type: 'tvet', location: 'Migori', county: 'Migori', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kilifi', name: 'Kenya Medical Training College (KMTC) — Kilifi Campus', ownership: 'public', type: 'tvet', location: 'Kilifi', county: 'Kilifi', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kwale', name: 'Kenya Medical Training College (KMTC) — Msambweni Campus', ownership: 'public', type: 'tvet', location: 'Msambweni', county: 'Kwale', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_lamu', name: 'Kenya Medical Training College (KMTC) — Lamu Campus', ownership: 'public', type: 'tvet', location: 'Lamu', county: 'Lamu', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_muranga', name: 'Kenya Medical Training College (KMTC) — Murang\'a Campus', ownership: 'public', type: 'tvet', location: 'Murang\'a', county: 'Murang\'a', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_bungoma', name: 'Kenya Medical Training College (KMTC) — Bungoma Campus', ownership: 'public', type: 'tvet', location: 'Bungoma', county: 'Bungoma', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_busia', name: 'Kenya Medical Training College (KMTC) — Busia Campus', ownership: 'public', type: 'tvet', location: 'Busia', county: 'Busia', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_vihiga', name: 'Kenya Medical Training College (KMTC) — Vihiga Campus', ownership: 'public', type: 'tvet', location: 'Vihiga', county: 'Vihiga', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_nandi', name: 'Kenya Medical Training College (KMTC) — Kapsabet Campus', ownership: 'public', type: 'tvet', location: 'Kapsabet', county: 'Nandi', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_narok', name: 'Kenya Medical Training College (KMTC) — Narok Campus', ownership: 'public', type: 'tvet', location: 'Narok', county: 'Narok', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_makueni', name: 'Kenya Medical Training College (KMTC) — Makueni Campus', ownership: 'public', type: 'tvet', location: 'Makueni', county: 'Makueni', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_nyandarua', name: 'Kenya Medical Training College (KMTC) — Nyandarua Campus', ownership: 'public', type: 'tvet', location: 'Nyandarua', county: 'Nyandarua', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_laikipia', name: 'Kenya Medical Training College (KMTC) — Nyahururu Campus', ownership: 'public', type: 'tvet', location: 'Nyahururu', county: 'Laikipia', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_transnzoia', name: 'Kenya Medical Training College (KMTC) — Kitale Campus', ownership: 'public', type: 'tvet', location: 'Kitale', county: 'Trans Nzoia', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_isiolo', name: 'Kenya Medical Training College (KMTC) — Isiolo Campus', ownership: 'public', type: 'tvet', location: 'Isiolo', county: 'Isiolo', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_taita', name: 'Kenya Medical Training College (KMTC) — Wundanyi Campus', ownership: 'public', type: 'tvet', location: 'Wundanyi', county: 'Taita-Taveta', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_tanariver', name: 'Kenya Medical Training College (KMTC) — Hola Campus', ownership: 'public', type: 'tvet', location: 'Hola', county: 'Tana River', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_tharaka', name: 'Kenya Medical Training College (KMTC) — Chuka Campus', ownership: 'public', type: 'tvet', location: 'Chuka', county: 'Tharaka-Nithi', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_marakwet', name: 'Kenya Medical Training College (KMTC) — Iten Campus', ownership: 'public', type: 'tvet', location: 'Iten', county: 'Elgeyo-Marakwet', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kisumu', name: 'Kenya Medical Training College (KMTC) — Kisumu Campus', ownership: 'public', type: 'tvet', location: 'Kisumu', county: 'Kisumu', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_mombasa', name: 'Kenya Medical Training College (KMTC) — Port Reitz, Mombasa Campus', ownership: 'public', type: 'tvet', location: 'Port Reitz, Mombasa', county: 'Mombasa', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_nakuru', name: 'Kenya Medical Training College (KMTC) — Nakuru Campus', ownership: 'public', type: 'tvet', location: 'Nakuru', county: 'Nakuru', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_thika', name: 'Kenya Medical Training College (KMTC) — Thika Campus', ownership: 'public', type: 'tvet', location: 'Thika', county: 'Kiambu', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_machakos', name: 'Kenya Medical Training College (KMTC) — Machakos Campus', ownership: 'public', type: 'tvet', location: 'Machakos', county: 'Machakos', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_meru', name: 'Kenya Medical Training College (KMTC) — Meru Campus', ownership: 'public', type: 'tvet', location: 'Meru', county: 'Meru', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_nyeri', name: 'Kenya Medical Training College (KMTC) — Nyeri Campus', ownership: 'public', type: 'tvet', location: 'Nyeri', county: 'Nyeri', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kajiado', name: 'Kenya Medical Training College (KMTC) — Kajiado Campus', ownership: 'public', type: 'tvet', location: 'Kajiado', county: 'Kajiado', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_kisii', name: 'Kenya Medical Training College (KMTC) — Kisii Campus', ownership: 'public', type: 'tvet', location: 'Kisii', county: 'Kisii', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },
  { id: 'kmtc_eldoret', name: 'Kenya Medical Training College (KMTC) — Eldoret Campus', ownership: 'public', type: 'tvet', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'kmtc' },

  /* THE LAST TWO COUNTIES.
   *
   * KMTC's 98 campuses carried this catalogue from 12 counties to 45, and the
   * two it does not serve were the two Njia could not reach: Kirinyaga and
   * Samburu. Both were left open as "structurally hard" — which was true only
   * of the KMTC route, not of the counties. Each has a registered public TVET
   * college of its own.
   *
   * Samburu matters most. It is among the counties where a young person is
   * least likely to be within reach of any tertiary institution, and a
   * catalogue that silently returned nothing for Samburu told them there was
   * nothing — when Archers Post has a public college running diplomas. */
  { id: 'mweatvc', name: 'Mwea Technical and Vocational College', ownership: 'public', type: 'tvet', location: "Wang'uru", county: 'Kirinyaga', accreditation: 'TVETA Registered', website: 'https://mweatvc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'samburutvc', name: 'Samburu Technical and Vocational College', ownership: 'public', type: 'tvet', location: 'Archers Post', county: 'Samburu', accreditation: 'TVETA Registered', website: 'https://kuccps.net', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  /* A county vocational training centre rather than a college or polytechnic
   * — the tier below TVC, and for most of rural Kenya the only formal trade
   * training within reach. Capped at 20 trainees per course, which is why
   * the trades it teaches are worth naming individually rather than assuming
   * a learner can get any of them. */
  /* Two faith-based providers, added because the artisan tier had a floor
   * below its floor. Both admit on KCPE alone or with no KCSE at all, which
   * is a rung below the KUCCPS artisan minimum of grade E and the only
   * documented route for a learner who never sat, or did not finish, Form
   * Four. Mission and diocesan centres are a large part of Kenyan artisan
   * training and none were in the catalogue. */
  { id: 'citc_mombasa', name: 'Christian Industrial Training Centre (CITC) Mombasa', ownership: 'private', type: 'tvet', location: "Sheikh Abdulla F. Road", county: 'Mombasa', accreditation: 'KNEC and NITA training and examination centre', website: 'https://citcmombasa.co.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'ymca_nti', name: 'YMCA National Training Institute, Shauri Moyo', ownership: 'private', type: 'tvet', location: 'Ambira Road off Jogoo Road, Shauri Moyo', county: 'Nairobi', accreditation: 'NITA trade-testing centre (YMCA Kenya, founded 1966)', website: 'https://www.ymca-nti.org', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'stkizito', name: 'St. Kizito Vocational Training Institute', ownership: 'private', type: 'tvet', location: 'Githurai Kimbo', county: 'Kiambu', accreditation: 'KNEC examination centre (Catholic, founded on Cardinal Otunga initiative 1990)', website: 'https://stkizito.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'donbosco_karen', name: 'Don Bosco Boys Technical Training Centre', ownership: 'private', type: 'tvet', location: 'Langata-Karen Road, Karen', county: 'Nairobi', accreditation: 'TVETA Registered · NITA-accredited trades (Salesians of Don Bosco)', website: 'https://donboscoboystown.org', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  { id: 'citc_nairobi', name: 'Christian Industrial Training Centre (CITC) Nairobi', ownership: 'private', type: 'tvet', location: 'Pumwani, Meru Road', county: 'Nairobi', accreditation: 'KNEC and NITA training and examination centre (Anglican Church of Kenya, Diocese of Nairobi)', website: 'https://citcnairobi.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'maralalvtc', name: 'Maralal Vocational Training Centre', ownership: 'public', type: 'tvet', location: 'Maralal', county: 'Samburu', accreditation: 'TVETA Registered (TVETA/PUBLIC/VTC/0090/2018)', website: 'https://tveta.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'tvet_consolidated' },

  /* Vocational Training Centres — the tier below the polytechnics, and the one
   * that actually admits at the bottom of the range. County VTCs (still widely
   * called youth or village polytechnics) are TVETA-regulated and mostly take
   * KCPE graduates or KCSE D- and E, which is a full grade band below what the
   * national polytechnics publish.
   *
   * Both counties below previously held a KMTC campus and nothing else, so
   * their entire catalogue presence taught medicine at entry bars a low-scoring
   * learner cannot reach. These are their first non-medical, low-entry
   * institutions. */
  { id: 'kitalevtc', name: 'Kitale Vocational Training Centre', ownership: 'public', type: 'tvet', location: 'Kitale', county: 'Trans Nzoia', accreditation: 'Public Vocational Training Centre · KNEC and NITA examination centre', website: 'https://transnzoia.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'tvet_consolidated' },
  { id: 'kilifisaidia', name: 'Kilifi Saidia College', ownership: 'private', type: 'tvet', location: 'Kilifi', county: 'Kilifi', accreditation: 'TVETA Registered and Licensed · NITA trade-test centre', website: 'https://tveta.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  /* Opening for its pioneer intake in September 2026 with roughly 1,000 places,
   * placed through KUCCPS. A brand-new public hospitality college on the coast
   * matters disproportionately here: Kilifi previously offered one private
   * college in this catalogue, and hospitality is the sector its local economy
   * actually runs on. Like its Nairobi parent it is a Ministry of Tourism state
   * corporation, so it is NOT on the consolidated public-TVET fee. */
  /* PARASTATAL AND INDUSTRY-OWNED TRAINING INSTITUTES.
   *
   * An entire tier Njia had missed. These are training arms owned by the
   * employer: the civil aviation authority, the pipeline company, KenGen, the
   * ports authority, the railway, the roads department, the revenue authority,
   * the water sector. They train for one industry, and that industry is sitting
   * in the room. For employment linkage they are among the strongest routes in
   * Kenyan training, and none of them appeared here.
   *
   * They are also their own fee regime: each is a state corporation under a
   * line ministry setting its own charges, so the consolidated Ksh 67,189 rate
   * does not apply to any of them. Several publish no fee schedule at all,
   * which is recorded as a null rather than a guess. */
  { id: 'easa', name: 'East African School of Aviation (EASA)', ownership: 'public', type: 'tvet', location: 'Embakasi, Nairobi', county: 'Nairobi', accreditation: 'Training directorate of the Kenya Civil Aviation Authority (KCAA) · ICAO/IATA accredited', website: 'https://easa.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kac', name: 'Kenya Aeronautical College', ownership: 'private', type: 'tvet', location: 'Wilson Airport, Nairobi', county: 'Nairobi', accreditation: 'Approved and licensed by the Kenya Civil Aviation Authority (KCAA)', website: 'https://kenyaaeronauticalcollege.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'parastatal_own_rate' },
  { id: 'miog', name: 'Morendat Institute of Oil and Gas (MIOG)', ownership: 'public', type: 'tvet', location: 'Naivasha', county: 'Nakuru', accreditation: 'Kenya Pipeline Company centre of excellence · TVETA registered national polytechnic', website: 'https://miog.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kengen_gtc', name: 'KenGen Geothermal Training Centre', ownership: 'public', type: 'tvet', location: 'Olkaria', county: 'Nakuru', accreditation: 'KenGen centre of excellence · TVETA registered', website: 'https://kengen-gtc.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kewi', name: 'Kenya Water Institute (KEWI) — Nairobi', ownership: 'public', type: 'tvet', location: 'South C, Nairobi', county: 'Nairobi', accreditation: 'Established by the KEWI Act 2001 · TVETA registered', website: 'https://kewi.go.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kewi_kisumu', name: 'Kenya Water Institute (KEWI) — Kisumu Campus', ownership: 'public', type: 'tvet', location: 'Kisumu', county: 'Kisumu', accreditation: 'Established by the KEWI Act 2001 · TVETA registered', website: 'https://kewi.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'rti', name: 'Railway Training Institute (RTI)', ownership: 'public', type: 'tvet', location: 'South B, Nairobi', county: 'Nairobi', accreditation: 'Public TVET institution under the Ministry of Transport · TVETA registered', website: 'https://rti.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'bandari', name: 'Bandari Maritime Academy', ownership: 'public', type: 'tvet', location: 'Mombasa', county: 'Mombasa', accreditation: 'Kenya Ports Authority maritime academy · Kenya Maritime Authority approved', website: 'https://bandari.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kihbt', name: 'Kenya Institute of Highways and Building Technology (KIHBT)', ownership: 'public', type: 'tvet', location: 'Ngong Road, Nairobi', county: 'Nairobi', accreditation: 'State Department for Roads, Ministry of Roads and Transport · TVETA registered', website: 'https://kihbt.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'kesra', name: 'Kenya School of Revenue Administration (KESRA)', ownership: 'public', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'Kenya Revenue Authority training school · KASNEB and WCO accredited', website: 'https://kesra.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'parastatal_own_rate' },
  /* Employer-run and NGO-run training that is neither a polytechnic nor a
   * university. KQ Pride Centre is Kenya Airways' own academy and the first
   * training facility in Africa to hold IATA's dangerous-goods excellence
   * certification; Amref is a chartered university run by an African health
   * NGO; the Red Cross institute trains paramedics, a route that appears
   * nowhere else in this catalogue. */
  { id: 'harmonics', name: 'Harmonics Air Centre', ownership: 'private', type: 'tvet', location: 'Wilson Airport, Nairobi', county: 'Nairobi', accreditation: 'KCAA Approved Training Organisation · trains to EU Aviation Safety Agency Part-66 module examinations', website: 'https://harmonicsaircentre.com', modes: ['full_time'], has_workstudy: true, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'kqpride', name: 'Kenya Airways Pride Centre', ownership: 'private', type: 'tvet', location: 'Embakasi, Nairobi', county: 'Nairobi', accreditation: 'KCAA-approved aviation security training centre · IATA and ICAO accredited', website: 'https://kqpridecentre.com', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'amiu', name: 'Amref International University (AMIU)', ownership: 'private', type: 'university', location: 'Lang\'ata, Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered · run by Amref Health Africa', website: 'https://amref.ac.ke', modes: ['full_time', 'online'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'krcti', name: 'Kenya Red Cross Training Institute', ownership: 'private', type: 'tvet', location: 'South C, Nairobi', county: 'Nairobi', accreditation: 'Kenya Red Cross Society · TVETA registered', website: 'https://redcross.or.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  /* AGRICULTURE, THE LARGEST EMPLOYER AND THE THINNEST SECTOR HERE.
   *
   * Njia carried three agriculture records in a catalogue of 371, for the
   * sector that employs more Kenyans than any other. Bukura is a state
   * corporation established by an Act of Parliament and the country's main
   * middle-level agricultural college; Baraka is a TVETA-registered private
   * college at Molo teaching the CDACC sustainable-agriculture curricula.
   * Egerton was already in this directory with no courses attached at all —
   * Kenya's foremost agricultural university, listed and unusable. */
  { id: 'bukura', name: 'Bukura Agricultural College', ownership: 'public', type: 'tvet', location: 'Bukura, Kakamega', county: 'Kakamega', accreditation: 'State corporation established by an Act of Parliament · KUCCPS placement', website: 'https://bukuracollege.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'baraka', name: 'Baraka Agricultural College', ownership: 'private', type: 'tvet', location: 'Molo', county: 'Nakuru', accreditation: 'TVETA registered and licensed · TVET CDACC assessed', website: 'https://barakaagricollege.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'private_own_rate' },
  /* AGRICULTURE WHERE THE ECONOMY ACTUALLY IS.
   *
   * The gap analysis found 31 of 47 counties offering exactly ONE interest
   * cluster, and the thinnest — Turkana, Wajir, Mandera, Marsabit — offered a
   * KMTC nursing diploma and a KMTC health certificate, nothing else. Those are
   * pastoralist and agricultural economies being shown nursing or nothing.
   *
   * The Livestock Training Institute at Griftu is the answer to Wajir
   * specifically: a government institute 70km from Wajir town, upgraded from
   * the 1968 Griftu Pastoral Training Centre by executive order in September
   * 2016, which has trained tens of thousands of pastoralists in the trade the
   * county actually runs on. It was missing from a catalogue that had four
   * aviation schools.
   *
   * Kenya School of Agriculture is a TVETA-licensed college under the State
   * Department for Crops Development, KNEC-examined, running campuses that
   * include Ugenya in Siaya — another single-cluster county. Only campuses
   * confirmed across sources are listed; several more ATCs exist and are named
   * as a declared gap rather than guessed at. */
  { id: 'lti_wajir', name: 'Livestock Training Institute, Wajir (Griftu)', ownership: 'public', type: 'tvet', location: 'Griftu, Wajir West', county: 'Wajir', accreditation: 'Government institute established by executive order 2016 · formerly Griftu Pastoral Training Centre (1968)', website: 'https://ltiwajir.go.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'ksa_wambugu', name: 'Kenya School of Agriculture — Wambugu Campus', ownership: 'public', type: 'tvet', location: 'Wambugu Farm, Nyeri', county: 'Nyeri', accreditation: 'State Department for Crops Development · TVETA licensed · KNEC examined', website: 'https://ksa.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'ksa_ugenya', name: 'Kenya School of Agriculture — Ugenya Campus', ownership: 'public', type: 'tvet', location: 'Ugenya', county: 'Siaya', accreditation: 'State Department for Crops Development · TVETA licensed · KNEC examined', website: 'https://ksa.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'ksa_papkonam', name: 'Kenya School of Agriculture — Pap Konam Campus', ownership: 'public', type: 'tvet', location: 'Pap Konam', county: 'Kisumu', accreditation: 'State Department for Crops Development · TVETA licensed · KNEC examined', website: 'https://ksa.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'ksa_ainabkoi', name: 'Kenya School of Agriculture — Ainabkoi Campus', ownership: 'public', type: 'tvet', location: 'Ainabkoi', county: 'Uasin Gishu', accreditation: 'State Department for Crops Development · TVETA licensed · KNEC examined', website: 'https://ksa.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'parastatal_own_rate' },
  { id: 'rnuc', name: 'Ronald Ngala Utalii College', ownership: 'public', type: 'tvet', location: 'Kilifi', county: 'Kilifi', accreditation: 'State corporation under the Ministry of Tourism · KUCCPS placement', website: 'https://utalii.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true, fee_regime: 'tourism_corporation' },

  /* TEACHER TRAINING COLLEGES — a whole institution type the catalogue was
   * missing. Njia held zero TTCs against roughly 35 nationally, while teaching
   * is one of the largest destinations for a C-grade learner.
   *
   * Four of the six below sit in counties where Njia's only institution was a
   * KMTC campus. That was true of 31 of 47 counties: the 47/47 coverage figure
   * is two-thirds carried by one medical college, so in most of the country a
   * learner who did not want nursing had nothing local to look at.
   *
   * Only colleges whose county could be confirmed from a source are listed.
   * Several more are named in the national lists — Kamwenja, Shanzu, Thogoto,
   * Bondo, Kaimosi, Mosoriot, Chesta, Galana, Tarbaj and others — with no
   * county attached in anything found, and guessing from the place name would
   * put a college in the wrong county on a filter learners rely on. */
  { id: 'aberdare_ttc', name: 'Aberdare Teachers Training College', ownership: 'public', type: 'ttc', location: 'Nyandarua', county: 'Nyandarua', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  { id: 'tambach_ttc', name: 'Tambach Teachers Training College', ownership: 'public', type: 'ttc', location: 'Tambach', county: 'Elgeyo-Marakwet', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  { id: 'asumbi_ttc', name: 'Asumbi Teachers Training College', ownership: 'public', type: 'ttc', location: 'Asumbi', county: 'Homa Bay', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  { id: 'kigari_ttc', name: "St. Mark's Teachers Training College, Kigari", ownership: 'public', type: 'ttc', location: 'Kigari', county: 'Embu', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  { id: 'eregi_ttc', name: "St. Augustine Teachers Training College, Eregi", ownership: 'public', type: 'ttc', location: 'Eregi', county: 'Kakamega', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  { id: 'kilimambogo_ttc', name: "St. John's Teachers Training College, Kilimambogo", ownership: 'public', type: 'ttc', location: 'Kilimambogo', county: 'Kiambu', accreditation: 'Public TTC · approved for the Diploma in Primary Teacher Education (KNEC assessed)', website: 'https://tsc.go.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'ttc_consolidated' },
  /* THE ONLY MINING SCHOOL IN THE COUNTRY, AND IT WAS NOT IN THE CATALOGUE.
   *
   * Mining and quarrying grew 14.9% in 2025, faster than any other sector in
   * the KNBS Economic Survey, and Njia held exactly one record that touched it
   * — a geothermal drilling certificate. Searching for the training routes
   * turned up something more useful than a sourcing gap: Kenya's formal mining
   * provision is essentially this one university, and it is degree-only.
   *
   * TTU is CUE-chartered, KUCCPS institution 1091, and describes itself as the
   * pioneer institution for mining and mineral processing engineering in the
   * region; the government has designated it a mining centre of excellence. */
  { id: 'ttu', name: 'Taita Taveta University', ownership: 'public', type: 'university', location: 'Voi', county: 'Taita-Taveta', accreditation: 'CUE Chartered · KUCCPS institution 1091 · designated mining centre of excellence', website: 'https://ttu.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'public_university' },
  /* FAITH-BASED PROVISION, AND THE HALF OF IT THAT WAS MISSING.
   *
   * An audit prompted by a reader's question found twelve Christian-linked
   * institutions already listed — CUEA, St Kizito, Baraka, three Catholic
   * teacher training colleges — and not one Muslim institution anywhere in the
   * catalogue. Njia serves the whole country, including the coast and the
   * north-east, and it was showing those learners nothing from their own
   * institutions.
   *
   * Umma is the first Islamic chartered university in Kenya, and it sits in
   * Kajiado — one of the pastoralist counties this catalogue has been working
   * to reach. Uzima is the Catholic gap on the other side: an Archdiocese of
   * Kisumu foundation, CUEA-affiliated, accredited by the Clinical Officers
   * Council, and one of the few places offering a clinical medicine diploma
   * outside KMTC.
   *
   * Both are private and set their own fees. Neither publishes a schedule
   * reachable from here, so every record carries no figure rather than a
   * guessed one. */
  { id: 'umma', name: 'Umma University', ownership: 'private', type: 'university', location: 'Kajiado (Nairobi–Namanga highway), with a Thika campus', county: 'Kajiado', accreditation: 'CUE Chartered · KUCCPS-approved · the first Islamic chartered university in Kenya', website: 'https://umma.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  /* THE ROUTE THE REGISTER SAID DID NOT EXIST.
   *
   * tests/sector-register.js declared the ICT gap as "no route covers the
   * online and platform work that is actually absorbing young Kenyans...
   * because none of it has a formal awarded qualification to point at". The
   * second half of that was true and the first half was not: Ajira Digital is
   * a government programme run by the ICT Authority, with free walk-in youth
   * empowerment centres at county level and clubs inside universities and TVET
   * institutions, and it is aimed squarely at the gig and freelancing work the
   * register said Njia could not show anyone.
   *
   * It matters most to exactly the reader this catalogue serves worst: no
   * grade requirement, no fee, and available without relocating. Leaving it out
   * because it does not award a KNQF qualification was letting a filing rule
   * decide what a jobless nineteen-year-old gets told about.
   *
   * County is set to Nairobi because that is where the ICT Authority sits, but
   * the centres are national — the course records say so, since a county field
   * cannot. */
  { id: 'ajira', name: 'Ajira Digital Programme (ICT Authority)', ownership: 'public', type: 'tvet', location: 'Youth Empowerment Centres in counties nationwide, plus clubs in universities and TVET institutes', county: 'Nairobi', accreditation: 'Government programme of the ICT Authority, Ministry of ICT · issues a programme certificate, NOT a KNQF-awarded qualification', website: 'https://ajiradigital.go.ke', modes: ['full_time', 'online'], has_workstudy: false, has_hostel: false, fee_regime: 'parastatal_own_rate' },
  /* KESRA's coastal campus. The register declared clearing and forwarding "a
   * real coastal employer, not covered at all", and the licence that governs it
   * is taught at Mombasa as well as Nairobi — listing only Nairobi would send a
   * Mombasa learner across the country for a course running down the road. */
  { id: 'kesra_mombasa', name: 'Kenya School of Revenue Administration (KESRA) — Mombasa Campus', ownership: 'public', type: 'tvet', location: 'Mombasa', county: 'Mombasa', accreditation: 'Kenya Revenue Authority training school · KASNEB and WCO accredited', website: 'https://kesra.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'parastatal_own_rate' },
  /* The insurance route, and one of the lowest entry bars in the catalogue.
   *
   * The register declared the finance gap as "a learner without a C+ has no
   * numerate route above certificate level except accountancy". The College of
   * Insurance answers part of that: its Certificate of Proficiency takes a D-,
   * which is lower than almost anything else here that leads to a professional
   * body, and the certificate ladders into a Kenyan diploma and then the London
   * CII qualifications. */
  { id: 'coi', name: 'College of Insurance', ownership: 'private', type: 'college', location: 'Red Cross Road, South C, Nairobi', county: 'Nairobi', accreditation: 'Established 1990 · the insurance industry\'s own training college for East and Central Africa · pathway to Kenyan and London (CII) insurance qualifications', website: 'https://coi.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  /* THE COUNTY WITH TWO COURSES.
   *
   * An audit of cluster spread found 28 counties where a learner sees exactly
   * one kind of work, and 24 of those are a single KMTC campus offering two
   * health courses and nothing else. Turkana, Mandera, Garissa, Lamu, Tana
   * River — the catalogue holds 413 courses and shows those readers two, while
   * the Decide page tells them TVET placement runs "across 251 public
   * colleges". Njia was naming the number and then hiding the colleges.
   *
   * North Eastern National Polytechnic is the fix for one of them, and it is a
   * national polytechnic rather than a small institute: twenty departments,
   * KUCCPS institution 1230, placing 2020-2025 KCSE graduates. It takes Garissa
   * from two health courses to a spread across trades, IT and business.
   *
   * The other 23 counties are NOT fixed by this. What ships alongside is a
   * notice that says so to the reader's face rather than letting a thin county
   * read as an empty one. */
  { id: 'nenap', name: 'North Eastern National Polytechnic (NENAP)', ownership: 'public', type: 'tvet', location: 'Innovation Campus, Garissa Township', county: 'Garissa', accreditation: 'Government-accredited national polytechnic · TVETA registered · KUCCPS institution 1230', website: 'https://northeasternpoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'uzima', name: 'Uzima University', ownership: 'private', type: 'university', location: 'Kisumu', county: 'Kisumu', accreditation: 'CUE accredited · CUEA-affiliated · Clinical Officers Council accredited · founded by the Archdiocese of Kisumu', website: 'https://uzimauniversity.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'private_own_rate' },
  /* THE FOUR COUNTIES WHERE A D-GRADE LEARNER SAW NOTHING.
   *
   * An audit found 23 counties whose entire catalogue was one KMTC campus
   * offering two nursing programmes at C+ and D+. That is not merely thin —
   * it is a closed door. A school-leaver in Turkana with a D or an E opened
   * Decide, filtered to their county and their grade, and Njia showed them
   * nothing at all, which reads as "there is nothing for you here". The
   * learners least able to relocate were the ones being told to.
   *
   * Every county in Kenya has public technical provision; Njia simply had not
   * listed it. These four are the hardest-hit counties, each with a real
   * TVETA-registered institution found by naming the county and searching per
   * institution. All four run artisan courses with open or E-grade entry,
   * which is the floor that matters. */
  { id: 'lodwar_tvc', name: 'Lodwar Technical and Vocational College', ownership: 'public', type: 'tvet', location: 'Lodwar', county: 'Turkana', accreditation: 'TVETA-registered public TVET college \u00b7 KNEC and CDACC examined', website: 'https://lodwartvc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'mandera_tti', name: 'Mandera Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Mandera', county: 'Mandera', accreditation: 'Public technical training institute \u00b7 TVETA registered \u00b7 KNEC examined \u00b7 KUCCPS placement', website: null, modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kitelakapel_tti', name: 'Kitelakapel Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Kitelakapel, Kapenguria', county: 'West Pokot', accreditation: 'Public technical training institute \u00b7 TVETA registered \u00b7 KUCCPS institution 4255', website: 'https://kitelakapeltti.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'laisamis_tvc', name: 'Laisamis Technical and Vocational College', ownership: 'public', type: 'tvet', location: 'Laisamis, Isiolo-Marsabit highway', county: 'Marsabit', accreditation: 'Public institution established and registered under the TVET Act \u00b7 KUCCPS placement', website: 'https://laisamistech.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' }
,
  { id: 'baringo_tech', name: 'Baringo Technical College', ownership: 'public', type: 'tvet', location: 'Kapsoo, Kabarnet-Tenges Road, 6km from Kabarnet town', county: 'Baringo', accreditation: 'Public TVET college registered under the TVET Act · KUCCPS placement', website: 'https://baringotechnicalcollege.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'bumbe_tti', name: 'Bumbe Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Funyula, Samia', county: 'Busia', accreditation: 'Public TVET institute registered under the TVET Act · KNEC and TVET CDACC examined', website: 'https://bumbepoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kaiboi_poly', name: 'Kaiboi National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kaiboi, Mosoriot, Nandi', county: 'Nandi', accreditation: 'National polytechnic · upgraded from Kaiboi Technical Training Institute in 2024 · KUCCPS placement', website: 'https://kaiboitech.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'kisii_poly', name: 'Kisii National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kisii town', county: 'Kisii', accreditation: 'National polytechnic - examined by TVET CDACC, KNEC, NITA and KASNEB - KUCCPS placement', website: 'https://kisiipoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'taita_poly', name: 'Taita Taveta National Polytechnic', ownership: 'public', type: 'tvet', location: 'Tsavo area, 2km from Voi town', county: 'Taita-Taveta', accreditation: 'National polytechnic - formerly Coast Institute of Technology - examined by KNEC, KASNEB and CDACC', website: 'https://ttnp.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'michuki_poly', name: 'Michuki National Polytechnic', ownership: 'public', type: 'tvet', location: 'Kangema, Murang-a', county: 'Murang\'a', accreditation: 'National polytechnic - formerly Michuki Technical Training Institute - KNEC examined', website: 'https://michukitech.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'siaya_poly', name: 'Siaya National Polytechnic', ownership: 'public', type: 'tvet', location: 'Siaya town', county: 'Siaya', accreditation: 'National polytechnic - formerly Siaya Institute of Technology - KNEC examined, transitioning to CBET', website: 'https://siayapolytechnic.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'bungoma_poly', name: 'Bungoma National Polytechnic', ownership: 'public', type: 'tvet', location: 'Bungoma town', county: 'Bungoma', accreditation: 'National polytechnic - artisan, certificate, diploma and higher diploma - KUCCPS placement', website: 'https://bungomapoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'bureti_tti', name: 'Bureti Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Bureti, Sotik road', county: 'Kericho', accreditation: 'Public TVET institute recognised by the Ministry of Education and TVETA', website: 'https://buretitti.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'mawego_poly', name: 'Mawego National Polytechnic', ownership: 'public', type: 'tvet', location: 'Rachuonyo North Sub-County', county: 'Homa Bay', accreditation: 'National polytechnic from 1 January 2024, elevated from Mawego Technical Training Institute by the Ministry of Education Directorate of TVET - artisan, craft and diploma, KUCCPS placement', website: 'https://mawegopoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'masai_tti', name: 'Masai Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Kajiado town', county: 'Kajiado', accreditation: 'Public TVET institution registered by TVETA, teaching technical courses since 1986 across seven academic departments - artisan, craft and diploma, KUCCPS placement', website: 'https://masaitti.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'sagana_tti', name: 'Sagana Technical Training Institute', ownership: 'private', type: 'tvet', location: 'Sagana town, on the Sagana-Embu road', county: 'Kirinyaga', accreditation: 'Private technical and vocational college registered and licensed by TVETA, licence TVETA/PRIVATE/TVC/0059/2016 - artisan and craft courses', website: 'https://saganatechnical.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'nyandarua_poly', name: 'Nyandarua National Polytechnic', ownership: 'public', type: 'tvet', location: 'Ol Kalou', county: 'Nyandarua', accreditation: 'National polytechnic - legally empowered to train and award artisan, craft, diploma and higher diploma qualifications, KUCCPS placement', website: 'https://nyandaruapoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' },
  { id: 'gretsa', name: 'Gretsa University', ownership: 'private', type: 'university', location: 'Thika, on the Thika-Garissa road', county: 'Kiambu', accreditation: 'CUE Chartered - full charter awarded November 2025, replacing the letter of interim authority held since 2006, making it the 31st chartered private university in Kenya', website: 'https://gretsauniversity.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: false, fee_regime: 'private_own_rate' },
  { id: 'ksl', name: 'Kenya School of Law', ownership: 'public', type: 'college', location: 'Karen campus, and the Nairobi Town campus on Moi Avenue', county: 'Nairobi', accreditation: 'State corporation established under the Kenya School of Law Act; the Diploma in Law (Paralegal Studies) is placed through KUCCPS', website: 'https://www.ksl.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: false, fee_regime: 'parastatal_own_rate' },
  { id: 'konoin_tti', name: 'Konoin Technical Training Institute', ownership: 'public', type: 'tvet', location: 'Mogogosiek, Konoin Sub-County', county: 'Bomet', accreditation: 'Public TVET institution under the Ministry of Education, registered and accredited by TVETA under the TVET Act No. 29 of 2013', website: 'https://konointti.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true, fee_regime: 'tvet_consolidated' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INSTITUTIONS };
}
