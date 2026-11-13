# R8 baseline inventory — 13 November 2026

This is a **repository-derived inventory**, not a current CUE/TVETA accreditation audit. Parsed from `data/institutions.js` on the current main snapshot. The counts below were evaluated against the 217 institution objects; the accompanying `tools/audit-institution-metadata.mjs` recalculates them and adds course-reference integrity checks.

| Category | Institution records |
|---|---:|
| University | 66 |
| TVET | 137 |
| Teacher training (`ttc`) | 6 |
| College | 5 |
| Institute | 3 |
| **Total** | **217** |
| Public | 163 |
| Private | 54 |
| Counties represented | 47 |
| Website not supplied | 11 |
| Duplicate institution IDs | 0 |
| Duplicate exact normalized names | 0 |

**Do not infer** that 217 is the national total, that 47 counties have equally complete records, or that a listed website confirms accreditation. Campus candidates and accreditation conflicts are emitted by the script for manual review.

## Reviewable implementation

- `tools/audit-institution-metadata.mjs` generates counts, duplicate IDs/names, orphan course references, non-institutional website flags, ambiguous accreditation text and campus-name review candidates.
- `docs/research/institution-evidence.json` is an **optional, non-runtime** pilot overlay with an explicit unverified ILU legal-status claim. It is not imported by the site or used to alter course recommendations.
- `tests/institution-metadata.test.js` checks inventory detection and refuses to classify a claim as verified without provenance.

## Unfinished evidence research (not disguised as completed)

No current CUE/TVETA register, campus roster or programme approval file was opened in this implementation. The ten-institution evidence pilot therefore cannot be truthfully marked verified. The next research pass must populate the ledger with exact source title, canonical URL, publication/check date, campus/programme scope, conflicts and the specific claim supported. Keep `status: 'unverified'` until that review.

## Reproduction

```bash
node tools/audit-institution-metadata.mjs > /tmp/njia-institution-inventory.json
CI=1 node --test tests/institution-metadata.test.js
```

The inventory is read-only and changes no production records. Claude must run the tests, verify generated data freshness and review any integration proposal before merge.
