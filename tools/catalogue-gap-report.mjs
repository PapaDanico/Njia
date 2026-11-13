/** Read-only catalogue gap report; never edits canonical data. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const csvCell=v=>{const s=String(v??'');return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
export function buildGapReport(courses,institutions){
 if(!Array.isArray(courses)||!Array.isArray(institutions))throw new TypeError('Expected arrays');
 const byId=new Map(institutions.map(i=>[i.id,i]));
 const rows=courses.map(c=>{
  const inst=byId.get(c.institution_id),flags=[];
  if(!inst)flags.push('orphan_institution');
  if(c.total_fees_kes==null)flags.push('fee_unavailable');
  if(c.duration_months==null)flags.push('duration_unavailable');
  if(!String(c.verification_note??'').trim())flags.push('verification_note_missing');
  if(c.total_fees_kes!=null&&(!Number.isFinite(c.total_fees_kes)||c.total_fees_kes<0))flags.push('invalid_fee');
  const severity=flags.includes('orphan_institution')||flags.includes('invalid_fee')?'critical':flags.includes('verification_note_missing')?'high':flags.length?'review':'ok';
  return {course_id:c.id,institution_id:c.institution_id,institution_name:inst?.name||'',county:inst?.county||'',course_name:c.name,level:c.level||'',severity,flags:flags.join(';'),fee_state:c.total_fees_kes==null?'unavailable':c.total_fees_kes===0?'zero':'amount',duration_state:c.duration_months==null?'unavailable':'provided'};
 });
 const rank={critical:0,high:1,review:2,ok:3};
 rows.sort((a,b)=>rank[a.severity]-rank[b.severity]||String(a.county).localeCompare(String(b.county))||String(a.course_id).localeCompare(String(b.course_id)));
 const byCounty={},byFlag={},bySeverity={critical:0,high:0,review:0,ok:0};
 for(const row of rows){
  const county=row.county||'(unlinked)',item=byCounty[county]??={courses:0,fee_unavailable:0,duration_unavailable:0,review_required:0};
  item.courses++;if(row.flags.includes('fee_unavailable'))item.fee_unavailable++;if(row.flags.includes('duration_unavailable'))item.duration_unavailable++;if(row.severity!=='ok')item.review_required++;bySeverity[row.severity]++;
  for(const flag of row.flags.split(';').filter(Boolean))byFlag[flag]=(byFlag[flag]||0)+1;
 }
 return {schema_version:1,counts:{courses:rows.length,institutions:institutions.length,counties_with_offerings:Object.keys(byCounty).filter(x=>x!=='(unlinked)').length},bySeverity,byFlag,byCounty,rows,notes:['County coverage describes this catalogue, not all Kenyan training provision.','Unavailable fees do not mean free.','Null min_grade means open entry under Njia legacy rules.','Missing verification notes require review, not automatic deletion.']};
}
export function reportCSV(report){const columns=['course_id','institution_id','institution_name','county','course_name','level','severity','flags','fee_state','duration_state'];return [columns.join(','),...report.rows.map(r=>columns.map(k=>csvCell(r[k])).join(','))].join('\n')+'\n';}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
 const report=buildGapReport(COURSES,INSTITUTIONS),args=process.argv.slice(2);
 const output=args.includes('--csv')?reportCSV(report):JSON.stringify(report,null,2)+'\n';
 const out=args.indexOf('--out');if(out>=0){if(!args[out+1])throw Error('--out needs a filename');fs.writeFileSync(args[out+1],output);}else process.stdout.write(output);
}
