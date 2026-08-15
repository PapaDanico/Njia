/* Njia — why every mtime-based staleness guard is skipped in CI.
 *
 * Not a test file. Named without `.test.js` so the runner's `tests/*.test.js`
 * glob does not pick it up.
 *
 * WHAT THESE GUARDS DO, AND WHY THEY ARE RIGHT LOCALLY.
 *
 * This repository commits its own build output: 57 static pages, two CSV
 * exports, a JSON export, the sitemap, four PNG icons, favicon.ico, the share
 * card and the injected JSON-LD. That is a deliberate consequence of being
 * buildless — Netlify serves the files as committed and runs no build.
 *
 * The failure that follows is one nothing else can see. Someone edits
 * data/courses.js and does not re-run the generators. Every test passes, every
 * page renders, and the county pages quietly describe a catalogue that no
 * longer exists. Comparing mtimes catches it with no dependency and no image
 * decoding, and it fails in exactly the situation that occurs: source newer
 * than the thing derived from it.
 *
 * WHY THEY ARE MEANINGLESS IN CI.
 *
 * Git does not record or restore modification times. A clone or a checkout
 * stamps every file with the moment git wrote it, in whatever order it wrote
 * them, so on a completely clean runner data/courses.js is routinely "newer"
 * than the pages built from it. The comparison carries no information there —
 * it is not a weaker signal, it is no signal — and a guard that fails on an
 * unmodified tree teaches people to ignore CI.
 *
 * This was confirmed the hard way twice in one session: a fresh `git checkout
 * main` produced four failures on an unmodified tree, and simulating the CI
 * job from a clean clone produced five. In both cases regenerating everything
 * yielded a byte-identical diff — the artefacts were correct and only their
 * timestamps had moved.
 *
 * WHAT COVERS THEM INSTEAD.
 *
 * .github/workflows/node.js.yml regenerates the four content generators and
 * runs `git diff --exit-code`. That compares CONTENT, which is strictly
 * stronger than comparing timestamps, and has no false positive. The three
 * rasterisers are not covered there because they need a browser; they remain
 * covered locally, which is where the mistake they guard against is made.
 *
 * Skipped, not silently passed, so a CI log states which checks did not run.
 */
const skipInCI = process.env.CI
  ? { skip: 'mtime comparison carries no information in CI — git does not preserve mtimes. '
      + 'Content is checked instead by the artefacts job in .github/workflows/node.js.yml' }
  : {};

module.exports = { skipInCI };
