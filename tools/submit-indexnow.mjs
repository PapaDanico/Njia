/* Njia — tell the search engines that will listen without an account.
 *
 * WHY THIS EXISTS, AND WHAT IT IS NOT.
 *
 * Getting indexed has one step that genuinely needs the maintainer: submitting
 * the sitemap to Google Search Console, which needs a Google account, a browser
 * and a verified property. This environment has none of those — every external
 * host is egress-blocked, and the proxy answers 403 to a CONNECT for
 * google.com. That step stays a person's job and this script does not pretend
 * otherwise.
 *
 * IndexNow is the part that does not. It is an open protocol with no account,
 * no OAuth and no dashboard: host a key file at the domain root, POST a list of
 * URLs, and Bing, Yandex, Seznam and Naver are all notified at once.
 *
 * **Google does not participate in IndexNow** (still true as of May 2026), so
 * this is an addition to the Search Console submission and never a replacement
 * for it. Saying so here because a script named "submit" is exactly the kind of
 * thing someone later assumes covered everything.
 *
 * Run it from anywhere with outbound network:
 *
 *   node tools/submit-indexnow.mjs          # submit every URL in sitemap.xml
 *   node tools/submit-indexnow.mjs --dry    # print what would be sent
 *
 * The key is read from the key file rather than written here, so there is one
 * source of truth. A key that disagrees with the file it is served from is
 * rejected by the protocol, and it fails silently — the submission is simply
 * ignored — which is the failure mode tests/indexnow.test.js exists to prevent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'njiacareerpathways.work';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/* The key file is found by shape rather than named in two places: exactly one
   32-hex-character .txt at the repo root, whose contents equal its own name. */
export function findKeyFile(dir = root) {
  const hits = fs.readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (hits.length !== 1) {
    throw new Error(`expected exactly one IndexNow key file at the repo root, found ${hits.length}`
      + ` (${hits.join(', ') || 'none'}). The protocol verifies ownership by fetching it.`);
  }
  return hits[0];
}

export function readKey(dir = root) {
  const file = findKeyFile(dir);
  const key = fs.readFileSync(path.join(dir, file), 'utf8').trim();
  if (key !== file.replace(/\.txt$/, '')) {
    throw new Error(`${file} contains "${key}", which is not its own name. IndexNow fetches the `
      + 'file and compares; a mismatch is rejected silently.');
  }
  return key;
}

export function sitemapUrls(dir = root) {
  const xml = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const dry = process.argv.includes('--dry');
  const key = readKey();
  const urlList = sitemapUrls();
  const body = { host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList };

  console.log(`IndexNow — ${urlList.length} URLs, key ${key.slice(0, 6)}…`);
  console.log(`  keyLocation: ${body.keyLocation}`);
  if (dry) {
    console.log('  --dry: not sending. First three URLs:');
    urlList.slice(0, 3).forEach((u) => console.log(`    ${u}`));
    return;
  }

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error(`\n  Could not reach ${ENDPOINT}: ${e.message}`);
    console.error('  If you are running this inside the Njia build environment, that is expected —'
      + '\n  every external host is egress-blocked there. Run it from a machine with network.');
    process.exit(2);
  }

  /* 200 accepted, 202 accepted but key not yet validated. Both are successes and
     the difference is worth printing: 202 means the engines have not fetched the
     key file yet, so a 202 that never becomes 200 points at the key file, not
     at the URLs. */
  const text = await res.text().catch(() => '');
  if (res.status === 200 || res.status === 202) {
    console.log(`\n  ${res.status} — accepted for Bing, Yandex, Seznam and Naver.`);
    if (res.status === 202) console.log('  202 means the key file has not been validated yet.');
    console.log('  Google does not participate in IndexNow; its sitemap still needs Search Console.');
    return;
  }
  /* An egress proxy that refuses the host answers with its own 403, which is
     indistinguishable from IndexNow rejecting the key unless you read the body.
     Printing "403 Forbidden" alone would send the next person to check their key
     file when the request never left the building — the same class of mistake as
     a guard whose failure message names the wrong cause. */
  if (/not in allowlist|egress|proxy/i.test(text)) {
    console.error(`\n  Blocked before it left the network, not by IndexNow: ${text.slice(0, 160)}`);
    console.error('  The key and the URL list are fine. Run this from a machine with outbound'
      + '\n  access to api.indexnow.org.');
    process.exit(2);
  }
  console.error(`\n  ${res.status} ${res.statusText} ${text.slice(0, 200)}`);
  if (res.status === 403) {
    console.error('  IndexNow returns 403 when the key file cannot be fetched from keyLocation'
      + '\n  or does not contain exactly the key. Check it is deployed and publicly readable.');
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
