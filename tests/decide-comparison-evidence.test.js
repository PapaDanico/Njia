const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('comparison highlights tuition only when fee evidence is published or sourced-derived',()=>{
 const js=fs.readFileSync(path.join(root,'js/decide.js'),'utf8');
 const a=js.indexOf('function openCourseComparison()'),b=js.indexOf('/* ---------- Funding Finder ---------- */',a);
 const compare=js.slice(a,b);
 assert.match(compare,/\['published', 'derived'\]\.includes\(feeBasis\(c\)\)/);
 assert.match(compare,/\? c\.total_fees_kes : null/);
 assert.match(compare,/\.filter\(\(v\) => v != null\)/);
 for(const label of ['Fee evidence','Placement','Programme approval'])assert.ok(compare.includes(label));
 assert.match(compare,/Compare evidence, not just prices/);
});
test('comparison advisory uses scoped CSS',()=>{
 const css=fs.readFileSync(path.join(root,'css/decide-evidence.css'),'utf8');
 assert.match(css,/\.njia-compare-note/);
});
