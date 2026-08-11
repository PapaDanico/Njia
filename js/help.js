/* Njia — help.js — Help, tutorials and glossary
 *
 * The FAQ used to live in a modal, which caps how much it can say and
 * makes it unlinkable and unsearchable. This is a real page: grouped
 * FAQs, step-by-step tutorials for every module, and a glossary of the
 * Kenyan education terms the rest of the app assumes you already know
 * (KUCCPS, HEF, KRCHN, TVETA and friends).
 *
 * Depends on: js/app.js (AppState, icon, escapeHtml, navigateTo)
 */

const HELP_TUTORIALS = [
  {
    page: 'discover',
    icon: 'compass',
    title: 'Run the Discovery diagnostic',
    time: 'About 20 minutes',
    steps: [
      'Open <strong>Discover</strong> and tap “Begin Discovery”. Answer honestly rather than aspirationally — the matcher is only as realistic as what you tell it.',
      'Some questions ask about constraints (grade band, budget, obligations, how soon you need income). These are not judgements; they are what makes the course list affordable and reachable rather than a wish list.',
      'For written questions you can tap the microphone and speak instead. Your speech is turned into text on the device; no audio is stored or sent.',
      'You can close the app mid-way. Your answers and your position are saved, so reopening puts you back where you stopped.',
      'At the end you get a primary and secondary cluster, a signal-strength reading, the full six-cluster spread, and your constraints — all of which flow straight into Decide.'
    ]
  },
  {
    page: 'design',
    icon: 'pen',
    title: 'Sketch three futures in the Odyssey Plan',
    time: '30–45 minutes, and worth revisiting',
    steps: [
      'Open <strong>Design</strong>. You get three lives side by side: the path you are already on, what you would do if that disappeared, and what you would do if money and other people’s opinions were no object.',
      'Anchor each life to a cluster and, if you like, a specific course from the catalogue — that keeps the exercise concrete instead of daydreaming.',
      'Fill in years one to five for each. Short phrases are fine. The point is to see three plausible lives next to each other, not to write an essay.',
      'Rate your confidence in each life. A low-confidence favourite is useful information, not a failure.',
      'Use the <strong>Gravity</strong> tab to name constraints you cannot solve directly (“I cannot afford a four-year degree right now”), then reframe your energy toward what you <em>can</em> design around.',
      'Everything saves as you type.'
    ]
  },
  {
    page: 'decide',
    icon: 'chart',
    title: 'Match courses, fees and funding to your reality',
    time: '15 minutes to a shortlist',
    steps: [
      'Open <strong>Decide</strong>. Set your grade and your maximum budget in the filter rail first — every score below re-computes against them.',
      'Read the match percentage together with the “Why N% match?” expander. The score explains itself factor by factor; a number you cannot interrogate is not evidence.',
      'Watch the budget chip: <em>within budget</em>, <em>stretch</em> (up to 25% over, often closable with funding) or <em>over budget</em>. Stretch options are shown deliberately rather than hidden.',
      'Look for the ✓ <strong>Verified</strong> badge. It means that record’s fee has been cross-checked against a public source, with the source named. Everything else is illustrative and must be confirmed with the institution.',
      'Save the courses you are serious about, then use <strong>Compare Saved</strong> — the best value in each measurable row is shaded so you are not squinting at digits.',
      'Switch to the <strong>Funding</strong> tab and work the deadlines. HEF/HELB applies to public universities and TVETs; bursaries and scholarships stack on top.'
    ]
  },
  {
    page: 'connect',
    icon: 'users',
    title: 'Talk to someone already doing the work',
    time: '10 minutes to send the first message',
    steps: [
      'Open <strong>Connect</strong>. It suggests the kinds of people worth talking to for your cluster — not names, because inventing mentor profiles would be dishonest.',
      'Find those people among family friends, congregation members, alumni of your school, or county youth groups.',
      'Generate an outreach message, edit it so it sounds like you, and send it by WhatsApp, SMS or email.',
      'Read the <strong>Cold Outreach Safety Checklist</strong> before meeting anyone. No legitimate professional charges you a “registration fee” for career advice.',
      'One honest conversation with someone two years ahead of you routinely beats a week of reading — including reading this app.'
    ]
  },
  {
    page: 'track',
    icon: 'trend',
    title: 'Turn the plan into applications that actually get sent',
    time: '10 minutes to set up, then weekly',
    steps: [
      'Open <strong>Track</strong> and create an OKR: one objective for the quarter with two or three measurable key results.',
      'Good key results are countable — “submit three applications”, “speak to two nurses”, “save Ksh 15,000 toward fees”.',
      'Add each application you send and move it through its stages so nothing is lost between intakes.',
      'Check in weekly. The plan only works if it survives contact with the term calendar.'
    ]
  }
];

const HELP_FAQ = [
  {
    group: 'The system you are in',
    items: [
      ['I am in Grade 10 under CBC. What does the pathway choice mean for me?', 'Kenya\'s first competency-based cohort entered senior school in January 2026. You choose one of three pathways at Grade 10 — <strong>STEM</strong> (science, technology, engineering, maths), <strong>Social Sciences</strong> (humanities, business, languages) or <strong>Arts and Sports Science</strong> — on your KJSEA results. Everyone still takes English, Kiswahili or KSL, community service learning and physical education, plus three pathway subjects. The choice shapes which courses are open to you at Grade 12, so it is worth treating as a career decision and not just a subject preference. Njia\'s clusters map onto it: STEM leads toward the tech and numbers clusters, Social Sciences toward people, business and care, Arts and Sports toward the creator cluster.'],
      ['Does meeting a course\'s minimum grade mean I will get in?', 'No, and this is the most common misunderstanding. For a <strong>degree</strong>, the mean grade (C+ and above) decides whether you may <em>apply</em>. Placement itself is decided on <strong>weighted cluster points</strong> — your performance in the four subjects that specific programme requires, ranked against every other applicant, to three decimal places. Certificates and diplomas are much closer to a straight grade requirement.'],
      ['What is a cut-off point, really?', 'It is the cluster score of the <em>last student placed</em> in that programme last cycle — an outcome, not a bar set in advance. It moves every year with demand, institutional capacity and how the cohort performed. Use last year\'s cut-offs to judge how competitive a course is; never treat one as a score to aim at, because the number you are aiming at no longer exists. Meeting it does not guarantee placement either — capacity and competition still decide.'],
      ['How do I find my own cluster points?', 'Do not try to calculate them by hand. The KUCCPS student portal computes them for you and shows them directly against each programme you are considering.'],
      ['Why did Medicine and Engineering disappear from the portal?', 'Because they filled. In the 2026 cycle medicine, nursing, pharmacy, architecture and engineering were removed from the KUCCPS portal outright once their slots were exhausted in the <em>first</em> application window. Those courses attract the most applicants nationally and have the least government-funded capacity — and the cap is not arbitrary: professional regulators limit intake so that students-per-lecturer and students-per-laboratory ratios stay workable. The cap protects the quality of the qualification you would be getting. Meanwhile roughly <strong>1.1 million vacancies</strong> remained open across national polytechnics and specialised training institutions.'],
      ['I want to be a nurse. Which route should I take?', 'It depends which door is open. <strong>Degree nursing is among the most oversubscribed programmes in the country.</strong> The KMTC diploma route into the same profession runs at campuses in 45 of the 47 counties and is genuinely reachable — same field, completely different odds. A diploma also ladders: a KRCHN can upgrade later. This is not an argument for lowering your ambition; it is an argument for knowing which door is open before the window closes.'],
      ['I already do this work but have no certificate. Is there a route for me?', 'Yes, and it is the most under-advertised thing in Kenyan education. <strong>Recognition of Prior Learning (RPL)</strong> is a structured assessment that certifies skills you gained through work, informal training or life experience, and converts them toward a formal qualification — without going back to school for years you cannot afford. It exists precisely for the jua kali sector: mechanics, masons, tailors, welders, cooks who are already competent and simply have no paper. It is run by TVETA with the Kenya National Qualifications Authority and ILO support, pushed for by the Federation of Kenya Employers and the Kenya Jua Kali Association. <strong>Why it is worth the effort:</strong> a certified artisan commands Ksh 2,500–3,000 a day while uncertified work on the same job pays a fraction — the certificate is what earns the rate. <strong>Be realistic about the state of it:</strong> over 600 certificates have been awarded, which is real but early. Coverage across trades and counties is uneven and you will likely need to approach TVETA or an accredited assessment centre directly rather than find it advertised.'],
      ['How should I order my choices on the form?', 'Apply early — the competitive programmes close in the first window, not at the published deadline. And put a reachable second and third choice on the form rather than three versions of the same long shot. Njia\'s Decide module shows what your grade actually opens across the whole catalogue, which is the fastest way to find a realistic second choice you would still be happy with.'],
      ['I missed the main KUCCPS window. Is it over?', 'No. The main application window runs around April to May, but it is not the only door. Inter-institutional transfer, the KMTC September intake and Kenya Utalii have their own deadlines, and <strong>TVET placement is continuous</strong> rather than a single annual exercise — colleges report from May onward. The Application Clock on the home page shows which windows are open today and how many days are left.']
    ]
  },
  {
    group: 'Getting started',
    items: [
      ['Is Njia really free?', 'Yes — completely free. No signup, no account, no ads, no paywall, no “premium” tier. Nothing is being upsold to you.'],
      ['Do I need internet to use it?', 'Only for your first visit. After that Njia works fully offline, and you can install it to your home screen so it opens like an app. That is deliberate: bundles and reliable data are not a given.'],
      ['Do I need a smartphone?', 'Any browser works, but Njia is built mobile-first for low-end Android devices, which is what most users actually have. It also works on a shared or borrowed phone — see the shared-device answer below.'],
      ['How long does the whole thing take?', 'The Discovery diagnostic is about 20 minutes. Designing three futures takes another 30–45. Deciding on a shortlist takes about 15. You do not have to do it in one sitting; everything is saved as you go.'],
      ['Can I retake the questionnaire?', 'Yes, any time, from the results screen. Your interests are still settling at this age — retaking it after a few months is sensible, not indecisive.']
    ]
  },
  {
    group: 'Your data and privacy',
    items: [
      ['Does my data leave my phone?', 'No. Questionnaire answers, plans, saved courses and OKRs live in your browser’s local storage on your device. There is no account and no server profile. The single exception is the optional Feedback and Partner forms — what you type there is sent to us, and only if you press send.'],
      ['Can you see my results?', 'No. There is nowhere for them to go. This is an architectural fact, not a policy promise we are asking you to trust.'],
      ['Can I use this on a shared or borrowed phone?', 'Yes — use “Clear My Data” (the lock icon in the header) before you hand the phone back. It wipes everything Njia has stored on that device.'],
      ['What happens if I uninstall Njia or clear my browser data?', 'It is gone for good, because everything lives in that browser’s storage. Export a backup first if you want to keep it — see Privacy &amp; your data.'],
      ['Is there any tracking or analytics?', 'None. No cookies for tracking, no analytics scripts, no third-party pixels.']
    ]
  },
  {
    group: 'The method and the science',
    items: [
      ['How is this different from a personality quiz?', 'Two ways. First, it is built on career-psychology and life-design research rather than a personality label. Second, every recommendation is checked against real Kenyan grade requirements, fees and funding — a quiz tells you who you are, Njia tells you what you can actually apply to.'],
      ['How much should I trust my cluster result?', 'It is a strong starting point, not a verdict — and the results screen says so with the evidence. Interest profiles predict what people choose and stay with far better than how satisfied they end up; the correlation with job satisfaction is around r = .17. Treat it as a shortlist generator.'],
      ['Two of my clusters are almost tied. Which one is right?', 'Possibly both, and that is genuinely useful information. The results screen shows the full six-cluster spread and flags a close call. When clusters are close, prototype both in the Design module rather than forcing a pick.'],
      ['Why does it ask me to design three futures instead of just telling me one answer?', 'Because at 17–20 your interests are still crystallising — they only reach adult stability around 25–30. Committing hard to a single path at this age is betting on a profile that is still forming. Three designed futures is the evidence-based response.'],
      ['What are the Four Elements?', 'Identity (what you are drawn to), Community (who you want to be around), Necessity (your real constraints — grades, money, obligations, timeline) and Horizon (where you want to end up). Necessity is why the recommendations are affordable rather than aspirational.']
    ]
  },
  {
    group: 'Courses, institutions and data quality',
    items: [
      ['Is the course and fee data accurate?', 'Partly, and the app is explicit about which parts. Institution names are real. Records carrying the ✓ Verified badge have had their fee cross-checked against a named public source. Everything else is illustrative and must be confirmed with the institution before you make a financial decision. The Decide banner shows the live verified count.'],
      ['Are private universities and colleges included?', 'Yes. The directory covers public and private universities, national polytechnics, technical training institutes and private colleges, and every institution is labelled public or private — the single biggest driver of what you will pay.'],
      ['Can I study online?', 'Yes, and it may be the best option if you cannot relocate or you are already working. The Open University of Kenya — the country’s first fully virtual public university — is in the catalogue with its published fees, alongside other institutions offering online and evening modes. Filter by Online in Decide.'],
      ['Employment rates and salaries — where are those from?', 'They are illustrative at present. No Kenyan institution in this catalogue publishes a graduate tracer study we could verify against, so those figures carry no verified badge and should be read as rough context only, never as a promise.'],
      ['I found a data error — how do I report it?', 'Use “Give Feedback” in the footer and describe what looks wrong. Reports directly shape what gets verified next.'],
      ['Is Njia affiliated with KUCCPS, HELB, or any institution?', 'No. Njia is independent and unaffiliated. Institution and funder names appear because they are real, publicly known Kenyan bodies — not because of any partnership, sponsorship or endorsement.']
    ]
  },
  {
    group: 'Grades, money and eligibility',
    items: [
      ['What if my KCSE grade is not great?', 'This is exactly what the app is built for. It surfaces certificate and TVET pathways, not just degrees, and Decide shows what share of the catalogue your grade opens. A certificate that ladders into a diploma and then a degree is a real, common and respectable route.'],
      ['I do not know my grade yet. Can I still use it?', 'Yes. Leave the grade unset and courses stay visible with eligibility marked “unconfirmed” rather than being hidden or wrongly ruled out.'],
      ['How does government funding work now?', 'Kenya moved to the Higher Education Funding (HEF) model: instead of a flat loan, students are means-tested into funding bands combining a government scholarship, a HELB loan and a household contribution. You apply through the HEF portal with each intake.'],
      ['What does TVET actually cost?', 'Public TVET is government-subsidised, and from May 2026 public institutions charge a single consolidated annual fee of Ksh 67,189 including assessment fees. That figure anchors the public-TVET fees in this catalogue.'],
      ['Can I stack funding sources?', 'Usually yes — an HEF award, a constituency (NG-CDF) bursary, a county bursary and a private scholarship are separate applications with separate deadlines. The Funding tab lists them with their windows.']
    ]
  }
];

const HELP_GLOSSARY = [
  ['KCSE', 'Kenya Certificate of Secondary Education — the national exam at the end of secondary school, and the grade most tertiary admission decisions hinge on.'],
  ['KUCCPS', 'Kenya Universities and Colleges Central Placement Service — the body that places KCSE candidates into government-sponsored university and TVET slots.'],
  ['HELB', 'Higher Education Loans Board — the government student-loans body, now operating within the HEF model.'],
  ['HEF', 'Higher Education Funding — the means-tested model that sorts students into funding bands combining scholarship, loan and household contribution.'],
  ['TVET', 'Technical and Vocational Education and Training — the polytechnic and technical-college sector awarding certificates and diplomas. Often faster and far cheaper than a degree, and frequently more employable.'],
  ['TVETA', 'TVET Authority — the regulator that registers and accredits TVET institutions.'],
  ['CUE', 'Commission for University Education — the regulator that charters and accredits universities.'],
  ['Chartered', 'A university with a full charter has completed CUE’s accreditation process, as opposed to operating under interim authority.'],
  ['KMTC', 'Kenya Medical Training College — the main public trainer of nurses, clinical officers and allied health professionals, with campuses countrywide.'],
  ['KRCHN', 'Kenya Registered Community Health Nurse — the core nursing diploma qualification recognised across Kenyan health facilities.'],
  ['NG-CDF', 'National Government Constituency Development Fund — the constituency-level fund whose bursary your local office administers.'],
  ['Intake', 'The month a course cohort starts. Missing an intake usually means waiting for the next one, which is why deadlines matter more than they look.'],
  ['Cluster', 'In Njia, one of six career families (Carer, Creator, Business, Tech, People Leader, Numbers) your answers point toward.'],
  ['Odyssey Plan', 'A life-design exercise: sketch three different plausible five-year lives, rather than defending a single plan.'],
  ['Gravity problem', 'A constraint you cannot solve directly — like fees you genuinely cannot raise this year. The move is to design around it, not to grind against it.'],
  ['OKR', 'Objective and Key Results — one goal plus two or three countable measures of progress.']
];

function renderHelpPage() {
  const el = document.getElementById('page-help');
  if (!el) return;

  const tab = AppState.viewFilters.helpTab || 'faq';

  el.innerHTML = `
    <div class="module-header">
      <div class="module-header-main">
        <p class="page-eyebrow">Help · Tutorials · Glossary</p>
        <h1 class="mb-1">How Njia works</h1>
        <p class="text-secondary mb-2">Everything the app assumes you know, written down: step-by-step walkthroughs for each module, straight answers to the awkward questions, and a glossary of the Kenyan education terms used throughout.</p>
      </div>
      <aside class="module-header-aside">
        <p class="decide-rail-title">Quick answers</p>
        <div class="coverage-grid" style="grid-template-columns:1fr">
          <div><span class="coverage-num num">Free</span><span class="coverage-label">no signup, no ads, no paywall</span></div>
          <div><span class="coverage-num num">Offline</span><span class="coverage-label">after the first visit</span></div>
          <div><span class="coverage-num num">On-device</span><span class="coverage-label">your answers never leave the phone</span></div>
        </div>
      </aside>
    </div>

    <div class="odyssey-tabs" role="tablist">
      <button type="button" class="odyssey-tab ${tab === 'faq' ? 'active' : ''}" role="tab" onclick="setHelpTab('faq')">${icon('info')}Questions</button>
      <button type="button" class="odyssey-tab ${tab === 'tutorials' ? 'active' : ''}" role="tab" onclick="setHelpTab('tutorials')">${icon('map')}Tutorials</button>
      <button type="button" class="odyssey-tab ${tab === 'glossary' ? 'active' : ''}" role="tab" onclick="setHelpTab('glossary')">${icon('file')}Glossary</button>
    </div>

    <div id="help-tab-content">${
      tab === 'tutorials' ? renderHelpTutorials()
      : tab === 'glossary' ? renderHelpGlossary()
      : renderHelpFaq()
    }</div>
  `;
}

function setHelpTab(tab) {
  AppState.viewFilters.helpTab = tab;
  saveState();
  renderHelpPage();
  replayFadeIn(document.getElementById('help-tab-content'));
}

function renderHelpFaq() {
  return `
    <div class="help-columns">
      ${HELP_FAQ.map((group) => `
        <section class="card help-group">
          <span class="caption">${escapeHtml(group.group)}</span>
          ${group.items.map(([q, a]) => `
            <details class="help-qa">
              <summary>${escapeHtml(q)}</summary>
              <p>${a}</p>
            </details>
          `).join('')}
        </section>
      `).join('')}
    </div>
    <p class="text-muted text-sm mt-2">Still stuck, or spotted something wrong? Use <button type="button" class="link-btn" onclick="openFeedbackModal()">Give Feedback</button> — it is anonymous and it shapes what gets fixed next.</p>
  `;
}

function renderHelpTutorials() {
  return `
    <div class="help-columns">
      ${HELP_TUTORIALS.map((t, i) => `
        <section class="card help-tutorial">
          <div class="help-tutorial-head">
            <span class="icon-disc" aria-hidden="true">${icon(t.icon)}</span>
            <div>
              <span class="caption">Walkthrough ${i + 1} · ${escapeHtml(t.time)}</span>
              <h2>${escapeHtml(t.title)}</h2>
            </div>
          </div>
          <ol class="help-steps">
            ${t.steps.map((step) => `<li>${step}</li>`).join('')}
          </ol>
          <button type="button" class="btn btn-secondary btn-sm" onclick="navigateTo('${t.page}')">Open ${t.page[0].toUpperCase()}${t.page.slice(1)} →</button>
        </section>
      `).join('')}
    </div>
  `;
}

function renderHelpGlossary() {
  return `
    <div class="card">
      <p class="text-muted text-sm mb-2">Kenyan education runs on acronyms. Here is what each one means in plain language.</p>
      <dl class="glossary-list">
        ${HELP_GLOSSARY.map(([term, def]) => `
          <div class="glossary-row">
            <dt>${escapeHtml(term)}</dt>
            <dd>${escapeHtml(def)}</dd>
          </div>
        `).join('')}
      </dl>
    </div>
  `;
}

window.renderHelpPage = renderHelpPage;
