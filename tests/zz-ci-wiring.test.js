/* TEMPORARY — proves the deploy-preview build actually runs this suite.
 * Pushed deliberately failing, observed, and removed in the next commit. */
const test = require('node:test');
const assert = require('node:assert');
test('CI WIRING PROBE — deliberately failing', () => {
  assert.fail('if the deploy preview goes red, netlify.toml is running the suite');
});
