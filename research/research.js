/* Progressive enhancement: the research page never guesses missing indicators. */
(async function(){
 const status=document.getElementById('research-status'),results=document.getElementById('research-results');
 const n=v=>typeof v==='number'?new Intl.NumberFormat('en-KE').format(v):'Unavailable';
 const el=(tag,text,parent)=>{const node=document.createElement(tag);node.textContent=text;parent.appendChild(node);return node};
 function card(parent,label,value){const box=el('div','',parent);box.className='research-stat';el('strong',n(value),box);el('span',label,box);}
 try{
  const response=await fetch('./catalogue-indicators.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('Report unavailable');
  const d=await response.json();if(d.schema_version!==1||!d.totals||!d.fees||!d.by_county)throw new Error('Invalid report');
  const grid=document.getElementById('research-grid');
  card(grid,'Listed course offerings',d.totals.catalogue_offerings);
  card(grid,'Offerings linked to an institution',d.totals.linked_offerings);
  card(grid,'Institutions with offerings',d.totals.institutions_with_offerings);
  card(grid,'Counties represented',d.totals.counties_with_offerings);
  card(grid,'Distinct programme names',d.totals.distinct_programme_names);
  const fees=document.getElementById('fee-grid');
  for(const [key,value] of Object.entries(d.fees.by_basis))card(fees,key.replace(/_/g,' ')+' fee records',value);
  const tbody=document.getElementById('county-rows');
  for(const [county,entry] of Object.entries(d.by_county).sort((a,b)=>b[1].offerings-a[1].offerings||a[0].localeCompare(b[0]))){
   const tr=document.createElement('tr');el('th',county,tr).scope='row';el('td',n(entry.offerings),tr);el('td',n(entry.institutions),tr);tbody.appendChild(tr);
  }
  results.hidden=false;status.textContent='Statistics computed from the Njia catalogue. All counts are catalogue-specific.';
 }catch(e){status.textContent='Catalogue statistics are temporarily unavailable. Please use the open-data export or try again later.';}
})();
