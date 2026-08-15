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

## The app is not the whole site

This mistake has now been made four separate times, by four different routes,
and every instance had the same shape: something was verified in the app,
worked in the app, and was silently absent from the 53 generated pages.

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
one inside an aggregate that still looks fine. Twenty-three remain — lower the
constant when you close more.

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

- **`/open-data/`** publishes all 463 courses as CSV and JSON. The column that
  justifies it is `fee_basis` — anyone can list Kenyan courses and fees; almost
  nobody says which of their numbers they can stand behind. It is **computed by
  reading `feeBasis()` out of `js/decide.js`** at build time, not reimplemented,
  because an export that classified fees by its own copy of the rule could
  disagree with the app while both looked right alone. RFC 4180 quoting is not
  optional: **every one** of the 463 notes contains a comma or a quote and the
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

## Verification before any deploy

Regenerate first — the guards fail on stale artefacts, which is the point:

```
node tools/build-icons.mjs        # 4 PNGs + favicon.ico, needs Playwright
node tools/build-og-image.mjs     # share card; rewrites its own hash in index.html
node tools/build-open-data.mjs    # CSV + JSON + /open-data/
node tools/build-static-pages.mjs # 53 pages + sitemap; run LAST, it reads the others
```

Then four layers, all of which must be clean:

```
node --test tests/*.test.js       # zero-dependency unit suite (231)
node tests/functional-probe.mjs   # drives the real app, port 8080
node tests/a11y-sweep.mjs         # 60 axe states, port 8106
```

The axe sweep is 60 states, not 32, because it now covers the generated county,
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
