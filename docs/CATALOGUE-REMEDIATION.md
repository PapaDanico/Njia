# Catalogue remediation queue
Run from the repository root:
```sh
node tools/catalogue-gap-report.mjs --out catalogue-gaps.json
node tools/catalogue-gap-report.mjs --csv --out catalogue-gaps.csv
node --test tests/catalogue-gap-report.test.js
```
This tool reads the existing canonical catalogue, groups gaps by county and severity, and exports a review queue. It never writes back to the app. Critical: invalid fee or missing institution. High: missing verification note. Review: unavailable fee or duration. An unavailable fee is not free, and null minimum grade is open entry under the existing app rules. CSV output is RFC 4180 quoted. Do not publish this internal review queue as if it were a verified national institutional registry.

## Cost control
Hold this work on the existing PR branch. Avoid production merges until the larger release is verified. Netlify may still build branch previews on pushes; turn off automatic previews for the development branch in Netlify if saving build credits is essential.
