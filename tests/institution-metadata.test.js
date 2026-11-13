const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('R8 inventory counts categories and flags ambiguous or missing institution metadata',async()=>{
 const {inventoryInstitutions}=await import('../tools/audit-institution-metadata.mjs');
 const r=inventoryInstitutions([{id:'a',name:'College A',type:'tvet',ownership:'public',county:'Nairobi',website:'https://tveta.go.ke',accreditation:'Not confirmed'},{id:'b',name:'College B — Campus',type:'college',ownership:'private',county:'Kiambu'}],[{id:'c',institution_id:'a'},{id:'d',institution_id:'absent'}]);
 assert.equal(r.counts.institution_records,2);assert.equal(r.counts.linked_institution_records,1);assert.equal(r.counts.counties,2);
 assert.deepEqual(r.by_type,{tvet:1,college:1});assert.equal(r.issues.orphan_course_references.length,1);
 assert.deepEqual(r.issues.missing_websites,['b']);assert.equal(r.issues.non_institutional_websites.length,1);
 assert.equal(r.issues.ambiguous_accreditation.length,1);assert.equal(r.issues.campus_review_candidates.length,1);
});
test('R8 evidence cannot be verified without source and exact claim',async()=>{
 const {validateInstitutionEvidence}=await import('../tools/audit-institution-metadata.mjs');
 const institutions=[{id:'a'}],courses=[{id:'course'}];
 assert.ok(validateInstitutionEvidence([{institution_id:'a',claim_type:'status',claim_scope:'campus',status:'verified',source:null}],institutions,courses).length);
 assert.deepEqual(validateInstitutionEvidence([{institution_id:'a',claim_type:'status',claim_scope:'campus',status:'unverified',source:null}],institutions,courses),[]);
 assert.ok(validateInstitutionEvidence([{institution_id:'a',course_id:'not-a-course',claim_type:'approval',claim_scope:'course',status:'unverified'}],institutions,courses).length);
});
test('R8 overlay contains no falsely verified claims and refers to real institutions',async()=>{
 const {validateInstitutionEvidence}=await import('../tools/audit-institution-metadata.mjs');
 const {INSTITUTIONS}=require('../data/institutions.js'),{COURSES}=require('../data/courses.js');
 const d=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/research/institution-evidence.json'),'utf8'));
 assert.equal(d.schema_version,1);assert.deepEqual(validateInstitutionEvidence(d.claims,INSTITUTIONS,COURSES),[]);
 assert.ok(d.claims.every(x=>x.status!=='verified'));
});

test('R8 rejects cross-institution programme approvals and duplicate claim keys',async()=>{
 const {validateInstitutionEvidence}=await import('../tools/audit-institution-metadata.mjs');
 const institutions=[{id:'a'},{id:'b'}],courses=[{id:'c',institution_id:'b'}];
 const claim={institution_id:'a',course_id:'c',claim_type:'programme_approval',claim_scope:'specific programme',status:'unverified'};
 assert.match(validateInstitutionEvidence([claim],institutions,courses).join(' '),/different institution/);
 assert.match(validateInstitutionEvidence([claim,claim],institutions,courses).join(' '),/duplicate claim key/);
});
test('R8 rejects invalid checked_at for purported verified evidence',async()=>{
 const {validateInstitutionEvidence}=await import('../tools/audit-institution-metadata.mjs');
 const claim={institution_id:'a',claim_type:'legal_status',claim_scope:'institution',status:'verified',observed_claim:'Current',source:{issuer:'Regulator',title:'Register',url:'https://example.org/register',checked_at:'yesterday'}};
 assert.match(validateInstitutionEvidence([claim],[{id:'a'}]).join(' '),/YYYY-MM-DD/);
});

test('R8 accepts a fully sourced verified claim with a valid date, and rejects a malformed one',async()=>{
 const {validateInstitutionEvidence}=await import('../tools/audit-institution-metadata.mjs');
 const claim=(d)=>({institution_id:'a',claim_type:'legal_status',claim_scope:'institution',status:'verified',observed_claim:'Current',source:{issuer:'Regulator',title:'Register',url:'https://example.org/register',checked_at:d}});
 assert.deepEqual(validateInstitutionEvidence([claim('2026-11-13')],[{id:'a'}]),[],'a valid YYYY-MM-DD date must pass');
 assert.match(validateInstitutionEvidence([claim('13/11/2026')],[{id:'a'}]).join(' '),/YYYY-MM-DD/);
});
