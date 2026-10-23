# Njia design philosophy

Benchmarked in October 2026 against the nine original web products in the same
portfolio: Airline-Diagnostic-Toolkit, JiPange, Mwangaza-Yield, UsalamaSMS,
Takwimu, Kivuli360, Ratiba, JiraniOne and The Integrated Woman Diagnostic Tool.
This file records what they share, what the best of them do that the rest do
not, and the principles Njia holds itself to as a result. CLAUDE.md records
incidents; this file records intent.

## What the portfolio already shares

- **A warm earth palette.** Terracotta, amber, sand and gold appear in seven of
  nine products. It reads as Kenyan without resorting to the flag, and it is a
  genuine portfolio signature worth keeping.
- **A serif display face over a plain sans.** Cormorant Garamond with DM Sans
  appears in four products. Njia uses a serif for display and the system sans
  for body text.
- **One cultural motif, used as structure.** Ratiba's 3px tribal stripe,
  JiraniOne's shield mark, Njia's beaded rule under the header. The best
  examples confine the motif to one job (a divider) instead of decorating
  everything.
- **Design tokens.** Every product names its colours; the stronger ones also
  name their type sizes.

## What the best of them do that the rest do not

| Practice | Where | Njia today |
|---|---|---|
| Separate tokens for colour as **fill** and colour as **type**, each pairing measured against every ground it sits on | UsalamaSMS `docs/04-BRAND.md` | Partly: `--accent` and `--accent-ink` follow this; not done everywhere |
| A script that **fails the build** when a brand pairing drops below contrast | UsalamaSMS `scripts/check-brand.mjs` | No equivalent yet |
| **One temperature**: no cool greys or cool accents in a warm system | Ratiba `brand-tokens.md` | Fixed in this pass: a stray purple-to-pink avatar gradient was the one cool hue |
| **Lining, tabular figures** wherever numbers are compared | Ratiba (`lining-nums`, `.tnum`) | Yes: county tables and figures use `tabular-nums`, landing figures use mono |
| **A type floor**, so no size is picked component by component | Njia (`--fs-xs` = 12px, guarded) | Ahead of the portfolio: two siblings define a 10px `--fs-3xs` |
| **No third-party requests at runtime** | Njia (system fonts, `connect-src 'self'`) | Ahead of the portfolio: most siblings load Google Fonts |
| **48px touch targets** | JiraniOne (stated, not measured) | Partly: buttons and form controls are 48px; small links may not be |

## The principles

1. **Design for the hardest reader.** A cheap Android phone, outdoors, on a weak
   signal, sometimes in an in-app browser, read by someone over forty or by a
   school-leaver with a D. A layout that works for them works for everyone; the
   reverse is not true.
2. **The first screen answers the task.** If someone opens Decide, courses
   appear above the fold. Method, provenance and caveats stay one tap away, in
   the DOM, behind a summary that states the key fact. (Decide's fee-provenance
   table was folded this way in October 2026.)
3. **One temperature.** Every colour, including neutrals, shadows and tints, is
   drawn from the warm system. A new component does not bring its own palette.
4. **Colour that becomes text is a separate token.** Brand fills are chosen to
   be seen; text needs 4.5:1 on every ground it can appear on, not just one.
   Measure the pair, then name it.
5. **Numbers are the product.** Fees, grades and counts use lining, tabular
   figures, and a figure is never styled more confidently than its provenance
   allows. A derived fee must not look like a published one.
6. **Culture as structure, not ornament.** One motif with one job. A pattern
   repeated everywhere stops carrying meaning.
7. **Nothing loads from anyone else.** System fonts, self-hosted assets, a CSP
   that forbids third-party connections. Fewer bytes and the privacy promise
   both depend on it.
8. **Every rule has a gate.** A principle with no test drifts; see CLAUDE.md on
   guarded and unguarded questions. The type floor and the security headers
   have gates. Contrast pairs do not yet.

## Next steps, in order

1. Port UsalamaSMS's brand gate as `tests/contrast.test.js`: list every text
   and ground token pair used, compute WCAG contrast, fail under 4.5:1 (3:1 for
   large display type).
2. Audit small-link touch targets against 48px on the generated pages.
3. Write this file's principles into the sibling products' own CLAUDE.md, so
   the portfolio converges rather than each product rediscovering them.

## The hybrid, as built (October 2026)

What Njia took from each sibling, and where it shows:

- **From Ratiba's type specimen: the report grid.** A narrow label column on
  the left (eyebrow plus a headline that states the finding), content on the
  right, and figures set as exhibits: a 2px rule on top, open space, the source
  set in small italics underneath. No boxes around facts.
- **From Ratiba and Mwangaza: two-colour discipline.** One deep ink, one warm
  accent, flat grounds. The landing hero's two glowing radial gradients were
  removed for that reason.
- **From UsalamaSMS: measured pairs.** Fill tokens and text tokens are separate,
  and new pairings are checked for contrast before they ship.
- **Njia's own:** the terracotta and cream palette, the serif display face, the
  beaded rule, the 12px type floor, and nothing loaded from third parties.

Corners came down to 3–10px and card shadows to a hairline. Large radii and
floating shadows read as a consumer app; a published report reads as edges and
rules. Non-clickable exhibits no longer lift on hover, because a lift promises
an action.
