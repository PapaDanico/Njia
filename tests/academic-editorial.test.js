const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('academic editorial layer remains original, local and opt-in',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../css/academic-editorial.css'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(css,/\.njia-academic__heading/);
 assert.match(css,/:focus-visible/);assert.match(css,/min-height:44px/);
 assert.doesNotMatch(css,/@import|url\(https?:/);
 assert.ok(!html.includes('css/academic-editorial.css'));
});
