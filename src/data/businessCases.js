const options = (...texts) => texts.map((text, index) => ({ id: String.fromCharCode(97 + index), text }));

export const businessCases = [
  {
    id: 'case-1', caseNumber: 1, slug: 'case-1', title: 'Growing Too Fast?',
    teaser: 'Northbridge has secured the biggest contract in its history, but one hiring decision could shape the company’s future.',
    level: 'B2', levelGuidance: '',
    estimatedTime: '40–60 minutes', accessTier: 'visitor', company: 'Northbridge Solutions', industry: 'Technology Consulting', location: 'New York, USA',
    characters: [
      { name: 'Marcus Bennett', role: 'Chief Executive Officer' },
      { name: 'Emma Carter', role: 'Human Resources Director' }
    ],
    imageSharingUrl: 'https://www.dropbox.com/scl/fi/tzqyklndjwksy1o57zjak/case-1.png?rlkey=4szm8ecgrqwdh1geoz5pyft62&st=ky8ii7ql&dl=0',
    imageAlt: 'The CEO and HR Director of Northbridge Solutions discussing reports in a New York office.',
    introduction: 'Northbridge Solutions has secured the largest contract in its history with Global Retail Group, marking an important moment in the company’s growth.',
    vocabulary: [
      ['secure a contract', 'to successfully obtain a business agreement'], ['workload', 'the amount of work that a person or team must complete'],
      ['permanent employee', 'an employee hired without a planned end date'], ['contractor', 'an independent professional hired for a limited period or project'],
      ['long-term commitment', 'an obligation that continues for a significant period'], ['allocate a budget', 'to decide how available money will be distributed'],
      ['renew a contract', 'to extend an agreement for another period'], ['financial risk', 'the possibility of losing money or creating costly obligations']
    ],
    reading: {
      title: 'Background Brief',
      paragraphs: [
        'Northbridge Solutions is a technology consulting company based in New York. It has grown steadily during the last five years and currently employs 120 people. Most of its clients are medium-sized companies that hire Northbridge to improve their digital systems, cybersecurity, and internal processes.',
        'Founded just over a decade ago, the company built its reputation by taking on complex projects that many larger consulting firms considered too small to prioritize. This approach allowed Northbridge to develop close relationships with its clients, many of whom have remained with the company for years. Rather than competing on price, Northbridge has focused on delivering reliable service, practical solutions, and long-term partnerships.',
        'The consulting industry has changed significantly in recent years. As businesses invest more heavily in digital transformation, cloud technologies, artificial intelligence, and cybersecurity, demand for experienced consulting firms has increased rapidly. Competition, however, has also become much stronger. Larger international firms continue to dominate the biggest contracts, while smaller companies are under constant pressure to prove they can deliver projects of increasing size and complexity.',
        'Northbridge has responded by carefully expanding its expertise and investing in employee development instead of growing too quickly. During the past three years, the company has successfully completed several high-profile projects, earning an excellent reputation for meeting deadlines and maintaining strong communication with clients. As a result, industry analysts have begun to describe Northbridge as one of the fastest-growing consulting firms in its market.',
        'Despite this success, the leadership team understands that reputation can disappear quickly. Winning new business is important, but maintaining high service quality has always been considered the company\'s greatest competitive advantage. Every major opportunity therefore represents both a chance to grow and a responsibility to protect the trust the company has built over the years.',
        'The company has now secured the largest contract in its history. Global Retail Group, an international business with operations in 18 countries, has selected Northbridge to lead a major digital-transformation project. The contract is expected to generate almost twice as much revenue as Northbridge\'s largest previous project.'
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
      { id:'q1', source:'Reading', question:'What helped Northbridge Solutions build its strong reputation during its early years?', options:options('Offering the lowest prices in the consulting industry.','Focusing on smaller but complex projects that larger firms often ignored.','Specialising exclusively in artificial intelligence projects.','Expanding rapidly into international markets.'), correctAnswer:'b', explanation:'The Background Brief explains that Northbridge built its reputation by successfully handling complex projects that many larger consulting firms considered too small.' },
      { id:'q2', source:'Reading', question:'According to the Background Brief, why has competition become more challenging in the consulting industry?', options:options('Companies are investing less money in technology.','Governments have limited international consulting projects.','Larger consulting firms continue to dominate major contracts while demand for digital transformation keeps increasing.','Most businesses have stopped investing in cybersecurity.'), correctAnswer:'c', explanation:'The reading explains that demand has grown considerably, but larger firms still dominate the biggest projects, increasing pressure on smaller consulting companies.' },
      { id:'q3', source:'Listening', question:'What is Marcus’s main reason for wanting to hire a large permanent team immediately?', options:options('He wants to replace the company’s current employees.','He believes permanent employees will always cost less than contractors.','He wants to demonstrate commitment and ensure the company has enough capacity.','He has already promised jobs to twenty-five candidates.'), correctAnswer:'c', explanation:'Marcus says the current team does not have enough capacity and wants the client to see that Northbridge is fully committed from the beginning.' },
      { id:'q4', source:'Listening', question:'What alternative does Emma propose?', options:options('Rejecting the contract until the company grows naturally','Creating a smaller permanent core team supported by experienced contractors','Asking the current employees to work without additional pay','Outsourcing the entire project to another consulting company'), correctAnswer:'b', explanation:'Emma recommends a smaller permanent team combined with experienced contractors during the initial phase.' },
      { id:'q5', source:'Combined', question:'How does the staffing decision discussed in the meeting connect to Northbridge’s established business priorities?', options:options('It will determine whether the company leaves the technology consulting industry.','It requires the company to compete primarily by offering the lowest prices.','It must support growth while protecting the service quality and client trust described in the Background Brief.','It will allow Northbridge to avoid working with international clients.'), correctAnswer:'c', explanation:'The Background Brief emphasizes Northbridge’s commitment to service quality and client trust, while the meeting explores how to build enough capacity for growth without creating excessive long-term risk.' }
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
