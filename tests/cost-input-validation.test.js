const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/decide.js'),'utf8');
test('course card rejects zero, negative and nonfinite durations for monthly cost',()=>{
 const a=source.indexOf('function renderCourseCard('),b=source.indexOf('function setDecideClusterFilter(',a);
 const card=source.slice(a,b);
 assert.match(card,/Number\.isFinite\(course\.duration_months\) && course\.duration_months > 0/);
 assert.match(card,/feePublished && durationKnown/);
 assert.match(card,/!durationKnown \? null : course\.total_fees_kes/);
 assert.match(card,/Number\.isFinite\(course\.total_fees_kes\) && course\.total_fees_kes >= 0/);
 assert.match(card,/verify the fee basis above/);
});
