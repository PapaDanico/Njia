/** Read-only matching of source leads against Njia's existing catalogue.
 * An exact programme title is not proof of the same campus, level or intake.
 */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const clean=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const validDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;};
const validSource=s=>{try{const u=new URL(s);return u.protocol==='https:'&&Boolean(u.hostname)&&!u.username&&!u.password;}catch{return false;}};
export function reconcileCandidates(rows,institutions,courses){
  if(!Array.isArray(rows))throw Error('Input must be a JSON array');
  const names=new Map();
  for(const i of institutions)for(const n of [i.name,...(i.aliases||[])]){
    const k=clean(n);if(!k)continue;
    const set=names.get(k)||new Map();set.set(i.id,i);names.set(k,set);
  }
  return rows.map((r,index)=>{
    if(!r||typeof r!=='object')return {source_id:'row-'+(index+1),status:'invalid_input',review_required:true,evidence_ready:false};
    const matches=[...(names.get(clean(r.institution_name))||new Map()).values()];
    const evidence_ready=validSource(r.evidence_url)&&validDate(r.evidence_date);
    const byName=matches.length===1?courses.filter(c=>c.institution_id===matches[0].id&&clean(c.name)===clean(r.programme_name)):[];
    // Only narrow when the catalogue actually carries a comparable value.
    // Never assume missing level/campus data confirms equivalence.
    const byLevel=r.qualification_level?byName.filter(c=>!c.level||clean(c.level)===clean(r.qualification_level)):byName;
    const candidates=byLevel;
    const status=!clean(r.institution_name)||!clean(r.programme_name)?'invalid_input':
      matches.length>1?'ambiguous_institution':matches.length===0?'new_institution':
      candidates.length>1?'ambiguous_offering':candidates.length===1?'possible_existing_offering':'candidate_new_offering';
    return {source_id:r.source_id||'row-'+(index+1),status,evidence_ready,
      institution_id:matches.length===1?matches[0].id:null,
      course_id:candidates.length===1?candidates[0].id:null,
      campus:r.campus_name||null,qualification_level:r.qualification_level||null,
      programme_code:r.programme_code||null,evidence_url:r.evidence_url||null,
      review_required:true,
      warning:'Name matches do not verify campus, qualification, regulator approval, intake, or fee equivalence.'};
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const filename=process.argv[2];if(!filename)throw Error('Usage: node tools/reconcile-national-sources.mjs staged.json');
  const rows=JSON.parse(fs.readFileSync(filename,'utf8'));
  const {COURSES}=require('../data/courses.js'),{INSTITUTIONS}=require('../data/institutions.js');
  process.stdout.write(JSON.stringify({mode:'review_only',records:reconcileCandidates(rows,INSTITUTIONS,COURSES)},null,2)+'\n');
}
