// Server-only vocabulary. Never import this module from a browser entry point.
// Vercel excludes api/** from static output and /_ paths from API entrypoints.
// The API handler bundles this imported module server-side.
// Append future sets here; IDs stay stable and the UI derives its count and order.
/**
 * @typedef {Object} DictionaryEntry
 * @property {string} id
 * @property {string} word
 * @property {'noun'|'verb'|'adjective'|'adverb'} partOfSpeech
 * @property {string} definition
 * @property {[string, string]} examples
 * @property {string[]} collocations
 */

/** @type {DictionaryEntry[]} */
export const TOEFL_DICTIONARY = [
  {
    "id": "set-1-analyze",
    "word": "Analyze",
    "partOfSpeech": "verb",
    "definition": "To examine something carefully in order to understand its parts, causes or meaning.",
    "examples": [
      "Researchers analyzed soil samples to identify possible contaminants.",
      "Students must analyze how the author supports the main argument."
    ],
    "collocations": [
      "analyze data",
      "analyze results",
      "analyze a problem"
    ]
  },
  {
    "id": "set-1-assess",
    "word": "Assess",
    "partOfSpeech": "verb",
    "definition": "To evaluate the quality, importance, effect or condition of something.",
    "examples": [
      "The committee assessed the long-term costs of the proposal.",
      "The study aims to assess how noise affects students' concentration."
    ],
    "collocations": [
      "assess the impact",
      "assess the risk",
      "assess performance"
    ]
  },
  {
    "id": "set-1-assume",
    "word": "Assume",
    "partOfSpeech": "verb",
    "definition": "To accept something as true without having definite proof.",
    "examples": [
      "The researchers initially assumed that all participants had internet access.",
      "We should not assume that a correlation proves causation."
    ],
    "collocations": [
      "assume that",
      "generally assume",
      "assume without evidence"
    ]
  },
  {
    "id": "set-1-benefit",
    "word": "Benefit",
    "partOfSpeech": "noun",
    "definition": "A positive effect or advantage that something provides.",
    "examples": [
      "One benefit of online courses is that students can review recorded lectures.",
      "The new policy could provide long-term benefits to rural communities."
    ],
    "collocations": [
      "economic benefits",
      "long-term benefits",
      "a major benefit"
    ]
  },
  {
    "id": "set-1-coherent",
    "word": "Coherent",
    "partOfSpeech": "adjective",
    "definition": "Logical, consistent and easy to understand.",
    "examples": [
      "The speaker presented a coherent explanation of the research findings.",
      "A strong academic essay needs a coherent argument from beginning to end."
    ],
    "collocations": [
      "coherent argument",
      "coherent explanation",
      "coherent structure"
    ]
  },
  {
    "id": "set-1-compile",
    "word": "Compile",
    "partOfSpeech": "verb",
    "definition": "To collect information from different sources and arrange it in an organized form.",
    "examples": [
      "The research team compiled survey responses into a single report.",
      "Students compiled a list of references before writing their papers."
    ],
    "collocations": [
      "compile data",
      "compile a report",
      "compile a list"
    ]
  },
  {
    "id": "set-1-comprehensive",
    "word": "Comprehensive",
    "partOfSpeech": "adjective",
    "definition": "Including all or nearly all the important details or aspects of something.",
    "examples": [
      "The textbook provides a comprehensive overview of environmental policy.",
      "A comprehensive analysis must consider both costs and benefits."
    ],
    "collocations": [
      "comprehensive review",
      "comprehensive analysis",
      "comprehensive overview"
    ]
  },
  {
    "id": "set-1-consequently",
    "word": "Consequently",
    "partOfSpeech": "adverb",
    "definition": "As a result of something that happened previously.",
    "examples": [
      "The region received very little rainfall; consequently, crop yields decreased.",
      "The sample size was small. Consequently, the findings should be interpreted cautiously."
    ],
    "collocations": []
  },
  {
    "id": "set-1-considerable",
    "word": "Considerable",
    "partOfSpeech": "adjective",
    "definition": "Large or important in amount, size or degree.",
    "examples": [
      "The renovation of the historic building required a considerable investment.",
      "There is considerable evidence that sleep influences memory."
    ],
    "collocations": [
      "considerable effort",
      "considerable evidence",
      "considerable amount"
    ]
  },
  {
    "id": "set-1-contribute",
    "word": "Contribute",
    "partOfSpeech": "verb",
    "definition": "To be one of the causes of something or help produce a particular result.",
    "examples": [
      "Agricultural activities can contribute to water pollution.",
      "Several economic factors contributed to the decline in university enrollment."
    ],
    "collocations": [
      "contribute to a problem",
      "contribute to growth",
      "contribute to a decline"
    ]
  },
  {
    "id": "set-1-crucial",
    "word": "Crucial",
    "partOfSpeech": "adjective",
    "definition": "Extremely important or necessary for something to succeed or happen.",
    "examples": [
      "Access to clean water is crucial for maintaining public health.",
      "The final experiment played a crucial role in confirming the hypothesis."
    ],
    "collocations": [
      "crucial role",
      "crucial factor",
      "crucial for success"
    ]
  },
  {
    "id": "set-1-decline",
    "word": "Decline",
    "partOfSpeech": "verb",
    "definition": "To decrease in amount, number, quality or strength.",
    "examples": [
      "The number of visitors declined during the winter months.",
      "Air quality declined as traffic increased in the city."
    ],
    "collocations": [
      "decline sharply",
      "decline gradually",
      "decline over time"
    ]
  },
  {
    "id": "set-1-demonstrate",
    "word": "Demonstrate",
    "partOfSpeech": "verb",
    "definition": "To show clearly that something is true or how something works.",
    "examples": [
      "The results demonstrate that regular practice improves information retention.",
      "The instructor demonstrated how the device measures temperature."
    ],
    "collocations": [
      "demonstrate a relationship",
      "demonstrate that",
      "clearly demonstrate"
    ]
  },
  {
    "id": "set-1-derive",
    "word": "Derive",
    "partOfSpeech": "verb",
    "definition": "To obtain or develop something from a particular source.",
    "examples": [
      "Many medicines are derived from compounds found in plants.",
      "Researchers derived their conclusions from several independent studies."
    ],
    "collocations": [
      "derive from",
      "derive information from",
      "derive conclusions from"
    ]
  },
  {
    "id": "set-1-diverse",
    "word": "Diverse",
    "partOfSpeech": "adjective",
    "definition": "Including people, ideas or things of many different types.",
    "examples": [
      "The university attracts students from diverse cultural backgrounds.",
      "Growing a diverse range of crops can make farms more resilient."
    ],
    "collocations": [
      "diverse backgrounds",
      "diverse perspectives",
      "diverse range of"
    ]
  },
  {
    "id": "set-1-emphasize",
    "word": "Emphasize",
    "partOfSpeech": "verb",
    "definition": "To give special importance or attention to something.",
    "examples": [
      "The professor emphasized the need to cite reliable sources.",
      "The report emphasizes the importance of reducing industrial waste."
    ],
    "collocations": [
      "emphasize the importance of",
      "strongly emphasize",
      "emphasize the need for"
    ]
  },
  {
    "id": "set-1-empirical",
    "word": "Empirical",
    "partOfSpeech": "adjective",
    "definition": "Based on observation, experience or experiments rather than theory alone.",
    "examples": [
      "The theory gained support from empirical evidence.",
      "Scientists collected empirical data during the field study."
    ],
    "collocations": [
      "empirical evidence",
      "empirical research",
      "empirical data"
    ]
  },
  {
    "id": "set-1-enhance",
    "word": "Enhance",
    "partOfSpeech": "verb",
    "definition": "To improve or increase the quality, value or effectiveness of something.",
    "examples": [
      "Interactive exercises can enhance students' understanding of complex concepts.",
      "The city planted more trees to enhance the quality of the urban environment."
    ],
    "collocations": [
      "enhance understanding",
      "enhance performance",
      "enhance quality"
    ]
  },
  {
    "id": "set-1-establish",
    "word": "Establish",
    "partOfSpeech": "verb",
    "definition": "To create or introduce something that is intended to last or function regularly.",
    "examples": [
      "The research team established a protocol for collecting samples.",
      "The university established a new program in environmental studies."
    ],
    "collocations": [
      "establish a framework",
      "establish a system",
      "establish a program"
    ]
  },
  {
    "id": "set-1-evident",
    "word": "Evident",
    "partOfSpeech": "adjective",
    "definition": "Clear or easily recognized from the available information or evidence.",
    "examples": [
      "The effects of coastal erosion were evident along the shoreline.",
      "It became evident that the original population estimate was too low."
    ],
    "collocations": [
      "become evident",
      "clearly evident",
      "evident from the data"
    ]
  },
  {
    "id": "set-1-fluctuate",
    "word": "Fluctuate",
    "partOfSpeech": "verb",
    "definition": "To rise and fall or change irregularly over time.",
    "examples": [
      "Energy prices fluctuate throughout the year.",
      "The river's water level fluctuated after several days of heavy rain."
    ],
    "collocations": [
      "fluctuate widely",
      "fluctuate over time",
      "fluctuate between"
    ]
  },
  {
    "id": "set-1-furthermore",
    "word": "Furthermore",
    "partOfSpeech": "adverb",
    "definition": "In addition to what has already been said; used to introduce another supporting point.",
    "examples": [
      "The device is inexpensive. Furthermore, it requires very little maintenance.",
      "The proposal would reduce waste; furthermore, it could lower operating costs."
    ],
    "collocations": []
  },
  {
    "id": "set-1-generate",
    "word": "Generate",
    "partOfSpeech": "verb",
    "definition": "To produce, create or cause something to exist.",
    "examples": [
      "The new wind farm generates electricity for nearby communities.",
      "The findings generated interest among researchers in several different fields."
    ],
    "collocations": [
      "generate electricity",
      "generate revenue",
      "generate interest"
    ]
  },
  {
    "id": "set-1-hypothesis",
    "word": "Hypothesis",
    "partOfSpeech": "noun",
    "definition": "A proposed explanation for something that can be tested through observation or experimentation.",
    "examples": [
      "The scientist developed a hypothesis about why the insects migrated.",
      "The experiment was designed to test the hypothesis."
    ],
    "collocations": [
      "formulate a hypothesis",
      "test a hypothesis",
      "support a hypothesis"
    ]
  },
  {
    "id": "set-1-indicate",
    "word": "Indicate",
    "partOfSpeech": "verb",
    "definition": "To show, suggest or provide evidence that something is true or exists.",
    "examples": [
      "The survey results indicate that students prefer shorter lectures.",
      "A rise in sea level may indicate changes in the global climate."
    ],
    "collocations": [
      "indicate that",
      "strongly indicate",
      "indicate a trend"
    ]
  },
  {
    "id": "set-1-interpret",
    "word": "Interpret",
    "partOfSpeech": "verb",
    "definition": "To explain or understand the meaning of information, events or results.",
    "examples": [
      "The class learned how to interpret graphs and statistical tables.",
      "Researchers interpreted the results in light of earlier studies."
    ],
    "collocations": [
      "interpret data",
      "interpret results",
      "interpret findings"
    ]
  },
  {
    "id": "set-1-justify",
    "word": "Justify",
    "partOfSpeech": "verb",
    "definition": "To provide convincing reasons or evidence showing that something is reasonable or acceptable.",
    "examples": [
      "The company must justify the additional expense before the project can continue.",
      "The available evidence did not justify changing the original conclusion."
    ],
    "collocations": [
      "justify a decision",
      "justify the cost",
      "justify a claim"
    ]
  },
  {
    "id": "set-1-maintain",
    "word": "Maintain",
    "partOfSpeech": "verb",
    "definition": "To keep something in a particular condition or at a particular level.",
    "examples": [
      "Libraries must maintain accurate digital records.",
      "The device can maintain a constant temperature for several hours."
    ],
    "collocations": [
      "maintain standards",
      "maintain a balance",
      "maintain a constant temperature"
    ]
  },
  {
    "id": "set-1-significant",
    "word": "Significant",
    "partOfSpeech": "adjective",
    "definition": "Important or large enough to be noticed or have an effect.",
    "examples": [
      "The study found a significant difference between the two groups.",
      "Climate change poses a significant challenge to coastal communities."
    ],
    "collocations": [
      "significant impact",
      "significant difference",
      "significant increase"
    ]
  },
  {
    "id": "set-1-undergo",
    "word": "Undergo",
    "partOfSpeech": "verb",
    "definition": "To experience a process, change or event, especially one that has a noticeable effect.",
    "examples": [
      "The region underwent rapid industrial development during the twentieth century.",
      "The samples underwent additional testing before the results were published."
    ],
    "collocations": [
      "undergo a transformation",
      "undergo testing",
      "undergo a change"
    ]
  },
  {
    "id": "set-2-allocate",
    "word": "Allocate",
    "partOfSpeech": "verb",
    "definition": "To distribute or assign resources, money, time or responsibilities for a particular purpose.",
    "examples": [
      "The university allocated additional funding to scientific research.",
      "Governments must decide how to allocate limited resources among public services."
    ],
    "collocations": [
      "allocate resources",
      "allocate funding",
      "allocate time"
    ]
  },
  {
    "id": "set-2-ambiguous",
    "word": "Ambiguous",
    "partOfSpeech": "adjective",
    "definition": "Having more than one possible meaning or interpretation; not clear or definite.",
    "examples": [
      "The instructions were ambiguous, causing several students to misunderstand the assignment.",
      "The researchers could not draw a firm conclusion because the results were ambiguous."
    ],
    "collocations": [
      "ambiguous language",
      "ambiguous statement",
      "ambiguous results"
    ]
  },
  {
    "id": "set-2-attribute",
    "word": "Attribute",
    "partOfSpeech": "verb",
    "definition": "To explain something as being caused by a particular person, factor or situation.",
    "examples": [
      "Scientists attribute the increase in global temperatures primarily to human activities.",
      "The professor attributed the improvement in test scores to changes in teaching methods."
    ],
    "collocations": [
      "attribute success to",
      "attribute the increase to",
      "attribute differences to"
    ]
  },
  {
    "id": "set-2-bias",
    "word": "Bias",
    "partOfSpeech": "noun",
    "definition": "An unfair preference or tendency that influences judgment, decisions or the interpretation of information.",
    "examples": [
      "Researchers must consider possible bias when designing surveys.",
      "The study showed evidence of selection bias because the participants did not represent the wider population."
    ],
    "collocations": [
      "selection bias",
      "confirmation bias",
      "cultural bias"
    ]
  },
  {
    "id": "set-2-capacity",
    "word": "Capacity",
    "partOfSpeech": "noun",
    "definition": "The maximum amount something can contain, produce or handle, or the ability to do something.",
    "examples": [
      "The factory increased its production capacity by installing new equipment.",
      "Scientists are studying the human brain's capacity to process complex information."
    ],
    "collocations": [
      "production capacity",
      "storage capacity",
      "capacity to learn"
    ]
  },
  {
    "id": "set-2-constraint",
    "word": "Constraint",
    "partOfSpeech": "noun",
    "definition": "Something that limits what can be done or restricts the choices available.",
    "examples": [
      "Budget constraints prevented the university from expanding its laboratory facilities.",
      "The experiment had to be completed within strict time constraints."
    ],
    "collocations": [
      "budget constraints",
      "time constraints",
      "environmental constraints"
    ]
  },
  {
    "id": "set-2-contradict",
    "word": "Contradict",
    "partOfSpeech": "verb",
    "definition": "To state or show the opposite of something, making it impossible for both claims to be true in the same sense.",
    "examples": [
      "The new archaeological evidence contradicts earlier theories about the settlement.",
      "The results of the second experiment directly contradicted the original findings."
    ],
    "collocations": [
      "contradict the evidence",
      "contradict previous findings",
      "directly contradict"
    ]
  },
  {
    "id": "set-2-correlate",
    "word": "Correlate",
    "partOfSpeech": "verb",
    "definition": "To have a relationship in which two or more things tend to change together.",
    "examples": [
      "The researchers found that exercise frequency correlated with improved sleep quality.",
      "Higher levels of air pollution often correlate with an increased risk of respiratory problems."
    ],
    "collocations": [
      "correlate with",
      "strongly correlate with",
      "positively correlate with"
    ]
  },
  {
    "id": "set-2-diminish",
    "word": "Diminish",
    "partOfSpeech": "verb",
    "definition": "To become smaller, weaker or less important, or to make something decrease in these ways.",
    "examples": [
      "The effectiveness of the treatment diminished over time.",
      "Limited access to education can diminish employment opportunities."
    ],
    "collocations": [
      "diminish over time",
      "diminish the impact",
      "gradually diminish"
    ]
  },
  {
    "id": "set-2-distinguish",
    "word": "Distinguish",
    "partOfSpeech": "verb",
    "definition": "To recognise or explain the differences between people, things, ideas or situations.",
    "examples": [
      "Students must learn to distinguish between reliable and unreliable sources.",
      "The researcher used genetic evidence to distinguish the two species."
    ],
    "collocations": [
      "distinguish between",
      "clearly distinguish",
      "distinguish one from another"
    ]
  },
  {
    "id": "set-2-emerge",
    "word": "Emerge",
    "partOfSpeech": "verb",
    "definition": "To appear, develop or become known, especially after being hidden or previously unknown.",
    "examples": [
      "New technologies emerged during the Industrial Revolution.",
      "A clear pattern emerged after the researchers analysed the survey responses."
    ],
    "collocations": [
      "emerge from",
      "new patterns emerge",
      "emerge as a leader"
    ]
  },
  {
    "id": "set-2-facilitate",
    "word": "Facilitate",
    "partOfSpeech": "verb",
    "definition": "To make a process, activity or action easier or more likely to succeed.",
    "examples": [
      "Digital platforms facilitate communication between students and instructors.",
      "The new transportation system was designed to facilitate the movement of goods."
    ],
    "collocations": [
      "facilitate learning",
      "facilitate communication",
      "facilitate the process"
    ]
  },
  {
    "id": "set-2-inhibit",
    "word": "Inhibit",
    "partOfSpeech": "verb",
    "definition": "To prevent, slow down or restrict a process, activity or development.",
    "examples": [
      "Extremely low temperatures can inhibit the growth of certain bacteria.",
      "A lack of financial resources may inhibit technological innovation."
    ],
    "collocations": [
      "inhibit growth",
      "inhibit development",
      "inhibit the process"
    ]
  },
  {
    "id": "set-2-inevitable",
    "word": "Inevitable",
    "partOfSpeech": "adjective",
    "definition": "Certain to happen or impossible to avoid.",
    "examples": [
      "Some scientists argue that technological change is an inevitable part of economic development.",
      "Without adequate conservation efforts, the loss of certain habitats may become inevitable."
    ],
    "collocations": [
      "inevitable consequence",
      "inevitable outcome",
      "almost inevitable"
    ]
  },
  {
    "id": "set-2-prevalent",
    "word": "Prevalent",
    "partOfSpeech": "adjective",
    "definition": "Common or frequently found within a particular group, area or period.",
    "examples": [
      "The disease is more prevalent in regions with limited access to clean water.",
      "Renewable energy technologies have become increasingly prevalent in modern cities."
    ],
    "collocations": [
      "highly prevalent",
      "prevalent among",
      "more prevalent"
    ]
  },
  {
    "id": "set-2-retain",
    "word": "Retain",
    "partOfSpeech": "verb",
    "definition": "To keep, preserve or continue to possess something.",
    "examples": [
      "Students are more likely to retain information when they review it regularly.",
      "Certain types of soil can retain moisture for extended periods."
    ],
    "collocations": [
      "retain information",
      "retain moisture",
      "retain control"
    ]
  },
  {
    "id": "set-2-subsequent",
    "word": "Subsequent",
    "partOfSpeech": "adjective",
    "definition": "Happening or occurring after something else, especially as part of a sequence.",
    "examples": [
      "Subsequent research confirmed several of the original study's findings.",
      "The discovery influenced the work of subsequent generations of scientists."
    ],
    "collocations": [
      "subsequent research",
      "subsequent generations",
      "subsequent events"
    ]
  },
  {
    "id": "set-2-sustain",
    "word": "Sustain",
    "partOfSpeech": "verb",
    "definition": "To maintain or support something so that it can continue over time.",
    "examples": [
      "The region must develop new strategies to sustain economic growth.",
      "Healthy ecosystems depend on sufficient resources to sustain diverse populations."
    ],
    "collocations": [
      "sustain growth",
      "sustain an ecosystem",
      "sustain attention"
    ]
  },
  {
    "id": "set-2-valid",
    "word": "Valid",
    "partOfSpeech": "adjective",
    "definition": "Based on sound reasoning, evidence or accepted principles; reasonable or logically acceptable.",
    "examples": [
      "The researcher questioned whether the conclusions were valid given the small sample size.",
      "A scientific argument must be supported by valid evidence and logical reasoning."
    ],
    "collocations": [
      "valid argument",
      "valid conclusion",
      "valid reason"
    ]
  },
  {
    "id": "set-2-widespread",
    "word": "Widespread",
    "partOfSpeech": "adjective",
    "definition": "Existing, occurring or affecting many people or places over a large area.",
    "examples": [
      "The invention of the printing press contributed to the widespread distribution of written information.",
      "The severe drought caused widespread damage to agricultural regions."
    ],
    "collocations": [
      "widespread adoption",
      "widespread concern",
      "widespread damage"
    ]
  },
  {
    "id": "set-3-abundant",
    "word": "Abundant",
    "partOfSpeech": "adjective",
    "definition": "Existing or available in large quantities; more than enough.",
    "examples": [
      "The tropical rainforest provides abundant resources for a wide variety of plant and animal species.",
      "Archaeologists discovered abundant evidence of trade between the ancient civilizations."
    ],
    "collocations": [
      "abundant resources",
      "abundant evidence",
      "abundant supply"
    ]
  },
  {
    "id": "set-3-adapt",
    "word": "Adapt",
    "partOfSpeech": "verb",
    "definition": "To change or adjust in order to function successfully in new or different conditions.",
    "examples": [
      "Many animal species have adapted to survive in extremely cold environments.",
      "Universities must adapt their teaching methods to meet the needs of modern students."
    ],
    "collocations": [
      "adapt to change",
      "adapt to new conditions",
      "adapt quickly"
    ]
  },
  {
    "id": "set-3-advocate",
    "word": "Advocate",
    "partOfSpeech": "verb",
    "definition": "To publicly support or recommend a particular idea, policy or course of action.",
    "examples": [
      "Environmental organizations advocate stricter regulations on industrial pollution.",
      "Many education specialists advocate increasing access to early childhood education."
    ],
    "collocations": [
      "strongly advocate",
      "advocate for change",
      "advocate the use of"
    ]
  },
  {
    "id": "set-3-aggregate",
    "word": "Aggregate",
    "partOfSpeech": "verb",
    "definition": "To collect and combine separate pieces of information or individual amounts into a single total or group.",
    "examples": [
      "The researchers aggregated data from several universities to identify national trends.",
      "The software aggregates individual responses into a comprehensive statistical report."
    ],
    "collocations": [
      "aggregate data",
      "aggregate results",
      "aggregate information"
    ]
  },
  {
    "id": "set-3-arbitrary",
    "word": "Arbitrary",
    "partOfSpeech": "adjective",
    "definition": "Based on personal choice, chance or convenience rather than a clear reason, rule or consistent system.",
    "examples": [
      "The researchers avoided using arbitrary criteria when selecting participants for the experiment.",
      "The boundaries between some historical territories were established through arbitrary political decisions."
    ],
    "collocations": [
      "arbitrary decision",
      "arbitrary distinction",
      "arbitrary criteria"
    ]
  },
  {
    "id": "set-3-cease",
    "word": "Cease",
    "partOfSpeech": "verb",
    "definition": "To stop happening or to bring an activity or process to an end.",
    "examples": [
      "The factory was ordered to cease operations until it complied with environmental regulations.",
      "Several traditional agricultural practices ceased to exist after the introduction of modern machinery."
    ],
    "collocations": [
      "cease operations",
      "cease production",
      "cease to exist"
    ]
  },
  {
    "id": "set-3-constitute",
    "word": "Constitute",
    "partOfSpeech": "verb",
    "definition": "To form or make up something, or to be considered a particular thing.",
    "examples": [
      "International students constitute approximately twenty percent of the university's population.",
      "The destruction of natural habitats constitutes a serious threat to biodiversity."
    ],
    "collocations": [
      "constitute a threat",
      "constitute a significant proportion",
      "constitute a major part"
    ]
  },
  {
    "id": "set-3-detect",
    "word": "Detect",
    "partOfSpeech": "verb",
    "definition": "To discover or notice something, especially something that is difficult to see or recognise.",
    "examples": [
      "Scientists developed a new instrument capable of detecting extremely small changes in temperature.",
      "The research team detected traces of harmful chemicals in the water samples."
    ],
    "collocations": [
      "detect changes",
      "detect the presence of",
      "detect abnormalities"
    ]
  },
  {
    "id": "set-3-deviate",
    "word": "Deviate",
    "partOfSpeech": "verb",
    "definition": "To move away from an expected direction, established standard or usual pattern.",
    "examples": [
      "The experimental results deviated significantly from the researchers' original predictions.",
      "Some migratory birds deviate from their usual routes when weather conditions change."
    ],
    "collocations": [
      "deviate from the norm",
      "deviate significantly",
      "deviate from the original plan"
    ]
  },
  {
    "id": "set-3-elaborate",
    "word": "Elaborate",
    "partOfSpeech": "verb",
    "definition": "To explain or describe something in greater detail.",
    "examples": [
      "The professor asked the student to elaborate on her argument during the discussion.",
      "The researcher elaborated on the methodology used to collect the data."
    ],
    "collocations": [
      "elaborate on",
      "elaborate further",
      "elaborate on an idea"
    ]
  },
  {
    "id": "set-3-exclude",
    "word": "Exclude",
    "partOfSpeech": "verb",
    "definition": "To deliberately leave someone or something out of a group, activity or consideration.",
    "examples": [
      "The study excluded participants who had previously received the experimental treatment.",
      "Researchers cannot exclude the possibility that external factors influenced the results."
    ],
    "collocations": [
      "exclude from",
      "exclude the possibility",
      "deliberately exclude"
    ]
  },
  {
    "id": "set-3-infer",
    "word": "Infer",
    "partOfSpeech": "verb",
    "definition": "To reach a conclusion based on available evidence or information rather than direct statements.",
    "examples": [
      "From the fossil evidence, scientists inferred that the region once had a much warmer climate.",
      "Readers can infer the author's attitude from the language used throughout the passage."
    ],
    "collocations": [
      "infer from evidence",
      "reasonably infer",
      "infer that"
    ]
  },
  {
    "id": "set-3-integrate",
    "word": "Integrate",
    "partOfSpeech": "verb",
    "definition": "To combine separate elements into a unified system or make something part of a larger whole.",
    "examples": [
      "The university plans to integrate artificial intelligence tools into its academic programs.",
      "The new transportation network integrates buses, trains and bicycle routes into a single system."
    ],
    "collocations": [
      "integrate into",
      "integrate technology",
      "integrate different systems"
    ]
  },
  {
    "id": "set-3-modify",
    "word": "Modify",
    "partOfSpeech": "verb",
    "definition": "To make partial changes to something, usually to improve it or make it more suitable for a particular purpose.",
    "examples": [
      "The engineers modified the original design to improve energy efficiency.",
      "Scientists may need to modify their hypothesis when new evidence becomes available."
    ],
    "collocations": [
      "modify a design",
      "modify behavior",
      "slightly modify"
    ]
  },
  {
    "id": "set-3-persist",
    "word": "Persist",
    "partOfSpeech": "verb",
    "definition": "To continue to exist or happen, often despite difficulties or attempts to stop it.",
    "examples": [
      "Economic inequality has persisted in the region despite decades of development.",
      "Some pollutants can persist in the environment for hundreds of years."
    ],
    "collocations": [
      "persist over time",
      "persist despite",
      "problems persist"
    ]
  },
  {
    "id": "set-3-proportion",
    "word": "Proportion",
    "partOfSpeech": "noun",
    "definition": "A part or share of a whole, especially when compared with the total amount.",
    "examples": [
      "A large proportion of the city's population relies on public transportation.",
      "The proportion of renewable energy used in electricity production has increased substantially."
    ],
    "collocations": [
      "large proportion",
      "significant proportion",
      "proportion of the population"
    ]
  },
  {
    "id": "set-3-reinforce",
    "word": "Reinforce",
    "partOfSpeech": "verb",
    "definition": "To make something stronger or more effective, or to provide additional support for an idea or belief.",
    "examples": [
      "The new findings reinforce the theory that regular exercise improves cognitive performance.",
      "Teachers can reinforce important concepts through practical activities and frequent review."
    ],
    "collocations": [
      "reinforce an idea",
      "reinforce a belief",
      "reinforce existing evidence"
    ]
  },
  {
    "id": "set-3-relevant",
    "word": "Relevant",
    "partOfSpeech": "adjective",
    "definition": "Directly connected to or important for the subject, situation or problem being considered.",
    "examples": [
      "Students should include only relevant evidence when supporting an academic argument.",
      "The professor explained why the historical event was relevant to contemporary political developments."
    ],
    "collocations": [
      "relevant information",
      "relevant evidence",
      "directly relevant to"
    ]
  },
  {
    "id": "set-3-substitute",
    "word": "Substitute",
    "partOfSpeech": "verb",
    "definition": "To use one thing instead of another, especially when the original is unavailable or unsuitable.",
    "examples": [
      "Some manufacturers have substituted recycled materials for traditional raw materials.",
      "Researchers cannot substitute personal opinions for reliable scientific evidence."
    ],
    "collocations": [
      "substitute for",
      "substitute one thing for another",
      "substitute an alternative material"
    ]
  },
  {
    "id": "set-3-verify",
    "word": "Verify",
    "partOfSpeech": "verb",
    "definition": "To confirm that something is true, accurate or correct by examining evidence or conducting checks.",
    "examples": [
      "Scientists repeated the experiment to verify the accuracy of the initial results.",
      "Historians must verify information by consulting multiple independent sources."
    ],
    "collocations": [
      "verify information",
      "verify the accuracy",
      "independently verify"
    ]
  }
];
