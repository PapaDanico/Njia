const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('official research register uses primary HTTPS sources with explicit editorial boundaries',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,'research','sources.json'),'utf8'));
 assert.equal(data.schema_version,1);assert.ok(data.sources.length>=6);
 const keys=new Set();
 for(const s of data.sources){assert.ok(!keys.has(s.key));keys.add(s.key);assert.match(s.url,/^https:\/\//);assert.match(s.accessed,/^\d{4}-\d{2}-\d{2}$/);assert.ok(s.claim.length>30);assert.ok(s.action.length>30);}
});
test('official source links are available without JavaScript',()=>{
 const html=fs.readFileSync(path.join(root,'research','sources','index.html'),'utf8');
 assert.match(html,/KUCCPS/);assert.match(html,/Universities Fund/);assert.match(html,/TVETA/);assert.match(html,/not a live admissions service/);
});
