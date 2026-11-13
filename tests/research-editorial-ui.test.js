const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'research/index.html'),'utf8');const css=fs.readFileSync(path.join(root,'research/research.css'),'utf8');
test('research editorial page has semantic navigation, accessible skip and four evidence sections',()=>{
 assert.match(html,/href="#research-main"/);assert.match(html,/<main id="research-main">/);
 for(const id of ['research-grid','fee-grid','county-rows','research-status','research-results'])assert.match(html,new RegExp('id="'+id+'"'));
 for(const section of ['overview-title','fees-title','county-title','method-title'])assert.match(html,new RegExp('aria-labelledby="'+section+'"'));
 assert.match(html,/not every institution or course in Kenya/);
 assert.match(html,/Review official Kenyan education sources and verification rules/);
});
test('research editorial CSS is responsive, motion-sensitive and preserves focus visibility',()=>{
 assert.match(html,/href="\.\/research\.css"/);assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(html,/class="research-skip"/);
 assert.doesNotMatch(html,/<script[^>]*src="https?:/);
});
