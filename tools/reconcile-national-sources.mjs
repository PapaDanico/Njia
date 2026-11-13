/** Review-only matching of official research leads; never edits canonical catalogue. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateResearchLead} from './national-source-validation.mjs';
const require=createRequire(import.meta.url);
const clean=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function reconcileCandidates(rows,institutions,courses,{today=new Date().toISOString().slice(0,10)}={}){
 if(!Array.isArray(rows)||!Array.isArray(institutions)||!Array.isArray(courses))throw new TypeError('Expected research, institution and course arrays');
 const names=new Map();
 for(const i of institutions){
  const aliases=new Set([i.name,...(Array.isArray(i.aliases)?i.aliases:[])].map(clean).filter(Boolean));
  for(const k of aliases){if(!names.has(k))names.set(k,new Map());names.get(k).set(i.id,i);}
 }
 return rows.map((r,index)=>{
  const matches=[...(names.get(clean(r?.institution_name))||new Map()).values()];
  const validation=validateResearchLead(r,{today});
  const evidence_ready=validation.valid;
  const inst=matches.length===1?matches[0]:null;
  const exact=inst?courses.filter(c=>c.institution_id===inst.id&&clean(c.name)===clean(r?.programme_name)):[];
  const level=clean(r?.qualification_level);
  const narrowed=level?exact.filter(c=>clean(c.level)===level):exact;
  const candidates=level?narrowed:exact;
  let status;
  if(!evidence_ready)status='needs_evidence';
  else if(matches.length>1)status='ambiguous_institution';
  else if(matches.length===0)status='new_institution';
  else if(candidates.length>1)status='ambiguous_offering';
  else if(candidates.length===1&&level&&clean(candidates[0].level)===level)status='possible_existing_offering';
  else if(candidates.length===1)status='possible_existing_offering';
  else status='candidate_new_offering';
  return {source_id:r?.source_id||'row-'+(index+1),status,evidence_ready,institution_id:inst?.id||null,course_id:candidates.length===1?candidates[0].id:null,campus:r?.campus_name||null,qualification_level:r?.qualification_level||null,programme_code:r?.programme_code||null,evidence_url:r?.evidence_url||null,validation_errors:validation.errors,validation_warnings:validation.warnings,review_required:true,auto_publish:false,warning:'Name and qualification matching do not prove campus, intake, programme accreditation or current offering'};
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const filename=process.argv[2];if(!filename)throw Error('Usage: node tools/reconcile-national-sources.mjs staged.json');
 const rows=JSON.parse(fs.readFileSync(filename,'utf8'));
 const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
 process.stdout.write(JSON.stringify({mode:'review_only',records:reconcileCandidates(rows,INSTITUTIONS,COURSES)},null,2)+'\n');
}
