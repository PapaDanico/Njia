# Njia design direction — academic editorial authority

**Design brief:** Translate the visual discipline of a distinguished research university into an original Kenyan career-guidance product. This is an inspiration, **not** a Harvard-branded, affiliated, endorsed or lookalike site. Never use Harvard's wordmark, shield, seal, trademarked visual assets or imply endorsement.

## Core philosophy
- **Knowledge before decoration.** The design should feel like an authoritative university publication, not a commercial admissions funnel.
- **Editorial hierarchy.** A strong serif headline introduces the question; a concise lead explains the finding; evidence and practical next steps follow.
- **Scholarly restraint.** Generous whitespace, rules instead of shadows, aligned columns, quiet navigation, deliberate use of one accent.
- **Credibility is earned.** Put methodology, dated sources, uncertainty and independence disclosures near claims; never imply guaranteed admission or employment.
- **Access is central.** Premium presentation must remain fast on budget phones and intermittent Kenyan mobile connections, accessible to all KCSE outcomes.
- **Local originality.** Retain Njia's own emblem and terracotta/earth/cream/forest palette. Do not adopt Harvard crimson or copy Harvard page layouts.

## Visual system
**Typography:** existing locally available Charter/Georgia serif for hero and report headings; native system sans for controls and body text; tabular monospace for fee figures, grades and dates. Avoid external fonts.
**Palette:** warm off-white paper, deep earth ink, restrained terracotta for actions, dark forest for source-confirmed labels, ochre for limited graphic emphasis only.
**Composition:** 12-column desktop grid with asymmetric editorial introduction and a disciplined evidence rail; 65-character prose line measure; full-width but readable data comparison; single-column mobile.
**Surface:** near-square edges, thin rules, minimal shadow. Avoid pill-heavy UI, decorative gradients, oversized hero illustrations and meaningless animations.
**Photography:** optional original, licensed Kenyan learning environments with accurate captions; never substitute stock graduation photography for programme evidence.
**Navigation:** clear modules, breadcrumb/context, progress and one obvious primary action. Labels should describe decisions rather than marketing features.

## Proposed student results layout
1. **Report masthead** — Njia mark, “Your pathway briefing”, date, and independent guidance disclosure.
2. **Finding** — one clear editorial recommendation and a concise “why this fits” explanation, explicitly advisory not deterministic.
3. **Evidence summary** — entry requirements, published/derived/unavailable fee status, duration, location, provenance and source date.
4. **Alternatives** — a comparable matrix with transparent trade-offs; no opaque ranking or invented employment probabilities.
5. **Action plan** — confirm institution/programme approval, check intake and current fee schedule, apply via the appropriate official channel.
6. **Methods & limitations** — collapsible, keyboard accessible, plain-language source and uncertainty explanation.

## Design acceptance criteria
- WCAG 2.2 AA; 320px through 1920px; light/dark mode; keyboard and reduced motion.
- No extra network origins, webfont fetches or dependencies; preserve PWA offline and existing CSP.
- Do not alter Njia's canonical course IDs, grading semantics or fee provenance.
- Existing navigation, save, compare, exports and report generation must pass regression tests.
- No misleading institutional endorsement or use of university marks.
- Test redesigned Decide first, then extend to Discover, Track, and printable student report.
- Merge one validated, cohesive release into main; avoid Netlify preview churn.

## Implementation note
`css/academic-editorial.css` is an opt-in design vocabulary. It is intentionally not included in `index.html` until the redesigned Decide screen has been implemented and visually checked.
