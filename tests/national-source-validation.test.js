const {test}=require('node:test');
const assert=require('node:assert/strict');
const valid={institution_name:'Example College',campus_name:'Main',programme_name:'Diploma in Example',qualification_level:'Diploma',source_title:'Official prospectus',source_publisher:'Example College',evidence_url:'https://example.edu/prospectus',evidence_date:'2026-10-01',regulator:'TVETA',regulatory_evidence_url:'https://tveta.go.ke/register',fees_kes:30000,fee_evidence_url:'https://example.edu/fees'};
test('complete research leads are reviewable but never auto-published',async()=>{
 const {reviewQueue}=await import('../tools/national-source-validation.mjs');
 const q=reviewQueue([valid],{today:'2026-11-13'});
 assert.equal(q[0].status,'ready_for_review');assert.equal(q[0].auto_publish,false);assert.equal(q[0].valid,true);
});
test('fees require their own evidence and invalid dates are rejected',async()=>{
 const {validateResearchLead}=await import('../tools/national-source-validation.mjs');
 const a=validateResearchLead({...valid,fee_evidence_url:null,evidence_date:'2026-02-30'},{today:'2026-11-13'});
 assert.equal(a.valid,false);assert.ok(a.errors.some(x=>x.includes('fee evidence')));assert.ok(a.errors.some(x=>x.includes('real ISO date')));
});
test('future evidence is rejected and missing fees are not zero',async()=>{
 const {validateResearchLead}=await import('../tools/national-source-validation.mjs');
 const a=validateResearchLead({...valid,evidence_date:'2027-01-01',fees_kes:null,fee_evidence_url:null},{today:'2026-11-13'});
 assert.equal(a.valid,false);assert.ok(a.warnings.some(x=>x.includes('do not display zero')));
});
test('duplicate research leads are flagged for human review',async()=>{
 const {reviewQueue}=await import('../tools/national-source-validation.mjs');
 const a=reviewQueue([valid,{...valid,source_id:'second'}],{today:'2026-11-13'});
 assert.ok(a[1].warnings.some(x=>x.includes('duplicate')));
});
