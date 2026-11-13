const {test}=require('node:test');const assert=require('node:assert/strict');
test('indicators have correct denominators and preserve missing-fee semantics',async()=>{
 const {summariseCatalogue}=await import('../tools/catalogue-indicators.mjs');
 const courses=[{id:'1',institution_id:'a',name:'Nursing',level:'Diploma',min_grade:null,total_fees_kes:null,duration_months:null},{id:'2',institution_id:'a',name:'Nursing',level:'Diploma',min_grade:'C',total_fees_kes:20000,duration_months:12},{id:'3',institution_id:'missing',name:'Unknown'}];
 const institutions=[{id:'a',county:'Nairobi',ownership:'public'},{id:'b',county:'Nakuru',ownership:'private'}];
 const r=summariseCatalogue(courses,institutions,{feeBasis:c=>c.total_fees_kes==null?'unpublished':'published'});
 assert.equal(r.totals.catalogue_offerings,3);assert.equal(r.totals.linked_offerings,2);assert.equal(r.totals.institutions_with_offerings,1);assert.equal(r.totals.distinct_programme_names,1);
 assert.equal(r.fees.published_share_pct,50);assert.equal(r.fees.unavailable_share_pct,50);
 assert.equal(r.entry_grade.open_entry,1);assert.equal(r.quality_flags.orphan_institution,1);
 assert.equal(r.by_county.Nairobi.institutions,1);assert.equal(r.by_county.Nairobi.offerings,2);
});
test('empty catalogue yields null percentages rather than false zero',async()=>{
 const {summariseCatalogue}=await import('../tools/catalogue-indicators.mjs');
 const r=summariseCatalogue([],[],{feeBasis:()=>{throw Error('should not run')}});
 assert.equal(r.fees.published_share_pct,null);assert.equal(r.totals.linked_offerings,0);
});
test('fee basis function is required to match app logic',async()=>{
 const {summariseCatalogue}=await import('../tools/catalogue-indicators.mjs');
 assert.throws(()=>summariseCatalogue([],[]),/feeBasis/);
});
