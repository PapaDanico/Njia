const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/decide.js'),'utf8');
test('unknown duration never displays a fabricated monthly payment or cost-of-attendance total',()=>{
 const a=source.indexOf('function renderCourseCard('),b=source.indexOf('function setDecideClusterFilter(',a);const card=source.slice(a,b);
 assert.match(card,/monthlyEstimate != null \?/);
 assert.match(card,/totalCostOfAttendance == null/);
 assert.match(card,/A monthly tuition average cannot be calculated/);
 assert.match(card,/arithmetic average, not an instalment plan/);
 assert.match(card,/Request the official payment schedule/);
});
