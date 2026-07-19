/* Njia — Discover module data
 * Adaptive questionnaire: sections -> questions -> weighted options.
 * Each option carries `scores`, a partial map of cluster-id -> points.
 * Clusters not mentioned in an option implicitly score 0 for it.
 * `element` tags each question to one of the Four Elements of career clarity:
 * identity | community | necessity | horizon
 */

const CLUSTERS = {
  carer: {
    name: 'The Carer',
    short: 'Carer',
    color: '#ec4899',
    description: 'You are energised by helping, healing, teaching and supporting others. You notice when someone is struggling before they say a word.',
    paths: ['Counselling', 'Nursing', 'Social Work', 'Teaching', 'Community Health']
  },
  creator: {
    name: 'The Creator',
    short: 'Creator',
    color: '#ed8b2d',
    description: 'You are energised by making, designing, writing and performing. Ideas want to become something real in your hands.',
    paths: ['Graphic Design', 'Journalism', 'Fashion Design', 'Architecture', 'Film & Media']
  },
  business: {
    name: 'The Business Builder',
    short: 'Business Builder',
    color: '#6fae48',
    description: 'You are energised by markets, deals and building value from nothing. You see opportunity where others see risk.',
    paths: ['Entrepreneurship', 'Sales', 'Marketing', 'E-commerce', 'Supply Chain']
  },
  tech: {
    name: 'The Tech Navigator',
    short: 'Tech Navigator',
    color: '#1ca0d0',
    description: 'You are energised by solving problems with technology. Systems, logic and code make sense to you in a way people notice.',
    paths: ['Software Development', 'Data Analysis', 'Cybersecurity', 'IT Support', 'Networking']
  },
  people: {
    name: 'The People Leader',
    short: 'People Leader',
    color: '#8b5cf6',
    description: 'You are energised by bringing people together and inspiring action. Others naturally look to you when a group needs direction.',
    paths: ['Human Resources', 'Project Management', 'Public Administration', 'Events Management']
  },
  numbers: {
    name: 'The Numbers Professional',
    short: 'Numbers Pro',
    color: '#ef4444',
    description: 'You are energised by clarity in data and structure in chaos. Numbers tell you a story that words cannot.',
    paths: ['Accounting', 'Finance', 'Statistics', 'Banking', 'Actuarial Science']
  }
};

const QUESTIONNAIRE = [
  {
    id: 'identity',
    title: 'Who You Are',
    subtitle: 'Signature strengths and what pulls your attention',
    icon: '🧭',
    color: '#1ca0d0',
    questions: [
      {
        id: 'id_1',
        text: 'When a group project starts, what do you naturally do first?',
        type: 'single',
        element: 'identity',
        weight: 2,
        options: [
          { text: 'Check that everyone is okay and included', scores: { carer: 2, people: 1 } },
          { text: 'Sketch out what the final thing should look like', scores: { creator: 2 } },
          { text: 'Figure out who will pay for it and how', scores: { business: 2, numbers: 1 } },
          { text: 'Look for the most efficient way to organise the work', scores: { tech: 2, numbers: 1 } },
          { text: 'Assign roles and set the direction', scores: { people: 2, business: 1 } },
          { text: 'Build a budget or timeline spreadsheet', scores: { numbers: 2, tech: 1 } }
        ]
      },
      {
        id: 'id_2',
        text: 'Which of these would you rather spend a free Saturday doing?',
        type: 'single',
        element: 'identity',
        weight: 2,
        options: [
          { text: 'Volunteering or tutoring someone', scores: { carer: 2 } },
          { text: 'Drawing, writing, editing videos, or making music', scores: { creator: 2 } },
          { text: 'Trying to sell something or grow a small hustle', scores: { business: 2 } },
          { text: 'Fixing a phone, computer, or learning a coding tutorial', scores: { tech: 2 } },
          { text: 'Organising an event or leading a youth group activity', scores: { people: 2 } },
          { text: 'Tracking your M-Pesa spending or building a savings plan', scores: { numbers: 2 } }
        ]
      },
      {
        id: 'id_3',
        text: 'Which statement feels most true about you?',
        type: 'single',
        element: 'identity',
        weight: 1,
        options: [
          { text: "People tell me I'm a good listener", scores: { carer: 1, people: 1 } },
          { text: "I get restless if I'm not making something", scores: { creator: 1 } },
          { text: "I'm always thinking about how to make money from an idea", scores: { business: 1 } },
          { text: 'I enjoy figuring out how things work under the hood', scores: { tech: 1 } },
          { text: 'People often ask me to make the final decision', scores: { people: 1 } },
          { text: 'I feel calm when things are measured and precise', scores: { numbers: 1 } }
        ]
      },
      {
        id: 'id_4',
        text: 'What was your strongest KCSE subject cluster?',
        type: 'single',
        element: 'identity',
        weight: 1,
        options: [
          { text: 'Biology / Chemistry (Sciences)', scores: { carer: 1, tech: 1 } },
          { text: 'English / Kiswahili / Literature', scores: { creator: 1, people: 1 } },
          { text: 'Business Studies / Geography', scores: { business: 1, numbers: 1 } },
          { text: 'Mathematics / Physics / Computer Studies', scores: { tech: 1, numbers: 1 } },
          { text: 'History / CRE / Social subjects', scores: { people: 1, carer: 1 } },
          { text: 'Agriculture / Home Science', scores: { carer: 1, business: 1 } }
        ]
      },
      {
        id: 'id_5',
        text: 'In your own words — what makes you lose track of time?',
        type: 'text',
        element: 'identity',
        weight: 0,
        placeholder: 'e.g. "Helping my younger siblings with homework" or "Editing videos for fun"'
      }
    ]
  },
  {
    id: 'community',
    title: 'Who You Work Best With',
    subtitle: 'Team dynamics and the people who bring out your best',
    icon: '🤝',
    color: '#8b5cf6',
    questions: [
      {
        id: 'co_1',
        text: 'In a team, which role do you gravitate toward?',
        type: 'single',
        element: 'community',
        weight: 2,
        options: [
          { text: 'The one who checks on team morale', scores: { carer: 2, people: 1 } },
          { text: 'The one with the creative vision', scores: { creator: 2 } },
          { text: 'The one chasing the deal or the client', scores: { business: 2 } },
          { text: 'The one solving the technical problem', scores: { tech: 2 } },
          { text: 'The one running the meeting', scores: { people: 2 } },
          { text: 'The one tracking the numbers', scores: { numbers: 2 } }
        ]
      },
      {
        id: 'co_2',
        text: 'Which work environment sounds most appealing?',
        type: 'single',
        element: 'community',
        weight: 2,
        options: [
          { text: 'A clinic, school, or community organisation', scores: { carer: 2 } },
          { text: 'A studio, agency, or media house', scores: { creator: 2 } },
          { text: 'A startup or your own business', scores: { business: 2 } },
          { text: 'A tech company or IT department', scores: { tech: 2 } },
          { text: 'A government office or large organisation', scores: { people: 2 } },
          { text: 'A bank, audit firm, or finance department', scores: { numbers: 2 } }
        ]
      },
      {
        id: 'co_3',
        text: 'How do you prefer to interact with people at work?',
        type: 'single',
        element: 'community',
        weight: 1,
        options: [
          { text: 'One-on-one, deep conversations', scores: { carer: 2 } },
          { text: 'Sharing my work publicly for feedback', scores: { creator: 1 } },
          { text: 'Negotiating and persuading', scores: { business: 2 } },
          { text: 'Mostly independently, with occasional check-ins', scores: { tech: 2 } },
          { text: 'Leading and coordinating groups', scores: { people: 2 } },
          { text: 'Behind the scenes, precise and quiet', scores: { numbers: 2 } }
        ]
      },
      {
        id: 'co_4',
        text: 'Do financial constraints significantly affect your options right now?',
        type: 'single',
        element: 'necessity',
        weight: 3,
        options: [
          { text: 'Yes, significantly — I need low-cost or fast-income paths', scores: {}, tag: 'financial_constraint' },
          { text: 'Somewhat — I need funding support but can plan a bit longer-term', scores: {}, tag: 'financial_moderate' },
          { text: 'Not much — I have reasonable flexibility', scores: {}, tag: 'financial_flexible' }
        ]
      }
    ]
  },
  {
    id: 'necessity',
    title: 'Your Real Constraints',
    subtitle: 'Non-negotiables — money, time, and obligations',
    icon: '⚖️',
    color: '#ed8b2d',
    questions: [
      {
        id: 'ne_1',
        text: 'What is your current KCSE grade (or expected grade)?',
        type: 'single',
        element: 'necessity',
        weight: 0,
        tagOnly: true,
        options: [
          { text: 'A- and above', scores: {}, tag: 'grade_A' },
          { text: 'B to B+', scores: {}, tag: 'grade_B' },
          { text: 'C to C+', scores: {}, tag: 'grade_C' },
          { text: 'D+ and below', scores: {}, tag: 'grade_D' }
        ]
      },
      {
        id: 'ne_2',
        text: 'How urgently do you need to start earning an income?',
        type: 'single',
        element: 'necessity',
        weight: 0,
        tagOnly: true,
        options: [
          { text: 'Immediately — within a few months', scores: {}, tag: 'urgency_high' },
          { text: 'Within the next year', scores: {}, tag: 'urgency_medium' },
          { text: 'I can invest 2–4 years before earning', scores: {}, tag: 'urgency_low' }
        ]
      },
      {
        id: 'ne_3',
        text: 'What is your realistic total budget for training over the next 2 years (Ksh)?',
        type: 'single',
        element: 'necessity',
        weight: 0,
        tagOnly: true,
        options: [
          { text: 'Under 30,000', scores: {}, tag: 'budget_low' },
          { text: '30,000 – 100,000', scores: {}, tag: 'budget_mid' },
          { text: '100,000 – 250,000', scores: {}, tag: 'budget_high' },
          { text: 'Over 250,000', scores: {}, tag: 'budget_very_high' }
        ]
      },
      {
        id: 'ne_4',
        text: 'Do you have family or caregiving obligations that limit your schedule or location?',
        type: 'single',
        element: 'necessity',
        weight: 1,
        options: [
          { text: 'Yes, I need to stay close to home and/or work part-time', scores: { carer: 1 }, tag: 'obligations_high' },
          { text: 'Some flexibility, but I have responsibilities', scores: {}, tag: 'obligations_medium' },
          { text: 'No major obligations right now', scores: {}, tag: 'obligations_low' }
        ]
      }
    ]
  },
  {
    id: 'horizon',
    title: 'Your Horizon',
    subtitle: 'What living a full life means to you',
    icon: '🌅',
    color: '#6fae48',
    questions: [
      {
        id: 'ho_1',
        text: 'Ten years from now, what matters most to you?',
        type: 'single',
        element: 'horizon',
        weight: 2,
        options: [
          { text: 'Knowing I improved people\'s lives', scores: { carer: 2 } },
          { text: 'Having made something people recognise as mine', scores: { creator: 2 } },
          { text: 'Owning something — a business, an asset, financial freedom', scores: { business: 2 } },
          { text: 'Being known as excellent at solving hard technical problems', scores: { tech: 2 } },
          { text: 'Leading an organisation or a team that does great work', scores: { people: 2 } },
          { text: 'Financial stability and being trusted with important decisions', scores: { numbers: 2 } }
        ]
      },
      {
        id: 'ho_2',
        text: 'If money and image were not a factor at all, what would you do?',
        type: 'text',
        element: 'horizon',
        weight: 0,
        placeholder: 'Speak freely — this feeds your "Life Three" Odyssey Plan'
      },
      {
        id: 'ho_3',
        text: 'Which of these outcomes would disappoint you most?',
        type: 'single',
        element: 'horizon',
        weight: 1,
        options: [
          { text: 'Working somewhere that does not help anyone', scores: { carer: 1 } },
          { text: 'A job with zero room for creativity', scores: { creator: 1 } },
          { text: 'Never having ownership over my income', scores: { business: 1 } },
          { text: 'A career with no growth in skills or technology', scores: { tech: 1 } },
          { text: 'Never being trusted to lead', scores: { people: 1 } },
          { text: 'A career with no structure or clear progression', scores: { numbers: 1 } }
        ]
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CLUSTERS, QUESTIONNAIRE };
}
