/** Njia research-grade catalogue indicators. Read-only, source-bound, no national extrapolation. */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
export const FEE_CLASSES=['published','derived','illustrative','unpublished','unsourced'];
export function summariseCatalogue(courses,institutions,{feeBasis}={}){
 if(!Array.isArray(courses)||!Array.isArray(institutions))throw new TypeError('Expected catalogue arrays');
 if(typeof feeBasis!=='function')throw new TypeError('Pass the application feeBasis function to prevent classification drift');
 const byId=new Map(institutions.map(i=>[i.id,i]));
 const valid=courses.filter(c=>byId.has(c.institution_id));
 const byCounty={},byLevel={},byOwnership={},byFeeBasis=Object.fromEntries(FEE_CLASSES.map(k=>[k,0]));
 const grade={open_entry:0,specified:0,invalid:0};
 const flags={orphan_institution:courses.length-valid.length,missing_duration:0,unavailable_fee:0,fee_basis_unknown:0};
 const grades=new Set(['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E']);
 const usedInstitutions=new Set();
 for(const c of valid){
  const i=byId.get(c.institution_id);usedInstitutions.add(i.id);
  const county=i.county||'Unspecified';
  const item=byCounty[county]??={offerings:0,institutions:new Set(),fee_published:0,fee_unavailable:0,open_entry:0};
  item.offerings++;item.institutions.add(i.id);
  byLevel[c.level||'Unspecified']=(byLevel[c.level||'Unspecified']||0)+1;
  byOwnership[i.ownership||'Unspecified']=(byOwnership[i.ownership||'Unspecified']||0)+1;
  const fee=feeBasis(c);
  if(Object.hasOwn(byFeeBasis,fee))byFeeBasis[fee]++;else flags.fee_basis_unknown++;
  if(fee==='published')item.fee_published++;
  if(c.total_fees_kes==null){flags.unavailable_fee++;item.fee_unavailable++;}
  if(c.duration_months==null)flags.missing_duration++;
  if(c.min_grade==null){grade.open_entry++;item.open_entry++;}
  else if(grades.has(c.min_grade))grade.specified++;else grade.invalid++;
 }
 const countyStats=Object.fromEntries(Object.entries(byCounty).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,{...v,institutions:v.institutions.size}]));
 const distinctProgrammes=new Set(valid.map(c=>String(c.name||'').trim().toLowerCase()).filter(Boolean)).size;
 const pct=(n,d)=>d?Math.round(n*1000/d)/10:null;
 return {
  schema_version:1,
  scope:'Njia catalogue only — not a census of Kenyan education institutions or courses',
  denominator:'Valid course offerings with a matching institution ID',
  totals:{catalogue_offerings:courses.length,linked_offerings:valid.length,listed_institutions:institutions.length,institutions_with_offerings:usedInstitutions.size,counties_with_offerings:Object.keys(byCounty).filter(k=>k!=='Unspecified').length,distinct_programme_names:distinctProgrammes},
  fees:{by_basis:byFeeBasis,published_share_pct:pct(byFeeBasis.published,valid.length),unavailable_share_pct:pct(flags.unavailable_fee,valid.length)},
  entry_grade:grade,quality_flags:flags,
  by_county:countyStats,by_level:byLevel,by_ownership:byOwnership,
  notes:['Course offerings are not distinct programmes; identical names at different institutions are separate offerings.','Distinct programme names are a normalised label count, not an accreditation-equivalent programme taxonomy.','Published fee share is the share of catalogue offerings, not the share of institutions or all courses in Kenya.','Unpublished and missing fees are not zero-cost programmes.','A null KCSE minimum grade is open entry under Njia existing semantics; it does not imply guaranteed admission.','No employment, placement, salary or admission outcome rate is inferred.']
 };
}
function extractFn(source,name){
 const at=source.indexOf('function '+name+'(');if(at<0)throw Error(name+' missing');
 let depth=0;for(let i=source.indexOf('{',at);i<source.length;i++){if(source[i]==='{')depth++;else if(source[i]==='}'&&!--depth)return source.slice(at,i+1);}
 throw Error('Unbalanced '+name);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
 const app=fs.readFileSync(new URL('../js/decide.js',import.meta.url),'utf8');
 const feeBasis=vm.runInNewContext(extractFn(app,'feeBasis')+';feeBasis');
 const result=summariseCatalogue(COURSES,INSTITUTIONS,{feeBasis});
 const args=process.argv.slice(2),idx=args.indexOf('--out');
 if(idx>=0){if(!args[idx+1])throw Error('--out requires a path');fs.writeFileSync(args[idx+1],JSON.stringify(result,null,2)+'\n');}
 else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
