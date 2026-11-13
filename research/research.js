/* Research intelligence: prefer compact generated indicators; fall back to the existing,
 * provenance-classified open-data export. No guessed statistics or external requests. */
(function(){
 const status=document.getElementById('research-status'),results=document.getElementById('research-results');
 const n=v=>typeof v==='number'?new Intl.NumberFormat('en-KE').format(v):'Unavailable';
 const el=(tag,value,parent)=>{const node=document.createElement(tag);node.textContent=String(value);parent.appendChild(node);return node};
 function card(parent,label,value){const box=el('div','',parent);box.className='research-stat';el('strong',n(value),box);el('span',label,box);}
 const feeClasses=['published','derived','illustrative','unpublished','unsourced'];
 function fromExport(exported){
  if(!exported||!Array.isArray(exported.courses))throw Error('Invalid catalogue export');
  const rows=exported.courses,byCounty=Object.create(null),byLevel=Object.create(null),byOwnership=Object.create(null);
  const byBasis=Object.fromEntries(feeClasses.map(k=>[k,0]));
  const institutions=new Set(),names=new Set(),grade={open_entry:0,specified:0,invalid:0};
  const flags={orphan_institution:0,missing_duration:0,unavailable_fee:0,fee_basis_unknown:0};
  const validGrades=new Set(['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E']);
  for(const c of rows){
   if(!c||!c.institution_id||!c.course_id)throw Error('Malformed course export');
   institutions.add(c.institution_id);
   if(c.course_name)names.add(String(c.course_name).trim().toLowerCase());
   const county=c.county||'Unspecified',level=c.level||'Unspecified',ownership=c.ownership||'Unspecified';
   if(!byCounty[county])byCounty[county]={offerings:0,institutions:new Set(),fee_published:0,fee_unavailable:0,open_entry:0};
   const item=byCounty[county];item.offerings++;item.institutions.add(c.institution_id);
   byLevel[level]=(byLevel[level]||0)+1;byOwnership[ownership]=(byOwnership[ownership]||0)+1;
   if(Object.hasOwn(byBasis,c.fee_basis))byBasis[c.fee_basis]++;else flags.fee_basis_unknown++;
   if(c.fee_basis==='published')item.fee_published++;
   if(c.tuition_kes===''||c.tuition_kes==null){flags.unavailable_fee++;item.fee_unavailable++;}
   if(c.duration_months===''||c.duration_months==null)flags.missing_duration++;
   if(c.min_grade===''||c.min_grade==null){grade.open_entry++;item.open_entry++;}
   else if(validGrades.has(c.min_grade))grade.specified++;else grade.invalid++;
  }
  const counties=Object.fromEntries(Object.entries(byCounty).map(([county,x])=>[county,{...x,institutions:x.institutions.size}]));
  const pct=(x,y)=>y?Math.round(x*1000/y)/10:null;
  if(exported.course_count!==rows.length||exported.institution_count!==institutions.size)throw Error('Catalogue export metadata mismatch');
  return {schema_version:1,scope:'Njia catalogue only — not a national census',totals:{catalogue_offerings:rows.length,linked_offerings:rows.length,listed_institutions:institutions.size,institutions_with_offerings:institutions.size,counties_with_offerings:Object.keys(counties).filter(x=>x!=='Unspecified').length,distinct_programme_names:names.size},fees:{by_basis:byBasis,published_share_pct:pct(byBasis.published,rows.length),unavailable_share_pct:pct(flags.unavailable_fee,rows.length)},entry_grade:grade,quality_flags:flags,by_county:counties,by_level:byLevel,by_ownership:byOwnership};
 }
 function validIndicators(d){
  if(!d||d.schema_version!==1||!d.totals||!d.fees||!d.by_county)return false;
  const totals=d.totals,fees=d.fees;
  const nonnegative=v=>Number.isSafeInteger(v)&&v>=0;
  if(!nonnegative(totals.catalogue_offerings)||!nonnegative(totals.linked_offerings)||!nonnegative(totals.institutions_with_offerings)||!nonnegative(totals.counties_with_offerings)||!nonnegative(totals.distinct_programme_names))return false;
  if(totals.linked_offerings>totals.catalogue_offerings||!fees.by_basis)return false;
  for(const key of feeClasses)if(!nonnegative(fees.by_basis[key]))return false;
  if(Object.values(fees.by_basis).reduce((sum,v)=>sum+v,0)>totals.catalogue_offerings)return false;
  if(typeof d.by_county!=='object'||Array.isArray(d.by_county))return false;
  for(const entry of Object.values(d.by_county)){
   if(!entry||!nonnegative(entry.offerings)||!nonnegative(entry.institutions)||entry.institutions>entry.offerings)return false;
  }
  return true;
 }
 async function load(){
  try{
   let d,source;
   try{
    const r=await fetch('./catalogue-indicators.json',{cache:'no-cache'});
    if(!r.ok)throw Error('Compact report missing');
    d=await r.json();
    if(!validIndicators(d))throw Error('Compact report invalid');
    source='precomputed catalogue indicators';
   }catch(_){
    const r=await fetch('../open-data/njia-catalogue.json',{cache:'no-cache'});
    if(!r.ok)throw Error('Open-data export unavailable');
    d=fromExport(await r.json());source='published Njia open-data export';
   }
   if(!validIndicators(d))throw Error('Invalid research indicators');
   const grid=document.getElementById('research-grid');
   card(grid,'Listed course offerings',d.totals.catalogue_offerings);
   card(grid,'Offerings linked to an institution',d.totals.linked_offerings);
   card(grid,'Institutions with offerings',d.totals.institutions_with_offerings);
   card(grid,'Counties represented',d.totals.counties_with_offerings);
   card(grid,'Distinct programme names',d.totals.distinct_programme_names);
   const fees=document.getElementById('fee-grid');
   for(const key of feeClasses)card(fees,key+' fee records',d.fees.by_basis[key]);
   const tbody=document.getElementById('county-rows');
   for(const [county,entry] of Object.entries(d.by_county).sort((a,b)=>b[1].offerings-a[1].offerings||a[0].localeCompare(b[0]))){
    const tr=document.createElement('tr');el('th',county,tr).scope='row';el('td',n(entry.offerings),tr);el('td',n(entry.institutions),tr);tbody.appendChild(tr);
   }
   results.hidden=false;status.textContent='Computed from '+source+'. Statistics describe Njia listings, not national totals.';
  }catch(e){status.textContent='Catalogue statistics are temporarily unavailable. Please consult the open-data export.';}
 }
 load();
})();
