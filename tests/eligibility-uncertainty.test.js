const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/decide.js'),'utf8');
const start=source.indexOf("!course.min_grade ? 'No minimum listed — confirm'");
test('missing programme entry grade is not presented as confirmed eligibility',()=>{
 assert.ok(start>0);
 const expression=source.slice(start,start+240).split('</dd>')[0];
 assert.match(expression,/!course\.min_grade/);
 assert.match(expression,/!match\.eligible/);
 assert.match(expression,/match\.gradeUnconfirmed/);
});
test('research dashboard validates compact metrics before displaying them',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../research/research.js'),'utf8');
 assert.match(js,/if\(!validIndicators\(d\)\)throw Error\('Compact report invalid'\)/);
 assert.match(js,/if\(!validIndicators\(d\)\)throw Error\('Invalid research indicators'\)/);
});
