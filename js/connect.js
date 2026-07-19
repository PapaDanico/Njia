/* Njia — connect.js — MODULE 4: The Human Layer
 *
 * SCOPE NOTE: Real mentor matching and peer cohorts require a live backend
 * and a vetted volunteer directory — out of scope for this client-only MVP
 * (see README roadmap, Phase 2). What ships now: an informational-interview
 * message generator (a life-design "prototyping" technique) that helps users
 * reach out to their own real-world contacts, plus role archetypes per
 * cluster so they know who to look for. No fabricated mentor profiles or
 * contact details are presented as real people.
 */

const MENTOR_ARCHETYPES = {
  carer: ['A school counsellor or KRCHN nurse a few years into their career', 'A social worker at a local NGO'],
  creator: ['A working graphic designer or video editor with a public portfolio', 'A journalist at a local paper or radio station'],
  business: ['A small business owner in your area', 'A sales or marketing professional at an SME'],
  tech: ['A junior software developer or IT support technician', 'Someone who completed a bootcamp or ALX-style programme'],
  people: ['An HR officer or project coordinator at a mid-size company', 'A county government administrative officer'],
  numbers: ['An accountant partway through their KASNEB/CPA path', 'A bank operations or finance officer']
};

function renderConnectPage() {
  const el = document.getElementById('page-connect');
  if (!el) return;

  const cluster = AppState.questionnaire.results?.primary;

  el.innerHTML = `
    <h1 class="mb-1">Connect</h1>
    <p class="text-secondary mb-2">No algorithm replaces a real conversation. This module helps you prototype your path by talking to real people.</p>

    <div class="card">
      <span class="caption">Who to look for</span>
      <h3 class="mb-1">${cluster ? `Based on your ${CLUSTERS[cluster].name} result` : 'Complete Discover for personalised suggestions'}</h3>
      <ul class="mt-1">
        ${(cluster ? MENTOR_ARCHETYPES[cluster] : MENTOR_ARCHETYPES.tech.concat(MENTOR_ARCHETYPES.carer)).map((a) => `
          <li class="text-secondary text-sm mb-1">• ${escapeHtml(a)}</li>
        `).join('')}
      </ul>
      <p class="text-muted text-sm mt-2">Look for these people among family friends, church/mosque members, alumni of your school, or local community groups.</p>
    </div>

    <div class="card">
      <h3 class="mb-1">✉️ Informational Interview Message</h3>
      <p class="text-muted text-sm mb-2">Generate a short, respectful outreach message you can send by WhatsApp, SMS or email to someone you'd like to learn from.</p>
      <label class="caption" for="connect-name">Their name (optional)</label>
      <input type="text" id="connect-name" placeholder="e.g. Auntie Wanjiru" style="width:100%;min-height:44px;margin:0.4rem 0 0.8rem;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem">
      <label class="caption" for="connect-role">Their role</label>
      <input type="text" id="connect-role" placeholder="e.g. community health nurse" style="width:100%;min-height:44px;margin:0.4rem 0 0.8rem;background:var(--bg-card);border:1px solid var(--border-light);border-radius:8px;color:var(--text-primary);padding:0.5rem">
      <button type="button" class="btn btn-primary" onclick="generateOutreachMessage()">Generate Message</button>
      <div id="outreach-output" class="mt-2"></div>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-1">
        <h3>👥 Peer Cohorts</h3>
        <span class="type-badge">Phase 2</span>
      </div>
      <p class="text-secondary text-sm">Small WhatsApp-integrated groups of youth with similar profiles are planned for a future release, once Njia has a backend to coordinate real cohorts safely.</p>
    </div>
  `;
}

function generateOutreachMessage() {
  const name = document.getElementById('connect-name')?.value.trim();
  const role = document.getElementById('connect-role')?.value.trim() || 'someone in this field';
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const message = `${greeting}\n\nMy name is [your name]. I'm exploring a career path and would really value 15 minutes of your time to hear about your experience as ${role.match(/^[aeiou]/i) ? 'an' : 'a'} ${role}. Would you be open to a short call or chat this week, whenever is convenient for you?\n\nThank you so much,\n[your name]`;

  const output = document.getElementById('outreach-output');
  if (output) {
    output.innerHTML = `
      <textarea class="q-input" readonly style="min-height:140px">${escapeHtml(message)}</textarea>
      <button type="button" class="btn btn-secondary btn-sm mt-2" onclick="copyOutreachMessage(this)">Copy to Clipboard</button>
    `;
  }
}

function copyOutreachMessage(btn) {
  const textarea = btn.previousElementSibling;
  if (!textarea) return;
  navigator.clipboard?.writeText(textarea.value).then(() => {
    showToast('Message copied.', 'success');
  }).catch(() => {
    textarea.select();
    showToast('Select the text above and copy manually.', 'info');
  });
}
