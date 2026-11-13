const {test}=require('node:test');
const assert=require('node:assert/strict');
test('audit detects duplicate IDs, orphans, invalid grades and negative fees',async()=>{
 const {auditCatalogue}=await import('../tools/audit-national-catalogue.mjs');
 const a=auditCatalogue([{id:'a',institution_id:'x',name:'Diploma',min_grade:null,total_fees_kes:null},{id:'a',institution_id:'missing',name:'Diploma',min_grade:'Z',total_fees_kes:-1}],[{id:'x',county:'Nairobi'}]);
 assert.equal(a.issues.duplicate_course_ids.length,1);
 assert.equal(a.issues.orphan_institution_references.length,1);
 assert.equal(a.issues.invalid_min_grades.length,1);
 assert.equal(a.issues.invalid_fee_amounts.length,1);
 assert.equal(a.counts.legacy_open_entry,1);
 assert.equal(a.counts.unknown_fees,1);
});
test('matching is non-destructive, evidence is validated and existing IDs preserved',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const rows=[{institution_name:'Example College',programme_name:'Diploma',evidence_url:'https://example.org',evidence_date:'2026-11-01'}];
 const institutions=[{id:'college',name:'Example College',aliases:['Example College']}];
 const courses=[{id:'old',institution_id:'college',name:'Diploma'}];
 const a=reconcileCandidates(rows,institutions,courses);
 assert.equal(a[0].status,'possible_existing_offering');
 assert.equal(a[0].course_id,'old');
 assert.equal(a[0].review_required,true);
 assert.equal(a[0].evidence_ready,true);
 assert.equal(courses[0].id,'old');
});
test('invalid evidence and ambiguous names are never treated as verified',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const i=[{id:'a',name:'Example College'},{id:'b',name:'Other',aliases:['Example College']}];
 const a=reconcileCandidates([{institution_name:'Example College',programme_name:'Diploma',evidence_url:'http://example.org',evidence_date:'2026-02-30'}],i,[]);
 assert.equal(a[0].status,'ambiguous_institution');
 assert.equal(a[0].evidence_ready,false);
 assert.equal(a[0].review_required,true);
});
