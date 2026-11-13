# National catalogue quality controls
These additive, dependency-free tools protect Njia's existing course IDs and reader-facing behaviour.

## Commands
```sh
node tools/audit-national-catalogue.mjs > catalogue-audit.json
node tools/reconcile-national-sources.mjs path/to/official-staged-records.json > reconciliation-review.json
node --test tests/*.test.js
```

Reconciliation is **review only**. Do not automatically import records. Incoming data must cite dated primary official evidence and distinguish institution, campus, qualification, programme, intake, and regulatory approval. Matching on programme name alone is insufficient.

The existing `min_grade: null` convention means open entry; do not reinterpret it as unknown. Missing fees are unknown, not zero. Preserve the existing fee provenance classifications and public CSV/JSON exports. Do not claim 47-county catalogue coverage is equivalent to full national provision.

Next: validate official CUE, TVETA, KUCCPS, KNQA and specialised-regulator registers; stage campus-specific offerings; reconcile manually; update canonical `data/courses.js` and `data/institutions.js` only with evidence; regenerate published outputs and run browser/accessibility tests before release.
