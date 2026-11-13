/** National source evidence gate. This module never publishes or mutates data. */
export const REVIEW_STATUSES=Object.freeze(['new','needs_evidence','needs_regulator_check','needs_campus_check','ready_for_review','approved','rejected']);
const isoDate=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;};
const httpsUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}};
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
const REGULATORS=Object.freeze(['CUE','TVETA','KUCCPS','KNQA','KCAA','NITA','KMPDC','NCK','PPB','OTHER']);
export function validateResearchLead(lead,{today=new Date().toISOString().slice(0,10)}={}){
 const errors=[],warnings=[];
 if(!lead||typeof lead!=='object'||Array.isArray(lead))return {valid:false,errors:['Lead must be an object'],warnings};
 for(const key of ['institution_name','programme_name','qualification_level','source_title','source_publisher']){
   if(!nonempty(lead[key]))errors.push(key+' is required');
 }
 if(!httpsUrl(lead.evidence_url))errors.push('evidence_url must be a valid HTTPS URL');
 if(!isoDate(lead.evidence_date))errors.push('evidence_date must be a real ISO date');
 else if(isoDate(today)&&lead.evidence_date>today)errors.push('evidence_date cannot be in the future');
 if(lead.regulator!=null&&!REGULATORS.includes(lead.regulator))errors.push('regulator must use a recognised code');
 if(lead.status!=null&&!REVIEW_STATUSES.includes(lead.status))errors.push('unknown review status');
 if(lead.campus_name==null||!nonempty(lead.campus_name))warnings.push('Campus not established; do not advertise campus-specific availability');
 if(lead.regulatory_evidence_url&&!httpsUrl(lead.regulatory_evidence_url))errors.push('regulatory_evidence_url must be HTTPS');
 if(!lead.regulatory_evidence_url)warnings.push('Regulatory evidence not supplied; accreditation must not be shown as verified');
 if(lead.fees_kes!=null&&(!Number.isSafeInteger(lead.fees_kes)||lead.fees_kes<0))errors.push('fees_kes must be a non-negative integer or null');
 if(lead.fees_kes!=null&&!httpsUrl(lead.fee_evidence_url))errors.push('A numerical fee requires a separate HTTPS fee evidence URL');
 if(lead.fee_evidence_url&&!httpsUrl(lead.fee_evidence_url))errors.push('fee_evidence_url must be HTTPS');
 if(lead.fees_kes==null)warnings.push('Fees unpublished or unverified; do not display zero');
 if(lead.minimum_kcse_grade!=null&&!['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E'].includes(lead.minimum_kcse_grade))errors.push('invalid minimum_kcse_grade');
 if(lead.intake_year!=null&&(!Number.isInteger(lead.intake_year)||lead.intake_year<2000||lead.intake_year>2100))errors.push('invalid intake_year');
 return {valid:errors.length===0,errors,warnings};
}
export function reviewQueue(leads,options={}){
 if(!Array.isArray(leads))throw new TypeError('Research leads must be an array');
 const seen=new Set();
 return leads.map((lead,index)=>{
  const check=validateResearchLead(lead,options);
  const key=[lead?.institution_name,lead?.campus_name,lead?.programme_name,lead?.qualification_level,lead?.intake_year].map(x=>String(x??'').toLowerCase().trim()).join('|');
  if(seen.has(key))check.warnings.push('Potential duplicate lead in this batch');
  seen.add(key);
  return {index:index+1,source_id:lead?.source_id||'row-'+(index+1),status:!check.valid?'needs_evidence':!lead?.regulatory_evidence_url?'needs_regulator_check':!lead?.campus_name?'needs_campus_check':'ready_for_review',...check,auto_publish:false};
 });
}
