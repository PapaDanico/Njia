const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('research page is linked from the main accessible resources section',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/<a href="\.\/research\/">Explore catalogue evidence/);
 assert.ok(fs.existsSync(path.join(root,'research','index.html')));
});
test('research page uses escaped DOM text and clearly states catalogue scope',()=>{
 const html=fs.readFileSync(path.join(root,'research','index.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'research','research.js'),'utf8');
 assert.match(html,/not every institution or course in Kenya/);
 assert.match(js,/node\.textContent=String\(value\)/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
test('research page indicators are generated rather than hardcoded',()=>{
 const src=fs.readFileSync(path.join(root,'tools','catalogue-indicators.mjs'),'utf8');
 assert.match(src,/summariseCatalogue\(COURSES,INSTITUTIONS,\{feeBasis\}\)/);
 assert.match(src,/--out/);
});
