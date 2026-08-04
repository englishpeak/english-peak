export const businessCases = [
  {
    id: 'case-1', slug: 'case-1', title: 'The Airport Lounge Decision',
    summary: 'Two business travellers weigh a time-sensitive partnership while waiting for their flights.',
    level: 'B2', category: 'Strategy & partnerships', estimatedTime: '45–60 minutes',
    imageUrl: '/businesscases/assets/airport-lounge.svg', imageAlt: 'Two business travellers discussing documents in an airport lounge',
    introduction: 'A delayed flight gives two colleagues time to make an important recommendation.',
    context: { title: 'Context', paragraphs: [
      'Emma Reed, commercial director at Northstar Mobility, is travelling to Berlin with Daniel Cho, the company’s operations manager. Northstar makes software that helps medium-sized companies organise employee travel. While they wait in an airport lounge, they receive a proposal from AeroLink, a much larger travel platform.',
      'AeroLink wants to include Northstar’s software in its service and promises access to thousands of new customers. However, the agreement must be signed within ten days. It would also require Northstar to customise the product quickly and postpone improvements already promised to existing clients.',
      'Emma sees an opportunity to grow internationally. Daniel is concerned about the tight schedule, the pressure on their team, and the risk of disappointing loyal customers. They need to recommend whether to accept the offer, negotiate different terms, or decline it.'
    ], usefulVocabulary: [] },
    listening: { title: 'The conversation', audioUrl: '', transcript: 'Temporary transcript reserved for a future transcript control.', speakers: ['Emma Reed', 'Daniel Cho'] },
    comprehensionQuestions: [
      { id:'q1', source:'reading', question:'What does Northstar Mobility produce?', options:[{id:'a',text:'Aircraft parts'},{id:'b',text:'Business travel software'},{id:'c',text:'Airport furniture'},{id:'d',text:'Language courses'}], correctAnswer:'b', explanation:'The context says Northstar makes software for organising employee travel.' },
      { id:'q2', source:'reading', question:'Why is the proposal difficult to accept?', options:[{id:'a',text:'AeroLink is too small'},{id:'b',text:'Emma is leaving the company'},{id:'c',text:'It requires fast customisation and may delay existing work'},{id:'d',text:'The product cannot be customised'}], correctAnswer:'c', explanation:'The short deadline creates pressure and conflicts with promises to current clients.' },
      { id:'q3', source:'listening', question:'What benefit does Emma emphasise in the demonstration conversation?', options:[{id:'a',text:'Lower office rent'},{id:'b',text:'International growth'},{id:'c',text:'A longer holiday'},{id:'d',text:'Fewer customers'}], correctAnswer:'b', explanation:'Emma focuses on the opportunity to reach new international customers.' },
      { id:'q4', source:'listening', question:'What is Daniel’s main concern?', options:[{id:'a',text:'Pressure on the team'},{id:'b',text:'The airport food'},{id:'c',text:'A missing passport'},{id:'d',text:'The company name'}], correctAnswer:'a', explanation:'Daniel worries the timetable will put too much pressure on the team.' },
      { id:'q5', source:'combined', question:'Which response best addresses both the opportunity and the operational risk?', options:[{id:'a',text:'Accept every term immediately'},{id:'b',text:'Ignore the proposal'},{id:'c',text:'Negotiate a phased launch and a longer deadline'},{id:'d',text:'Cancel all existing contracts'}], correctAnswer:'c', explanation:'A phased launch could preserve the growth opportunity while reducing delivery pressure.' }
    ],
    conversationQuestions: ['What would you do if you were Emma?','Do you think accepting AeroLink’s proposal is a risky strategy? Why?','Which option would you choose: accept, negotiate, or decline?','What could Northstar do to protect its existing clients?','How would you explain your recommendation to the Northstar team?'],
    writingTask: { title:'Recommend a way forward', instructions:'Write an email to Northstar’s CEO recommending whether the company should accept, negotiate, or decline AeroLink’s proposal. Support your recommendation with benefits, risks, and practical next steps.', format:'Professional email', wordRange:'180–220 words', tips:['State your recommendation early.','Balance the commercial opportunity against delivery risks.','Finish with clear next steps.'], usefulPhrases:['I recommend that we…','The main advantage would be…','To reduce the risk, we could…'], planningQuestions:['What is your preferred option?','Which two reasons support it?','What conditions or next steps are necessary?'] }
  }
];

export const getBusinessCase = slug => businessCases.find(item => item.slug === slug);
