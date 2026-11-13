/** Njia catalogue integrity audit. Read-only; node tools/audit-national-catalogue.mjs */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
export function auditCatalogue(courses,institutions) {
  const inst=new Map(institutions.map(i=>[i.id,i]));
  const ids=new Set(),duplicates=[],orphans=[],badGrades=[],badFees=[],possibleDuplicates=[];
  const keys=new Map(),grades=new Set(['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E']);
  const normalize=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  for(const c of courses){
    if(ids.has(c.id)) duplicates.push(c.id); else ids.add(c.id);
    if(!inst.has(c.institution_id)) orphans.push({id:c.id,institution_id:c.institution_id});
    if(c.min_grade!=null&&!grades.has(c.min_grade)) badGrades.push({id:c.id,grade:c.min_grade});
    if(c.total_fees_kes!=null&&(!Number.isFinite(c.total_fees_kes)||c.total_fees_kes<0))badFees.push(c.id);
    const key=[c.institution_id,normalize(c.name),normalize(c.level)].join('|');
    if(keys.has(key))possibleDuplicates.push({id:c.id,other_id:keys.get(key),reason:'Same institution, name and level; campus/intake not verified'});
    else keys.set(key,c.id);
  }
  const linked=courses.filter(c=>inst.has(c.institution_id));
  const represented=new Set(linked.map(c=>c.institution_id));
  const counties=new Set(linked.map(c=>inst.get(c.institution_id).county).filter(Boolean));
  return {schema_version:1,generated_at:new Date().toISOString(),counts:{courses:courses.length,institutions:represented.size,counties:counties.size,unlinked_institutions:institutions.length-represented.size,unknown_fees:courses.filter(c=>c.total_fees_kes==null).length,zero_fees:courses.filter(c=>c.total_fees_kes===0).length,legacy_open_entry:courses.filter(c=>c.min_grade==null).length},issues:{duplicate_course_ids:duplicates,orphan_institution_references:orphans,invalid_min_grades:badGrades,invalid_fee_amounts:badFees,possible_duplicate_offerings:possibleDuplicates},notes:['Null min_grade means open entry in the legacy schema, not unknown.','Unknown fees are not free.','Potential duplicates require human review; no records are modified.','County coverage describes this catalogue, not the national supply of training.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
  const report=auditCatalogue(COURSES,INSTITUTIONS);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(report.issues.duplicate_course_ids.length||report.issues.orphan_institution_references.length||report.issues.invalid_fee_amounts.length)process.exitCode=1;
}
