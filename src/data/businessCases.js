const options = (...texts) => texts.map((text, index) => ({ id: String.fromCharCode(97 + index), text }));

export const businessCases = [
  {
    id: 'case-1', caseNumber: 1, slug: 'case-1', title: 'Growing Too Fast?',
    teaser: 'Northbridge has secured the biggest contract in its history, but one hiring decision could shape the company’s future.',
    level: 'B2', levelGuidance: 'This is only a suggested level. B1 students may complete it with support, while C1 students should be encouraged to give more detailed and nuanced answers.',
    estimatedTime: '20–25 minutes', accessTier: 'visitor', company: 'Northbridge Solutions', industry: 'Technology Consulting', location: 'New York, USA',
    characters: [
      { name: 'Marcus Bennett', role: 'Chief Executive Officer' },
      { name: 'Emma Carter', role: 'Human Resources Director' }
    ],
    imageSharingUrl: 'https://drive.google.com/file/d/1TRrLS8qamrEshV0zUXo5l7rG2oEhCJin/view?usp=drive_link',
    imageAlt: 'The CEO and HR Director of Northbridge Solutions discussing reports in a New York office.',
    introduction: 'Northbridge Solutions has landed its largest contract ever. The company must expand quickly, but Marcus and Emma disagree about the safest way to build the new team.',
    reading: {
      title: 'Background Brief',
      paragraphs: [
        'Northbridge Solutions is a technology consulting company based in New York. It has grown steadily during the last five years and currently employs 120 people. Most of its clients are medium-sized companies that hire Northbridge to improve their digital systems, cybersecurity, and internal processes.',
        'The company has now secured the largest contract in its history. Global Retail Group, an international business with operations in 18 countries, has selected Northbridge to lead a major digital-transformation project. The contract is expected to generate almost twice as much revenue as Northbridge’s largest previous project.',
        'The opportunity could transform the company. However, the new client expects work to begin in only six weeks. Northbridge will need a much larger team to meet the deadline and maintain the level of service promised during the negotiations.',
        'Marcus Bennett, the CEO, believes the company should hire approximately twenty-five permanent employees immediately. He sees the contract as the beginning of a new stage of long-term growth.',
        'Emma Carter, the HR Director, agrees that the company needs additional staff, but she is concerned about hiring too many permanent employees too quickly. If the workload falls after the first year or the client does not renew the contract, Northbridge could be left with high salary and benefit costs.',
        'Emma proposes hiring a smaller permanent team and using experienced contractors during the first phase of the project. This would give the company greater flexibility, but Marcus worries that contractors may be less committed to the company and may not understand its culture as well as permanent employees.',
        'The available staffing budget is large enough for only one of the two main strategies. Marcus and Emma must agree on an approach before recruitment begins.'
      ],
      vocabulary: [
        ['secure a contract', 'to successfully obtain a business agreement'], ['workload', 'the amount of work that a person or team must complete'],
        ['permanent employee', 'an employee hired without a planned end date'], ['contractor', 'an independent professional hired for a limited period or project'],
        ['long-term commitment', 'an obligation that continues for a significant period'], ['allocate a budget', 'to decide how available money will be distributed'],
        ['renew a contract', 'to extend an agreement for another period'], ['financial risk', 'the possibility of losing money or creating costly obligations']
      ]
    },
    listening: {
      title: 'Executive Meeting', audioSharingUrl: 'https://www.dropbox.com/scl/fi/9wlnv3wr24m7ejw9kft99/case-1.mp3?rlkey=m7i1q0see503m7glp984g6z3p&st=ltql1ai1&dl=0',
      transcript: [
        { speaker: 'Marcus Bennett, CEO', text: 'Emma, this contract changes everything for us. It’s worth nearly twice as much as any project we’ve handled before, and the client expects us to begin in just six weeks. My biggest concern is capacity. I don’t think we can deliver this with our current team. I’m leaning toward hiring around twenty-five full-time employees immediately. It’ll be expensive, but I want the client to see that we’re fully committed from day one.' },
        { speaker: 'Emma Carter, HR Director', text: 'I understand the urgency, Marcus, and I agree that we need more people. My concern is what happens after the first year. If the client’s workload decreases or they decide not to renew the contract, we’ll still have salaries, benefits, and long-term commitments. Instead of hiring everyone permanently, I’d suggest building a smaller core team and bringing in experienced contractors for the initial phase. It’s more flexible and lowers our financial risk.' },
        { speaker: 'Marcus', text: 'That’s a fair point. Still, contractors may not develop the same loyalty or understanding of our culture. We need to decide whether we’re investing in long-term growth or simply responding to a short-term opportunity. We have the budget for only one approach, so whatever we choose today will shape the company’s future.' }
      ]
    },
    quizQuestions: [
      { id:'q1', source:'Reading', question:'What makes the Global Retail Group contract especially important for Northbridge Solutions?', options:options('It is the company’s first international client.','It could generate almost twice the revenue of its largest previous project.','It will allow Northbridge to reduce its current workforce.','It has no fixed starting date.'), correctAnswer:'b', explanation:'The reading states that the new contract is expected to generate almost twice as much revenue as Northbridge’s largest previous project.' },
      { id:'q2', source:'Reading', question:'Why is Emma concerned about hiring twenty-five permanent employees?', options:options('The recruitment process would take several years.','The new employees may refuse to work with contractors.','The company could face high employment costs if future demand falls.','The client has requested that Northbridge avoid permanent staff.'), correctAnswer:'c', explanation:'Emma worries that the workload may decrease after the first year, leaving Northbridge responsible for salaries, benefits, and other long-term costs.' },
      { id:'q3', source:'Listening', question:'What is Marcus’s main reason for wanting to hire a large permanent team immediately?', options:options('He wants to replace the company’s current employees.','He believes permanent employees will always cost less than contractors.','He wants to demonstrate commitment and ensure the company has enough capacity.','He has already promised jobs to twenty-five candidates.'), correctAnswer:'c', explanation:'Marcus says the current team does not have enough capacity and wants the client to see that Northbridge is fully committed from the beginning.' },
      { id:'q4', source:'Listening', question:'What alternative does Emma propose?', options:options('Rejecting the contract until the company grows naturally','Creating a smaller permanent core team supported by experienced contractors','Asking the current employees to work without additional pay','Outsourcing the entire project to another consulting company'), correctAnswer:'b', explanation:'Emma recommends a smaller permanent team combined with experienced contractors during the initial phase.' },
      { id:'q5', source:'Combined', question:'What is the central decision Marcus and Emma must make?', options:options('Whether to move the company outside New York','Whether to accept the Global Retail Group contract','Whether to prioritise long-term permanent growth or short-term staffing flexibility','Whether to replace the HR department with external consultants'), correctAnswer:'c', explanation:'Both the reading and the conversation focus on the choice between building a larger permanent workforce and using a more flexible combination of employees and contractors.' }
    ],
    speaking: { questions: [
      'What would you do if you were Emma: hire more permanent employees or use a mixed team of employees and contractors? Why?',
      'Do you think Marcus is being too optimistic about the company’s future, or is this exactly the right moment to invest in growth?',
      'What risks could Northbridge face if it depends heavily on contractors during such an important project?',
      'How could Marcus and Emma divide the staffing budget in a way that reduces risk without damaging service quality?',
      'Imagine the contract ends after one year and is not renewed. What should the company do now to prepare for that possibility?'
    ], tip: 'Support your opinion with reasons, possible consequences, and examples. There is no single correct answer.' },
    writingTask: {
      title:'Recommend a Hiring Strategy', instructions:'Write an internal recommendation memo to Marcus Bennett. Explain which staffing strategy Northbridge should choose and why. You may support Marcus’s proposal, Emma’s proposal, or suggest a carefully balanced alternative.',
      format:'Internal recommendation memo', audience:'Marcus Bennett, CEO', wordRange:'180–220 words',
      planningQuestions:['What is your main recommendation?','What are the most important benefits of your strategy?','What risks should the company consider?','How should the staffing budget be allocated?','What should Northbridge do if the client does not renew the contract?'],
      tips:['State your recommendation clearly near the beginning.','Support your position with at least two reasons.','Consider both short-term and long-term consequences.','Acknowledge one possible disadvantage of your strategy.','Finish with a clear next step.','Use a professional but natural tone.'],
      usefulPhrases:['Based on the current situation, I recommend...','The main advantage of this approach is that...','This would allow the company to...','However, we should also consider...','One potential risk is...','To reduce this risk, Northbridge could...','In the short term...','From a long-term perspective...','I believe this is the best option because...','The next step should be to...']
    },
    takeaway: { text:'Rapid growth often forces companies to choose between stability and flexibility. Permanent employees may strengthen culture, loyalty, and long-term capability, while contractors can reduce financial risk and help a company respond quickly. The strongest strategy depends on future demand, available resources, and how much uncertainty the company is prepared to accept.', reminder:'There is no single “right” answer. The objective is to analyse the situation, communicate clearly, and make a well-supported recommendation.' }
  },
  { id:'case-2', caseNumber:2, slug:'case-2', title:'Coming soon', teaser:'A new professional challenge is being prepared for your next business lesson.', level:'B2', estimatedTime:'20–25 minutes', accessTier:'free', placeholder:true },
  { id:'case-3', caseNumber:3, slug:'case-3', title:'Coming soon', teaser:'Another decision-led case will soon join the Business Cases catalogue.', level:'B1–B2', estimatedTime:'20–25 minutes', accessTier:'free', placeholder:true },
  { id:'case-4', caseNumber:4, slug:'case-4', title:'Coming soon', teaser:'More advanced workplace situations are on the way for ePeak+ members.', level:'B2–C1', estimatedTime:'20–25 minutes', accessTier:'premium', placeholder:true }
];

export const getBusinessCase = slug => businessCases.find(item => item.slug === slug);
