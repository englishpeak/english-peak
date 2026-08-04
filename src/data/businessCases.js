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
  {
    id: 'case-2', caseNumber: 2, slug: 'case-2', title: 'How Late Is Too Late?',
    teaser: 'Two senior analysts are almost ready for an important client presentation, but it is already late and neither is sure whether another few hours of work would help or do more harm.',
    level: 'B2', levelGuidance: '',
    estimatedTime: '40–60 minutes', accessTier: 'free', company: 'Harrington & Cole Advisory', industry: 'Financial Advisory', location: 'New York, USA',
    characters: [
      { name: 'Ryan Mitchell', role: 'Senior Financial Analyst' },
      { name: 'Michael Hayes', role: 'Senior Financial Analyst' }
    ],
    imageSharingUrl: 'https://www.dropbox.com/scl/fi/b9qw4znm145yqbdxon06b/case-2.png?rlkey=iez97dknev1up0mopb8e3cum6&st=38fpl416&dl=0',
    imageAlt: 'Two senior financial analysts reviewing market data late at night in a New York office.',
    introduction: 'Ryan and Michael have spent the day preparing an investment strategy for an important client. At 8:30 p.m., with most of the office already empty, they must decide whether to continue working or call it a night.',
    vocabulary: [
      ['call it a night', 'to stop working or participating in an activity for the evening'], ['refine', 'to improve something by making small and careful changes'],
      ['fresh pair of eyes', 'a new or rested perspective that may notice things others missed'], ['account', 'a client or customer relationship managed by a professional or company'],
      ['go one step further', 'to make an additional effort beyond what is normally expected'], ['draw the line', 'to establish a limit on what is acceptable or reasonable'],
      ['diminishing returns', 'a situation in which additional effort produces progressively smaller benefits'], ['work-life balance', 'the relationship between professional responsibilities and personal life'],
      ['professional commitment', 'a responsibility to perform one’s work reliably and seriously'], ['burnout', 'physical and emotional exhaustion caused by prolonged stress or overwork']
    ],
    reading: {
      title: 'Background Brief',
      paragraphs: [
        'Harrington & Cole Advisory is a financial consulting firm based in New York. It provides investment research, portfolio analysis, risk assessment, and strategic advice to companies, institutional investors, and wealthy private clients.',
        'The firm has built its reputation on detailed research and carefully prepared recommendations. Its analysts are expected to understand not only financial markets, but also the industries, regulatory conditions, and long-term risks that may affect each client’s investments. The company’s senior analysts often work directly with clients and are trusted to present complex information in a clear and practical way.',
        'Financial advisory work can be demanding, particularly when markets are unstable or clients must make decisions quickly. Analysts may spend several days studying projections, comparing scenarios, checking calculations, and preparing presentations. Although the firm does not formally require employees to remain in the office late, many professionals choose to work beyond normal hours when they believe a project needs additional attention.',
        'Harrington & Cole has recently tried to improve its internal culture by encouraging teams to plan their workloads more carefully. Senior management has spoken openly about fatigue, employee retention, and the risk of treating every deadline as an emergency. At the same time, the firm continues to compete with larger advisory companies whose clients expect exceptional preparation and immediate responses.',
        'Ryan Mitchell and Michael Hayes are both senior financial analysts. They have worked together for several years and are trusted to manage important assignments without constant supervision. Neither man is being instructed to stay late, and no manager is waiting for them to finish. The decision is entirely theirs.',
        'The following morning, Ryan and Michael are scheduled to present an investment strategy to a long-standing client that is considering a major expansion of its portfolio. They have spent most of the day reviewing market data, testing different financial scenarios, and preparing their recommendations. By 8:30 p.m., the presentation is nearly complete and most of the office has gone home.'
      ]
    },
    listening: {
      title: 'Executive Meeting', context: 'Listen to Ryan and Michael having an informal conversation at their desks after most of the office has gone home.', audioSharingUrl: 'https://www.dropbox.com/scl/fi/gv4d49y8k2e6c14gufpui/case-2.mp3?rlkey=0y764lzexww42ijet51a9nnlh&st=2ptu9h7c&dl=0',
      transcript: [
        { speaker: 'Ryan Mitchell', text: 'It’s already eight-thirty. I can’t believe we’ve been here all day. Honestly, I think I’m going to call it a night. I promised my wife we’d finally have dinner together, and I don’t want to cancel on her again.' },
        { speaker: 'Michael Hayes', text: 'You’re really leaving? We’re so close to finishing the strategy. If we stay another couple of hours, we can polish the presentation and walk into tomorrow’s meeting knowing we’ve covered every detail.' },
        { speaker: 'Ryan', text: 'Maybe, but we’ve already reviewed these numbers three times. At some point, working longer doesn’t necessarily mean working better. Besides, tomorrow we’ll probably notice things with a fresh pair of eyes.' },
        { speaker: 'Michael', text: 'I know what you mean, but this isn’t just another presentation. If we impress this client, it could turn into one of the biggest accounts we’ve ever managed. I’d rather be tired tomorrow than spend the meeting wondering if we should have prepared a little more.' },
        { speaker: 'Ryan', text: 'Or we could order dinner every night, sleep four hours, and practically move into the office.' },
        { stageDirection: true, text: 'Ryan chuckles briefly.' },
        { speaker: 'Ryan', text: 'Seriously, though, where do we draw the line? Being professional is important, but so is keeping the promises we make to the people waiting for us at home.' },
        { speaker: 'Michael', text: 'That’s the part nobody teaches you, isn’t it? Knowing when staying late is genuinely necessary and when you’re just staying because everyone else expects you to.' }
      ]
    },
    quizQuestions: [
      { id:'q1', source:'Reading', question:'What is Harrington & Cole Advisory mainly known for?', options:options('Making rapid investment decisions without detailed research','Providing carefully researched financial recommendations','Offering banking services directly to the public','Specialising only in short-term stock trading'), correctAnswer:'b', explanation:'The Background Brief states that the firm has built its reputation on detailed research and carefully prepared recommendations.' },
      { id:'q2', source:'Reading', question:'What has the firm recently tried to improve?', options:options('Its policy of requiring employees to work overnight','Its international recruitment process','Its internal culture and the way teams manage demanding workloads','Its system for reducing the number of client presentations'), correctAnswer:'c', explanation:'The reading explains that Harrington & Cole has encouraged teams to plan workloads more carefully and has addressed fatigue, retention, and the tendency to treat every deadline as an emergency.' },
      { id:'q3', source:'Listening', question:'Why does Ryan want to leave the office?', options:options('He believes the client has cancelled the presentation.','He promised his wife he would be home for dinner and thinks the work is already in good shape.','His manager instructed him to finish the presentation at home.','He no longer agrees with the investment strategy.'), correctAnswer:'b', explanation:'Ryan says that the work has already been reviewed several times and that he promised his wife they would have dinner together.' },
      { id:'q4', source:'Listening', question:'Why does Michael prefer to continue working?', options:options('He thinks the presentation is completely incorrect.','He is afraid that their manager will punish them for leaving.','He believes the client could become a major account and wants to refine the presentation further.','He wants to avoid attending the client meeting the following morning.'), correctAnswer:'c', explanation:'Michael believes that impressing the client could create a major opportunity for the firm, so he wants to spend more time polishing the strategy.' },
      { id:'q5', source:'Combined', question:'What is the central tension in the case?', options:options('The analysts must decide whether to change the client’s entire investment portfolio.','The firm must decide whether to close its New York office.','Ryan and Michael must balance professional commitment with fatigue and personal responsibilities.','The client must choose between Harrington & Cole and another advisory firm.'), correctAnswer:'c', explanation:'The reading describes a demanding professional environment, while the audio reveals the analysts’ disagreement about whether extra preparation justifies staying late and sacrificing personal time.' }
    ],
    speaking: { questions: [
      'What would you do if you were Ryan: leave as planned or stay for another two hours? Why?',
      'Do you think Michael is showing professional commitment, or is he placing too much importance on one presentation?',
      'At what point does staying late stop being dedication and start becoming an unhealthy habit?',
      'Should Ryan’s promise to his wife affect his professional decision, even though nobody at work is forcing him to stay?',
      'How can companies encourage excellent work without creating a culture in which employees feel guilty for leaving on time?'
    ], tip: 'Consider the immediate deadline, the quality of the work, the analysts’ personal responsibilities, and the long-term effect of repeated overtime. Support your opinion with reasons and examples.' },
    writingTask: {
      title:'Set Professional Boundaries for the Team', instructions:'Imagine that you are a team manager at Harrington & Cole Advisory. Write an internal email to the financial-analysis department explaining how employees should handle late deadlines and unfinished work. Your message should encourage strong professional standards without making excessive overtime seem normal.',
      format:'Internal email', audience:'Financial Analysis Department', wordRange:'180–220 words',
      planningQuestions:['When is staying late justified?','Who should decide whether additional work is necessary?','How can analysts judge whether extra time will improve the result?','What should employees do when work conflicts with personal commitments?','How can managers prevent occasional overtime from becoming part of the culture?'],
      tips:['Begin by acknowledging the importance of excellent client service.','Explain that long working hours should remain the exception.','Give clear guidance rather than vague advice.','Include at least one practical action employees can take.','Recognise both professional and personal responsibilities.','Use a supportive and professional tone.','End by encouraging employees to communicate early when deadlines become difficult.'],
      usefulPhrases:['Our clients expect a high standard of preparation, but...','Staying late may be appropriate when...','Before extending the working day, teams should consider...','Additional time is only valuable if...','Employees should not feel expected to...','Managers are responsible for ensuring that...','Whenever possible, deadlines should be planned...','Personal commitments should be treated with respect.','The goal is to maintain high standards without...','Please raise concerns as early as possible so that...']
    },
    takeaway: { text:'Professional commitment is not measured only by the number of hours someone remains at work. Additional effort may be justified when a genuinely important deadline requires it, but fatigue can reduce judgement, accuracy, and creativity. Healthy professional boundaries depend on recognising when extra work will create real value and when rest, planning, or clearer priorities would produce a better result.', reminder:'There is no universal rule for every deadline. The objective is to balance excellent work, responsible decision-making, and respect for life outside the office.' }
  },
  { id:'case-3', caseNumber:3, slug:'case-3', title:'Coming soon', teaser:'Another decision-led case will soon join the Business Cases catalogue.', level:'B1–B2', estimatedTime:'20–25 minutes', accessTier:'free', placeholder:true },
  { id:'case-4', caseNumber:4, slug:'case-4', title:'Coming soon', teaser:'More advanced workplace situations are on the way for ePeak+ members.', level:'B2–C1', estimatedTime:'20–25 minutes', accessTier:'premium', placeholder:true }
];

export const getBusinessCase = slug => businessCases.find(item => item.slug === slug);
