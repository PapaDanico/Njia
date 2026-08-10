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
  { id: 'uon', name: 'University of Nairobi', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://uonbi.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'ku', name: 'Kenyatta University', type: 'university', location: 'Kahawa, Nairobi', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://ku.ac.ke', modes: ['full_time', 'evening', 'online'], has_workstudy: true, has_hostel: true },
  { id: 'jkuat', name: 'Jomo Kenyatta University of Agriculture and Technology (JKUAT)', type: 'university', location: 'Juja', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://jkuat.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true },
  { id: 'strathmore', name: 'Strathmore University', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://strathmore.edu', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'mku', name: 'Mount Kenya University', type: 'university', location: 'Thika', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://mku.ac.ke', modes: ['full_time', 'evening', 'online', 'weekend'], has_workstudy: false, has_hostel: true },
  { id: 'moi', name: 'Moi University', type: 'university', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'CUE Chartered', website: 'https://mu.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'egerton', name: 'Egerton University', type: 'university', location: 'Njoro', county: 'Nakuru', accreditation: 'CUE Chartered', website: 'https://egerton.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'maseno', name: 'Maseno University', type: 'university', location: 'Maseno', county: 'Kisumu', accreditation: 'CUE Chartered', website: 'https://maseno.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'tuk', name: 'The Technical University of Kenya (TU-K)', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://tukenya.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'multimedia', name: 'Multimedia University of Kenya', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://mmu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'kmtc', name: 'Kenya Medical Training College (KMTC) — Nairobi Campus', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'kmtc_kakamega', name: 'Kenya Medical Training College (KMTC) — Kakamega Campus', type: 'tvet', location: 'Kakamega', county: 'Kakamega', accreditation: 'TVETA Registered', website: 'https://kmtc.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'ntti', name: 'Nairobi Technical Training Institute (NTTI)', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://ntti.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: false },
  { id: 'ekp', name: 'Eldoret National Polytechnic', type: 'tvet', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'TVETA Registered', website: 'https://eldoretpolytechnic.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'mombasa_poly', name: 'Mombasa Technical Training Institute', type: 'tvet', location: 'Mombasa', county: 'Mombasa', accreditation: 'TVETA Registered', website: 'https://mombasapoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true },
  { id: 'kisumu_poly', name: 'Kisumu National Polytechnic', type: 'tvet', location: 'Kisumu', county: 'Kisumu', accreditation: 'TVETA Registered', website: 'https://kisumupoly.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'pac', name: 'Pan Africa Christian University (PAC)', type: 'university', location: 'Ruaka, Nairobi', county: 'Kiambu', accreditation: 'CUE Chartered', website: 'https://pau.ac.ke', modes: ['full_time', 'evening', 'weekend'], has_workstudy: true, has_hostel: true },
  { id: 'kca', name: 'KCA University', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://kcau.ac.ke', modes: ['full_time', 'evening', 'weekend', 'online'], has_workstudy: true, has_hostel: false },
  /* --- Expansion: further CUE-chartered universities and TVETA-registered
   * national polytechnics, widening county coverage beyond Nairobi/Kiambu.
   * All are real, publicly known institutions; the provenance notice at the
   * top of this file applies to every record here too. --- */
  { id: 'usiu', name: 'United States International University - Africa (USIU-Africa)', type: 'university', location: 'Kasarani, Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://usiu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true },
  { id: 'daystar', name: 'Daystar University', type: 'university', location: 'Athi River', county: 'Machakos', accreditation: 'CUE Chartered', website: 'https://daystar.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true },
  { id: 'cuea', name: 'Catholic University of Eastern Africa (CUEA)', type: 'university', location: 'Karen, Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://cuea.edu', modes: ['full_time', 'evening', 'weekend'], has_workstudy: false, has_hostel: true },
  { id: 'kemu', name: 'Kenya Methodist University (KeMU)', type: 'university', location: 'Meru', county: 'Meru', accreditation: 'CUE Chartered', website: 'https://kemu.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'dekut', name: 'Dedan Kimathi University of Technology (DeKUT)', type: 'university', location: 'Nyeri', county: 'Nyeri', accreditation: 'CUE Chartered', website: 'https://dkut.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'mmust', name: 'Masinde Muliro University of Science and Technology (MMUST)', type: 'university', location: 'Kakamega', county: 'Kakamega', accreditation: 'CUE Chartered', website: 'https://mmust.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'tum', name: 'Technical University of Mombasa (TUM)', type: 'university', location: 'Mombasa', county: 'Mombasa', accreditation: 'CUE Chartered', website: 'https://tum.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'kisii_uni', name: 'Kisii University', type: 'university', location: 'Kisii', county: 'Kisii', accreditation: 'CUE Chartered', website: 'https://kisiiuniversity.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'machakos_uni', name: 'Machakos University', type: 'university', location: 'Machakos', county: 'Machakos', accreditation: 'CUE Chartered', website: 'https://mksu.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'kiambu_poly', name: 'Kiambu National Polytechnic', type: 'tvet', location: 'Kiambu', county: 'Kiambu', accreditation: 'TVETA Registered', website: 'https://kiambupoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'nyeri_poly', name: 'Nyeri National Polytechnic', type: 'tvet', location: 'Nyeri', county: 'Nyeri', accreditation: 'TVETA Registered', website: 'https://thenyeripoly.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'kabete_poly', name: 'Kabete National Polytechnic', type: 'tvet', location: 'Kabete, Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kabetepoly.ac.ke', modes: ['full_time', 'evening'], has_workstudy: true, has_hostel: true },
  { id: 'meru_poly', name: 'Meru National Polytechnic', type: 'tvet', location: 'Meru', county: 'Meru', accreditation: 'TVETA Registered', website: 'https://merupoly.ac.ke', modes: ['full_time'], has_workstudy: false, has_hostel: true },
  { id: 'sigalagala', name: 'Sigalagala National Polytechnic', type: 'tvet', location: 'Kakamega', county: 'Kakamega', accreditation: 'TVETA Registered', website: 'https://sigalagalanationalpolytechnic.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true },
  { id: 'rvti', name: 'Rift Valley Technical Training Institute', type: 'tvet', location: 'Eldoret', county: 'Uasin Gishu', accreditation: 'TVETA Registered', website: 'https://rvti.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'kimc', name: 'Kenya Institute of Mass Communication (KIMC)', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://kimc.ac.ke', modes: ['full_time', 'evening'], has_workstudy: false, has_hostel: true },
  { id: 'utalii', name: 'Kenya Utalii College', type: 'tvet', location: 'Nairobi', county: 'Nairobi', accreditation: 'TVETA Registered', website: 'https://utalii.ac.ke', modes: ['full_time'], has_workstudy: true, has_hostel: true }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INSTITUTIONS };
}
