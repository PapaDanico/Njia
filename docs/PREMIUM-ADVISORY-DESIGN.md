# Njia premium international advisory design system — implementation brief

## Positioning
An independent, evidence-led Kenyan career decision advisory platform. Premium should mean **clear reasoning, transparent uncertainty, exceptional readability, and calm information hierarchy**—not glossy decoration, luxury cues or implying affiliation with any consulting firm.

## Current baseline
The existing site already uses a thoughtful warm-paper/terracotta identity, serif headlines, accessible brand contrasts, near-square cards, tabular numeric typography and a zero-external-font CSP. Preserve these strengths. A wholesale colour swap or font dependency would be regression, not an upgrade.

## Proposed visual direction: editorial decision intelligence
- **Hierarchy:** decisive editorial headline, one-sentence executive finding, supporting evidence, next action. A student's answer must appear before lengthy methodology.
- **Grid:** 12-column desktop composition; readable 60–70-character prose measure; single-column on small phones. Avoid narrow 600px-only presentation for comparison tables.
- **Typography:** existing local serif for editorial display, native sans for UI, monospace/tabular figures for KCSE grades, costs and dates. No Google Fonts or third-party scripts.
- **Colour:** retain Njia's terracotta, earth-brown, cream and forest-green. Reserve ochre for data highlights; don't use ochre as small text on cream.
- **Components:** executive brief, evidence metric, published/derived/unavailable source label, comparison matrix, uncertainty note, clear action rail, methodology drawer.
- **Content:** every quantitative claim should show provenance and date where available. Avoid invented success rates, verified accreditation badges without registry evidence, or implied guaranteed placement.
- **Microcopy:** “What this means for you”, “Evidence behind this”, “What to confirm with the institution”, “Your next practical step”. Kenya-specific, professional English.
- **Accessibility:** keyboard-visible focus, AA contrast, reduced-motion, 44px touch targets for interactive controls, descriptive link labels, robust dark mode.
- **Performance:** no new JS frameworks, webfont downloads, trackers, heavyweight animation or image libraries. Preserve existing PWA offline capabilities.

## Opt-in primitives added
`css/advisory-components.css` defines `.njia-brief`, `.njia-evidence-grid`, `.njia-evidence-card`, `.njia-decision-note`, `.njia-status`. It is deliberately **not yet linked into the production page**. Integrate with the redesigned Decide results and student report after screenshot-based review and responsive tests; use semantic HTML headings, lists and citations.

## Priority implementation sequence
1. Prototype redesigned Decide result summary, fee provenance and side-by-side course comparison on a separate preview.
2. Conduct mobile, desktop, dark-mode, keyboard, contrast and screenshot regression review.
3. Reuse approved components in Discover and Track; improve PDF/print styles.
4. Update the actual UI and static pages as one cohesive release, not many cosmetic deploys.
5. Verify the full repository suite and ship in one controlled Netlify production merge.

## Release quality gates
- No regression in course selection, filters, local persistence, PWA install or offline experience.
- Source labels remain accurate; unknown fees remain unknown.
- No layout overflow at 320, 375, 768, 1280 and 1920px.
- WCAG 2.2 AA contrast and focus checks; reduced-motion compliance.
- Measure mobile payload and interaction readiness against existing baseline.
- One production merge after approval; disable automatic branch previews if Netlify usage warrants it.
