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

Mobile-first; the desktop shell (≥1024px) is a sidebar + content grid.
Two rules keep desktop from looking like a stretched phone:

- Buttons size to content on desktop (`.page .btn { width: auto }`)
  — full-width buttons are a phone tap-target pattern.
- Filter selects share one wrapping `.filter-toolbar` row, never one
  select per row.

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

## Motion

One entrance (`fadeIn` / `replayFadeIn`) on page and tab content.
`prefers-reduced-motion` is globally respected — never add motion that
bypasses it.

## PWA

Bump `CACHE_VERSION` in `sw.js` on every deploy that changes cached
files, or installed clients keep the old design until they clear site
data. Manifest colors must match the `styles.css` surfaces.
