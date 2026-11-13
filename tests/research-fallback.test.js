const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
test('research dashboard works without optional compact report using canonical open-data export',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../research/research.js'),'utf8');
 const exportData={course_count:2,institution_count:2,courses:[{course_id:'a',course_name:'Diploma A',institution_id:'i1',county:'Nairobi',level:'diploma',ownership:'public',fee_basis:'published',tuition_kes:20000,min_grade:'C',duration_months:24},{course_id:'b',course_name:'Diploma A',institution_id:'i2',county:'Kisumu',level:'diploma',ownership:'private',fee_basis:'unpublished',tuition_kes:'',min_grade:'',duration_months:''}]};
 const nodes={};function node(){return {textContent:'',hidden:true,children:[],appendChild(x){this.children.push(x);},set scope(x){this._scope=x;}};}
 const context={document:{getElementById(id){return nodes[id]??=node();},createElement(){return node();}},Intl,Set,Map,Object,Error,fetch:async(url)=>({ok:!url.includes('catalogue-indicators.json'),json:async()=>exportData})};
 vm.runInNewContext(js,context);
 return new Promise(resolve=>setImmediate(resolve)).then(()=>new Promise(resolve=>setImmediate(resolve))).then(()=>{
  assert.equal(nodes['research-results'].hidden,false);
  assert.match(nodes['research-status'].textContent,/published Njia open-data export/);
  assert.equal(nodes['research-grid'].children[0].children[0].textContent,'2');
  assert.equal(nodes['county-rows'].children.length,2);
 });
});
