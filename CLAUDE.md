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
one inside an aggregate that still looks fine. Thirty-three remain — lower the
constant when you close more.

Every county in Kenya has public technical provision. When a county looks empty,
the gap is in this catalogue, not in the county. Find the institution by naming
the county and searching per institution, then list only the courses a reachable
source actually names — all four of these run more than is listed, and each note
says so rather than padding the catalogue with plausible programme names.

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

Four layers, all of which must be clean:

```
node --test tests/*.test.js                      # zero-dependency unit suite
node tests/functional-probe.mjs                  # drives the real app, port 8080
node tests/a11y-sweep.mjs                        # 32 axe states, port 8106
```

Plus a manual drive of every page at 1440px and 390px in both colour schemes.
Static tests do not execute a page: several defects this project shipped were
invisible to a green suite and obvious one second after loading the app.

Bump `CACHE_VERSION` in `sw.js` on every deploy. Icons are cache-first, so a
stale version means readers keep the old ones.

## Regenerating the app icons

`node tools/build-icons.mjs` rasterises `icons/logo-mark.svg` into the four
PNGs using the Playwright Chromium. The PNGs once drifted a full rebrand
behind the SVG, so a test asserts they are never older than their source.

## Verifying a production deploy

Netlify's `currentDeploy` on this site is repeatedly stale — it reported the
previous deploy for over a minute after several merges. **Always confirm
`commit_ref` on the deploy object**, never `state: "ready"`. The MCP endpoints
502 independently and intermittently; back off 60s and retry the other one.

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
