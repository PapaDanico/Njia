/* whyThisResult: the answers that counted most toward a direction. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = vm.createContext({ console });
for (const f of ['data/questions.js', 'data/institutions.js', 'data/courses.js', 'js/discover.js', 'js/decide.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), context, { filename: f });
}
const why = vm.runInContext('whyThisResult', context);
const A = {
  q1: { text: 'Build things', scores: { maker: 2 }, weight: 1 },
  q2: { text: 'Fix machines', scores: { maker: 1 }, weight: 2 },
  q3: { text: 'Help people', scores: { carer: 3 }, weight: 1 },
  q4: { text: 'Another tie', scores: { maker: 2 }, weight: 1 },
  q5: { text: 'my private sentence', scores: {}, weight: 1 },
};
const plain = (x) => JSON.parse(JSON.stringify(x));

test('only positive weighted points for that direction, highest first', () => {
  const r = plain(why(A, 'maker', 5));
  assert.deepEqual(r.map((x) => x.text), ['Another tie', 'Build things', 'Fix machines']);
  assert.ok(r.every((x) => x.points > 0));
  assert.ok(!r.some((x) => x.text === 'Help people'));
});
test('free text is never included', () => {
  assert.ok(!plain(why(A, 'maker', 10)).some((x) => x.text.includes('private')));
});
test('limit honoured; order independent of key order', () => {
  assert.equal(why(A, 'maker', 2).length, 2);
  const shuffled = {}; Object.keys(A).reverse().forEach((k) => { shuffled[k] = A[k]; });
  assert.deepEqual(plain(why(shuffled, 'maker', 3)), plain(why(A, 'maker', 3)));
});
test('empty and missing input are safe', () => {
  assert.deepEqual(plain(why({}, 'maker', 3)), []);
  assert.deepEqual(plain(why(undefined, 'maker', 3)), []);
});
