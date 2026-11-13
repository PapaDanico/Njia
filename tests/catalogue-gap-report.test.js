const {test}=require('node:test');const assert=require('node:assert/strict');
test('unknown fees differ from free and open entry is not flagged',async()=>{
 const {buildGapReport}=await import('../tools/catalogue-gap-report.mjs');
 const r=buildGapReport([{id:'a',institution_id:'x',name:'Example',min_grade:null,total_fees_kes:null,duration_months:null,verification_note:'Official page'},{id:'b',institution_id:'x',name:'Free',total_fees_kes:0,duration_months:12,verification_note:'Official page'}],[{id:'x',name:'College',county:'Nairobi'}]);
 assert.equal(r.byFlag.fee_unavailable,1);assert.equal(r.byFlag.duration_unavailable,1);assert.equal(r.rows.find(x=>x.course_id==='b').fee_state,'zero');assert.equal(r.bySeverity.ok,1);
});
test('critical gaps come first and CSV quotes embedded punctuation',async()=>{
 const {buildGapReport,reportCSV}=await import('../tools/catalogue-gap-report.mjs');
 const r=buildGapReport([{id:'b',institution_id:'x',name:'Normal',total_fees_kes:1,verification_note:'yes',duration_months:1},{id:'a',institution_id:'absent',name:'Course, "A"',total_fees_kes:-1,verification_note:'',duration_months:1}],[{id:'x',name:'College',county:'Nairobi'}]);
 assert.equal(r.rows[0].course_id,'a');assert.equal(r.rows[0].severity,'critical');assert.ok(reportCSV(r).includes('"Course, ""A"""'));
});
test('empty catalogue is valid',async()=>{
 const {buildGapReport,reportCSV}=await import('../tools/catalogue-gap-report.mjs');
 const r=buildGapReport([],[]);assert.equal(r.counts.courses,0);assert.equal(r.bySeverity.critical,0);assert.equal(reportCSV(r).split('\n').length,2);
});
