const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('premium primitives are opt-in and contain no external resources',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../css/advisory-components.css'),'utf8');
 assert.match(css,/\.njia-brief\s*\{/);assert.match(css,/\.njia-evidence-card\s*\{/);
 assert.doesNotMatch(css,/@import|url\(https?:|!important(?!;)/);
 assert.match(css,/:focus-visible/);assert.match(css,/prefers-reduced-motion/);
});
test('premium design layer is not injected into production without visual review',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(!html.includes('css/advisory-components.css'));
});
