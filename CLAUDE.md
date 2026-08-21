# Working notes for Njia

Standing instructions for anyone — human or agent — working on this repository.

## Research: use WebSearch, never WebFetch

**Do not use WebFetch on this project.** It is not a preference, it is a
standing instruction from the maintainer.

It is also useless here. The network egress policy in the build environment
blocks essentially every host that matters — every Kenyan government domain
(`tveta.go.ke`, `kcaa.or.ke`, `knqa.go.ke`, `kra.go.ke`), every university
site, every course aggregator (`kenyaplex.com`, `elimucentre.com`,
`colleges.co.ke`), Kenyan news sites, and even `en.wikipedia.org`. A fetch
attempt costs a round trip and returns `EGRESS_BLOCKED`.

**WebSearch works and is the only external channel.** It returns titles, URLs
and a summary of the result content, and that summary has been good enough to
source real figures — the consolidated public-TVET rate of Ksh 67,189, KMTC's
national schedule, the EACFFPC's Ksh 35,000 per semester, the College of
Insurance fee bands, and the whole KNBS Economic Survey 2026 sector table.

**Search per institution, not per course.** Per-course queries return nothing.
Naming the institution, the qualification family and the year works.

Never route around a block — no archive mirrors, no proxies, no cache
services. If a host is blocked, say so and move on.

## The core pillar: a figure is either sourced or absent

Njia's whole claim is that its numbers can be checked. That makes an invented
figure worse than a missing one, because a missing figure prompts a phone call
and an invented one prompts a plan.

Rules that the test suite enforces, and why:

- **Five fee bases partition the catalogue exactly** — `published`,
  `derived`, `illustrative`, `unpublished`, `unsourced`. They must sum to
  `COURSES.length`. A sixth, unnamed outcome once hid 48 records that were
  displaying a precise tuition figure with no badge and no mention in the
  provenance paragraph.
- **`published` is a declared claim, never a default.** A record earns the
  strongest badge — "✓ Fee published by the college" — only by setting
  `fee_observed: true`, meaning someone read that total off the institution's
  own schedule for that course. Everything else falls to `derived`. This used
  to be inferred by matching four phrases in `verification_note`, which meant
  the strongest claim in the app was the fall-through case: eleven records
  said "annual rate across the course duration" instead of "scaled to course
  duration" and were promoted a tier for it. If you add a record, do not
  reach for `fee_observed` to make a number look better — a synonym must
  under-claim, never over-claim.
- **A caveat in the note does not reach the reader.** Ksh 560,000 rendered on
  a UoN degree under a verification tick while the note beneath it called the
  figure a four-year mid-range estimate. If the number is not the thing you
  can defend, remove the number; prose underneath it does not qualify what a
  card displays to the shilling.
- **A fee of 0 must claim to be free in words, with a source.** Otherwise a
  missing value masquerades as the most precise figure in the catalogue.
- **A record with no fee must say *which kind* of absence it is** — the
  institution publishes none, or Njia could not verify one that exists. The
  guard requires the literal phrases (`does not publish`, `publishes no fee`,
  `could not be verified`, `not reachable`), so write one of them.
- **Never price a public university from the Differentiated Unit Cost.** It
  was retired in May 2023 for the Student-Centred Funding Model, under which
  what a student pays depends on an assessed means band. There is no single
  per-programme price to quote.
- **Never repeat one figure across unrelated institutions.** See below.

- **There is no longer an "uncited fee" tier, and there must never be one
  again.** Forty records once carried a precise figure — some as high as Ksh
  720,000 — with no verification note at all. That is the weakest thing this app
  can display, because a confident number with nothing behind it is
  indistinguishable from a researched one. The count went 40, then 19, then
  zero, and `LEGACY_CEILING` in `tests/sector-coverage.test.js` is now a floor
  rather than a ceiling.

  The last nineteen were **not** closed by finding the fees. Eight were public
  universities, where there is no per-programme price to find — the DUC was
  retired in May 2023 for the means-tested SCFM, so the honest answer is that
  the university does not publish one. The other eleven are private
  institutions whose schedules are PDFs on their own sites, which this build
  cannot reach; searching returned only per-institution ranges (KCA's
  Ksh 28,400–55,867 per trimester, KIM's generic Ksh 110,000 diploma total)
  that cannot be attributed to a named course.

  Attaching one of those ranges to a specific course would have promoted the
  record from `unsourced` to `illustrative` on provenance that does not exist —
  a worse outcome than the figure being missing. So the figures were removed and
  each record now says which kind of absence it is. **When research fails, the
  answer is to delete the number, not to write a note that dresses it up.**

## Findability is not the SEO score

Lighthouse reported SEO 100 for months while the app was effectively invisible
to the people it exists for. The score measures markup hygiene. It cannot see
that a single-page app renders everything client-side, so a crawler got **987
characters** of chrome and a sitemap with one URL.

Netlify Analytics made the cost legible: over thirty days the top locations
were the United States and Canada. For a Kenyan product that is developer
traffic, Lighthouse runs and crawlers — not readers.

A learner does not search "career pathway platform". They search "TVET courses
in Turkana", "courses I can do with a D plain", "KMTC September intake". There
was nothing to rank.

`tools/build-static-pages.mjs` generates a page per county and per grade, committed
like the icons and the share card, guarded by `tests/seo.test.js`. Rules:

- **They must never become doorway pages.** Each carries its county's real
  course table, and where the lowest entry requirement is above E it tells the
  reader outright that nothing on the page is open to them and points at the
  TVETA register. A test enforces that sentence.
- **Root-relative assets, absolute canonical.** Absolute stylesheet URLs render
  every deploy preview unstyled.
- **The app must link to them in the SERVED HTML** — a client-rendered link
  leaves 48 pages unlinked to a crawler. It lives in `<noscript>`, because a
  second skip link tripped axe on all 32 states.
- Regenerate whenever the catalogue changes; the mtime guard fails otherwise.
- **A grade page is only generated where the grade narrows the catalogue** —
  the cut is 85% reachable. Pages for A, A-, B+ and B would list 429–436 of 436
  courses each: the same page four times, which is duplicate content and the
  doorway pattern by another route. C and below is also where the question is
  actually asked.
- **Course identity is (name, institution), not name.** Five institutions run a
  "Bachelor of Science in Nursing" at B, B, C, C+ and C+; a name-only test
  flagged the C page for listing the B ones when it was correct.

**One list, not a guard per surface.** The fifth instance was the partnership
proposal: `docs/njia-pitch-deck-aug-2026.pdf` was linked from exactly one
place, a footer link `js/app.js` draws client-side. Not in the served
`index.html`, not in the 53 generated pages, not in `sitemap.xml`, not in
`llms.txt`, with no landing page of its own — and its audience is a funder or a
ministry contact, every one of whom arrives by search or by a forwarded link,
the two routes that cannot run JavaScript.

There were already three guards for exactly this, one each in
`open-data.test.js`, `provision-analysis.test.js` and `seo.test.js`, each
written when its own surface shipped. **That is the flaw.** A per-surface guard
has to be remembered by the person adding the next surface, which is precisely
the thing that keeps not happening. `seo.test.js` now holds one `SURFACES` list
and checks all three properties — served link, sitemap, `llms.txt` — at once.
Add a surface, add a line.

## The app is not the whole site

This mistake has now been made **five** separate times, by five different
routes, and every instance had the same shape: something was verified in the
app, worked in the app, and was silently absent from everything else.

- **Dark mode.** The scheme is keyed to `data-theme="dark"`, an attribute an
  inline script in `index.html` stamps pre-paint. The generated pages carry no
  script on purpose, so every county and grade page rendered cream at midnight
  on a phone set to dark, for as long as both had existed.
- **The accessibility sweep.** Its first section was labelled "static pages" and
  loaded `/index.html`, then drove `navigateTo()` — it was auditing the app's
  routes. The label had been wrong since it was written, and the committed pages
  had been audited in neither scheme. Adding them found **76 serious violations**
  immediately: every scrollable table was a scroll region that could not take
  focus, so at 390px a keyboard-only reader could not reach the Tuition column.
- **The favicon.** `index.html` declared an SVG icon and a PNG fallback; the 54
  generated pages declared only the SVG. A browser without SVG-favicon support —
  older Android WebView, in-app browsers, which is this audience's hardware —
  got no icon at all on any of them.
- **The print header.** Ctrl-P on a county page produced a branded brief. The
  grade pages went without, so the sheet a *career teacher* prints came off the
  printer unbranded and undated, while the sheet for a county officer was a
  proper deliverable.

When you add anything that affects presentation — a theme, an asset, a meta
tag, a print rule — the question is not "does it work" but "does it work on the
53 pages that have no JavaScript". Assume it does not until you have opened one.

## A green suite is not evidence

Every defect worth fixing this session was found by measuring, printing, or
driving the rendered page. **Not one was found by the test suite**, which stayed
green through all of them: 9.6px body text, dark mode missing from 53 pages, 76
unfocusable scroll regions, four FAQ answers invisible to every JavaScript
reader, a help page throwing on render, a form label sheared in half, and a
404 favicon.

That is not an argument for fewer tests. Every one of those defects now has a
guard, and the guards are what stop them coming back. It is an argument about
what the suite is *for*: it protects against regression, and it does not find
anything. Finding needs `emulateMedia('print')`, a screenshot you actually look
at, a measurement of the rendered box, or a request for the URL a crawler asks
for.

Two specific blind spots worth naming, because both look like coverage:

- **axe cannot see type that is too small.** All 56 states passed while text sat
  at 9.6px. WCAG governs contrast and resize behaviour, not a minimum size.
- **A guard that reads source text cannot see broken structure.** The FAQ parity
  check matched question strings in the source and passed while the help page
  threw `undefined is not iterable` on render — both questions *were* in the
  text. It now evaluates `HELP_FAQ` and checks every entry is a real pair.

A third, found by an audit that turned all four layers green and then went
looking anyway: **every layer runs against a server where every request
succeeds.** Nothing here had ever asked what happens when a file does not turn
up, and the answer was that the app stopped — `renderRoute()` retried a missing
page module by awaiting a cached promise that resolved on failure, so it
re-entered on the next microtask and never yielded. Main thread silent for 6s, a
click timed out at 4s. 253 unit tests, 21 functional checks and 64 axe states all
green. `tests/functional-probe.mjs` now has a degraded-network section that
aborts a real request in a real browser, with service workers **blocked** — an
installed worker serves the module from its precache and the failure cannot be
reproduced at all, which is a genuine second line of defence and exactly why the
section has to opt out of it. The exposure is the first visit, before any cache
exists, which is when a new reader on a weak signal arrives.

**A lazy split is a dependency graph, and these are classic scripts.** Moving
the catalogue off the critical path — 86.3KB gzipped of `data/courses.js`,
`data/institutions.js` and `js/decide.js`, to render eight integers on a page
that shows no course — took DOMContentLoaded on throttled 3G from **5,661ms to
3,605ms, a 36% cut** (median of five, alternating, over a gzipping server; first
paint moved only 176ms because it waits on the stylesheet, so this buys
interactivity, not appearance). The figures are precomputed by
`tools/build-landing-stats.mjs`, which calls the *same* `feeBasis()` and
`sectorForCourse()` rather than a second copy, and `tests/landing-stats.test.js`
recomputes every field — so they still cannot silently go stale.

The trap is that there are no `import` statements to read. Deferring `decide.js`
once threw `feeBasis is not defined`; listing only the data files for Discover
threw `GRADE_ORDER is not defined`, because the report's suggestion sort uses
`GRADE_ORDER` and `meetsGradeRequirement`, both defined in `decide.js`. **Same
mistake, twice, and both times the unit suite was green and the functional probe
caught it.** `tests/landing-stats.test.js` now reads the top-level declarations
out of `decide.js`, finds which page modules reference them, and requires
`PAGE_MODULE` to list the provider — and checks the *order*, because
`async=false` makes insertion order the execution order and `decide.js` builds
its county list at module scope.

**And making it lazy must not make it optional.** Nothing in the served HTML
references the catalogue any more, so `CACHE_ASSETS` is now the only thing
putting it on the device. Verified by installing the worker, going offline and
driving the app: Decide renders "469 of 469 places to apply match" with the
network down.

**And a guard can fail its own failure message.** `every printable sheet carries
the branded header` reported that a failing page prints with "no Njia header,
date or address", and checked only that the header `<div>` existed. It existed on
all 53 pages and carried **no date on any of them** — found by print-emulating
the pages and searching for a date token, not by reading the test. This is the
paraphrase trap from the Dataset caveat one level up: there the guard accepted a
paraphrase of the claim, here it accepted a *substring* of it. When a failure
message lists three things, assert three things.

## Type has a floor, and it is 12px

An audit found **nineteen distinct sub-1rem font sizes** in `css/styles.css` —
0.6, 0.65, 0.66, 0.68, 0.7, 0.72, 0.74, 0.75, 0.76, 0.78, 0.8, 0.8125, 0.82,
0.85, 0.86, 0.88, 0.9, 0.92, 0.95rem — several within a third of a pixel of each
other on screen. That is not one decision repeated nineteen times, it is a
decision never made: each value was picked to make one component look right and
none of them knew about the others. Seven rendered below 12px; the smallest
carried real content at 9.6px.

They are now four tokens — `--fs-xs` through `--fs-lg`, 12 to 15px — with a hard
floor, guarded by `tests/type-scale.test.js`. The guard bans hand-written
sub-1rem values entirely, because the failure mode is not someone lowering a
token, it is someone adding a twentieth size for one new component.

The floor is not a style preference. These readers are on cheap Android phones,
often outdoors in bright light, and a real share of the adult-learner audience
the app deliberately courts is over forty. 9.6px is not density for them, it is
an exclusion — the same category of mistake as an entry grade recorded a tier
too high, because it removes information from the person least able to work
around it.

## Reclaiming space can cost more than it saves

The generated pages once sat in a 957px column at 1600px, leaving ~40% of the
viewport empty while the six-column table wrapped "Open entry", "Not published"
and "Ksh 134,378" onto two lines each. The reader was paying for the margins
twice — once in emptiness and once in scrolling.

The fix is a rail-plus-content split at **85rem**, and both numbers in that
sentence were arrived at by measuring after a first attempt made things worse:

- **The split first cut in at 64rem and lengthened the page.** A rail plus its
  gap left the Nairobi table 621px, *narrower* than the 957px it had, so it
  scrolled sideways and wrapped harder: 9,099px of document became 12,074px. A
  layout meant to reclaim wasted space spent 3,000px of extra scrolling doing
  it. The rail only pays once what is left fits the table, which for six columns
  is about 950px.
- **`white-space: nowrap` on the short columns is gated to 48rem and up.** At
  390px it widened the table from 647px to 738px and the page got no shorter
  (13,580 to 13,560px). The rows were never the constraint on a phone, the
  viewport was, so all it bought was 91px more sideways scrolling.

**Two more measured attempts, one kept and one rejected.**

- **Kept: `--page-max` 1480 → 1760.** At 1920 the Decide grid sat at 1120px
  inside a 1480px container, fitting three 362px columns; course cards are
  ~964px tall, so narrow columns wrap harder and the page grows. Raising the
  cap took Decide from 9,560px to **8,368px** and the grid to four columns.
  Nothing below 1480 moved — 1440, 1280 and 390 measured identical, because a
  container narrower than its own cap never touched it. Prose is unaffected:
  it is capped separately by `--prose-max` at 68ch, which is why those are two
  tokens rather than one.
- **Rejected: two-up cards on Connect.** It looked like the obvious next win —
  five cards stacked single-file in a 1,332px column. Measured, it saved
  **30px at 1920 (1.5%) and cost 148px at 1440 (6.7%)**. Two reasons, both
  general: a grid row is as tall as its tallest card, so pairing tall and
  short cards banks nothing; and these cards hold prose, so halving their
  width makes them wrap. Cards full of running text do not behave like a
  course grid, and a layout that helps one can hurt the other on the same page.

The general rule: a layout change that claims to save space has to be measured
in *document height and content width at several viewports*, before and after.
"It looks less empty" is not the same as "the reader does less work", and on a
phone the two frequently point in opposite directions.

## Measurement: count steps, never people

Njia takes exactly one usage measurement. A milestone — questionnaire finished,
course saved, application started, report downloaded — requests a static marker
file from `/m/`, and Netlify's server-side analytics reports how many times each
path was asked for. That is the whole mechanism.

The properties that make it acceptable are enforced in
`tests/analytics.test.js`, not promised in a comment:

- **The path is the entire message.** No query string, no body, no second
  argument at any call site. `recordMilestone()` may not touch `AppState`,
  `localStorage`, `uid()` or a timestamp — anything that could correlate two
  requests into a session turns a count into a trail.
- **Every name has a marker file and every marker file is fired.** A missing
  file 404s and reads as "nobody got there", which is a wrong answer that looks
  like a real one.
- **The service worker must never answer `/m/`.** Cached, every visit after the
  first is served locally and the count collapses to first-installs.
- **`robots.txt` excludes `/m/`.** A crawler fetching a marker is
  indistinguishable from a school-leaver reaching that step, and it errs in the
  flattering direction.
- **The privacy modal says all of it in the reader's words.** It used to promise
  "no analytics of any kind"; that sentence was withdrawn rather than left
  standing with a caveat elsewhere, and a test fails the build if it returns.

Fire on the state *transition*, never on the render — `finishQuestionnaire()`,
not the results page, which re-renders on every reload of a completed
questionnaire and would count one person many times.

Figures are a **floor**: DNT and Global Privacy Control suppress everything, and
offline readers are never counted. Queueing events until a device reconnects
would mean storing behaviour on a reader's phone, which is the worse trade.

## Under-claim on a figure. Never on an eligibility.

"When sources conflict, record the more restrictive figure" is this project's
instinct and it is usually right. It is **backwards for entry grades**.

Quoting a **fee** high leaves a reader pleasantly surprised. Quoting a **grade**
high removes the card from their screen altogether — the learner never discovers
the course exists and cannot even ring up to ask. The conservative direction on
money is the exclusionary direction on eligibility.

Sixteen artisan records at Kisumu and Eldoret national polytechnics carried a
minimum of D for exactly this reason, deliberately and with the reasoning
written in the note. It hid two national polytechnics from the readers with the
fewest options, and it was why those counties still read as blind while their
polytechnics sat in the catalogue.

**E is the KUCCPS national floor for artisan (Level 4) placement.** No artisan
record may sit above it beyond the D- some institutions publish — guarded in
`tests/sector-coverage.test.js`. Where sources genuinely conflict, show the
course at E and put the conflict in the note: a reader told to confirm keeps
their agency; a reader shown nothing does not.

Before adding a course, check whether the institution is already listed. Kisumu
National Polytechnic already had all five artisan courses that looked missing —
the duplicate guard caught the attempt to add them again.

## An either/or in a published requirement is not a floor

Sigalagala (Kakamega) and Siaya National Polytechnic both publish their artisan
minimum as **"a KCPE certificate or a KCSE mean grade of D-"**. Seven records
read that as D- and wrote the reasoning into the note: "the explicit KCSE figure
is recorded rather than reading the slash as open entry".

That is the Kisumu/Eldoret mistake again, at two more institutions, and it was
what left Kakamega and Siaya reading as blind while their own national
polytechnics sat in the catalogue. **A KCPE certificate is an alternative to the
KCSE grade, not an addition to it**, so a learner holding an E clears the
published bar. KCPE is not marked in letter grades at all, which is why "KCPE
mean grade D-" cannot be the reading.

It was not even a judgement call by the time it was found: five institutions
with the identical wording — Kisumu, Eldoret, Kisii, Michuki, Bureti — were
already at E, one of them saying outright "or a KCPE certificate, so an E clears
it and E is recorded". Two were out of step with sixty. **When a record's own
note explains why it departs from the rule, read the explanation — that is where
this kind of error announces itself.**

## A proxy guard fails on data that got better

`artisan entry grades reflect what each institution publishes` required **three
or more distinct entry values** across the artisan tier, on the reasoning that
institutions publish different bars. Its comment named four: "Eldoret states D,
Sigalagala D-, Meru D- or KCPE, Kabete E". Every one had since moved. The tier
now legitimately holds two values, E and open, so the count fell to two and the
guard failed — **on data that was more correct than the data it was written
against**.

Variety was never the property worth defending; it is an accident of which
institutions happen to be listed. The property is that **no record claims the
floor without evidence for the floor**. Asserted directly — a record at E must
say *why* E in its own note — it immediately found eight records the count could
never see, at Lodwar, Mandera and Laisamis. All eight were correct: they word
their open tier as "open-ended" and "other course categories open", so the
guard's vocabulary was widened rather than the records changed, exactly as the
Don Bosco and St. Kizito case in the same file already records.

Two smaller traps from the same change. **Break a guard properly before
believing it works** — the first attempt to prove this one stripped one KCPE
mention from a note that contained two, saw no failure, and nearly concluded the
guard was inert. And **`COURSES` comes out of a `vm` context**, so arrays
derived from it carry that realm's `Array` prototype and `deepStrictEqual`
rejects them against a literal `[]` even when both are empty. That is why every
other check in `provenance.test.js` joins to a string first.

## Money may reach Njia, but never the catalogue

Njia is free to every learner and funded from the institutional side: county and
institutional deployment, data licensing, programme funding, and paid
institution listings. All four are set out on `/docs/`, which now carries a
contact address — it previously carried none, so a funder could read the whole
proposal, spend 2.6MB on the deck, and have nowhere to write. **A conversion
path that ends in a dead end is worse than one never built**, because the reader
has already spent the attention.

The listing route is the one that could end the project, so its refusals are on
the page in the reader's words rather than in a policy nobody opens, and
`tests/partnership.test.js` asserts them **one at a time**:

- Payment never affects **ranking or ordering**. No paid placement.
- Payment never affects a **fee basis or an entry grade**. A paid listing meets
  the same provenance standard as every other record.
- A paid listing is **disclosed** as one.
- A listing that cannot be honest is **declined**, and the money with it.

A page keeping three of the four has kept most of a sentence and lost the claim,
which is why the guard does not accept the paragraph as a whole. The address
must also stay byte-identical between the page and `llms.txt`: an answer engine
quoting a mailbox the page does not advertise is the same dead end by a longer
route.

## The yield floor is real, and Nakuru is still behind it

Three fresh searches against Rift Valley National Polytechnic confirmed its
artisan bar again — "KCPE or KCSE mean grade of D- and E", so an E clears it —
and returned **not one artisan course name**, the same result recorded the last
time. The course lists are in institutional PDFs on egress-blocked hosts.

Kenya's **first e-mobility curriculum** — Electric Vehicle Assistant Technician,
NSC II, **KNQF Level 3**, developed by Pamoja for Transformation with GIZ WE4D,
the WTS Foundation and NITA — is a genuine finding and sits *below* artisan,
which makes it precisely this catalogue's reader. It is still a pilot training
180 trainees with **no named delivering institution**, so it yields a lead and
not a record. Recording it against a plausible polytechnic would be the
placeholder trap with a curriculum attached.

## Coverage: measure what a reader can reach, not what exists

County coverage was tracked as "single-cluster counties". That metric flattered
the catalogue, because it counts what EXISTS rather than what a given reader can
REACH. Twenty-three counties held one KMTC campus running nursing at C+ and D+,
so a school-leaver with a D or an E who filtered Decide to their county and
their grade got an **empty list** — not a short one. To the person least able to
move away from home, that reads as "there is nothing here for you", and it was
never true: Njia simply had not listed the county technical provision.

The metric is now the **eligibility floor**, ratcheted in
`tests/sector-coverage.test.js`: the number of counties where an E-grade learner
sees nothing may fall but never rise, and the four closed deliberately (Turkana,
West Pokot, Mandera, Marsabit) are named so a future edit cannot quietly reopen
one inside an aggregate that still looks fine. Twenty remain — lower the constant when you close more. It was 23; Kakamega and
Siaya were closed by re-reading an either/or in a published entry requirement
rather than by finding new provision, and Bomet from the funding side.

**The gap is almost always a missing institution, not a missing course.** Eight
counties were closed in one pass by searching per county for its technical
college and finding one that had never been listed — Baringo Technical College,
Bumbe TTI (Busia), Kaiboi National Polytechnic (Nandi), Kisii National
Polytechnic, Taita Taveta National Polytechnic, Michuki National Polytechnic
(Murang'a), Bungoma National Polytechnic and Bureti TTI (Kericho). Every one of those counties already had a KMTC campus and a
university in the catalogue and still read as blind, because the tier that was
missing was artisan — the only tier this metric's learner can enter.

The query that works is the county TVET roll-up first (`Technical and Vocational
Education Training institutions in <county> County`), then the named institution
(`<institution> artisan courses list entry requirements`). Going straight to the
institution fails when you do not yet know its name, and the roll-up alone names
no courses.

**Watch for the name collision.** Rift Valley National Polytechnic (Nakuru,
formerly RVIST) and Rift Valley Technical Training Institute (Eldoret) return in
each other's result sets, and the Eldoret one is already listed. A course
attributed to the wrong county is worse than a missing one.

Every county in Kenya has public technical provision. When a county looks empty,
the gap is in this catalogue, not in the county. Find the institution by naming
the county and searching per institution, then list only the courses a reachable
source actually names — all four of these run more than is listed, and each note
says so rather than padding the catalogue with plausible programme names.

**The search has a yield floor, and it has been reached for the thin counties.**
Eight searches across Nakuru, Kwale, Makueni, Kitui and the county roll-ups
returned exactly one usable institution-level fact — that Rift Valley National
Polytechnic's published artisan minimum is "KCPE or KCSE mean grade of D- and E",
so an E clears it — and **not one artisan course name**. Wote TTI (Makueni) went
the same way: entry confirmed at "D- downwards", 80+ courses claimed, names
surfaced only as a mixed-level fragment prefixed "some specific course examples".
The course lists live in institutional PDFs and every host is egress-blocked, and
the summariser bleeds RVTTI/RVIST results into every RVNP query.

A confirmed institution with no sourced course name yields **no record**. Not a
plausible one, not a "Certificate in General Studies" placeholder. The 14
remaining thin counties each hold one KMTC campus and two courses; closing them
needs a source this environment cannot currently reach, and saying so is the
honest end of that thread rather than a reason to invent the last mile.

## Funding is a barbell, and Njia's reader is in the gap

A sweep of the funding landscape — government, county, constituency, corporate,
faith-based, foundation and overseas — found the same shape the county metric
found, for the same reason.

Provision is heavy at **both ends and thin in the middle**:

- **Before KCSE.** Palmhouse (Form 1, KJSEA), Equity Wings to Fly, Elimu, and
  the Safaricom/M-PESA Citizens of the Future programme all fund *secondary*
  schooling. Generous, well-publicised, and over by the time a learner has a
  KCSE grade in hand.
- **Above C+.** Safaricom Foundation (university degrees, STEM and health),
  Mastercard Foundation, Zawadi, and every overseas scheme worth naming —
  Chevening, DAAD, MEXT, CSC, Fulbright, Erasmus Mundus, Australia Awards — are
  degree or master's programmes. Fully funded, and structurally closed to a
  learner with a D.
- **In between, where Njia's core reader stands**, there are four things:
  NG-CDF, the county bursary, the HEF/HELB TVET window, and a small number of
  regional employer trusts.

**The two universal ones have the shortest windows.** NG-CDF reaches every
constituency in Kenya and its 2025/26 cycle issued forms on 8 December and
received them only between **5 and 9 January** — five days. That is the widest
net in the country closing faster than any scholarship on the list, and it is
the one a reader is least likely to hear about in time. Timing is the product
here, not the amount.

Rules that follow:

- **Record the level a source actually reaches, not its prestige.** A Chevening
  entry impresses; it does not help the reader this app exists for. Where a
  source is degree-only, the record has to say so plainly enough that a D-grade
  learner does not spend a week on an application they cannot win.
- **Do not conflate funding streams that use different denominators.** The
  existing TVET record cites HELB *loan* figures (339,726 applications, 157,376
  funded). Sector reporting also gives a *scholarship* stream (440,826 targeted,
  89,054 funded). Those are different programmes; quoting one shortfall against
  the other's base would be a fabricated statistic assembled from two true ones.
- **A scholarship listing is also an institution register.** Bomet was closed
  from the funding side: the Finlays Community Trust names Konoin TTI as one of
  two institutes its scholars attend, and Konoin had never been in this
  catalogue. When the provision searches come back dry for a county, read who is
  paying for training there.

## Being found is three circuits, not one

Submitting a sitemap to Google Search Console is the only discovery step that
genuinely needs the maintainer's credentials. Treating it as *the* discovery
problem was too narrow — there are two other indexes Njia can enter from here,
with no credentials at all, and it was in neither.

- **Rich results.** The county and grade pages carried an `ItemList` of `Course`.
  `index.html` — the most-linked URL on the domain, where every share and every
  backlink lands — carried **nothing**. A crawler at the front door learned less
  than one three clicks in. It now emits `Organization`, `WebSite` and a
  `FAQPage` built from all 48 `HELP_FAQ` entries.
- **Google Dataset Search.** `/open-data/` and `/analysis/` are datasets and are
  now marked as `Dataset` with real `distribution` URLs. That is a *separate
  index with a separate audience* — researchers, journalists, county planners —
  who will never search "TVET courses in Turkana" but do search
  datasets.google.com. Njia holds the only fee-provenance dataset in the country
  and was absent from the index built to find it.
- **Answer engines.** `llms.txt` is what ChatGPT Search, Perplexity, Gemini and
  Claude read. Its most important content is not what Njia offers but **what
  Njia refuses to claim** — no employment rates, no public-university fee, and
  that a zero describes the catalogue rather than the county.

**Markup is invisible, which is exactly why it needs weighing.** The first
version of this work also emitted a `FAQPage` covering all 48 `HELP_FAQ`
entries on `index.html`. Measured afterwards: **11.24KB gzipped**, taking the
page from 15.62 to 27.18KB gz — a **74% increase on the one page every learner
loads first**, on the cheap Android phones this project designs for. What it
bought was nothing: Google restricted FAQ rich results to government and health
sites in August 2023 and **deprecated them entirely on 7 May 2026**.

**And Lighthouse could not see any of it.** The preview scored 96 with the
FAQPage and **96 again with it removed** — an 11.24KB gzipped swing on the
audited page moved the number not at all. I had briefly claimed the drop was
caused by the payload; it was not, and the correction matters more than the
original point. On this site the Performance score is dominated by the ~220KB
gz of JavaScript every page loads, so an 11KB HTML delta sits below its
resolution entirely.

The real lesson is sharper than "check whether the diff touched `index.html`":
**a payload argument has to stand on its own bytes, because the score is
evidence in neither direction.** Removing this was right on the measurement and
on the dead-feature grounds, and would have been right if the score had gone
*up* by a point. `Organization` and `WebSite` stayed, at 0.32KB gz; a test
guards the FAQPage's absence, because re-adding it reads like free SEO and is
neither free nor SEO.

The rule that follows: **structured data is written for a reader who cannot push
back.** A person who sees a wrong fee rings the college. A machine republishes
it as a rich result to people who never reach the page. So the JSON-LD is held
to the course-card standard plus one more — it may not assert anything the app
does not — and `tools/build-structured-data.mjs` therefore *reads* `HELP_FAQ`
and the catalogue rather than restating them. A third hand-written copy of the
FAQ would be a third thing free to drift.

It runs **last**, because it injects into pages the other generators own.

**And beware a guard that accepts a paraphrase.** The Dataset caveat test first
matched `not a census` OR `what Njia has listed`. Deleting the sentence that
actually explains what a *zero* means left both hedges in place and the test
passed — found by deleting it and watching nothing happen. It now requires the
specific sentence. A guard that accepts a paraphrase of the wrong claim is not
guarding the claim.

## The analysis layer: a zero is about the catalogue, not the county

`/analysis/` publishes the eligibility floor as a 47-row table, generated by
`tools/build-provision-analysis.mjs` and guarded by
`tests/provision-analysis.test.js`. It exists because the most decision-changing
number this project holds lived only as a constant in a test file.

The finding it carries: **23 counties list nothing an E-grade leaver can enter,
and 21 of those 23 list no artisan course at all.** The blindness is one missing
tier, not a high bar — which is why the fix is an institution rather than a
filter, and why the "single-cluster counties" metric never saw it.

Rules for anything published at this level of aggregation:

- **A zero must be disclaimed where it is read, not in a footnote.** The
  disclaimer is in the first screen, in a bordered block, in the meta
  description and in a test, because this is the page that gets screenshotted
  into a slide deck with the prose cropped off. "Turkana has no artisan
  training" is a sentence that could defund the thing it misdescribes.
- **Every figure asserted in prose is recomputed from `data/courses.js` in the
  test**, not compared against the generator's own variables. A brief whose
  headline disagrees with its own table is worse than one with no headline.
- **Highlight only the zeros that are findings.** The first render flagged all
  of them, which meant 34 highlighted zeros under Degree — where zero is normal,
  most counties have no university — and 43 under fees, where zero is so nearly
  universal it says nothing. Emphasis spread across everything is not emphasis;
  the two zeros that matter were invisible in the noise. Three columns now carry
  it: artisan, at E, at D.
- **A distinction stated must be drawn.** The caption promised closed counties
  were "named in bold" while every `<th>` rendered bold by default. Unflagged
  rows had to be lightened for the flagged ones to be the bold ones — a promised
  distinction that does not render is worse than none, because the reader trusts
  it and reads the wrong rows.
- **A key belongs outside its scroll container.** As a `<caption>` the sentence
  explaining which zeros matter inherited the table's width, so on a 390px phone
  the one thing a reader must not miss sat behind a horizontal scroll. The
  `<caption>` stayed for screen readers, shortened; the key became a `<p>` above.
- **Add the page to `tests/a11y-sweep.mjs`.** Two links dropped into the app
  footer's sources paragraph added four `link-in-text-block` violations
  immediately — in running prose the underline is the affordance, not decoration.

## Verify a script by its effect, never by its own report

A script that resolved the last nineteen uncited fees printed `records updated:
19` and had attached **zero** notes. It nulled the fee and tested `rec != orig`,
which was true because of the fee change alone — so it counted *a* change rather
than the change it was asked to make, and left all nineteen in the one state
this file explicitly forbids: a missing fee that does not say why. The insertion
had silently failed because records end `" },"` and the pattern looked for
`" }\n"`.

The check that caught it was three lines of Node reading the parsed data back
and asserting both properties were true together. Do that every time a script
edits `data/`. A count of rows touched is not a count of rows correct.

The same discipline applies to guards. When you write one, **break the thing it
guards and watch it fail**, then restore. Done four times this session — a
flipped `fee_basis` value, a reintroduced missing comma, a corrupted ICO
dimension, a reverted CSS rule — and it is the only way to know a guard tests
what its name claims.

## Deliverables the data already supports

Two things shipped this session that needed no new data, only a different view
of what was already there. Both are worth remembering as a pattern: before
building a feature, check whether the catalogue already answers the question and
simply has no surface for it.

- **`/open-data/`** publishes all 469 courses as CSV and JSON. The column that
  justifies it is `fee_basis` — anyone can list Kenyan courses and fees; almost
  nobody says which of their numbers they can stand behind. It is **computed by
  reading `feeBasis()` out of `js/decide.js`** at build time, not reimplemented,
  because an export that classified fees by its own copy of the rule could
  disagree with the app while both looked right alone. RFC 4180 quoting is not
  optional: **every one** of the 469 notes contains a comma or a quote and the
  longest is 1,420 characters. (It was 444 when the exporter was written; the
  last 19 gained notes when the uncited-fee tier was closed. Re-measure rather
  than quoting a figure from earlier in the same session — this note is here
  because I nearly wrote the stale one down as permanent.)
- **Printable briefs.** Ctrl-P on any county or grade page produces a branded,
  dated sheet — no library, no server, just a print stylesheet over data already
  in the page, so it works offline. The county sheet is for an education officer
  or bursary committee; the grade sheet is for a career teacher, who is the
  distribution channel this project otherwise lacks. One teacher reaches a whole
  Form Four class.

**Two empty cells in a CSV are where it lies.** A blank reads as "no data" to one
person and as zero to another. In this export a blank `min_grade` means *open
entry* — the most permissive value, not a missing one, so there is an explicit
`open_entry` column — and a blank `tuition_kes` means unsourced, **not free**;
the three genuinely free courses carry `0`. Both are stated on the landing page,
not only in a header row.

## The placeholder trap

An audit found **Ksh 420,000 on twelve different degrees** at twelve different
universities — public and private, nursing to design to actuarial science —
plus 650,000 and 720,000 each used twice across unrelated institutions. Those
were never observations. They were one made-up number pasted repeatedly, and
because each carried no citation they were being reported as "uncited fees"
awaiting sourcing, which flattered them enormously.

`tests/sector-coverage.test.js` now fails the build if one fee value repeats
across institutions of differing ownership. If you are tempted to fill a gap
with a plausible number, that guard is aimed at you.

## CI: git does not preserve mtimes

The repo's staleness guards compare **file modification times** — is
`counties/nairobi/index.html` older than `data/courses.js`. That is right on a
working copy and carries **no information in CI**, because git stamps every file
with the moment it wrote it, in its own order. A clean `git clone` therefore
fails them on an unmodified tree: measured at 5 failures from a fresh clone and
4 from a `git checkout main`, and in both cases regenerating produced a
**byte-identical** diff. The artefacts were correct; only the timestamps moved.

So all seven mtime guards share one definition in `tests/mtime-guard.js` and
skip when `CI` is set — skipped rather than silently passed, so the log says
which checks did not run.

**What replaces them is stronger.** `.github/workflows/node.js.yml` regenerates
the four content generators and runs `git diff --exit-code`. Comparing *content*
beats comparing timestamps and has no false positive. Two things it needs:

- **Pin `NJIA_BUILD_DATE`** to the `<lastmod>` already in `sitemap.xml`, or the
  sitemap's build-date stamp makes every run dirty.
- **Run `build-structured-data.mjs` last.** It injects JSON-LD into pages that
  `build-open-data.mjs` and `build-provision-analysis.mjs` own, so any other
  order silently drops its blocks — which is itself a diff, caught the same way.

The three rasterisers are not in CI: they need Playwright, and they stay covered
locally, which is where someone edits the SVG and forgets to rasterise.

**The starter workflow was wrong for this repo, not slightly misconfigured.**
`cache: 'npm'` needs a lockfile, `npm ci` needs a `package.json`, `npm test`
needs a test script; none exists and none should. CI here is a checkout, a Node,
and `node --test tests/*.test.js`. And the first fix for it was *also* red on
every run until a clean-clone simulation caught it — **simulate the runner
before pushing a workflow**, because a red `main` is what teaches people to stop
reading CI.

## Resolve it here. Do not hand back an assignment.

The standing instruction from the maintainer is that an agent working on this
repository **finishes the work**, using every tool available to it, rather than
closing with a list of things for a human to do. A report that ends "you must
now create this mailbox / check this setting / run this command" has moved the
task, not completed it.

That does not license guessing. It changes what to do when something cannot be
verified from here, and the rule is:

- **Find a route that works with nothing set up.** The partnership page needed a
  contact address. The obvious one, `partnerships@njiacareerpathways.work`, is
  on the project's own domain and is the right thing to advertise — and it
  cannot be confirmed from this environment, because every host is
  egress-blocked. Publishing only that would have recreated the dead end it was
  written to close, *silently*: the reader writes and hears nothing, which is
  worse than finding no address. So the page carries the issue tracker as a
  second route, which is live today and needs no configuration, and
  `tests/partnership.test.js` fails the build if it goes.
- **Never publish the maintainer's personal address** as the fix for this. A
  personal mailbox on a funder-facing page is both a disclosure decision that is
  not an agent's to make and a weaker signal than the domain.
- **Where a thing genuinely cannot be done from here, do the part that can.**
  Google Search Console submission and reading Netlify Analytics still need
  credentials this environment does not hold. Say so once, in one line, having
  already shipped everything around them.

## CI can fail before it starts, and the run object will not say why

CI went red on `main` on 19 August and stayed red, and the first audit of this
session **missed it** — because it checked repository contents, the test suite
and the open pull requests, and never looked at the Actions run history. A green
local suite says nothing about whether CI ran at all.

The signature is `conclusion: startup_failure` with **zero jobs**, `created_at`
equal to `run_started_at`, and no log to read: the run never began, so
`list_workflow_jobs` returns an empty array and `get_job_logs` has nothing to
give. Everything the normal drive-to-green loop reaches for is absent.

What to check, in this order, because it is cheap to expensive:

1. **Diff the workflow file between the last green run and the first red one.**
   Here it was byte-identical, which rules out the YAML immediately. Note that
   PyYAML parses `on:` as the boolean `True` and tolerates duplicate keys that
   GitHub rejects, so "it parses locally" is weak evidence.
2. **Check repository visibility.** Njia is public, so Actions minutes are free
   and unlimited and a billing ceiling cannot be the cause. On a private repo it
   usually is.
3. **Bisect by content.** The only difference between the last green commit and
   the first red one was two files, one of them `.github/mcp.json` — a Copilot
   MCP config for a server this repo does not use in CI. Removing it is both the
   experiment and the cleanup, because the file was inert clutter either way.

**What the bisect actually established.** Removing `.github/mcp.json` changed
nothing, so the copilot's file was not the cause. Rewriting the workflow to use
**no `uses:` at all** — a `git clone` for checkout, the runner image's own Node —
moved the conclusion from `startup_failure` to an ordinary `failure`. That is
the proof: the workflow now *compiles*, so what was blocking it was `uses:`
resolution, which is an Actions policy and not anything in this repository.

**A second layer sits behind it.** The job that now compiles fails in two
seconds with `runner_id: 0` and an empty `runner_name` — no runner was ever
assigned. That is not a step failing; it is the job never being placed. Same
root, one level up: this repository's Actions settings changed four minutes
after the copilot merge on 19 August, and the API paths that would read or write
them are blocked by the build proxy on purpose.

So this is the rare case the section above allows for: **the part that can be
done from here is done** — the workflow is policy-independent and will run the
moment a runner is available — and the remaining step is a repository setting
under Settings → Actions → General, which no agent working in this environment
can reach. Merging past it is legitimate here only because `main` is red for the
identical reason, which makes it a base-branch failure rather than the branch's.

`workflow_dispatch` is now on the workflow. It was absent, which meant there was
no way to re-run CI against a ref on demand — the exact capability needed to
test a hypothesis about why CI would not start.

## Verification before any deploy

Regenerate first — the guards fail on stale artefacts, which is the point:

```
node tools/build-icons.mjs        # 4 PNGs + favicon.ico, needs Playwright
node tools/build-og-image.mjs     # share card; rewrites its own hash in index.html
node tools/build-brand-assets.mjs # lockups + social banner, needs Playwright
node tools/build-landing-stats.mjs # data/landing-stats.js — the landing page's figures
node tools/build-open-data.mjs    # CSV + JSON + /open-data/
node tools/build-provision-analysis.mjs  # county CSV + /analysis/
node tools/build-static-pages.mjs # 54 pages + sitemap + /docs/; reads the others
node tools/build-structured-data.mjs # JSON-LD + llms.txt; run LAST, it INJECTS into the pages above
```

Then four layers, all of which must be clean:

```
node --test tests/*.test.js       # zero-dependency unit suite (270)
node tests/functional-probe.mjs   # drives the real app, port 8080
node tests/a11y-sweep.mjs         # 68 axe states, port 8106
```

The axe sweep is 68 states, not 32, because it now covers the generated county,
grade and open-data pages as well as the app's routes. Its first section used to
be labelled "static pages" and audited neither.

Plus a manual drive of every page at 1440px and 390px in both colour schemes,
**and a print check** — `emulateMedia('print')` on a county and a grade page,
because two defects this session were visible on paper and nowhere else.

Bump `CACHE_VERSION` in `sw.js` on every deploy. Icons are cache-first, so a
stale version means readers keep the old ones.

**On the Lighthouse score: 95 to 97 is this site's noise band.** Production has
measured 95, 97, 97, 95 and 97 across consecutive deploys whose payloads both
grew and shrank, and previews swing the same way within a single branch. Do not
chase a point, and do not do what I did once — declare the variance "confirmed"
off a single reading. If it ever leaves that band, measure the app-side payload
before assuming the diff caused it; most changes here touch only the generated
pages, which the audit of `/` never loads.

## A manual step is usually a missing build step

The share card once needed a human to "re-scrape the URL in the Facebook
debugger" after every change, because social platforms cache a card against its
URL and keep it. That instruction had no guard, could not be verified, and had
to be remembered every time.

`icons/og-image.jpg` is now referenced with a content hash — `?v=<sha256[0:10]>`
— written into `index.html` by `tools/build-og-image.mjs` and read back out of
it by `tools/build-static-pages.mjs`, so 56 pages share one source of truth.
Change the card and the URL changes; the platforms refetch on their own. Change
nothing and the hash is identical, so nothing is invalidated for nothing.
`tests/artefacts.test.js` fails the build if the hash stops matching the bytes,
because a stale hash looks like cache-busting and busts nothing.

Two things genuinely cannot be automated from here, and it is worth writing
down why so nobody re-litigates it: **Google Search Console submission** and
**reading Netlify Analytics**. Both need credentials this environment does not
hold, and every external host is egress-blocked — `curl` to google.com,
api.indexnow.org, bing.com and the site's own public URL all return 000. The
Netlify MCP exposes projects, deploys, teams and extensions, and no analytics
endpoint. Those two are the maintainer's; the rest should be a script.

## Regenerating the app icons

`node tools/build-icons.mjs` rasterises `icons/logo-mark.svg` into the four
PNGs using the Playwright Chromium. The PNGs once drifted a full rebrand
behind the SVG, so a test asserts they are never older than their source.

It also writes **`favicon.ico`** at the repo root, at 16/32/48. That file is
requested by PATH rather than by link — Google and most crawlers and
link-preview services fetch that exact address to decide what icon sits beside a
result — and it 404'd while the app's own tab was perfectly correct. With 57
URLs in the sitemap, every search result was rendering blank.

It is packed by hand because there is nothing here to pack it with: no
dependencies, no ImageMagick. ICO is a 6-byte header, a 16-byte directory entry
per size, and — since Vista — PNG payloads directly rather than BMP. The guard
parses the container and asserts each entry's declared dimensions match the
actual PNG IHDR, which is the classic way a hand-packed ICO renders as nothing
while still looking like a valid file.

## Verifying a production deploy

Netlify's `currentDeploy` on this site is repeatedly stale — it reported the
previous deploy for over a minute after several merges. **Always confirm
`commit_ref` on the deploy object**, never `state: "ready"`. The MCP endpoints
502 independently and intermittently; back off 60s and retry the other one.

Budget for the API being unavailable rather than treating it as an error. In one
session the Netlify MCP 502'd five times and once timed out at 60s, and the
GitHub API exhausted its hourly quota repeatedly — a merge took several
ten-minute backoffs. Neither is a failure of the change; both are the normal
weather here. **Do not report a deploy as verified until `commit_ref` has
actually been read.** "Merged" is confirmable from git alone and is a different
claim from "live", and it is worth keeping them apart out loud.

Note also that `get-deploy-for-site` needs a `deployId`, which only
`get-projects` returns — so when `get-projects` is the endpoint that is down,
there is no way round it and waiting is the whole strategy.

## Merging

Squash-merging replaces branch history on `main`, so a branch that keeps
committing after its PR merges will hit a false conflict on the next PR. Fix
it by rebasing only the new commits:

```
git branch -f backup HEAD
git rebase --onto origin/main <last-commit-in-the-previous-squash>
git diff backup..HEAD --stat      # MUST be empty
git push --force-with-lease
```

Then re-run the full suite. A clean rebase is not evidence of clean code.
