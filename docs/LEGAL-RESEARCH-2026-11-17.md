# Legal pages: research notes and open questions (17 Nov 2026)

Njia's `/terms/` and `/privacy/` were rewritten on this date, and `Danico Ventures Ltd` is named as the publisher. **None of it has had a lawyer's review.** The pages say so, and `tests/legal.test.js` fails if that sentence is removed.

## What was found, and how far each point is sourced
Search summaries only; the primary texts were not opened (egress policy).

| Point | Used on the page | Basis | Strength |
|---|---|---|---|
| Breach notice to the Data Commissioner within 72 hours (DPA 2019 s.43) | Yes | Several law-firm summaries agree; one source attributes the rule to the Regulations and one cites other section numbers | Moderate: confirm the section |
| Complaints to the ODPC are free; the Commissioner concludes within 90 days (s.56(5)) | Yes | ODPC complaint pages and a High Court decision treating the 90 days as binding | Good |
| Data subject rights: be informed, access, object, correct, delete (s.26) | Yes, in general terms | The search returned the heading only; the list is from general knowledge of the Act | Weak: check s.26 text |
| Children's data (s.33) | Only as a request to involve a parent | Heading only | Weak |
| Transfers outside Kenya (s.48-49) | Only as "Netlify's systems may sit outside Kenya" | Heading and one summary | Weak |
| Netlify Forms storage location and retention | Stated as unconfirmed | Netlify forum threads; no authoritative answer found | Unknown |

## Open questions for counsel
1. **Registration with the ODPC.** The 2021 registration regulations have an exemption for small operators. Sources disagree on its test: annual turnover under KSh 5 million, fewer than 10 employees, or both. The pages deliberately do **not** assume an exemption.
2. **Is Danico Ventures Ltd the right named controller,** and has the company's registered name, number and address been settled? None is published: only the project mailbox (`njiacareerpathways@gmail.com`) appears. A guard forbids adding a registration number, postal address or phone number without a source.
3. **Retention of form submissions.** The page promises deletion on request and "as long as useful". Netlify has no built-in auto-delete, so this is a manual commitment.
4. **Cross-border transfer** of form data to Netlify, and whether the notice given is enough.
5. **Limitation of liability and governing law** wording under Kenyan consumer law.
6. **Open licence.** The terms repeat "a formal licence has not been chosen yet".

## Where the assumption sits
The publisher named is taken from the owner's own logo and instruction. If the legal entity that operates Njia is different, change `OPERATOR` in `tools/build-static-pages.mjs`, the modal text in `index.html`, the FAQ entry in `js/help.js`, and the two footer credits.

## Sources
- ODPC, Guidance Note on Registration of Data Controllers and Data Processors: https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Registration-of-Data-Controllers-and-Data-Processors.pdf
- Data Protection Act 2019: https://new.kenyalaw.org/akn/ke/act/2019/24
- ODPC, file a complaint: https://www.odpc.go.ke/file-a-complaint
- Netlify privacy statement: https://www.netlify.com/privacy/
