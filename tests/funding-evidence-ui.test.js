const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('funding recommendations distinguish reviewed sources from illustrative awards',()=>{
 const src=fs.readFileSync(path.join(root,'js/decide.js'),'utf8');
 const start=src.indexOf('function renderFundingCard(');assert.ok(start>=0);const card=src.slice(start);
 for(const phrase of ['Funding evidence','Source reviewed','Details require verification','Award:</strong> Not guaranteed','Preliminary grade screen only','research/sources/'])assert.ok(card.includes(phrase),phrase);
 assert.match(card,/isVerified \? 'Source reviewed'/);
 assert.match(card,/gradeUnconfirmed \?/);
});
test('funding advisory uses accessible textual states and scoped CSS',()=>{
 const css=fs.readFileSync(path.join(root,'css/decide-evidence.css'),'utf8');
 assert.match(css,/\.njia-funding-evidence/);assert.match(css,/\.njia-funding-evidence__estimate/);
});
