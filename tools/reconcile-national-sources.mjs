/** Dry-run reconciliation of official research leads. No catalogue writes. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const clean=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function reconcileCandidates(rows,institutions,courses){
  if(!Array.isArray(rows))throw Error('Input must be a JSON array');
  const names=new Map();
  for(const i of institutions)for(const n of [i.name,...(i.aliases||[])]){const k=clean(n);names.set(k,[...(names.get(k)||[]),i]);}
  return rows.map((r,index)=>{
    const matches=names.get(clean(r.institution_name))||[];
    const evidence_ready=Boolean(r.evidence_url&&/^https:\/\//.test(r.evidence_url)&&/^\d{4}-\d{2}-\d{2}$/.test(r.evidence_date||''));
    const candidates=matches.length===1?courses.filter(c=>c.institution_id===matches[0].id&&clean(c.name)===clean(r.programme_name)):[];
    let status=matches.length>1?'ambiguous_institution':matches.length===0?'new_institution':candidates.length>1?'ambiguous_offering':candidates.length===1?'enrich_existing':'candidate_new_offering';
    return {source_id:r.source_id||'row-'+(index+1),status,evidence_ready,institution_id:matches.length===1?matches[0].id:null,course_id:candidates.length===1?candidates[0].id:null,campus:r.campus_name||null,qualification_level:r.qualification_level||null,programme_code:r.programme_code||null,evidence_url:r.evidence_url||null,review_required:true,warning:'Exact name matching does not establish campus, qualification, regulator approval or intake equivalence'};
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const filename=process.argv[2];if(!filename)throw Error('Usage: node tools/reconcile-national-sources.mjs staged.json');
  const rows=JSON.parse(fs.readFileSync(filename,'utf8'));
  const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
  process.stdout.write(JSON.stringify({mode:'review_only',records:reconcileCandidates(rows,INSTITUTIONS,COURSES)},null,2)+'\n');
}
