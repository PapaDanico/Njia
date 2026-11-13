# Release gate — Njia academic editorial and evidence upgrade

**Status: BLOCKED.** This document is a checklist, not an approval.

## Current change set
- PR #159, development branch `upgrade/catalogue-quality-2026-11-13`.
- Research source register, research dashboard, academic editorial styling, course/funding evidence panels, comparison provenance, catalogue audits and tests.
- The production site is **not** updated by these commits.

## Known external blockers (observed 13 November 2026)
- Vercel commit status: failure — "Account is blocked."
- Netlify deploy preview: failure — "Deploy Preview failed."
- GitHub Actions workflow runs: failure; no successful current-branch run confirmed.
- These are external check outcomes; their root causes have **not** been established. Do not assume they are code defects or ignore them.

## Required sign-off
1. Clean checkout of PR head and `node --test tests/*.test.js` passes.
2. Confirm no generated files drift after running existing generator scripts with workflow build-date settings.
3. Manually test search, filtering, save, compare, funding, grade unknown, fee missing and research fallback.
4. Keyboard, screen-reader landmarks, 320–1440 px responsive layout and no console errors.
5. Recheck 2026-specific placement, HEF, TVETA and fee claims against primary sources.
6. Obtain working deployment preview and inspect mobile and desktop.
7. Only then mark PR ready for review and merge.

**Owner boundary:** Netlify deployment configuration remains with the site owner.
