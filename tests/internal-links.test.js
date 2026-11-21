/* Njia — every internal link in a committed page resolves to a file.
 *
 * WHY THIS FILE EXISTS. The help FAQ is written once, in js/help.js, and
 * rendered in two places: inside the app at the site root, and as the static
 * /help/ page. Two answers linked "./privacy/" and "./terms/". At the root that
 * is correct; on /help/ it resolves to /help/privacy/, which does not exist, so
 * the two links a reader follows to delete their data or read the terms were
 * dead on the crawlable copy. Every per-surface guard was green, because none of
 * them asked whether a link lands anywhere.
 *
 * External links are deliberately out of scope: this build cannot reach them,
 * and a search snippet is not evidence that a URL answers (CLAUDE.md, egress).
 * Template placeholders (${...}) are skipped because they are not URLs yet.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.claude']);

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function resolves(target) {
  if (!fs.existsSync(target)) return false;
  return fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html'));
}

test('every internal href and src in a committed page resolves to a file', () => {
  const broken = new Set();
  const all = pages(ROOT);
  assert.ok(all.length > 50, `found only ${all.length} pages; the walker is looking in the wrong place`);
  for (const file of all) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw = m[1];
      if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(raw) || raw.includes('${')) continue;
      const u = raw.split('#')[0].split('?')[0];
      if (!u) continue;
      const target = u.startsWith('/') ? path.join(ROOT, u) : path.resolve(path.dirname(file), u);
      if (!resolves(target)) broken.add(`${path.relative(ROOT, file)} -> ${raw}`);
    }
  }
  assert.equal(broken.size, 0, `Internal links that land nowhere:\n${[...broken].join('\n')}`);
});
