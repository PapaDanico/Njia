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

## Bytes are an access question, and nothing was counting them

Every coverage question in this repository that has a guard is answered, and
every one without a guard drifts — that is the observation
`tests/university-coverage.test.js` was written on. Payload was the next one.

The lazy split took DOMContentLoaded on throttled 3G from 5,661ms to 3,605ms by
moving 86.3KB gzipped of catalogue off the critical path, and then **nothing
measured it again**. Two PRs in one afternoon took the catalogue from 469 to 664
courses, a **15.5% rise in the lazy bundle**, and the only number anyone looked
at afterwards was a Lighthouse score — which this file separately establishes is
evidence in neither direction.

It was not, in that instance, the payload: measured, the page Lighthouse audits
grew **528 bytes gzipped, 0.6%**, because the split did its job. The reading of
94 was noise, and blaming the diff would have been the same error as inventing
the signal you wish you had missed. **A payload argument has to stand on its own
bytes**, and here they exonerated the change.

Measuring properly to prove that found something else, which is the actual
lesson: **the critical path is 146KB gzipped, not the ~87KB an earlier estimate
in this very session claimed**, because that estimate counted the files someone
remembered rather than the files `index.html` actually loads. Read the surface,
do not list it.

And on that path sat **`data/labour-market.js` at 34.7KB gzipped — the largest
single item, bigger than `js/app.js`.** Its only critical-path consumer was
`js/app.js`, which used **two of the thirty symbols it defines**:
`PLACEMENT_CALENDAR` and `PLACEMENT_MECHANICS`, both for the Application Clock.
The other twenty-eight are Discover, Decide and Connect content that every
reader who opened none of them was paying for.

**Now split**, and the cut is at the consumers rather than the subject matter:
`data/placement.js` holds the two the landing page needs and stays on the
critical path; `data/labour-market.js` keeps the rest and is loaded by
`PAGE_MODULE` for the three routes that use it. A placement date and a sector
salary look like the same kind of fact — one is needed at first paint and the
other is not, and that is the only distinction the reader pays for. **The
critical path fell 145.8KB to 115.4KB gzipped, a 20.9% cut for every
first-time reader**, and the ceiling was ratcheted 150 to 125KB to hold it: a
ceiling left at its old value after a win is not a ratchet, it is headroom for
the next regression to hide in.

`tests/payload-budget.test.js` holds three guards, and the shape of each matters
more than its number:

- **The catalogue is not on the critical path** — a property, not a byte count.
  It is the invariant the whole split exists for, it cannot be re-derived from a
  total, and regressing it throws nothing and fails nothing else. It would look
  like a slower first visit for the reader on the weakest signal.
- **A hard ceiling on the critical path**, kept at ~3% headroom on purpose.
  Nothing there should grow when the catalogue does, so a failure means
  something got wired to the wrong side of the split — and the message prints
  the per-file breakdown, because a failure reporting only a total sends you
  hunting.
- **Bytes per course, not total catalogue size.** Capping the total would fail
  on data that got better, the exact trap the artisan entry-grade guard fell
  into. Adding courses is the project; each record getting fatter is not.
  Verified by simulating +200 records: the figure *falls* from 112.4 to 104,
  so growth is genuinely free and only bloat trips it.

The unit is gzip level 9, a proxy — Netlify serves brotli and sends fewer bytes.
It is deterministic, in Node's standard library, and moves with the real thing.
The ceilings mean nothing in absolute terms; what they defend is the delta.

**And the break-test caught itself.** The first attempt to prove these guards
work produced no failure on two of the three, and the guards were fine — the
*breaks* were malformed. `index.html` writes `<script defer src="./data/…">`, so
an insertion looking for `<script src="data/…"` was a no-op; and 664 *identical*
padding strings gzip to almost nothing, so the bloat break had to use random
bytes to be incompressible. Both restored to a real failure once written
correctly. This is the Kisumu/KCPE lesson in a new place: **a break that does not
fail is more often a bad break than an inert guard, and the difference is worth
five minutes of looking.**

## A split is only proved by asking the page, and the question has to be right

The `labour-market.js` split is the third time this project has moved a classic
script off the critical path, and the first that did not ship a
`X is not defined`. What made the difference was not care — both earlier
attempts were careful — but *what was asked of the running page*.

**The unit suite went green immediately and meant nothing**, exactly as it did
both previous times. **The functional probe also passed, 26/26, including "no
uncaught page errors" — and that was not proof either.** The symbols that would
have thrown are read inside functions that the probe's route checks never reach
without a completed questionnaire, so a genuinely broken split would have sat
there silent. A probe that renders a route is not the same as a probe that
exercises what the route needs.

What settled it was asking each route directly, in a **cold context per route
with the service worker blocked** — the first visit, which is the only state
where a missing dependency is reachable — whether every symbol it references
actually resolves. Twenty-two symbols across discover, decide and connect;
`design`, `track` and `help` assert the empty set, so the check fails if a
dependency is invented as readily as if one is missed.

**Two instrument errors on the way, both of which looked exactly like a real
failure**, and both worth recognising again:

- **`typeof window[name]` is the wrong probe for a classic script.** A top-level
  `const` creates a binding in the global *lexical* environment, not a property
  on `window`. The first run reported all 22 symbols missing on all three
  routes. The code was correct; the question was wrong. The tell was that the
  one check written differently — `typeof PLACEMENT_CALENDAR !== 'undefined'`,
  an identifier lookup — passed in the same breath.
- **"Fetched on first paint" is not "on the critical path".** A request log up
  to the load event showed `labour-market.js` *and* `courses.js` being fetched,
  which reads as a total regression — `courses.js` coming off that path is the
  invariant a guard in this repo asserts. Both were the idle prefetch in
  `js/app.js`, which pulls every page module after load by design.
  DOMContentLoaded was 71ms. The critical path is what `index.html` blocks on,
  not what the tab eventually asks for.

That is the same lesson as the malformed break-tests one section up, arriving
from the other direction: there, a break that did not fail was a bad break
rather than an inert guard; here, **a failure that did fire was a bad question
rather than broken code.** Both cost five minutes to tell apart, and both would
have been expensive to believe.

The class is now guarded rather than the instance. `tests/landing-stats.test.js`
already read decide.js's declarations and required `PAGE_MODULE` to list the
provider; `data/labour-market.js` is a fourth entry in that same `PROVIDERS`
list, with its symbols read out of the file rather than hand-copied. The same
change closed a **transitive hole** that had been open the whole time: the guard
checked only `js/<page>.js`, so a symbol needed by `js/decide.js` was unguarded
on the `discover` route that pulls decide.js in — which is precisely the shape
of both historical failures. It now treats every `js/` file a route injects as a
consumer, since they all land in one shared global scope.

Both breaks were watched to fail: removing `data/labour-market.js` from the
connect route, and listing it *after* `js/connect.js` so it would execute too
late.

**And lazy still must not mean optional.** Verified the way this file already
requires: worker installed, network off, all three routes driven, every
labour-market symbol resolving, and Decide rendering "664 of 664 places to
apply match" offline.

## The fourth split, and the probe that passed on a broken one

`data/funding.js` was 10.1KB gzipped on the critical path, and `js/app.js` read
**two things** out of it: `FUNDING_SOURCES.length` for the landing figures, and
the name and deadline of at most four records for the Application Clock. The
other sixteen fields on each record — description, eligibility, requirements,
`bandAppeal`, `legalStatus`, `verification_note`, interest rate, repayment
period — are Decide content, paid for by every reader who never opened Decide.
That is the `labour-market.js` case exactly, and the same fix: **114.7 → 105.4KB
gzipped, 8.1%**, ceiling ratcheted 125 → 109.

Measured end to end rather than inferred from the bytes: on throttled 3G
(400kbps, 400ms RTT) over a gzipping server, cold context with the worker
blocked, alternating and median of five, **DOMContentLoaded falls 3,096 →
2,979ms — 117ms, 3.8%**. Report that honestly against the first split's 36%:
the remaining critical path is `css/styles.css` and `js/app.js`, so there is far
less left to take off it, and each further split buys less. **First paint does
not move** (1,856 vs 1,884ms, inside the run-to-run spread) for the reason this
file already gives — FCP waits on the stylesheet, and claiming a split makes the
page appear faster would be wrong in the same way both earlier times.

**Precomputed into `LANDING_STATS`, not split into a second data file.** The
earlier splits moved whole symbols, so a new file was right. Here the landing
page needs a *field subset of the same records*, and a hand-written file of
those would be a second copy free to drift — the thing
`tools/build-landing-stats.mjs` exists to prevent. It emits all qualifying rows
rather than the four the clock can show: capping there would couple the
generator to a `slice()` constant, and the difference measured 0.47KB against a
9.4KB saving. The filter is the app's own (`verified` **and** carrying a
deadline) and `tests/landing-stats.test.js` recomputes it — a deadline is more
perishable than a count, and this is the panel that once announced a KMTC
window four weeks after KUCCPS closed it.

**And the per-route symbol check passed on a genuinely broken `PAGE_MODULE`.**
The check this file prescribes — cold context per route, service worker
blocked, identifier lookup rather than `window[name]` — was run, reported all
six routes clean, and was *inert*. Removing `data/funding.js` from
`PAGE_MODULE.decide` changed nothing, because **the idle prefetch in
`js/app.js` warms every page module on `load`** and had already fetched the
file. The tell was in the output the whole time: `design`, `track`, `connect`
and `help` were reported as resolving symbols they do not reference, which is
the empty-set assertion failing to be empty.

Suppressing the prefetch with `window.requestIdleCallback = function () {}`
before `app.js` runs makes it exact — and that is not an artificial state, it
is a reader tapping a nav item before the prefetch completes on a weak signal,
which is the connection this project designs for. With it suppressed the same
break produced `FUNDING_SOURCES is not defined` on `decide` and the empty sets
came back empty.

This is the **third** instrument error in this family and the first of its
polarity. The two already recorded were failures that fired for the wrong
reason — `typeof window[name]` on a classic script, and "fetched on first paint"
read as "on the critical path". This one is the opposite: **a pass that should
have been a failure.** The rule covers both directions — *a break that does not
fail is more often a bad break than an inert guard* — and the corollary is
that a probe reporting a property it cannot actually observe is worth five
minutes of suspicion even when every line says PASS. The permanent guard is
still the `PROVIDERS` list in `tests/landing-stats.test.js`, which caught both
breaks (missing entry, and listed after `js/decide.js`) with the right message;
the cold probe is what proves the guard is describing the running page.

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

## A date is a claim, and it perishes faster than a fee

The Application Clock in the landing hero already had four guards on it, all
green: a closed window cannot render, `-0` cannot say "Closes today", the
calendar cannot silently run dry, and no window can close before it opens. On
8 September 2026 that panel told every reader **"KMTC September intake · 23
days left · closes 2026-09-30"**. KUCCPS opened that window on 24 July and
closed it on **11 August**. It had been shut for four weeks.

Every guard was working. All four asked whether the app handled the numbers
correctly, and **not one asked where the numbers came from** — the two dates
had never been sourced at all; they were the shape of a September intake
rather than its published window. The whole rest of this project already knows
the answer to that: a figure is either sourced or absent, and `published` is a
declared claim rather than a fall-through. Fees had that discipline and the
dates, which are more perishable and end in someone standing at a portal, had
none.

So `PLACEMENT_CALENDAR` entries now carry `source` and `verified`, and
`tests/placement-clock.test.js` enforces both. The second guard is the one with
teeth and it is deliberately asymmetric: a window still open on the clock must
have been verified within **120 days**, chosen against the 90-day expiry runway
so a date is re-read before the calendar it sits in starts warning it is about
to run out. A stale *closed* window is invisible to every reader; a stale
*open* one is an instruction to go somewhere that will not take them. That is
the eligibility direction, not the fee direction — under-claim on money, never
on a door.

Two things the same sweep turned up, both of which the wrong date was hiding:

- **The live window was missing entirely.** KUCCPS reopened KMTC and Kenya
  Utalii College applications on 8 September, closing **14 September** — six
  days. The catalogue's fabricated 30 September window was occupying the row
  that should have carried it, so the fake deadline was also *displacing* the
  real one. A wrong figure is not just wrong; it fills the slot.
- **An empty clock has two meanings and rendered as one.** With no window
  open, `renderApplicationClock()` fell back to funding rows reading "Rolling"
  and "Varies — check annually". "No intake is open this week" and "Njia's
  dates ran out" looked identical, and the second reads as the first. It now
  names the last date Njia holds and points at kuccps.net, so a reader can see
  how old the answer is instead of trusting a calm panel. The 90-day guard
  should mean nobody ever meets it; it is the second line for a deploy that
  outlives the refresh.

The search per window is the same shape that works for institutions: name the
body and the cycle (`KUCCPS KMTC September 2026 intake deadline`), not the
concept. Every date in the calendar was confirmed or corrected against two or
more outlets in one pass, and the only one that was wrong was the only one that
had never been searched for.

**And a stale comment about provenance is a provenance defect.** `data/funding.js`
opened with "Every record carries `data_confidence: 'illustrative'`" while
eleven of fifteen records were `'verified'`. That flag is not documentation:
`js/decide.js` renders a verification tick from it and `js/app.js` chooses
which deadlines reach the landing hero by filtering on it. The file's account
of itself was *weaker* than what the app displays from it, which points the
next editor at downgrading a real citation to match a comment. The header now
describes the two tiers that actually exist.

## The 48 answers that had no URL

Asked why the platform is absent from search indexes, the technical answer was
that nothing is wrong: robots.txt invites crawling, the sitemap carries every
generated page, canonicals and JSON-LD are in place, and 55 static pages exist
precisely so a crawler has something to read. The submission to Google Search
Console has never been made — that is credential-gated and stays the
maintainer's — but it is not the whole story, and the rest of it was a gap
nobody had looked for.

**`HELP_FAQ` is six groups, forty-eight question-and-answer pairs and roughly
4,600 words — the largest single body of prose this project has written — and it
had no URL.** It lived entirely inside the app, drawn client-side by
`js/help.js`. A crawler asking for the front door got **2,980 characters** of
chrome. The counties got static pages, the grades got static pages,
`/open-data/`, `/analysis/` and `/docs/` all got static pages. Help never did,
and nothing noticed, because in the app it works perfectly.

That is the sixth instance of *the app is not the whole site*, and the most
expensive one, because those forty-eight questions are the closest thing this
catalogue holds to what a learner actually types into a search box: "can I do
nursing with a D+", "does my data leave my phone", "is the Germany 250,000
figure real". `/help/` now carries all of it — **35,622 crawlable characters on
one page**, against 2,980 for the entire app.

**And the first version of that page fixed one third of the problem.** It
published `HELP_FAQ` and stopped, because that was the array this section was
written about. `js/help.js` holds *three* top-level structures, and the other
two — `HELP_TUTORIALS` (five walkthroughs, ~621 words) and `HELP_GLOSSARY`
(sixteen terms, ~285 words) — stayed exactly as invisible as before. Caught by
being asked "does the tutorial have its own SEO page", not by any guard, and the
honest answer at the time was no.

The glossary was the sharpest of the three to nearly lose: **KCSE, KUCCPS, HELB,
HEF, TVET, TVETA** are definitional queries a learner types verbatim, and each
now has its own anchor (`/help/#kuccps`). Sixteen answers to "what does this
abbreviation mean" were reachable only by tapping a tab inside a single-page app.

The lesson is narrower than "check your work": **a page generated from one named
export will silently omit the others in the same file.** The generator now reads
all three by name and the build line prints all three counts, so a fourth added
later shows up as an absence in the output rather than as nothing at all.

Two decisions worth keeping:

- **One page, not forty-eight.** A page per question would be forty-eight thin
  documents differing by a paragraph, which is the doorway pattern the grade
  pages were capped at 85% reachability to avoid. Grouped headings with an `id`
  per question give a search engine a deep link without the doorway.
- **The content is read from `js/help.js` at build time, never restated.**
  `tools/build-structured-data.mjs` already reads the same array for the same
  reason: a hand-written second copy is a second thing free to drift, and this
  project has already had to stop a third being made.

And it is in `SURFACES`, so the one-list guard checks all three properties —
served link, sitemap, `llms.txt` — rather than someone remembering. Verified by
pointing the `<noscript>` link at a wrong path and watching the guard fail.

**The prospectus went in the same pass.** `/docs/` now carries the problem the
platform exists for, the five partner relationships, the four levels of
commitment and what would be reported back — 4,030 characters to 7,465. Every
figure in it is computed at build time from `EDUCATION_PIPELINE` and the
catalogue rather than typed, because a partnership page quoting a stale
candidate count is the same defect as a course card quoting a stale fee. The
partnership deck's own numbers were checked against the live data first and
matched exactly — 664, 404, 164, 14, 7, 47 — which is what made integrating it
safe.

## A ban on one phrasing is not a ban on the claim

`tests/analytics.test.js` banned the string "no analytics of any kind" and
checked the privacy modal, because that sentence had once promised something
milestone counting made false. It has been guarding one sentence on one surface
ever since.

Meanwhile the landing page's privacy block opened **"No accounts, no tracking,
no analytics."** — a different wording, the same false claim, on the surface far
more readers actually see. And the FAQ answered "Is there any tracking or
analytics?" with **"None."** Both were found by widening the guard, not by
reading the app.

That is the paraphrase trap for the third time in this file: the Dataset caveat
guard accepted a hedge instead of the claim, the branded-header guard accepted a
substring of what it reported, and here a ban on one sentence let its synonyms
stand for months. The fix is the same every time — **assert the property, not the
wording.** The guard now sweeps every shipped script and `index.html`.

**And the first version of the widened guard flagged its own fix.** "No
analytics scripts", "no third-party analytics" and "no analytics pixels" are all
true, and the privacy modal says two of them; a pattern aimed at the word
matched them too. Only the *blanket* claim is false, so the pattern excludes
anything that qualifies the noun. A guard aimed at a word rather than at a claim
will fail on the correct text, which is the same failure as passing on the wrong
text wearing different clothes.

Timing worth noting: the FAQ instance was caught **while publishing `/help/`**,
which would have put a false privacy claim on a crawlable, indexed URL. Widening
the guard and publishing the page happened to be the same change, and each
caught something for the other.

## The submission that needs an account, and the one that does not

Getting indexed has exactly one step that genuinely requires the maintainer, and
it is worth being precise about why rather than repeating "credential-gated".
Submitting the sitemap to **Google Search Console** needs a Google account, a
browser and a verified property. Checked again rather than assumed: every
relevant host answers `000` from here, and the agent proxy logs the reason in
plain text — `connect_rejected — gateway answered 403 to CONNECT (policy
denial)` for `www.google.com`. No connected MCP exposes Search Console or any
webmaster API; that was searched, not guessed. The block is real, it is current,
and routing around it is forbidden by the first section of this file.

**IndexNow is the half that needs nothing.** No account, no OAuth, no dashboard:
host a key file at the domain root, POST the URL list to
`https://api.indexnow.org/indexnow`, and Bing, Yandex, Seznam and Naver are all
notified at once. `tools/submit-indexnow.mjs` does it, zero-dependency, from any
machine with outbound network.

**Google does not participate in IndexNow**, still true as of May 2026. So it is
an addition to the Search Console submission and never a substitute — written
into the script's own header, because a tool named "submit" is exactly what
someone later assumes covered everything.

Two details that are the whole reliability of it:

- **The key is read from the key file, never written twice.** A key that
  disagrees with the file it is served from is rejected, and rejected
  *silently* — the engines simply ignore the submission. Same failure shape as a
  milestone marker that 404s and reads as "nobody got there".
  `tests/indexnow.test.js` asserts there is exactly one key file, that its
  contents equal its own name with no stray whitespace, that the script carries
  no hardcoded copy, that the file is not in the sitemap (an ownership token is
  not a page), and that `robots.txt` still lets the engines fetch it.
- **The error message has to name the real cause.** Run inside this environment
  the POST returns `403 Forbidden`, which reads exactly like IndexNow rejecting
  the key — and would send the next person to check a key file that is perfectly
  fine. The proxy's refusal is detected from the body and reported as what it
  is. A tool whose failure message blames the wrong thing is the same defect as
  a guard whose failure message lists three things and checks one.

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

## Fire on the outcome, never on the intent

The PDF button on the report ran three lines: record the milestone, promise a
print dialog, call `window.print()`. On a desktop browser that works, and it is
what every layer of verification here runs on.

Inside the **Facebook, Instagram and WhatsApp in-app browsers**, and on the
older Android WebViews this file already names as this audience's hardware,
`window.print()` is absent or a silent no-op. The reader tapped PDF, read
"Opening print dialog — choose Save as PDF", and got **nothing**. No dialog, no
error, no explanation. On the share route this project relies on most.

And `recordMilestone('report-downloaded')` fired **first**, so the single usage
measurement Njia takes counted a completed download on every failed attempt.
That is the defect `tests/analytics.test.js` exists to prevent, arriving from a
direction it did not cover: not a missing marker file reading as "nobody got
there", but a *present* one reading as "everybody did" — a wrong number that
looks real and errs in the flattering direction. The rule was already "fire on
the state transition, never on the render". It now extends: **fire on the
outcome, never on the intent.**

`beforeprint` is the discriminator, and it was measured rather than assumed:
real Chromium fires it; a deleted `print` throws and never fires it; a no-op
`print` returns cleanly and never fires it. Nothing else separates the last case
from success, which is why feature detection alone is not enough —
`typeof window.print === 'function'` is `true` for the no-op.

**Nothing in four layers could have seen this.** The unit suite has no browser.
The axe sweep does not click. And the probe's own print checks
`emulateMedia('print')`, which never goes near `window.print()` — so the two
existing "printed report" checks passed throughout. It took reproducing an
in-app browser to find, so the guard reproduces one: both failure shapes, plus
the happy path, because a fix that silenced the milestone everywhere would pass
a failure-only test while breaking the measurement it was meant to protect.
Verified by restoring the original three lines and watching all four new checks
fail.

The general form, and it is the third instance in this file: **a feature
verified only on the hardware the developer has is verified on the wrong
hardware.** Dark mode was missing from 53 pages, the favicon fell back to
nothing on older WebViews, and now the PDF button did nothing on the browsers a
forwarded WhatsApp link opens in.

## Where the outcome cannot be read, do not report one

The rule above was applied to the PDF button and **not to the button beside
it.** `exportMyData()` built a blob, called `a.click()`, and showed *"Backup
downloaded."* unconditionally. Inside the Facebook, Instagram and WhatsApp
browsers a download anchor is inert, so the reader tapped Export, read a green
success toast, and had nothing.

It is worse than the PDF case, and the reason is what the app says next. The
privacy panel says *"Switching phones? Export a backup below"* and the FAQ —
now crawlable at `/help/` — says *"Export a backup first if you want to keep
it."* Both instruct the reader to back up **before wiping a handset**, so the
false toast was the last thing between them and losing everything. The PDF
button failing costs a printout.

**The fix is not a better detector, because there isn't one.** `beforeprint`
made the print case observable; there is no completion event for a download
started from an anchor. That rules out detecting the failure — it does not
license claiming the success. So the unverifiable claim was withdrawn rather
than qualified, which is the same trade every fee record in this catalogue
makes, and a route that works everywhere now sits **beside** it rather than
being offered after the first one has silently failed: **Copy Backup Text**,
clipboard with a selectable-textarea fallback. The toast now says where to look
and what to do if it isn't there.

Two details worth keeping:

- **Feature detection catches only half, exactly as it did for print.**
  `'download' in HTMLAnchorElement.prototype` finds the older WebViews;
  it is `true` for the in-app browsers whose click is inert, the same way
  `typeof window.print === 'function'` is `true` for a no-op print.
- **`URL.revokeObjectURL()` ran in the same tick as the click**, which has
  historically cancelled the download before it began. Now deferred.

The guard reproduces both failure shapes and the happy path, in
`tests/functional-probe.mjs` alongside the print checks — a fix that simply
deleted the download would pass a failure-only test while removing the feature.
Verified by restoring the original `showToast('Backup downloaded.', 'success')`
and watching two checks fail, and by gutting the fallback panel and watching a
third.

## A guard split in two is two guards free to disagree

`every printable sheet carries the branded header` was split into a second test,
`every printable sheet is dated`, because the first failed its own failure
message — it reported "no Njia header, date or address" and asserted only that
the div existed. That split fixed the message and **left a worse bug behind
it**: the two were then free to disagree about *which pages they covered*, and
they did. The header guard scanned counties and grades. The date guard scanned
counties, grades **and `analysis`** — one directory bolted on by hand.

What fell through the gap between them: `/help/` and `/docs/` carried the header
only by the generator's care, with nothing holding them to it, and
**`/open-data/` carried none at all** — the one generated surface printing
unbranded and undated, which is the dataset page a county planner or a
journalist prints. `/docs/` is the funder-facing prospectus.

That is the per-surface-guard flaw this file already diagnosed for served links,
sitemap and `llms.txt` — *add a surface, add a line* — recurring **inside the
pair of guards written to fix a different instance of it.** So the fix is the
same one, with one improvement: a single `PRINTABLE_SHEETS()` list, both
properties asserted off it, and **the list read off the disk rather than
typed** — because a typed list is precisely the thing that drifted. A new
surface is covered the day it is generated, without anyone remembering.

Both breaks were watched to fail, and deliberately on the two surfaces the old
guards could not see: stripping the header from `/open-data/` and the date from
`/help/`.

## The lesser destructive action was the unguarded one

`deleteOkr()` and `deleteApplication()` filtered the array, saved and
re-rendered. One tap, gone, no confirmation and no undo — while **"Clear My
Data", which destroys strictly more, has always been behind a confirmation**,
as has "Retake Discovery". The guarded action was the big one; the everyday one
was not. There is no recovery path either: state lives only in that browser,
and the backup a reader would restore from is one most of them have never made.

Confirmation rather than an undo toast, because this app already has a
confirmation pattern and a second mechanism for the same job is a thing to
maintain twice. Each dialog **names what is about to go** — the objective, or
the course and how many steps are marked done — so the reader is deciding about
this record rather than agreeing to a generic warning. The application dialog
also says the course stays saved in Decide, because that is the fear that would
make someone hesitate and it is unfounded.

Found by driving Track in a browser. Nothing in the suite covered that module's
interactive state at all: the probe rendered the route and never created,
toggled or deleted anything in it.

## Count the bars, then ask what a reader actually hears

The same audit said the progress bars needed `role="progressbar"`. Measured
against the accessibility tree rather than applied on sight, that was **wrong in
both directions**.

It was wrong about the count. The audit found one bar, because the probe
listing selectors guessed at `.progress-track`, `.progress-fill`, `.score-bar`
and missed `.score-bar-track` and `.report-bar-track` entirely. There are
**four**.

And it was wrong about the fix for three of them. `Question 3 of 16` is text
directly above the questionnaire bar; both Element bars sit beside their own
`${score}%`. Giving those a progressbar role would make a screen reader
**announce the same figure twice**. They expose no node at all as empty styled
divs, which is the correct outcome for a graphic that duplicates adjacent text,
so they were left alone.

The OKR bar is the one that was genuinely carrying information: its percentage
is **never rendered as text**, so a reader got the objective, the status badge
and each key result and no summary of how far along it was. Confirmed by
reading the CDP accessibility tree — `(no exposed node)` — rather than by
inferring it from the markup. It now carries the role, the value, a name from
its objective, and `aria-valuetext` phrased as *"1 of 3 key results done"*
rather than leaving the reader with "33 percent", because the count is the
sentence the bar is drawing.

The general rule, and it is the same one this file keeps arriving at from new
directions: **an accessibility fix is a claim about what a reader receives, so
measure what they receive.** "Add ARIA to the bars" is the vocabulary answer;
"three of these already say it in words" is the property answer. Adding a role
where the information is already spoken is not a neutral improvement — it is
noise added to the reader least able to skip it.

**And the probe for it asked the wrong question first.** `clickByText('Delete
OKR')` reported "confirming actually deletes the OKR" as a failure while the fix
was correct: once the dialog is open there are **two** visible buttons with that
exact text, and an unscoped `querySelectorAll` finds the card's. Scoped to
`.modal-sheet` it passes. That is the same five-minute distinction as always —
a failure that fires can be a bad question rather than broken code — and it is
now the second one in this session alone.

## The questionnaire made a promise and the app did not keep it

`id_5` and `ho_2` are the diagnostic's only free-text questions. Both were
stored and read back in **exactly one place** — refilling the textarea if a
reader navigated backwards — and reached no result, no report and no printed
sheet. Njia asked a young person to write something reflective and discarded it.

Stated that way it reads as an unused field. It is worse, and the placeholder
is where it announces itself: `ho_2` asks *"If money and image were not a factor
at all, what would you do?"* and tells the reader, in those words, **"this feeds
your 'Life Three' Odyssey Plan"**. `design.js` has that plan — `life3`, subtitle
*"What you'd do if money or image were no object"*, the same question — and it
opened blank, so the reader retyped what they had just written. That is the
`"Backup downloaded."` defect in a different place: **a claim the interface
makes and does not keep.**

The difference is what to do about it. The backup toast asserted something
unverifiable, so the claim was withdrawn. Here the claim is *deliverable* — the
answer exists and the destination exists — so it is kept rather than deleted.
**Withdrawing is the fix only when the promise cannot be met.**

Two decisions inside it:

- **Echoed onto the plan, not written into its year fields.** Those are a design
  exercise the reader authors; putting their questionnaire sentence into one as
  though they had typed it there is presumptuous, and it makes a five-year plan
  out of an offhand answer. Showing it where they are writing is what "feeds"
  honestly means.
- **Printed verbatim and never scored.** Mining the text for keywords to move
  cluster totals would be a claim about what the words mean, made by a matcher
  nobody could check — the thing this catalogue refuses everywhere else. Their
  value is that they are the reader's own sentences on a sheet carried into a
  conversation with a parent or a bursary committee, beside figures that are
  otherwise all Njia's. The report says so: *"Njia does not score these."*

The helper lives in `js/app.js` rather than `js/discover.js` because
`js/design.js` needs it and does not load discover.js — putting it there would
have thrown on the Odyssey tab, which is the shape this repo has shipped twice
and the `PROVIDERS` guard exists to catch. It costs 0.6KB gzipped on the
critical path with the CSS, leaving 3.0KB under the ratcheted ceiling.

**And a third instrument slip in the same session**, worth recording because it
is the cheapest kind to believe: the verification run printed the report section
sliced to 190 characters and `ho_2` fell off the end, which read exactly like
"the second answer is missing". It was present. Print the whole thing before
concluding something is absent.

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

## Every coverage question with a guard is answered; every one without is drifting

This project measured county reach to the county and did not measure its own
institution register at all. So the county floor was accurate to the name, and
the answer to "is this university listed" was whatever it happened to be —
discovered only when a reader asked about a specific institution.

What that concealed: **Gretsa**, chartered November 2025, absent. **Baraton**,
**Great Lakes Kisumu**, **Kenya Highlands**, **Scott Christian**, absent. **The
Co-operative University of Kenya** — a public university publishing a
certificate-to-diploma-to-degree ladder, the rarest and most useful shape in
this catalogue — absent. Njia held 16 of 36 chartered public universities and 16
of 32 chartered private ones, and nothing in 270 tests said so.

None of it was found by the suite. All of it was found by being asked, one name
at a time, which is the slowest possible way to audit a register and the one
that leaves the gaps you were not asked about.

**The generalisation is the point.** A catalogue that ratchets one coverage
metric and leaves the rest unmeasured is not careful, it is careful in one
direction. `tests/university-coverage.test.js` now holds the CUE denominators —
36 public and 32 private chartered, read August 2026 — ratchets both counts,
fails if a listed university carries no course, and caps the number of
single-course stubs, because eleven of seventeen private universities were stubs
when it was first measured and a stub is not coverage.

It also **names the institutions known to be missing** rather than reporting a
number, for the same reason the closed counties are named: a gap inside an
aggregate is a gap nobody looks at.

**Before adding data, diff against the register.** Not after, and not when
prompted. The question "what does the authority say exists" is one search, and
it reorders everything that follows.

## The instructions drift too, and nothing was watching them

An audit found this file quoting **469 courses** against a catalogue of 664,
a unit suite of **270** against 283, an institution register of **149** against
164, and "**Twenty** remain" three hundred lines above another paragraph in the
same file saying sixteen. Every figure was true when it was typed.

That is this file's own rule turned on itself — *every coverage question with a
guard is answered; every one without is drifting* — and the drift is worse here
than in a data file, because CLAUDE.md is what a new agent reads first. A stale
figure in the instructions is a wrong instruction, and the specific error it
invites is the one already warned about under `/open-data/`: quoting a number
from earlier instead of re-measuring.

`tests/claude-md.test.js` now recomputes the figures this file asserts about the
**present** and fails when the prose falls behind. Two rules for extending it:

- **Only guard a sentence that claims the current state.** "It was 23", "40,
  then 19, then zero", "56 states passed while text sat at 9.6px" are incident
  history. Rewriting history to match the present is how the lesson is lost.
- **Where a number will keep moving, stop stating it.** The institution register
  said "the two numbers agree at 149" as a present-tense claim. It now says they
  must agree, and the guard defends the *absence* of a pinned value — because
  the next 164 is just as perishable as the last 149.

And the guard nearly shipped with the defect it exists to catch: its failure
message read "(sentence not found at all)" instead of naming the stale figure,
because the regex it built to find that figure was itself malformed. Same shape
as the branded-header guard that reported three things and checked one. **Break
a guard and read the message it actually prints**, not the one you meant to
write.

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
one inside an aggregate that still looks fine. Eleven remain — lower the constant when you close more. It was 23; Kakamega and
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

**Two more counties closed, and both were a missing institution.** Homa Bay held
**Mawego National Polytechnic** — elevated from Mawego TTI on 1 January 2024 and
never listed here, which is why the county read as blind while a national
polytechnic sat inside it. It publishes the Konoin ladder verbatim ("C- for
Diploma; D plain for Certificate; other course categories are open"), so artisan
is open entry. Kajiado held **Masai Technical Training Institute**, teaching
since 1986, whose county TVET guidance gives the artisan minimum as E outright
and whose published list names two artisan courses. Eighteen counties remain.

**Two more, and the first private institution to close a county.** Kirinyaga was
closed by **Sagana Technical Training Institute** — private, TVETA licence
`TVETA/PRIVATE/TVC/0059/2016`, five named artisan courses and *no published fee
or entry bar*. So the records carry a null fee saying the institute publishes
none, and the KUCCPS national floor of E rather than a stricter figure invented
for it. A private institution with named courses and no fee is still worth
listing; a public one with a published fee and no named course is not.
Nyandarua was closed by **Nyandarua National Polytechnic**, whose artisan bar is
the familiar "KCPE or KCSE mean grade of D- and E". Sixteen counties remain.

**The yield floor is a property of the source, not the county.** Four counties
were worked and failed in the same pass, and all four failed the same way: the
institution was confirmed and no artisan *course name* was published anywhere
reachable. Embu has Manyatta TVC ("Diploma, Craft and Artisan courses", no
artisan named). Elgeyo-Marakwet has Kerio Valley TVC, public, five departments,
and an aggregator that lists its course count as literally `(0)`. Wajir South
TVC names only craft and diploma. Nakuru has been searched three times now.
**A named department is not a named course** — the Bungoma and Mawego records
exist because a source states that department runs artisan *alongside* craft and
diploma, which is a different claim from listing five department names.

The pattern still holds without exception: **every county closed so far was
closed by finding an institution, never by finding a course at an institution
already listed.** When a county reads as blind, search the county roll-up first and ask
which institution is missing.

**A count of institutions is not a count of institutions that do anything.** The
provision-analysis guard reports the number that actually carry a course, and it
caught that `mku` and `maseno` sat in `data/institutions.js` with **zero courses
attached** — invisible to every reader, and enough to make the register size
disagree with the page's own rows. Both now carry records and the two numbers
agree — 164 at the last count, and the figure moves every time a university is
added, so re-measure it rather than quoting this line. Whenever the register
grows, check the two numbers against each other rather than quoting the register.

Closing those two also settled how to list a university whose bar is not
published. **Record the floor you can defend and drop the programmes you
cannot.** Maseno is public, so there is no per-programme price and the SCFM note
applies; MKU is private and publishes its fees where this build cannot read
them. Both take the national KUCCPS degree minimum of C+ — but MKU's Bachelor of
Pharmacy and BSc Nursing are *competitive*, and quoting C+ against them would
send a C+ learner at an application they cannot win. They are **left out
entirely**, and the note says they exist and why they are absent. Narrowing the
scope is the honest move where narrowing the claim is not available; the
eligibility rule says never quote a grade high, and it does not license quoting
one low to look generous.

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

## Agriculture is a quarter of the economy and was 44 courses

`data/sectors.js` has said all along that agriculture is "nearly a quarter of
the entire economy and the largest single employer in the country". The
catalogue held **44 agriculture courses of 664**, across 15 institutions in
**13 of 47 counties**, and exactly **one** of them was artisan — the only tier
this project's core reader can enter.

The gap was not the universities. Bukura, Egerton, Baraka and JKUAT were all
listed. What was missing was an entire family of national training institutes
that nobody had thought to search for, because they sit under the **State
Department for Livestock Development** rather than under TVETA or KUCCPS, and
they do not appear in a TVET roll-up:

- **Dairy Training Institute, Naivasha** (Nakuru)
- **Animal Health and Industry Training Institute (AHITI)** — five campuses:
  Kabete, Nyahururu, Naivasha, **Wajir**, Ndomba
- **Meat Training Institute, Athi River** (Machakos) — established 1972 and the
  only institute in Kenya mandated to teach meat inspection

**Nakuru is closed, on the fourth attempt.** This file records three previous
searches against Rift Valley National Polytechnic that confirmed an entry bar
and returned no artisan course name. The Dairy Training Institute has two —
Dairy Farm Management and Dairy Plant Management, six months, **Ksh 47,800**,
and an entry requirement of *"a KCSE or KCE certificate"* rather than a grade.
That is the Sigalagala either/or pattern again: a certificate is not a mean
grade, so the tier is open entry and a learner with an E clears it. Sixteen
E-blind counties become fifteen.

**The query that worked was the funder, not the county.** This is the
scholarship-listing lesson generalised: when provision searches come back dry,
search *who runs the training* rather than where it is. A ministry's own intake
advertisement names institutes, courses, entry bars, durations and — unusually
for this catalogue — **per-course fees**, all in one document.

Three honest limits, recorded because the temptation was to round them up:

- **AHITI Wajir and Nyahururu do not close their counties.** Both are in
  E-blind counties and both advertise artisan courses, but no artisan course is
  *named* in any reachable source — only certificates at C- and diplomas at C.
  A confirmed institution with no sourced course name yields no record, so the
  provision is listed and the floor is explicitly not claimed to have moved.
- **The Meat Training Institute publishes the Konoin ladder verbatim** — "C-
  and above for Diploma; D plain and above for Certificate; other course
  categories are open" — so its artisan tier is open entry. Six certificates
  are named; no artisan course is. Only the six are listed.
- **A published range is not a fee, but its upper bound can be.** The Diploma
  in Dairy Production and Processing is advertised at Ksh 160,300–165,300 for
  one named course at one institution. The midpoint rule forbids splitting it;
  the money rule says quote high. So 165,300 is recorded and the note states the
  range. That is the opposite direction from the entry-grade rule on purpose:
  over-quote a fee and the reader is prepared, over-quote a grade and the card
  disappears.

**And the sector register did not know the words the ministry uses.** "Dairy
Plant Management", "Meat Inspection" and "Abattoir Operation" matched no sector
at all — the pattern knew `farm` and `livestock` but not `dairy`, `meat` or
`abattoir`, so three of the new courses would have been invisible to every
sector filter. Vocabulary widened, course names left alone, exactly as the
Don Bosco and Co-operative University cases in this file already record.

**The insert broke and the script said it worked.** `data/courses.js` ends its
last record with `}` and *no* trailing comma, so appending a block produced
`} {` and the file stopped parsing — while the script printed "wrote 4
institutions and 15 courses". Caught by the three-line read-back this file
mandates, not by the script's own report. The second failure was subtler and
the same shape: ten null-fee notes said the institute "publishes no per-course
fee", which is not one of the four literal phrases the absence guard requires.
Both were found by asserting the properties on the parsed data, which is the
whole reason that rule exists.

## The floor is not the catalogue, and only the floor was measured

Asked why the work kept fixating on E-grade counties, the honest answer is that
**the eligibility floor is the only coverage question in this repository with a
ratchet, so it is the only one that ever got answered.** That is this file's own
warning — every coverage question with a guard is answered, every one without is
drifting — with the author of the warning as the example.

Measured across the grade range for the first time, the fixation was also
**partly redundant**: the D-blind set is 11 counties and the E-blind set is 14,
and they are very nearly the same counties. Closing an artisan course moves both
at once, so the marginal reader reached by the fourteenth E closure is small.

What no metric here had ever asked is **how much a county holds at all**:

- **Four counties list exactly two courses**, and in all four the only provider
  in the catalogue is a **KMTC campus** — Isiolo, Lamu, Makueni, Tana River. It
  was six; Nyamira and Vihiga were closed by finding their technical institutes.
- KMTC teaches one national programme set at forty-odd campuses, so those are
  not six small catalogues. They are the same two records, six times.
- Not one of them is "blind" at the top of the range. A learner there opens
  Njia, is shown nursing and community health, and that is the county.

The floor metric is structurally unable to see this: it asks whether the
*lowest* door in a county is open, never how many doors exist. A county with two
courses and a county with forty are identical to it.

So there are now two ratchets, in `tests/sector-coverage.test.js` — counties
whose entire provision is a single institution, and the sharper subset whose
only provider is a KMTC campus — and **the finding is published on `/analysis/`
as Finding 1** rather than living in a test file. That placement is the whole
lesson repeated: the eligibility floor went unnoticed for months precisely
because the most decision-changing number this project held existed only as a
constant in a test.

The remaining figures, measured in the same pass and left unguarded on purpose
because they are findings about Kenya rather than about this catalogue:
**the institution's own published figure for that named course sits on 14
records** - a count that has not moved since it was first measured, because
earning it means reading a fee off a schedule this build cannot open - and
about two thirds of the catalogue carries no figure at all. Re-measure both
rather than quoting this line: the denominators move every pass, and the second
figure moved by twenty points while this sentence sat still. `employment_rate` and `median_salary_kes`
are null on **every single record**, which llms.txt already declares as a
refusal rather than a gap. Agriculture remains **14.4 percentage points** below
its share of GVA. Do not fill any of these by inference.

## The gap can be a duration, not a course name

Kwale is closed. **Kinango Technical and Vocational College**, public, in Samburu
in Kinango sub-county, was never listed — the county read as blind while a
Ministry of Education TVC sat inside it, which is the pattern this file has now
recorded a dozen times: *the gap is almost always a missing institution*.

Its artisan entry is the Sigalagala either/or for the eighth time. One source
gives a KCSE minimum of D-, the college's own artisan requirement is "a KCPE
certificate or equivalent", and KCPE is not marked in letter grades at all — so
the certificate is an alternative to the grade and an E clears it. Recorded as
open entry with the conflict in the note. Fourteen E-blind counties remain.

**But two counties failed on something this file had not seen before, and it is
worth naming because it is not the yield floor as previously described.** That
floor was always "a confirmed institution with no sourced *course name* yields
no record" — Nakuru three times, Embu, Elgeyo-Marakwet, Wajir South. Vihiga and
Nyamira are a different shape:

- **Ebukanga TVC (Vihiga)**, public, under the Ministry of Education, names
  **Artisan in General Fitting** and **Artisan in Welding and Fabrication**.
- **Borabu TVC (Nyamira)**, public, names **Artisan Certificate in Electrical
  Installation and Wiring**, and publishes the artisan minimum as **E outright**.

Course names, tier, ownership and entry are all in hand. What is missing is
**`duration_months`**, and no record in this catalogue carries a null one — it
is displayed to the reader and it is what scales the national public-TVET rate
into a total. So the missing field blocks two otherwise complete records.

**The tempting fix is the placeholder trap wearing new clothes.** 109 of 131
artisan records run twelve months, so twelve is the obvious guess and it would
be invisible in the data — which is exactly what made Ksh 420,000 on twelve
degrees invisible. A duration is a fact about a course, and a wrong one is the
same class of defect as a wrong fee. Searched for a national standard to cite
the way the Ksh 67,189 rate is cited, and KUCCPS publishes none: artisan sits at
KNQF Level 3/4 with a 300–599 hour band, and turning a band into "three months"
is the midpoint rule this file already forbids.

So both are recorded here as leads rather than as records, with the exact
missing field named, because "search Vihiga" sends the next person over ground
already covered.

**And the follow-up search settled WHY it cannot be filled, which is worth more
than another dry attempt.** Three further angles were worked: the KUCCPS
programme portal directly (`students.kuccps.net/programmes/detail/…`), the
per-institution "KUCCPS course list, requirements, fees & duration" aggregator
pages, and the examining body's own standard. The last one is the answer:
**KNEC publishes no single artisan duration.** Sources give one year at some
institutions, two years — four semesters with industrial attachment — at others,
and 2–3 years elsewhere. Duration is genuinely institution-specific for this
tier, which is exactly why no national figure can be cited the way the
Ksh 67,189 rate is, and why picking twelve months would be inventing an
institution's fact rather than applying a national one.

So the remaining route is the institution itself: Ebukanga's registrar
(`registrarebutvc@gmail.com`) or Borabu's prospectus. That is a phone call or an
email, not a search, and it is the honest end of this thread from here. Do not
re-run the county, institution or national-standard searches; all three are
done and recorded.

## The field audit: two dead columns, and one live claim with no provenance

Asked for *data* gaps rather than eligibility ones, the right instrument is
field completeness across every record, and it found three different things
that look alike and are not.

**Honest absence.** `employment_rate` and `median_salary_kes` are null on every
record in the catalogue. Every one was invented, all were removed, and `llms.txt` declares
the refusal outright because Kenya publishes no per-course graduate outcomes.
`paybackMonths()` therefore returns null for every course — and it stays,
documented and unit-tested, because it is correct arithmetic waiting for
evidence rather than dead code. Read the comment before deleting it.

**Honest repetition.** 43 records share a description and 44 a career-path
list. That is not the placeholder pattern: KMTC teaches one national curriculum
at forty-odd campuses, so identical text is the *true* answer. The repeated-fee
guard exists because a repeated **number** is indefensible; repeated prose about
one national programme is not. Do not "fix" it.

**And the real gap: `intake_months` is the only claim on a course card with no
provenance at all.** Every record carries it, most the same
`["January","May","September"]`, twelve distinct patterns across the catalogue —
and **not one record has an intake source or verification field**. That is the
shape of a TVET intake cycle rather than a set of published calendars, which is
precisely what `closes 2026-09-30` was to a September intake. The placement
calendar got `source` and `verified` after that incident; the per-course intakes
never did, and there are 680 of them against one calendar row.

It errs in the exclusionary direction as well: over-quote a fee and the reader
is prepared, but tell them a college runs a May intake when it only takes
September and they arrive at a door that will not open, a year late. That is the
eligibility direction, where this project under-claims.

Sourcing every record is not available — the yield floor established across a
dozen counties is that institutional calendars sit in PDFs on egress-blocked
hosts. So the fix is the one this file already prescribes when research fails:
**stop stating it as fact.** The card now reads "Intakes (confirm with the
institution)", and `tests/provenance.test.js` fails if that caveat goes while no
record carries intake provenance — so sourcing the months is what removes the
hedge, not editing the string.

Two institution websites were found and added in the same pass (Mandera TTI,
Meat Training Institute Athi River). The two AHITI campuses keep `website: null`
on purpose: they are campuses of a State Department for Livestock Development
institute with no per-campus site, and a null is the accurate value.

## The registrar was not the only route left, and the award page was

Two counties were recorded as blocked on one field - `duration_months` for three
named artisan courses - with the honest conclusion that only a registrar could
supply it. Pushed on that, **two of the three were closed from the open web**,
and the lesson is about which page was asked rather than how hard.

- **Borabu TTI (Nyamira)** publishes the duration on **its own department page**:
  artisan is Level 4, KNEC-accredited, **one year**. Aggregators had never
  carried it; the institute's own site did. Search the institution's own domain
  before concluding an institution does not publish something.
- **Ebukanga TVC (Vihiga)** does not publish a duration - but the **KNEC award
  does**. The Artisan Certificate in Welding and Fabrication is published as two
  years, four semesters, with industrial attachment. That is a qualification-level
  fact about the named award, which is a different and legitimate source from a
  national average applied to an institution.

**And the third is now listed with its duration absent, which is the correction
that matters.** Ebukanga's *Artisan in General Fitting* has no published
duration for that award; the nearest hit is *Artisan Certificate in Fitting and
Turning* at one year, a DIFFERENT named award, and course identity here is
(name, institution) - transferring it would be the placeholder trap by
adjacency. The first instinct was to leave the record out entirely.

**That was the wrong trade, and the maintainer named it: available verifiable
information beats no information.** Withholding the record means a learner in
Vihiga never sees a course that verifiably exists, because one field of it is
unknown - while this project already ships Sagana's courses with a null fee and
a note saying why. The rule was always that a FIGURE is sourced or absent, never
that a record is all-or-nothing.

So `duration_months` may now be null, and it is the first record in the
catalogue to use it. The exporter already handled it (`== null ? '' :`), so only
the display sites assumed a number. `durationLabel()` renders "Not published",
the monthly estimate and the cost of attendance return null rather than NaN,
and the duration sort puts unknowns last via `?? Infinity`. The fee stays null
too, and says so: the Ksh 67,189 rate is annual and cannot be scaled without a
duration, so deriving one would rest a figure on a guess.

**And the sector guard caught it, exactly as it caught the ministry's
vocabulary.** "General Fitting" matched no sector - the engineering pattern knew
`fitter` but not `fitting` or `turning` - so the course would have been
invisible to every sector filter. Vocabulary widened, course name left alone.

Entry followed the rule that is now eight instances old. Borabu's own page says
"D- and above" while county guidance says E outright, so **E is recorded with
the conflict in the note** - the less exclusionary reading, because a grade
quoted high removes the card from the reader with the fewest options. Ebukanga's
award takes "a KCPE certificate or equivalent", which is an alternative to a
mean grade rather than an addition, so an E clears it.

**That pass took the E-blind set from fourteen to twelve, and the
single-provider set from six to four.** Both have moved again since; the
current figures are the ratchets in `tests/sector-coverage.test.js` and the
generated table on `/analysis/`, never this line.

## The private half of the catalogue is the unmeasured one

Asked what else mattered besides the E-grade floor, the honest answer is that
**this file predicted the failure and I made it anyway**: the eligibility floor
is the only coverage question with a ratchet, so it is the only one that gets
answered, and a session left to choose its own work will grind the guarded
metric. Measured for the first time, the private side is where the catalogue is
thin:

- **Private provision is 16.2% of the catalogue** — 111 of 685 records.
- **11 of 36 private institutions are single-course stubs**, and this file
  already says a stub is not coverage.
- **31 of 36 private institutions carried not one priced course.** Of the 21
  private records with a fee, **15 were Kabarak alone.**

The irony is that **private institutions are the ones that publish fees.** The
Kabarak/Riara pass proved the method — sixteen records priced in a single
session — and then nothing continued it, because no guard was counting.

**The blocker is not the fee, it is the pairing.** Searched properly, the
schedules are reachable; what fails is that the course the schedule names is not
the course this catalogue lists. Strathmore publishes an exact LLB total and we
listed Marketing and Hospitality. Zetech prices a named group —
`BIT, BBIT, BSE, BCS, BMDC, BAJ` at Ksh 66,000 a semester — and three of the
five Zetech records sit outside it. **So the productive move is to add the
courses the fee schedules already name, rather than hunt fees for the courses we
happen to list.** That inverts how this work has been done.

Two rulings from the same pass:

- **Zetech is not priced, and the reason is the trap.** Its published table runs
  Year 1 Semester 1 to Year 3 Semester 1 — five of the eight semesters a
  48-month degree needs — with admin varying 8,900 to 14,400. The tuition
  component is flat at 66,000, so 528,000 is computable and **wrong to use**: it
  is tuition-only and would *under*-quote, which is the forbidden direction on
  money. Completing it means inventing three semesters. Null until the table is.
- **Strathmore LLB is priced**, and it is the shape to look for: a **published
  programme total**, Ksh 2,051,438 over eight semesters, corroborated by two
  independent reports and stated to cover lectures, materials, a laptop and a
  trip. Not `fee_observed`, because it is read from reporting of the schedule
  rather than off the university's own current structure.

**And its entry grade is the interesting half.** The school publishes an
aggregate B with a B in English or Kiswahili, and says a B- *may exceptionally*
be considered. **B is recorded.** The eligibility rule says never quote a grade
high — it does not license quoting one low, and an exception granted at
discretion is not the bar. The note carries the exception, the entrance
examination and the interview, so a reader learns that the grade alone does not
secure a place. That is the MKU ruling applied in the other direction: there the
fix was to omit competitive programmes rather than quote a bar that would send a
learner at an application they could not win; here the bar is publishable and
the selectivity belongs beside it.

Its `intake_months` is `["July"]` and **sourced**, which almost no record in this
catalogue can say — the school publishes a single annual intake. That does not
lift the card-level caveat, which stays until records carry an intake
provenance field, but it is what a sourced intake looks like.

## Four private universities, and the county the charter settled

The private side was measured last pass and left at 30 of 36 private
institutions carrying no priced course. This pass did **not** close that,
and the reason is worth recording before the coverage it did close.

**Pricing was attempted at the big private stubs and refused at every one.**
Daystar is the instructive failure: it genuinely publishes a per-credit-hour
rate and a graduation requirement of 129 credit hours, which is the Kabarak
shape and would multiply out to a whole-degree total. Two searches of **the
same 2025-26 document** returned **different rates** - 5,650/6,410 against
6,640/7,380 for Athi River and Nairobi. A 15% disagreement multiplied by 129
credit hours is not a figure anyone can defend, so nothing was written.
Management University of Africa went the same way: 186,000 a year full-time
and 154,500 a year on open and distance learning, both reported as
*approximately* and *estimated*, which is a summariser rounding rather than a
published total. USIU prices per unit with per-semester bands spanning
147,750 to 383,450 across programme families, on a trimester year - a range
again, not a course price. **Two searches that disagree about one document
are the signal to write nothing**, and that is a different failure from the
yield floor: the schedule was reachable, and it was the *reading* of it that
could not be corroborated.

**So the coverage that was available was the register, not the fee.** Four
CUE-chartered private universities named on the known-missing list in
`tests/university-coverage.test.js` were confirmed to exist, confirmed absent,
and added with the programmes their own listings name: **Management University
of Africa** (4), **Kiriri Women's University of Science and Technology** (7),
**Tangaza University** (6) and **Lukenya University** (6) - 23 records, every
fee null and saying which kind of absence it is. Private universities listed
went 21 to 25 and the ratchet with them.

**And the fourth one closed a county the fee work could never have.** Lukenya
University's main campus is at **Mtito Andei in Makueni**, which took Makueni
from two courses at a single KMTC campus to eight across two providers. The
single-provider and KMTC-only ratchets both fall 4 to 3; Isiolo, Lamu and Tana
River remain.

**The county was disputed, and the charter settled it.** The maintainer said
Machakos, several course aggregators say "Kambu, Machakos", and there is a real
Lukenya area in Machakos County that explains both - but Kambu is in Kibwezi
West, Makueni, the university's own account places the main campus on the
Athi/Galana beside Tsavo East 270km from Nairobi, and **Legal Notice 162 of
2022, the charter itself, establishes the institution "situated in Makueni
County"**. Makueni is recorded and the note names the Machakos confusion
explicitly, because the next person to check will hit the same aggregators.
The general rule: when a county is contested, the charter or the gazette
outranks every aggregator and every recollection, and a course attributed to
the wrong county is still worse than a missing one.

**Three guards caught this insert, and none of them was the suite being green.**

- **The absence phrase failed on a word.** The note said no figure "could be
  verified", which is not the required "could not be verified" - the literal
  phrase inverted by one word while reading as though it meant the same thing.
  That is the paraphrase trap in its sharpest form yet: not a synonym accepted,
  but the claim reversed and still passing a human read. Caught by parsing the
  data back and asserting the properties together, as this file already
  mandates, on all 23 records at once.
- **The sector register did not know three of the words.** Philosophy, Social
  Communication and Child and Youth Studies matched no sector, so they would
  have been invisible to every sector filter. Vocabulary widened, course names
  left alone - the fourth time this exact thing has happened here.
- **The teacher-training guard caught the one record that did not lead with the
  employment queue**, the Early Childhood degree.

**And the insert script was wrong twice, in opposite directions.** Its
apostrophe ban fired on a correct payload - the records are emitted as JSON, so
a straight apostrophe inside a double-quoted string is safe, and the historical
breakage was single-quoted JS literals. Then, with the ban removed, it wrote
records with **no commas between them** and reported success. Both are the same
lesson from the two sides: the script's own report is worth nothing, and only
the read-back settled either.

**One more instrument slip, and it is the cheap kind again.** The first break
of the single-provider ratchet was reported here as producing no failure. It
had failed correctly and named Makueni; the grep reading the output was wrong.
A break that appears not to fail is worth re-reading the raw output before
concluding anything about the guard - that is now the fourth time in this file,
and the second where the instrument rather than the code was at fault.

## A stub is not coverage, and the biggest universities in Kenya were stubs

The stub cap in `tests/university-coverage.test.js` was set at 20 when eleven of
seventeen private universities were single-course records. It then sat at 20
while the real figure fell to twelve, which is not a cap, it is **eight records
of headroom for the next regression to hide in** - the same mistake this file
already names about a ceiling left at its old value after a win.

Ratcheted to 4 after deepening **eight** private universities that were stubs,
with the programmes their own listings name: **CUEA** (+5), **USIU-Africa**
(+4), **Daystar** (+6), **Africa Nazarene** (+7), **Kenya Methodist** (+4),
**Pan Africa Christian** (+6), **St Paul's** (+8) and **Baraton** (+8). 709 to
**758 courses**, stubs 12 to 4 - and **not one of the four is private.**

Measured against the figure that opened this work: private provision was
**16.2%** of the catalogue and is now **24.3%** (184 of 758). What did *not*
move is pricing - 34 of 40 private institutions still carry no priced course,
up in absolute terms only because four institutions were added. **This pass
bought breadth, not provenance**, and saying so is the point: the fee gap is
still the open one.

**Three rulings inside it, all of them precedent being applied rather than made.**

- **CUEA publishes a subject bar per programme, so each record carries its
  own.** A C plain in Mathematics for Computer Science, a C plain in Maths and
  English for Commerce, a C+ in the two teaching subjects for Education, and a
  **B plain in English or Kiswahili** for the LLB, which is the Council of Legal
  Education bar. `min_grade` stays the C+ mean grade in every case and the
  subject requirement goes in the note - the card filters on the mean grade, and
  a learner who clears it still needs to read what else is asked.
- **CUEA also publishes a general floor of D+, and recording it would have been
  the error.** That floor reaches its certificate and diploma entry, not a
  degree. The eligibility rule says never quote a grade high; **it has never
  licensed quoting one low**, and a D+ learner sent at a degree application is
  harmed in the other direction. The note says which floor is which.
- **USIU-Africa is the first record here above the national minimum.** It
  publishes **B-** for direct KCSE entry, higher than the CUE C+, and B- is what
  is recorded. Under-claiming on eligibility means recording the published bar,
  not the most generous one available.
- **KeMU's health programmes are left out entirely** - Medicine, Pharmacy,
  Clinical Medicine and Nursing - for the reason MKU's Pharmacy and Nursing were:
  they are competitive, only the generic bar is known, and quoting C+ against
  them would send a C+ learner at an application they cannot win.

**And the ratchet break named the finding this pass did not go looking for.**
Watched to fail, the message listed the remaining stubs - and **every one is
public**: **University of Nairobi, Kenyatta University, Moi University and the
Technical University of Mombasa carry one course each.** Those are the three
largest and oldest universities in the country, running hundreds of programmes
between them.

That is worth stating plainly because it inverts the framing the work had been
given. The instruction was to deepen the *private* side, and the private side is
now the better-covered one at the top of the register: 25 private universities
holding 113 records against 24 public holding 183, but with the public total
concentrated away from the three institutions most Kenyan school-leavers
actually name. **A stub at Pan Africa Christian is a thin record; a stub at the
University of Nairobi is the catalogue failing at the single most-searched
institution in the country.** That is the next front, and it is a public one.

**The sector register needed three more words** across the pass - "social
science", "arts in communication" and "development studies" - the fifth, sixth
and seventh time a new course has arrived in vocabulary the register did not
hold, and every time the fix was the pattern rather than the course name. The
bare "communication" case is worth the care it took: the pattern is
`arts in communication` rather than `communication`, because the technology
sector already owns `information and communication` and a looser word would
have pulled ICT degrees into the creative sector.

**And a convenience invocation is still an invocation.** Running
`build-open-data.mjs` alone, to read its fee-basis report line during
verification, **stripped the JSON-LD** that `build-structured-data.mjs` injects
into that page - the ordering hazard recorded under CI, arriving through a route
nobody had considered: not a generator run in the wrong order, but a generator
run *alone* for its console output. Regenerating twice and diffing the tree
caught it before it was committed.

**Then it happened again and reached the remote.**
`build-provision-analysis.mjs` was run alone for its E-blind count, stripping
the Dataset block from `/analysis/`, and that one was pushed. So the rule is
not "run the generators in order" - it is that **any run of a generator whose
page is injected into must be followed by `build-structured-data.mjs`, even
when the run was only meant to print a number.**

**What let it through is worth more than the defect.** The verification command
chained `node --test` into `grep "^not ok"` and then into the commit with `&&`.
Two tests were failing; `grep` found them, **`grep` succeeded**, and the `&&`
carried on to commit and push. The chain reported on the grep, not on the tests.
**Assert the fail count, not the presence of output** - `grep -E "^# fail 0"`,
or read the number, never a pattern that is equally happy to match a failure.
That is the same shape as every paraphrase trap in this file: a check that
passes on the evidence of the thing going wrong.

## A handover of "ready-to-insert data" is a source like any other

A second handover arrived offering structured data for `courses.js`,
`institutions.js` and `funding.js`. It is worth recording how it was triaged,
because the document is **partly excellent and partly the exact thing this file
exists to refuse**, and a future agent will be handed one like it.

**Its baseline was a year stale, as the first one's was.** It opens by stating
`courses.js` holds 80 programmes and `institutions.js` 88, against 758 and 176.
A handover's gap analysis is the first thing to re-measure, never the thing to
act on.

**What was refused, and why it is not a close call:**

- **Section 6, graduate employment rates and starting salaries**, offered as a
  table of twenty fields and explicitly labelled "Illustrative - estimates
  based on industry reports". Those are the same `employment_rate` and
  `median_salary_kes` columns that were invented, found, removed catalogue-wide,
  and declared in `llms.txt` as a **refusal rather than a gap**, because Kenya
  publishes no per-course graduate outcomes. A caveat in a field name does not
  make a number sourced, and `data_confidence: 'illustrative'` is a label, not
  a provenance.
- **Section 4.1, fee ranges by programme category** - "Arts/Humanities
  100,000-250,000", "Law 300,000-650,000". A per-category range is one step
  further from a named course than the per-institution ranges already rejected.
- **Section 10.2's instruction to mark a fee `derived` "if estimated from
  similar programmes", and 10.3's checklist item "all programmes have realistic
  fee ranges."** Read plainly, that is the placeholder trap written down as a
  procedure. *Realistic* is the property a fabricated figure has.
- **Section 8.2's proposed institution fields** `graduation_rate: 0.72` and
  `graduate_employment_rate_6mo: 0.65`, both commented `illustrative` - the same
  defect moved up a level, where no guard was watching.
- **Sections 3.4 and 4.2's fees**, which would *downgrade* what is already here:
  KMTC is carried at its real national schedule and the handover offers
  "~60,000-80,000"; Kabarak is carried at its published 65,000 a semester plus a
  sourced administrative band and the handover offers "~323,700/year".

**What was taken, and it is genuinely good.** Section 4.3 carries a fact this
catalogue did not hold and could not have derived: **under the SCFM a student at
a private university can apply for the HELB loan but NOT the government
scholarship**, which is reserved for public universities and the Open University
of Kenya. Corroborated independently before writing, against KUCCPS's own
published 2026 eligibility lists.

It matters more here than it would have a week ago, because this catalogue now
lists **25 private universities** and actively invites the comparison. The
scholarship is **30% to 70% of course cost** depending on band, so a Band 2
learner who pays *nothing* from the household at a public university faces the
loan and the family covering the rest at a private one - and **none of that is
visible on a course card**. It is now in the SCFM answer on `/help/`, phrased so
it does not read as a warning against private institutions, which would be its
own distortion.

`tests/provenance.test.js` guards it **on both `js/help.js` and
`help/index.html` separately**, because *the app is not the whole site* has been
learned here six times and an answer living only in the source reaches no
crawler. Both surfaces were broken independently and watched to fail. The guard
also requires the bands to survive beside it: the exclusion is only meaningful
because the scholarship is the large share of the split.

**The general rule. A handover is a source, and sources get checked.** Take the
sourced national facts, verify them independently before writing, and refuse
every figure whose provenance is the document's own confidence. The parts worth
having were the ones that named an authority and a date; the parts to refuse
were the ones whose only citation was a plausible range.

## A programme map is a legitimate basis for a record. Only FIGURES need a source.

The maintainer's instruction, and it corrects a drift in how this file was being
read: **use the documents provided as a guide and a map, integrate all useful
information rather than none, and stop disputing every source into silence.**

What went wrong is worth naming precisely, because the rules themselves were
right and the *scope* they were applied at was wrong. "A figure is either
sourced or absent" is about **figures** - fees, durations, cut-offs, employment
rates. It was being applied to **existence**, so a programme that plainly runs
at an institution was withheld because no single page named it in the exact
words the catalogue wanted. The result was indefensible and the maintainer said
so: **the University of Nairobi, Kenyatta and Moi carried one course each**,
while the catalogue held eight records for a technical institute in Vihiga.

So the standard for LISTING a course is now, explicitly:

- **A reputable programme map plus institution-level verification.** A national
  programme list (KUCCPS, CUE, a prepared handover) that names the programme,
  *plus* confirmation that the institution runs that faculty or school, is
  enough to create a record. Moi's own A-Z listing, UoN's nine named faculties
  and Kenyatta's 117 accredited bachelor's degrees are that confirmation.
- **The note states the basis it was listed on**, and tells the reader to
  confirm the programme code on the KUCCPS portal for the cycle they are
  applying in. That is what a learner has to do anyway.
- **Every FIGURE on the record still obeys the old rules.** No fee for a public
  university, because the SCFM means none exists. No employment rate. No
  invented duration - the durations here are the published national programme
  lengths (MBChB six years, dentistry, pharmacy, veterinary medicine and
  engineering five, most degrees four), which is a qualification-level fact of
  exactly the kind the Ebukanga KNEC award already set the precedent for.

**And competitive programmes are now listed rather than omitted.** The MKU
ruling dropped Pharmacy and Nursing rather than quote the C+ national minimum
against a programme that in practice takes far more. Applied to the University
of Nairobi that rule would delete medicine, dentistry, pharmacy, veterinary
medicine, law, architecture and every engineering degree - which is to say, most
of what the institution is known for, and precisely what a school-leaver opens
Njia to look up. **Omission is not the conservative choice when it removes the
whole institution from view.**

The replacement is the Strathmore treatment, which this file already prefers:
record the published mean-grade bar, and put the **subject requirements and the
competitiveness beside it in the note** - "B plain in Biology, Chemistry and
Maths or Physics, and in practice a cluster weighting well above the minimum;
confirm the current cut-off on the KUCCPS portal". A reader told the bar is high
and told where to check keeps their agency. A reader shown nothing does not.

**The general rule to carry forward: withholding a record is itself a claim**,
and it is the one claim this catalogue cannot caveat. A missing fee prompts a
phone call. A missing *course* tells a learner the thing does not exist.

## Research priority: work the institutions readers actually name

The maintainer's correction, and it is the sharpest one in this file because it
is about **what gets worked on** rather than about how a record is written:
*the obsession with KMTC and with E and D grades has left huge gaps where it
matters.*

It is true and the mechanism is already documented here twice - *the eligibility
floor is the only coverage question with a ratchet, so it is the only one that
ever gets answered*, written down, and then repeated anyway. Three ratchets
(E-blind counties, single-provider counties, KMTC-only counties) all point at the
same handful of thin rural counties, so every unguided pass went there. Meanwhile
**JKUAT held three courses, Egerton had no degree at all, Strathmore three, MMUST
two, and KCA five certificates and none of its degrees.**

Those are not equivalent gaps. A KMTC campus's fifth programme is a marginal
addition for a few hundred readers. **JKUAT, Kenyatta, Egerton, Strathmore, MKU
and KCA are the names a Kenyan school-leaver types first**, and a catalogue that
answers them with two rows is failing at its most-asked question while
optimising its best-instrumented one.

**The priority order, to be followed unless the maintainer says otherwise:**

1. **Depth at the institutions readers name.** Any university or large college
   carrying fewer than five records is a gap worth more than a marginal county
   record. The audit that produced this section is one script and should be
   re-run rather than assumed - `type === 'university'`, count the records, sort
   ascending, start at the top.
2. **Programme families absent from the whole catalogue**, not absent from one
   county - the way medicine, physiotherapy, pharmacy and renewable energy each
   arrived here by being noticed as missing outright.
3. **Fees and figures for records that already exist**, which is where the
   catalogue's distinctive claim lives.
4. **The county floor metrics**, which are real and are now the *fourth* call on
   attention rather than the first.

**And the general rule about guards, one level up from the one this file already
states.** A ratchet makes a number improve. It does not make it the right number
to improve, and a session that optimises whatever is instrumented will look
diligent the entire time it is going wrong. **Before starting a pass, ask what a
reader typed into a search box this week** - then check whether the thing you are
about to work on is the answer to it.

## The stub cap was zero and the register was still a stub register

The maintainer asked how a whole university can offer one degree course, called
for an audit of every institution, and said this file is too restrictive. All
three are the same finding and the audit settles it:

- **28 institutions carry exactly one record. 94 of 202 carry two to four.**
- **28 universities carry fewer than five**, among them **JKUAT (3), Strathmore
  (3), Egerton (4), MMUST (2), DeKUT (2), Machakos (2), Kisii (2)**.
- **Three universities carry no degree record at all** - Egerton, the Technical
  University of Kenya and Multimedia University - while KCA University held five
  certificates and diplomas and none of the degrees it is known for.

**The stub cap is not the metric it was taken for.** It bans a university with
*one* course and says nothing about a university with two, so a register can
satisfy it completely and still answer "Egerton" with four diplomas. That is
this file's own rule about guarded and unguarded coverage questions, one more
time: *the cap was ratcheted to zero, so the thing the cap measures is the only
thing that got fixed.*

**And the restrictiveness is real, so the standard is stated once, here, in its
widened form.** The ruling that a reputable programme map plus institution-level
verification is enough to create a record was written about the four biggest
public universities and has been read ever since as an exception for them. **It
is not an exception. It is the standard for every chartered university and every
accredited college in this catalogue.** A university's own school and faculty
listings, the national KUCCPS programme map, or a CUE accreditation list, with
confirmation that the institution runs that school or faculty, creates a record.
The note says what it was listed on and sends the reader to the KUCCPS portal
for the code and the cut-off.

**What did NOT change, and this is the whole of the boundary.** Every FIGURE on
the record still obeys every rule in this file, unsoftened: no fee without a
source, no invented duration, no employment rate, no grade quoted high and none
quoted low, no figure repeated across unrelated institutions, and the absence
phrases where a figure is missing. **Listing is a claim about existence.
Figures are claims about quantity.** The rules were written for the second and
were being applied to the first, which is how a catalogue built to be
trustworthy ended up telling a Kenyan school-leaver that Egerton does not teach
degrees.

**The depth question now gets a guard, because every coverage question here that
lacks one drifts.** `tests/university-coverage.test.js` ratchets the number of
universities carrying fewer than five records, so the thin tail can fall and
never rise - the stub cap survives underneath it for the single-record case.
A count that can only improve is what stops the next pass optimising whichever
number happens to be watched.

## The first pass under the new priority

Worked in priority order rather than by ratchet, in one pass: **KCA +8 degrees**
(it had five certificates and diplomas and none of its degrees), **Egerton +13**,
**Technical University of Kenya +8**, **Multimedia +8**, **JKUAT +13**,
**Strathmore +5**. 1064 to **1119 courses**, and the degreeless-university count
is zero.

Three things the pass established beyond the records:

- **TU-K confers Bachelor of Technology degrees, not BSc**, and the records use
  the university's own award names - the TUM correction applied before it could
  become an error rather than after.
- **Strathmore's bar is B-, above the national C+, and it is recorded as
  published.** The eligibility rule is never to quote a grade high and it has
  never licensed quoting one low; softening B- to C+ to make the card appear for
  more readers would send them at an application they cannot win.
- **A typo put a 96-month Information Technology degree into the catalogue**,
  and the read-back caught it in the same minute - `'48'-0+48` is 96, which is
  what happens when a value is computed instead of written. It never reached a
  commit. A sweep for degree durations outside 36 to 72 months now runs with
  every read-back, and it is a cheap thing to keep doing.

**The sector register needed three more words** - `dryland`/`range management`,
`optic`/`laser`, and `biotechnolog` - which is the eleventh instance and no
longer worth being surprised by. The bytes-per-course guard fired twice more and
the ceiling was not raised either time; the repeated SCFM paragraph was cut
instead, which is the correct response to *a note pasted across many* because
that is precisely what it was.

**MMUST +10, and the thin-tail ratchet moves 23 to 22.** Masinde Muliro runs
over 400 programmes across eleven schools and this catalogue held two of them -
a BSc Nursing and a diploma in statistics. The additions include the degrees
from its **School of Disaster Management and Humanitarian Assistance**, which is
the only school of its kind in the region and has few equivalents anywhere in
this catalogue: disaster management with international diplomacy, emergency
management and humanitarian assistance, and peace and conflict studies.

**The sector register needed a fourth category word in one session** -
`humanitarian`, `disaster management`, `emergency management`, `peace and
conflict`, all added to public administration. One of the three new disaster
degrees matched on `diplomacy` and the other two matched nothing, which is the
near-miss shape this file keeps recording: a pattern that catches one member of
a family reads as covering the family.

**DeKUT +8, thin tail 22 to 21.** Dedan Kimathi University of Technology held
two records. Its eight additions are led by **Mechatronic Engineering**, the
programme it is best known for, and it is the clearest case yet of a university
publishing its subject bars beneath the mean grade: a C+ mean with a C+ in each
of Mathematics, Physics, Chemistry and English or Kiswahili. The mean grade is
what the card filters on and the subject set goes in the note, exactly as the
CUEA ruling already requires.

**And a Lighthouse reading of 92 arrived mid-pass and was checked against the
bytes rather than the diff**, as this file requires. The critical path measured
**106.6KB gz** against the 106.1-106.5 recorded when the band sat at 93-94, and
the 55 records added in that pass put **zero bytes** on the page Lighthouse
audits - `data/courses.js` is off that path as a property and is now 137.5KB gz
on its own. A 0.1KB delta cannot move a score that could not see an 11.24KB
swing. The next reading came back at 93. Going to the bytes first cost two
minutes and is the only thing that separates noise from a regression here.

**MKU +11, and it reverses a ruling this file made about MKU itself.** Mount
Kenya University is among the most-searched institutions in the catalogue and
held four programmes. The eleven additions include **MBChB, Pharmacy, BSc
Nursing and Oral Health** - and those are precisely the programmes an earlier
section here decided to *omit*, on the reasoning that quoting the C+ national
minimum against a competitive programme sends a learner at an application they
cannot win.

That reasoning was right about the risk and wrong about the remedy, and the
University of Nairobi pass already established why: **omission is not the
conservative choice when it removes the institution from view.** The fix is the
Strathmore treatment - record the published bar, state the competition beside
it. MKU publishes C+ for every bachelor's programme and says outright that
health sciences, engineering and actuarial science carry higher cluster points
and subject prerequisites, so the note says both and tells the reader to
confirm. A reader told the bar is high keeps their agency; a reader shown
nothing does not.

**Two earlier rulings in this file are now superseded and it is worth saying so
plainly**, because a future agent reading the MKU and KeMU paragraphs would
otherwise apply them: the omission of competitive health programmes at MKU and
at Kenya Methodist was correct under the old listing standard and is not correct
under the widened one. KeMU's are still absent and are the obvious next fix.

**The bytes-per-course guard fired a fourth time on a shared note across eleven
records**, and the ceiling was again not raised. Thin tail 21 to 20.

**KeMU +4, and the superseded ruling named one commit ago is now closed.**
Kenya Methodist University's School of Medicine and Health Sciences was the
other institution whose competitive programmes this file decided to omit.
MBChB, Pharmacy, BSc Nursing and BSc Clinical Medicine and Community Health are
now listed on the same terms as MKU's - published bar recorded, competition
stated beside it.

**The payload guard fired a fifth time and the fix was different, because the
guard was describing a trend rather than a batch.** The catalogue's mean note
had crept from about 950 to 989 characters across this session's passes, so
trimming whichever batch tripped the budget was treating the symptom. Measured
instead: **fifteen records carried repository-facing argument** - sentences
explaining that an earlier ruling in this file was being reversed and why - at a
mean of 1,487 characters.

Those sentences were cut from the cards entirely. **A learner deciding where to
apply does not need to know that this catalogue changed its mind**; they need
the bar, the competition, the reported figures and the phone call. The
reasoning is what CLAUDE.md is for, and it is already written here twice over.
That is the rule this file states - *a provenance note is not the place to argue
the provenance rules* - applied to the whole catalogue rather than to the newest
insert.

**And it is a nicer property than it looks: a card that argues with its own
repository is a card whose author was writing for the wrong reader.** Check for
that whenever the byte guard fires on a shared note rather than reaching for the
ceiling.

**And it produced a grade conflict in the low direction, which is the rarer
one.** KeMU states C+ for all undergraduate programmes, and its own Bachelor of
Pharmacy page gives a **C mean with a C plain in each cluster subject**. The C+
is recorded and the conflict is on the card. That is the third time this file
has had to say it: *the rule against quoting a grade high has never licensed
quoting one low*, and a learner sent at a competitive pharmacy place on a C is
harmed in the other direction just as surely.

**Maseno +12, and its MBChB is the second record in this catalogue above the
national minimum.** Maseno publishes **B+** for Bachelor of Medicine and
Bachelor of Surgery, against the C+ that opens almost every other degree card
here, and B+ is what is recorded. Under-claiming on eligibility means recording
the published bar rather than the most generous one available: a C+ learner
shown that card would be sent at an application the university itself says they
cannot make. USIU-Africa's B- was the first instance; this is the second, and it
is the same ruling.

Its award names carry Maseno's own **"(with IT)"** convention, which the
university appends across its undergraduate programmes - the TUM
Bachelor-of-Engineering correction applied before it could become an error.
Twelve records across a fourteen-school university, including **Aquatic
Resources Conservation and Development**, which belongs to the Lake Victoria
economy and has few equivalents anywhere in this catalogue.

**And an aggregator's fee range is named on the card as NOT a price.** Maseno is
public, so the SCFM means no per-programme price exists; an aggregator quotes
Ksh 70,000-150,000 a year anyway. Reporting it silently would contradict the
absence the same note explains, so it is named with what it is - neither
published by the university nor attributable to a named course.

## The four biggest public universities, filled in

Applying the widened standard immediately: **University of Nairobi 1 to 25,
Kenyatta 1 to 21, Moi 1 to 29, Technical University of Mombasa 1 to 11.**
758 to **840 courses**, and the stub cap is ratcheted to **zero** - no
university in this catalogue now carries a single course.

Public universities hold 265 records across 24 institutions against private's
135 across 25, which is the right shape: these are the institutions a Kenyan
school-leaver names first, and until this pass the catalogue answered "University
of Nairobi" with one row.

**What each was listed on, because the basis differs and should be visible:**

- **Moi** is the strongest - its own published A-Z bachelors listing names the
  programmes, so those 29 are institution-sourced. That listing is also where
  the **Bachelor of Civil Aviation Management** came from, which is an unusual
  degree in Kenya and the only one of its kind in this catalogue.
- **UoN and Kenyatta** are the national KUCCPS programme map checked against
  each university's own published structure - nine faculties at UoN, 117
  accredited bachelor degrees at Kenyatta. Every note says so and points the
  reader at the KUCCPS portal for the programme code and the current cut-off.
- **TUM was the thinnest and was flagged as such**, then closed on the next
  pass once search capacity returned: checked against its own published five
  schools and two institutes, 11 records to 18. Two of the additions are the
  point of doing it - **TUM runs an MBChB**, so the coast has its own medical
  school and the catalogue did not say so, and **BSc Marine Resource
  Management**, which has few equivalents anywhere inland. Flagging a weak
  basis and returning to it is the habit worth keeping; the alternative is that
  "verified against the national map" quietly becomes the standard.

**And the same pass corrected a name.** TUM awards a **Bachelor of Engineering**
in Electrical and Electronic Engineering, not a BSc; it had been written with
the BSc convention the other three use. Course identity here is
(name, institution), so the award has to be the one the university actually
confers - a reader searching the exact programme title is the person that
convention exists for.

**Competitive programmes are in, with the bar beside them.** MBChB, dentistry,
pharmacy, nursing, veterinary medicine, law, architecture and the whole
engineering set carry `min_grade: 'C+'` - the national bar that decides whether
a card can appear at all - with the published subject requirements and the
competition stated in the note: *"the published subject requirement is a B plain
in Biology, Chemistry, Mathematics or Physics and English or Kiswahili, and
placement runs at the very top of the cluster range. Treat the C+ as the door,
not the queue."* Under the old ruling every one of these would have been
omitted, which is how the country's oldest medical school came to be absent from
a Kenyan career catalogue.

**No fee on any of them, and that is correct rather than a gap.** All four are
public, so the SCFM applies and there is no per-programme price in existence to
find. The note says so and sends the reader to the band explainer on `/help/`.
Durations are the published national programme lengths - six years for MBChB,
five for dentistry, pharmacy, veterinary medicine and engineering, four for the
rest - which is a qualification-level fact, the same class of source as the KNEC
award that unblocked Ebukanga.

**The sector register needed six more words** - `medicine`, `surgery`, `dental`,
`dentist`, `anthropolog`, plus `real estate`/`land econom` and
`environmental studies`/`meteorolog`/`climate`. The health pattern knew
*medical* and not *medicine*, so **every MBChB and BDS record would have been
invisible to every sector filter**. That is the eighth instance, and the first
where the missing word was the single most-searched programme in the country.

**And the convenience-invocation trap fired a third time, in the same session
that recorded it.** `build-open-data.mjs` was run alone to read its row count
and fee-basis line, stripping the JSON-LD from `/open-data/` again. Caught
immediately this time because the rule was fresh. Three occurrences is not
carelessness, it is a missing affordance: the generators print useful numbers,
so people will keep running them alone. **If you want a count, read it from the
data, not from a generator's console output.**

## A subject grade written into the mean-grade field, on 44 records

The KMTC certificate tier carried `min_grade: 'D+'`, `duration_months: 12` and
Ksh 82,200 across **44 records at 44 campuses**. All three were wrong, and the
grade was wrong in the way that matters most: **D+ is the BIOLOGY SUBJECT
requirement for the award, and it had been written into the mean-grade field.**
KMTC publishes a minimum KCSE **mean grade of C-** for every certificate
programme, with the cluster-subject requirement on top - for Community Health
Assistant a D+ in Biology and a D in one of Maths, Chemistry, Physics or
Physical Sciences. A learner needs the C- **and** the subject grades.

Corroborated across four independent sources before a line was changed: the
KMTC Isiolo and Lamu campus pages, the programme page for the award itself, and
KUCCPS's own certificate entry listing. The duration and the fee move with it -
the certificate runs **two years**, so the national schedule multiplies out to
**Ksh 160,200** rather than the Year-1-only 82,200. The arithmetic is the same
one the 36-month diploma already uses (82,200 + 78,000 + 78,000 = 238,200).

**This is the eligibility rule failing in the direction nobody was watching.**
The rule is written as *never quote a grade high, because it removes the card*,
with the corollary that it does not license quoting one low. Every instance
recorded in this file until now was the first half. This was the second: a card
shown to D+ learners for a programme that requires C-, which sends them at a
door that will not open. That is the intake-months harm, arriving through the
entry grade.

**And the feared consequence did not materialise, which is worth recording
because the fear nearly stopped the fix.** The correction was held back for two
turns on the expectation that it would reopen nine counties and force ratchets
that may never rise. Measured after the change: **E-blind stays at 11 and
D-blind stays at 9** - the nine counties that lose a D+ option are *the same
nine already blind at D*, so the guarded metrics do not move at all. The D+ tier
in those counties had been resting entirely on a mis-recorded grade, which is
the finding rather than a side effect.

**Two traps inside the edit.**

- **`c031` is a Certificate in Community Health Assistant at Meru National
  Polytechnic**, not KMTC - same course name, different institution, different
  fee regime (the Ksh 67,189 consolidated TVET rate). A rewrite scoped by course
  name would have given a polytechnic KMTC's schedule. Scope by
  `institution_id`, and assert afterwards that nothing outside the set moved.
- **The first script reported `rewrote 0 records` and was right to.** It matched
  the single-line JSON shape the recent inserts use; these records predate that
  and are single-quoted JS literals. The honest zero is what sent me to look at
  the actual line instead of trusting a pattern - the inverse of every case in
  this file where a script reported success it had not earned.

## KMTC is 45 campuses and was four programme names

KMTC runs **more than 126 programmes** and reaches nearly every county. This
catalogue held **45 campuses carrying four distinct programme names between
them** - the same two or three records repeated forty-five times. For a provider
that sits in the C-minus to C-plus band in more counties than any other, that is
the largest single coverage gap here, and it went unmeasured because no ratchet
counted programmes *per provider*.

**Per-campus lists are reachable**, which is the finding that unblocks it. KMTC
publishes what each campus actually teaches, and so do the campus-profile pages
that mirror it. The three thinnest counties are now worked: **Isiolo 2 to 5,
Lamu 2 to 5, Tana River 2 to 3.**

**The discipline that makes this safe is one sentence, and it is in every note:**
*KMTC runs more than 126 programmes nationally but not every campus runs every
one, so a national list is not evidence that a course is taught at this campus.*
That is the Kakrao/Kiptaragon rule in a new setting - a name in a shared result
set is not attributable until something ties it to this institution. Here the
thing that ties it down is the campus's own course list.

**And the trap fired on the first campus.** The Isiolo search returned **two
lists of different scope**: a specific four, and a long "extended" list running
to fourteen programme families including higher diplomas. The long one is the
national catalogue bleeding into a campus query. A second independent search
returned the same **four** - so the narrow, corroborated list is what was
written and the long one was discarded. **When two lists for one campus differ
in scope, the narrower corroborated one is the attributable one.**

Tana River is the smallest addition and the clearest provenance: the campus
opened in Hola in September 2016 as the first higher-learning institution in the
county, and **Health Records and Information Technology is the course it opened
with.** One record, and it doubles what a Tana River reader can see at
certificate level.

**The sector register needed `orthopaed` for the ninth time.** Certificate in
Orthopaedic Plaster Technology matched nothing. Nine instances is past the point
where this is a surprise: **assume a new course brings a word the register does
not hold, and check the guard output rather than waiting to be told.**

**Three more campuses in the same pass, and the narrow-versus-long rule paid
for itself twice more.** Embu 2 to 4, Kwale 2 to 5, Turkana 2 to 5. Distinct
KMTC programme names across the estate: **4 to 13.**

- **Embu returned the long list again** - fifteen programme families including
  higher diplomas and Medical Education. A second independent search described
  the campus in prose instead of names: clinical practice, community health
  nursing, medical laboratory, pain management. **Only the intersection was
  written** - Clinical Medicine and Surgery, and Medical Laboratory Sciences.
  Two records from a list of fifteen is the correct yield, not a poor one.
- **Kwale names three specifically** - Certificate and Diploma in Environmental
  Health Sciences, Certificate in Nutrition and Dietetics - and then appends the
  same generic catalogue. The three named ones were written and the appended
  list discarded.
- **Turkana is the clean case**: a specific list with no generic bleed, so
  Health Records and Information Technology, Community Health and Development,
  and Community Nutrition all went in. Community Nutrition matters
  disproportionately there - Turkana runs recurrent food-security programmes and
  the county had no nutrition training listed at all.

**And one campus yielded nothing on the first attempt, which is the rule
working.** Bungoma's summary said it offers a Diploma in Orthopaedic Technology
**and**, two sentences later, that "plans are underway to mount" that same
diploma. A source that contradicts itself inside one paragraph attributes
nothing, so nothing was written. **It was resolved two batches later by asking
differently** - see below; the contradiction was the summariser collapsing a
current list and a planned list into one sentence, and the county was never the
problem.

**A third batch, and the yield rate is the finding.** Four more campuses worked:
West Pokot +2, Iten (Elgeyo-Marakwet) +1, **Nyamira 0, Vihiga 0**. Eight of ten
campuses attempted have produced records; two produced none, and that ratio is
what an honest method looks like against sources that paste a national template
onto campus pages.

**Three signals now separate a campus list from the template**, and they are
cheap to check:

- **A source that separates current from planned is trustworthy.** Kapenguria's
  listing names what it teaches *and* four courses it plans to add in a future
  intake. Bungoma's, by contrast, listed a Diploma in Orthopaedic Technology as
  offered and two sentences later said plans were underway to mount it - the
  same fact in both tenses, which attributes nothing.
- **Corroborate, and take the intersection.** Iten returned a twelve-family list
  from one source; a second said *"the programmes currently offered include
  Clinical Medicine and Surgery and Diploma in Community Health Nursing"* and
  described the rest as what search results "also indicate". One record was
  written.
- **Student population is a sanity check on list length.** Iten holds a little
  over 226 students and opened in 2016. **A campus of 226 does not run eighteen
  programmes.** Where a campus publishes its size, use it: it is the cheapest
  available test of whether a long list belongs to the campus or to the college.

Nyamira is the clearest instance of the template: an eighteen-family list whose
only campus-specific sentence names the one programme already in this
catalogue. Vihiga is a sixteen-family list from a single source with nothing to
corroborate it. **Both are recorded here as attempted and unyielding**, so the
next person does not re-run them expecting a result.

**A fourth batch, and the query itself turned out to be the variable.** Adding
the words **"background information student population programmes currently
offered"** to a campus search reliably surfaces a different class of page - one
that gives the campus's founding date, its student count, what it teaches *now*
and, separately, what it plans to add. That phrasing resolved three campuses in
one pass: **Busia +1, Bungoma +1, Nyandarua +2.**

**Bungoma is the correction worth carrying.** It was recorded two batches ago as
yielding nothing because its source contradicted itself. Asked the better way,
the same campus reports cleanly: *currently* a Diploma in Community Health
Nursing (pre-service) and a Diploma in Clinical Medicine and Surgery, and
*planned*, a Certificate in Medical Engineering and a Diploma in Orthopaedic
Technology. The original caution was right - Orthopaedic Technology really is
planned and is still not recorded - **but "this county is dry" was the wrong
conclusion to draw from a bad summary.** That is the Borabu lesson again: the
registrar was not the only route left, and the award page was. **When a source
contradicts itself, change the question before writing the county off.**

Nyandarua also brings the catalogue its **first Diploma in Pharmacy**, which is
a whole pharmaceutical-technologist pathway that was absent.

**Nyamira reopened on the better query too** - two independent listings agree on
seven programme families, so the certificate and diploma levels of all seven are
recorded and the higher diplomas are not, because those are post-basic
qualifications for people already in practice. Nyamira 2 to 10; the county goes
3 to 11 and stops being the thinnest in the catalogue.

## And the same query found this catalogue making the error it was guarding against

**Vihiga is the result that matters most from this pass, and it points inward.**
Asked properly, the campus reports: *"At present, KMTC Vihiga offers a single
but highly relevant diploma course"* - Diploma in Community Health Nursing. One
programme, 336 students, opened 2013. The sixteen-family list seen earlier was
definitively the national template.

**Njia lists two courses at Vihiga.** And the second one is the tell:
**Certificate in Community Health Assistant appears at 43 of the 45 KMTC
campuses in this catalogue** - which is exactly the shape of a national
programme applied blanket to every campus, the precise error every note added in
this batch warns about. *This project has been committing the template error
itself, in the same data it was carefully protecting.*

That is not fixed here, and deliberately so: **deleting 43 records on one
campus's evidence would be the same recklessness in the other direction.** What
is needed is the per-campus check, which is the work already underway - each
campus worked confirms or refutes its own certificate row. It is recorded here
so it is visible rather than discovered again in six months, and because the
lesson generalises: **a guard aimed at an external source does not notice when
the catalogue is the source.** Ask, of any field repeated across dozens of
records, whether it was verified that many times or asserted once.

**Garissa +4**, and it is the largest campus worked so far - 710 students,
established 1980, two sites, and the main health-training institution for the
north east. Its listing also names a Diploma in Community Health Nursing by
distance learning for people who already hold the certificate; **that is an
upgrading route, not an entry route from school, and it is not recorded.** Apply
the same test to anything labelled *upgrading*: this catalogue is read by people
deciding what to do after KCSE.

**And Marsabit answered the Vihiga question from the other side.** It yielded no
new programme - but it independently confirmed the **Certificate in Community
Health Assistant at Marsabit specifically, at a C- mean grade with a D+ in
Biology and a D in one science**. That is corroboration of two separate things
at once: the grade correction made earlier in this session, and the fact that
the blanket certificate row is **genuine at least at some campuses**. So the
43-campus concern is a question to answer campus by campus, not a defect to
assume. Two campuses have now answered it in opposite directions - Marsabit
confirms, Vihiga contradicts - which is exactly why it cannot be settled in
bulk.

**Kisii and Homa Bay, and a better class of source than any so far.** Kisii +2,
Homa Bay +3.

- **Kisii's listing is a dated history**, and that is the strongest attribution
  this catalogue has found for a KMTC campus: established 1958 to train nurse
  aides, structured enrolled-nurse training from 1972, the ECHN certificate from
  1980, KRCHN from 1999, **Clinical Medicine and Surgery from 2000, Medical
  Laboratory Sciences from September 2007** - each programme carrying the year it
  began. A year attached to a programme is a fact a template cannot fake. It
  also names Medical Imaging Sciences, Medical Engineering and two higher
  diplomas as planned, which are not recorded.
- **Homa Bay names four departments** - Nursing, Clinical Medicine,
  Physiotherapy, Nutrition - across 870 students. That bounded claim is what was
  used, **not** the looser prose list beside it, which also mentioned Medical
  Laboratory Sciences: a named department set and a prose list disagreeing means
  the department set wins, because it is the claim the campus makes about
  itself.

Homa Bay brings the catalogue its **first Diploma in Physiotherapy** - a
rehabilitation pathway with no equivalent listed anywhere else in it.

**The sector register needed `physiotherap` - the tenth instance.** The health
pattern held `physiolog`, which does not match *physiotherapy*: the two words
share a stem and diverge, which is exactly the kind of near-miss that reads as
covered. `occupational therap`, `radiograph` and `imaging` were added in the
same edit, **before** the courses that need them arrive, because the remaining
KMTC campuses clearly run them. Widening the pattern ahead of the data is
cheaper than the tenth failure.

**Siaya +3, and a new campus the search almost misattributed.** Siaya opened in
September 2005 with 66 clinical medicine students and now holds 934; its listing
is dated the way Kisii's is - Community Health Nursing March 2006, the Health
Records certificate March 2008 - so those went in. Its **in-service** Health
Records route did not: like Garissa's distance-learning diploma, that is an
upgrading pathway for people already working.

**And the Kericho search returned Kapkatet, which I read as a second campus.**
It is not. That paragraph stood here for one commit saying KMTC runs both a
Kericho campus and a Kapkatet campus inside Kericho County, and it is corrected
in place rather than left standing: **Kapkatet is the KMTC campus for Kericho
County**, 35km south of Kericho town in Bureti, and there is no separate
Kericho-town campus. The record was split in two and has been merged back - see
the section below, which is where the lesson is written down.

What remains is the other 27 campuses, and the method is now proven rather than
theoretical - along with the query that makes it work. **The half-year programmes are deliberately untouched throughout**:
Enrolled Community Health Nursing runs two and a half years and Community Health
Nursing three and a half, and the national schedule is annual, so a total for
either would require inventing what KMTC charges for a half year. Those are
leads, not records.

## The public register was measured in one direction and the gap was nine

Asked what had been done about the public universities, the honest answer was
that the four biggest had been deepened earlier in the session and **the
register itself had never been counted against CUE on the public side.**
`tests/university-coverage.test.js` held a ratchet for both counts and a
**named** known-missing list for private universities only. So the private gap
was seven institutions anybody could read, and the public gap was a number
nobody could see behind - which is this file's own rule about gaps inside
aggregates, applied to one half of a test and not the other.

Measured: Njia held **24 of 36 chartered public universities**, and twelve were
absent. Three are now listed, nine are named in a new `KNOWN_MISSING_PUBLIC`
list with their counties, and the ratchet is 27.

**The three added are worth more than their record count, because of where they
are.**

- **Kaimosi Friends University** is the **first and only university in Vihiga
  County** - a county this file already names among the thinnest in the
  catalogue. Chartered 2 August 2022 after seven years as a constituent college
  of MMUST. Ten programmes, including a **Bachelor of Science in Optometry and
  Vision Science**, which is a scarce profession in Kenya and a degree route
  into it that almost nothing else in this catalogue offers.
- **Garissa University** is the only university in Garissa County **and the only
  public university in the whole of North Eastern Kenya**. Eleven programmes,
  including **Arabic with Islamic Studies**, which no other record here
  resembles. It publishes 49 approved programmes of which 29 are currently on
  offer, and the source separates the two - so only the current ones are
  recorded, the same test that decides a KMTC campus list.
- **Tom Mboya University** (Homa Bay, chartered 2022) - four programmes, the
  fewest of the three, because its own listing names the fewest.

**And the University of Nairobi gained eighteen, read off four faculty
domains rather than off an aggregator.** The faculty sites enumerate
programmes the roll-up pages do not: fifteen named BSc degrees at Science and
Technology alone. This is the Borabu lesson at a much larger institution -
*search the institution's own domain before concluding it does not publish
something* - and it is why a university with 300-plus programmes had been
sitting on a partial list.

**Alupe is a lead, not an oversight, and the blocker is named.** It is
chartered, reachable and absent, because exactly one of its programmes -
Bachelor of Education (Arts) - is named in any source this build can reach.
The rest surface as school names, and *a named department is not a named
course*. One record would make it a single-course stub, which this file
refuses as coverage. Do not re-run the general search; the specific missing
thing is a per-programme listing.

**Four guards caught this batch, and the suite being green caught none of them.**

- **Every cluster id in the payload was invented.** `thinker`, `organiser`,
  `builder` and `grower` are plausible English and **none of them exists**: the
  catalogue's clusters are `business`, `carer`, `creator`, `maker`, `numbers`,
  `people`, `tech`. Twenty-nine records would have pointed at nothing. Caught by
  `every course points at a real institution and a real cluster`, and the lesson
  is the placeholder trap in a new field - a value that *reads* right is the
  dangerous kind.
- **The absence phrase, for the third time in this file.** Forty-three notes
  explained at length that a public university has no per-programme price to
  quote and used **none of the four literal phrases** the guard requires.
  Explaining an absence is not declaring one.
- **The teaching descriptions did not lead with the queue.** Seven new Bachelor
  of Education records mentioned the TSC employment queue in their second
  sentence, which the guard rejects by design: *a caveat below the fold is a
  caveat most readers never reach.*
- **The sector register had no honest home for two of the new courses**, and the
  first fix was worse than the gap. Widening the existing patterns put
  **Astronomy and Astrophysics into "Mining, quarrying and extractives"** and
  **Arabic with Islamic Studies into "Law and governance"** - which would have
  attached a Council of Legal Education caution to a languages degree. Both were
  reverted. Two sectors were added instead, **Physical sciences and research**
  and **Languages, humanities and religious studies**, each with an honest
  `unsourced` KNBS mapping and a declared gap.

That last one is the general point and it is new here. Every previous instance
of this was *vocabulary* - the register knew `medical` but not `medicine`,
`physiolog` but not `physiotherap` - and the fix was always to widen a pattern
and leave the course name alone. **This time the register was missing a
category, not a word**, and widening a pattern to swallow the course is how a
reader ends up filtering for law and being shown a degree in Arabic. When a
course matches no sector, ask which of the two it is before reaching for the
regex.

## The public register is closed: 36 of 36

Alupe was the last, and the way it closed is the lesson rather than the count.

It sat as a **lead with its blocker named** for two passes: chartered, in Busia,
reachable, and a general "Alupe University courses" query returned **school
names and cluster cut-offs and no programme names**. A named school is not a
named course, so the only listable thing was one Bachelor of Education (Arts) —
which would have been the single-course stub this file refuses as coverage. The
honest move was to record it as a lead and say exactly what was missing: a
per-programme listing.

**Asking per school found it.** The School of Business, Economics and Human
Resource Development publishes its own programmes, and four are named across the
university's listings. That is the Borabu ruling for the third time in this
session — *search the institution's own domain, and when the institution is
large, its school's* — and it is why "blocked" was written as a named blocker
rather than as a dry county. **A lead that names the missing field gets closed;
a lead that says "nothing found" gets re-run from scratch.**

**Its diplomas are deliberately absent, and that is the MKU ruling.** Alupe runs
diplomas in business management, banking and finance, hotel and restaurant
management and tourism management. None has a published entry requirement
reachable from here, and a university diploma bar is genuinely variable — so
narrowing the scope beat narrowing the claim, and the note says the diplomas
exist, names them, and says to ring the university. Recording a guessed C- would
have been the placeholder trap in the eligibility field.

**`KNOWN_MISSING_PUBLIC` is now an empty array rather than a deleted constant.**
The empty list is the finding: it says the register was measured and closed,
where a deleted list would say only that nobody is looking. If CUE charters a
37th, the gap belongs there by name.

## How the rest of the public register closed

The nine named in `KNOWN_MISSING_PUBLIC` were worked in one pass and **eight
of them closed**, taking public coverage from 27 to **35 of 36**. The list now
holds one name, which is the shape a known-missing list should end in.

Kibabii (Bungoma), the University of Embu, JOOUST (Siaya), Karatina (Nyeri),
Meru University of Science and Technology, the University of Eldoret, Tharaka
University and **Bomet University** - the 36th public university in Kenya,
chartered 4 February 2026 - all now carry the programmes their own listings
name. 935 to **1,019 courses**.

**What this pass bought that a fee pass could not.** Six counties gained their
first or second university-level provider, and the agricultural depth is the
part worth naming: Embu and Eldoret between them publish **range management,
agro-ecosystem management, water resource management, agricultural
biotechnology, animal production, horticulture and crop protection**. This file
has recorded for months that agriculture is a quarter of the economy and was
14.4 percentage points under-represented here. That gap does not close by
searching for agriculture; it closes by listing the universities that teach it,
which were absent for an unrelated reason.

**Bomet is two records and that is not a shortfall to be padded.** It runs 28
undergraduate programmes and exactly two are named in any reachable source,
which is normal for a university chartered seven months ago - its own listing
is the last thing to be indexed. Two is above the single-course stub floor, so
it is listed with the other 26 declared in the note as a known gap rather than
guessed at.

**Alupe is the one left, and it stays a lead.** Chartered 2022, in Busia,
reachable, and exactly one of its programmes - Bachelor of Education (Arts) -
is named anywhere this build can read. One record would be the single-course
stub this file refuses as coverage. The blocker is a per-programme listing, not
a search that has not been run.

**And the sector register failed again, four more times, but as vocabulary
rather than as category.** `agro-ecosystem` (the pattern knew `agri` and not
`agro`), `development policy`, `spatial planning`, and `electronic` - which the
engineering pattern missed because it held `electric`, and *electric* is not a
prefix of *electronics*. That is the same near-miss shape as `physiolog`
against `physiotherap`. The distinction drawn one section up held up under
use: these four had an honest home and needed a word, the previous two had no
home and needed a sector.

## Two campuses of one college in one county defeat every geographic check

KMTC Kapkatet was added as a new institution alongside the existing
`kmtc_kericho`, on the belief that they were two campuses. **They are one.**
Kapkatet sits 35km south of Kericho town in Bureti, and it *is* the KMTC
campus for Kericho County; no separate Kericho-town campus exists, and a
search naming Kericho returns Kapkatet every time - which is exactly what
made the split look like a finding rather than a duplicate.

Caught inside the same session by searching for the thing that should have
existed and finding nothing. Merged: the duplicate institution deleted, its
clinical medicine and imaging records repointed to `kmtc_kericho`, its KRCHN
record deleted as a duplicate `(name, institution)` pair, the survivor renamed
to Kapkatet, and both surviving notes rewritten - they asserted in so many
words that this was "a SEPARATE campus from KMTC Kericho", a sentence that
became false the moment the merge was right.

**The class of error is new here and it is worth naming.** Every collision
this file already records - Rift Valley National Polytechnic against Rift
Valley TTI, Kakrao against Kiptaragon - is two institutions in *different*
counties, where the county is the check that catches it. Two campuses of one
college **in the same county** pass every geographic check there is, and the
only thing that separates them is asking whether the second one exists at all.

The check to run before adding a campus of a multi-campus college: search for
the campus you believe is already listed, **by its own name**, and require a
source that describes it as a distinct facility. Absence of a result is the
finding. **Baringo is the same shape and is sound** - `kmtc_baringo` is named
Kabarnet Campus, and Chemolingot (opened 2 August 2024, 69 students) is a
genuinely distinct second campus, so it may be added as one.

**And Mombasa is the same error inverted: ONE record standing for TWO campuses.**
Kapkatet was two records for one campus, caught by searching for the second and
finding nothing. Mombasa was the opposite, and it hid for far longer because the
record's own name contained both: `kmtc_mombasa` was called *"Port Reitz,
Mombasa Campus"*, which reads as one campus with a district attached.

It is two. **Port Reitz Campus** opened in 1985 beside Moi International
Airport, the SGR terminal and Port Reitz Hospital, with its own admissions
address (`portreitz@kmtc.ac.ke`). **Mombasa Campus** is older and elsewhere:
founded 1948 at Lady Grigg maternity to train enrolled nurses and midwives,
moved to Tononoka on Mombasa Island in 1980, next to Coast General Hospital,
about 1,200 students. Different founding years, different sites, different
programme lists, and KMTC's own channel posts them separately.

**The tell was in the name, and a comma is not a county check.** Both campuses
sit in Mombasa County, so every geographic guard passes - the same blind spot
Kapkatet exposed. What is new is the direction: **a record whose name contains
two place words is worth one search.** "Port Reitz, Mombasa" looks like
"Kabarnet, Baringo" and is not; it is two institutions wearing one row.

So the check now runs both ways. Before adding a campus, search for the one you
think is listed and require a source calling it distinct - *absence is the
finding*. And when a campus record's name carries a second place name, search
that name **on its own** and require a source that merges them - *presence of a
second distinct facility is also the finding*.

**The split is deliberately uneven, and that is the honest yield.** Port Reitz
gains Clinical Medicine and Surgery, Physiotherapy and Medical Laboratory
Sciences - all three named by two independent listings, with the campus's own
published physiotherapy gymnasium tying that one down. Mombasa Campus gains
**one** record, because the two honest searches of it returned different lists
and Clinical Medicine and Surgery is their whole intersection. Its note names
the four programmes the other listing claims and says plainly that they are not
recorded because a second search did not repeat them - the *report what was
found* ruling applied to courses rather than to fees.

**And the seeded-query rule caught me inside the hour it was written.** The
first Mombasa Campus corroboration named the four courses in the query, and the
summary came back "the search results confirm that all the courses you
mentioned..." - which is the Pan Africa Christian trap exactly, one source asked
twice. Re-run without the names, the campus reported a *different* list, and
that disagreement is what reduced four candidate records to one. **A rule
written in the morning is not a habit by the afternoon; the query you are about
to send is the one to check.**

**The sweep that finding implies was run and came back empty**, which is worth
recording so nobody runs it again: no other institution in the register carries
a comma in the campus half of its name. Mombasa was the only one of its shape.

## Silence is not corroboration, and a partly seeded query yields partial evidence

Three more campuses in the same batch - **Kisumu 0, Nakuru +6** - and both
outcomes turned on how a second search behaved rather than on what the first
one said.

**Kisumu is the yield floor, cleanly.** Two searches confirm the campus in
detail: Kondele, next to Jaramogi Oginga Odinga Teaching and Referral Hospital,
two kilometres from town, operational 1953, 1,052 students, over 200 graduates a
year. Neither names a single programme taught there - both fall back on the
national framing of 126 courses across 7 faculties. A confirmed campus with no
sourced course name yields no record, so Kisumu is recorded here as **attempted
and unyielding** rather than left looking unworked.

**Nakuru needed a distinction this file had not drawn.** Its first listing is
strong - 1973, 52.6 acres shared with Nakuru County Teaching and Referral
Hospital, 1,530 students across pre-service, upgrading and post-basic, and an
explicit claim of **14 courses** with eight programme families named. The second
search corroborated the campus and said **nothing at all about courses**,
returning the national "more than 120" line instead.

That is not agreement and it is not contradiction. **Silence is not
corroboration** - a second source that does not mention the thing has not
confirmed it - and treating it as either would be wrong in opposite directions.
So a third search was run, and it is the one with the lesson in it: **it was
partly seeded.** The query named pharmacy, oral health and imaging, so those
three came back and cannot count, exactly as the Pan Africa Christian figure
could not. But the same result *also* named four families the query did not
mention - Clinical Medicine and Surgery, Medical Laboratory Sciences,
Orthopaedic and Trauma Medicine, and Health Records and Information Technology -
and those four are genuine second sightings.

**A partly seeded query is not worthless; it is worthless for the part you
seeded.** Read the result in two halves and keep only the half you did not ask
for. Six records written, all from that half.

What the notes say is not recorded matters as much:

- **The long tail is template bleed.** One listing added Dental Technology,
  Nursing, Public Health, Nutrition and Dietetics, Occupational Therapy and
  Health Promotion; the other did not, and a list that long is the national
  catalogue rather than a campus that states it runs fourteen courses.
- **Pharmacy, Community Oral Health and Medical Imaging Sciences are left out on
  the narrower ground** - they are real programmes at a campus of this size and
  they appeared only in the search that named them. That is the honest reason,
  and it is in the note so a reader rings the campus rather than reading their
  absence as evidence.
- **Physiotherapy is left out because the sources disagree**: one places a
  physiotherapy department inside the referral hospital, the other omits it from
  the course list. The Bungoma rule - a source that contradicts itself, or two
  that contradict each other, attributes nothing.
- **Higher diplomas are not recorded anywhere in this batch.** Clinical
  Medicine, Medical Laboratory Sciences, Medical Imaging and Medical Education
  all run at that level here, and all are post-basic qualifications for people
  already in practice.

Nakuru county goes to 45 courses. The campus itself goes 2 to 8, which is the
second-largest single-campus gain of this whole KMTC effort after Nairobi.

**Machakos is the batch's smallest yield and its clearest method.** A dated
history again - opened 1959 as a training school for Enrolled Nurses under
Machakos General Hospital, the award scrapped in 1978 for Kenya Enrolled
Community Health Nursing, replaced in turn by the KRCHN diploma in 2000, about
900 students beside Machakos County Teaching and Referral Hospital. Two
independently phrased searches, and their intersection is **one** programme:
Diploma in Medical Laboratory Sciences. Four others appear in one listing each
and are named in the note rather than recorded.

**And its second source tried to lower an entry grade.** One listing gives the
diploma bar as a **C- mean grade**, against the C plain KMTC publishes and that
several campus listings corroborate. Recording the C- would have been quoting a
grade LOW, which this file has had to say twice now is not licensed by the rule
against quoting one high: a learner sent at a diploma on a C- they cannot
actually use is harmed in the other direction, and it is the same shape as the
CUEA D+ floor that reaches certificates and not degrees. C plain is recorded and
the conflict is in the note.

**The batch in one line: Mombasa +4 and a register defect, Kisumu 0, Nakuru +6,
Machakos +1.** Four campuses, eleven records, and the two that produced least
are the two worth reading - one for what a dry campus looks like when it is
genuinely dry, the other for a second source that disagreed in the exclusionary
direction.

**Thika +1 and Meru +3, and the register defect recurs in a second county.**

Thika's history is dated the way Kisii's and Machakos's are - opened 1969 as
Thika School of Community Nursing with Norwegian government support and thirty
students, opened officially by Jomo Kenyatta on 16 November 1969, about 1,000
students beside Thika Level 5 Hospital - and its two listings still intersect on
only **one** unrecorded programme. **And its second listing repeats this
project's own worst data error back at it**: a diploma entry bar given as
"Mean Grade D+" with subject grades beneath. D+ is a cluster-SUBJECT
requirement, and writing it into the mean-grade field is exactly what went wrong
on 44 KMTC certificate records here. Seeing the same mistake in the wild is a
reminder that the aggregators are where it came from.

**Meru is the best-attributed campus of the batch.** Its listing dates each
programme: School of Nursing 1979, School of Medical Engineering 1987, merged
1993, nursing upgraded to KRCHN in 1999, **Clinical Medicine and Surgery from
September 2006, Medical Laboratory Sciences from September 2008**. A second
search names the same programmes and, usefully, **corroborates the C plain
diploma bar independently** - which settles the Machakos conflict one paragraph
up rather than leaving it as one source against another.

**Its third record is a new shape of corroboration and worth naming.** The
Certificate in Medical Engineering Technology rests on two sources describing
the same thing *at different grain*: the campus history records a School of
Medical Engineering established in 1987 to train technicians for hospital
equipment, and the second listing names the award. **A school is not an award**,
so neither alone would have done it - this file has refused a dozen records on
exactly that ground. Together they attribute it, and the note says which source
supplied which half.

**And Mombasa's defect is not unique.** Meru County's searches surfaced KMTC
campuses at **Maua** and **Miathene**, and the county government has announced
one at **Imenti**; the register holds one KMTC Meru. They are recorded as named
leads, not rows, because each needs its own background and programme search -
but the pattern is now twice-seen, and the question to carry into every
remaining campus is *how many KMTC campuses does this county actually have*,
not *what does this campus teach*.

## The largest provider in this catalogue had no denominator at all

Asking that question once, at the national level rather than per county, found
the biggest coverage gap on this page - and it had been invisible for exactly
the reason this file keeps writing down.

**KMTC's own site says 92 campuses across 46 of the 47 counties.** Its
e-learning page still says **71**. A third source says 88 campuses plus 5
satellites, which lands back near 93. **Njia holds 47.**

Against 71 that is a third of the estate absent. Against 92 it is half. Either
figure is a larger gap than every university gap in
`tests/university-coverage.test.js` put together - and that file measured
universities against CUE's denominator while **the provider this catalogue
leans on hardest had no denominator at all.** Every coverage question with a
guard is answered; every one without is drifting, and this is the most
expensive instance of it yet, because KMTC sits in the C-minus to C-plus band
in more counties than any university does.

**The low figure is the one in the guard, deliberately.** 71 against 92 is a
real disagreement between two pages of the same institution, and picking the
high number would let this catalogue look worse than the evidence supports
while picking neither would leave it unmeasured. A floor nobody can argue with
is the honest instrument: `KMTC_CAMPUSES_CLAIMED_LOW = 71`, with the
disagreement written into the comment so the next reader re-reads it rather
than trusting it.

Two guards, both watched to fail and restored:

- **A ratchet plus a named-missing list.** Maua, Miathene and Imenti are in it
  by name, because a gap inside an aggregate is a gap nobody looks at. It also
  fails if the register ever *exceeds* the low denominator - which would mean
  either a duplicate campus (Mombasa and Kapkatet both were) or a stale
  denominator, and both are worth stopping for.
- **A ban on the shape that hid Mombasa.** Not two campuses in one county -
  Mombasa and Meru genuinely have those - but a campus *name* carrying a second
  place name, which reads as one campus with a district attached. Restoring
  "Port Reitz, Mombasa Campus" fails it immediately.

**And the closing instruction matters more than the count.** Do not close this
gap from KMTC's national campus list. A campus earns a row the way every other
institution here does: its own background-and-programmes listing, and at least
one course named by two independently phrased searches. Six campuses worked
this session produced 15 records and one produced zero, which is what that
standard costs - and it is the only reason the 47 rows already here mean
anything.

**The first name came off that list the same hour it went on.** KMTC **Maua**
is listed: a satellite in Maua town, Igembe South, built with the Igembe South
NG-CDF and inspected and approved by the KMTC national board, designed for 200
students across four programmes. Two independently phrased searches name it,
and they agree on exactly **one** programme - Certificate in Health Records and
Information Technology - so that is the one row it gets. 47 campuses to 48, and
`KNOWN_MISSING_KMTC` is down to Miathene and Imenti.

**Two things it did not get, and both are the guards working.**

- **Its other certificates are not recorded**, because the two searches name
  *different* ones: Community Health Assistant in the first, Health Care
  Assistant in the second. Those are different awards, so neither is
  corroborated - and Community Health Assistant is in any case the row this
  file already flags as appearing at 43 of 45 campuses, which is the shape of a
  national list applied blanket.
- **Its student population is not recorded, and the near-miss is the keeper.**
  The first search returned **824 students for Maua** - which is *exactly* the
  figure KMTC **Meru** publishes for itself, read three searches earlier in the
  same session. One campus's number bleeding into another campus's query, the
  same failure that nearly attributed Kiptaragon's courses to Kakrao. Maua was
  approved for 200. **A figure that matches one you read a moment ago for a
  different institution is not corroboration, it is contamination** - and the
  tell is that it matched *too* well.

**And the third campus settled it.** KMTC **Miathene** - Tigania West, built
with the Tigania West NG-CDF, first students 13 March 2023 - came back with
**824 students as well.** Three campuses in one county carrying one figure is
not coincidence and is no longer a suspicion: a source is pasting a county-level
number across every Meru KMTC query. Nothing about size is recorded for any of
them. **Contamination announces itself by repetition; the second instance is
where you should stop trusting the field, not the third.**

Miathene is listed with **two** records, and the reason it earns both is worth
the contrast with Maua: its two sources agree on its *whole* list rather than on
one item of it - the Certificate in Orthopaedic and Trauma Medicine it opened
with in March 2023, and the KRCHN diploma. **A short list two sources can repeat
in full is what a genuinely small, genuinely new campus looks like**, and it is
the opposite signal from a sixteen-family list that matches the national
catalogue. 48 campuses to 49, and `KNOWN_MISSING_KMTC` is down to Imenti alone.

Meru County now carries **three** KMTC campuses where the register held one this
morning. That is the answer to the question this section opened with, and it
suggests the remaining gap is concentrated rather than spread: counties with one
listed campus and an NG-CDF that has built others.

## Told to stop grinding KMTC, and the private register had the sharper defect

The maintainer's correction, and it is this file's own warning quoted back:
*a session left to choose its own work will grind the guarded metric.* Six KMTC
campuses and a new ratchet in one stretch is exactly that, with the ratchet
making it worse rather than better - a fresh metric is the most attractive thing
in the repository to grind.

**The private register had seven names sitting unworked on its own missing
list**, and most of them are faith-based: Africa International University,
Adventist University of Africa, KAG EAST, Presbyterian University of East
Africa, Aga Khan University, The East African University, Islamic University of
Kenya. Two are now listed - **AIU +3, KAG EAST +2**, private universities 25 to
**27 of 32** - and the list is down to five.

Two rulings inside them:

- **AIU's second record is the Meru medical-engineering shape again.** One
  search names development studies as an undergraduate programme AREA, the
  other names the degree. A programme area is not an award; together they
  attribute it, and the note says which source gave which half.
- **KAG EAST's county is contested and is recorded with the conflict stated.**
  Both sources place a precisely addressed campus at Buru Buru in Nairobi - next
  to Mutindwa Market, Mumias South Road - and both also describe a Kitengela site
  in Kajiado, one calling it the current main campus and the other a 58-acre
  property being *developed* into one. Nairobi is recorded because it is the
  campus both sources pin down; Kitengela is a lead for a separate row. That is
  the Lukenya ruling without a charter to settle it, so the note carries the
  disagreement rather than hiding it.

### And the sector register was filing every theology degree under Law

This is the find of the pass, and it was sitting in the data the whole time.

`data/sectors.js` had `theolog` **inside the legal pattern** -
`/law|legal|paralegal|theolog/i` - so **Bachelor of Theology at Kabarak and at
Kenya Highlands both resolved to "Law and governance"**, the sector that carries
a Council of Legal Education caution.

That is *precisely* the error this file already records reverting: widening a
pattern put Arabic with Islamic Studies into law, and it was caught because
someone looked at a new course. **The theology case was identical, already
shipped, and invisible** - because nothing re-checks the mapping of records that
already have a sector. A guard aimed at courses with NO sector cannot see a
course with the WRONG one.

Fixed by narrowing `legal` to `/law|legal|paralegal/i` and widening the
humanities sector - which exists precisely for this - to hold `theolog`,
`biblical`, `intercultural studies`, `church educational`, `christian ministr`
and `divinity`. Legal falls 14 records to 12, theology moves to Languages,
humanities and religious studies, and **no course is left without a sector**,
which is the check that proves the narrowing did not strand anything.

The lesson to carry: **when a course matches no sector you find out immediately,
and when it matches the wrong one you never find out at all.** Every instance
recorded in this file until now was the first kind. Before widening any pattern,
read what it already matches - `theolog` in a law pattern is the kind of thing
that looks deliberate until you ask why.

### And two invented enum values were caught by guards, not by review

`fees_confidence: 'unverified'` and `fee_regime: 'private_university'` are both
plausible English and neither exists: the catalogue's values are
`illustrative`/`verified`, and `private_own_rate`. Five course records and two
institutions carried them. That is the invented-cluster-id failure again -
`thinker`, `organiser`, `builder`, `grower` - in two new fields, and it is the
same lesson: **a value that reads right is the dangerous kind**, and the only
thing that catches it is a guard asserting membership of a known set.

### The private register, closed as far as it honestly closes: 29 of 32

Four of the seven names came off the list by being **listed** - Africa
International University (+3), KAG EAST (+2), the Presbyterian University of
East Africa (+4) and the Islamic University of Kenya (+3). A fifth came off for
a different reason, and that reason is the useful part.

**Adventist University of Africa is postgraduate only.** Two schools, a
Theological Seminary and a School of Postgraduate Studies, and every award in
both is a master's or a doctorate. It can never produce a row in a catalogue
read by people deciding what to do after KCSE - so leaving it on a *missing*
list would overstate the gap permanently, and the aggregate would never close
with nobody able to say why. It now sits in `OUT_OF_SCOPE_PRIVATE` **with its
reason on the same line**, and a guard requires that reason to be there.

**A missing list should only hold gaps that can be closed.** That is the
correction this pass makes to the shape the public list already set: naming a
gap is better than counting it, and naming a *permanent* one as though it were
temporary is worse than either.

**Two names remain and both have named blockers rather than "not done yet".**

- **Aga Khan University** - its Kenyan work is medical and nursing and runs
  heavily at postgraduate level; no reachable source names an undergraduate
  award with an entry requirement.
- **The East African University** - worked, and it yielded **one** corroborated
  programme: Bachelor of Business Information Technology, named by two
  independently phrased searches, with its three schools corroborated too. Its
  other degrees rest on a single listing. **One record would make it the
  single-course stub `MAX_STUBS` forbids**, so it stays a lead - the Alupe
  ruling exactly, and the blocker is corroboration rather than effort.

### The category nobody had looked for: mission-hospital training schools

Pushed further on faith-based provision, the register was searched for the
pattern rather than for a name - and **not one mission-hospital training school
was listed**. Kenya has a well-known set of them, church-run, Nursing Council
accredited, training at exactly the grade band this project exists for, and the
catalogue held none.

**AIC Kijabe College of Health Sciences is the first**, inside Kijabe Mission
Hospital at Lari in Kiambu, run by the Africa Inland Church. One record, and it
carries three things worth more than the count:

- **Its entry bar is MORE OPEN than KMTC's, which is the whole point of listing
  it.** The published requirement is a **C plain** mean grade with a C plain in
  English or Kiswahili and in Biology, and a C- in Mathematics, Physics or
  Chemistry. KMTC asks **C+** for the same award. A learner holding a C plain
  who has been told nursing is closed to them has a route here, and until today
  this catalogue could not show it to them. *A whole category of provision
  missing is an eligibility-floor problem as much as a coverage one.*
- **Its duration is sourced at three and a half years** - 42 months, published
  by the college itself - and it is the **first record in the catalogue to carry
  the longer figure from its own source.** That is the KRCHN question parked
  with the maintainer, arriving from outside KMTC: 36 months is recorded across
  the rest of the estate, this record says 42, and the discrepancy is now
  visible in the data rather than only in a note.
- **Its fee is reported and not written.** Ksh 56,000 per semester, payable in
  instalments. No total, because the number of semesters in a three-and-a-half
  year programme is published nowhere reachable and multiplying by a count I
  picked myself would invent the part that matters. The per-semester figure is
  in the note under the *what Njia found* heading, which is that ruling doing
  exactly the job it was written for.

**And its intake months are deliberately unsourced.** One search says March and
October, the other January and September. Two sources disagreeing about a date
is the one thing this catalogue treats as more perishable than a fee, so the
card keeps its standing confirm-with-the-institution caveat.

**The lesson is about how the gap was found.** Every previous register gap here
was found by checking a *list* - CUE's, KMTC's, a county roll-up. This one was
found by searching the register for a **pattern** (`kijabe|tenwek|chogoria|
mission|catholic|methodist`) and finding it empty. **Ask what KIND of provider
is absent, not only which named one**, because a category with no examples
returns nothing from a list you never thought to consult. Tenwek, PCEA Chogoria,
PCEA Kikuyu, Maua Methodist and the Mater are the obvious next ones and are
recorded here as leads.

**And TEAU produced a duration conflict worth recording.** One source says its
degrees take **two and a half years**, another that most take a minimum of
**four**. Nothing was written, because a duration is a fact about a course and
this catalogue has already refused to guess one at Ebukanga and Kakrao. If TEAU
is ever listed, that conflict has to be settled or the field left null - an
accelerated trimester route and a four-year degree are different products, and
a reader planning around the wrong one loses eighteen months.

## Migori, and the name collision that nearly wrote a course into the wrong county

Eleven E-blind counties, from twelve. **Kakrao Technical and Vocational College**
— public, TVETA `TVETA/PUBLIC/TVC/0031/2017`, Suna East sub-county, opened
January 2019 — was never listed, so Migori read as blind while a government TVC
with 600 trainees sat inside it. The pattern this file has now recorded a dozen
times: *the gap is almost always a missing institution.*

It publishes its artisan bar as **"a KCSE mean grade of D- or below"**, so an E
clears it and E is recorded. Two trade-test courses are named with their licensed
trainee caps — Grade III-I Masonry (20) and Grade III-I Arc Welding (15) — which
is the same TVETA licence shape the Maralal VTC records already use.

**Both carry a null duration and a null fee, and that is the finding rather than
a shortfall.** No duration is published for either award, and this file already
establishes that KNEC and NITA publish no single artisan duration; 12 months is
the catalogue's commonest value, which is exactly what would make a guess
invisible. Without a duration the consolidated Ksh 67,189 rate cannot be scaled,
so the fee goes too — deriving one would rest a figure on a guess. The Ebukanga
precedent applies: a record is not all-or-nothing, a *figure* is sourced or
absent.

**The near-miss is the part worth keeping.** The search that named those two
courses also returned **Kiptaragon TVC** in the same result set, and this file
already warns that Rift Valley National Polytechnic and Rift Valley TTI bleed
into each other's results — *a course attributed to the wrong county is worse
than a missing one*. The trainee-cap phrasing is licence data, but licence data
for whom? It was not written until a second, independent search returned the
TVETA licence number against Kakrao by name **and** described it as running "36
KUCCPS-listed programmes plus NITA trade-test courses", which is what
attributes the trade tests to this college rather than to the one beside it in
the results. **When two institutions share a result set, the course names are
not attributable until something institution-specific ties them down.**

**And the read-back caught the absence phrasing, again.** The notes explained at
length why no fee is shown and used none of the four literal phrases the guard
requires, exactly as the ministry-advert insert did. Caught by parsing the data
back and asserting every property together — never by the insert script's own
report, which said it had written two records and had.

Checked at the reader's end rather than in the data alone: `counties/migori/`
prints "25 courses · 2 open to an E", its blind-county warning is gone, both
rows show "Not published" for duration and fee, and both appear on `/grades/e/`.
The ratchet was broken to 12 and watched to fail, naming Migori.

## The egress question, settled by test rather than assertion

Asked to use every tool to reach the blocked sources, and the answer is now
measured rather than repeated:

- **Playwright Chromium launches fine and reaches nothing.** Every host returns
  `ERR_TUNNEL_CONNECTION_FAILED`, **including `example.com` as a control** - so
  this is not Kenyan hosts being blocked, it is no browser egress at all. The
  first run of this test was also wrong in an instructive way: Chromium does not
  read `HTTPS_PROXY` from the environment, so the proxy has to be passed to
  `chromium.launch({ proxy })`. Configuring it changed nothing, which is what
  makes the negative trustworthy.
- **`curl` through the same proxy: `CONNECT tunnel failed, response 403`** for
  every host, while `registry.npmjs.org` returns 200 - because package
  registries sit in the proxy's `noProxy` list and bypass it entirely. The
  allowlist is package registries and Anthropic APIs; everything else is denied
  at the gateway.
- `curl -sS "$HTTPS_PROXY/__agentproxy/status"` prints that policy and its
  recent denials in plain text. Run it before theorising about the network.
- **PDF readers cannot help**, because no institutional PDF can be obtained. The
  only PDFs on the machine are Njia's own deck and print-test output.

So WebSearch is the single external channel, and it is more capable than the
yield floor suggested - two counties closed on the strength of asking a
different page. What genuinely cannot be reached is a document that only exists
as a PDF on an institution's own host.

## A flat institutional rate is attributable; a per-programme one is not

"The private institutions usually publish their fees. Find them." They do, and
the earlier ruling - that private schedules are unreachable PDFs - was true of
some and lazy about the rest. Searched properly, two shapes appear and they are
not the same fact.

**Kabarak publishes ONE tuition rate across all its undergraduate programmes:**
Ksh 65,000 a semester, plus mandatory administrative charges of
Ksh 29,350-30,850, over two semesters an academic year (its own published
calendar - September and January, fifteen weeks each). A flat institutional rate
**is** attributable to a named course, in exactly the way KMTC's national
schedule is and a per-institution *range* is not. Fifteen records priced, the
administrative band taken at its upper bound because over-quoting leaves a
reader prepared.

**Riara publishes per programme, and says so.** Bachelor of Business
Administration is Ksh 97,300 a semester; the university states that computing,
engineering and hospitality courses attract higher fees. So **one** record is
priced and the other three keep a null fee. Transferring the BBA figure to
Bachelor of Computer Science would be inventing a number the source explicitly
warns against - the placeholder trap arriving through a legitimate-looking door.

The distinction to carry forward: **ask whether the institution prices the
institution or prices the course.** One flat rate closes every record at that
institution; a per-programme schedule closes only the programmes it names.

Sixteen records gained a sourced fee this way. 348 fee-less became 333.

## Private fees: the schedules are reachable and the READINGS are not

The fee gap on the private side has been recorded here twice as the open one,
both times with the implication that it is simply work nobody has done yet.
Seven more institutions were worked in one pass and **every one was refused**,
and the refusals are consistent enough to change what the gap actually is.

| Institution | What came back | Why nothing was written |
|---|---|---|
| Africa Nazarene | 269,250 in one search; 921,600-1,057,700 in the next | Two readings of one structure, and its own FAQ says the fee depends on the programme |
| Umma | "56,000 per trimester" in one search; "Business 49,000, Islamic Sharia 17,500" in the next | Prices per programme - a 3x spread - and the two readings disagree on Business |
| Mount Kenya | "about Ksh 45,550 to 59,550 per semester" for business degrees | A per-CATEGORY range, which is one step further from a named course than the per-institution ranges already refused |
| Baraton | Credit-hour based; fees cut 20-30% and trimesters changed to semesters in 2026 | The Daystar shape, and the structure moved this year |
| Gretsa | **45,300, then 55,000, then 67,000-72,000** across three searches | Three readings of one programme |
| St Paul's | No figure at all | Nothing reachable to read |
| Kiriri Women's | No figure at all | Nothing reachable to read |
| CUEA | "tuition 8,000 + statutory 12,000 = 20,000 per semester" | 160,000 for a four-year degree is not a private-university price; almost certainly a per-unit rate, and the same source says fees vary by programme |
| Kenya Methodist | Per-SCHOOL rates, then ranges of 50,000-68,000 for later years, on 2023/24 data | The Mount Kenya per-category shape, and stale |
| Scott Christian | Ksh 72,700 per semester for degrees, 3,995 per credit hour | Not corroborated, unit words disagree, and a cross-border name collision - see below |
| Tangaza | "Ksh 78,480 to 109,000" for bachelor's degrees, with no unit word | A per-programme range whose source could not say whether it was a semester or a year |
| Kenya Highlands | Ksh 10,000 a semester government-sponsored, Ksh 25,000 self-sponsored, neither attached to a named programme | Two sponsorship regimes and no programme named in either |
| Great Lakes Kisumu | BSc Nursing at 65,000 a trimester, then 67,000 a trimester, then 66,700 a semester | Three readings of one programme, and the unit word moves with them |
| Uzima | No figure at all | Nothing reachable to read |
| Amref | Per-semester 111,700-115,200 and a four-year total of 1,363,100 in one search; 155,700-160,700 a semester and "over 1.8 million" in the next | A 40% disagreement on the total, and the first summary contradicted itself inside one paragraph |
| Lukenya | Tuition "starts at" 38,500 a semester; the next search gave a flat 38,000 across BCom and BEd, and 27,500 school-based | The right SHAPE and the wrong readings - see below |
| Pan Africa Christian | 126,390 a semester twice, then 99,000 + 9,000 statutory on a TRIMESTER calendar | See below: the first two agreed because I seeded the number |

**The finding is the third column, not the first.** This file already says the
private schedules are reachable, and that remains true - Gretsa's own fee PDFs
came back in the result set, on its own domain. What fails is one level in:
**the only channel this build has cannot read a fee table consistently.** Three
searches returned three different numbers for one programme at one university.
That is not a yield floor and it is not an egress block; it is an instrument
that is unreliable on exactly the field where an unreliable reading does the
most damage.

So the honest reframing: **private fees are not unreached, they are unread.**
The remaining route is the institution itself - the Ebukanga registrar case at
university scale - and that is a phone call, not a search. Do not re-run the
seven above; each one's blocker is named.

**And the near-miss in the Gretsa pass is the part to carry forward.** The
first search returned "Computing and Library & Information Science, Ksh 25,000
per semester" and it was about to be written onto the BSc in Computer Science.
It is the **DIPLOMA** in Computer Science - a different named award at the same
institution, in a PDF that sits beside the degree's in every result set. The
degree is priced at roughly twice that. Writing it would have **under-quoted a
fee by more than half**, which is the forbidden direction on money, and it
would have looked entirely plausible on the card.

That is the Ebukanga *Fitting and Turning* ruling arriving at a university:
**course identity is (name, institution), and "Computer Science" is not one
course - it is a diploma and a degree with a 2x price gap.** When a fee comes
back for a subject rather than for an award, check which award it belongs to
before anything else.

**And Scott Christian brought a collision class this file has not recorded: a
CROSS-BORDER one, with numerically adjacent figures.** The first search
returned Ksh 72,700 per semester for its degrees. The second returned **Scott
Christian College, Nagercoil, Tamil Nadu** in the same result set - a different
institution in a different country - whose flagship programme totals **INR
72,000**. Two near-identical names, two currencies, and two figures three
digits apart. Every collision this file already records is domestic, where a
county check is the defence; there is no county check for India.

The Kenyan institution also failed the unit test in the same breath: the second
search describes it as running **trimesters** while the first quoted figures
**per semester** and "18 credit hours per semester". That is the Gretsa
mismatch again, so nothing was written on either ground.

**And the arithmetic that looked like corroboration was mine, not the
source's.** 18 credit hours x Ksh 3,995 = 71,910, which sits close to the
72,700 quoted and reads as two figures agreeing. It is one figure and a
multiplication I performed. A sum you computed yourself is not a second
source, however neatly it lands.

**Two things this pass did NOT do, deliberately.** It did not take Gretsa's
55,000 x 8 semesters: the same sentence called those terms both "semesters"
and "trimesters", and a total resting on two mismatched unit words is the
Bungoma self-contradiction in arithmetic form. And it did not extend the
**tier benchmark** to private degrees. That exclusion's stated reason is the
SCFM, which is a PUBLIC university mechanism and does not apply here - so the
reason is wrong for this case even though the outcome is right. The 20-sibling
floor is what correctly blocks it: there are 17 priced private degree records
and **15 are Kabarak**, so the median would be Kabarak's own number wearing the
authority of a computed benchmark, shown to a reader looking at Tangaza.

Measured at the start of the pass, and unchanged by it: **22 of 184 private
records carry a fee, 15 of them Kabarak, and 3 of 25 private universities have
any priced course at all.**

**The register of attempts is now closed, and that is the result.** The table
holds seventeen institutions; this file separately records refusals for
**Daystar** (two searches disagreed on one document), **USIU** (per-unit
bands), **Management University of Africa** ("approximately" and "estimated"),
**Zetech** (a table covering five of eight semesters) and **KCA**
(Ksh 28,400-55,867 per trimester, a range). That is **twenty-two private
universities attempted and twenty-two refused**, which is every private
university in this catalogue bar the three already priced. Do not re-run any
of them expecting a different answer; each blocker is a property of what the
institution publishes or of how it reads back, not of how hard the search
tried.

Twenty-two for twenty-two is a stronger statement than the seven that opened
this section. Seven refusals could still be a run of bad luck. Twenty-two is
the instrument, and it says the same thing every time: **the schedules are
reachable and the readings are not.** The route left is the institution
itself.

**Two of the last seven are worth more than their refusal.**

- **Lukenya had the right shape and failed on the reading.** One flat tuition
  figure across Bachelor of Commerce and Bachelor of Education is the Kabarak
  case exactly - an institution pricing the INSTITUTION - and it would have
  closed all six Lukenya records at once. It failed on nothing structural:
  38,500 in one search against 38,000 in the next, with the first summary
  saying "starts at" in the same breath. A floor is not a price, and quoting
  one as a price under-quotes, which is the forbidden direction on money.
  **The Kabarak shape is not rare; reading it to the shilling twice is.**
- **Pan Africa Christian is a new trap, and I walked into it.** The first
  search returned a flat undergraduate rate of Ksh 126,390 a semester. The
  second returned the same figure - **because I put the figure in the query.**
  A search seeded with the number you are hoping to confirm will find the
  page you got it from and report agreement, and that is not two sources, it
  is one source asked twice. The third search, phrased without it, returned
  **Ksh 99,000 plus 9,000 statutory** and described the calendar as
  **trimesters** rather than semesters - so the figure and the unit word both
  moved the moment the question stopped leading.

That belongs beside the rule it resembles: *a sum you computed yourself is not
a second source*. This is the same error with the arithmetic taken out.
**Corroboration has to be able to disagree with you.** Phrase the second
search from the programme and the institution, never from the figure, and if
a number appears in your own query it cannot come back as evidence.

## Refusing to WRITE a figure is not a licence to DISCARD what you found

The maintainer's standing correction, and this is the third time it has had to
be made: **any useful information beats none.** The first two instances were
about withholding a whole record (Ebukanga's missing duration) and withholding a
whole institution (the University of Nairobi's competitive programmes). This is
the third and the least obvious, because the rule being over-applied is the
strongest rule in the file.

Twenty-two private universities were worked for fees and all twenty-two refused,
correctly, on the rules above. Then the research was **thrown away**. Every one
of those refusals had produced real figures - Gretsa's 45,300, 55,000 and
67,000-72,000; Daystar's per-credit-hour rate against a published 129-credit
graduation requirement; Amref's two irreconcilable totals - and all of it went
into *this file*, an internal document no learner will ever open. What the
reader got on the card was:

> *"The university publishes no fee for this programme in any source reachable
> from this build, so it could not be verified."*

Read plainly by someone deciding where to apply, that says **there is nothing to
know**. It is the most discouraging possible rendering of "we found four numbers
and could not tell you which one is right", and it is the *opposite* error from
the placeholder trap while wearing the same clothes.

**The distinction that was missing, and it is a clean one:**

- **WRITING a figure** into `total_fees_kes` is a claim by Njia that this is
  what the course costs. Every rule above still stands, unchanged and
  unsoftened. Two searches must agree, the unit words must match, the award must
  be the right one, a floor is not a price, a range is not a quote.
- **REPORTING what was found** is a different speech act: it is Njia saying what
  its research turned up and why it would not stand behind it. That is not a
  fee, it cannot be mistaken for one, and it is strictly more use to a reader
  than silence.

So 92 records now carry a **`WHAT NJIA FOUND, AND COULD NOT RECONCILE:`**
paragraph naming the actual figures, the actual disagreement, and the reason
nothing was recorded. `total_fees_kes` stays null on every one, the required
absence phrase stays, `fee_basis` does not move and the five-way partition still
sums to `COURSES.length` - verified on the parsed data, not asserted here.

**That is the same architecture the tier benchmark already uses** - *shown but
never written* - and it should have been reached for the moment the refusals
started stacking up. A median of sourced siblings is displayed beside an absence
without entering the catalogue; a reported band is displayed on exactly the same
terms. The precedent existed and was not applied because the refusal felt like
the end of the work rather than the middle of it.

**The test to apply from here, to any refusal.** When you decline to write a
figure, ask what the reader ends up holding. If the honest answer is "less than
I know", you have not finished - you have stopped. The three questions:

1. **Is the number unsafe, or is the CLAIM unsafe?** Gretsa's figures are real
   quotes from real sources; what is unsafe is asserting one of them as the
   price. Report them and the assertion problem disappears.
2. **Would a reader act differently knowing it?** A learner choosing between a
   public university at SCFM band rates and a private one is deciding on order
   of magnitude. "Somewhere between 45,000 and 72,000 a semester, confirm it" is
   decision-changing. "Not published" is not.
3. **Does the reader have a route you do not?** They can ring the registrar; this
   build cannot. Anything that makes that phone call sharper - which award to
   ask about, which figure to challenge, what the range looks like - is worth
   giving them even when it is not worth recording.

**What this does NOT license, and the boundary matters more than the permission.**
A reported band may never migrate into the fee field, never set `fee_observed`,
never be averaged, never be multiplied out into a total, and never be written for
an institution where nothing was actually found - St Paul's, Kiriri Women's and
Uzima returned no figure at all and their records say exactly that, with no
invented bracket. **A paragraph reporting research is only honest while it is
reporting research that happened.** The moment it starts describing a plausible
range rather than a found one, it is the placeholder trap with a better
vocabulary, and it will be harder to catch than the original because it reads
like diligence.

## The second mission-hospital school, and a college that publishes its own size

Tenwek Hospital College of Health Sciences, in Bomet, has trained nurses inside
Tenwek Mission Hospital since June 1987 under the Africa Gospel Church and World
Gospel Mission. It is the second record in the category AIC Kijabe opened, and
it was found the same way: by searching the *pattern* - a mission hospital that
trains - rather than a name already on a register.

**Its student population is the cheapest available test of its course list, and
it passed.** The college publishes 130 to 150 students at any one time. Two
independently phrased searches named the same two entry-level diplomas and
nothing else, which is what a college that size should look like. This file
already uses population against KMTC Iten - *a campus of 226 does not run
eighteen programmes* - and here the check confirms a short list rather than
refuting a long one, which is the other half of the same instrument.

**Entry is C plain, below KMTC's C+ for the same awards**, with a C plain in
English or Kiswahili, a C plain in Biology and a C- in one other science, plus
an entrance examination in English and Mathematics and an interview. The
Strathmore treatment applies: the published bar is recorded and the selectivity
goes in the note, because a grade alone does not secure a place and a reader
should know that before spending an application on it.

**No fee was found at all, and that is stated as a found absence rather than as
a refusal.** The reporting paragraph this file introduced exists to publish what
research turned up; here research turned up nothing, so the note says so
explicitly and names the college's own phone number as the route. Writing a
plausible bracket there would be the placeholder trap wearing the vocabulary of
diligence, which is the boundary that section already draws.

**And the third school in the category split the duration question open.** Clive
Irvine College of Health Sciences, inside PCEA Chogoria Hospital in
Tharaka-Nithi, has trained nurses since 1951 - the oldest mission-hospital
school here - and publishes its KRCHN at **three years**, which is the 36 months
this catalogue already records across the estate. Kijabe and Tenwek publish
three and a half. Three sources now say 36 and two say 42, for the same named
award. **That is not a discrepancy to average or to resolve by majority**: each
record carries what its own institution publishes about its own programme, and
the split is stated on the cards rather than smoothed away. A national figure
would be exactly the kind of institution fact nothing sourced supports.

**Its entry bar is C plain and it survived the seeding test.** The first query
that returned it had the words *C plain*, *biology* and *english* in it, and the
summariser duly reported that the results "confirm" them - the Pan Africa
Christian trap firing again, in the eligibility field this time rather than the
fee field. A second query naming no grade at all returned the same C plain mean
with a C- in one science, and that is what the record rests on. **A grade
recovered from a seeded query is worth no more than a fee recovered from one.**

**And its only published money figure is a meals charge.** Ksh 15,500 a semester
for day-scholar meals is the sole number any reachable source carries, and
writing it into the fee field would understate the course by an order of
magnitude - the forbidden direction on money, arriving through a figure that is
genuinely published and simply not the thing being asked about. It is reported
in the note with what it actually buys, and the reader is told to ask for
tuition separately.

**A fourth school, and a month recorded alone because the sources split on the
second one.** Methodist College of Health Sciences sits inside Maua Methodist
Hospital in Igembe South, Meru - a 230-bed referral hospital serving about
600,000 people, training there since 1942. Its KRCHN entry bar is C plain with a
C plain in English and Kiswahili and a C- in one science, unseeded, and its
duration is three years, which makes it the fourth source on the 36 side of the
36-versus-42 split.

Its nursing intakes run twice a year and every source agrees one of them is
April. One says the other is October and two say September, so **only April is
recorded.** That is the placement-clock rule applied at record level: a stale
fee surprises a reader and a wrong month sends them to a door a year late, which
is the exclusionary direction this project under-claims in.

**And four named courses are left out on a field, not on a doubt.** The college's
own listing names medical records and information technology, clinical
counselling psychology, community health development and social work, and
community health and HIV management as current, and medical laboratory sciences
as planned. The planned one is excluded as planned ones always are. The other
four are excluded because **no reachable source says whether each is a
certificate or a diploma**, and level decides the entry bar, the duration and
which grade page the card appears on. Naming the missing field is what makes
this a closable lead rather than a dry county - the Alupe ruling, at a college.

**A fifth school, and the first in this category listed on award-level facts
alone.** PCEA Kikuyu Hospital School of Nursing trains inside a hospital founded
in 1908, is NCK-accredited and TVETA-registered, and publishes **no mean grade
and no programme length at all** - three searches, one of them naming no grade,
returned what documents to attach and a Ksh 1,000 application fee and nothing
else. What is published is the national requirement for the award: C plain with
a C in English or Kiswahili, a C in Biology and a C- in one science, over three
years.

So the record rests on the **Ebukanga KNEC precedent** - a qualification-level
fact about a named award is a legitimate source where the institution publishes
none - and the note says so on the card in those terms, because a reader should
know which half of what they are reading the school itself stands behind. The
three other mission colleges here all publish C plain for the same award, which
is corroboration of the award bar rather than of this school's.

**Its only published figure is an application fee**, and that is the Chogoria
meals charge in a new costume: a real number, genuinely published, and not the
thing the fee field asks about. Ksh 1,000 to apply is not what it costs to
train.

**The sixth school closes the recorded leads, and it is the one that is NOT more
open than KMTC.** Catherine McAuley Nursing School, inside The Mater
Misericordiae Hospital in South B, Nairobi, run by the Sisters of Mercy since
1972, publishes **C+ with a C+ in English, Biology and Chemistry** - the same
bar KMTC asks - and admits a maximum of 20 trainees. Every other school in this
category was listed partly because its bar is lower than KMTC's, and the note
says outright that this one's is not. **A category is not a thesis**: if five
records support a pattern and the sixth does not, the sixth is recorded as it
is, not omitted for spoiling it.

Its fee is the clearest case yet for the reporting paragraph: Ksh 60,000 to
100,000 a semester is a 67 per cent spread with no published semester count
behind it, so nothing is written - and a reader ringing the school now knows the
order of magnitude and knows to ask whether that range is per programme or per
year, which is the question the range itself raises.

**All five mission-hospital leads recorded in this file are now worked**: Tenwek,
Chogoria, Maua, PCEA Kikuyu and the Mater, alongside AIC Kijabe which opened the
category. Six schools, eight records, **not one of them carrying a fee** - which
is the honest summary of the category and the reason the note on every card
names the phone call as the route.

**And the payload guard caught this category, correctly.** The first version of
these six notes ran 2,100 to 2,700 characters each against a catalogue mean of
about 950, and `data/courses.js` crossed the bytes-per-course budget at 125.4
against 125. That guard exists for exactly this - *adding courses is the project;
each record getting fatter is not* - and the temptation was to raise the ceiling
by a rounding error, which this file separately calls headroom for the next
regression to hide in.

The notes were cut instead, by roughly a third, and the cut improved them: what
went was the discursive explanation of *why* a rule was applied, which belongs
here rather than on a card a learner reads on a phone. What stayed was every
fact - the bar, the basis it rests on, the reported figures, the excluded
programmes and the missing fields. **A provenance note is not the place to
argue the provenance rules**, and a byte budget is a reasonable thing to be
reminded of that by.

**One record carries a null duration on purpose.** The KRCHN is published at
three and a half years and is recorded at 42 months - the second record in the
catalogue to carry the longer figure from its own source, after Kijabe, and the
estate-wide 36 months is still flagged rather than settled. The Diploma in
Clinical Medicine and Surgery publishes a September intake and **no length**.
This catalogue records 36 months for that award elsewhere because those
institutions publish it; transferring the figure here would assert an
institution fact nothing sourced supports, which is the Ebukanga *Fitting and
Turning* ruling in the duration field rather than the fee field.

## Fees are the most important thing after the course itself

The maintainer's instruction, and it reorders the priority list written one
section above: **fees come before depth.** With it came the number that makes
the case - **14 of 1,027 courses carried a fee the institution itself publishes
for that course**, plus 294 worked out by applying a published rate - and the
instruction to *provide verifiable guidelines rather than no information at
all.*

**The 14 cannot move from here, and saying why is not an excuse.** `fee_observed`
means someone read that total off the institution's own schedule for that
course. This build cannot open a schedule: every host is egress-blocked and
WebSearch returns a summary of a page, not the page. That is exactly why the
Strathmore LLB total is priced and NOT observed. So the honest position is that
the observed tier is capped by the environment, and the tiers that can move are
the sourced ones - which went 421 records with a figure, and the KEWI diplomas
are what moving one looks like.

**KEWI is the shape to look for.** The Kenya Water Institute publishes a Diploma
Fee Structure on its own domain: Year 1 Ksh 80,300, Years 2 and 3 about
Ksh 70,600, **grand total Ksh 221,500**, corroborated by three independently
phrased searches, the last naming no figure at all. The record here said the
institute *publishes no fee structure that could be confirmed* - which had
become false. **A note asserting an absence is a claim, and it goes stale like
any other**; re-read the ones that say a source does not exist.

**And the fee correction dragged a duration correction with it.** The record said
24 months; KEWI publishes a three-year KNQF Level 6 diploma, and the fee
structure is itself broken into Year 1, Year 2 and Year 3 - the length
corroborated from a second and independent angle. Applying a three-year total to
a two-year record would have been right in the fee field and wrong on the card.
**When a published total arrives in years, check the years.**

### What a fee-less card can say without inventing anything

740 records carry no figure and the card said so and stopped. Read by someone
deciding where to apply, "not shown" is indistinguishable from *there is nothing
to know* - and for **459 public-university degrees that is plainly false**: the
SCFM band shares are published, they are percentages of the course cost, and a
reader who knows their band can work out their own number.

`feeGuidance()` in `js/decide.js` now names the **published instrument that
governs the price**, per fee regime:

- **Public university** - the band shares, household nothing in Band 2 up to
  about 40% in Band 5, and the point that follows from them: a cheaper
  programme costs you less in shillings at the same band.
- **Private** - you can take the HELB loan but NOT the government scholarship,
  so the same band leaves far more with your household.
- **Consolidated public TVET** - the Ksh 67,189 published annual fee, and the
  capitation reading that says you are not asked for all of it.
- **Everything else** - the three questions that turn a quoted rate into a
  price: which award, what period, how many of them.

**It is the tier-benchmark architecture applied to a METHOD rather than to a
median** - shown at render time, never written. `total_fees_kes` stays null, the
fee basis does not move, the five-way partition is untouched, and
`tests/provenance.test.js` asserts all of that plus one more thing: the
percentages are **read from `SCFM_HOUSEHOLD_SHARE` in `data/funding.js`**, which
carries its own source line, rather than typed into the renderer. A guard bans a
hardcoded band percentage in `js/decide.js` outright, because a number typed
there cannot be traced to anything.

**And the byte guard paid for the whole change.** It failed on the Maseno batch,
and measuring rather than trimming found the real load: **the same SCFM
explainer, 647 characters, repeated across 442 records - 286,000 characters of
one national instrument stored 442 times.** With the card rendering that
instrument from one sourced constant, the prose no longer had to be in the
notes at all. Stripping it took the mean note from 992 to 956 characters and put
the budget back inside its ceiling.

**The strip was done per record and not by regex**, because two checks said a
sweep was unsafe: 362 of the 442 used older wordings, and **80 carried the
required absence phrase INSIDE the block that was about to be removed**. Every
record was re-parsed afterwards and every one still declares which kind of
absence it is. That is the read-back rule doing the job it exists for, on the
largest single edit this catalogue has had.

Verified at the reader's end rather than in the source: the Decide route drawn
in a real browser shows **14 of its first 25 cards carrying guidance**, and the
functional probe is 49/49.

### And the guidance shipped a defect of exactly the kind it was fixing

The first `feeGuidance()` keyed on `fee_regime` alone, so a **county vocational
training centre** was told the consolidated public-TVET fee of Ksh 67,189 a year
governs its artisan course. It does not: that rate is for a college a learner is
PLACED into by KUCCPS, while a county VTC sets its own far lower county-funded
charge. The card would have overstated the cost many times over **to the readers
with the least room** - the exclusionary direction, arriving through the fee
field this time.

Caught by rendering a Maralal card rather than by the suite, which was green.

**And narrowing the test surfaced an older bug underneath it.** The card's own
inline predicate matched the word `vocational`, so **"Ebukanga Technical and
Vocational College" and "Kakrao Technical and Vocational College" were being
given village-polytechnic advice** - ring the centre, mind the NITA trade test -
when between them they run 36 KUCCPS-listed programmes on the consolidated rate.
Match the institution KIND, not a word that appears in both names. The predicate
is now one shared `isVocationalCentre()` rather than two copies, because two
copies of a test are two things free to disagree.

**The break-test on it was inconclusive and is recorded as such.** Breaking
either half alone changes nothing, because each half independently catches the
case; only breaking both reproduces the original bug. That is worth knowing
about the guard rather than claiming a clean red-green.

### Four more, and the inverted absence phrase for the fourth time

Kisii +10, Machakos +8, Riara +5, Taita Taveta +5, thin tail 19 to **15**.
Taita Taveta is worth naming: it is **Kenya's mining university**, a declared
Centre of Excellence with a School of Mines and Engineering, and its Mining
Engineering and Mineral Processing degrees have no equivalent anywhere else in
this catalogue.

**And the Riara notes said "No figure for this programme could be verified".**
That is the required phrase inverted by one word, reading exactly as though it
meant the opposite, on five records - the same failure recorded here for
Lukenya and for the ministry advert. It is the fourth instance. The read-back
caught it, as it has every time, which is the argument for running it on every
insert rather than on the ones that feel risky.

**The sector register needed `mineral processing` and `metallurg`** - thirteenth
instance, and the pattern is now so reliable that the right move is to check the
guard output before the guard has to tell you.

### The thin tail is closed: no university carries fewer than five records

It was **28** when the audit that prompted this work was run, with three
universities carrying no degree at all. It is **zero**. The ratchet in
`tests/university-coverage.test.js` now holds at 0, underneath the single-course
stub cap that already held there.

**The last two closed the same way, and it is the ruling this file keeps
re-learning.** Bomet was recorded as carrying two programmes because its own
listing "is the last thing to be indexed"; Alupe sat as a named lead for
several passes because a general query returned school names and no programme
names. Both publish their programmes on their **school** sites - `sbe.buc.ac.ke`
and `soe.buc.ac.ke`, `ss.auc.ac.ke` - so both closed in one search each.
**Search the institution's own domain, and when the institution is large, its
school's.** That is the fourth time, and the corollary holds every time: *a lead
that names the missing field gets closed; a lead that says nothing found gets
re-run from scratch.*

Worth naming from the tail rather than the count: **Taita Taveta's mining
degrees**, **PUEA's occupational therapy**, **Umma's Islamic banking and
finance**, **AIU's translation and linguistics**, **Alupe's parasitology**, and
the **D+ certificates at Scott Christian and KAG East** - a chartered university
made reachable to a reader most degree provision is closed to. A thin tail is
not a uniform thing; it was hiding the least duplicated provision in the
catalogue.

### A note that says "this institution publishes nothing" is a claim with a shelf life

Two records this pass said exactly that and both had become false. **KEWI** does
publish a Diploma Fee Structure - Ksh 221,500 over three years, now recorded.
**The Railway Training Institute** publishes a term-based one: a Level 6 diploma
at nine terms, a Level 5 certificate at six, corroborated by two independently
phrased searches, with hostel at Ksh 19,500 a term.

Neither institution changed. **The catalogue's account of them had gone stale
and nothing re-reads an absence**, because a guard can check that a missing fee
says WHICH KIND of absence it is and cannot check whether that is still true.
Re-read the notes that assert a source does not exist; they are the only claims
here with no expiry and no guard.

**RTI is not priced even so, and the reason is instructive.** Its per-term
figures come with the source giving the diploma Term 1 as Ksh 38,600 - the
figure it separately gives for a HIGHER diploma - so it contradicts itself
inside one paragraph, and a Term 1 charge usually carries one-off costs, so
multiplying by nine would overstate the course. The structure is reported and
no total is written.

**And its duration was deleted rather than converted.** The record said 24
months; RTI publishes a term COUNT, and turning nine terms into months needs
the number of terms in its academic year, which is not published anywhere
reachable. Three terms a year is the common pattern and "common pattern" is not
a citation - it is exactly the reasoning that put twelve months on every artisan
record. The field is null and the note says nine terms.

### Morendat is priced, and a standing instruction stopped being stored 226 times

**MIOG publishes an annual tuition of Ksh 71,700**, corroborated by two
independently phrased searches along with the five programmes it placed on the
KUCCPS portal and their entry bars - C- for the three-year diplomas, D plain for
the two-year certificate. An annual institution-wide rate scales to a named
award the way a per-institution RANGE never can, so those five are listed and
priced: Ksh 215,100 for a diploma, Ksh 143,400 for the certificate.

**The institute's own pipeline-technician awards are NOT priced from it**, and
that restraint is the point: both sources attach the rate to the KUCCPS-placed
programmes, the older records' entry bars do not match the published ones, and
assuming they are the same product is how a figure ends up on the wrong award.
The rate is reported on those cards with the question to ask.

**And the byte guard found another standing instruction stored per record.**
*Confirm the programme code and the current cluster cut-off on the KUCCPS
portal* was written into **226 notes in six slightly different wordings** - which
is how one instruction becomes six claims free to drift. It is a property of the
placement system rather than of any course, so it now renders once on every
university degree card, including the several hundred that never carried it.
Mean note 967 to 946.

That is the second time in two days that the byte guard has pointed at a
**category error rather than at bloat**: a fact about the national system was
being stored as if it were a fact about a course. Ask that question whenever it
fires on a sentence that appears in more than a handful of notes.

### The third and fourth copies of the same national facts

Stripping the SCFM explainer from 442 notes earlier caught the wordings that
existed then. Measured again, **two more variants had survived by phrasing** -
one at 388 characters across 131 records, another KUCCPS confirmation sentence
across 89 - because the sweep matched text rather than meaning. Both are now
the single canonical sentence or rendered on the card.

**Mean note 992 to 913 across the day, with no fact removed from any record.**
Everything cut was a statement about the national system - how the SCFM works,
where to check a cut-off - stored as though it were a fact about a course.

The rule worth keeping: **when the byte guard fires, look for a sentence that
appears in dozens of notes before looking for a note that is too long.** Four
times out of five this week the answer was a category error rather than
verbosity, and each fix improved the copy as well as the bytes.

**Kenya School of Agriculture** was corrected in the same pass and is not a byte
story: its diploma ran at 24 months here against the school's own published
three years, and its craft certificate at 12 months against nothing at all -
that field is now empty with the module count stated instead. Its campus list
also disagrees with the school's own, which names Wambugu, Thika, Nakuru,
Ainabkoi and Ugenya where this catalogue holds Wambugu, Ugenya, Ainabkoi and
Pap Konam. Thika and Nakuru are absent here and Pap Konam is not on the current
list; the notes say so rather than the register quietly disagreeing with its
source.

### The accessibility sweep caught the fee guidance, and it is a repeat

The two links the guidance added - *how the bands work* and the *KUCCPS portal* -
sit mid-paragraph on a course card, and axe flagged **link-in-text-block four
times** the moment they shipped. This file already records that exact failure
from the landing page's sources paragraph, with the fix written down: **in
running prose the underline IS the affordance, not decoration.**

Two things worth keeping. The unit suite was green through it and the browser
sweep was not - which is this file's oldest lesson arriving again. And the
selector is written against `.course-card p a` rather than against the two
paragraphs that happen to carry links today, because **the property belongs to
prose containing a link, not to a component**: writing it narrowly is what
guarantees the third instance.

Sweep back to **72 states, 0 violations**; probe 49/49.

## An indicative tier benchmark, shown but never written

For the records still without a fee, "nothing" is a poor answer to a learner who
needs an order of magnitude. So the Decide card now shows the **median of the
sourced siblings at the same ownership and level** beside the absence, labelled
as a typical figure rather than as this course's price. 133 records gain one.

The whole safety of it is that **it is never written into the catalogue**:
`total_fees_kes` stays null, the record keeps its `unpublished` basis, and the
five-way partition is untouched. Writing the benchmark in would turn a national
median into a confident per-course price - the placeholder trap with better
manners - so `tests/provenance.test.js` guards the absence.

**Two defects in the first version, both found by reading the diff rather than
by a failing test.** The card opened every benchmark with "This institution
publishes no fee for this course" — false for 26 of the 133, whose own notes say
the fee *could not be verified*, a different claim: the schedule exists and Njia
could not read it. The card was overriding the record with the more flattering
absence, which is exactly what the absence rule exists to stop. It now derives
the sentence from the note, and a guard bans the hardcoded one. And the first
implementation filtered all 686 courses with an `INSTITUTIONS.find` inside the
predicate **per card** — about 116,000 operations for every card drawn, on the
cheap Android phones this project designs for. The medians are identical between
cards, so they are computed once: 200 full passes now take 20ms.

Two exclusions, both deliberate. **Degrees never get one**, because the SCFM
means a student's cost is set by an assessed band and a median would be wrong
for almost every reader. **A thin base never gets one**: the floor is 20 sourced
siblings, which excludes every private tier.

It is called a *tier* benchmark rather than the obvious word because a guard
forbids that word appearing in `js/decide.js` at all - Decide must never gate
the catalogue on an unsourced CBE mapping, and keeping the vocabulary out is the
cheapest way to keep that true. The guard caught the naming immediately.

## The SCFM is a method, and a method can be explained

Refusing to quote a per-programme price for a public university is right. Saying
nothing about what a student will actually pay is not - it is the pedantry the
maintainer named, and it left 110 records ending at "there is no single number".

The **method is published**, so `/help/` now carries it: a Means Testing
Instrument run by HELB weighs household income, family size, school type,
marginalisation and disability, and places a student in one of five bands, each
fixing the split between government scholarship, HELB loan and household:

- **Band 1** (vulnerable) - 70% scholarship + 25% loan, household **5%**
- **Band 2** (extremely needy) - 70% + 30% loan, household **nothing**
- **Band 3** (needy, reported to ~Ksh 70,000 a month) - 50% + 30%, household
  **20%**, upkeep loan Ksh 50,000
- **Band 4** (less needy, reported to ~Ksh 120,000) - 40% + 30%, household
  **30%**, upkeep loan Ksh 45,000
- **Band 5** - 30% + 30%, household **40%**

The usable insight for a reader is that the shares are **percentages of the
course cost**, so a cheaper programme lowers the shilling amount even when the
band does not move - and two students in the same lecture hall can owe very
different sums, by design rather than by error. What Njia will not say is which
band anyone lands in: that instrument weighs household circumstances this
project does not hold and should not hold.

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

The finding it carries: **11 counties list nothing an E-grade leaver can enter,
and all 11 list no artisan course at all.** It was 23 and 21 when this page
shipped; the page is generated, so it is correct by construction and this
paragraph is the copy that goes stale. The blindness is one missing
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

## A push that prints success is not evidence the commit moved

Work committed while `HEAD` was on `main`, then pushed with
`git push -u origin <branch>`. That pushes the **local ref of that name**, not
the current commit — and the branch was still at its old tip, so the pull
request compared identical content and squash-merged an **empty diff**. Eight
course records and two institutions never reached production, while `main`,
the deploy and a status report all said they had.

The failure survived every check that looked plausible: the suite was green,
the generators were clean, the merge succeeded, and the deploy reported
`state: ready` with a `commit_ref` that genuinely existed. None of those
inspect *what the remote branch actually contains*.

**The signal was there and was misread.** The PR's own first Netlify comment
names the commit it is building: `Latest commit | c88dedf` — the stale tip, not
the work. A deploy-preview comment naming a commit you do not recognise is the
cheapest possible tell that the push went somewhere other than you think.

Two things to do instead, both cheap:

- **Check the remote ref, not the push output.** `git show
  origin/<branch>:data/courses.js | grep -c "^  { id: 'c"` before opening the
  PR. One line, and it compares content rather than trusting a success message.
- **Confirm the PR has a non-empty diff before merging.** `get_files` returning
  22 files and +561/-151 is the confirmation; a merge that squashes nothing
  still reports success.

And do not reach for a piece of evidence that flatters the story. The first
account of this blamed Netlify's *"All files already uploaded by a previous
deploy with the same commits"* — a routine file-hash cache note that appears on
the correct deploy too, and never indicated anything. Inventing the signal you
wish you had missed is the same error as inventing a figure.

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

- **`/open-data/`** publishes all 1257 courses as CSV and JSON. The column that
  justifies it is `fee_basis` — anyone can list Kenyan courses and fees; almost
  nobody says which of their numbers they can stand behind. It is **computed by
  reading `feeBasis()` out of `js/decide.js`** at build time, not reimplemented,
  because an export that classified fees by its own copy of the rule could
  disagree with the app while both looked right alone. RFC 4180 quoting is not
  optional: **every one** of the 1257 notes contains a comma or a quote and the
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

## A midpoint of a range is not a fee

Seventeen records displayed a figure their own note described as "the middle of
the published range" — EASA at Ksh 171,000 against a published band of
115,950–226,700, Kenya Airways Pride Centre at Ksh 235,000 against
170,000–300,000. **Neither number appears in any source.** They are arithmetic
performed on a range that was never per-course to begin with.

Two things made it worse than an ordinary estimate:

- **The figure did not move with duration.** Ksh 171,000 rendered identically on
  a 36-month diploma and an 18-month one; Ksh 235,000 on a 12-month diploma and
  a 6-month certificate. One number pasted across unrelated courses is the
  placeholder pattern, and the existing guard could not see it because that one
  checks for a value repeating across institutions of *differing ownership*.
- **The note did not describe its own records.** It claimed "the middle of the
  published diploma range" while the certificates showed the bottom of the IATA
  range instead.

This had already been ruled on twice. Eleven records lost their figures because
a per-institution range "cannot be attributed to a named course", and c026 lost
Ksh 560,000 because a note calling it a "four-year mid-range estimate" does not
survive into the card. The rule did not need re-deciding, only applying: **if
the number is not the thing you can defend, remove the number.** All seventeen
now carry a null fee saying the institution publishes no per-course figure.

The guard checks the *pairing*, not the vocabulary — a record with no fee may
narrate midpoints freely, because there is no figure left to mislead anyone.
That matters, because the honest notes now explain exactly what was removed.

**And a shared note is a shared defect.** These sat behind `PARASTATAL_NOTES.easa`,
one const serving thirteen records, so a `grep -c` for the offending sentence
returns 1 while thirteen cards render it. An assertion written against the
record count failed and stopped the write — correctly, and for the wrong reason.
Count what the reader sees, not what the file says.

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
- **Verify the channel, do not just pick one.** The address above was published
  with the issue tracker underneath it as a fallback, which still leaves the
  *primary* route a dead end for whoever tries it first. A raw DNS query settled
  it: `njiacareerpathways.work` returns NOERROR with **zero MX answers** from
  8.8.8.8, 1.1.1.1, 9.9.9.9 and 8.8.4.4, against a control that resolves
  google.com's MX fine. The domain has no mail exchanger, so anything sent there
  bounces. That is a verified negative, not an unknown, and publishing the
  address anyway recreates the silent dead end. It is now gated behind
  `DOMAIN_MAIL_LIVE` in `tools/build-static-pages.mjs` — configure an MX record,
  flip the flag, regenerate, and the address appears on the page and in
  `llms.txt` at once. There is no dig, host or nslookup in this environment; the
  query was 30 lines of `socket` and `struct`, and it is worth writing again.
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

**All three event types fail identically.** push, pull_request and
workflow_dispatch alike: run created, dead in about four seconds, `runner_id: 0`,
empty `runner_name`, no log, and `get_check_run` returns empty `title`, `summary`
and `text` because nothing ever wrote any. That rules out an event-scoped
restriction and leaves runner availability, which is a repository setting the
build proxy blocks on purpose.

**So the guards moved to infrastructure that works.** Netlify builds run on every
push and every deploy preview, so `netlify.toml` now runs the suite in
`[context.deploy-preview]`. That is the half of CI that changes a decision: a
pull request whose preview fails is one you do not merge.

Production stays an `echo`, deliberately. A guard going red must never be the
reason a learner cannot reach the site, and `tests/provenance.test.js` already
required the build command to be a no-op after a production deploy failed on an
npm ECONNRESET in August 2026. **That guard was right and I nearly overrode it** —
the first attempt put the suite on the production command, which the
`CI=true` simulation caught immediately. The guard now permits a preview command
and asserts it stays dependency-free, because the original incident was an
*install* failing, not a test.

The lesson is the one this file already states about the CI workflow: **simulate
the runner before pushing.** `CI=1` and `CI=true` are not the same environment —
Netlify sets the latter, and the difference is what surfaced the conflict.

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
node --test tests/*.test.js       # zero-dependency unit suite (302 at the last count)
node tests/functional-probe.mjs   # drives the real app, port 8080
node tests/a11y-sweep.mjs         # 72 axe states, port 8106
```

The axe sweep is 72 states, not 32, because it now covers the generated county,
grade, help and open-data pages as well as the app's routes. Its first section used to
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

**The band has since moved down, and the instruction above is what found it
rather than what missed it.** Four consecutive preview readings on one branch
went **93, 94, 94, 93**, with production itself sitting at 94 - below the 95-97
recorded here. So the payload was measured before the diff was blamed, and it
exonerates the diff completely: across those same four commits the catalogue
grew **892 to 1,019 records**, roughly 25KB gzipped, and the critical path moved
**106.1 to 106.5KB gz** - 0.4KB, all of it two new entries in `data/sectors.js`.
`data/courses.js` is off that path as a property, and 128 new records added
**zero bytes** to the page Lighthouse audits.

Two things follow, and the second is the more useful one. A 0.4KB delta cannot
move a score this file already establishes could not see an **11.24KB** swing,
so 93 is noise at a slightly lower centre rather than a regression.

**And the control case then arrived for free, which is better evidence than the
measurement.** The commit that recorded this paragraph changed
`CLAUDE.md` and nothing else - **zero bytes of shipped payload** - and its
preview scored **94, "no change from production"**, a point ABOVE the 93 before
it. Five readings now run 93, 94, 94, 93, 94. A score that moves up a point when
the served page is byte-identical is the cleanest possible demonstration that
the swing is the instrument rather than the diff, and it cost nothing but
waiting for the next comment. **When a score moves and you suspect noise, the
next docs-only commit is a free control - read it before arguing from bytes
alone.**

The other half stands: **the noise band is itself a perishable figure** -
exactly the kind this file warns about everywhere else. It has sat at 93-94
across every reading since it moved, and that is deliberately not written as a
count, because the count keeps moving and this paragraph would go stale the
next time a preview posts. Re-measure it rather than quoting either range, and
go to the bytes before the diff every time.

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

## Re-reading an absence: what the stale-absence sweep is actually for

558 records assert that a source does not exist. This file already names them as
the only claims here with no expiry and no guard, and the sweep now has three
passes behind it — KEWI and RTI, where the claim had simply *become false*;
MIOG, which yielded a published rate; and EASA, which yielded neither and was
still worth the two searches.

**EASA is the useful shape, because nothing was written and the note improved
anyway.** Thirteen records rest on one shared note. It said *"Published 2026
figures give a diploma range of roughly Ksh 115,950 to 226,700"*. Two
independently phrased searches, neither seeded with a figure, agree that there
are **two** schedules and not one — KNEC diplomas over three terms at about
115,950 to 158,450, and EASA's own diplomas over one or two years at about
120,500 to 180,500, with IATA on a third schedule — and both date them to
**2023/24**, not 2026.

So the note was wrong twice about its own provenance while every figure in it was
real. The quoted 115,950–226,700 span is the KNEC band's floor joined to the
price of a *separately priced six-month Aircraft Maintenance Licence course* —
two documents read as one range, which is how a band ends up spanning nearly two
to one and looking like a schedule. And "2026" overstated a three-year-old
reading, which is the perishability warning this file applies to dates
everywhere else, arriving inside a note about fees.

**A figure being genuinely published is not the same as the note describing
where it came from.** The reporting paragraph exists to say what research turned
up; it inherits the discipline of everything else here, so the *year* and the
*document* are part of the claim, not decoration. Re-reading an absence is worth
doing even when it stays an absence, because the reported band is a claim with
the same shelf life as a fee.

The rewritten note names the three schedules separately, says none of their
durations matches the length on the card, and tells the reader to ask which
schedule their programme sits on — a sharper phone call than a single invented
span could produce. It also lost the paragraph arguing *why* a midpoint is not a
fee, which belongs here and not on a card a learner reads on a phone; that cut
paid for the added facts and the note came out shorter.

**And the discursive cut was not the only thing the pass bought.** Don Bosco
Karen's note told the reader to "ask admissions" and gave no way to; its centre
publishes two numbers. CITC Mombasa's note inferred open artisan entry from the
KCPE route, and the centre in fact **publishes the Konoin ladder verbatim** —
C- for diplomas, D plain for certificates, other categories open — so the
inference is now a published statement. **A note that says ring them should say
what to ring**, and an entry claim resting on an inference should be upgraded
the moment the institution states it outright.

**The seventh course at CITC Mombasa was found by the fee search, not by a
coverage one.** Its listing names Grade III-I Motor Vehicle Mechanics (NITA)
alongside the KNEC Artisan in Motor Vehicle Mechanics, and this catalogue held
only the second — while already carrying *both* variants for electrical, which
is what shows the omission was an accident rather than a ruling. Course identity
is (name, institution) and these are two named awards from two examining bodies,
so it earns its own row. Corroborated by a second search naming no course.

Its `duration_months` is null, and that is the Kakrao ruling rather than a gap:
NITA publishes no single artisan duration, this catalogue's own Grade III-I
records run 15 months at one institution and 24 at another, and without a
duration the consolidated rate cannot be scaled — so the fee goes too. **Two
institutions in this catalogue disagreeing about one award's length is the
evidence that no national figure exists**, and it is sitting in the data rather
than in a source.

**The guard caught the record the sweep almost got right.** `artisan entry
grades reflect what each institution publishes` failed on it: the new note
carried the provenance of the award and the fee and dropped the sentence
explaining *why* entry is open, which the six records beside it all carry. The
record claimed the floor with no evidence for the floor — exactly what that
guard was rewritten to assert after the variety-count proxy failed on data that
had got better. Copying a record's neighbours is not the same as copying their
reasoning.

## The repo contradicts itself about five fees, and the sweep found it sideways

Looking for a *fee* at the two county vocational training centres turned up
neither a fee nor an absence, but a **disagreement inside this repository**.

`isVocationalCentre()` exists because `feeGuidance()` told a Maralal card that
the consolidated public-TVET rate of Ksh 67,189 governs its course. That ruling
is written up above in these words: *the rate is for a college a learner is
PLACED into by KUCCPS, while a county VTC sets its own far lower county-funded
charge*, and the card would have *overstated the cost many times over to the
readers with the least room*.

**Five records at those same two centres carry 67,189 in `total_fees_kes`** —
c281, c287 and c298 at Kitale, c289 and c300 at Maralal, all CDACC Level 5
certificates, all `derived` from that rate because both institutions are set to
`fee_regime: 'tvet_consolidated'` in the register.

So the card is forbidden to *mention* a rate that the catalogue *displays as a
number* for the same institution. Guidance is prose a reader weighs; a figure in
the fee field is what they budget against, so if the ruling is right this is the
worse half of the same defect — and it is the half nobody looked at, because the
fix was written where the bug was noticed.

**It is NOT being resolved here, and the reason is the part worth keeping.**
The ruling and the register can both be defensible: a CDACC **Level 5**
certificate is a craft qualification above the artisan tier, and a KUCCPS-placed
Level 5 trainee plausibly does sit on the consolidated rate *even at a centre
whose Grade III-I trades do not*. If that is so, these five records are right and
`isVocationalCentre()` is too blunt an instrument — it keys on the institution
where the distinction may belong to the programme. One search failed to settle
it, and a fee touching five cards is not a thing to flip on an inference.

Two things follow, and the first is the general one:

- **A ruling applied at one site is not applied at the others.** The VTC
  distinction was written into the renderer and never checked against the data,
  so the sweep for it should have been the same commit. Whenever a predicate is
  added that says *this rate does not apply here*, grep the catalogue for that
  rate at those institutions before closing the change.
- **The question to settle is narrow and it should be asked as such**: does the
  consolidated rate follow the KUCCPS-placed PROGRAMME or the institution TYPE?
  Everything else here follows from the answer. That is a closable lead in the
  Alupe sense, not a dry search.

**And one figure was refused inside the attempt.** A source gave the 67,189 as
including a Ksh 30,000 government capitation and *"leaving a balance of
Ksh 26,420"*. 67,189 minus 30,000 is 37,189. Two numbers in one sentence that do
not reconcile is the Bungoma self-contradiction in arithmetic, so neither was
written — and the capitation reading the guidance already gives is the safer
form of the same fact.

**Kitale's note gained a phone number and Maralal's gained nothing**, which is
the honest split: the first publishes one, the second publishes only a post
office box, and a PO box is not a route a school-leaver can use this week.
Maralal's note was already the more complete of the two — licence number,
registration date, the 20-trainee caps, and the NITA trade test being charged
separately — and the search corroborated every part of it without adding one.
**A re-read that confirms a good note is a result, not a wasted search.**
