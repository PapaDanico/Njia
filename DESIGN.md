# Njia Design System

Njia shares the family's **warm editorial** design DNA (see JiPange's
DESIGN.md for the sibling implementation): serif display type over
paper-toned surfaces, one terracotta accent, mono numerals for data,
generous card rhythm. Everything is enforced through the custom
properties at the top of `css/styles.css` — change values there, never
inline.

## Typography

| Role | Face | Applied via |
| --- | --- | --- |
| Display (`h1`–`h3`, landing hero) | serif stack (`--serif`) | base rule in `styles.css` |
| UI / body | system sans stack | `body` |
| Numerals (fees, stats, figures) | mono stack (`--mono`) + `tabular-nums` | `.num`, `.stat .value`, ledger rows |

The serif is reserved for headings so it keeps its authority; uppercase
micro-labels (`.caption`, `.page-eyebrow`) stay in the sans.

## Iconography — the chrome/content rule

- **App chrome** (nav, tabs, section-card headings, system affordances,
  empty states, toasts): stroke SVGs from the sprite at the top of
  `index.html` — 24-unit grid, 2px stroke, round caps, `currentColor`.
  Static HTML references them with `<svg class="icon"><use
  href="#i-name"/></svg>`; JS-rendered markup uses the `icon(name)`
  helper in `js/app.js`. Hand-inline new symbols in the sprite; don't
  add an icon library.
- **Content voice** (WhatsApp share text, cluster personas, celebratory
  copy): emoji is intentional and stays.
- Never put emoji inside native `<option>` elements or chrome labels —
  they render differently on every device and read as unfinished.

## Selected states

Chips, tabs and segmented controls take the **ink fill** when active
(`--ink` background, `--ink-contrast` text) — a deliberate dark-neutral
so the terracotta accent stays reserved for primary actions and
emphasis. Module tabs are one contained segmented control
(`.odyssey-tabs`), not loose pills.

## Page headers

Every module page opens with a `.page-eyebrow` overline
(`Module NN · Name`), then the serif `h1`, then a one-line subtitle.
`navigateTo()` focuses the heading for screen readers; the focus outline
is suppressed for `h1/h2[tabindex="-1"]` only — never remove it from
interactive elements.

## Layout

Mobile-first; the desktop shell (≥1024px) is a top nav with grouped
dropdowns over a centred content column (see "Desktop layout" below for
how that width is used). Two rules keep desktop from looking like a
stretched phone:

- Buttons size to content on desktop (`.page .btn { width: auto }`)
  — full-width buttons are a phone tap-target pattern.
- Filter selects share one wrapping `.filter-toolbar` row, never one
  select per row; on wide screens they move into the Decide rail.

## Tokens — the Kanda discipline

Adopted from Kandalogistics' design system: **component rules reference
tokens, never raw values.** If you find yourself typing a hex or a pixel
in a component rule, the token is missing — add it to the `:root` block
instead. Tint panels use the `*-soft` background + `*-ink` text +
`*-border` hairline triplets; never raw success/warn/danger as small
text on tints. Spacing tokens follow a 4px grid (`--space-1` … `--space-16`);
display sizes are fluid (`--text-*-fluid` via `clamp()`), because a fixed
phone headline shown on a desktop is most of why a page reads as a
utility.

## Light and dark

Both schemes are first-class. The dark scheme is "warm ink" — the same
paper-and-terracotta identity inverted onto deep espresso grounds (never
pure black), with the terracotta lightened where it carries text so the
AA contrast floor holds (non-negotiable, per the family rule). The
mechanism: a tiny inline script in `index.html` stamps
`data-theme` pre-paint from the stored choice or system preference;
`applyTheme()` in `js/app.js` owns the toggle, persistence
(`localStorage.njia-theme`), meta theme-color sync, and follows system
changes until the user chooses explicitly. All dark values live in the
single `:root[data-theme="dark"]` block; the landing page swaps its
scoped `--landing-*` token set as a unit.

## Desktop layout — earn the width

The desktop shell is a top nav plus a `--page-max` (1280px) content
column. Wide does not mean stretched:

- **Running text keeps a readable measure** (`--prose-max`, 68ch). Cards,
  grids and tables use the full width; paragraphs never do.
- **The space beside prose carries information, not air.** Module headers
  are a two-column grid: intro left, a live panel right (Decide shows
  catalogue coverage computed from the shipped dataset).
- **Decide has a sticky filter rail** (260px) instead of filters stacked
  above results — the rail turns the old dead gutter into working chrome
  and keeps every filter reachable while scrolling a long catalogue.
- **Grids get denser with width**: the results grid is
  `auto-fill minmax(288px, 1fr)` (3–4 course cards per row at 1280px),
  and the three Odyssey lives sit side by side, because comparing futures
  is the point of the exercise.
- The **phone bottom nav stays** — thumb reach on low-end Android is a
  Njia constraint, and it is deliberately not inherited from Kanda.

A media query adds no specificity: a desktop override must come **after**
the base rule in source order, or it silently loses.

## Colour that carries text

Palette values in `data/*.js` (cluster colours, plan accents) are tuned
for **fills** — bars, dots, tints. Wherever one of them carries *text*,
use its ink token instead (`--cluster-<id>-ink`, `--plan-life<n>`), which
is defined per scheme so the AA floor holds in both. Never interpolate a
raw palette hex into a `color:` in JS.

## Accessibility — how to actually check it

The AA floor is non-negotiable, and checking it badly is worse than not
checking, because it produces false confidence. A desktop-only,
WCAG-2.0-only audit passed clean while Lighthouse was still deducting
points. The audit must cross **four** dimensions:

- **Both viewports** — Lighthouse scores at a *mobile* form factor
  (~412×823). Desktop-only runs miss target-size and layout failures.
- **Both colour schemes** — dark shipped after several components, so
  its surfaces are the ones most likely to be unaudited.
- **Both data states** — empty and populated. Empty states render
  different headings and controls entirely.
- **The full ruleset** — `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`
  *and* `best-practice`. Restricting to `wcag2a`/`wcag2aa` hides
  target-size (WCAG 2.2), heading-order and p-as-heading, all of which
  Lighthouse does count.

That is 7 pages × 2 × 2 × 2 = 56 states, and it should report zero.

## Headings

Semantics and type scale are separate concerns. A module page is
`h1` (page title) → `h2` (card and section headings) → `h3` (sub-parts),
with no skipped levels; card `h2`s keep the level-3 visual size via
`.card > h2`. The landing page is the exception and is correct as it
stands: its `h3`s sit under real `landing-h2` section headings.

## Motion

One entrance (`fadeIn` / `replayFadeIn`) on page and tab content.
`prefers-reduced-motion` is globally respected — never add motion that
bypasses it.

## Persisted state is untrusted input

Njia is an installed PWA that updates itself in place, so a returning
user can arrive carrying state written by a much older version. Any
renderer that reaches straight into a persisted collection —
`app.steps.every(...)`, `plan.years.map(...)` — throws on an entry saved
before that field existed, and a throw inside `renderRoute()` leaves the
module blank with no way back except clearing site data, which destroys
everything else the user saved.

`normalizeState()` in `js/app.js` is the single place that repairs shape,
and it runs before any module renders. Two rules:

- **Repair beats discard.** Backfill the missing field and keep the
  user's work; drop an entry only when its identity is unrecoverable.
  Pad `years`, never truncate it — truncating deletes something a real
  person typed.
- **Coerce booleans explicitly.** A persisted `done: 'false'` is truthy
  and would render an uncompleted step as done, silently inflating
  someone's progress.

Add a collection to `defaultState()` and you add it here too;
`tests/state.test.js` pins both halves of the contract.

Note the load-order trap: `loadState()` runs at module load, *above*
these helpers in source order, so they are function declarations rather
than `const` arrows. A `const` there sits in the temporal dead zone,
throws, gets swallowed by `loadState`'s own `catch`, and wipes every
user's saved work on every load — silently, since the fallback looks
like a fresh install.

## Reveal, don't re-render

Toggling a control's visibility by rebuilding the surrounding view costs
~180ms on a mid-range Android at 4× CPU throttle when the Decide
catalogue is on screen — well past the 100ms responsiveness floor, on the
app's most-repeated action. Render conditional chrome (the saved-only
chip, Compare Saved) unconditionally and flip the `hidden` attribute
instead; re-render only when the *contents* genuinely change, as when
un-saving a course under the saved-only filter.

The UA rule for `[hidden]` is `display:none` at the lowest possible
specificity, so any component rule setting `display` defeats it. The
reset in `styles.css` restores it with `!important` — without that,
`el.hidden = true` looks correct in the DOM and changes nothing on screen.

## PWA

Bump `CACHE_VERSION` in `sw.js` on every deploy that changes cached
files, or installed clients keep the old design until they clear site
data. Manifest colors must match the `styles.css` surfaces.
