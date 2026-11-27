# Published fees for named programmes at Kenyan private universities and colleges (27 November 2026)

Method: 15 WebSearch calls, all restricted to `kuccps.net` / `students.kuccps.net` / `statics.kuccps.net`. Queries named the institution and its programmes and **never contained a figure**. **WebFetch was not used.** CLAUDE.md lists it as non-negotiable rule 3 ("WebSearch is the only external channel; WebFetch is off"), and an agent's brief cannot override that. Every figure below was therefore **read through a search summary, not from the document in full**. Ids already in `KUCCPS_YEAR1_COST.byCourse` (64) were excluded from the work-list.

## Which institutions' own fee documents are reachable by WebFetch today?

### Takeaway
Not tested. WebFetch is banned by the project's standing rules. No institution-domain search was run in this pass: the budget went to KUCCPS, which is a national authority and so meets the sourcing standard by itself.

### Cited Findings
- None. This question was not researched (see Gaps).

### Inferences
- The KUCCPS degree-programme cost list covers most of the 31 private universities in the work-list. Mining it per institution gives more than chasing 31 separate institutional PDFs.

### Gaps
- Whether each institution's own fee PDF is reachable today is unknown. Re-test only with the maintainer's agreement to lift the WebFetch ban.
- Private colleges (privCol: Don Bosco, CITCs, YMCA, KIM, mission nursing schools, ADMI and the others) were **not searched**. KUCCPS degree lists do not cover them.

## Is DEGREE_PROGRAMMES.pdf reachable, and what does KUCCPS publish per programme?

### Takeaway
The PDF is indexed and its rows come back through search. Search titles give its header as "No SUB CLUSTER PROG CODE INSTITUTION NAME PROGRAMME NAME PROGRAMME COST". KUCCPS programme pages label the same figure "YEAR 1 - Programme Cost". The summaries date that list to about March 2024 ("about 982 days old"). It **states no academic year and does not say whether the figure is tuition only or includes statutory charges**.

### Cited Findings
- Header "No SUB CLUSTER PROG CODE INSTITUTION NAME PROGRAMME NAME PROGRAMME COST" — [DEGREE_PROGRAMMES.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES.pdf); the companion revision is [DEGREE_20_03_2024_RV2.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_20_03_2024_RV2.pdf) (dated 20 March 2024).
- Programme detail pages show "YEAR 1 - Programme Cost: Ksh …" — [KUCCPS programme page](https://students-new.kuccps.net/programmes/detail/1175/).
- The 2025/26 list ([DEGREE_PROGRAMMES_2025.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES_2025.pdf)) came back with cut-offs and subject bars but **no cost column** in the summaries.
- The lists disagree with older programme pages in several places (for example Kabarak Environmental Science 181,150 against 163,035; KCA Economics and Business Studies 140,430 against 107,790; Daystar Community Development 242,800 against 223,900). Older pages carry older-cycle figures.

### Inferences
- Period is "Year 1" by KUCCPS's own label. Never multiply it into a programme total; later years can differ.

### Gaps
- ENOTFOUND on a direct fetch was not re-tested (WebFetch not used).
- Whether the figure includes statutory, ICT or examination charges is not stated anywhere reachable.

## Candidate Year 1 costs for fee-less records (KUCCPS, read through search summaries)

Strength: **A** = the award name matches exactly and the same figure appears in two summaries or in two KUCCPS documents. **B** = name matches, one reading only. **X** = name mismatch or the attribution is ambiguous; **do not attach**.

| id | Njia record | KUCCPS row as summarised | Year 1 Ksh | Strength | Notes |
|---|---|---|---|---|---|
| c1300 | Daystar BSc Environmental Health | BACHELOR OF SCIENCE IN ENVIRONMENTAL HEALTH, 1162188 | 242,800 | A | Read in two separate searches ([prog 1204](https://students.kuccps.net/programmes/detail/1204/); [DEGREE_PROGRAMMES.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES.pdf)) |
| c648 | Kabarak BSc Information Technology | 1061232 BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY | 191,150 | A | Same in DEGREE_PROGRAMMES.pdf and the 20 March 2024 RV2 ([RV2](https://statics.kuccps.net/uploads/globalFiles/DEGREE_20_03_2024_RV2.pdf)) |
| c653 | Kabarak BSc Environmental Science | BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE | 181,150 | A, with conflict | Both 2024 lists agree; an older programme page gives 163,035 ([prog 4873/1514](https://students.kuccps.net/programmes/detail/4873/)) |
| c655 | Kabarak Bachelor of Theology | 1061446 BACHELOR OF THEOLOGY | 150,550 | B | Undated list, one reading |
| c775 | St Paul's BEd (Special Needs) | BACHELOR OF EDUCATION (SPECIAL NEEDS EDUCATION), 1107155 | 204,000 | B | Two summaries, but both quote the same list; the Njia name lacks "Education" in the bracket ([prog 1134](https://students.kuccps.net/programmes/detail/1134/)) |
| c771 | St Paul's BSc Computer Science | 1107115 | 181,700 | X | One summary gives 181,700 for Computer Science, another the same figure for the Bachelor of Business and Information Technology; ambiguous |
| c773 | St Paul's BA Social Work | BACHELOR OF ARTS (SOCIAL WORK), 1107144 | 159,400 | X | The same 159,400 is given for B.Com and for Community Development, so the row may be misread |
| c759 | KeMU BEd (Science) | 1077137 BACHELOR OF EDUCATION (SCIENCE) | 152,000 | B | One reading; another summary says KeMU programmes are "mostly 152,000" ([DEGREE_PROGRAMMES.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES.pdf)) |
| c761 | KeMU BA Counselling Psychology | KUCCPS title is BACHELOR OF ARTS IN COUNSELING, 1077337 | — | X | Different award title; no cost read |
| c073 | ANU BA in Mass Communication | 1078242 BACHELOR OF MASS COMMUNICATION | 235,500 | X (near-match) | Two files plus a programme page agree on 235,500, but the KUCCPS title has no "Arts" ([prog 1175](https://students-new.kuccps.net/programmes/detail/1175/)). Check whether c073 is this award |
| c753 | ANU Bachelor of Laws (LLB) | 1078134 BACHELOR OF LAWS (LLB) | 269,500 | B | One undated list; the 2024 excerpt shows no LLB row |
| c757 | ANU BA Criminal Justice and Security Studies | 1078136 …CRIMINAL JUSTICE AND SECURITY (MANAGEMENT) | 227,500 | X | Different award title (Management, not Studies) |
| c529 | Baraton BEd (Science) | BACHELOR OF EDUCATION (SCIENCE) | 178,800 | B | One summary ([DEGREE_PROGRAMMES.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES.pdf)) |
| c518 | Gretsa BSc Hospitality Management | Hospitality Management | 152,400 | B | One summary; exact KUCCPS title not quoted |
| c517 | Gretsa BSc Computer Science | Computer Science | 140,400 | B | One summary; exact title not quoted |
| c1222 | Gretsa BA Community Development | Community Development | 130,400 | B | KUCCPS programme detail page ([prog 1387](https://students.kuccps.net/programmes/detail/1387/)); title not quoted in full |
| c537 | Scott Christian BA Community Development | BACHELOR OF ARTS IN COMMUNITY DEVELOPMENT | 159,150 | B | The summary repeats the row; one search |
| c1240 | Scott Christian BEd (ECDE) | BACHELOR OF EDUCATION (EARLY CHILDHOOD DEVELOPMENT EDUCATION) | 159,150 | B | Same search; Scott Christian appears to price most degrees at 159,150 (Hospitality and Tourism 168,150) |
| c766 | PAC BA Counselling Psychology | BACHELOR OF ARTS IN COUNSELING PSYCHOLOGY | 187,760 | B, with conflict | March 2024 list ([RV2](https://statics.kuccps.net/uploads/globalFiles/DEGREE_20_03_2024_RV2.pdf)); an earlier search attributed 187,760 to PAC Community Development instead |
| c764 | PAC BBIT | Business Information Technology | 214,220 | X | The summary says only "214,220 for a different PAC programme"; PAC B.Com is also 214,220 |
| c1297 | Daystar BSc Economics | KUCCPS lists BACHELOR OF ARTS IN ECONOMICS, 1162146 | — | X | Award mismatch (BA, not BSc). Check the Njia record's title |

### Reported, not matchable (no fee-less Njia record with that title)
- MKU: B.Com 105,000, Business Information Technology 111,000, Health Systems Management 115,000, Pharmacy 375,000. Oral Health and Hospitality are listed with cut-offs only, no cost — [MKU on KUCCPS](https://students.kuccps.net/institutions/1279/), [prog 1825](https://students.kuccps.net/programmes/detail/1825/).
- KeMU: BBIT and Environmental Health 152,000, Human Nutrition 163,500, MBChB 559,500, Pharmacy 429,500. No Clinical Medicine row found — [DEGREE_PROGRAMMES.pdf](https://statics.kuccps.net/uploads/globalFiles/DEGREE_PROGRAMMES.pdf).
- Daystar: "typically 242,800" across degrees (IR, Commerce); LLB 321,600 — same list.
- KCA: Applied Computing 182,320, Actuarial Science 202,700, BEd (ECE) 107,430 — same list. None of these is a Njia KCA record.
- GLUK: Business Administration 109,000, BEd (Arts) 109,000, Nursing 220,500, Physiotherapy 220,500. Njia's c1226 is "Physiotherapy and Rehabilitative Medicine", so the title is not confirmed identical.
- Lukenya: "86,200 for its programmes" (BEd Arts, BA Community Development). None of Lukenya's fee-less ids (c729, c730, c733, c734) was named with a figure.
- AIU (not USIU): Accountancy and Financial Management 175,050. A USIU search returned AIU rows instead, a name-collision warning.

### Inferences
- Kabarak's three A/B rows, Daystar c1300 and Baraton c529 are the cleanest candidates for `KUCCPS_YEAR1_COST`.
- Several institutions (Scott Christian 159,150, Lukenya 86,200, KeMU 152,000, Daystar 242,800) look like near-flat Year 1 rates. Per CLAUDE.md, a flat rate attaches only where the row names the programme. Do not extend it to unnamed programmes.

### Gaps
- **No USIU-Africa, Strathmore, CUEA, Riara, Umma, Kenya Highlands, Tangaza, KWUST, MUA, AIU (for Njia's ids), KAG EAST, PUEA, IUK, Amref, Uzima, ILU, TEAU or AKU cost row was returned.** KCA's Njia records (certificates, KASNEB courses, three degrees) were not matched. Strathmore is likely absent from the KUCCPS cost list entirely.
- Every B row needs one more unseeded reading before it is written. Read the PDF row directly if the maintainer allows a fetch; otherwise run a second WebSearch phrased differently (for example by programme code).
- Academic year and inclusions (tuition only, or with statutory charges) are unstated for every figure.
- Private colleges (privCol, 26 institutions) were not researched in this pass.
