const {test}=require('node:test');const assert=require('node:assert/strict');
const lead={institution_name:'Example College',programme_name:'Diploma in Engineering',qualification_level:'Diploma',source_title:'Prospectus',source_publisher:'Example College',evidence_url:'https://example.org/prospectus',evidence_date:'2026-11-01',campus_name:'Main'};
test('audit flags duplicates, orphans and invalid fees',async()=>{
 const {auditCatalogue}=await import('../tools/audit-national-catalogue.mjs');
 const a=auditCatalogue([{id:'a',institution_id:'x',name:'Diploma',min_grade:null,total_fees_kes:null},{id:'a',institution_id:'missing',name:'Diploma',min_grade:'Z',total_fees_kes:-1}],[{id:'x',county:'Nairobi'}]);
 assert.equal(a.issues.duplicate_course_ids.length,1);assert.equal(a.issues.orphan_institution_references.length,1);assert.equal(a.issues.invalid_min_grades.length,1);assert.equal(a.issues.invalid_fee_amounts.length,1);assert.equal(a.counts.legacy_open_entry,1);
});
test('reconciliation preserves IDs but never auto-enriches or publishes',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const a=reconcileCandidates([lead],[{id:'college',name:'Example College'}],[{id:'old',institution_id:'college',name:'Diploma in Engineering',level:'Diploma'}],{today:'2026-11-13'});
 assert.equal(a[0].status,'possible_existing_offering');assert.equal(a[0].course_id,'old');assert.equal(a[0].auto_publish,false);
});
test('repeated aliases of one institution do not create false ambiguity',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const a=reconcileCandidates([lead],[{id:'college',name:'Example College',aliases:['Example College','EXAMPLE COLLEGE']}],[],{today:'2026-11-13'});
 assert.equal(a[0].status,'candidate_new_offering');assert.equal(a[0].institution_id,'college');
});
test('ambiguous institutional names are not silently assigned',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const a=reconcileCandidates([lead],[{id:'a',name:'Example College'},{id:'b',name:'Other',aliases:['Example College']}],[],{today:'2026-11-13'});
 assert.equal(a[0].status,'ambiguous_institution');assert.equal(a[0].institution_id,null);
});
test('bad evidence and future dates prevent reconciliation approval',async()=>{
 const {reconcileCandidates}=await import('../tools/reconcile-national-sources.mjs');
 const a=reconcileCandidates([{...lead,evidence_url:'http://example.org',evidence_date:'2027-01-01'}],[{id:'a',name:'Example College'}],[],{today:'2026-11-13'});
 assert.equal(a[0].status,'needs_evidence');assert.equal(a[0].evidence_ready,false);assert.ok(a[0].validation_errors.length>=2);
});
