const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const js=fs.readFileSync(path.join(__dirname,'../research/research.js'),'utf8');
function dom(){const nodes={};function node(){return {textContent:'',hidden:true,children:[],appendChild(x){this.children.push(x);},set scope(x){this._scope=x;}};}return {nodes,document:{getElementById(id){return nodes[id]??=node();},createElement(){return node();}}};}
const exported={course_count:1,institution_count:1,courses:[{course_id:'a',course_name:'Diploma A',institution_id:'i1',county:'Nairobi',level:'diploma',ownership:'public',fee_basis:'published',tuition_kes:20000,min_grade:'C',duration_months:24}]};
async function run(compact){const {nodes,document}=dom();const urls=[];const context={document,Intl,Set,Map,Object,Error,Number,fetch:async url=>{urls.push(url);return {ok:true,json:async()=>url.includes('catalogue-indicators')?compact:exported};}};vm.runInNewContext(js,context);await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));return {nodes,urls};}
test('invalid compact indicator report falls back to canonical export',async()=>{
 const {nodes,urls}=await run({schema_version:1,totals:{catalogue_offerings:-5},fees:{by_basis:{}},by_county:{}});
 assert.equal(urls.length,2);assert.equal(nodes['research-results'].hidden,false);
 assert.match(nodes['research-status'].textContent,/published Njia open-data export/);
});
test('malformed county metrics cannot be presented as verified research',async()=>{
 const {nodes,urls}=await run({schema_version:1,totals:{catalogue_offerings:1,linked_offerings:1,institutions_with_offerings:1,counties_with_offerings:1,distinct_programme_names:1},fees:{by_basis:{published:1,derived:0,illustrative:0,unpublished:0,unsourced:0}},by_county:{Nairobi:{offerings:0,institutions:3}}});
 assert.equal(urls.length,2);assert.match(nodes['research-status'].textContent,/published Njia open-data export/);
});
