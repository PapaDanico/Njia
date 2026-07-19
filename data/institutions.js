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
  { id: 'kca', name: 'KCA University', type: 'university', location: 'Nairobi', county: 'Nairobi', accreditation: 'CUE Chartered', website: 'https://kcau.ac.ke', modes: ['full_time', 'evening', 'weekend', 'online'], has_workstudy: true, has_hostel: false }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INSTITUTIONS };
}
