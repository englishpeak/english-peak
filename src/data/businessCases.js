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
  },
  {
    id:'case-5', caseNumber:5, slug:'case-5', title:'The Billion-Dollar Decision',
    teaser:'A global retailer wants to acquire an extremely successful wellness company, but its founders are unsure whether selling the business would actually be the right decision.',
    level:'C1', levelGuidance:'', estimatedTime:'40–60 minutes', accessTier:'premium',
    company:'Pure Origins Wellness', industry:'E-commerce & Wellness Products', location:'New York, USA',
    characters:[
      { name:'David Carter', role:'Co-Founder & CEO' },
      { name:'Ethan Park', role:'Co-Founder & Chief Product Officer' }
    ],
    imageSharingUrl:'https://www.dropbox.com/scl/fi/2efd7llzhq0318yhbo5kq/case-5.png?rlkey=keb4fqjc1fkcghglaa3amggc1&st=nyg4ho5j&dl=0',
    imageAlt:'Two company founders discussing the possible sale of their business while waiting in an airport VIP lounge.',
    introduction:"David and Ethan founded Pure Origins Wellness from scratch. Years later, after building one of the fastest-growing wellness brands in the country, they are flying to Seattle to meet executives from one of the world's largest retailers, who want to acquire the entire company.",
    vocabulary:[
      ['acquisition','the purchase of one company by another'], ['valuation','the estimated financial value of a company'],
      ['shareholder','a person who owns part of a company'], ['equity','ownership in a business'],
      ['exit strategy','a plan for leaving or selling a business'], ['take a company public','to list a company on the stock market'],
      ['legacy','the long-term impact someone leaves behind'], ['generational wealth','wealth that can benefit future generations'],
      ['founder','a person who creates a company'], ['long-term vision','plans and objectives extending many years into the future']
    ],
    reading:{ title:'Background Brief', paragraphs:[
      'Pure Origins Wellness is an online retailer specializing in premium wellness products, nutritional supplements, and sustainable lifestyle goods. Founded less than a decade ago, the company has grown from a small start-up into one of the fastest-growing brands in its market through direct-to-consumer sales and a strong online community.',
      'Rather than relying on traditional retail stores, the founders invested heavily in digital marketing, customer education, subscription services, and product quality. Their strategy helped the company build an exceptionally loyal customer base while maintaining steady year-over-year growth.',
      'The wellness industry has become increasingly competitive as major retailers and global consumer brands continue investing in health-related products. Independent companies often face an important strategic question: continue growing independently or accept acquisition offers from larger organisations that can accelerate international expansion.',
      'Pure Origins Wellness has reached a point where it is financially successful, highly profitable, and recognised throughout the industry. The company now employs hundreds of people, ships products internationally, and continues expanding into new markets.',
      'For David Carter and Ethan Park, however, success has created a new challenge. Decisions that once focused on survival now involve long-term vision, leadership, and the future of a business that has become much larger than either of them originally imagined.',
      'The founders are travelling to Seattle for a meeting that could shape the future of both the company and their personal lives.'
    ]},
    listening:{ title:'Executive Meeting', context:'Listen to David and Ethan as they discuss the biggest decision they have ever faced while waiting for their flight to Seattle.', audioSharingUrl:'https://www.dropbox.com/scl/fi/scupev9i5ic6vkkr1gvab/case-5.mp3?rlkey=qruyj9w0f0i3gspqab3sod16i&st=7tjch78z&dl=0', transcript:[
      { speaker:'David Carter', text:"It's strange, isn't it? Five years ago we were packing orders ourselves in that tiny warehouse, wondering if we'd make enough sales to pay the rent. Now we're flying to Seattle because one of the biggest retailers in the world wants to buy everything we've built." },
      { speaker:'Ethan Park', text:"I still can't quite believe the number. Every time I look at it, it feels unreal. If we accept the offer, our families will never have to worry about money again. Not our children... probably not even our grandchildren." },
      { speaker:'David Carter', text:"Financially, it's almost impossible to say no. But every time I think about signing those papers, I keep asking myself something else. If we sell the company, what are we going to wake up excited about next Monday?" },
      { speaker:'Ethan Park', text:"That's exactly what's been bothering me. We've spent years talking about becoming the leading wellness brand in the world. Now someone is offering us the finish line before we've actually run the whole race." },
      { speaker:'David Carter', text:"On the other hand, maybe we're looking at it the wrong way. Building the company was never supposed to be about owning it forever. Maybe success means knowing when to let someone else take it to the next level." },
      { speaker:'Ethan Park', text:"Maybe... but they're not just buying a business. They're buying our culture, our team, our products... everything we've poured ourselves into. I can't help wondering whether the company would still feel like ours six months after the acquisition." },
      { speaker:'David Carter', text:"There's also the risk of waiting. Today the business is worth an incredible amount, but markets change. Consumer trends change. Competitors appear. We could spend another five years trying to double the valuation... or we could lose half of it." },
      { speaker:'Ethan Park', text:"True... but imagine where we could be if everything goes right. International expansion, new product lines, maybe even taking the company public one day. We'd probably work harder than ever, but we'd still be writing our own story." },
      { speaker:'David Carter', text:"Funny, isn't it? We started this company because we wanted freedom. Now we're trying to decide whether freedom means finally letting go... or having the chance to keep building." },
      { speaker:'Ethan Park', text:"Whatever we decide, tomorrow's meeting is probably going to be one of the most important conversations of our lives." }
    ]},
    quizQuestions:[
      { id:'q1', source:'Reading', question:'Why has Pure Origins Wellness grown so quickly?', options:options('It operates hundreds of physical stores.','It focused on digital marketing, subscriptions, product quality, and customer education.','It manufactures products for other retailers.','It offers the lowest prices in the industry.'), correctAnswer:'b', explanation:'The Background Brief explains that the founders invested in digital marketing, customer education, subscription services, and product quality.' },
      { id:'q2', source:'Reading', question:'According to the Background Brief, why do many successful independent companies receive acquisition offers?', options:options('Because they are required by law.','Because larger companies often want to accelerate expansion through acquisitions.','Because founders are forced to sell after ten years.','Because banks require ownership changes.'), correctAnswer:'b', explanation:'Larger organisations can use acquisitions to accelerate expansion, creating a strategic choice for successful independent companies.' },
      { id:'q3', source:'Listening', question:'What concerns David the most about selling?', options:options('Paying taxes.','Losing motivation and purpose after the sale.','Finding another office.','Relocating to Seattle.'), correctAnswer:'b', explanation:'David wonders what would excite and motivate the founders after they sold the company.' },
      { id:'q4', source:'Listening', question:'Why is Ethan hesitant about accepting the offer?', options:options('He believes the price is too low.','He worries the company could lose its culture and identity.','He dislikes travelling.','He wants to retire immediately.'), correctAnswer:'b', explanation:'Ethan worries that an acquisition could change the culture, team, products, and the company’s sense of identity.' },
      { id:'q5', source:'Combined', question:'What is the central dilemma?', options:options('Whether to expand internationally.','Whether to sell an already successful company for extraordinary wealth or continue building it independently.','Whether to hire more employees.','Whether to launch a new product.'), correctAnswer:'b', explanation:'The reading establishes the successful independent company, while the listening presents the choice between extraordinary financial security and continuing to build it.' }
    ],
    speaking:{ questions:[
      'If you were David or Ethan, would you sell the company? Why?',
      "Is there a point where additional wealth no longer changes someone's quality of life?",
      'Would you rather own an independent company or become extremely wealthy by selling it?',
      'How important should employees and company culture be when founders consider selling a business?',
      'Which would matter more to you: financial security for future generations or the opportunity to continue building something meaningful?'
    ], tip:'Consider financial security, personal purpose, leadership, company culture, employee responsibility, long-term vision, and business risk. Support your ideas with examples.' },
    writingTask:{
      title:'Advise the Founders', instructions:'Imagine you have been hired as an independent business consultant. Prepare a recommendation for David and Ethan explaining whether they should sell Pure Origins Wellness or continue operating independently. Consider financial, strategic, personal, and cultural factors before reaching your conclusion.',
      format:'Business recommendation', audience:'David Carter and Ethan Park', wordRange:'180–220 words',
      planningQuestions:[], tips:[], usefulPhrases:['Based on the available information...','One important consideration is...','Selling the company would...','Remaining independent would...','The long-term implications include...','From a strategic perspective...','My recommendation is...','Ultimately, the decision should...']
    },
    takeaway:{ text:'Some of the most difficult business decisions happen after success has already been achieved. Selling a company may provide extraordinary financial security, while continuing independently may offer purpose, creativity, and the opportunity to build an even greater legacy. The right decision depends not only on financial value, but also on personal values, long-term vision, and the kind of life the founders hope to create.', reminder:'Business success is not always measured by the highest price someone is willing to pay. Sometimes it is measured by the future you choose to build.' }
  },
  {
    id:'case-6', caseNumber:6, slug:'case-6', title:'The First Quarter Strategy',
    teaser:'The marketing department has budget for only one major initiative next quarter. Should it invest in attracting new customers or strengthening relationships with existing ones?',
    level:'B2', levelGuidance:'', estimatedTime:'40–60 minutes', accessTier:'premium',
    company:'BrightPath Digital', industry:'Marketing & Digital Services', location:'Austin, Texas, USA',
    characters:[
      { name:'Daniel Foster', role:'Marketing Director' },
      { name:'Sophia Reed', role:'Brand Manager' },
      { name:'Jason Miller', role:'Digital Marketing Manager' }
    ],
    imageSharingUrl:'https://www.dropbox.com/scl/fi/s8hfmn9iwval2ywin0dj3/case-6.png?rlkey=64bp0q988nt4tfyecl82io6q6&st=op8983p6&dl=0',
    imageAlt:'Three marketing leaders discussing strategic priorities in front of a planning whiteboard.',
    introduction:"As the year comes to an end, BrightPath Digital's marketing leadership team meets to define its priorities for the first quarter. Limited resources mean difficult choices, and the department must decide which investment will create the greatest long-term value.",
    vocabulary:[
      ['customer retention','keeping existing customers over time'], ['customer acquisition','gaining new customers'],
      ['onboarding','the process of helping new customers begin using a product or service'], ['loyalty programme','a system that rewards repeat customers'],
      ['brand awareness',"how familiar people are with a company's brand"], ['lead generation','attracting potential customers'],
      ['return on investment (ROI)','the value generated compared with the money invested'], ['marketing initiative','a planned marketing project or campaign'],
      ['lifetime value','the total revenue a customer is expected to generate over time'], ['competitive advantage','a factor that gives a company an advantage over competitors']
    ],
    reading:{ title:'Background Brief', paragraphs:[
      'BrightPath Digital is a fast-growing marketing agency that helps technology companies, software businesses, and online retailers develop digital marketing strategies, branding campaigns, and customer-engagement programmes. Over the past several years, the company has built a reputation for combining creative ideas with measurable business results.',
      'The agency has enjoyed another successful year, adding several important clients while expanding its internal marketing capabilities. Revenue has grown steadily, and management has approved a healthy budget for strategic initiatives during the coming year. However, even with additional investment available, the department cannot pursue every opportunity at the same time.',
      'Marketing leaders often face difficult decisions when resources are limited. Some strategies focus on attracting new customers and increasing market visibility, while others concentrate on strengthening relationships with existing customers through better experiences, improved communication, and long-term loyalty.',
      "The first quarter is particularly important because it establishes priorities for the rest of the year. Decisions made during this planning period influence budget allocation, staffing, campaign development, and the department's overall objectives.",
      'The leadership team has gathered for its annual planning meeting to determine which strategic direction should receive the greatest investment during the coming quarter.'
    ]},
    listening:{ title:'Executive Meeting', context:"Listen to three members of the marketing leadership team as they debate the department's biggest strategic decision for the first quarter.", audioSharingUrl:'https://www.dropbox.com/scl/fi/18w56hysgxp9weilo3alf/case-6.mp3?rlkey=qgue52c4f42m68axqwmlkrp8c&st=xny4703m&dl=0', transcript:[
      { speaker:'Daniel Foster', text:"Thanks, everyone. Before we leave for the holidays, I'd like us to agree on the department's priorities for the first quarter. We have enough budget to do one major initiative really well, but probably not two. The question is whether we invest in launching a completely new product line or focus on improving the experience for the customers we already have." },
      { speaker:'Sophia Reed', text:"My vote is to strengthen what we've already built. Customer retention has improved this year, but we still receive feedback about onboarding, email communication, and loyalty rewards. If we make existing customers happier, they'll buy more often and recommend us to others. That's usually less expensive than constantly trying to acquire new customers." },
      { speaker:'Jason Miller', text:"I agree that retention matters, but standing still isn't really an option anymore. Our competitors are launching new products every few months, and that's what generates attention. A successful product launch would create media coverage, social media engagement, and thousands of new leads. We can't rely on the same customer base forever." },
      { speaker:'Daniel Foster', text:"Both ideas make sense, but the budget won't allow us to do both at the level we'd like. If we divide the money equally, we risk ending up with two average projects instead of one excellent one." },
      { speaker:'Sophia Reed', text:'Maybe we should think beyond next quarter. Better customer retention creates predictable revenue, and predictable revenue gives us more freedom to invest in innovation later.' },
      { speaker:'Jason Miller', text:"That's true, but innovation is also what keeps a brand relevant. If customers stop seeing anything new from us, they'll eventually start paying attention to someone else." },
      { speaker:'Daniel Foster', text:"Perhaps the real challenge isn't choosing between growth and loyalty. It's deciding which investment is more likely to strengthen the business twelve months from now, not just next quarter." }
    ]},
    quizQuestions:[
      { id:'q1', source:'Reading', question:"Why can't BrightPath Digital pursue every marketing initiative?", options:options('The company is losing money.','The department has limited resources despite having a healthy budget.','Most employees are leaving the company.','Clients have cancelled their contracts.'), correctAnswer:'b', explanation:'The Background Brief explains that although the budget has increased, the department still cannot fund every initiative at the same time.' },
      { id:'q2', source:'Reading', question:'According to the Background Brief, why is the first quarter especially important?', options:options('It is when most employees take holidays.','It determines priorities and resource allocation for the rest of the year.',"It is the company's busiest sales season.",'It is when annual salaries are negotiated.'), correctAnswer:'b', explanation:'The reading states that first-quarter planning influences budgets, staffing, campaigns, and strategic objectives throughout the year.' },
      { id:'q3', source:'Listening', question:"What does Sophia believe should be the department's priority?", options:options('Launching a completely new product line.','Expanding internationally.','Improving the experience of existing customers.','Increasing television advertising.'), correctAnswer:'c', explanation:'Sophia argues that customer retention creates stronger long-term value and encourages repeat business.' },
      { id:'q4', source:'Listening', question:'Why does Jason support launching something new?', options:options('Existing customers are leaving the company.','Innovation attracts attention and helps keep the brand competitive.','The company has already cancelled its loyalty programme.','Product launches require less investment.'), correctAnswer:'b', explanation:'Jason believes innovation creates publicity, generates new leads, and keeps the company relevant.' },
      { id:'q5', source:'Combined', question:'What is the central strategic dilemma?', options:options('Whether to increase employee salaries.','Whether to prioritise customer acquisition or customer retention.','Whether to relocate the marketing department.','Whether to outsource marketing activities.'), correctAnswer:'b', explanation:'Both the reading and the meeting focus on deciding how limited marketing resources should be invested for the greatest long-term benefit.' }
    ],
    speaking:{ questions:[
      'If you were Daniel Foster, which strategy would you choose for the first quarter? Why?',
      'Is it generally more expensive to acquire new customers than to retain existing ones?',
      'How would you divide a marketing budget between innovation and customer loyalty?',
      'Can a company remain competitive without regularly launching new products or services?',
      'Which metric would you use to determine whether the chosen strategy was successful after one year?'
    ], tip:'Think about customer lifetime value, acquisition costs, return on investment, brand awareness, competitive advantage, and sustainable growth. Support your answers with practical examples whenever possible.' },
    writingTask:{
      title:'Develop the Q1 Marketing Strategy', instructions:'Imagine you are an external marketing consultant hired by BrightPath Digital. Write a strategic recommendation explaining how the department should invest its first-quarter budget. Decide whether to prioritise customer acquisition, customer retention, or a balanced approach, and justify your recommendation with clear business arguments.',
      format:'Strategic marketing recommendation', audience:'Daniel Foster, Marketing Director', wordRange:'180–220 words',
      planningQuestions:[], tips:[], usefulPhrases:['I recommend prioritising...','A balanced strategy would...','The available budget should...','Customer retention provides...','Customer acquisition can...','A successful first quarter should...','This investment is likely to...','Performance should be measured by...']
    },
    takeaway:{ text:'Successful marketing is rarely about choosing between two good ideas. It is about deciding which investment will create the greatest long-term value when resources are limited. The strongest organisations understand that attracting new customers and retaining existing ones are both essential—but not always equally urgent.', reminder:'Great marketing strategy is not about doing everything. It is about choosing the right priorities at the right time.' }
  },
  {
    id:'case-7', caseNumber:7, slug:'case-7', title:'Behind the Numbers',
    teaser:'Quarterly results are improving, but they still fall short of expectations. Two senior finance executives must decide how the company should respond before presenting the numbers to the board.',
    level:'C1', levelGuidance:'', estimatedTime:'40–60 minutes', accessTier:'premium',
    company:'Sterling Industrial Group', industry:'Industrial Technology & Business Services', location:'Chicago, USA',
    characters:[
      { name:'Richard Whitmore', role:'Chief Financial Officer' },
      { name:'Alex Navarro', role:'Senior VP of Financial Planning & Analysis' }
    ],
    imageSharingUrl:'https://www.dropbox.com/scl/fi/q2lmny8p33593e0wk1r01/case-7.png?rlkey=g11gb4wvew5po532p48wtrfmq&st=ddi8ihp2&dl=0',
    imageAlt:'Two senior finance executives reviewing quarterly results in a corporate boardroom before a board presentation.',
    introduction:'Sterling Industrial Group has completed its second quarter. Performance improved compared with Q1, but several important financial targets were missed. Before presenting the results to the board, two senior finance executives must determine what corrective measures they are prepared to recommend.',
    vocabulary:[
      ['forecast','a prediction of future financial performance'], ['revenue','the total income generated by a business'],
      ['operating profit','profit generated from a company’s normal business activities'], ['cash flow','money moving into and out of a business'],
      ['discretionary spending','expenses that can be reduced or postponed if necessary'], ['underperform','to achieve results below expectations'],
      ['cost reduction','measures taken to decrease business expenses'], ['revise a forecast','to change a financial prediction based on new information'],
      ['profit target','the amount of profit a company expects or aims to achieve'], ['freeze hiring','to temporarily stop recruiting new employees']
    ],
    reading:{ title:'Background Brief', paragraphs:[
      'Sterling Industrial Group is a diversified business-services and industrial-technology company with operations across the United States. The company provides equipment, software, logistics support, and specialised services to corporate customers in several industries.',
      'Over the past few years, Sterling has expanded steadily through a combination of organic growth and investment in new regional operations. Management has also increased spending on technology, marketing, recruitment, and infrastructure to support the company’s longer-term plans.',
      'Like most publicly accountable businesses, Sterling prepares detailed financial forecasts before each fiscal year. These projections help senior management establish revenue targets, control expenses, allocate resources, and communicate expectations to the board.',
      'Quarterly performance is therefore evaluated not only against previous periods, but also against the targets established in the annual financial plan. A company can grow compared with the previous quarter and still disappoint management if actual results fall below forecast.',
      'Sterling has now completed its second quarter. The finance department is preparing the company’s financial presentation for the upcoming board meeting, where directors will review performance and question management about the outlook for the remainder of the year.',
      'Before that meeting takes place, the company’s CFO and one of his senior financial executives are reviewing the numbers and discussing what management should recommend next.'
    ]},
    listening:{ title:'Executive Meeting', context:'Listen to two senior finance executives as they review the Q2 results and decide what they should recommend to the board.', audioSharingUrl:'https://www.dropbox.com/scl/fi/47adbcaatunpwsvkcaisx/case-7.mp3?rlkey=f2gizg6tfzsqpmh0jb5vo6g2y&st=tijjf49g&dl=0', transcript:[
      { speaker:'Richard Whitmore', text:'Q2 was definitely better than Q1. Revenue increased eleven percent and cash flow improved. The problem is that we’re still six percent below our revenue forecast and twelve percent below our operating profit target.' },
      { speaker:'Alex Navarro', text:'And that’s what the board will focus on. We need to explain the gap, but more importantly, show them what we’re going to do about it.' },
      { speaker:'Richard Whitmore', text:'Part of it is timing. Three major contracts we expected in June have moved into Q3. But logistics costs were also higher than expected, and the West Coast division underperformed again.' },
      { speaker:'Alex Navarro', text:'We could reduce discretionary spending for the rest of the year—travel, consultants, recruitment, some marketing. That would help us get closer to the original profit target.' },
      { speaker:'Richard Whitmore', text:'I’m concerned we’d be protecting this year’s numbers by cutting investments we need for next year.' },
      { speaker:'Alex Navarro', text:'Then let’s be more selective. Freeze hiring in the underperforming division, renegotiate the logistics contracts, and postpone the office expansion. I’d also revise the full-year forecast slightly.' },
      { speaker:'Richard Whitmore', text:'Lowering the forecast could make the board think we’ve lost confidence.' },
      { speaker:'Alex Navarro', text:'Maybe. But maintaining a target we no longer believe in creates a bigger credibility problem. We can show that revenue is still growing while acknowledging that some areas need attention.' },
      { speaker:'Richard Whitmore', text:'All right. We’ll recommend the targeted measures and a revised forecast. But let’s also prepare a more aggressive cost-reduction plan in case Q3 doesn’t improve.' },
      { speaker:'Alex Navarro', text:'Agreed. We don’t need to panic. We just need to show the board that we understand the problem and have a plan to protect both this year and the next.' }
    ]},
    quizQuestions:[
      { id:'q1', source:'Reading', question:'Why does Sterling Industrial Group prepare financial forecasts?', options:options('To guarantee that quarterly profits increase','To establish targets and help management allocate resources','To determine employee vacation schedules','To eliminate the need for quarterly reporting'), correctAnswer:'b', explanation:'The Background Brief explains that forecasts are used to establish targets, control expenses, allocate resources, and communicate expectations.' },
      { id:'q2', source:'Reading', question:'Why can a company improve compared with the previous quarter and still disappoint management?', options:options('Previous-quarter comparisons are never considered.','Growth automatically increases operating costs.','Actual performance may still fall below the company’s forecast.','Boards only evaluate annual revenue.'), correctAnswer:'c', explanation:'Quarterly results are evaluated against both previous performance and previously established financial targets.' },
      { id:'q3', source:'Listening', question:'What contributed to Sterling’s Q2 revenue gap?', options:options('Three expected contracts were delayed until Q3.','The company lost its three largest customers.','Product prices were reduced.','A new competitor entered the market.'), correctAnswer:'a', explanation:'Richard explains that three contracts expected in June have moved into the third quarter.' },
      { id:'q4', source:'Listening', question:'Why is Richard hesitant about making broad spending cuts?', options:options('He believes the company has too much cash.','He worries that reducing investment now could hurt future performance.','The board has prohibited cost reductions.','He wants to increase travel spending.'), correctAnswer:'b', explanation:'Richard is concerned that protecting the current year’s results could mean cutting investments needed for the following year.' },
      { id:'q5', source:'Combined', question:'What is the central challenge facing Richard and Alex?', options:options('Deciding whether to cancel the board meeting','Finding a way to hide the Q2 results','Responding realistically to missed targets without damaging the company’s longer-term prospects','Deciding whether to close the company'), correctAnswer:'c', explanation:'The case focuses on balancing short-term financial discipline with transparency, credibility, and longer-term investment.' }
    ],
    speaking:{ questions:[
      'If you were Richard, would you revise the annual forecast or continue targeting the original number?',
      'Do you agree that cutting investments to protect short-term profits can sometimes damage a company’s future?',
      'Which expenses would you reduce first if your company needed to improve profitability quickly?',
      'How should executives present disappointing financial results without making the situation appear worse—or better—than it really is?',
      'At what point should a company move from targeted cost reductions to more aggressive measures?'
    ], tip:'Consider credibility, profitability, cash flow, forecasts, cost control, long-term investment, and shareholder expectations. Try to distinguish between temporary problems and structural problems when explaining your strategy.' },
    writingTask:{
      title:'Prepare the Board Recommendation', instructions:'Imagine you are an external financial adviser working with Sterling Industrial Group. Write a short recommendation for the board explaining how management should respond to the Q2 results.\n\nDecide whether the company should maintain or revise its annual forecast and recommend specific measures for controlling costs without unnecessarily damaging future growth.',
      format:'Board recommendation', audience:'Sterling Industrial Group Board of Directors', wordRange:'180–220 words',
      planningQuestions:['How serious is the Q2 miss?','Which problems appear temporary?','Which problems require management action?','Should the annual forecast be revised?','Which costs should be reduced or postponed?','Under what circumstances should more aggressive action be taken?'],
      tips:[], usefulPhrases:['Although Q2 performance improved...','The results remain below forecast because...','Management should consider...','Rather than implementing broad cuts...','A more targeted approach would...','The full-year forecast should...','This would allow the company to...','If performance does not improve by Q3...','From a long-term perspective...','Our recommendation is to...']
    },
    takeaway:{ text:'Strong financial leadership requires more than reporting whether results are good or bad. Executives must understand why performance differs from expectations, distinguish temporary problems from deeper weaknesses, and decide how aggressively the company should respond.\n\nReducing costs can protect short-term profitability, but excessive cuts may weaken future growth. At the same time, unrealistic forecasts can damage management’s credibility with the board.', reminder:'A strong financial strategy does not simply make the numbers look better. It helps the company make better decisions because of what the numbers reveal.' }
  },
  {
    id:'case-8', caseNumber:8, slug:'case-8', title:'The Dubai Decision',
    teaser:'A European technology consultancy is preparing to open its Middle East operation in Dubai, but getting the structure right may be more important than meeting the original launch date.',
    level:'C1', levelGuidance:'', estimatedTime:'40–60 minutes', accessTier:'premium',
    company:'Nexora Consulting Group', industry:'Technology Consulting & Professional Services', location:'Dubai, United Arab Emirates',
    characters:[
      { name:'Thomas Keller', role:'Chief Operating Officer' },
      { name:'Omar Haddad', role:'Regional Expansion Director' }
    ],
    imageSharingUrl:'https://www.dropbox.com/scl/fi/029pr7dq07sg0zha9wayn/case-8.png?rlkey=h5kf1k8dipx4r0afh640rg2h5&st=xw3smma0&dl=0',
    imageAlt:'Two senior executives reviewing documents while discussing the launch of a new business operation in Dubai.',
    introduction:'Nexora Consulting Group has chosen Dubai as the location for its new Middle East hub. After months of planning, the company is approaching the final stages of its expansion—but several legal, operational, and strategic decisions still need to be made before the new office can begin commercial operations.',
    vocabulary:[
      ['business setup','the process of legally establishing a new company or operation'],
      ['trade licence','official authorisation allowing a company to conduct specified business activities'],
      ['mainland company','a company licensed to operate from Dubai mainland'],
      ['free zone','a designated business area with its own setup framework and regulations'],
      ['business activity','the specific commercial or professional activity a company is licensed to perform'],
      ['corporate tax','tax applied to the taxable income or profits of businesses'],
      ['VAT registration','the process of registering a qualifying business for Value Added Tax'],
      ['commercial launch','the point at which a company officially begins selling or providing services'],
      ['relocate','to move employees or operations to another location'],
      ['regulatory compliance','following the laws, regulations, and official requirements that apply to a business'],
      ['legal structure','the formal legal organisation under which a business operates'],
      ['regional hub','an office or operation used to manage business activities across a particular geographic region']
    ],
    reading:{ title:'Background Brief', paragraphs:[
      'Nexora Consulting Group is a European technology and business-consulting company that works primarily with large corporations. Its services include digital transformation, data strategy, technology implementation, and operational consulting.',
      'Over the past several years, demand from clients in the Middle East has increased significantly. Until now, Nexora has managed most projects in the region from its European offices, with consultants travelling internationally whenever clients required on-site support.',
      "Management believes this model is no longer sufficient. The Middle East now represents one of the company's fastest-growing markets, and several important clients have asked Nexora to establish a permanent regional presence.",
      'After evaluating several cities, the company selected Dubai as the location for its Middle East hub. Management believes the city offers access to regional clients, international talent, strong transportation connections, and a highly developed business environment.',
      'Establishing a permanent operation, however, requires considerably more planning than simply opening an office. The company must determine the appropriate legal structure, obtain the necessary business licence, establish banking arrangements, complete relevant tax registrations, arrange office facilities, and prepare employment and residency documentation for employees relocating to the UAE.',
      "Nexora originally planned to begin commercial operations in January. The board has already communicated the Dubai expansion as an important part of the company's international growth strategy.",
      "Thomas Keller, the company's Chief Operating Officer, and Omar Haddad, its Regional Expansion Director, have spent the week in Dubai meeting advisers, potential clients, and local business representatives. Before returning to Europe, they need to decide what they will recommend to the board."
    ]},
    listening:{ title:'Executive Meeting', context:'Listen to Thomas and Omar as they discuss how Nexora should structure its new Dubai operation and whether the company should reconsider its original launch schedule.', audioSharingUrl:'https://www.dropbox.com/scl/fi/exjr8y78mkuvasobdc6nc/case-8.mp3?rlkey=s80mdwz4gt0zm954n6r1pogxy&st=pijvj94o&dl=0', transcript:[
      { speaker:'Thomas Keller', text:"So, we're flying home tomorrow, and I still don't think we've answered the most important question. Do we establish the Dubai operation in a free zone, or do we go directly with a mainland company?" },
      { speaker:'Omar Haddad', text:"Six months ago, I would have said free zone immediately. It's attractive for an international company like ours, and several of them are designed specifically for technology and professional services. But after this week's meetings, I'm leaning toward mainland." },
      { speaker:'Thomas Keller', text:'Because of the potential clients?' },
      { speaker:'Omar Haddad', text:"Exactly. Three of the companies we've spoken to want us working directly with their UAE operations. If Dubai is going to become a real regional office rather than just a base for international projects, we need to structure it properly from the beginning." },
      { speaker:'Thomas Keller', text:"Which also means more decisions. We need the right trade licence, office arrangements, corporate tax registration, potentially VAT registration, employment documentation... and we're planning to relocate at least eight people in the first year." },
      { speaker:'Omar Haddad', text:"That's why I'm against rushing the launch just to meet the January target. We should use local legal and tax advisers, confirm exactly which activities need to appear on the licence, and make sure the structure works with our contracts." },
      { speaker:'Thomas Keller', text:"The board won't love a delay. They've already announced Dubai as our Middle East hub." },
      { speaker:'Omar Haddad', text:'A six-week delay is easier to explain than discovering six months from now that we chose the wrong structure and have to reorganize everything.' },
      { speaker:'Thomas Keller', text:'Fair. What if we keep January as the internal target but move the commercial launch to February? That gives us time to finish the licensing, tax registrations, banking, visas, and office setup properly.' },
      { speaker:'Omar Haddad', text:"I'd support that. Dubai is supposed to be a long-term investment. I'd rather enter the market six weeks late with the right structure than six weeks early with the wrong one." }
    ]},
    quizQuestions:[
      { id:'q1', source:'Reading', question:'Why has Nexora decided to establish a permanent presence in the Middle East?', options:options('European operations have become unprofitable.','Demand from Middle Eastern clients has increased and the existing travel-based model is becoming insufficient.','The company has been ordered to relocate by its largest client.','Dubai offered the company free office space.'), correctAnswer:'b', explanation:'The Background Brief explains that regional demand has grown significantly and several important clients now expect a more permanent presence.' },
      { id:'q2', source:'Reading', question:"Which of the following is part of establishing Nexora's Dubai operation?", options:options('Only renting office space',"Changing the company's European headquarters",'Managing legal, licensing, tax, banking, employment, and office requirements','Closing its existing international operations'), correctAnswer:'c', explanation:'The reading makes clear that international expansion involves several legal and operational requirements beyond simply obtaining an office.' },
      { id:'q3', source:'Listening', question:'Why has Omar become more interested in a mainland structure?', options:options('The company wants to abandon its international clients.','Several potential clients want Nexora working directly with their UAE operations.','Mainland companies do not require business licences.','The board specifically ordered him to choose mainland.'), correctAnswer:'b', explanation:'Omar explains that conversations with potential clients changed his view of how the Dubai operation may need to function.' },
      { id:'q4', source:'Listening', question:'Why does Omar oppose rushing the January launch?', options:options('He does not believe Dubai is a good market.','He wants to cancel the expansion completely.','He believes choosing the wrong structure could create larger problems later.','He wants all employees to remain in Europe.'), correctAnswer:'c', explanation:'Omar argues that a short delay is preferable to discovering later that the company selected an unsuitable legal and operational structure.' },
      { id:'q5', source:'Combined', question:'What is the central management dilemma in this case?', options:options('Whether Nexora should abandon its Middle East expansion.','Whether the company should prioritise meeting its original launch schedule or take additional time to establish the Dubai operation correctly.','Whether Thomas or Omar should become CEO.','Whether the company should stop working with UAE clients.'), correctAnswer:'b', explanation:"The reading establishes the company's expansion plans and January target, while the listening reveals the executives' concern that rushing the process could create long-term structural and regulatory problems." }
    ],
    speaking:{ questions:[
      'If you were Thomas or Omar, would you accept a six-week delay to make sure the new operation was established correctly? Why?',
      'When entering a foreign market, should companies prioritise speed or regulatory certainty?',
      'What factors should an international company consider when choosing between different legal structures in a new country?',
      'Do you think companies sometimes announce expansion plans too early, before the operational details have been resolved?',
      'Imagine the board insists on maintaining the January launch date. What alternative strategy would you propose?'
    ], tip:'Consider legal compliance, client access, taxation, licensing, reputation, operational flexibility, employee relocation, cost, speed, and long-term strategy. There may not be one perfect solution, so explain the trade-offs behind your recommendation.' },
    writingTask:{
      title:'Recommend the Dubai Entry Strategy', instructions:'Imagine you are an international business consultant advising Nexora Consulting Group.\n\nWrite a recommendation explaining how the company should approach the launch of its Dubai operation.\n\nConsider the choice of business structure, regulatory compliance, access to clients, the January deadline, employee relocation, and the long-term purpose of the Dubai office.\n\nYou do not need to provide detailed legal advice. Your task is to make a strategic business recommendation based on the information presented in the case.',
      format:'International expansion recommendation', audience:'Nexora Consulting Group Board of Directors', wordRange:'180–220 words',
      planningQuestions:["What should be Nexora's main priority?",'Is meeting the January deadline essential?','What are the risks of rushing the setup?','What are the risks of delaying?','What professional advice should the company obtain?','How should management explain its decision to the board?'],
      tips:[], usefulPhrases:['Before entering the market...','The company should prioritise...','From a regulatory perspective...','One potential risk is...','A short delay would allow...','Rather than rushing the process...','Management should ensure that...','The long-term benefits would...','I would recommend...','The proposed strategy would allow Nexora to...']
    },
    takeaway:{ text:'International expansion involves much more than identifying an attractive market. Companies must also choose an appropriate legal structure, understand local regulations, prepare their workforce, establish financial and administrative systems, and ensure that the new operation supports their long-term commercial strategy.\n\nDeadlines matter, but entering a new market with the wrong structure can create significantly greater problems later.', reminder:'Successful international expansion is not simply about entering a market quickly. It is about building an operation that can succeed there for years.' }
  }
];

export const getBusinessCase = slug => businessCases.find(item => item.slug === slug);
