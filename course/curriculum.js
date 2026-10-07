// Public curriculum metadata only. Never put protected lesson material here.
// Array order controls presentation; IDs and slugs remain stable when titles change.
export const course = {
  title: 'The English Course',
  description: 'A complete English course, from beginner foundations to advanced proficiency.',
};

export const accessLabels = {
  public: 'Public',
  account: 'Account required',
  'epeak-plus': 'ePeak+',
};

export const availabilityLabels = {
  'coming-soon': 'Coming soon',
  future: 'Coming in the future',
  available: 'Available',
};

// Reserved area identifiers, not implemented learning activities.
export const moduleAreas = [
  { id: 'study', title: 'Study' },
  { id: 'review', title: 'Review Exercises' },
  { id: 'test', title: 'Take Test', questionCount: 20 },
];

export const levels = [
  {
    "id": "a1",
    "label": "A1",
    "title": "Beginner Foundations"
  },
  {
    "id": "a2",
    "label": "A2",
    "title": "Elementary Expansion"
  },
  {
    "id": "b1",
    "label": "B1",
    "title": "Intermediate Proficiency"
  },
  {
    "id": "b2",
    "label": "B2",
    "title": "Upper Intermediate Mastery"
  },
  {
    "id": "c1",
    "label": "C1",
    "title": "Advanced Operational Proficiency"
  }
];

export const modules = [
  {"id": "a1-verb-to-be", "level": "a1", "slug": "verb-to-be", "title": "Verb “to be”", "access": "public", "status": "coming-soon"},
  {"id": "a1-nouns-and-pronouns", "level": "a1", "slug": "nouns-and-pronouns", "title": "Nouns and Pronouns", "access": "public", "status": "coming-soon"},
  {"id": "a1-articles-and-determiners", "level": "a1", "slug": "articles-and-determiners", "title": "Articles and Determiners", "access": "public", "status": "coming-soon"},
  {"id": "a1-present-simple", "level": "a1", "slug": "present-simple", "title": "Present Simple", "access": "account", "status": "coming-soon"},
  {"id": "a1-possessives", "level": "a1", "slug": "possessives", "title": "Possessives", "access": "account", "status": "coming-soon"},
  {"id": "a1-question-formation", "level": "a1", "slug": "question-formation", "title": "Question Formation", "access": "account", "status": "coming-soon"},
  {"id": "a1-basic-modals", "level": "a1", "slug": "basic-modals", "title": "Basic Modals", "access": "account", "status": "coming-soon"},
  {"id": "a1-there-is-there-are", "level": "a1", "slug": "there-is-there-are", "title": "There is / There are", "access": "account", "status": "coming-soon"},
  {"id": "a1-present-continuous", "level": "a1", "slug": "present-continuous", "title": "Present Continuous", "access": "account", "status": "coming-soon"},
  {"id": "a1-future-time", "level": "a1", "slug": "future-time", "title": "Future Time", "access": "account", "status": "coming-soon"},
  {"id": "a1-imperatives", "level": "a1", "slug": "imperatives", "title": "Imperatives", "access": "account", "status": "coming-soon"},
  {"id": "a1-prepositions", "level": "a1", "slug": "prepositions", "title": "Prepositions", "access": "account", "status": "coming-soon"},
  {"id": "a1-adjectives-and-adverbs", "level": "a1", "slug": "adjectives-and-adverbs", "title": "Adjectives and Adverbs", "access": "account", "status": "coming-soon"},
  {"id": "a2-adjectives-comparatives-and-superlatives", "level": "a2", "slug": "adjectives-comparatives-and-superlatives", "title": "Adjectives: Comparatives and Superlatives", "access": "epeak-plus", "status": "future"},
  {"id": "a2-past-simple", "level": "a2", "slug": "past-simple", "title": "Past Simple", "access": "epeak-plus", "status": "future"},
  {"id": "a2-past-continuous", "level": "a2", "slug": "past-continuous", "title": "Past Continuous", "access": "epeak-plus", "status": "future"},
  {"id": "a2-present-perfect", "level": "a2", "slug": "present-perfect", "title": "Present Perfect", "access": "epeak-plus", "status": "future"},
  {"id": "a2-zero-and-first-conditionals", "level": "a2", "slug": "zero-and-first-conditionals", "title": "Zero and First Conditionals", "access": "epeak-plus", "status": "future"},
  {"id": "a2-modals", "level": "a2", "slug": "modals", "title": "Modals", "access": "epeak-plus", "status": "future"},
  {"id": "a2-future-forms", "level": "a2", "slug": "future-forms", "title": "Future Forms", "access": "epeak-plus", "status": "future"},
  {"id": "a2-gerunds-and-infinitives", "level": "a2", "slug": "gerunds-and-infinitives", "title": "Gerunds and Infinitives", "access": "epeak-plus", "status": "future"},
  {"id": "a2-determiners-and-quantifiers", "level": "a2", "slug": "determiners-and-quantifiers", "title": "Determiners and Quantifiers", "access": "epeak-plus", "status": "future"},
  {"id": "a2-linkers-and-conjunctions", "level": "a2", "slug": "linkers-and-conjunctions", "title": "Linkers and Conjunctions", "access": "epeak-plus", "status": "future"},
  {"id": "b1-narrative-tenses", "level": "b1", "slug": "narrative-tenses", "title": "Narrative Tenses", "access": "epeak-plus", "status": "future"},
  {"id": "b1-perfect-tenses", "level": "b1", "slug": "perfect-tenses", "title": "Perfect Tenses", "access": "epeak-plus", "status": "future"},
  {"id": "b1-second-and-third-conditionals", "level": "b1", "slug": "second-and-third-conditionals", "title": "Second and Third Conditionals", "access": "epeak-plus", "status": "future"},
  {"id": "b1-passive-voice", "level": "b1", "slug": "passive-voice", "title": "Passive Voice", "access": "epeak-plus", "status": "future"},
  {"id": "b1-reported-speech", "level": "b1", "slug": "reported-speech", "title": "Reported Speech", "access": "epeak-plus", "status": "future"},
  {"id": "b1-modals-of-deduction", "level": "b1", "slug": "modals-of-deduction", "title": "Modals of Deduction", "access": "epeak-plus", "status": "future"},
  {"id": "b1-future-continuous", "level": "b1", "slug": "future-continuous", "title": "Future Continuous", "access": "epeak-plus", "status": "future"},
  {"id": "b1-relative-clauses", "level": "b1", "slug": "relative-clauses", "title": "Relative Clauses", "access": "epeak-plus", "status": "future"},
  {"id": "b1-intensifiers-and-adverbs", "level": "b1", "slug": "intensifiers-and-adverbs", "title": "Intensifiers and Adverbs", "access": "epeak-plus", "status": "future"},
  {"id": "b1-question-tags", "level": "b1", "slug": "question-tags", "title": "Question Tags", "access": "epeak-plus", "status": "future"},
  {"id": "b1-phrasal-verbs", "level": "b1", "slug": "phrasal-verbs", "title": "Phrasal Verbs", "access": "epeak-plus", "status": "future"},
  {"id": "b2-advanced-future-forms", "level": "b2", "slug": "advanced-future-forms", "title": "Advanced Future Forms", "access": "epeak-plus", "status": "future"},
  {"id": "b2-mixed-conditionals", "level": "b2", "slug": "mixed-conditionals", "title": "Mixed Conditionals", "access": "epeak-plus", "status": "future"},
  {"id": "b2-advanced-passive-voice", "level": "b2", "slug": "advanced-passive-voice", "title": "Advanced Passive Voice", "access": "epeak-plus", "status": "future"},
  {"id": "b2-wishes-and-regrets", "level": "b2", "slug": "wishes-and-regrets", "title": "Wishes and Regrets", "access": "epeak-plus", "status": "future"},
  {"id": "b2-modals-of-deduction-past", "level": "b2", "slug": "modals-of-deduction-past", "title": "Modals of Deduction — Past", "access": "epeak-plus", "status": "future"},
  {"id": "b2-causative-structures", "level": "b2", "slug": "causative-structures", "title": "Causative Structures", "access": "epeak-plus", "status": "future"},
  {"id": "b2-cleft-sentences", "level": "b2", "slug": "cleft-sentences", "title": "Cleft Sentences", "access": "epeak-plus", "status": "future"},
  {"id": "b2-participle-clauses", "level": "b2", "slug": "participle-clauses", "title": "Participle Clauses", "access": "epeak-plus", "status": "future"},
  {"id": "b2-inversion", "level": "b2", "slug": "inversion", "title": "Inversion", "access": "epeak-plus", "status": "future"},
  {"id": "b2-formal-discourse-markers", "level": "b2", "slug": "formal-discourse-markers", "title": "Formal Discourse Markers", "access": "epeak-plus", "status": "future"},
  {"id": "c1-negative-inversion", "level": "c1", "slug": "negative-inversion", "title": "Negative Inversion", "access": "epeak-plus", "status": "future"},
  {"id": "c1-nominalisation", "level": "c1", "slug": "nominalisation", "title": "Nominalisation", "access": "epeak-plus", "status": "future"},
  {"id": "c1-complex-conditionals", "level": "c1", "slug": "complex-conditionals", "title": "Complex Conditionals", "access": "epeak-plus", "status": "future"},
  {"id": "c1-hedging-and-distancing", "level": "c1", "slug": "hedging-and-distancing", "title": "Hedging and Distancing", "access": "epeak-plus", "status": "future"},
  {"id": "c1-ellipsis-and-substitution", "level": "c1", "slug": "ellipsis-and-substitution", "title": "Ellipsis and Substitution", "access": "epeak-plus", "status": "future"},
  {"id": "c1-advanced-modal-shifts", "level": "c1", "slug": "advanced-modal-shifts", "title": "Advanced Modal Shifts", "access": "epeak-plus", "status": "future"},
  {"id": "c1-cohesive-devices", "level": "c1", "slug": "cohesive-devices", "title": "Cohesive Devices", "access": "epeak-plus", "status": "future"},
  {"id": "c1-subjunctive-mood", "level": "c1", "slug": "subjunctive-mood", "title": "Subjunctive Mood", "access": "epeak-plus", "status": "future"}
];
