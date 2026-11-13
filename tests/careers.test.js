/* Njia - the careers page agrees with a live recount of the catalogue.
 *
 * Recomputed from data/courses.js and data/institutions.js here, not from the
 * generator's variables, so a page that has drifted from the data fails. Also
 * asserts the page makes no employment or salary claim, which Kenya does not
 * publish per course and Njia refuses to print. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const ctx = vm.createContext({});
for (const f of ['institutions.js', 'courses.js', 'questions.js']) vm.runInContext(fs.readFileSync(path.join(root, 'data', f), 'utf8'), ctx);
const INSTITUTIONS = vm.runInContext('INSTITUTIONS', ctx);
const COURSES = vm.runInContext('COURSES', ctx);
const DIRECTIONS = vm.runInContext('Object.fromEntries(Object.entries(CLUSTERS).map(([k, v]) => [k, v.name]))', ctx);
const known = new Set(INSTITUTIONS.map((i) => i.id));
const page = fs.readFileSync(path.join(root, 'careers', 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

test('every direction shows its most common roles with the counts the data gives', () => {
  const problems = [];
  for (const [id, name] of Object.entries(DIRECTIONS)) {
    const counts = new Map();
    for (const c of COURSES) {
      if (c.cluster !== id || !known.has(c.institution_id)) continue;
      for (const role of c.career_paths || []) {
        const r = counts.get(role) || { courses: 0, openToE: 0 };
        r.courses += 1;
        if (c.min_grade == null || c.min_grade === 'E') r.openToE += 1;
        counts.set(role, r);
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1].courses - a[1].courses || (a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1)).slice(0, 12);
    const section = page.match(new RegExp(`<h2 id="[^"]*">${esc(name)}</h2>([\\s\\S]*?)</section>`));
    if (!section) { problems.push(`${name}: no section`); continue; }
    const rows = [...section[1].matchAll(/<tr><th scope="row">([^<]*)<\/th><td class="num">([^<]*)<\/td><td>[^<]*<\/td><td class="num">([^<]*)<\/td><\/tr>/g)]
      .map((m) => [m[1], Number(m[2].replace(/,/g, '')), Number(m[3].replace(/,/g, ''))]);
    const expected = top.map(([role, r]) => [esc(role), r.courses, r.openToE]);
    if (JSON.stringify(rows) !== JSON.stringify(expected)) problems.push(`${name}: page rows differ from the catalogue recount`);
  }
  assert.deepEqual(problems, [], `${problems.join('\n')}\nRegenerate with node tools/build-static-pages.mjs then build-structured-data.mjs.`);
});

test('the careers page makes no employment or salary claim', () => {
  const t = page.replace(/<[^>]+>/g, ' ');
  assert.match(t, /no employment rates or salaries per course/);
  assert.doesNotMatch(t, /\b(average salary|starting salary|median salary|in demand|fastest[- ]growing|high[- ]paying|guaranteed)\b/i);
});
