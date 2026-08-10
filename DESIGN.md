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

## Motion

One entrance (`fadeIn` / `replayFadeIn`) on page and tab content.
`prefers-reduced-motion` is globally respected — never add motion that
bypasses it.

## PWA

Bump `CACHE_VERSION` in `sw.js` on every deploy that changes cached
files, or installed clients keep the old design until they clear site
data. Manifest colors must match the `styles.css` surfaces.
