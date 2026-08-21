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

/* THE PAGE MUST BE ANSWERABLE, AND THE ROUTE MUST ACTUALLY WORK.
 *
 * The first version of this file required a mailto: and required it to be on
 * the project domain. Both checks passed while the advertised address could not
 * receive mail at all — a raw DNS query for MX on njiacareerpathways.work
 * returns NOERROR with zero answers from four independent resolvers, against a
 * control that resolves google.com's MX fine. The domain has no mail exchanger.
 *
 * So the guard was asserting the shape of a contact route rather than whether
 * one existed, which is the proxy trap this repository has now hit twice: the
 * artisan-variety count measured spread instead of evidence, and this measured
 * "there is a mailto" instead of "a reader can reach someone".
 *
 * What replaces it: a route that needs nothing configured must always be
 * present, and an address on the project domain may only be advertised once
 * DOMAIN_MAIL_LIVE is flipped in tools/build-static-pages.mjs — which is the
 * one place that judgement is recorded. Publishing a dead address is worse than
 * publishing none, because the reader writes and hears nothing. */
test('the partnership page always offers a route that needs nothing set up', () => {
  assert.match(page, /github\.com\/PapaDanico\/Njia\/issues/,
    'docs/index.html no longer offers the issue tracker. It is the only contact route that is '
    + 'live without anything being configured, so a funder or county officer who reads the '
    + 'proposal has no way to answer it. Restore it in docsIndexPage().');
});

test('llms.txt gives answer engines the same working route', () => {
  assert.match(llms, /github\.com\/PapaDanico\/Njia\/issues/,
    'llms.txt does not name the issue tracker. An answer engine is how a funder or journalist '
    + 'increasingly arrives, and it should be able to offer the route that certainly works.');
});

test('no email address is advertised while the domain cannot receive mail', () => {
  const m = page.match(MAILTO);
  const live = fs.readFileSync(path.join(root, 'tools', 'build-static-pages.mjs'), 'utf8')
    .includes('const DOMAIN_MAIL_LIVE = true;');

  if (!live) {
    assert.equal(m, null,
      `docs/index.html advertises ${m && m[1]} while DOMAIN_MAIL_LIVE is false in `
      + 'tools/build-static-pages.mjs. njiacareerpathways.work has no MX record, so mail to it '
      + 'bounces and the reader hears nothing — the silent dead end this page exists to close. '
      + 'Configure the domain\'s mail, then flip the flag.');
    assert.ok(!/mailto:[^"?]*njiacareerpathways\.work/.test(llms),
      'llms.txt hands answer engines an address on a domain with no mail exchanger.');
  } else {
    assert.ok(m, 'DOMAIN_MAIL_LIVE is true but the page publishes no address.');
    assert.ok(m[1].endsWith('@njiacareerpathways.work'),
      `the contact address is ${m[1]}. A personal mailbox on a funder-facing page is a `
      + 'disclosure decision that is not an agent\'s to make, and a weaker signal than the domain.');
    assert.ok(llms.includes(m[1]),
      'llms.txt must carry the same address the page advertises, or an answer engine sends a '
      + 'funder to a mailbox the page does not name.');
  }
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
