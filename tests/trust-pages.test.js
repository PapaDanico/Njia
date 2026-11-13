/* Njia - the privacy and accessibility pages say only what is true.
 *
 * Asserts properties, not wording: the privacy page must describe the step
 * counting honestly (never promising "no analytics" while milestone counting
 * ships, which tests/analytics.test.js already bans app-wide) and must not claim
 * legal compliance; the accessibility page must not claim conformance and must
 * say what has not been tested. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const text = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('the privacy page describes the counting and the exception, and claims no compliance', () => {
  const t = text('privacy/index.html');
  assert.match(t, /The one thing Njia does count/);
  assert.match(t, /Do Not Track or Global Privacy Control/);
  assert.match(t, /optional Feedback or Partner Inquiry form/);
  assert.doesNotMatch(t, /\bno analytics\b(?!\s*(?:scripts?|pixels?|providers?|tags?))|analytics of any kind/i,
    'the privacy page must not promise no analytics while milestone counting ships');
  assert.doesNotMatch(t, /\bcompl(y|ies|iant) with\b[^.]*Data Protection/i, 'the page must not claim legal compliance');
  assert.match(t, /has not had a legal review/, 'the page must say the legal review has not happened');
});

test('the accessibility page claims no conformance and states what has not been tested', () => {
  const t = text('accessibility/index.html');
  assert.doesNotMatch(t, /\b(fully accessible|is accessible to everyone|fully conforms|conforms to WCAG|WCAG[^.]*compliant)\b/i);
  assert.match(t, /does not claim to conform/);
  assert.match(t, /No manual audit with screen readers/);
  assert.match(t, /No testing with people who use assistive technology/);
});

test('both pages are linked from the in-app footer', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /href="\.\/privacy\/"/);
  assert.match(app, /href="\.\/accessibility\/"/);
});
