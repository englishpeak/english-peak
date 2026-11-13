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
  }
];
