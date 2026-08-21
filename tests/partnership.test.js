/* Njia — the partnership page must be answerable, and unbuyable.
 *
 * WHY THIS FILE EXISTS.
 *
 * TWO SEPARATE FAILURES, ONE PAGE.
 *
 * The first is a dead end. /docs/ was built to make the funder proposal
 * findable and it succeeded — sitemap, llms.txt, a served link, a landing page
 * that tells a learner it is not for them. What it carried was no way to
 * reply. A county education officer could read the entire case, spend 2.6MB of
 * their bundle on the deck, and find no address anywhere on the page. That is
 * worse than never publishing it, because the reader has already spent the
 * attention this page exists to earn. This file fails the build if the contact
 * route goes, and if the address llms.txt gives an answer engine ever drifts
 * from the one the page itself advertises — a funder sent to a mailbox that
 * does not exist is the same dead end reached by a longer route.
 *
 * The second is the one that could end the project. Njia is now funded from
 * the institutional side, and one of the four routes is paid institution
 * listings. The entire value of this catalogue is that its figures are not for
 * sale: a fee basis is earned by someone reading a schedule, and an entry
 * grade is recorded at the KUCCPS floor because quoting it high hides the
 * course from the reader with the fewest options. A paid listing that could
 * move either of those would make every unpaid record unfalsifiable too, since
 * a reader cannot tell from the outside which is which.
 *
 * So the refusals are on the page, in the reader's words, rather than in a
 * policy document nobody opens — and they are asserted here individually. The
 * guard requires all four, because a page that promises no paid ranking while
 * quietly allowing a bought fee basis has kept the sentence and lost the
 * claim. This is the paraphrase trap named in CLAUDE.md: when a promise lists
 * four things, assert four things. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'docs', 'index.html'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');

const MAILTO = /href="mailto:([^"?]+)/;

test('the partnership page offers a route back to a person', () => {
  const m = page.match(MAILTO);
  assert.ok(m, 'docs/index.html carries no mailto: link. A funder or county officer '
    + 'who reads the proposal has no way to answer it — the conversion path ends here. '
    + 'Restore the contact section in docsIndexPage() in tools/build-static-pages.mjs.');
  assert.ok(/@/.test(m[1]), `the contact address is not an address: ${m[1]}`);
});

test('the contact address is on the project domain, not a personal mailbox', () => {
  const addr = page.match(MAILTO)[1];
  assert.ok(addr.endsWith('@njiacareerpathways.work'),
    `the partnership contact is ${addr}. A personal address on a funder-facing page reads `
    + 'as a hobby project rather than an institution worth contracting with.');
});

test('llms.txt gives answer engines the same address the page advertises', () => {
  const addr = page.match(MAILTO)[1];
  assert.ok(llms.includes(addr),
    `docs/index.html advertises ${addr} and llms.txt does not carry it. An answer engine `
    + 'quoting a different mailbox sends a funder to a dead end by a longer route. '
    + 'CONTACT_EMAIL is declared in both tools/build-static-pages.mjs and '
    + 'tools/build-structured-data.mjs and the two must agree.');
});

test('all four funding routes are named on the page', () => {
  const routes = {
    'county and institutional deployment': /County and institutional deployment/i,
    'data licensing': /Data licensing/i,
    'programme and research funding': /Programme and research funding/i,
    'institution listings': /Institution listings/i
  };
  const missing = Object.keys(routes).filter((k) => !routes[k].test(page));
  assert.deepEqual(missing, [], `these funding routes are not named on /docs/: ${missing.join(', ')}`);
});

/* THE FOUR REFUSALS. Asserted one at a time, because a page that keeps three
   of them has not kept the promise — it has kept most of a sentence. */
test('the page states that payment cannot buy ranking or ordering', () => {
  assert.ok(/never affects? ranking or ordering/i.test(page)
    && /no paid placement/i.test(page),
    'the /docs/ page no longer refuses paid ranking. This is the refusal that keeps the '
    + 'Course Matcher worth reading: if a paid listing can be promoted, no unpaid result '
    + 'can be trusted either, because the reader cannot tell them apart.');
});

test('the page states that payment cannot buy a fee basis or an entry grade', () => {
  assert.ok(/never affects? a fee basis or an entry grade/i.test(page),
    'the /docs/ page no longer refuses to sell a fee basis or an entry grade. Those are '
    + 'the two fields this whole repository is built to keep honest — a bought fee basis '
    + 'is the placeholder trap with an invoice attached, and a bought entry grade hides '
    + 'the course from the reader with the fewest options.');
});

test('the page states that a paid listing is disclosed as one', () => {
  assert.ok(/paid listing is disclosed/i.test(page),
    'the /docs/ page no longer promises to disclose a paid listing. An undisclosed one is '
    + 'indistinguishable from a researched record, which is the same failure as an '
    + 'uncited fee.');
});

test('the page states that a dishonest listing is declined', () => {
  assert.ok(/declined/i.test(page) && /independent and unaffiliated/i.test(page),
    'the /docs/ page no longer says a listing that cannot be honest is declined, or no '
    + 'longer claims independence. index.html tells every learner there is "no sponsor to '
    + 'please" — this page is where that sentence is either kept or quietly withdrawn.');
});

test('the learner is still sent away from the funder page', () => {
  assert.ok(/this is not the page you want/i.test(page),
    'the /docs/ page no longer redirects a student who lands on it by accident. Now that '
    + 'the page solicits money it matters more, not less, that a school leaver is handed '
    + 'the grade and county pages instead of a funder deck.');
});
