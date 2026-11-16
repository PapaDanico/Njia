'use strict';
/* A scroll region that cannot scroll is a page that does. The wrapper around a
 * wide table is only useful if its class carries an overflow rule; /analysis/
 * shipped a `table-wrap` with none, so a 320px phone scrolled the whole page
 * sideways. This checks every generated page: each element marked as a
 * focusable scroll region must have a class with an overflow rule in that
 * page's own stylesheet. It reads class names out of the markup, so it covers
 * wrappers added later. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'tests', 'tools', 'js', 'css', 'data', 'icons', 'docs', 'research', 'm'].includes(e.name) && dir === root) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) pages(full, out);
    else if (e.name === 'index.html' && dir !== root) out.push(full);
  }
  return out;
}

test('every focusable scroll region has a class with an overflow rule', () => {
  const failures = [];
  const found = pages(root);
  assert.ok(found.length > 40, 'expected the generated pages, found ' + found.length);
  for (const file of found) {
    const html = fs.readFileSync(file, 'utf8');
    const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []).join('\n');
    const re = /<div class="([^"]+)"[^>]*\brole="region"[^>]*\btabindex="0"|<div class="([^"]+)"[^>]*\btabindex="0"[^>]*\brole="region"/g;
    let m;
    while ((m = re.exec(html))) {
      const classes = (m[1] || m[2]).split(/\s+/);
      const ok = classes.some((c) => new RegExp('\\.' + c.replace(/[-]/g, '\\-') + '\\b[^{}]*\\{[^}]*overflow(-x)?\\s*:\\s*(auto|scroll)').test(css));
      if (!ok) failures.push(path.relative(root, file) + ': .' + classes.join('.') + ' has no overflow rule');
    }
  }
  assert.deepStrictEqual(failures, [], failures.join('\n'));
});
