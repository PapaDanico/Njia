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
one inside an aggregate that still looks fine. Twelve remain — lower the constant when you close more. It was 23; Kakamega and
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
**2.1% of fees are published by the institution for that course** (14 of 680)
and **51.2% carry no figure at all**; `employment_rate` and `median_salary_kes`
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

**Honest absence.** `employment_rate` and `median_salary_kes` are null on all
680 records. Every one was invented, all were removed, and `llms.txt` declares
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
provenance at all.** All 680 records carry it, 364 the same
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

Sourcing 680 records is not available — the yield floor established across a
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

**Twelve E-blind counties remain, from fourteen. Four single-provider counties
remain, from six.**

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
implementation filtered all 683 courses with an `INSTITUTIONS.find` inside the
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

The finding it carries: **12 counties list nothing an E-grade leaver can enter,
and all 12 list no artisan course at all.** It was 23 and 21 when this page
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

- **`/open-data/`** publishes all 683 courses as CSV and JSON. The column that
  justifies it is `fee_basis` — anyone can list Kenyan courses and fees; almost
  nobody says which of their numbers they can stand behind. It is **computed by
  reading `feeBasis()` out of `js/decide.js`** at build time, not reimplemented,
  because an export that classified fees by its own copy of the rule could
  disagree with the app while both looked right alone. RFC 4180 quoting is not
  optional: **every one** of the 683 notes contains a comma or a quote and the
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
node --test tests/*.test.js       # zero-dependency unit suite (292 at the last count)
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
