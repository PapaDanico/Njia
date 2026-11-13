# NJIA CAREER PATHWAYS: HANDOVER FOR CHATGPT (RESEARCH AND REDESIGN UPGRADES)

**Prepared:** 13 November 2026 (EAT)
**Repository:** https://github.com/PapaDanico/Njia (public)
**Production:** https://njiacareerpathways.work/
**Base branch:** `main`. Last merge at the time of writing: PR #164, commit `ee8e589`. Last commit **confirmed live** on production: `0c010a4` (PR #163). Re-read the live deploy before relying on either.
**Who reviews and ships:** Claude reviews every pull request and the owner approves. **You do not merge and you do not deploy.**

> This document says how to work on Njia, what is already built, what to research and redesign next, and what a pull request must contain to be accepted. It is a working brief, not a claim that anything is production-ready. Re-measure every number in it before you quote it.

---

## 1. What Njia is

A static, accountless Progressive Web App for Kenyan school-leavers and adult learners deciding what to study and how to pay for it. It lists 1,392 courses at 217 institutions in 47 counties (re-measure; the figures move), with fees, entry grades and funding sources, and it says for every figure where it comes from. Its two differentiators are:

1. **Every figure is sourced or absent.** A fee, grade, duration, deadline or employment rate is either traceable to a named source or it is not shown.
2. **Learner data never leaves the device.** No accounts, no server, no person-level tracking.

Everything below is in service of those two claims. Work that weakens either is rejected, however good it looks.

---

## 2. Non-negotiable rules

These four protect a reader who has no way to check. Breaking one fails the review outright.

1. **Never invent a figure.** If you did not read it in a named source, it does not go in. A plausible number, a midpoint of a range, a figure "estimated from similar programmes" and a figure copied across institutions are all invention. When research fails, leave the field empty and say which kind of absence it is.
2. **Never quote an entry grade higher than published, and never lower.** Too high deletes the card for the learner with the fewest options. Too low sends them at a door that will not open. Where sources conflict, record the least exclusionary published bar and put the conflict in the note. A subject grade (for example D+ in Biology) is not a mean grade; do not write one into the mean-grade field.
3. **Do not route around a network block.** If a host is unreachable from your environment, say so and move on. No proxies, mirrors or cache services.
4. **Report honestly.** If a test failed, was skipped, could not run, or a source could not be opened, say so plainly. Never write "all tests pass" without running them and pasting the result.

Two further rules from the owner:

- **No Kiswahili or localisation work.** English only.
- **Useful information beats none.** Withholding a record or a finding that you could not fully reconcile is itself a claim. Report what you found and why it is not recorded. But *reporting* a figure is not *recording* it: a reported band never goes into a fee field.

---

## 3. Architecture and constraints

- **Buildless, zero-dependency static site.** Classic scripts in one global scope (no `import`, no bundler). Netlify publishes the repository root. Do not add `package.json`, npm packages, a framework, a bundler or a build step. `netlify.toml` production build is deliberately a no-op; do not change it.
- **Do not touch Netlify, DNS or repository settings.** The owner handles those.
- **System fonts only.** No new typeface without an owner decision (it grows the critical path).
- **No images that you did not make or cannot license.** The project holds no licensed photography and will not generate or borrow any. Photography needs an owner art-direction brief first (see section 8, D4). Do not add placeholder or stock imagery.
- **Lazy loading is a dependency graph.** Page modules load on demand through `PAGE_MODULE` in `js/app.js`. If you reference a symbol from another file, that file must be loaded first. `tests/landing-stats.test.js` guards this; the functional probe catches what it misses.
- **Generated pages carry no JavaScript on purpose** (counties, grades, help, privacy, accessibility, careers, pathways, diagnostic, methodology, research, research/sources, counsellors, open-data, analysis, docs). Anything that must reach a crawler or a reader without script belongs in a generator, not in client-side rendering.
- **The app is not the whole site.** Whenever you change presentation, check it on a generated page, in print, and in dark scheme, not just in the app.

---

## 4. Current state (verified 13 November 2026; re-measure)

| Area | State |
|---|---|
| Catalogue | 1,392 course listings, 217 institutions, 47 counties, 722 distinct programme names |
| Fee groups | 14 published, 327 derived, 106 illustrative, 945 unpublished, 0 unsourced (five groups partition the catalogue exactly) |
| Funding | 30 records, with `checked_at` and `valid_until` handling; an expired call cannot show as open |
| Pages built this week | `/pathways/`, `/diagnostic/`, `/careers/`, `/privacy/`, `/accessibility/`, `/methodology/`, `/research/`, `/research/sources/`, `/counsellors/` |
| Design system | Editorial light scheme on paper-white (`--bg #FAF9F5`), terracotta accent, serif headings, mono numerals; exhibit component on generated pages (label, computed action title, unit, figure, source line); shared sources footer on every generated guidance page |
| Tests | `CI=1 node --test tests/*.test.js`: 382 tests, 375 pass, 0 fail, 7 mtime guards skip under `CI=1` by design |
| Browser gates | `node tests/functional-probe.mjs`: 49/49. `node tests/a11y-sweep.mjs`: 108 axe states, 0 violations |
| Service worker | `CACHE_VERSION` is `njia-v300` in `sw.js`; bump it on any change to a cached file |
| CI | The GitHub Actions check `Unit suite and artefact freshness` is **red on every commit, including `main`**, in 2 to 6 seconds with no log: the job is never placed on a runner. It is a repository setting, not a code failure. The Netlify deploy preview is what gates a merge. Do not try to fix it by editing the workflow |

### Verify the state yourself before starting

```bash
git fetch origin && git checkout -B chatgpt/<topic> origin/main
git log --oneline -5
CI=1 node --test tests/*.test.js 2>&1 | grep -E '^# (tests|pass|fail)|^not ok'
```

If your numbers differ from the table, trust your measurement and say so in your report.

---

## 5. How to work: branch, build, verify, report

### Branch and pull request

- Branch from current `main`: `chatgpt/<short-topic>`. One logical piece of work per branch.
- Open a **draft** pull request. Do not mark it ready, merge it, enable auto-merge or touch other branches.
- Keep commits small and reviewable. Do not push to `main`. Do not force-push over history you did not write.

### Generators run in this order, and the last one injects into the others

Generated files are committed. After any change to `data/`, a generator or a template, regenerate in this exact order:

```bash
node tools/build-landing-stats.mjs
node tools/build-open-data.mjs
node tools/build-provision-analysis.mjs
node tools/build-static-pages.mjs
node tools/build-structured-data.mjs     # LAST: it injects JSON-LD into pages the others own
```

**Running a generator alone strips the JSON-LD from the pages it owns.** If you ran any one of them for its console output, run `build-structured-data.mjs` afterwards. Then check the tree: a second regeneration must produce no diff.

### Verification you must run and paste

```bash
CI=1 node --test tests/*.test.js                       # count the failures, do not just grep
node --check js/*.js                                    # a syntax error in a lazy module passes the unit suite
python3 -m http.server 8080 &                           # then:
node tests/functional-probe.mjs                         # needs Playwright Chromium; port 8080
python3 -m http.server 8106 &                           # then:
node tests/a11y-sweep.mjs                               # needs Playwright and axe; port 8106
```

If your environment cannot run the browser gates, **say so in the PR**. Do not write "passes" for something you did not run. Claude will run them before merge, and an unreported gap is treated as a failure.

### Hard-won lessons (each one cost a real defect)

- **A green unit suite is not evidence.** The defects that mattered were found by rendering the page, printing it, measuring a box, or driving a browser. Look at your change.
- **Print emulation and dark scheme are part of "done".** `emulateMedia('print')` and a dark-scheme screenshot, on a generated page, not only the app.
- **A guard that fails on good work is a guard to fix, and a break that does not fail is usually a bad break.** If you add a guard, break the thing it protects and watch it fail, then restore.
- **Assert the property, not the wording.** A ban on one phrase does not ban its synonyms.
- **Verify a script by its effect.** A script that prints "wrote 4 records" proved nothing. Parse the data back and assert the properties.
- **A convenience run of a generator is still a run** (see the injection note above).
- **Payload guards measure novelty, not fat.** `tests/payload-budget.test.js` has a critical-path ceiling (currently 116KB gzipped for what `index.html` blocks on) and a catalogue backstop. If it fires, find out whether the cause is a new field on every record, a pasted paragraph, or genuinely novel text before raising anything, and write down why.
- **A Lighthouse score moving a few points is noise on this site.** Production has read between 94 and 99 on near-identical pages. Measure the gzipped bytes on the audited page before blaming a diff.

### What went wrong on the last AI-authored pull request (so it does not repeat)

PR #159 was written with another AI tool and merged only after repair:

- It shipped a **JavaScript syntax error** in `js/decide.js` (an unterminated template string) that the unit suite did not catch. Run `node --check`.
- It left a **literal `\n`** in `index.html` markup.
- Its description said **"no production UI changes"** while it edited the course card, comparison table, funding card and landing page. A description must match the diff.
- Its `/research/` page drew every figure with script, so a reader without JavaScript saw only "Loading". It had never been in the axe sweep, had no print header and no dark scheme.
- It recorded source URLs and "accessed" dates that nobody had verified, and one URL had the wrong letter case.

---

## 6. Listing standard and data rules

**Listing a course is a claim about existence. A figure is a claim about quantity.** The strict rules are for the second.

A record is allowed when **a reputable programme map plus institution-level verification** supports it. A reputable programme map is a national programme list (KUCCPS, CUE, a regulator's course directory, a prepared handover) that names the programme. Institution-level verification is the institution's own page, a faculty or school page, or a regulator listing confirming that this institution runs that school or faculty. The record's `verification_note` must say what it was listed on, and must point the reader to the KUCCPS portal for the programme code and the current cut-off.

Every **figure** on the record still obeys the rules in section 2:

- **Course identity is (name, institution).** Check whether the institution already holds the course before adding it. A name collision between two institutions in different counties, or two campuses of one college in the same county, is a classic error: search for the campus you believe is listed, by name, and require a source calling it distinct.
- **No fee without a source.** A fee of 0 must claim to be free, in words, with a source. A null fee must say which kind of absence it is (the guard requires one of the literal phrases `does not publish`, `publishes no fee`, `could not be verified`, `not reachable`; write the one that is true, and note that "could be verified" without "not" is a different, usually wrong, sentence).
- **Never price a public university programme from the retired Differentiated Unit Cost.** Public universities are funded under the Student-Centred Funding Model; there is no per-programme price. The card renders the band shares from one sourced constant.
- **A published range is not a fee.** A per-institution or per-category range cannot be attributed to a named course. Report it in the note under a clearly labelled heading; do not write it into `total_fees_kes`.
- **Never repeat one figure across unrelated institutions** (the placeholder trap). A guard fails the build on this.
- **Durations are institution-specific for artisan and craft courses.** Do not borrow a duration from a different named award at the same institution. `duration_months` may be null.
- **`fee_observed: true` means someone read that total off the institution's own schedule for that course.** Do not set it to make a number look stronger. A synonym must under-claim, never over-claim.
- **Competitive programmes** (medicine, pharmacy, law, engineering) are listed at the published mean-grade bar, with the subject requirements and the competition stated in the note.
- **Read a neighbouring record before writing a new one.** Field names and enumerations (cluster ids, fee regimes, confidence values) are closed sets; an invented value that reads plausibly is the dangerous kind and a guard will reject it.
- **Print the resolved sector for every new record.** `sectorForCourse()` in `data/sectors.js` is first-match-wins; a course with no sector announces itself, a course with the wrong one never does. Fix a missing word by widening the right sector, not the nearest one.

If you cannot meet this standard for a record, **do not write the record. Write a research lead** (section 7) naming exactly which field is missing.

---

## 7. Research workstreams

Output for every workstream is a **research ledger**, not direct edits to `data/courses.js` or `data/institutions.js`, unless a record fully meets section 6. Put ledgers in `docs/research/<topic>-<date>.md` (and a CSV alongside where rows exceed about 30). Claude reviews the ledger first; only reviewed rows become records, in a separate PR.

### Ledger format (one row per claim)

| Field | Content |
|---|---|
| issuer | The body that published it (KUCCPS, CUE, TVETA, KNQA, the institution) |
| title | Document or page title as shown |
| url | The exact canonical URL you opened |
| observed | The date you opened it (and the document's own date if shown) |
| scope | Intake or academic year, institution and campus, programme and level it applies to |
| claim | What it establishes, in the source's words where possible |
| not_established | What it does **not** establish (offering, intake, fee, campus, current cut-off) |
| confidence | high / medium / low, with the reason |
| conflicts | Any other source that disagrees, with its URL |

Never write a URL, title or date you did not read. If a page could not be opened from your environment, record that as the finding.

### Workstreams, in priority order

The owner's order is **cost first** (what a learner will actually pay, and who helps pay it), then **depth at the institutions readers actually name**, then **programme families absent from the whole catalogue**, and only last the county-floor metrics. Do not open a pass on E-grade or D-grade counties; that metric is already instrumented, over-served and redundant.

| # | Workstream | Grain | Done when |
|---|---|---|---|
| R1 | **Source register verification.** `research/sources.json` has 7 entries whose URLs and "accessed" dates are unverified (one was corrected to `https://kuccps.net/Placem`). Open each, confirm the claim, record the exact page title and date. Replace broken deep links with verified official pages | source | Each entry is confirmed, corrected or marked unreachable, with evidence |
| R2 | **The 51 workbook leads.** `Njia_Expanded_Research_Source_Audit.xlsx` lists 62 rows of KMTC programme names (KUCCPS search) and TVETA course-directory names (exam body shown, provider **not** verified). 11 already match the catalogue by exact name; 51 do not (for example Mortuary Science, Optometry, Radiography, Certified Secretaries, the KenGen short courses). Find, for each, a named institution and a second source. Rows that cannot be tied to an institution stay leads | programme | Each row is tied to an institution with two sources, or stays a lead with the missing field named |
| R3 | **Funding freshness.** Re-check the 30 funding records: current call, `valid_until`, eligibility reach (record the level a source actually reaches, not its prestige), and whether any "no second cohort" or "no fee" statement has gone stale | funding record | Each record has a dated check; stale statements are listed |
| R4 | **The C+ degree-floor conflict.** People Daily reports KUCCPS planning to remove C+ as the minimum university entry grade from 2026/27; The Standard reports it staying at C+ for KCSE candidates for 2025 to 2027; a January 2026 Capital FM piece says some medical programmes accept C or below. Most degree records carry C+. Find KUCCPS's own current guidance (the placement page, the 2026/27 programme documents) and report what it says, with dates. **Do not change any `min_grade` in this workstream** | claim | A ledger stating what KUCCPS itself publishes for the current cycle, and which records it could affect |
| R5 | **Per-institution cost.** For the institutions a school-leaver names first, look for a published programme total on the institution's own domain. Search per institution, not per course. Two searches phrased **without** the figure must agree (a number in your own query cannot count as corroboration), the unit word (term, trimester, semester, year) must match, and the award must be the right one. Anything else is reported, not recorded | institution x programme | Each institution is priced from a published schedule, or its readings and the reason nothing was recorded are written down |
| R6 | **Programme families absent catalogue-wide.** Examples already measured as absent: building-finishing trades (tiling, glazing, roofing, panel beating, spray painting, upholstery), baking and pastry, driving instruction, speech therapy. NITA's own training centres are a category with no listed examples; the blocker is NITA's course brochure, which names no award levels in reachable sources | family | A named institution and award per family, or a lead naming the missing document |
| R7 | **Regulator downloads.** Where you can open them: the CUE approved-programmes file, the TVETA accredited-institutions list, the KUCCPS programme catalogue, the KNQA registered qualifications. Where you cannot, say which host refused | dataset | A loaded, dated, parsed extract, or a precise statement of the blocker |

### Leads and refusals already recorded (do not re-run)

- Private-university fee schedules: 23 institutions were attempted and all refused because the readings could not be reconciled. Do not hunt private tuition by general search; the route left is the institution itself.
- KMTC, E-grade and D-grade county work: closed or over-served. Do not open it.
- KNQF level mapping, graduate employment rates and per-course salaries: Kenya publishes no usable per-course figure. Do not fill them.

---

## 8. Redesign and upgrade workstreams

The direction is **international consultancy grade: findings before decoration, one grid, one accent, every figure carrying its unit, source and date.** It must not imitate any institution's identity, typeface, colour or asset.

### Design rules (all enforced or reviewed)

- **Tokens, not raw values.** Component rules reference custom properties declared in `:root` of `css/styles.css`. If you are typing a hex or a pixel in a component rule, the token is missing: add it.
- **Light-only rules are scoped to `:root[data-theme="light"]`**; the dark scheme ("warm ink") is untouched unless the task is dark mode itself. Generated pages carry no theme script.
- **Type has a floor of 12px** (`--fs-xs` to `--fs-lg`, 12 to 15px). `tests/type-scale.test.js` bans hand-written sub-1rem sizes.
- **No opacity on text.** The contrast guard bans it. AA contrast must hold in both schemes.
- **Motion:** 120 to 200ms, one entrance, `prefers-reduced-motion` respected.
- **Headings:** `h1` then `h2` then `h3`, no skipped levels.
- **A scroll container needs `tabindex="0"`** and a role and label, or a keyboard-only reader cannot reach the hidden columns.
- **A layout change that claims to save space must be measured** in document height and content width at 1440, 1920 and 390px, before and after. "It looks less empty" has twice been wrong. The owner's standing complaint is *too many blank spaces*.

### Workstreams

| # | Workstream | What and why | Acceptance |
|---|---|---|---|
| D1 | **Space pass on the generated pages** | Landing, county page and Decide were measured and tightened. The grade pages, careers, pathways, methodology, research, counsellors and sources pages were not | Document heights at 1440, 1920 and 390 before and after, per page, in the PR; no loss of content; axe clean both schemes |
| D2 | **Extend the exhibit component** | Exhibit = label, action title computed from the data, unit, figure, source line (`exhibit()` in `tools/build-static-pages.mjs`). It is on `/research/` and the pathways ladder. Candidates: careers, counties, grades. Titles must be computed, never typed, and a test must recompute them | `tests/exhibits.test.js` extended; every title recomputed from data; print and dark checked |
| D3 | **Board-style report** | The report a learner prints or saves: cover, summary, exhibits, pathways, funding, methodology and limits, sources appendix. The print path already exists (`beforeprint` is the outcome signal; do not fire the milestone on intent) | Print emulation of the real report; header and date present; no truncated columns; a pure function tested where logic is added |
| D4 | **Photography and imagery** | **Blocked on the owner.** Prepare an art-direction brief (subject, framing, licensing route, alt-text policy, file-size ceiling) for the owner to approve. **Do not add or generate images** | A brief document only |
| D5 | **Landing refinement** | Hero, proof exhibits, three-step path, trust block. Target a measured height reduction, not a feeling | Before and after heights; Lighthouse is evidence in neither direction, so also report gzipped bytes on the audited page |
| D6 | **`/research/sources/` polish** | Already generated from the register with the shared shell. Make each entry read as an exhibit; keep the register's own wording; keep the line saying Njia has not confirmed every link is live until R1 completes | Test that the page carries every register entry |

Anything that adds bytes to `index.html`, `css/styles.css`, `js/app.js` or the data files loaded on first paint must report the gzipped delta.

---

## 9. What Claude checks before any merge (your pull request will be held to this)

1. **Diff matches the description.** Every file in the diff is explained; nothing the description denies is present.
2. **Syntax and tests.** `node --check` on every changed `.js`; the full unit suite re-run, failures counted.
3. **Generators.** Re-run in order; second run produces no diff; `git diff --exit-code` after.
4. **Browser gates.** Functional probe and axe sweep re-run on the final tree, both schemes and both viewports, including every new page. New pages must be added to the sweep.
5. **Look at it.** Screenshots at 1440 and 390 in both schemes and a print emulation of any page you touched.
6. **Provenance review.** Every new figure, grade, date and claim traced to a source you listed, with a date. Unreachable or paraphrased sources are rejected, not rounded up.
7. **The four rules in section 2.** One breach is a no-go.
8. **Payload.** Gzipped delta on the critical path, and `CACHE_VERSION` bumped if a cached file changed.
9. **Surfaces.** A new generated page is in the served link, `sitemap.xml`, `llms.txt` and the `SURFACES` list in `tests/seo.test.js`.
10. **Preview.** The Netlify deploy preview is ready and inspected. The red GitHub Actions check is expected; it is not a gate.

**Go** only when all of the above hold and the owner has approved. **No-go** if a critical test fails, generated files drift unexplained, a core journey breaks, a claim is materially misleading, or the preview cannot be inspected. After merge, Claude confirms the production deploy by reading `commit_ref` (never `state: ready`, which has been stale). "Merged" and "live" are different claims.

---

## 10. Report format for every iteration

```text
Branch / head SHA:
Workstream(s):
What I read (URL, title, date opened):        <- research
What I changed (files):                       <- redesign
Figures added or changed, each with its source:
Not established / could not verify:
Commands run and exact results:
  unit suite:            tests / pass / fail
  node --check:          result
  functional probe:      result, or "not run: reason"
  axe sweep:             states / violations, or "not run: reason"
Measurements (document height, gzipped bytes) before and after:
Screenshots / print checks done:
Open blockers:
Release recommendation: GO / NO-GO, with reasons
Next three actions:
```

---

## 11. Decisions that belong to the owner (do not decide them yourself)

- **Photography and art direction** (D4): needs an approved brief.
- **An AI provider and budget** for any assistant feature, and any feature that stores or transmits learner data. Njia is accountless by design; anything that changes that needs legal review under the Kenya Data Protection Act 2019 first.
- **A working mailbox** on the project domain (it has no mail exchanger today, so the contact route is the GitHub issue tracker).
- **New typefaces**, a new dependency, or any change to the buildless architecture.
- **Changing a recorded entry grade** (R4 reports; it does not edit).

---

## 12. Definition of done for the whole programme

- [ ] Every research claim is in a dated ledger with its limits stated.
- [ ] No figure, grade or date was recorded without a source.
- [ ] Source register entries confirmed, corrected or marked unreachable (R1).
- [ ] Each design change measured before and after, clean in both schemes, viewports and print.
- [ ] Generators re-run; no drift; `CACHE_VERSION` bumped where needed.
- [ ] Unit suite, probe and axe results pasted, not asserted.
- [ ] Claude has reviewed; the owner has approved; production `commit_ref` confirmed after merge.

**Start with R1 (source register verification) and D1 (space pass). Both are bounded, both produce evidence the reviewer can check quickly, and neither touches the catalogue.**
