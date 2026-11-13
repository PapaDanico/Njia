# Pre-merge review: release gating

The new research tools are opt-in; none changes the live UI or canonical catalogue. A draft PR is not a completed student-facing upgrade.

## Observed remote checks
- GitHub PR #159 is mergeable but draft and marked unstable.
- Latest commit status shows Netlify deploy-preview failure and Vercel account blocked.
- CI workflow for latest commit reports failure; GitHub log retrieval returns BlobNotFound, so root cause is **unknown**.
- No full local repository checkout or successful full test run has been established.

## Added gate
`tests/catalogue-indicators-integration.test.js` exercises the real canonical catalogue against the actual application fee classifier and verifies all major totals reconcile. This catches drift that synthetic fixtures alone miss.

## Go/no-go
Do not merge until Netlify failure is diagnosed, CI or equivalent tests pass, and the scope of the release is approved. Design CSS is not yet linked and cannot be advertised as a shipped redesign. Do not confuse unverified data coverage with comprehensive national provision.
