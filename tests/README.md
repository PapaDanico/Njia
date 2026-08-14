# Running Njia's checks

Three layers, deliberately separate.

## 1. Unit suite — no dependencies, always runnable

```
node --test tests/*.test.js
```

Runs on a clean clone with no `npm install`, no `package.json` and no lockfile,
because Njia has none of those and that is a property worth keeping. If this
command ever needs an install to pass, something has gone wrong.

`tests/sector-register.js` is data, not a test — the industry sector register
that `sector-coverage.test.js` enforces. It lives in `tests/` rather than
`data/` because the app does not render it and readers are on metered mobile
data.

## 2. Accessibility sweep — needs a browser

```
python3 -m http.server 8106 &
npm i --no-save --prefix /tmp/njia-a11y playwright axe-core
NODE_PATH=/tmp/njia-a11y/node_modules node tests/a11y-sweep.mjs
```

32 states: 7 pages x 2 viewports x 2 colour schemes, plus 4 results-screen
states the old scratch sweep never reached. Exit 0 clean, 1 violations **or
states it could not reach**, 2 tooling missing — so "the browser was not
installed" can never be misread as "the sweep passed".

Overrides: `CHROMIUM_PATH`, `AXE_PATH`, `NJIA_ORIGIN`.

## 3. Functional probe — drives the actual app

```
python3 -m http.server 8080 &
npm i --no-save --prefix /tmp/njia-probe playwright
NODE_PATH=/tmp/njia-probe/node_modules node tests/functional-probe.mjs
```

Completes the questionnaire by clicking through it, checks filters against the
headline count the app renders, checks that a course with no published fee
shows no verification tick, corrupts localStorage and confirms recovery, and
loads every module page checking for overflow and stacked pages.

Overrides: `PROBE_URL`, `CHROMIUM_PATH`.

**Why layers 2 and 3 exist.** Both were once scratch scripts that died with the
session and were rewritten from memory each time, and both lied for weeks:

- The old a11y sweep reported "28 states, 0 violations" while never completing
  the questionnaire, so it had never scanned the screen the questionnaire
  produces — the most consequential screen in the app. A contrast failure sat
  there undetected until a sweep that actually reached the state went looking.
- The old functional probe twice reported "level filter changes the result set
  — 24 -> 24" by counting rendered cards against a pagination cap of 24. The
  filter was fine both times. A probe that cries wolf is worse than none.

And the unit suite cannot replace them. Two defects were invisible to 155 green
tests and obvious one second after loading the page: a removed variable still
referenced further down the same function, which threw on render; and a
page-level `display: grid` that overrode `.page { display: none }` and stacked
three modules on top of each other. Static assertions do not execute a page.

## Note on ESM and NODE_PATH

Both `.mjs` files resolve `playwright` through `createRequire`, not a static
`import`. `NODE_PATH` is a CommonJS mechanism and ESM `import` ignores it, so
`import { chromium } from 'playwright'` fails on a machine that supplies the
browser the documented way above.
