const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../js/decide.js'),'utf8');
test('unknown grade requirements do not appear as no requirement or a passing grade',()=>{
 const a=src.indexOf('function renderCourseCard('),b=src.indexOf('function setDecideClusterFilter(',a);const card=src.slice(a,b);
 assert.match(card,/Entry grade unlisted/);
 assert.match(card,/Not listed — confirm/);
 assert.match(card,/!course\.min_grade \|\| match\.gradeUnconfirmed \|\| !match\.eligible/);
 assert.match(card,/!course\.min_grade \? 'No minimum listed — confirm' : match\.gradeUnconfirmed/);
});
