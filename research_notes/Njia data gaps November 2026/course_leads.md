# Closing named course leads: KSUC, Emining TTI, Sirisia TVC, Kibabii TTI, Mulango TVC, KMTC campuses (27 November 2026)

Method note: these searches used WebSearch only. The project's CLAUDE.md bans WebFetch ("Do not use WebFetch on this project ... a standing instruction from the maintainer"), and that overrides the brief's suggestion to fetch PDFs. Every finding below was read through a search summary. None comes from a document that was opened directly. Fifteen searches were run. Where a search was limited to the institution's own domain, that is stated.

Register check (grep of data/institutions.js and data/courses.js):
- Koitaleel Samoei University College: not in the register at all.
- Emining TTI: not in the register.
- Sirisia TVC and Kibabii TTI: neither is in the register. Kibabii University (`kibabii_university`) is.
- Mulango TVC (`mulango_tvc`): listed, public, `tvet_consolidated`, website mulangotvc.ac.ke. It holds exactly one course, c1489 "Fashion Design and Garment Making Level 4 (CDACC)".
- KMTC: 47 rows in data/institutions.js match `id: 'kmtc_`. CLAUDE.md says the register holds 58 campuses; the gap is probably the JSON-style `"id": "kmtc_` rows that my grep pattern did not count. Re-measure before relying on either number.

## Koitaleel Samoei University College (Mosoriot, Nandi; constituent college of UoN): bachelor's programmes, entry and duration

### Takeaway
KSUC's own 2026/27 joining instructions list its degree programmes by school, so a programme list exists on the institution's own domain. Its own programme page gives the BEd (Arts) bar as C+ aggregate with C in Mathematics and English or Kiswahili. KUCCPS programme pages give codes and subject minima for two more programmes. No source states any programme's duration.

### Cited Findings
- KSUC's 2026/2027 joining instructions set registration for Monday 24 August 2026 at the Mosoriot campus. They list degree programmes by school: Education (Arts, Early Childhood Education, Physical Education and Sports, Science); Arts (Economics, Geography and Natural Resource Management); Science (Biology, Physics, Chemistry, Mathematics, Agriculture, Agribusiness Management); Commerce; Project Planning and Management; and Economics and Statistics. This was read through a search summary, and the PDF was not opened. — [KSUC Joining Instructions 2026 (ksu.ac.ke)](https://ksu.ac.ke/wp-content/uploads/2026/07/JOINING-INSTRUCTIONS-2026-.pdf)
- Bachelor of Education (Arts): "Holder of KCSE certificate with a minimum aggregate of C+ and a minimum of C in both Mathematics and English/Kiswahili, or minimum grade of B in bridging course offered in the University of Nairobi with at least a C- in the subject at KCSE". UoN's common bachelor's regulations apply, and alternative routes exist (KCSE C- plus a certificate and diploma, or a degree). — [KSUC Bachelor of Education Arts page](https://ksu.ac.ke/index.php/education-arts/)
- KSUC's own site has separate programme pages for Bachelor of Arts and Bachelor of Education (E.C.E). Their contents were not in the summaries. — [Bachelor of Arts](https://ksu.ac.ke/index.php/bachelor-of-arts/); [Bachelor of Education E.C.E](https://ksu.ac.ke/index.php/bachelor-of-education-e-c-e/); [Programmes SOE](https://ksu.ac.ke/index.php/programmes-soe/)
- KUCCPS lists "Bachelor of Science (Agri Business Management)" at KSUC, code 3890187, with Mathematics at C among the subject minima, and blank cut-offs for 2023 to 2025. — [KUCCPS programme 1197](https://students.kuccps.net/programmes/detail/1197/)
- KUCCPS lists "Bachelor of Economics and Statistics" at KSUC, code 3890199, with minima MAT A C+ and ENG/KIS/KSL C, and blank cut-offs. — [KUCCPS programme 1235](https://students.kuccps.net/programmes/detail/1235/)
- KUCCPS also lists a Bachelor of Project Planning and Management. The summary did not show KSUC on that page explicitly. — [KUCCPS programme 1417](https://students.kuccps.net/programmes/detail/1417/)
- KSUC's institution code on KUCCPS appears to be 3890, because both programme codes start 3890. — [KUCCPS institution 3890](https://students.kuccps.net/institutions/3890/)
- Aggregator lists (one outlet, educationnewshub.co.ke) add BSc Finance and BSc Chemistry. These are not independent corroboration. — [educationnewshub KSU course list](https://educationnewshub.co.ke/koitaleel-samoei-university-course-list-requirements-fees/?amp=1)

### Inferences
- The programmes that are both named in KSUC's own 2026 joining instructions and on a KUCCPS page with a KSUC code are BSc Agribusiness Management and Bachelor of Economics and Statistics. These are the best-attributed. BEd (Arts) has its own KSUC page with an entry bar. Those three could be listed at C+ (the BEd page states it, and the national degree floor applies to the others), with subject minima in the note.
- The other programmes in the joining instructions (BEd ECE, BEd Science, BEd Physical Education and Sports, BA Economics, BA Geography and Natural Resource Management, BCom, Bachelor of Project Planning and Management, and the BSc in Biology, Physics, Chemistry, Mathematics and Agriculture) rest on one primary listing on the institution's own domain. Under the widened CLAUDE.md standard (a programme map plus confirmation that the institution runs that school), they are listable, with each school confirmed by the same joining-instructions document. The caller should decide whether one primary document is enough.
- KSUC is a public constituent college, so the SCFM applies and no per-programme fee should be written.

### Gaps
- Duration was not published in any result for any KSUC programme. The UoN national norm is four years, but that was not sourced to KSUC here, so leave `duration_months` null or cite a qualification-level source.
- The 2024 joining instructions carried fee figures, but no 2026 fee figure was read.
- I did not confirm whether KSUC is listed as a separate institution in CUE's register, or whether it counts against the 36 public universities in tests/university-coverage.test.js (it is a constituent college, not a chartered university).

## Emining TTI (Baringo): awards and level per award

### Takeaway
Emining's own site gives the level-to-grade ladder, but its two current pages contradict each other on Level 4. The only department-level award list found is the Business Department's. No award was confirmed at a single unambiguous level by two independent sources, except the business awards, which rest on Emining's own domain only.

### Cited Findings
- The current homepage gives the ladder: Higher Diploma (relevant degree or diploma); Level 6, KCSE C- and above; Level 5, KCSE D and above; Level 4, KCSE D- and above; Level 3, KCPE and above. — [eminingtti.ac.ke](https://eminingtti.ac.ke/)
- The admissions page gives Level 4 as "KCSE D- & BELOW", which contradicts the homepage's "D- and above". It also gives three intakes a year: January, May and September. — [Emining Admissions](https://eminingtti.ac.ke/admissions-2/)
- The "new" site uses different tier names: Diploma, KCSE C- and above; Craft Certificate, KCSE D and above; Artisan, KCPE and above. — [new.eminingtti.ac.ke Admissions](https://www.new.eminingtti.ac.ke/admissions-2/)
- The Business Department lists these awards:
  - Level 6: Supply Chain Management, Cooperative Management, Procurement, Human Resources Management and Accountancy. Entry is KCSE C- or a relevant Level 5.
  - Level 5: Office Administration, Cooperative Management, Human Resource Management and Procurement. Entry is KCSE D or above, or a relevant Level 4 certificate.
  — [Emining Business Department](https://eminingtti.ac.ke/business-department/)
- The archived site listed craft certificates at about two years (KCSE D), diplomas at three years (KCSE C-), and artisan courses including welding, motor vehicle mechanics and hairdressing. Its level labels differ from the current site, and it may be outdated. — [old.eminingtti.ac.ke courses](https://www.old.eminingtti.ac.ke/courses/); [old site diploma page](https://www.old.eminingtti.ac.ke/diploma/)
- Departments named on the homepage: Agriculture; Business and Liberal Studies; Building and Civil Engineering; Electrical and Electronics Engineering; Hospitality and Institutional Management; Automotive Engineering; Computing and Informatics; Applied and Health Sciences. — [eminingtti.ac.ke](https://eminingtti.ac.ke/)
- Aggregators report diploma fees of Ksh 67,189 to 72,076 a year and certificate and artisan fees of Ksh 56,000 to 67,189. These figures are inconsistent and come from one outlet. — [educationnewshub Emining](https://educationnewshub.co.ke/emining-technical-training-institute-courses-requirements-fees-application-student-portal-and-contacts/)

### Inferences
- The Business Department awards (5 at Level 6, 4 at Level 5) each carry an explicit level on the institution's own page. That resolves the old level conflict for business, but it is one source.
- The Level 4 entry conflict (D- and above against D- and below) should be resolved in the less exclusionary direction per CLAUDE.md, which would record E. But no Level 4 award is named on the current site anyway.
- Emining is not in the register, so these would be its first records.

### Gaps
- No second, independent sighting of any business award was found. A KUCCPS search scoped to Emining was not run because of the call budget.
- No duration was published per award on the current site. The archived figures (two years for craft, three for diploma) are old-site and level-generic.
- The Agriculture, engineering, hospitality and ICT department award lists were not found.

## Sirisia TVC and Kibabii TTI (Bungoma): award-level programme lists

### Takeaway
Sirisia now has its own domain (sirisiatvc.ac.ke), which publishes an entry ladder by level and some award-level detail. That unblocks the earlier "one aggregator only" lead. No source for Kibabii TTI other than a Facebook page surfaced, and every other result was a different Kibabii institution.

### Cited Findings
- Sirisia's Computing and Informatics page gives the entry ladder: Level 3, KCPE; Level 4, KCSE D-; Level 5, KCSE D+; Level 6, C-. It lists ICT Technician Level 5 (two years) and Level 6 (three years) under CDACC, a Computer Application course (three months), and Library and Information Science (two or three years). Intakes are January, May and September. — [Sirisia Computing & Informatics](https://sirisiatvc.ac.ke/department-details/computing-informatics)
- Sirisia's Applied Sciences page lists Applied Biology and Science Lab Technology under CDACC, one to two years. — [Sirisia Applied Sciences](https://sirisiatvc.ac.ke/courses-details/applied-sciences)
- Sirisia's training-opportunities brochure gives Carpentry and Joinery Level 5 at KCSE D+, Carpentry and Joinery Level 4 at KCPE or KCSE D-, and Accountancy Level 6 at KCSE C-. The summary warned that the brochure's text extraction is jumbled. — [Sirisia training opportunities PDF](http://sirisiatvc.ac.ke/storage/uploads/e_resource/1762950799-31139.pdf)
- The Sirisia homepage names course areas including Electrical and Electronics Engineering, Hospitality and Tourism Management, Plumbing, Housekeeping, Hairdressing and Beauty Therapy, and Masonry. — [sirisiatvc.ac.ke](https://sirisiatvc.ac.ke/)
- Directory listings (education.co.ke, CoursesEye, colleges.co.ke) give diplomas including Secretarial Studies, HRM, Accounting Technicians, ICT, Electrical and Electronics, and Food and Beverage, "mostly at two years". These conflict with each other and with the college's own durations. — [education.co.ke](https://education.co.ke/sirisia-technical-and-vocational-college-courses-offered-contacts-application-procedure/); [CoursesEye](https://www.courseseye.com/colleges-and-universities/9916-sirisia-technical-and-vocational-college.aspx)
- Collision: Sirisia Vocational Training Centre is a separate county VTC that appears in the same result sets. — [Mabumbe Sirisia VTC](https://mabumbe.com/za/sirisia-vocational-training-center-vtc-bungoma-application-form-contacts-courses/)
- Kibabii TTI: the only direct source is its Facebook page. It promotes KASNEB diplomas in data management and analytics, plus short courses (networking, cybersecurity, digital marketing and others). — [Kibabii TTI Facebook](https://www.facebook.com/people/Kibabii-Technical-Training-Institute/100094774608849/)
- Collisions confirmed in the same search:
  - Kibabii University's TVET directorate, which lists diplomas in computer programming, cybersecurity and ICT. — [Kibabii University TVET](https://kibu.ac.ke/academic-programs/technical-and-vocational-education-and-training-tvet-programmes/)
  - Kibabii VTC, with NITA trades. — [kibabiivtc.ac.ke](https://www.kibabiivtc.ac.ke/index)
  - A "Kibabii Vocational Training Institute" in Murang'a. — [youscholars](https://www.youscholars.com/kibabii-vocational-training-institute-courses-address-and-admissions/)

### Inferences
- Sirisia: ICT Technician at Level 5 (D+, 24 months) and Level 6 (C-, 36 months) are named with level, entry and duration on the college's own page. Carpentry and Joinery Level 4 (KCPE or D-, so open entry under the either/or rule) and Accountancy Level 6 (C-) are named in its own brochure. All of this is one domain. A KUCCPS sighting would make each one two sources.
- Kibabii TTI remains a lead. A Facebook page is not a verified account, nothing cross-checks it, and KASNEB diplomas are professional-body awards rather than a TVET programme list. KASNEB awards are also listed under Kibabii University, which raises the collision risk.

### Gaps
- No KUCCPS page for any Sirisia award was surfaced in these searches.
- Sirisia's Level 4 "D-" (department page) and "KCPE or D-" (brochure) should be read as open entry under the either/or rule, but the department page alone states D-.
- Kibabii TTI's own website, TVETA licence and KUCCPS listing were not found.

## Mulango TVC (Kitui): Level 4 artisan awards; public or private

### Takeaway
Mulango's own Business Studies department page names four Level 4 artisan awards at one year. KUCCPS lists the same college's accounting and supply chain at CRAFT level (Level 5), not Level 4. That gives a second sighting of the subject, but not of the Level 4 award. The evidence points to public ownership. I found no KUCCPS page listing Mulango as private.

### Cited Findings
- Business Studies department (mulangotvc.ac.ke): Level 4 (Artisan) Accounting Technician, Secretarial Studies, Human Resource Management and Supply Chain Management. All are one year, accredited by TVET CDACC, with minimum entry given as "D(Minus) and an E". Head of Department: Ms Beatrice N. Mulewa. — [Mulango Business Studies department](https://mulangotvc.ac.ke/departments/6)
- The college's own Level 5 page lists about 15 craft programmes (mostly 1.5 years, KCSE D+), including Building Technology, Plumbing, ICT Technician, Welding and Fabrication, Accounting Technician and Agripreneurship Technician. Its Level 6 page lists about 16 three-year diplomas at C-, including Civil Engineering, Electrical Engineering Technician, and Food and Beverage (2.5 years). — [Mulango Level 5](https://mulangotvc.ac.ke/programmes/level-5); [Mulango Level 6](https://mulangotvc.ac.ke/programmes/level-6)
- The summary flagged a likely typo on the college's own pages: Fashion Design and Garment Making shows as 5 years on the Level 5 table and 6 years on the Level 6 table. — [Mulango Level 5](https://mulangotvc.ac.ke/programmes/level-5)
- KUCCPS lists:
  - "Certificate of Competency in Automotive Engineering Level 4" (programme 4998), associated with Mulango in the search. — [KUCCPS programme 4998](https://students.kuccps.net/programmes/detail/4998/)
  - "Trade Test Grade III in Welding and Fabrication". The summary associated it with Mulango, but I did not confirm the institution. — [KUCCPS programme 2956](https://students.kuccps.net/programmes/detail/2956/)
- KUCCPS craft and certificate lists: "MULANGO TECHNICAL & VOCATIONAL COLLEGE CRAFT IN ACCOUNTING TECHNICIAN", code 2660745, cost 67,189. "CRAFT CERTIFICATE IN SUPPLY CHAIN MANAGEMENT", code 2660957. A Diploma in Supply Chain Management (2660746) and Accountancy Level 6 (2660601) are also listed. The craft PDF is dated March 2024. — [KUCCPS Craft programmes PDF](https://statics.kuccps.net/uploads/globalFiles/CRAFT_18_03_2024_RV2.pdf); [KUCCPS Certificate programmes PDF](https://statics.kuccps.net/uploads/globalFiles/CERTIFICATE_PROGRAMMES.pdf); [KUCCPS Diploma programmes PDF](https://statics.kuccps.net/uploads/globalFiles/DIPLOMA_PROGRAMMES.pdf)
- An aggregator lists Level 4 Automotive Technician, Electrical Engineering Technician, Agripreneurship Technician, Welding and Fabrication, Food and Beverage, Hairdressing and Beauty Therapy, and the four business awards. It is one outlet, and inconsistent across its pages. — [educationnewshub Mulango](https://educationnewshub.co.ke/mulango-technical-and-vocational-college-courses-fees-requirements-application-portal-and-contacts/)

### Inferences
- Level 4 awards with a primary source and a second, KUCCPS sighting: only Automotive Engineering Level 4, which is on KUCCPS and in the aggregator. That KUCCPS page was not confirmed as Mulango's in the summary text, so verify it before recording.
- The four business Level 4 awards rest on Mulango's own department page alone. KUCCPS corroborates Accounting Technician and Supply Chain Management only at Level 5 (craft), which is a different named award. Per course identity (name, institution), that is not a second sighting of the Level 4 award.
- The "Electrical Engineering Technician (Level 4, one year)" question from CLAUDE.md was not settled. The college's own Level 6 page lists Electrical Engineering Technician as a diploma, so the "Level 4" reading in the aggregator may be wrong.
- Ownership: KUCCPS lists every Mulango programme at Ksh 67,189, the consolidated public-TVET rate. The register extract cited in data/institutions.js is TVETA/PUBLIC/TVC/0001/2022. Both point to public ownership.

### Gaps
- I did not find the KUCCPS page that reportedly lists Mulango among private members. The one KUCCPS newsletter in results ([KUCCPS Sep Issue No.3](https://kuccps.net/sites/default/files/2025-09/Sep%20Issue%20No.3.pdf)) was not summarised on this point. The private-ownership claim is unconfirmed and should not change the register.
- The entry wording "D(Minus) and an E" is ambiguous. Read with the either/or rule, an E clears it, but the page does not say so outright.

## KMTC campuses: does kmtc.ac.ke publish per-campus programme lists?

### Takeaway
Yes. KMTC publishes an Academic Programmes Booklet dated 16 September 2025, which lists campuses and programmes. Through search summaries, though, most pre-service diplomas and certificates show only "Selected Campuses", so per-campus lists could not be extracted. The booklet has to be read directly, which this build's rules do not allow, or searched programme by programme.

### Cited Findings
- KMTC's own documents: the "Kenya Medical Training College Academic Programmes, as at September 2025" booklet, January 2025 and June 2023 versions, and the academic documents index. — [Booklet 16 Sep 2025](http://kmtc.ac.ke/phocadownloadpap/academic-docs/KMTC-Academic-Programmes-Booklet-16-Sep-2025-.pdf); [older booklet](https://kmtc.ac.ke/images/document/KMTCbooklet.pdf); [Academic Documents](https://kmtc.ac.ke/resource-center/downloads/13-academic-documents)
- The booklet lists campuses alphabetically (Awendo, Bomet, Bondo, Bungoma, ...) and programmes by department. Departments include Clinical Medicine and Surgery, Community Oral Health, Dental Technology, Health Promotion and Community Health, Health Records and IT, Medical Engineering, Medical Laboratory Sciences, Nursing, Nutrition and Dietetics, Occupational Therapy, Optometry, Orthopaedic Technology, Pharmacy, Public Health, and Radiography and Imaging. — [Booklet 16 Sep 2025](http://kmtc.ac.ke/phocadownloadpap/academic-docs/KMTC-Academic-Programmes-Booklet-16-Sep-2025-.pdf)
- Diploma in Pharmacy, 3 years, "Selected Campuses". — [Booklet 16 Sep 2025](http://kmtc.ac.ke/phocadownloadpap/academic-docs/KMTC-Academic-Programmes-Booklet-16-Sep-2025-.pdf)
- Diploma in Medical Laboratory Sciences, 3 years, "Selected Campuses". Certificate in Medical Laboratory Sciences, 2 years, September intake, "Selected Campuses". — [Booklet 16 Sep 2025](http://kmtc.ac.ke/phocadownloadpap/academic-docs/KMTC-Academic-Programmes-Booklet-16-Sep-2025-.pdf)
- Nutrition and Dietetics: one KMTC document gives a 3-year diploma at "Selected Campuses". Another entry gives a 2-year diploma, with a March intake at Karen and a September intake at Karen and Homa Bay. — [older booklet](https://kmtc.ac.ke/images/document/KMTCbooklet.pdf); contradicted by an entry in the same result set, from a KMTC document the summary did not identify.
- The booklet names campuses explicitly only for higher diplomas. For example, ENT, Head and Neck Surgery is given at Nairobi, Nakuru, Eldoret and Kisii, and Clinical Pharmacy at Nairobi and Mombasa. Those are post-basic, so they are out of scope. — [Booklet 16 Sep 2025](http://kmtc.ac.ke/phocadownloadpap/academic-docs/KMTC-Academic-Programmes-Booklet-16-Sep-2025-.pdf)
- KMTC's own pre-service intake advertisement (September 2025) is another per-programme, per-campus source on kmtc.ac.ke. — [KMTC September 2025 pre-service advert](https://kmtc.ac.ke/images/programmes/KMTC%20SEPTEMBER%202025%20PRE-SERVICE%20INTAKE%20ADVERTISEMENT.pdf)

### Inferences
- The booklet's "Selected Campuses" wording for pre-service programmes means even the primary document may not list campuses for those programmes. The intake adverts (September 2025, September 2026) are the more likely source of per-campus pre-service lists.
- The Nutrition and Dietetics duration disagreement (2 against 3 years) is inside KMTC's own documents. Under the Njia rules, leave the duration null, or record each campus's published figure.

### Gaps
- No per-campus pre-service list was extracted. This needs either a direct read of the booklet or adverts (not permitted in this project), or a search per programme and campus.
- I did not check whether the September 2025 booklet names campuses for certificates and diplomas in tables that the summaries truncated.

## Summary for the caller: what is closable now
- **KSUC (new institution):** BSc Agribusiness Management and Bachelor of Economics and Statistics each have the college's own 2026 joining instructions plus a KUCCPS page coded 3890. BEd (Arts) has its own page with an entry bar of C+ and C in Maths and English or Kiswahili. Durations are unpublished.
- **Sirisia TVC (new institution):** ICT Technician Level 5 (D+, 2 years) and Level 6 (C-, 3 years) are on its own department page. Carpentry and Joinery Level 4 and Accountancy Level 6 are in its own brochure. All are one domain each; a KUCCPS sighting is still missing.
- **Mulango TVC:** Four Level 4 business awards are on its own page, at one year, with entry "D- and an E". The second sighting is missing at Level 4, because KUCCPS lists them at Level 5. The college is public.
- **Emining TTI:** Business Department awards are listed per level on its own page (5 at Level 6, 4 at Level 5). No second sighting, and no other department lists were found.
- **Kibabii TTI:** still a lead, Facebook only, and badly collision-prone.
- **KMTC:** the per-campus booklet exists, but its pre-service rows read "Selected Campuses". Use the intake adverts instead.
