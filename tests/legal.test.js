/* The legal pages: terms of use, privacy, and the operator credit.
 *
 * Three things this guards, each a way these pages have gone wrong before:
 *  - A statement in a modal that contradicts the page it summarises. The Terms
 *    modal once called every fee an estimate and listed employment rates that
 *    were removed months earlier.
 *  - A published registration number, address or contact the project has not
 *    verified. Only the project mailbox is advertised.
 *  - The logo growing from a footer credit into page weight.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');

const builder = read('tools/build-static-pages.mjs');
const EMAIL = (builder.match(/const CONTACT_EMAIL = '([^']+)';/) || [])[1];

test('the terms page exists and names who publishes Njia', () => {
  const html = read('terms/index.html');
  assert.ok(html.includes('id="operator"'), 'the terms page has no operator section');
  assert.ok(text(html).includes('published by Danico Ventures Ltd'));
  for (const id of ['what-it-is', 'accuracy', 'warranty', 'under-18', 'changes']) {
    assert.ok(html.includes(`id="${id}"`), `terms page is missing the ${id} section`);
  }
});

test('terms and privacy are in the shell footer, the app footer, the sitemap and llms.txt', () => {
  assert.ok(read('tools/site-shell.mjs').includes("href: '/terms/'"), 'shell footer has no terms link');
  assert.ok(read('js/app.js').includes('href="./terms/"'), 'app footer has no terms link');
  assert.ok(read('sitemap.xml').includes('/terms/<'), 'terms is not in sitemap.xml');
  assert.ok(read('llms.txt').includes('/terms/'), 'terms is not named in llms.txt');
  assert.ok(read('index.html').includes('href="./terms/"'), 'terms is not linked in the served index.html');
});

test('the privacy page says who is responsible, what you can ask, and where to complain', () => {
  const t = text(read('privacy/index.html'));
  assert.ok(t.includes('Danico Ventures Ltd'), 'privacy page does not name the operator');
  assert.ok(/Data Protection Act 2019/.test(t));
  assert.ok(/odpc\.go\.ke/.test(read('privacy/index.html')), 'no route to the Data Commissioner');
  assert.ok(/72 hours/.test(t), 'no breach commitment');
  assert.ok(/not had a legal review/.test(t), 'the page must not imply it has been legally reviewed');
});

test('the only contact published on the legal pages is the project mailbox', () => {
  assert.ok(EMAIL, 'CONTACT_EMAIL not found in the generator');
  for (const f of ['terms/index.html', 'privacy/index.html', 'accessibility/index.html']) {
    const found = new Set(read(f).match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []);
    assert.deepEqual([...found].filter((m) => m !== EMAIL), [], `${f} publishes an address other than the project mailbox`);
    assert.ok(found.has(EMAIL), `${f} does not carry the project mailbox`);
  }
});

test('no registration number, postal address or phone number is invented for the operator', () => {
  for (const f of ['terms/index.html', 'privacy/index.html']) {
    const t = text(read(f));
    assert.ok(!/\b(CPR|PVT|BN)[\/\-\s]?\d/.test(t), `${f} carries a company registration number`);
    assert.ok(!/\bP\.?\s?O\.?\s?Box\b/i.test(t), `${f} carries a postal address`);
    assert.ok(!/\+254|\b07\d{8}\b/.test(t), `${f} carries a phone number`);
  }
});

test('the modals do not contradict the pages they summarise', () => {
  const html = read('index.html');
  assert.ok(!/employment rates and salaries are (illustrative )?estimates/i.test(html), 'a modal still calls employment rates and salaries estimates');
  assert.ok(!/illustrative pending verification/i.test(html), 'a modal still calls the catalogue illustrative pending verification');
  assert.ok(!/early-stage project/i.test(html), 'a modal still describes Njia as an early-stage project');
  const modal = html.slice(html.indexOf('function openTermsModal'), html.indexOf('function openPartnersModal'));
  assert.ok(modal.includes('./terms/'), 'the terms modal does not link to the full terms');
  assert.ok(modal.length < 2500, 'the terms modal has grown into a second copy of the terms page');
});

test('the operator logo stays a footer credit: small file, decorative, lazy', () => {
  const f = path.join(root, 'icons', 'danico-ventures-mark.png');
  assert.ok(fs.statSync(f).size < 12 * 1024, 'the logo mark is over 12KB');
  for (const src of [read('js/app.js'), read('tools/site-shell.mjs')]) {
    const tag = (src.match(/<img[^>]*danico-ventures-mark[^>]*>/) || [])[0];
    assert.ok(tag, 'a footer does not carry the logo');
    assert.ok(/alt=""/.test(tag), 'the credit image is decorative, so its alt is empty and the words beside it name the company');
    assert.ok(/loading="lazy"/.test(tag), 'the logo must not load on the critical path');
    assert.ok(/width="\d+"/.test(tag) && /height="\d+"/.test(tag), 'the logo needs a size so the footer does not shift');
  }
  assert.ok(!/danico-ventures-mark/.test(read('index.html').replace(/<noscript>[\s\S]*?<\/noscript>/, '')), 'the logo is referenced from the served index.html');
});
