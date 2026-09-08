/* Njia — the IndexNow key must match the file it is served from.
 *
 * WHY THIS FILE EXISTS.
 *
 * Getting found has one step that genuinely needs a person — submitting the
 * sitemap to Google Search Console, which needs a Google account and a browser.
 * IndexNow is the part that does not: no account, no OAuth, no dashboard. Host
 * a key file at the domain root, POST the URL list, and Bing, Yandex, Seznam
 * and Naver are notified at once. Google does not participate, so this is an
 * addition to Search Console and never a replacement — which is stated in
 * tools/submit-indexnow.mjs for the same reason it is stated here.
 *
 * The whole protocol rests on one fact being true: a file at
 * https://<host>/<key>.txt containing exactly <key>. If the name and the
 * contents ever disagree, or the file stops being published, **the submission
 * is rejected and nothing says so** — the engines simply ignore it. That is the
 * failure this project cares most about: not an error, but a silence that looks
 * like success, exactly like a milestone marker that 404s and reads as "nobody
 * got there".
 *
 * It is guarded here rather than trusted because the key file is a lone
 * 32-character filename at the repo root with no obvious owner — precisely the
 * kind of thing a later tidy-up deletes.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const KEY_RE = /^[0-9a-f]{32}\.txt$/;

test('exactly one IndexNow key file sits at the domain root', () => {
  const hits = fs.readdirSync(root).filter((f) => KEY_RE.test(f));
  assert.equal(hits.length, 1,
    `found ${hits.length} IndexNow key files (${hits.join(', ') || 'none'}). The protocol fetches `
    + 'one file to prove control of the domain; none means every submission is rejected in '
    + 'silence, and more than one means the key in tools/submit-indexnow.mjs is ambiguous.');
});

test('the key file contains exactly its own name', () => {
  const file = fs.readdirSync(root).filter((f) => KEY_RE.test(f))[0];
  assert.ok(file, 'no key file to check');
  const contents = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(contents.trim(), file.replace(/\.txt$/, ''),
    `${file} contains ${JSON.stringify(contents.trim().slice(0, 40))}. IndexNow fetches the file `
    + 'and compares it to the key in the request; a mismatch is rejected and nothing reports it.');
  assert.equal(contents, contents.trim(),
    `${file} has leading or trailing whitespace. The comparison is exact.`);
});

test('the submitter reads the key from the file rather than carrying a copy', () => {
  /* A key hardcoded in the script is a second source of truth, and the two
     drift the moment the key is rotated — which is the whole reason the fee
     exporter reads feeBasis() out of the app instead of reimplementing it. */
  const src = fs.readFileSync(path.join(root, 'tools', 'submit-indexnow.mjs'), 'utf8');
  const literals = src.match(/['"`][0-9a-f]{32}['"`]/g) || [];
  assert.deepEqual(literals, [],
    `tools/submit-indexnow.mjs contains a hardcoded 32-hex key (${literals.join(', ')}). Read it `
    + 'from the key file, so rotating the key means replacing one file and nothing else.');
});

test('the key file is not offered to crawlers as content', () => {
  /* It is a proof-of-control token, not a page. In the sitemap it would be an
     indexable URL with 32 characters of hex as its entire body, which is a thin
     page on a site that has argued hard against thin pages. */
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const file = fs.readdirSync(root).filter((f) => KEY_RE.test(f))[0];
  assert.ok(!xml.includes(file),
    `${file} is listed in sitemap.xml. It is an ownership token, not a page.`);
});

test('robots.txt still allows the key file to be fetched', () => {
  /* The engines must be able to GET it. robots.txt excludes /m/ and nothing
     else; if that ever grows a rule that covers the root, IndexNow stops
     working silently. */
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const disallows = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  const blocked = disallows.filter((d) => d === '/' || KEY_RE.test(d.replace(/^\//, '')));
  assert.deepEqual(blocked, [],
    `robots.txt disallows ${blocked.join(', ')}, which stops the engines fetching the IndexNow `
    + 'key file. Ownership can then never be verified, and submissions fail silently.');
});
