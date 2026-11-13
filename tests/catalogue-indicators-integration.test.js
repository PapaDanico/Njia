const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const {createRequire}=require('node:module');const requireLocal=createRequire(path.resolve(__dirname,'../tools/catalogue-indicators.mjs'));
test('real catalogue indicators reconcile against the production fee classifier',async()=>{
 const {summariseCatalogue,FEE_CLASSES}=await import('../tools/catalogue-indicators.mjs');
 const {COURSES}=requireLocal('../data/courses.js'),{INSTITUTIONS}=requireLocal('../data/institutions.js');
 const source=fs.readFileSync(path.resolve(__dirname,'../js/decide.js'),'utf8');
 const begin=source.indexOf('function feeBasis(course)');assert.ok(begin>=0);
 const next=source.indexOf('\nconst FEE_BASIS_BADGE',begin);assert.ok(next>begin);
 const fn=vm.runInNewContext(source.slice(begin,next)+'\nfeeBasis');
 const result=summariseCatalogue(COURSES,INSTITUTIONS,{feeBasis:fn});
 assert.equal(result.totals.catalogue_offerings,COURSES.length);
 assert.equal(result.totals.listed_institutions,INSTITUTIONS.length);
 assert.equal(result.totals.linked_offerings+result.quality_flags.orphan_institution,COURSES.length);
 assert.equal(Object.values(result.fees.by_basis).reduce((a,b)=>a+b,0)+result.quality_flags.fee_basis_unknown,result.totals.linked_offerings);
 assert.deepEqual(Object.keys(result.fees.by_basis),FEE_CLASSES);
 assert.equal(Object.values(result.by_county).reduce((n,c)=>n+c.offerings,0),result.totals.linked_offerings);
 assert.equal(Object.values(result.by_level).reduce((n,c)=>n+c,0),result.totals.linked_offerings);
 assert.equal(result.entry_grade.open_entry+result.entry_grade.specified+result.entry_grade.invalid,result.totals.linked_offerings);
 assert.ok(result.totals.counties_with_offerings<=47);
});
