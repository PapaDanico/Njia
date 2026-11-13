# Research intelligence: integration checklist

The main home page now links to `/research/`. Its interface is intentionally fail-closed until `research/catalogue-indicators.json` is generated and committed.

**To complete the data artifact in a working repository clone:**
```sh
node tools/catalogue-indicators.mjs --out research/catalogue-indicators.json
node --test tests/*.test.js
```

Do not hand-edit the JSON. It must be generated from the canonical course and institution modules and the application's fee classifier. The existing Netlify production build command remains a no-op. A stale/missing research artifact is a release blocker, not an invitation to infer statistics from older numbers.

The CI artifact freshness job should include `node tools/catalogue-indicators.mjs --out research/catalogue-indicators.json` before `git diff --exit-code` once the initial JSON is committed.

The new page does not assert national totals or graduate outcomes. Netlify setup and deploy previews are managed separately by the site owner.
