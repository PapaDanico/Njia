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

/* Short noun-phrase role labels for the outreach-message dropdown/template
 * (e.g. "...as a {role}"). Kept separate from MENTOR_ARCHETYPES, whose
 * entries are full descriptive sentences meant for the "Who to look for"
 * list, not for splicing into a sentence. */
const MENTOR_ROLES = {
  carer: ['school counsellor', 'KRCHN nurse', 'social worker'],
  creator: ['graphic designer', 'video editor', 'journalist'],
  business: ['small business owner', 'sales or marketing professional'],
  tech: ['junior software developer', 'IT support technician'],
  people: ['HR officer', 'project coordinator', 'county government officer'],
  numbers: ['accountant', 'bank operations officer']
};

function renderConnectPage() {
  const el = document.getElementById('page-connect');
  if (!el) return;

  const cluster = AppState.questionnaire.results?.primary;

  el.innerHTML = `
    <div class="module-rail">
      <p class="page-eyebrow">Module 04 · Connect</p>
      <h1 class="mb-1">Connect</h1>
      <p class="text-secondary mb-2">No algorithm replaces a real conversation. This module helps you prototype your path by talking to real people.</p>
    </div>

    <div class="card">
      <span class="caption">Who to look for</span>
      <h2 class="mb-1">${cluster ? `Based on your ${CLUSTERS[cluster].name} result` : 'Complete Discover for personalised suggestions'}</h2>
      <ul class="mt-1">
        ${(cluster ? MENTOR_ARCHETYPES[cluster] : MENTOR_ARCHETYPES.tech.concat(MENTOR_ARCHETYPES.carer)).map((a) => `
          <li class="text-secondary text-sm mb-1">• ${escapeHtml(a)}</li>
        `).join('')}
      </ul>
      <p class="text-muted text-sm mt-2">Look for these people among family friends, church/mosque members, alumni of your school, or local community groups.</p>
    </div>

    <div class="card">
      <h2 class="mb-1">${icon('mail')} Informational Interview Message</h2>
      <p class="text-muted text-sm mb-2">Generate a short, respectful outreach message you can send by WhatsApp, SMS or email to someone you'd like to learn from.</p>
      <label class="caption" for="connect-name">Their name (optional)</label>
      <input type="text" id="connect-name" maxlength="80" class="form-control" placeholder="e.g. Auntie Wanjiru" style="width:100%;margin:0.4rem 0 0.8rem">
      <label class="caption" for="connect-role">Their role</label>
      <select id="connect-role" class="form-control" onchange="updateCustomRole()" style="width:100%;margin:0.4rem 0 0.8rem">
        <option value="">Select a role or type custom</option>
        ${(cluster ? MENTOR_ROLES[cluster] : [...new Set(Object.values(MENTOR_ROLES).flat())]).map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))}</option>`).join('')}
        <option value="__custom__">Type a custom role...</option>
      </select>
      <input type="text" id="connect-role-custom" maxlength="80" class="form-control" placeholder="e.g. community health nurse" style="width:100%;margin:0.4rem 0 0.8rem;display:none" onchange="updateCustomRole()">
      <button type="button" class="btn btn-primary" onclick="generateOutreachMessage()">Generate Message</button>
      <div id="outreach-output" class="mt-2"></div>
    </div>

    <div class="card">
      <h2 class="mb-1">${icon('shield')} Cold Outreach Safety Checklist</h2>
      <p class="text-muted text-sm mb-2">Before you reach out or meet up — a few rules that protect you.</p>
      <ul class="mt-1">
        <li class="text-secondary text-sm mb-1">• A real professional will never ask you to pay a "registration" or "connection" fee for career advice. That's a scam, however friendly it sounds.</li>
        <li class="text-secondary text-sm mb-1">• Prefer a phone or video call for a first conversation with someone you don't already know.</li>
        <li class="text-secondary text-sm mb-1">• If you do meet in person, choose a public place — a café, library, or office — never a private home.</li>
        <li class="text-secondary text-sm mb-1">• Tell a parent, guardian, or friend who you're meeting, where, and when — and check in with them after.</li>
        <li class="text-secondary text-sm mb-1">• Don't share your national ID number, M-Pesa PIN, passwords, or bank details with anyone contacting you this way — no legitimate mentor needs them.</li>
        <li class="text-secondary text-sm mb-1">• If something feels off, it's okay to stop responding. You don't owe anyone an explanation.</li>
      </ul>
    </div>

    ${/* THE CONVERSATION NJIA NEVER HELPED WITH.
         *
         * KUCCPS's own chief executive names parental expectation and peer
         * pressure as the primary obstacle to sound course choice — learners
         * pushed toward prestige courses that do not match their strengths, by
         * the person who is usually also paying the fees.
         *
         * Njia had a diagnostic, a catalogue and an outreach script, and
         * nothing at all for the conversation that actually decides most of
         * this. The report is a results sheet; this is a different job.
         *
         * Deliberately NOT ammunition. Every line is an invitation to check a
         * figure together, because a learner who "wins" this argument with a
         * parent who still holds the fees has won nothing. The evidence is
         * Njia's own, already sourced elsewhere in the app — it is assembled
         * here rather than restated, so it cannot drift from the record. */''}
    <div class="card">
      <span class="caption">The hardest conversation</span>
      <h2 class="mb-1">${icon('users')} Talking it through with the person paying</h2>
      <p class="text-secondary text-sm mb-2">KUCCPS says parental expectation and peer pressure are the biggest single obstacle to young people choosing well — not grades, and not money. If someone who loves you is pushing a course that does not fit, that is the ordinary case, not a family failing. Below is what Njia knows, so you can check it together rather than argue about it.</p>

      <div class="data-disclaimer data-disclaimer-open mb-2">
        <span aria-hidden="true">↗</span>
        <span><strong>Start here, because it surprises everyone.</strong> ${typeof COMPETITION_REALITY !== 'undefined' ? escapeHtml(COMPETITION_REALITY.theSameFieldTwice) : ''}</span>
      </div>

      <p class="text-secondary text-sm mb-1"><strong>Three figures worth checking together.</strong> Each one is sourced in this app — open Discover and Decide and read the source note beside it.</p>
      <ul class="mt-1 mb-2">
        ${typeof TEACHER_LABOUR_MARKET !== 'undefined' ? `
        <li class="text-secondary text-sm mb-1">• <strong class="num">${TEACHER_LABOUR_MARKET.registeredUnemployedTeachers.toLocaleString('en-KE')}</strong> trained teachers are TSC-registered and waiting for a post. Teaching is the classic "safe" answer, and the shortage everyone quotes is a shortage of <em>funded posts</em>, not of qualified people.</li>` : ''}
        ${typeof ENTRY_PAY !== 'undefined' ? (() => {
          const artisan = ENTRY_PAY.find((p) => /artisan.*day rate/i.test(p.role));
          const teacher = ENTRY_PAY.find((p) => /Teacher, TSC/i.test(p.role));
          if (!artisan || !teacher) return '';
          return `<li class="text-secondary text-sm mb-1">• A certified artisan on the current day rate earns about <strong class="num">Ksh ${artisan.monthlyKes[0].toLocaleString('en-KE')}–${artisan.monthlyKes[1].toLocaleString('en-KE')}</strong> a month in a worked month. A diploma-entry TSC teacher earns <strong class="num">Ksh ${teacher.monthlyKes[0].toLocaleString('en-KE')}–${teacher.monthlyKes[1].toLocaleString('en-KE')}</strong>. Both figures are real and both come with conditions — the artisan's assumes work is available that month, which is the honest catch.</li>`;
        })() : ''}
        ${typeof COMPETITION_REALITY !== 'undefined' ? `
        <li class="text-secondary text-sm mb-1">• ${escapeHtml(COMPETITION_REALITY.whereTheRoomIs)} The prestige courses fill and close in the first window; the room is elsewhere, and elsewhere is not the same as worse.</li>` : ''}
      </ul>

      <p class="text-secondary text-sm mb-1"><strong>Four questions to ask each other.</strong> They work better than any figure, because they move the conversation from what to who-decides-what.</p>
      <ul class="mt-1">
        <li class="text-secondary text-sm mb-1">• What is the worry underneath this course — is it money, respect, or that I will struggle? Each one has a different answer.</li>
        <li class="text-secondary text-sm mb-1">• If this course does not place me, what is the plan? A course that fills in the first window may not have a seat for me at all.</li>
        <li class="text-secondary text-sm mb-1">• Can we look up the entry grade, the fee and the intake together, today, on the KUCCPS portal — rather than deciding on what we each think is true?</li>
        <li class="text-secondary text-sm mb-1">• If I am wrong in two years, what does the ladder out look like? Njia shows certificate-to-diploma routes; a first choice is rarely a last one.</li>
      </ul>

      <p class="text-muted text-sm mt-2">Take the printable report from your Discover results into this conversation. It carries your result, the sources and the costs on one page, which is easier to talk about than a phone screen.</p>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-1">
        <h2>${icon('users')} Peer Cohorts</h2>
        <span class="type-badge">Phase 2</span>
      </div>
      <p class="text-secondary text-sm">Small WhatsApp-integrated groups of youth with similar profiles are planned for a future release, once Njia has a backend to coordinate real cohorts safely.</p>
    </div>
  `;
}

function updateCustomRole() {
  const select = document.getElementById('connect-role');
  const custom = document.getElementById('connect-role-custom');
  if (select.value === '__custom__') {
    custom.style.display = 'block';
    custom.focus();
  } else {
    custom.style.display = 'none';
  }
}

function generateOutreachMessage() {
  const name = document.getElementById('connect-name')?.value.trim();
  const roleSelect = document.getElementById('connect-role');
  const roleCustom = document.getElementById('connect-role-custom');
  let role = roleSelect?.value?.trim();

  if (role === '__custom__') {
    role = roleCustom?.value?.trim() || 'someone in this field';
  } else if (!role || role === '') {
    role = 'someone in this field';
  }

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
