# One-release national catalogue data workflow

Njia is a buildless Netlify PWA. Avoid repeatedly pushing intermediate research updates: each push can trigger a deploy preview. Stage, validate and review a complete batch before a single merge to `main`.

## Offline validation
```sh
node --test tests/national-catalogue.test.js tests/national-source-validation.test.js
node tools/audit-national-catalogue.mjs > catalogue-audit.json
node tools/check-national-sources.mjs staged-leads.json > review.json
node tools/reconcile-national-sources.mjs staged-leads.json > reconciliation.json
```

## Research lead contract
A batch is a JSON array of objects. Required: `institution_name`, `programme_name`, `qualification_level`, `source_title`, `source_publisher`, `evidence_url` (HTTPS), `evidence_date` (YYYY-MM-DD). Recommended: `source_id`, `campus_name`, `regulator`, `regulatory_evidence_url`, `intake_year`, `minimum_kcse_grade`. Only supply `fees_kes` with a separately cited `fee_evidence_url`. Never interpret missing fees as zero.

All outputs are **review-only**. A syntactically valid URL is not proof that a regulator has approved a campus or programme. A reviewer must inspect the original official evidence, scope, date, intake, campus and qualification. Do not automatically publish, change canonical IDs or imply comprehensive national coverage.

## Release checklist
1. Resolve the outstanding GitHub Actions failure independently of the unrelated Vercel account status.
2. Verify new records against primary institutional and regulatory documents.
3. Reconcile and approve records, preserving existing IDs and field provenance.
4. Update canonical data in one batch, regenerate committed static pages and exports.
5. Run all Node tests, static content checks, accessibility/browser smoke tests.
6. Merge once into `main` only after validation, resulting in one intended Netlify production release.

GitHub/Netlify previews and Vercel deployments are different services; a Vercel failure should not be treated as evidence of a Netlify production failure.
