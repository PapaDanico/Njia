'use strict';
/* The shared header and footer (tools/site-shell.mjs) on every generated page. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
function pages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'tests' || e.name === 'tools') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html' && dir !== root) out.push(p);
    }
  })(root);
  return out;
}
const PAGES = pages();
const exists = (href) => {
  const clean = href.split('#')[0];
  if (!clean || clean === '/') return true;
  const p = path.join(root, clean.replace(/^\//, ''));
  return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html'));
};

test('every generated page has one header, one skip link, a main target and one footer', () => {
  assert.ok(PAGES.length >= 60, `expected the generated pages, found ${PAGES.length}`);
  for (const f of PAGES) {
    const html = fs.readFileSync(f, 'utf8');
    const rel = path.relative(root, f);
    assert.strictEqual((html.match(/<header class="site-header">/g) || []).length, 1, `${rel}: header count`);
    assert.strictEqual((html.match(/<footer class="site-footer">/g) || []).length, 1, `${rel}: footer count`);
    assert.match(html, /<a class="skip-link" href="#main">/, `${rel}: no skip link`);
    assert.match(html, /<main[^>]*id="main"/, `${rel}: main has no id`);
    assert.doesNotMatch(html, /class="back"/, `${rel}: legacy back link returned`);
  }
});

test('no generated page repeats an id (the header mark and the print mark once did)', () => {
  for (const f of PAGES) {
    const html = fs.readFileSync(f, 'utf8').replace(/<style[\s\S]*?<\/style>/g, '');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepStrictEqual([...new Set(dupes)], [], `${path.relative(root, f)} repeats ${[...new Set(dupes)].join(', ')}`);
  }
});

test('every link in the shared header and footer points at a real page', async () => {
  const shell = await import('../tools/site-shell.mjs');
  const all = [...shell.HEADER_LINKS, ...shell.EVIDENCE_LINKS, shell.COUNSELLOR_LINK, ...shell.FOOTER_COLUMNS.flatMap((c) => c.links)];
  for (const l of all) assert.ok(exists(l.href), `${l.href} (${l.label}) does not exist`);
});

test('the shell prints nothing: header and footer are hidden on paper, the brief head is not', () => {
  const html = fs.readFileSync(path.join(root, 'counties', 'nairobi', 'index.html'), 'utf8');
  assert.match(html, /@media print \{ \.skip-link, \.site-header, \.site-footer \{ display: none !important; \} \}/);
  assert.match(html, /<div class="brief-head">/);
});

test('the app footer and menus carry every link the shared shell carries', async () => {
  const shell = await import('../tools/site-shell.mjs');
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  const start = app.indexOf('<footer class="landing-footer">');
  const footer = app.slice(start, app.indexOf('</footer>', start));
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const navStart = index.indexOf('<nav class="landing-nav"');
  const nav = index.slice(navStart, index.indexOf('</nav>', navStart));
  const rel = (h) => '.' + h;
  for (const c of shell.FOOTER_COLUMNS) {
    for (const l of c.links) {
      if (l.href.startsWith('/#')) continue; // the app opens Discovery in place
      assert.ok(footer.includes(`href="${rel(l.href)}"`), `app footer lacks ${l.href} (${l.label})`);
    }
  }
  const header = [...shell.EVIDENCE_LINKS, shell.COUNSELLOR_LINK, ...shell.HEADER_LINKS.filter((h) => !h.href.startsWith('/#'))];
  for (const l of header) {
    assert.ok(nav.includes(`href="${rel(l.href)}"`), `app nav lacks ${l.href} (${l.label})`);
  }
});
