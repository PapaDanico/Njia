const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('course cards show grade, fee provenance, placement and accreditation as distinct evidence',()=>{
 const js=fs.readFileSync(path.join(root,'js/decide.js'),'utf8');
 const start=js.indexOf('function renderCourseCard('),end=js.indexOf('function setDecideClusterFilter(',start);
 assert.ok(start>=0&&end>start);const card=js.slice(start,end);
 for(const phrase of ['Decision evidence','Grade check','Fee evidence','Placement','Accreditation','Current intake unverified','Check programme approval','Funding requires a separate application'])assert.ok(card.includes(phrase),phrase);
 assert.match(card,/match\.gradeUnconfirmed/);assert.match(card,/!match\.eligible/);
 assert.match(card,/\[basis\]/);assert.match(card,/research\/sources\//);
});
test('course evidence uses scoped responsive styles and visible grade warning',()=>{
 const css=fs.readFileSync(path.join(root,'css/decide-evidence.css'),'utf8');
 assert.match(css,/\.course-card \.njia-course-evidence/);
 assert.match(css,/\.njia-course-evidence__warning/);
 assert.match(css,/@media\(max-width:380px\)/);
});
