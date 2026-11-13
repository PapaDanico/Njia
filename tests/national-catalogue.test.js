const {test}=require('node:test');const assert=require('node:assert/strict');
test('catalogue audit flags duplicates, orphans and invalid fees',async()=>{
 const {auditCatalogue}=await import('../tools/audit-national-catalogue.mjs');
 const a=auditCatalogue([{id:'a',institution_id:'x',name:'Diploma',min_grade:null,total_fees_kes:null},{id:'a',institution_id:'missing',name:'Diploma',min_grade:'Z',total_fees_kes:-1}],[{id:'x',county:'Nairobi'}]);
 assert.equal(a.issues.duplicate_course_ids.length,1);assert.equal(a.issues.orphan_institution_references.length,1);assert.equal(a.issues.invalid_min_grades.length,1);assert.equal(a.issues.invalid_fee_amounts.length,1);assert.equal(a.counts.legacy_open_entry,1);
});
test('reconciliation never imports records and preserves existing IDs',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const a=reconcileCandidates([{institution_name:'Example College',programme_name:'Diploma',evidence_url:'https://example.org',evidence_date:'2026-11-01'}],[{id:'college',name:'Example College'}],[{id:'old',institution_id:'college',name:'Diploma'}]);
 assert.equal(a[0].status,'enrich_existing');assert.equal(a[0].course_id,'old');assert.equal(a[0].review_required,true);
});
