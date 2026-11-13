/** Validate a JSON batch before manual catalogue reconciliation. */
import fs from 'node:fs';
import {reviewQueue} from './national-source-validation.mjs';
const filename=process.argv[2];
if(!filename)throw new Error('Usage: node tools/check-national-sources.mjs staged-leads.json');
const rows=JSON.parse(fs.readFileSync(filename,'utf8'));
const review=reviewQueue(rows);
process.stdout.write(JSON.stringify({mode:'review_only',total:review.length,invalid:review.filter(x=>!x.valid).length,ready_for_review:review.filter(x=>x.status==='ready_for_review').length,records:review},null,2)+'\n');
if(review.some(x=>!x.valid))process.exitCode=1;
