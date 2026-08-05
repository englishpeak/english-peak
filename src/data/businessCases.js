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
  {
    id: 'case-3', caseNumber: 3, slug: 'case-3', title: 'Big Fish or Safer Bets?',
    teaser: 'A sales department has a limited travel budget and several promising opportunities. The team must decide how ambitious its next month should be.',
    level: 'B2', levelGuidance: '',
    estimatedTime: '40–60 minutes', accessTier: 'free', company: 'Apex Business Systems', industry: 'Business Technology Solutions', location: 'Chicago, USA',
    characters: [
      { name: 'Victoria Chen', role: 'Sales Director' },
      { name: 'Laura Bennett', role: 'Sales Coordinator' },
      { name: 'Priya Shah', role: 'Regional Sales Manager' },
      { name: 'Danielle Brooks', role: 'Key Accounts Manager' }
    ],
    imageSharingUrl: 'https://www.dropbox.com/scl/fi/pghekk6h6cxiaj8ko8lzb/case-3.png?rlkey=eiua4p29n9hzfcaca6obqhx25&st=jvs3cso0&dl=0',
    imageAlt: 'Four senior sales professionals discussing reports and travel plans in a modern office.',
    introduction: 'Apex Business Systems is planning its sales activity for the coming month. With several promising prospects and a limited travel budget, the leadership team must decide where the department should concentrate its time and resources.',
    vocabulary: [
      ['prospect', 'a potential customer or client'], ['sales cycle', 'the complete process from first contact with a prospect to closing a sale'],
      ['key account', 'an especially important customer that may generate significant revenue'], ['lead', 'a person or company that may become a customer'],
      ['qualify a lead', 'to evaluate whether a potential customer is likely to buy'], ['allocate resources', 'to decide how money, time, or staff will be distributed'],
      ['return on investment', 'the financial benefit produced by an investment compared with its cost'], ['follow up', 'to contact someone again after an initial conversation or meeting'],
      ['personalized proposal', 'a commercial offer designed specifically for one potential client'], ['spread the risk', 'to reduce exposure by dividing resources across several opportunities']
    ],
    reading: {
      title: 'Background Brief',
      paragraphs: [
        'Apex Business Systems is a Chicago-based company that provides workflow software, data-management tools, and digital consulting services to organisations across the United States. Its clients include manufacturers, retail chains, logistics companies, healthcare providers, and professional-services firms.',
        'The company began by serving small local businesses, but over the last eight years it has expanded into the medium-sized corporate market. This growth has been driven by a practical sales approach: understanding each client’s daily operations, identifying inefficient processes, and proposing technology that can produce measurable results.',
        'Apex has a team of account executives and regional sales managers who regularly travel to meet potential clients. Although video calls are now common, the company has found that face-to-face meetings remain especially valuable when a sale involves several departments, a customized implementation, or a long-term service agreement. Business trips may include flights, hotels, client dinners, product demonstrations, and follow-up visits.',
        'The market has become increasingly competitive. Larger technology providers can offer broad international coverage and strong brand recognition, while smaller specialists often compete through lower prices and faster implementation. Apex has positioned itself between these two groups by offering sophisticated solutions with more personal service than many large competitors.',
        'During the last financial year, medium-sized clients provided most of the sales department’s reliable revenue. Their contracts were not individually enormous, but they were generally completed within a reasonable period and often led to referrals or additional projects. At the same time, the company’s leadership has become increasingly interested in securing larger national accounts that could accelerate growth and raise Apex’s profile in the industry.',
        'The sales department is now planning its travel schedule and commercial activity for the coming month. Several opportunities are available in different cities, but the budget cannot support every trip, dinner, presentation, and follow-up visit currently being considered. The department’s four senior leaders are meeting to decide how those resources should be used.'
      ]
    },
    listening: {
      title: 'Executive Meeting', context: 'Listen to four members of the sales leadership team discussing how to allocate next month’s travel and client-development budget.', audioSharingUrl: 'https://www.dropbox.com/scl/fi/snb42o4k9jrr20lf14b41/case-3.mp3?rlkey=qrw397mg31t1r75iy1bjtpqqi&st=thnttoac&dl=0',
      transcript: [
        { speaker: 'Victoria Chen', text: 'We need to finalize next month’s travel plan today. We have enough budget for several domestic trips and two international visits, but we can’t pursue every opportunity at the same level. The main question is whether we concentrate our resources on a few major companies or spread the budget across a larger number of medium-sized prospects.' },
        { speaker: 'Danielle Brooks', text: 'I’d focus on the major accounts. One successful contract with a national retailer or a multinational manufacturer could generate more revenue than ten smaller deals combined. Those clients expect face-to-face meetings, dinners, detailed proposals, and regular follow-ups. If we want to compete for them, we have to show that we’re willing to invest in the relationship.' },
        { speaker: 'Priya Shah', text: 'That’s true, but those sales cycles can take months, and there’s no guarantee we’ll win. We could spend thousands on travel and entertainment, only to discover that they chose a larger competitor. Medium-sized companies usually make decisions faster, and we already have a strong reputation in that market. The individual contracts are smaller, but the success rate is much higher.' },
        { speaker: 'Laura Bennett', text: 'There’s also a workload issue. If the team focuses on five major prospects, they can prepare highly personalized presentations. If we target thirty smaller companies, we’ll create more opportunities, but the sales managers may spend most of their time travelling between short meetings and following up on leads that aren’t properly qualified.' },
        { speaker: 'Danielle', text: 'But if we keep focusing on the same type of client, we may never move into the next stage of growth. At some point, we have to take a bigger risk.' },
        { speaker: 'Priya', text: 'Agreed, but we shouldn’t confuse ambition with putting too much money into a small number of uncertain opportunities.' },
        { speaker: 'Victoria', text: 'Then perhaps the real decision isn’t simply big clients or smaller clients. It’s how much of the budget we’re prepared to risk on long-term opportunities while still protecting the reliable business that keeps the department performing month after month.' }
      ]
    },
    quizQuestions: [
      { id:'q1', source:'Reading', question:'What helped Apex Business Systems expand into the medium-sized corporate market?', options:options('Offering only the cheapest software available','Understanding clients’ operations and proposing practical solutions','Eliminating all face-to-face sales meetings','Focusing exclusively on international corporations'), correctAnswer:'b', explanation:'The Background Brief explains that Apex grew by understanding clients’ daily operations, identifying inefficient processes, and recommending technology with measurable benefits.' },
      { id:'q2', source:'Reading', question:'Why does Apex still consider business travel valuable?', options:options('Clients refuse to use video calls under any circumstances.','Travel is required for every software sale.','Complex or customized sales often benefit from face-to-face communication.','The company has no regional offices.'), correctAnswer:'c', explanation:'The reading states that in-person meetings are especially useful when a sale involves several departments, customized implementation, or a long-term agreement.' },
      { id:'q3', source:'Listening', question:'Why does Danielle want the team to prioritize major accounts?', options:options('Large companies always make purchasing decisions quickly.','One major contract could generate more revenue than many smaller deals.','Medium-sized companies have stopped buying Apex products.','Major accounts require fewer meetings and less preparation.'), correctAnswer:'b', explanation:'Danielle argues that one successful contract with a major company could produce more revenue than ten smaller agreements combined.' },
      { id:'q4', source:'Listening', question:'What is Priya’s main concern about pursuing larger companies?', options:options('Large companies never meet sales representatives in person.','Apex does not have any products suitable for them.','The sales cycles are long, expensive, and may still end without a contract.','The company’s sales managers are unwilling to travel internationally.'), correctAnswer:'c', explanation:'Priya points out that major-account sales may take months and require substantial spending without any guarantee of success.' },
      { id:'q5', source:'Combined', question:'What is the central strategic decision facing the sales department?', options:options('Whether to stop all business travel permanently','Whether to invest heavily in a few high-value prospects or spread resources across more reliable opportunities','Whether to replace the sales team with external consultants','Whether to sell only to companies in Chicago'), correctAnswer:'b', explanation:'The reading introduces the limited budget and range of potential clients, while the conversation presents the choice between a small number of ambitious opportunities and a broader group of more predictable prospects.' }
    ],
    speaking: { questions: [
      'What would you do if you were Victoria: prioritize a few major accounts or distribute the budget across more medium-sized prospects?',
      'Do you agree with Danielle that a company must eventually take bigger risks in order to reach a new stage of growth?',
      'Which is more important for a sales department: the possible value of a deal or the probability of actually closing it?',
      'How would you divide the travel and entertainment budget between large accounts and medium-sized prospects?',
      'What information should the team collect before deciding whether a major prospect deserves significant time and money?'
    ], tip: 'Consider potential revenue, probability of success, sales-cycle length, workload, travel costs, and long-term growth. Support your strategy with clear reasons.' },
    writingTask: {
      title:'Propose Next Month’s Sales Strategy', instructions:'Write a short sales-strategy proposal for Victoria Chen. Recommend how Apex Business Systems should allocate its travel, client-entertainment, and follow-up budget during the coming month. You may prioritize major accounts, medium-sized prospects, or propose a balanced strategy.',
      format:'Internal sales proposal', audience:'Victoria Chen, Sales Director', wordRange:'180–220 words',
      planningQuestions:['Which type of client should receive the largest share of the budget?','How many major prospects should the team actively pursue?','What criteria should be used to qualify opportunities?','How can the company protect reliable monthly revenue?','How should the team measure whether the strategy was successful?'],
      tips:['State your main recommendation clearly.','Refer to both opportunity and risk.','Explain how you would divide the available resources.','Include at least one criterion for selecting high-priority prospects.','Consider both short-term sales and long-term growth.','Use a confident but realistic professional tone.','Finish by suggesting a concrete next step or review point.'],
      usefulPhrases:['I recommend allocating the majority of the budget to...','A balanced approach would allow the team to...','The strongest opportunities should be selected based on...','Although major accounts offer greater potential, they also...','Medium-sized prospects provide a more reliable source of...','To reduce the risk, the department could...','The sales team should prioritize companies that...','This strategy would protect short-term performance while...','Results should be reviewed at the end of...','The next step should be to identify...']
    },
    takeaway: { text:'Sales growth often requires a balance between ambition and predictability. Large accounts can transform a company’s revenue and reputation, but they may require long sales cycles, significant expenses, and repeated follow-up without any guarantee of success. Medium-sized clients usually offer smaller individual contracts, but a broader pipeline can spread risk and produce more consistent results.', reminder:'The strongest sales strategy is not necessarily the most aggressive one. It is the strategy that uses limited resources where they are most likely to create sustainable value.' }
  },
  {
    id:'case-4', caseNumber:4, slug:'case-4', title:'The Opportunity of a Lifetime',
    teaser:'After years of growing inside the same company, a young marketing manager receives an unexpected offer that could transform her career forever.',
    level:'B2', levelGuidance:'', estimatedTime:'40–60 minutes', accessTier:'premium',
    company:'Hartwell Consumer Brands', industry:'Consumer Goods & Marketing', location:'New York, USA',
    characters:[{ name:'Eva Morales', role:'Marketing Manager' }],
    imageSharingUrl:'https://www.dropbox.com/scl/fi/38l76qci1o7qw2baoa3cc/case-4.png?rlkey=4zee2tw3h32ynpd1lfjarkcab&st=5hu8dtvs&dl=0',
    imageAlt:'A young marketing manager looking over the New York skyline while reflecting on an important career decision.',
    introduction:"Eva Morales has spent her entire professional career at Hartwell Consumer Brands. Just as she begins leading the company's biggest marketing campaign yet, she receives an offer that could change both her career and her life.",
    vocabulary:[
      ['promotion','advancement to a higher position'], ['internship','temporary work experience, often while studying'],
      ['executive committee','the group of senior leaders responsible for major company decisions'], ['stock options','the opportunity to buy company shares under special conditions'],
      ['relocation package','financial assistance provided when moving for a new job'], ['perks','additional benefits offered besides salary'],
      ['loyalty','continued support or commitment to a person or organisation'], ['career progression',"the advancement of someone's professional career"],
      ['report directly to','to work under the supervision of a senior executive'], ['once-in-a-lifetime opportunity','an opportunity that is unlikely to happen again']
    ],
    reading:{ title:'Background Brief', paragraphs:[
      'Hartwell Consumer Brands is a medium-sized company that develops and markets household products sold throughout North America. Although it is much smaller than many of its competitors, the company has earned a strong reputation for developing successful brands and promoting talented employees from within the organisation.',
      "Many of Hartwell's senior managers began their careers in junior positions, creating a workplace culture where long-term development and internal promotion are highly valued. Employees are encouraged to take on new responsibilities, work across departments, and gradually prepare for leadership positions rather than seeking rapid advancement elsewhere.",
      "The marketing department has played an important role in the company's recent growth. Increasing competition, changing consumer behaviour, and the rapid expansion of digital marketing have forced businesses throughout the industry to rethink how they communicate with customers and build brand loyalty.",
      'Hartwell has recently invested heavily in new product launches and national advertising campaigns. Several important projects are scheduled for the coming months, making this one of the busiest periods the marketing department has experienced in years.',
      "Eva Morales represents one of Hartwell's internal success stories. After joining the company as an intern while finishing university, she accepted a junior marketing position and gradually earned several promotions through consistently strong performance and growing leadership responsibilities.",
      'Today, Eva manages an important marketing team and is respected by both senior management and her colleagues. However, an unexpected opportunity has forced her to consider whether her future should remain with the company that developed her career or take a completely different direction.'
    ]},
    listening:{ title:'Executive Meeting', context:'Listen to Eva as she reflects on an unexpected career opportunity and the difficult decision she now faces.', audioSharingUrl:'https://www.dropbox.com/scl/fi/zgx1rrggocitgszxa0c9y/case-4.mp3?rlkey=2s0mcjwb9ri741qhjms43vgga&st=uu71172g&dl=0', transcript:[
      { speaker:'Eva Morales', text:'I joined Hartwell Consumer Brands when I was twenty-one, as a marketing intern during my final year of college. At the time, I was just grateful that someone had given me a chance. I stayed after graduation, accepted a junior position, and gradually worked my way up. Every promotion I’ve received has happened here.\n\nThis company taught me how to lead campaigns, manage budgets, present to executives, and recover when an idea failed. Several people here supported me before I had enough experience to prove myself. Now, at twenty-nine, I manage a team of twelve and oversee marketing for three of our most important product lines.\n\nYesterday, I received an offer from Meridian Global, one of the largest companies in the industry. They want me to become their Chief Marketing Officer.\n\nThe salary is almost double what I earn now. The position includes an annual performance bonus, stock options, private health insurance, a company car allowance, executive travel, and a relocation package. I’d have my own office in their headquarters, lead an international department of more than eighty people, and report directly to the CEO. They’re also offering me a place on the executive committee and the chance to shape the company’s global brand strategy.\n\nProfessionally, it’s the kind of opportunity that may never come again—especially at my age.\n\nBut leaving doesn’t feel like a simple career decision. Hartwell invested in me when I had very little to offer. My team trusts me, my director has supported every stage of my development, and we’re currently preparing the largest campaign in the company’s history. If I leave now, I know it will create a serious gap.\n\nPart of me believes loyalty means staying and continuing to build something with the people who helped me grow. Another part believes that everything I learned here was preparing me for an opportunity exactly like this.\n\nI have one week to decide whether I owe this company more of my future—or whether I owe it to myself to move forward.' }
    ]},
    quizQuestions:[
      { id:'q1', source:'Reading', question:"According to the Background Brief, what is one characteristic of Hartwell's corporate culture?", options:options('Most executives are hired from competing companies.','Employees are encouraged to develop their careers internally.','Promotions are based mainly on years of service.','The company focuses only on international expansion.'), correctAnswer:'b', explanation:'The reading explains that Hartwell values long-term employee development and promotes many of its leaders from within.' },
      { id:'q2', source:'Reading', question:'Why has the marketing department become increasingly important?', options:options('The company has stopped selling traditional products.','Consumer behaviour and market competition have changed significantly.','Marketing activities have been outsourced.','The company has reduced its advertising budget.'), correctAnswer:'b', explanation:'The Background Brief explains that increasing competition and changing consumer behaviour have made marketing more important than ever.' },
      { id:'q3', source:'Listening', question:'What position has Eva been offered?', options:options('Marketing Director','Regional Marketing Manager','Chief Marketing Officer','Vice President of Sales'), correctAnswer:'c', explanation:'Eva explains that Meridian Global has offered her the position of Chief Marketing Officer.' },
      { id:'q4', source:'Listening', question:"Which benefit is NOT mentioned as part of Eva's new job offer?", options:options('Stock options','Relocation package','Company car allowance','Unlimited paid vacation'), correctAnswer:'d', explanation:'Unlimited paid vacation is never mentioned during the speech.' },
      { id:'q5', source:'Combined', question:"What is Eva's main dilemma?", options:options('Choosing between two different universities.','Deciding whether to remain loyal to the company that developed her career or accept an exceptional opportunity elsewhere.','Deciding whether to relocate internationally.','Choosing between two different marketing campaigns.'), correctAnswer:'b', explanation:"The reading establishes Eva's history with Hartwell, while the audio presents the extraordinary external opportunity that challenges her loyalty." }
    ],
    speaking:{ questions:[
      'If you were Eva, would you accept the CMO position? Why or why not?',
      'Does an employee owe loyalty to a company that invested heavily in their development?',
      'At what point should career growth become more important than loyalty?',
      "If you were Eva's manager, what would you do to convince her to stay?",
      'Have you ever faced—or do you think you will face—a difficult career decision similar to Eva\'s?'
    ], tip:'Consider professional growth, financial opportunities, loyalty, leadership experience, work-life balance, and long-term career goals. Support your opinions with examples whenever possible.' },
    writingTask:{
      title:'Advise Eva', instructions:"Imagine you are Eva's professional mentor. Write a letter advising her whether she should remain at Hartwell Consumer Brands or accept Meridian Global's offer. Support your recommendation by discussing both the emotional and professional consequences of each option.",
      format:'Professional advisory letter', audience:'Eva Morales', wordRange:'180–220 words',
      planningQuestions:['What are the advantages of staying?','What are the advantages of leaving?','How important is loyalty?','Could she return one day with even more experience?','Which decision would best support her long-term goals?'],
      tips:[], usefulPhrases:['In your position, I would...','One important factor to consider is...','This opportunity could allow you to...','On the other hand...','Professional loyalty is valuable, but...','Whatever decision you make...','In the long term...','My recommendation would be...']
    },
    takeaway:{ text:'Career decisions are rarely based only on salary or job titles. Professional growth, loyalty, personal values, leadership opportunities, and long-term goals often compete with one another. The most successful careers are built by making thoughtful decisions that balance gratitude for the past with ambition for the future.', reminder:'Sometimes the hardest career decision is choosing between two excellent opportunities rather than between a good one and a bad one.' }
  }
];

export const getBusinessCase = slug => businessCases.find(item => item.slug === slug);
