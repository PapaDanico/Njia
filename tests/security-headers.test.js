'use strict';
/* Security headers live in netlify.toml and reach every response, including the
 * generated pages, which carry no <meta> CSP. The header CSP must equal the
 * index.html <meta> CSP plus frame-ancestors: both apply at once, so a drift
 * between them silently tightens or loosens the site depending on which page a
 * reader lands on. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const header = (name) => {
  const m = toml.match(new RegExp(`^\\s*${name} = "([^"]*)"`, 'm'));
  return m && m[1];
};

test('every baseline security header is sent', () => {
  for (const h of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options',
    'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(header(h), `${h} is missing from netlify.toml [[headers]]`);
  }
  assert.match(toml, /for = "\/\*"/, 'headers must apply to every path, not only the app');
  assert.equal(header('X-Content-Type-Options'), 'nosniff');
});

test('the header CSP is the meta CSP plus frame-ancestors, and nothing else', () => {
  const meta = (html.match(/Content-Security-Policy" content="([^"]*)"/) || [])[1];
  assert.ok(meta, 'index.html lost its <meta> CSP');
  assert.equal(header('Content-Security-Policy'), `${meta}; frame-ancestors 'none'`);
});

test('the policy still keeps data on the device', () => {
  // connect-src 'self' is what enforces the privacy promise: answers cannot be
  // sent to a third party. Loosening it is a product decision, not a header tweak.
  assert.match(header('Content-Security-Policy'), /connect-src 'self';/);
  assert.match(header('Content-Security-Policy'), /object-src 'none'/);
});
