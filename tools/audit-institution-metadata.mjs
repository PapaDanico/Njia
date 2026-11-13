/** R8: read-only institution inventory and source-verification queue. */
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const normalized=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const tally=(items,field)=>Object.fromEntries([...items.reduce((m,item)=>m.set(item[field]||'Unspecified',(m.get(item[field]||'Unspecified')||0)+1),new Map()).entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])));
export function inventoryInstitutions(institutions,courses=[]){
 if(!Array.isArray(institutions)||!Array.isArray(courses))throw new TypeError('Expected institution and course arrays');
 const ids=new Map(),names=new Map(),issues={duplicate_institution_ids:[],duplicate_institution_names:[],orphan_course_references:[],missing_websites:[],non_institutional_websites:[],ambiguous_accreditation:[],campus_review_candidates:[]};
 const nonInstitutional=/(^|\.)(?:tveta\.go\.ke|cue\.or\.ke|kuccps\.net|tsc\.go\.ke|knec\.ac\.ke)(?:\/|$)/i;
 for(const i of institutions){
  if(!i||!i.id||!i.name)throw new TypeError('Institution record missing ID or name');
  if(ids.has(i.id))issues.duplicate_institution_ids.push({id:i.id,other:ids.get(i.id)});else ids.set(i.id,i.name);
  const name=normalized(i.name);if(names.has(name))issues.duplicate_institution_names.push({id:i.id,other_id:names.get(name)});else names.set(name,i.id);
  if(!i.website)issues.missing_websites.push(i.id);
  else {let host;try{host=new URL(i.website).hostname.toLowerCase()}catch{host='invalid'};if(host==='invalid'||nonInstitutional.test(host))issues.non_institutional_websites.push({id:i.id,website:i.website,reason:host==='invalid'?'Invalid URL':'Regulator or placement domain, not institutional website'});}
  if(/not yet confirmed|not confirmed|unverified|reported|interim authority/i.test(i.accreditation||''))issues.ambiguous_accreditation.push({id:i.id,accreditation:i.accreditation});
  if(/\bcampus\b|\bbranch\b/i.test(i.name))issues.campus_review_candidates.push({id:i.id,name:i.name});
 }
 for(const c of courses)if(!ids.has(c.institution_id))issues.orphan_course_references.push({course_id:c.id,institution_id:c.institution_id});
 const byCounty=tally(institutions,'county');
 const websiteCount=institutions.length-issues.missing_websites.length;
 return {schema_version:1,scope:'Njia institution listings, not a regulator register',counts:{institution_records:institutions.length,linked_institution_records:new Set(courses.map(c=>c.institution_id).filter(id=>ids.has(id))).size,course_records:courses.length,counties:Object.keys(byCounty).filter(x=>x!=='Unspecified').length,websites_listed:websiteCount},by_type:tally(institutions,'type'),by_ownership:tally(institutions,'ownership'),by_county:byCounty,issues,notes:['Accreditation text and listed websites have not been verified by this inventory.','A campus-name candidate is not proof of a distinct registered campus.','Boolean facility flags and programme approvals require claim-level source evidence.']};
}
export function validateInstitutionEvidence(records,institutions,courses=[]){
 const ids=new Set(institutions.map(i=>i.id)),courseIds=new Set(courses.map(c=>c.id)),seen=new Set(),errors=[];
 const allowed=new Set(['unverified','verified','conflicting','unreachable']);
 if(!Array.isArray(records))return ['Evidence overlay must be an array'];
 for(const [index,r] of records.entries()){
  if(!r||!ids.has(r.institution_id)){errors.push(`row ${index}: unknown institution_id`);continue;}
  if(!r.claim_type||!r.claim_scope||!allowed.has(r.status))errors.push(`row ${index}: missing claim type, scope or valid status`);
  const key=[r.institution_id,r.campus_id||'',r.course_id||'',r.claim_type,r.claim_scope].join('|');
  if(seen.has(key))errors.push(`row ${index}: duplicate claim key`);seen.add(key);
  if(r.course_id!=null&&!courseIds.has(r.course_id))errors.push(`row ${index}: unknown course_id`);
  if(r.status==='verified'){
   if(!r.source||!r.source.issuer||!r.source.title||!r.source.url||!r.source.checked_at)errors.push(`row ${index}: verified claim lacks source provenance`);
   else {try{if(new URL(r.source.url).protocol!=='https:')throw Error('not https')}catch{errors.push(`row ${index}: invalid verified source URL`)}}
   if(!r.observed_claim)errors.push(`row ${index}: verified claim lacks observed claim`);
  }
 }
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {INSTITUTIONS}=require('../data/institutions.js'),{COURSES}=require('../data/courses.js');
 const report=inventoryInstitutions(INSTITUTIONS,COURSES);
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
 if(report.issues.duplicate_institution_ids.length||report.issues.orphan_course_references.length)process.exitCode=1;
}
