# Research page: buildless fallback implemented

The research page now works with Njia's **already-committed** `/open-data/njia-catalogue.json` export when the optional compact `/research/catalogue-indicators.json` has not been generated. This removes the missing-artifact blocker without changing Netlify's no-op production build.

The export already includes institution ID, county, qualification level, fee provenance, grade and duration. The browser derives catalogue-only counts from those classified records; it does **not** invent Kenyan national totals or run a duplicate fee classifier. The export is fetched only when a reader visits the research page and the compact artifact is absent.

The preferred compact artifact remains a performance enhancement for a later fully validated release. The fallback's count checks fail closed if the export's course or institution metadata disagrees with its rows. Regression test: `node --test tests/research-fallback.test.js`.

Netlify issues remain with the site owner; no production merge has occurred.
