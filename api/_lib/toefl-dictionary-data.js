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
 * @property {string} spanish Spanish equivalents matching the definition and part of speech.
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
    "spanish": "analizar",
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
    "spanish": "evaluar; valorar",
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
    "spanish": "suponer",
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
    "spanish": "beneficio; ventaja",
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
    "spanish": "coherente",
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
    "spanish": "recopilar",
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
    "spanish": "exhaustivo; integral",
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
    "spanish": "en consecuencia; por lo tanto",
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
    "spanish": "considerable; importante",
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
    "spanish": "contribuir; aportar",
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
    "spanish": "crucial; decisivo",
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
    "spanish": "disminuir; decaer",
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
    "spanish": "demostrar",
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
    "spanish": "obtener; derivar de",
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
    "spanish": "diverso; variado",
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
    "spanish": "enfatizar; destacar",
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
    "spanish": "empírico",
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
    "spanish": "mejorar; potenciar",
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
    "spanish": "establecer; crear",
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
    "spanish": "evidente; claro",
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
    "spanish": "fluctuar; oscilar",
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
    "spanish": "además; es más",
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
    "spanish": "generar; producir",
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
    "spanish": "hipótesis",
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
    "spanish": "indicar; señalar",
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
    "spanish": "interpretar",
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
    "spanish": "justificar",
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
    "spanish": "mantener",
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
    "spanish": "significativo; importante",
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
    "spanish": "experimentar; pasar por",
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
    "spanish": "asignar; distribuir",
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
    "spanish": "ambiguo",
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
    "spanish": "atribuir",
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
    "spanish": "sesgo; parcialidad",
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
    "spanish": "capacidad",
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
    "spanish": "restricción; limitación",
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
    "spanish": "contradecir",
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
    "spanish": "correlacionar; relacionarse",
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
    "spanish": "disminuir; reducir",
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
    "spanish": "distinguir; diferenciar",
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
    "spanish": "surgir; emerger",
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
    "spanish": "facilitar",
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
    "spanish": "inhibir; frenar",
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
    "spanish": "inevitable",
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
    "spanish": "frecuente; común",
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
    "spanish": "retener; conservar",
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
    "spanish": "posterior; subsiguiente",
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
    "spanish": "sostener; mantener",
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
    "spanish": "válido; fundamentado",
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
    "spanish": "generalizado; extendido",
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
    "spanish": "abundante",
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
    "spanish": "adaptar; adaptarse",
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
    "spanish": "defender; propugnar",
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
    "spanish": "agrupar; agregar",
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
    "spanish": "arbitrario",
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
    "spanish": "cesar; dejar de",
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
    "spanish": "constituir; conformar",
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
    "spanish": "detectar",
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
    "spanish": "desviarse",
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
    "spanish": "explicar en detalle; ampliar",
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
    "spanish": "excluir",
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
    "spanish": "inferir; deducir",
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
    "spanish": "integrar",
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
    "spanish": "modificar",
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
    "spanish": "persistir; perdurar",
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
    "spanish": "proporción",
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
    "spanish": "reforzar",
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
    "spanish": "pertinente; relevante",
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
    "spanish": "sustituir; reemplazar",
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
    "spanish": "verificar; comprobar",
    "examples": [
      "Scientists repeated the experiment to verify the accuracy of the initial results.",
      "Historians must verify information by consulting multiple independent sources."
    ],
    "collocations": [
      "verify information",
      "verify the accuracy",
      "independently verify"
    ]
  },
  {
    "id": "set-4-accumulate",
    "word": "Accumulate",
    "partOfSpeech": "verb",
    "definition": "To gradually collect or increase in quantity over a period of time.",
    "spanish": "acumular; acumularse",
    "examples": [
      "Sediment accumulates at the bottom of lakes and rivers over thousands of years.",
      "Students accumulate knowledge through repeated exposure to new concepts and practical experience."
    ],
    "collocations": [
      "accumulate wealth",
      "accumulate evidence",
      "accumulate over time"
    ]
  },
  {
    "id": "set-4-adequate",
    "word": "Adequate",
    "partOfSpeech": "adjective",
    "definition": "Sufficient or satisfactory for a particular purpose or situation.",
    "spanish": "adecuado; suficiente",
    "examples": [
      "The researchers concluded that the available evidence was not adequate to support the hypothesis.",
      "Schools in remote communities often struggle to provide adequate educational resources."
    ],
    "collocations": [
      "adequate resources",
      "adequate funding",
      "adequate evidence"
    ]
  },
  {
    "id": "set-4-alter",
    "word": "Alter",
    "partOfSpeech": "verb",
    "definition": "To change something or make it different, usually without completely replacing it.",
    "spanish": "alterar; modificar",
    "examples": [
      "Human activities have significantly altered the natural landscape of the region.",
      "The scientists altered the experimental conditions to determine how temperature affected the results."
    ],
    "collocations": [
      "alter the outcome",
      "significantly alter",
      "alter the structure"
    ]
  },
  {
    "id": "set-4-anticipate",
    "word": "Anticipate",
    "partOfSpeech": "verb",
    "definition": "To expect or predict that something will happen and sometimes prepare for it in advance.",
    "spanish": "prever; anticipar",
    "examples": [
      "Economists anticipate that demand for renewable energy will continue to increase.",
      "The research team anticipated several technical difficulties before beginning the experiment."
    ],
    "collocations": [
      "anticipate changes",
      "anticipate problems",
      "widely anticipated"
    ]
  },
  {
    "id": "set-4-approximate",
    "word": "Approximate",
    "partOfSpeech": "adjective",
    "definition": "Close to the actual amount, number or value, but not completely exact.",
    "spanish": "aproximado",
    "examples": [
      "Archaeologists estimated the approximate age of the settlement by examining pottery fragments.",
      "The researchers calculated the approximate distance between the two locations using satellite images."
    ],
    "collocations": [
      "approximate value",
      "approximate age",
      "approximate distance"
    ]
  },
  {
    "id": "set-4-attain",
    "word": "Attain",
    "partOfSpeech": "verb",
    "definition": "To achieve or reach a particular goal, level, condition or standard, often through effort.",
    "spanish": "alcanzar; lograr",
    "examples": [
      "Students must complete several advanced courses to attain the required level of academic proficiency.",
      "The laboratory attained a high degree of accuracy after improving its measurement techniques."
    ],
    "collocations": [
      "attain a goal",
      "attain a high level",
      "attain success"
    ]
  },
  {
    "id": "set-4-catalyst",
    "word": "Catalyst",
    "partOfSpeech": "noun",
    "definition": "Something that causes or accelerates a change or process; in chemistry, a substance that speeds up a reaction without being consumed.",
    "spanish": "catalizador",
    "examples": [
      "The invention of the steam engine served as a catalyst for industrial development.",
      "The chemical reaction proceeded much faster after the researchers introduced a catalyst."
    ],
    "collocations": [
      "catalyst for change",
      "catalyst for growth",
      "act as a catalyst"
    ]
  },
  {
    "id": "set-4-coincide",
    "word": "Coincide",
    "partOfSpeech": "verb",
    "definition": "To happen at the same time as something else, or to correspond closely with it.",
    "spanish": "coincidir",
    "examples": [
      "The decline in agricultural production coincided with a prolonged period of drought.",
      "The introduction of new transportation systems coincided with rapid urban expansion."
    ],
    "collocations": [
      "coincide with",
      "closely coincide",
      "coincide in time"
    ]
  },
  {
    "id": "set-4-controversial",
    "word": "Controversial",
    "partOfSpeech": "adjective",
    "definition": "Causing strong disagreement or opposing opinions among people.",
    "spanish": "controvertido; polémico",
    "examples": [
      "The government's decision to construct a dam near the protected forest was highly controversial.",
      "The professor introduced a controversial theory that challenged traditional interpretations of the historical event."
    ],
    "collocations": [
      "controversial issue",
      "controversial decision",
      "highly controversial"
    ]
  },
  {
    "id": "set-4-deduce",
    "word": "Deduce",
    "partOfSpeech": "verb",
    "definition": "To reach a logical conclusion by considering facts, evidence or information.",
    "spanish": "deducir",
    "examples": [
      "Scientists deduced the composition of the planet's atmosphere by examining the light it reflected.",
      "From the available historical records, researchers deduced that the settlement had been abandoned gradually."
    ],
    "collocations": [
      "deduce from evidence",
      "logically deduce",
      "deduce that"
    ]
  },
  {
    "id": "set-4-deteriorate",
    "word": "Deteriorate",
    "partOfSpeech": "verb",
    "definition": "To become progressively worse in quality, condition or effectiveness.",
    "spanish": "deteriorarse; empeorar",
    "examples": [
      "The condition of the ancient manuscripts deteriorated because of prolonged exposure to humidity.",
      "Water quality can deteriorate rapidly when industrial waste enters a river."
    ],
    "collocations": [
      "deteriorate rapidly",
      "gradually deteriorate",
      "conditions deteriorate"
    ]
  },
  {
    "id": "set-4-discrete",
    "word": "Discrete",
    "partOfSpeech": "adjective",
    "definition": "Separate and distinct from other things rather than forming a continuous whole.",
    "spanish": "separado; distinto",
    "examples": [
      "The researchers divided the experimental process into several discrete stages.",
      "The professor explained that the data consisted of discrete categories rather than continuous measurements."
    ],
    "collocations": [
      "discrete categories",
      "discrete units",
      "discrete stages"
    ]
  },
  {
    "id": "set-4-disperse",
    "word": "Disperse",
    "partOfSpeech": "verb",
    "definition": "To spread or distribute something over a wide area, or to move in different directions.",
    "spanish": "dispersar; dispersarse",
    "examples": [
      "Wind helps disperse pollen over considerable distances.",
      "The volcanic eruption released particles that dispersed throughout the atmosphere."
    ],
    "collocations": [
      "disperse particles",
      "widely dispersed",
      "disperse throughout"
    ]
  },
  {
    "id": "set-4-exceed",
    "word": "Exceed",
    "partOfSpeech": "verb",
    "definition": "To be greater than a particular amount, limit, number or standard.",
    "spanish": "superar; exceder",
    "examples": [
      "The concentration of pollutants in the river exceeded the maximum level permitted by environmental regulations.",
      "The number of students applying to the university exceeded the institution's original expectations."
    ],
    "collocations": [
      "exceed expectations",
      "exceed the limit",
      "exceed the maximum"
    ]
  },
  {
    "id": "set-4-exploit",
    "word": "Exploit",
    "partOfSpeech": "verb",
    "definition": "To use a resource, opportunity or situation for one's own benefit, sometimes in an unfair or harmful way.",
    "spanish": "explotar; aprovechar",
    "examples": [
      "Several industries have exploited natural resources without considering their long-term environmental impact.",
      "Early civilizations learned to exploit the fertile soil surrounding major river systems."
    ],
    "collocations": [
      "exploit natural resources",
      "exploit an opportunity",
      "exploit a weakness"
    ]
  },
  {
    "id": "set-4-fundamental",
    "word": "Fundamental",
    "partOfSpeech": "adjective",
    "definition": "Forming the essential foundation of something; extremely important to its existence or development.",
    "spanish": "fundamental; esencial",
    "examples": [
      "Understanding the structure of DNA is fundamental to modern genetics.",
      "The professor explained several fundamental principles of economic theory."
    ],
    "collocations": [
      "fundamental principles",
      "fundamental difference",
      "fundamental importance"
    ]
  },
  {
    "id": "set-4-imply",
    "word": "Imply",
    "partOfSpeech": "verb",
    "definition": "To suggest or indicate something without stating it directly.",
    "spanish": "dar a entender; sugerir",
    "examples": [
      "The results imply that environmental conditions may influence the development of certain species.",
      "The author's argument implies that technological progress does not always lead to social improvement."
    ],
    "collocations": [
      "strongly imply",
      "imply that",
      "seem to imply"
    ]
  },
  {
    "id": "set-4-innovative",
    "word": "Innovative",
    "partOfSpeech": "adjective",
    "definition": "Introducing new ideas, methods or technologies that are original and potentially useful.",
    "spanish": "innovador",
    "examples": [
      "The university developed an innovative approach to teaching complex scientific concepts.",
      "Innovative agricultural techniques have helped farmers reduce water consumption."
    ],
    "collocations": [
      "innovative approach",
      "innovative technology",
      "innovative solution"
    ]
  },
  {
    "id": "set-4-parameter",
    "word": "Parameter",
    "partOfSpeech": "noun",
    "definition": "A measurable factor that helps define a system or process, or a limit within which an activity can take place.",
    "spanish": "parámetro",
    "examples": [
      "The researchers adjusted several experimental parameters to determine which factors influenced the results.",
      "The computer model uses temperature and humidity as key parameters when predicting weather conditions."
    ],
    "collocations": [
      "key parameters",
      "establish parameters",
      "experimental parameters"
    ]
  },
  {
    "id": "set-4-simulate",
    "word": "Simulate",
    "partOfSpeech": "verb",
    "definition": "To create an artificial representation of a real process, event or situation, often to study or predict its behavior.",
    "spanish": "simular",
    "examples": [
      "Scientists use computer models to simulate the effects of climate change on ocean temperatures.",
      "The engineering students designed an experiment to simulate the conditions experienced during an earthquake."
    ],
    "collocations": [
      "simulate conditions",
      "simulate a process",
      "computer-simulated environment"
    ]
  }
];
