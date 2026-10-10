import { createClient } from '@supabase/supabase-js';
import { hasFullAccessTier } from '../businesscases/access.js';

// The canonical audited bank lives in this server function, never in a public
// static JSON file or browser bundle. The original 300 audited records are
// preserved; IDs 301–500 extend the bank with additional learner word families.
export const WORD_FAMILIES = [
  {
    "id": 1,
    "forms": [
      [
        "accept"
      ],
      [
        "acceptance"
      ],
      [
        "acceptable"
      ],
      [
        "unacceptable"
      ],
      [
        "acceptably",
        "unacceptably"
      ]
    ]
  },
  {
    "id": 2,
    "forms": [
      [
        "achieve"
      ],
      [
        "achievement",
        "achiever"
      ],
      [
        "achievable"
      ],
      [
        "unachievable"
      ],
      null
    ]
  },
  {
    "id": 3,
    "forms": [
      [
        "act"
      ],
      [
        "action",
        "activity",
        "actor"
      ],
      [
        "active"
      ],
      [
        "inactive"
      ],
      [
        "actively"
      ]
    ]
  },
  {
    "id": 4,
    "forms": [
      [
        "adapt"
      ],
      [
        "adaptation",
        "adaptability"
      ],
      [
        "adaptable"
      ],
      [
        "adaptive"
      ],
      null
    ]
  },
  {
    "id": 5,
    "forms": [
      [
        "add"
      ],
      [
        "addition"
      ],
      [
        "additional"
      ],
      [
        "additive"
      ],
      [
        "additionally"
      ]
    ]
  },
  {
    "id": 6,
    "forms": [
      [
        "admire"
      ],
      [
        "admiration",
        "admirer"
      ],
      [
        "admirable"
      ],
      [
        "admiring"
      ],
      [
        "admirably",
        "admiringly"
      ]
    ]
  },
  {
    "id": 7,
    "forms": [
      [
        "admit"
      ],
      [
        "admission",
        "admittance"
      ],
      [
        "admissible"
      ],
      [
        "inadmissible"
      ],
      null
    ]
  },
  {
    "id": 8,
    "forms": [
      [
        "advise"
      ],
      [
        "advice",
        "adviser",
        "advisor",
        "advisability"
      ],
      [
        "advisable"
      ],
      [
        "inadvisable"
      ],
      null
    ]
  },
  {
    "id": 9,
    "forms": [
      [
        "agree"
      ],
      [
        "agreement"
      ],
      [
        "agreeable"
      ],
      [
        "disagreeable"
      ],
      [
        "agreeably",
        "disagreeably"
      ]
    ]
  },
  {
    "id": 10,
    "forms": [
      [
        "allow"
      ],
      [
        "allowance"
      ],
      [
        "allowable"
      ],
      null,
      null
    ]
  },
  {
    "id": 11,
    "forms": [
      [
        "amaze"
      ],
      [
        "amazement"
      ],
      [
        "amazing"
      ],
      [
        "amazed"
      ],
      [
        "amazingly"
      ]
    ]
  },
  {
    "id": 12,
    "forms": [
      [
        "amuse"
      ],
      [
        "amusement"
      ],
      [
        "amusing"
      ],
      [
        "amused"
      ],
      [
        "amusingly"
      ]
    ]
  },
  {
    "id": 13,
    "forms": [
      [
        "analyse",
        "analyze"
      ],
      [
        "analysis",
        "analyst"
      ],
      [
        "analytical",
        "analytic"
      ],
      null,
      [
        "analytically"
      ]
    ]
  },
  {
    "id": 14,
    "forms": [
      [
        "announce"
      ],
      [
        "announcement",
        "announcer"
      ],
      [
        "unannounced"
      ],
      null,
      null
    ]
  },
  {
    "id": 15,
    "forms": [
      [
        "annoy"
      ],
      [
        "annoyance"
      ],
      [
        "annoying"
      ],
      [
        "annoyed"
      ],
      [
        "annoyingly"
      ]
    ]
  },
  {
    "id": 16,
    "forms": [
      [
        "apologise",
        "apologize"
      ],
      [
        "apology"
      ],
      [
        "apologetic"
      ],
      [
        "unapologetic"
      ],
      [
        "apologetically",
        "unapologetically"
      ]
    ]
  },
  {
    "id": 17,
    "forms": [
      [
        "appear"
      ],
      [
        "appearance"
      ],
      [
        "apparent"
      ],
      null,
      [
        "apparently"
      ]
    ]
  },
  {
    "id": 18,
    "forms": [
      [
        "apply"
      ],
      [
        "application",
        "applicant"
      ],
      [
        "applicable"
      ],
      [
        "inapplicable"
      ],
      null
    ]
  },
  {
    "id": 19,
    "forms": [
      [
        "appreciate"
      ],
      [
        "appreciation"
      ],
      [
        "appreciative"
      ],
      [
        "unappreciative"
      ],
      [
        "appreciatively"
      ]
    ]
  },
  {
    "id": 20,
    "forms": [
      [
        "approve"
      ],
      [
        "approval"
      ],
      [
        "approving"
      ],
      [
        "disapproving"
      ],
      [
        "approvingly",
        "disapprovingly"
      ]
    ]
  },
  {
    "id": 21,
    "forms": [
      [
        "argue"
      ],
      [
        "argument"
      ],
      [
        "argumentative"
      ],
      [
        "arguable"
      ],
      [
        "arguably",
        "argumentatively"
      ]
    ]
  },
  {
    "id": 22,
    "forms": [
      [
        "arrange"
      ],
      [
        "arrangement"
      ],
      [
        "arranged"
      ],
      [
        "prearranged"
      ],
      null
    ]
  },
  {
    "id": 23,
    "forms": [
      [
        "associate"
      ],
      [
        "association",
        "associate"
      ],
      [
        "associated"
      ],
      null,
      null
    ]
  },
  {
    "id": 24,
    "forms": [
      [
        "attract"
      ],
      [
        "attraction",
        "attractiveness"
      ],
      [
        "attractive"
      ],
      [
        "unattractive"
      ],
      [
        "attractively",
        "unattractively"
      ]
    ]
  },
  {
    "id": 25,
    "forms": [
      [
        "avoid"
      ],
      [
        "avoidance"
      ],
      [
        "avoidable"
      ],
      [
        "unavoidable"
      ],
      [
        "unavoidably"
      ]
    ]
  },
  {
    "id": 26,
    "forms": [
      [
        "base"
      ],
      [
        "base",
        "basis"
      ],
      [
        "basic"
      ],
      [
        "baseless"
      ],
      [
        "basically"
      ]
    ]
  },
  {
    "id": 27,
    "forms": [
      [
        "behave"
      ],
      [
        "behaviour",
        "behavior"
      ],
      [
        "behavioural",
        "behavioral"
      ],
      [
        "well-behaved"
      ],
      null
    ]
  },
  {
    "id": 28,
    "forms": [
      [
        "believe"
      ],
      [
        "belief",
        "believer"
      ],
      [
        "believable"
      ],
      [
        "unbelievable"
      ],
      [
        "believably",
        "unbelievably"
      ]
    ]
  },
  {
    "id": 29,
    "forms": [
      [
        "benefit"
      ],
      [
        "benefit",
        "beneficiary"
      ],
      [
        "beneficial"
      ],
      null,
      [
        "beneficially"
      ]
    ]
  },
  {
    "id": 30,
    "forms": [
      [
        "bore"
      ],
      [
        "boredom",
        "bore"
      ],
      [
        "boring"
      ],
      [
        "bored"
      ],
      [
        "boringly"
      ]
    ]
  },
  {
    "id": 31,
    "forms": [
      [
        "breathe"
      ],
      [
        "breath",
        "breathing"
      ],
      [
        "breathless"
      ],
      [
        "breathable"
      ],
      [
        "breathlessly"
      ]
    ]
  },
  {
    "id": 32,
    "forms": [
      [
        "calculate"
      ],
      [
        "calculation",
        "calculator"
      ],
      [
        "calculable"
      ],
      [
        "incalculable"
      ],
      [
        "incalculably"
      ]
    ]
  },
  {
    "id": 33,
    "forms": [
      [
        "care"
      ],
      [
        "care",
        "carefulness",
        "carelessness"
      ],
      [
        "careful"
      ],
      [
        "careless"
      ],
      [
        "carefully",
        "carelessly"
      ]
    ]
  },
  {
    "id": 34,
    "forms": [
      [
        "celebrate"
      ],
      [
        "celebration"
      ],
      [
        "celebratory"
      ],
      [
        "celebrated"
      ],
      null
    ]
  },
  {
    "id": 35,
    "forms": [
      [
        "change"
      ],
      [
        "change"
      ],
      [
        "changeable"
      ],
      [
        "unchangeable"
      ],
      null
    ]
  },
  {
    "id": 36,
    "forms": [
      [
        "choose"
      ],
      [
        "choice"
      ],
      [
        "chosen"
      ],
      [
        "choosy"
      ],
      null
    ]
  },
  {
    "id": 37,
    "forms": [
      [
        "clarify"
      ],
      [
        "clarity",
        "clarification"
      ],
      [
        "clear"
      ],
      [
        "unclear"
      ],
      [
        "clearly"
      ]
    ]
  },
  {
    "id": 38,
    "forms": [
      [
        "classify"
      ],
      [
        "classification"
      ],
      [
        "classified"
      ],
      [
        "unclassified"
      ],
      null
    ]
  },
  {
    "id": 39,
    "forms": [
      [
        "collect"
      ],
      [
        "collection",
        "collector"
      ],
      [
        "collective"
      ],
      [
        "collectable",
        "collectible"
      ],
      [
        "collectively"
      ]
    ]
  },
  {
    "id": 40,
    "forms": [
      [
        "combine"
      ],
      [
        "combination"
      ],
      [
        "combined"
      ],
      null,
      null
    ]
  },
  {
    "id": 41,
    "forms": [
      [
        "comfort"
      ],
      [
        "comfort"
      ],
      [
        "comfortable"
      ],
      [
        "uncomfortable"
      ],
      [
        "comfortably",
        "uncomfortably"
      ]
    ]
  },
  {
    "id": 42,
    "forms": [
      [
        "communicate"
      ],
      [
        "communication",
        "communicator"
      ],
      [
        "communicative"
      ],
      [
        "uncommunicative"
      ],
      null
    ]
  },
  {
    "id": 43,
    "forms": [
      [
        "compare"
      ],
      [
        "comparison"
      ],
      [
        "comparable"
      ],
      [
        "comparative"
      ],
      [
        "comparably",
        "comparatively"
      ]
    ]
  },
  {
    "id": 44,
    "forms": [
      [
        "compete"
      ],
      [
        "competition",
        "competitor"
      ],
      [
        "competitive"
      ],
      [
        "uncompetitive"
      ],
      [
        "competitively"
      ]
    ]
  },
  {
    "id": 45,
    "forms": [
      [
        "complain"
      ],
      [
        "complaint",
        "complainant"
      ],
      [
        "complaining"
      ],
      [
        "uncomplaining"
      ],
      [
        "uncomplainingly"
      ]
    ]
  },
  {
    "id": 46,
    "forms": [
      [
        "complete"
      ],
      [
        "completion",
        "completeness"
      ],
      [
        "complete"
      ],
      [
        "incomplete"
      ],
      [
        "completely",
        "incompletely"
      ]
    ]
  },
  {
    "id": 47,
    "forms": [
      [
        "concentrate"
      ],
      [
        "concentration"
      ],
      [
        "concentrated"
      ],
      null,
      null
    ]
  },
  {
    "id": 48,
    "forms": [
      [
        "conclude"
      ],
      [
        "conclusion"
      ],
      [
        "conclusive"
      ],
      [
        "inconclusive"
      ],
      [
        "conclusively",
        "inconclusively"
      ]
    ]
  },
  {
    "id": 49,
    "forms": [
      [
        "confuse"
      ],
      [
        "confusion"
      ],
      [
        "confusing"
      ],
      [
        "confused"
      ],
      [
        "confusingly"
      ]
    ]
  },
  {
    "id": 50,
    "forms": [
      [
        "connect"
      ],
      [
        "connection",
        "connectivity"
      ],
      [
        "connected"
      ],
      [
        "disconnected"
      ],
      null
    ]
  },
  {
    "id": 51,
    "forms": [
      [
        "consider"
      ],
      [
        "consideration"
      ],
      [
        "considerate"
      ],
      [
        "inconsiderate"
      ],
      [
        "considerately",
        "inconsiderately"
      ]
    ]
  },
  {
    "id": 52,
    "forms": [
      [
        "construct"
      ],
      [
        "construction",
        "constructor"
      ],
      [
        "constructive"
      ],
      [
        "unconstructive"
      ],
      [
        "constructively"
      ]
    ]
  },
  {
    "id": 53,
    "forms": [
      [
        "consult"
      ],
      [
        "consultation",
        "consultant"
      ],
      [
        "consultative"
      ],
      [
        "consulting"
      ],
      null
    ]
  },
  {
    "id": 54,
    "forms": [
      [
        "consume"
      ],
      [
        "consumption",
        "consumer"
      ],
      [
        "consumable"
      ],
      [
        "consuming"
      ],
      null
    ]
  },
  {
    "id": 55,
    "forms": [
      [
        "contribute"
      ],
      [
        "contribution",
        "contributor"
      ],
      [
        "contributory"
      ],
      null,
      null
    ]
  },
  {
    "id": 56,
    "forms": [
      [
        "control"
      ],
      [
        "control",
        "controller"
      ],
      [
        "controllable"
      ],
      [
        "uncontrollable"
      ],
      [
        "uncontrollably"
      ]
    ]
  },
  {
    "id": 57,
    "forms": [
      [
        "convince"
      ],
      [
        "conviction"
      ],
      [
        "convincing"
      ],
      [
        "convinced"
      ],
      [
        "convincingly"
      ]
    ]
  },
  {
    "id": 58,
    "forms": [
      [
        "cooperate",
        "co-operate"
      ],
      [
        "cooperation",
        "co-operation"
      ],
      [
        "cooperative",
        "co-operative"
      ],
      [
        "uncooperative",
        "unco-operative"
      ],
      [
        "cooperatively",
        "co-operatively"
      ]
    ]
  },
  {
    "id": 59,
    "forms": [
      [
        "correct"
      ],
      [
        "correction",
        "correctness"
      ],
      [
        "correct"
      ],
      [
        "incorrect"
      ],
      [
        "correctly",
        "incorrectly"
      ]
    ]
  },
  {
    "id": 60,
    "forms": [
      [
        "create"
      ],
      [
        "creation",
        "creativity",
        "creator"
      ],
      [
        "creative"
      ],
      [
        "uncreative"
      ],
      [
        "creatively"
      ]
    ]
  },
  {
    "id": 61,
    "forms": [
      [
        "criticise",
        "criticize"
      ],
      [
        "criticism",
        "critic"
      ],
      [
        "critical"
      ],
      [
        "uncritical"
      ],
      [
        "critically",
        "uncritically"
      ]
    ]
  },
  {
    "id": 62,
    "forms": [
      [
        "decide"
      ],
      [
        "decision"
      ],
      [
        "decisive"
      ],
      [
        "indecisive"
      ],
      [
        "decisively",
        "indecisively"
      ]
    ]
  },
  {
    "id": 63,
    "forms": [
      [
        "decorate"
      ],
      [
        "decoration",
        "decorator"
      ],
      [
        "decorative"
      ],
      [
        "decorated"
      ],
      [
        "decoratively"
      ]
    ]
  },
  {
    "id": 64,
    "forms": [
      [
        "defend"
      ],
      [
        "defence",
        "defense",
        "defender"
      ],
      [
        "defensive"
      ],
      [
        "defenceless",
        "defenseless"
      ],
      [
        "defensively"
      ]
    ]
  },
  {
    "id": 65,
    "forms": [
      [
        "define"
      ],
      [
        "definition"
      ],
      [
        "definite"
      ],
      [
        "indefinite"
      ],
      [
        "definitely",
        "indefinitely"
      ]
    ]
  },
  {
    "id": 66,
    "forms": [
      [
        "delay"
      ],
      [
        "delay"
      ],
      [
        "delayed"
      ],
      null,
      null
    ]
  },
  {
    "id": 67,
    "forms": [
      [
        "delight"
      ],
      [
        "delight"
      ],
      [
        "delightful"
      ],
      [
        "delighted"
      ],
      [
        "delightfully"
      ]
    ]
  },
  {
    "id": 68,
    "forms": [
      [
        "depend"
      ],
      [
        "dependence",
        "dependency",
        "dependant",
        "dependent",
        "independence"
      ],
      [
        "dependent"
      ],
      [
        "independent"
      ],
      [
        "independently"
      ]
    ]
  },
  {
    "id": 69,
    "forms": [
      [
        "describe"
      ],
      [
        "description"
      ],
      [
        "descriptive"
      ],
      [
        "indescribable"
      ],
      [
        "descriptively",
        "indescribably"
      ]
    ]
  },
  {
    "id": 70,
    "forms": [
      [
        "design"
      ],
      [
        "design",
        "designer"
      ],
      [
        "designer"
      ],
      null,
      null
    ]
  },
  {
    "id": 71,
    "forms": [
      [
        "destroy"
      ],
      [
        "destruction",
        "destroyer"
      ],
      [
        "destructive"
      ],
      [
        "indestructible"
      ],
      [
        "destructively"
      ]
    ]
  },
  {
    "id": 72,
    "forms": [
      [
        "determine"
      ],
      [
        "determination"
      ],
      [
        "determined"
      ],
      [
        "undetermined"
      ],
      [
        "determinedly"
      ]
    ]
  },
  {
    "id": 73,
    "forms": [
      [
        "develop"
      ],
      [
        "development",
        "developer"
      ],
      [
        "developed"
      ],
      [
        "developing"
      ],
      null
    ]
  },
  {
    "id": 74,
    "forms": [
      [
        "differ"
      ],
      [
        "difference"
      ],
      [
        "different"
      ],
      null,
      [
        "differently"
      ]
    ]
  },
  {
    "id": 75,
    "forms": [
      [
        "direct"
      ],
      [
        "direction",
        "director"
      ],
      [
        "direct"
      ],
      [
        "indirect"
      ],
      [
        "directly",
        "indirectly"
      ]
    ]
  },
  {
    "id": 76,
    "forms": [
      [
        "disappoint"
      ],
      [
        "disappointment"
      ],
      [
        "disappointing"
      ],
      [
        "disappointed"
      ],
      [
        "disappointingly"
      ]
    ]
  },
  {
    "id": 77,
    "forms": [
      [
        "discover"
      ],
      [
        "discovery",
        "discoverer"
      ],
      [
        "discoverable"
      ],
      [
        "undiscovered"
      ],
      null
    ]
  },
  {
    "id": 78,
    "forms": [
      [
        "discuss"
      ],
      [
        "discussion"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 79,
    "forms": [
      [
        "divide"
      ],
      [
        "division",
        "divider"
      ],
      [
        "divisible"
      ],
      [
        "indivisible"
      ],
      null
    ]
  },
  {
    "id": 80,
    "forms": [
      [
        "doubt"
      ],
      [
        "doubt"
      ],
      [
        "doubtful"
      ],
      [
        "undoubted"
      ],
      [
        "doubtfully",
        "undoubtedly",
        "doubtless"
      ]
    ]
  },
  {
    "id": 81,
    "forms": [
      [
        "educate"
      ],
      [
        "education",
        "educator"
      ],
      [
        "educational"
      ],
      [
        "educated"
      ],
      [
        "educationally"
      ]
    ]
  },
  {
    "id": 82,
    "forms": [
      [
        "embarrass"
      ],
      [
        "embarrassment"
      ],
      [
        "embarrassing"
      ],
      [
        "embarrassed"
      ],
      [
        "embarrassingly"
      ]
    ]
  },
  {
    "id": 83,
    "forms": [
      [
        "employ"
      ],
      [
        "employment",
        "employee",
        "employer"
      ],
      [
        "employed"
      ],
      [
        "unemployed"
      ],
      null
    ]
  },
  {
    "id": 84,
    "forms": [
      [
        "encourage"
      ],
      [
        "encouragement"
      ],
      [
        "encouraging"
      ],
      [
        "encouraged"
      ],
      [
        "encouragingly"
      ]
    ]
  },
  {
    "id": 85,
    "forms": [
      [
        "enjoy"
      ],
      [
        "enjoyment"
      ],
      [
        "enjoyable"
      ],
      [
        "unenjoyable"
      ],
      [
        "enjoyably"
      ]
    ]
  },
  {
    "id": 86,
    "forms": [
      [
        "enrich"
      ],
      [
        "enrichment",
        "richness"
      ],
      [
        "rich"
      ],
      [
        "enriched"
      ],
      [
        "richly"
      ]
    ]
  },
  {
    "id": 87,
    "forms": [
      [
        "entertain"
      ],
      [
        "entertainment",
        "entertainer"
      ],
      [
        "entertaining"
      ],
      [
        "entertained"
      ],
      [
        "entertainingly"
      ]
    ]
  },
  {
    "id": 88,
    "forms": [
      [
        "equip"
      ],
      [
        "equipment"
      ],
      [
        "equipped"
      ],
      [
        "unequipped"
      ],
      null
    ]
  },
  {
    "id": 89,
    "forms": [
      [
        "estimate"
      ],
      [
        "estimate",
        "estimation"
      ],
      [
        "estimated"
      ],
      null,
      null
    ]
  },
  {
    "id": 90,
    "forms": [
      [
        "examine"
      ],
      [
        "examination",
        "examiner"
      ],
      [
        "examinable"
      ],
      [
        "unexamined"
      ],
      null
    ]
  },
  {
    "id": 91,
    "forms": [
      [
        "excite"
      ],
      [
        "excitement"
      ],
      [
        "exciting"
      ],
      [
        "excited"
      ],
      [
        "excitingly",
        "excitedly"
      ]
    ]
  },
  {
    "id": 92,
    "forms": [
      [
        "exist"
      ],
      [
        "existence"
      ],
      [
        "existing"
      ],
      [
        "nonexistent",
        "non-existent"
      ],
      null
    ]
  },
  {
    "id": 93,
    "forms": [
      [
        "expand"
      ],
      [
        "expansion"
      ],
      [
        "expansive"
      ],
      [
        "expandable"
      ],
      [
        "expansively"
      ]
    ]
  },
  {
    "id": 94,
    "forms": [
      [
        "expect"
      ],
      [
        "expectation"
      ],
      [
        "expected"
      ],
      [
        "unexpected"
      ],
      [
        "unexpectedly"
      ]
    ]
  },
  {
    "id": 95,
    "forms": [
      [
        "experience"
      ],
      [
        "experience"
      ],
      [
        "experienced"
      ],
      [
        "inexperienced"
      ],
      null
    ]
  },
  {
    "id": 96,
    "forms": [
      [
        "explain"
      ],
      [
        "explanation"
      ],
      [
        "explanatory"
      ],
      [
        "explainable",
        "explicable"
      ],
      null
    ]
  },
  {
    "id": 97,
    "forms": [
      [
        "explore"
      ],
      [
        "exploration",
        "explorer"
      ],
      [
        "exploratory"
      ],
      [
        "unexplored"
      ],
      null
    ]
  },
  {
    "id": 98,
    "forms": [
      [
        "express"
      ],
      [
        "expression"
      ],
      [
        "expressive"
      ],
      [
        "expressionless"
      ],
      [
        "expressively",
        "expressionlessly"
      ]
    ]
  },
  {
    "id": 99,
    "forms": [
      [
        "extend"
      ],
      [
        "extension",
        "extent"
      ],
      [
        "extensive"
      ],
      [
        "extendable",
        "extendible"
      ],
      [
        "extensively"
      ]
    ]
  },
  {
    "id": 100,
    "forms": [
      [
        "fail"
      ],
      [
        "failure"
      ],
      [
        "failed"
      ],
      [
        "failing"
      ],
      null
    ]
  },
  {
    "id": 101,
    "forms": [
      [
        "fascinate"
      ],
      [
        "fascination"
      ],
      [
        "fascinating"
      ],
      [
        "fascinated"
      ],
      [
        "fascinatingly"
      ]
    ]
  },
  {
    "id": 102,
    "forms": [
      [
        "finance"
      ],
      [
        "finance",
        "financing",
        "financier"
      ],
      [
        "financial"
      ],
      null,
      [
        "financially"
      ]
    ]
  },
  {
    "id": 103,
    "forms": [
      [
        "finish"
      ],
      [
        "finish"
      ],
      [
        "finished"
      ],
      [
        "unfinished"
      ],
      null
    ]
  },
  {
    "id": 104,
    "forms": [
      [
        "fit"
      ],
      [
        "fitness",
        "fit"
      ],
      [
        "fit"
      ],
      [
        "unfit"
      ],
      null
    ]
  },
  {
    "id": 105,
    "forms": [
      [
        "forget"
      ],
      [
        "forgetfulness"
      ],
      [
        "forgetful"
      ],
      [
        "forgettable"
      ],
      [
        "forgetfully"
      ]
    ]
  },
  {
    "id": 106,
    "forms": [
      [
        "form"
      ],
      [
        "form",
        "formation"
      ],
      [
        "formal"
      ],
      [
        "informal"
      ],
      [
        "formally",
        "informally"
      ]
    ]
  },
  {
    "id": 107,
    "forms": [
      [
        "free"
      ],
      [
        "freedom"
      ],
      [
        "free"
      ],
      null,
      [
        "freely"
      ]
    ]
  },
  {
    "id": 108,
    "forms": [
      [
        "frighten"
      ],
      [
        "fright"
      ],
      [
        "frightening"
      ],
      [
        "frightened"
      ],
      [
        "frighteningly"
      ]
    ]
  },
  {
    "id": 109,
    "forms": [
      [
        "frustrate"
      ],
      [
        "frustration"
      ],
      [
        "frustrating"
      ],
      [
        "frustrated"
      ],
      [
        "frustratingly"
      ]
    ]
  },
  {
    "id": 110,
    "forms": [
      [
        "fulfil",
        "fulfill"
      ],
      [
        "fulfilment",
        "fulfillment"
      ],
      [
        "fulfilling"
      ],
      [
        "fulfilled"
      ],
      null
    ]
  },
  {
    "id": 111,
    "forms": [
      [
        "govern"
      ],
      [
        "government",
        "governor",
        "governance"
      ],
      [
        "governmental"
      ],
      [
        "governing"
      ],
      null
    ]
  },
  {
    "id": 112,
    "forms": [
      [
        "grow"
      ],
      [
        "growth",
        "grower"
      ],
      [
        "growing"
      ],
      [
        "grown"
      ],
      null
    ]
  },
  {
    "id": 113,
    "forms": [
      [
        "guide"
      ],
      [
        "guidance",
        "guide"
      ],
      [
        "guided"
      ],
      [
        "misguided"
      ],
      null
    ]
  },
  {
    "id": 114,
    "forms": [
      [
        "harm"
      ],
      [
        "harm"
      ],
      [
        "harmful"
      ],
      [
        "harmless"
      ],
      [
        "harmlessly"
      ]
    ]
  },
  {
    "id": 115,
    "forms": [
      [
        "hate"
      ],
      [
        "hate",
        "hatred"
      ],
      [
        "hateful"
      ],
      [
        "hated"
      ],
      [
        "hatefully"
      ]
    ]
  },
  {
    "id": 116,
    "forms": [
      null,
      [
        "health"
      ],
      [
        "healthy"
      ],
      [
        "unhealthy"
      ],
      [
        "healthily",
        "unhealthily"
      ]
    ]
  },
  {
    "id": 117,
    "forms": [
      [
        "help"
      ],
      [
        "help",
        "helper"
      ],
      [
        "helpful"
      ],
      [
        "helpless"
      ],
      [
        "helpfully",
        "helplessly"
      ]
    ]
  },
  {
    "id": 118,
    "forms": [
      [
        "hesitate"
      ],
      [
        "hesitation"
      ],
      [
        "hesitant"
      ],
      [
        "unhesitating"
      ],
      [
        "hesitantly",
        "unhesitatingly"
      ]
    ]
  },
  {
    "id": 119,
    "forms": [
      [
        "hope"
      ],
      [
        "hope"
      ],
      [
        "hopeful"
      ],
      [
        "hopeless"
      ],
      [
        "hopefully",
        "hopelessly"
      ]
    ]
  },
  {
    "id": 120,
    "forms": [
      [
        "identify"
      ],
      [
        "identity",
        "identification"
      ],
      [
        "identifiable"
      ],
      [
        "unidentifiable"
      ],
      null
    ]
  },
  {
    "id": 121,
    "forms": [
      [
        "ignore"
      ],
      [
        "ignorance"
      ],
      [
        "ignorant"
      ],
      null,
      [
        "ignorantly"
      ]
    ]
  },
  {
    "id": 122,
    "forms": [
      [
        "illustrate"
      ],
      [
        "illustration",
        "illustrator"
      ],
      [
        "illustrative"
      ],
      [
        "illustrated"
      ],
      null
    ]
  },
  {
    "id": 123,
    "forms": [
      [
        "imagine"
      ],
      [
        "imagination"
      ],
      [
        "imaginative"
      ],
      [
        "imaginary"
      ],
      [
        "imaginatively"
      ]
    ]
  },
  {
    "id": 124,
    "forms": [
      [
        "improve"
      ],
      [
        "improvement"
      ],
      [
        "improved"
      ],
      [
        "unimproved"
      ],
      null
    ]
  },
  {
    "id": 125,
    "forms": [
      [
        "include"
      ],
      [
        "inclusion"
      ],
      [
        "inclusive"
      ],
      null,
      [
        "inclusively"
      ]
    ]
  },
  {
    "id": 126,
    "forms": [
      [
        "increase"
      ],
      [
        "increase"
      ],
      [
        "increasing"
      ],
      [
        "increased"
      ],
      [
        "increasingly"
      ]
    ]
  },
  {
    "id": 127,
    "forms": [
      [
        "influence"
      ],
      [
        "influence"
      ],
      [
        "influential"
      ],
      null,
      null
    ]
  },
  {
    "id": 128,
    "forms": [
      [
        "inform"
      ],
      [
        "information",
        "informant",
        "informer"
      ],
      [
        "informative"
      ],
      [
        "informed"
      ],
      [
        "informatively"
      ]
    ]
  },
  {
    "id": 129,
    "forms": [
      [
        "injure"
      ],
      [
        "injury"
      ],
      [
        "injured"
      ],
      [
        "uninjured"
      ],
      null
    ]
  },
  {
    "id": 130,
    "forms": [
      [
        "innovate"
      ],
      [
        "innovation",
        "innovator"
      ],
      [
        "innovative",
        "innovatory"
      ],
      null,
      [
        "innovatively"
      ]
    ]
  },
  {
    "id": 131,
    "forms": [
      [
        "inspire"
      ],
      [
        "inspiration"
      ],
      [
        "inspiring"
      ],
      [
        "inspired"
      ],
      null
    ]
  },
  {
    "id": 132,
    "forms": [
      [
        "instruct"
      ],
      [
        "instruction",
        "instructor"
      ],
      [
        "instructive"
      ],
      [
        "instructional"
      ],
      [
        "instructively"
      ]
    ]
  },
  {
    "id": 133,
    "forms": [
      [
        "insure"
      ],
      [
        "insurance",
        "insurer"
      ],
      [
        "insured"
      ],
      [
        "uninsured"
      ],
      null
    ]
  },
  {
    "id": 134,
    "forms": [
      [
        "intend"
      ],
      [
        "intention",
        "intent"
      ],
      [
        "intentional"
      ],
      [
        "unintentional"
      ],
      [
        "intentionally",
        "unintentionally"
      ]
    ]
  },
  {
    "id": 135,
    "forms": [
      [
        "interest"
      ],
      [
        "interest"
      ],
      [
        "interesting"
      ],
      [
        "interested"
      ],
      [
        "interestingly"
      ]
    ]
  },
  {
    "id": 136,
    "forms": [
      [
        "interpret"
      ],
      [
        "interpretation",
        "interpreter"
      ],
      [
        "interpretative",
        "interpretive"
      ],
      [
        "interpretable"
      ],
      null
    ]
  },
  {
    "id": 137,
    "forms": [
      [
        "introduce"
      ],
      [
        "introduction"
      ],
      [
        "introductory"
      ],
      null,
      null
    ]
  },
  {
    "id": 138,
    "forms": [
      [
        "invent"
      ],
      [
        "invention",
        "inventor"
      ],
      [
        "inventive"
      ],
      null,
      [
        "inventively"
      ]
    ]
  },
  {
    "id": 139,
    "forms": [
      [
        "invite"
      ],
      [
        "invitation"
      ],
      [
        "inviting"
      ],
      [
        "uninvited"
      ],
      [
        "invitingly"
      ]
    ]
  },
  {
    "id": 140,
    "forms": [
      [
        "involve"
      ],
      [
        "involvement"
      ],
      [
        "involved"
      ],
      [
        "uninvolved"
      ],
      null
    ]
  },
  {
    "id": 141,
    "forms": [
      [
        "irritate"
      ],
      [
        "irritation"
      ],
      [
        "irritating"
      ],
      [
        "irritated"
      ],
      [
        "irritatingly"
      ]
    ]
  },
  {
    "id": 142,
    "forms": [
      [
        "judge"
      ],
      [
        "judgement",
        "judgment",
        "judge"
      ],
      [
        "judgemental",
        "judgmental"
      ],
      [
        "nonjudgemental",
        "nonjudgmental",
        "non-judgemental",
        "non-judgmental"
      ],
      [
        "judgementally",
        "judgmentally"
      ]
    ]
  },
  {
    "id": 143,
    "forms": [
      [
        "justify"
      ],
      [
        "justification",
        "justice"
      ],
      [
        "justifiable"
      ],
      [
        "unjustifiable"
      ],
      [
        "justifiably",
        "unjustifiably"
      ]
    ]
  },
  {
    "id": 144,
    "forms": [
      [
        "know"
      ],
      [
        "knowledge"
      ],
      [
        "known"
      ],
      [
        "unknown"
      ],
      null
    ]
  },
  {
    "id": 145,
    "forms": [
      [
        "laugh"
      ],
      [
        "laughter",
        "laugh"
      ],
      [
        "laughable"
      ],
      [
        "laughing"
      ],
      [
        "laughably"
      ]
    ]
  },
  {
    "id": 146,
    "forms": [
      [
        "lead"
      ],
      [
        "leadership",
        "leader",
        "lead"
      ],
      [
        "leading"
      ],
      [
        "misleading"
      ],
      [
        "misleadingly"
      ]
    ]
  },
  {
    "id": 147,
    "forms": [
      [
        "learn"
      ],
      [
        "learning",
        "learner"
      ],
      [
        "learned"
      ],
      null,
      null
    ]
  },
  {
    "id": 148,
    "forms": [
      [
        "lengthen"
      ],
      [
        "length",
        "lengthening"
      ],
      [
        "long"
      ],
      [
        "lengthy"
      ],
      [
        "long"
      ]
    ]
  },
  {
    "id": 149,
    "forms": [
      [
        "like"
      ],
      [
        "liking",
        "like"
      ],
      [
        "likeable",
        "likable"
      ],
      [
        "unlikeable",
        "unlikable"
      ],
      null
    ]
  },
  {
    "id": 150,
    "forms": [
      [
        "live"
      ],
      [
        "life",
        "living"
      ],
      [
        "lively"
      ],
      [
        "lifeless"
      ],
      [
        "lifelessly"
      ]
    ]
  },
  {
    "id": 151,
    "forms": [
      [
        "love"
      ],
      [
        "love",
        "lover"
      ],
      [
        "lovable",
        "loveable"
      ],
      [
        "loving"
      ],
      [
        "lovingly"
      ]
    ]
  },
  {
    "id": 152,
    "forms": [
      [
        "manage"
      ],
      [
        "management",
        "manager"
      ],
      [
        "manageable"
      ],
      [
        "unmanageable"
      ],
      null
    ]
  },
  {
    "id": 153,
    "forms": [
      [
        "marry"
      ],
      [
        "marriage"
      ],
      [
        "married"
      ],
      [
        "unmarried"
      ],
      null
    ]
  },
  {
    "id": 154,
    "forms": [
      [
        "measure"
      ],
      [
        "measurement",
        "measure"
      ],
      [
        "measurable"
      ],
      [
        "immeasurable"
      ],
      [
        "measurably",
        "immeasurably"
      ]
    ]
  },
  {
    "id": 155,
    "forms": [
      [
        "memorise",
        "memorize"
      ],
      [
        "memory",
        "memorisation",
        "memorization"
      ],
      [
        "memorable"
      ],
      null,
      [
        "memorably"
      ]
    ]
  },
  {
    "id": 156,
    "forms": [
      [
        "modernise",
        "modernize"
      ],
      [
        "modernisation",
        "modernization",
        "modernity"
      ],
      [
        "modern"
      ],
      [
        "modernised",
        "modernized"
      ],
      null
    ]
  },
  {
    "id": 157,
    "forms": [
      [
        "motivate"
      ],
      [
        "motivation"
      ],
      [
        "motivated"
      ],
      [
        "unmotivated"
      ],
      null
    ]
  },
  {
    "id": 158,
    "forms": [
      [
        "move"
      ],
      [
        "movement",
        "move"
      ],
      [
        "moving"
      ],
      [
        "movable",
        "moveable"
      ],
      [
        "movingly"
      ]
    ]
  },
  {
    "id": 159,
    "forms": [
      [
        "name"
      ],
      [
        "name"
      ],
      [
        "named"
      ],
      [
        "nameless"
      ],
      null
    ]
  },
  {
    "id": 160,
    "forms": [
      [
        "observe"
      ],
      [
        "observation",
        "observer"
      ],
      [
        "observant"
      ],
      [
        "observable"
      ],
      [
        "observably"
      ]
    ]
  },
  {
    "id": 161,
    "forms": [
      [
        "offend"
      ],
      [
        "offence",
        "offense",
        "offender"
      ],
      [
        "offensive"
      ],
      [
        "inoffensive"
      ],
      [
        "offensively",
        "inoffensively"
      ]
    ]
  },
  {
    "id": 162,
    "forms": [
      [
        "operate"
      ],
      [
        "operation",
        "operator"
      ],
      [
        "operational"
      ],
      [
        "operative"
      ],
      [
        "operationally"
      ]
    ]
  },
  {
    "id": 163,
    "forms": [
      [
        "oppose"
      ],
      [
        "opposition",
        "opponent"
      ],
      [
        "opposed"
      ],
      [
        "opposing"
      ],
      null
    ]
  },
  {
    "id": 164,
    "forms": [
      [
        "organise",
        "organize"
      ],
      [
        "organisation",
        "organization",
        "organiser",
        "organizer"
      ],
      [
        "organised",
        "organized"
      ],
      [
        "disorganised",
        "disorganized"
      ],
      null
    ]
  },
  {
    "id": 165,
    "forms": [
      [
        "originate"
      ],
      [
        "origin",
        "originality"
      ],
      [
        "original"
      ],
      [
        "unoriginal"
      ],
      [
        "originally"
      ]
    ]
  },
  {
    "id": 166,
    "forms": [
      [
        "participate"
      ],
      [
        "participation",
        "participant"
      ],
      [
        "participatory"
      ],
      null,
      null
    ]
  },
  {
    "id": 167,
    "forms": [
      [
        "perform"
      ],
      [
        "performance",
        "performer"
      ],
      [
        "performing"
      ],
      [
        "underperforming"
      ],
      null
    ]
  },
  {
    "id": 168,
    "forms": [
      [
        "permit"
      ],
      [
        "permission",
        "permit"
      ],
      [
        "permissible"
      ],
      [
        "impermissible"
      ],
      null
    ]
  },
  {
    "id": 169,
    "forms": [
      [
        "persuade"
      ],
      [
        "persuasion"
      ],
      [
        "persuasive"
      ],
      [
        "unpersuasive"
      ],
      [
        "persuasively"
      ]
    ]
  },
  {
    "id": 170,
    "forms": [
      [
        "please"
      ],
      [
        "pleasure"
      ],
      [
        "pleasant"
      ],
      [
        "unpleasant"
      ],
      [
        "pleasantly",
        "unpleasantly"
      ]
    ]
  },
  {
    "id": 171,
    "forms": [
      [
        "pollute"
      ],
      [
        "pollution",
        "pollutant"
      ],
      [
        "polluted"
      ],
      [
        "unpolluted"
      ],
      null
    ]
  },
  {
    "id": 172,
    "forms": [
      [
        "popularise",
        "popularize"
      ],
      [
        "popularity",
        "popularisation",
        "popularization"
      ],
      [
        "popular"
      ],
      [
        "unpopular"
      ],
      [
        "popularly"
      ]
    ]
  },
  {
    "id": 173,
    "forms": [
      [
        "predict"
      ],
      [
        "prediction",
        "predictor"
      ],
      [
        "predictable"
      ],
      [
        "unpredictable"
      ],
      [
        "predictably",
        "unpredictably"
      ]
    ]
  },
  {
    "id": 174,
    "forms": [
      [
        "prefer"
      ],
      [
        "preference"
      ],
      [
        "preferable"
      ],
      [
        "preferred"
      ],
      [
        "preferably"
      ]
    ]
  },
  {
    "id": 175,
    "forms": [
      [
        "prepare"
      ],
      [
        "preparation"
      ],
      [
        "prepared"
      ],
      [
        "unprepared"
      ],
      null
    ]
  },
  {
    "id": 176,
    "forms": [
      [
        "prevent"
      ],
      [
        "prevention"
      ],
      [
        "preventive",
        "preventative"
      ],
      [
        "preventable"
      ],
      null
    ]
  },
  {
    "id": 177,
    "forms": [
      [
        "print"
      ],
      [
        "print",
        "printer",
        "printing"
      ],
      [
        "printable"
      ],
      [
        "printed"
      ],
      null
    ]
  },
  {
    "id": 178,
    "forms": [
      [
        "produce"
      ],
      [
        "production",
        "product",
        "producer",
        "productivity"
      ],
      [
        "productive"
      ],
      [
        "unproductive"
      ],
      [
        "productively",
        "unproductively"
      ]
    ]
  },
  {
    "id": 179,
    "forms": [
      [
        "progress"
      ],
      [
        "progress",
        "progression"
      ],
      [
        "progressive"
      ],
      null,
      [
        "progressively"
      ]
    ]
  },
  {
    "id": 180,
    "forms": [
      [
        "protect"
      ],
      [
        "protection",
        "protector"
      ],
      [
        "protective"
      ],
      [
        "protected"
      ],
      [
        "protectively"
      ]
    ]
  },
  {
    "id": 181,
    "forms": [
      [
        "prove"
      ],
      [
        "proof"
      ],
      [
        "proven",
        "proved"
      ],
      [
        "unproven"
      ],
      null
    ]
  },
  {
    "id": 182,
    "forms": [
      [
        "provide"
      ],
      [
        "provision",
        "provider"
      ],
      [
        "provisional"
      ],
      null,
      [
        "provisionally"
      ]
    ]
  },
  {
    "id": 183,
    "forms": [
      [
        "publish"
      ],
      [
        "publication",
        "publisher",
        "publishing"
      ],
      [
        "published"
      ],
      [
        "unpublished"
      ],
      null
    ]
  },
  {
    "id": 184,
    "forms": [
      [
        "qualify"
      ],
      [
        "qualification"
      ],
      [
        "qualified"
      ],
      [
        "unqualified"
      ],
      null
    ]
  },
  {
    "id": 185,
    "forms": [
      [
        "question"
      ],
      [
        "question",
        "questioner"
      ],
      [
        "questionable"
      ],
      [
        "unquestionable"
      ],
      [
        "questionably",
        "unquestionably"
      ]
    ]
  },
  {
    "id": 186,
    "forms": [
      [
        "react"
      ],
      [
        "reaction"
      ],
      [
        "reactive"
      ],
      null,
      null
    ]
  },
  {
    "id": 187,
    "forms": [
      [
        "read"
      ],
      [
        "reading",
        "reader",
        "readability"
      ],
      [
        "readable"
      ],
      [
        "unreadable"
      ],
      null
    ]
  },
  {
    "id": 188,
    "forms": [
      [
        "realise",
        "realize"
      ],
      [
        "realisation",
        "realization",
        "reality"
      ],
      [
        "real"
      ],
      [
        "unreal"
      ],
      [
        "really"
      ]
    ]
  },
  {
    "id": 189,
    "forms": [
      [
        "recognise",
        "recognize"
      ],
      [
        "recognition"
      ],
      [
        "recognisable",
        "recognizable"
      ],
      [
        "unrecognisable",
        "unrecognizable"
      ],
      [
        "recognisably",
        "recognizably"
      ]
    ]
  },
  {
    "id": 190,
    "forms": [
      [
        "recommend"
      ],
      [
        "recommendation"
      ],
      [
        "recommended"
      ],
      null,
      null
    ]
  },
  {
    "id": 191,
    "forms": [
      [
        "recover"
      ],
      [
        "recovery"
      ],
      [
        "recoverable"
      ],
      [
        "irrecoverable"
      ],
      [
        "irrecoverably"
      ]
    ]
  },
  {
    "id": 192,
    "forms": [
      [
        "reduce"
      ],
      [
        "reduction"
      ],
      [
        "reducible"
      ],
      [
        "irreducible"
      ],
      null
    ]
  },
  {
    "id": 193,
    "forms": [
      [
        "refer"
      ],
      [
        "reference",
        "referral"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 194,
    "forms": [
      [
        "reflect"
      ],
      [
        "reflection"
      ],
      [
        "reflective"
      ],
      null,
      [
        "reflectively"
      ]
    ]
  },
  {
    "id": 195,
    "forms": [
      [
        "refuse"
      ],
      [
        "refusal"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 196,
    "forms": [
      [
        "regret"
      ],
      [
        "regret"
      ],
      [
        "regretful"
      ],
      [
        "regrettable"
      ],
      [
        "regretfully",
        "regrettably"
      ]
    ]
  },
  {
    "id": 197,
    "forms": [
      [
        "relate"
      ],
      [
        "relation",
        "relationship"
      ],
      [
        "related"
      ],
      [
        "relative"
      ],
      [
        "relatively"
      ]
    ]
  },
  {
    "id": 198,
    "forms": [
      [
        "relax"
      ],
      [
        "relaxation"
      ],
      [
        "relaxing"
      ],
      [
        "relaxed"
      ],
      null
    ]
  },
  {
    "id": 199,
    "forms": [
      [
        "rely"
      ],
      [
        "reliance",
        "reliability",
        "unreliability"
      ],
      [
        "reliable"
      ],
      [
        "unreliable"
      ],
      [
        "reliably",
        "unreliably"
      ]
    ]
  },
  {
    "id": 200,
    "forms": [
      [
        "remain"
      ],
      [
        "remainder",
        "remains"
      ],
      [
        "remaining"
      ],
      null,
      null
    ]
  },
  {
    "id": 201,
    "forms": [
      [
        "remember"
      ],
      [
        "remembrance"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 202,
    "forms": [
      [
        "renew"
      ],
      [
        "renewal"
      ],
      [
        "renewable"
      ],
      [
        "nonrenewable",
        "non-renewable"
      ],
      null
    ]
  },
  {
    "id": 203,
    "forms": [
      [
        "replace"
      ],
      [
        "replacement"
      ],
      [
        "replaceable"
      ],
      [
        "irreplaceable"
      ],
      [
        "irreplaceably"
      ]
    ]
  },
  {
    "id": 204,
    "forms": [
      [
        "represent"
      ],
      [
        "representation",
        "representative"
      ],
      [
        "representative"
      ],
      [
        "unrepresentative"
      ],
      null
    ]
  },
  {
    "id": 205,
    "forms": [
      [
        "require"
      ],
      [
        "requirement"
      ],
      [
        "required"
      ],
      null,
      null
    ]
  },
  {
    "id": 206,
    "forms": [
      [
        "research"
      ],
      [
        "research",
        "researcher"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 207,
    "forms": [
      [
        "resist"
      ],
      [
        "resistance"
      ],
      [
        "resistant"
      ],
      [
        "irresistible"
      ],
      [
        "irresistibly"
      ]
    ]
  },
  {
    "id": 208,
    "forms": [
      [
        "respond"
      ],
      [
        "response",
        "respondent"
      ],
      [
        "responsive"
      ],
      [
        "unresponsive"
      ],
      [
        "responsively"
      ]
    ]
  },
  {
    "id": 209,
    "forms": [
      [
        "revise"
      ],
      [
        "revision"
      ],
      [
        "revised"
      ],
      null,
      null
    ]
  },
  {
    "id": 210,
    "forms": [
      [
        "risk"
      ],
      [
        "risk"
      ],
      [
        "risky"
      ],
      [
        "risk-free"
      ],
      [
        "riskily"
      ]
    ]
  },
  {
    "id": 211,
    "forms": [
      [
        "satisfy"
      ],
      [
        "satisfaction"
      ],
      [
        "satisfactory"
      ],
      [
        "unsatisfactory"
      ],
      [
        "satisfactorily",
        "unsatisfactorily"
      ]
    ]
  },
  {
    "id": 212,
    "forms": [
      [
        "save"
      ],
      [
        "saving",
        "savings",
        "saver"
      ],
      [
        "savable",
        "saveable"
      ],
      [
        "unsaved"
      ],
      null
    ]
  },
  {
    "id": 213,
    "forms": [
      [
        "scare"
      ],
      [
        "scare"
      ],
      [
        "scary"
      ],
      [
        "scared"
      ],
      [
        "scarily"
      ]
    ]
  },
  {
    "id": 214,
    "forms": [
      [
        "secure"
      ],
      [
        "security"
      ],
      [
        "secure"
      ],
      [
        "insecure"
      ],
      [
        "securely",
        "insecurely"
      ]
    ]
  },
  {
    "id": 215,
    "forms": [
      [
        "see"
      ],
      [
        "sight"
      ],
      [
        "sighted"
      ],
      [
        "sightless"
      ],
      null
    ]
  },
  {
    "id": 216,
    "forms": [
      [
        "select"
      ],
      [
        "selection",
        "selector"
      ],
      [
        "selective"
      ],
      [
        "selected"
      ],
      [
        "selectively"
      ]
    ]
  },
  {
    "id": 217,
    "forms": [
      [
        "sense"
      ],
      [
        "sense",
        "sensitivity",
        "sensation"
      ],
      [
        "sensitive"
      ],
      [
        "insensitive"
      ],
      [
        "sensitively",
        "insensitively"
      ]
    ]
  },
  {
    "id": 218,
    "forms": [
      [
        "separate"
      ],
      [
        "separation"
      ],
      [
        "separate"
      ],
      [
        "inseparable"
      ],
      [
        "separately",
        "inseparably"
      ]
    ]
  },
  {
    "id": 219,
    "forms": [
      [
        "serve"
      ],
      [
        "service",
        "server",
        "servant"
      ],
      [
        "serviceable"
      ],
      [
        "unserviceable"
      ],
      null
    ]
  },
  {
    "id": 220,
    "forms": [
      [
        "simplify"
      ],
      [
        "simplicity",
        "simplification"
      ],
      [
        "simple"
      ],
      [
        "simplistic"
      ],
      [
        "simply",
        "simplistically"
      ]
    ]
  },
  {
    "id": 221,
    "forms": [
      [
        "solve"
      ],
      [
        "solution",
        "solver"
      ],
      [
        "solvable"
      ],
      [
        "unsolvable",
        "insoluble"
      ],
      null
    ]
  },
  {
    "id": 222,
    "forms": [
      [
        "specialise",
        "specialize"
      ],
      [
        "specialisation",
        "specialization",
        "specialist"
      ],
      [
        "special"
      ],
      [
        "specialised",
        "specialized"
      ],
      [
        "specially",
        "especially"
      ]
    ]
  },
  {
    "id": 223,
    "forms": [
      [
        "spend"
      ],
      [
        "spending",
        "spender"
      ],
      [
        "spent"
      ],
      [
        "unspent"
      ],
      null
    ]
  },
  {
    "id": 224,
    "forms": [
      [
        "strengthen"
      ],
      [
        "strength"
      ],
      [
        "strong"
      ],
      null,
      [
        "strongly"
      ]
    ]
  },
  {
    "id": 225,
    "forms": [
      [
        "study"
      ],
      [
        "study",
        "student"
      ],
      [
        "studious"
      ],
      [
        "studied"
      ],
      [
        "studiously"
      ]
    ]
  },
  {
    "id": 226,
    "forms": [
      [
        "succeed"
      ],
      [
        "success",
        "successor"
      ],
      [
        "successful"
      ],
      [
        "unsuccessful"
      ],
      [
        "successfully",
        "unsuccessfully"
      ]
    ]
  },
  {
    "id": 227,
    "forms": [
      [
        "suggest"
      ],
      [
        "suggestion"
      ],
      [
        "suggestive"
      ],
      null,
      [
        "suggestively"
      ]
    ]
  },
  {
    "id": 228,
    "forms": [
      [
        "support"
      ],
      [
        "support",
        "supporter"
      ],
      [
        "supportive"
      ],
      [
        "unsupportive"
      ],
      [
        "supportively"
      ]
    ]
  },
  {
    "id": 229,
    "forms": [
      [
        "surprise"
      ],
      [
        "surprise"
      ],
      [
        "surprising"
      ],
      [
        "surprised"
      ],
      [
        "surprisingly"
      ]
    ]
  },
  {
    "id": 230,
    "forms": [
      [
        "survive"
      ],
      [
        "survival",
        "survivor"
      ],
      [
        "surviving"
      ],
      [
        "survivable"
      ],
      null
    ]
  },
  {
    "id": 231,
    "forms": [
      [
        "teach"
      ],
      [
        "teaching",
        "teacher"
      ],
      [
        "teachable"
      ],
      [
        "unteachable"
      ],
      null
    ]
  },
  {
    "id": 232,
    "forms": [
      [
        "think"
      ],
      [
        "thought",
        "thinker"
      ],
      [
        "thoughtful"
      ],
      [
        "thoughtless"
      ],
      [
        "thoughtfully",
        "thoughtlessly"
      ]
    ]
  },
  {
    "id": 233,
    "forms": [
      [
        "threaten"
      ],
      [
        "threat"
      ],
      [
        "threatening"
      ],
      [
        "threatened"
      ],
      [
        "threateningly"
      ]
    ]
  },
  {
    "id": 234,
    "forms": [
      [
        "tolerate"
      ],
      [
        "tolerance"
      ],
      [
        "tolerant"
      ],
      [
        "intolerant"
      ],
      [
        "tolerantly"
      ]
    ]
  },
  {
    "id": 235,
    "forms": [
      [
        "train"
      ],
      [
        "training",
        "trainer",
        "trainee"
      ],
      [
        "trained"
      ],
      [
        "untrained"
      ],
      null
    ]
  },
  {
    "id": 236,
    "forms": [
      [
        "transform"
      ],
      [
        "transformation"
      ],
      [
        "transformative"
      ],
      null,
      null
    ]
  },
  {
    "id": 237,
    "forms": [
      [
        "travel"
      ],
      [
        "travel",
        "traveller",
        "traveler"
      ],
      [
        "well-travelled",
        "well-traveled"
      ],
      [
        "travelling",
        "traveling"
      ],
      null
    ]
  },
  {
    "id": 238,
    "forms": [
      [
        "treat"
      ],
      [
        "treatment",
        "treat"
      ],
      [
        "treatable"
      ],
      [
        "untreatable"
      ],
      null
    ]
  },
  {
    "id": 239,
    "forms": [
      [
        "trust"
      ],
      [
        "trust"
      ],
      [
        "trustworthy"
      ],
      [
        "untrustworthy"
      ],
      null
    ]
  },
  {
    "id": 240,
    "forms": [
      [
        "understand"
      ],
      [
        "understanding"
      ],
      [
        "understandable"
      ],
      [
        "understanding"
      ],
      [
        "understandably"
      ]
    ]
  },
  {
    "id": 241,
    "forms": [
      [
        "unite",
        "unify"
      ],
      [
        "unity",
        "union",
        "unification"
      ],
      [
        "united"
      ],
      [
        "disunited"
      ],
      null
    ]
  },
  {
    "id": 242,
    "forms": [
      [
        "use"
      ],
      [
        "use",
        "user",
        "usefulness"
      ],
      [
        "useful"
      ],
      [
        "useless"
      ],
      [
        "usefully",
        "uselessly"
      ]
    ]
  },
  {
    "id": 243,
    "forms": [
      [
        "vary"
      ],
      [
        "variation",
        "variety"
      ],
      [
        "variable"
      ],
      [
        "various"
      ],
      [
        "variably",
        "variously"
      ]
    ]
  },
  {
    "id": 244,
    "forms": [
      [
        "visit"
      ],
      [
        "visit",
        "visitor"
      ],
      [
        "visiting"
      ],
      null,
      null
    ]
  },
  {
    "id": 245,
    "forms": [
      [
        "volunteer"
      ],
      [
        "volunteer",
        "volunteering"
      ],
      [
        "voluntary"
      ],
      [
        "involuntary"
      ],
      [
        "voluntarily",
        "involuntarily"
      ]
    ]
  },
  {
    "id": 246,
    "forms": [
      [
        "wait"
      ],
      [
        "wait",
        "waiter",
        "waitress"
      ],
      [
        "waiting"
      ],
      null,
      null
    ]
  },
  {
    "id": 247,
    "forms": [
      [
        "want"
      ],
      [
        "want"
      ],
      [
        "wanted"
      ],
      [
        "unwanted"
      ],
      null
    ]
  },
  {
    "id": 248,
    "forms": [
      [
        "warn"
      ],
      [
        "warning"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 249,
    "forms": [
      [
        "waste"
      ],
      [
        "waste",
        "wastage"
      ],
      [
        "wasteful"
      ],
      [
        "wasted"
      ],
      [
        "wastefully"
      ]
    ]
  },
  {
    "id": 250,
    "forms": [
      [
        "weaken"
      ],
      [
        "weakness"
      ],
      [
        "weak"
      ],
      null,
      [
        "weakly"
      ]
    ]
  },
  {
    "id": 251,
    "forms": [
      [
        "weigh"
      ],
      [
        "weight",
        "weightlessness"
      ],
      [
        "weighty"
      ],
      [
        "weightless"
      ],
      null
    ]
  },
  {
    "id": 252,
    "forms": [
      [
        "widen"
      ],
      [
        "width"
      ],
      [
        "wide"
      ],
      null,
      [
        "widely"
      ]
    ]
  },
  {
    "id": 253,
    "forms": [
      [
        "wonder"
      ],
      [
        "wonder"
      ],
      [
        "wonderful"
      ],
      null,
      [
        "wonderfully"
      ]
    ]
  },
  {
    "id": 254,
    "forms": [
      [
        "work"
      ],
      [
        "work",
        "worker"
      ],
      [
        "workable"
      ],
      [
        "unworkable"
      ],
      null
    ]
  },
  {
    "id": 255,
    "forms": [
      [
        "worry"
      ],
      [
        "worry"
      ],
      [
        "worrying"
      ],
      [
        "worried"
      ],
      [
        "worryingly"
      ]
    ]
  },
  {
    "id": 256,
    "forms": [
      [
        "write"
      ],
      [
        "writing",
        "writer"
      ],
      [
        "written"
      ],
      [
        "unwritten"
      ],
      null
    ]
  },
  {
    "id": 257,
    "forms": [
      [
        "enable",
        "disable"
      ],
      [
        "ability",
        "disability"
      ],
      [
        "able"
      ],
      [
        "unable"
      ],
      [
        "ably"
      ]
    ]
  },
  {
    "id": 258,
    "forms": [
      [
        "absent"
      ],
      [
        "absence"
      ],
      [
        "absent"
      ],
      null,
      [
        "absently"
      ]
    ]
  },
  {
    "id": 259,
    "forms": [
      [
        "anger"
      ],
      [
        "anger"
      ],
      [
        "angry"
      ],
      null,
      [
        "angrily"
      ]
    ]
  },
  {
    "id": 260,
    "forms": [
      null,
      [
        "anxiety"
      ],
      [
        "anxious"
      ],
      null,
      [
        "anxiously"
      ]
    ]
  },
  {
    "id": 261,
    "forms": [
      [
        "beautify"
      ],
      [
        "beauty"
      ],
      [
        "beautiful"
      ],
      null,
      [
        "beautifully"
      ]
    ]
  },
  {
    "id": 262,
    "forms": [
      [
        "brave"
      ],
      [
        "bravery"
      ],
      [
        "brave"
      ],
      null,
      [
        "bravely"
      ]
    ]
  },
  {
    "id": 263,
    "forms": [
      [
        "brighten"
      ],
      [
        "brightness"
      ],
      [
        "bright"
      ],
      null,
      [
        "brightly"
      ]
    ]
  },
  {
    "id": 264,
    "forms": [
      [
        "busy"
      ],
      [
        "busyness"
      ],
      [
        "busy"
      ],
      null,
      [
        "busily"
      ]
    ]
  },
  {
    "id": 265,
    "forms": [
      null,
      [
        "certainty",
        "uncertainty"
      ],
      [
        "certain"
      ],
      [
        "uncertain"
      ],
      [
        "certainly"
      ]
    ]
  },
  {
    "id": 266,
    "forms": [
      null,
      [
        "charity"
      ],
      [
        "charitable"
      ],
      [
        "uncharitable"
      ],
      [
        "charitably",
        "uncharitably"
      ]
    ]
  },
  {
    "id": 267,
    "forms": [
      [
        "cheapen"
      ],
      [
        "cheapness"
      ],
      [
        "cheap"
      ],
      null,
      [
        "cheaply"
      ]
    ]
  },
  {
    "id": 268,
    "forms": [
      [
        "cheer"
      ],
      [
        "cheer",
        "cheerfulness"
      ],
      [
        "cheerful"
      ],
      [
        "cheerless"
      ],
      [
        "cheerfully"
      ]
    ]
  },
  {
    "id": 269,
    "forms": [
      null,
      [
        "child",
        "childhood"
      ],
      [
        "childish"
      ],
      [
        "childlike"
      ],
      [
        "childishly"
      ]
    ]
  },
  {
    "id": 270,
    "forms": [
      [
        "clean"
      ],
      [
        "cleanliness"
      ],
      [
        "clean"
      ],
      [
        "unclean"
      ],
      [
        "cleanly"
      ]
    ]
  },
  {
    "id": 271,
    "forms": [
      [
        "colour",
        "color"
      ],
      [
        "colour",
        "color"
      ],
      [
        "colourful",
        "colorful"
      ],
      [
        "colourless",
        "colorless"
      ],
      [
        "colourfully",
        "colorfully"
      ]
    ]
  },
  {
    "id": 272,
    "forms": [
      null,
      [
        "confidence"
      ],
      [
        "confident"
      ],
      [
        "overconfident"
      ],
      [
        "confidently"
      ]
    ]
  },
  {
    "id": 273,
    "forms": [
      [
        "forgive"
      ],
      [
        "forgiveness"
      ],
      [
        "forgiving"
      ],
      [
        "unforgiving"
      ],
      null
    ]
  },
  {
    "id": 274,
    "forms": [
      [
        "darken"
      ],
      [
        "darkness"
      ],
      [
        "dark"
      ],
      null,
      [
        "darkly"
      ]
    ]
  },
  {
    "id": 275,
    "forms": [
      [
        "deepen"
      ],
      [
        "depth"
      ],
      [
        "deep"
      ],
      null,
      [
        "deeply"
      ]
    ]
  },
  {
    "id": 276,
    "forms": [
      null,
      [
        "difficulty"
      ],
      [
        "difficult"
      ],
      null,
      null
    ]
  },
  {
    "id": 277,
    "forms": [
      [
        "ease"
      ],
      [
        "ease"
      ],
      [
        "easy"
      ],
      [
        "uneasy"
      ],
      [
        "easily",
        "uneasily"
      ]
    ]
  },
  {
    "id": 278,
    "forms": [
      [
        "enthuse"
      ],
      [
        "enthusiasm",
        "enthusiast"
      ],
      [
        "enthusiastic"
      ],
      [
        "unenthusiastic"
      ],
      [
        "enthusiastically",
        "unenthusiastically"
      ]
    ]
  },
  {
    "id": 279,
    "forms": [
      [
        "equal",
        "equalise",
        "equalize"
      ],
      [
        "equality",
        "inequality",
        "equalisation",
        "equalization"
      ],
      [
        "equal"
      ],
      [
        "unequal"
      ],
      [
        "equally",
        "unequally"
      ]
    ]
  },
  {
    "id": 280,
    "forms": [
      [
        "befriend"
      ],
      [
        "friend",
        "friendship"
      ],
      [
        "friendly"
      ],
      [
        "unfriendly"
      ],
      null
    ]
  },
  {
    "id": 281,
    "forms": [
      null,
      [
        "gladness"
      ],
      [
        "glad"
      ],
      null,
      [
        "gladly"
      ]
    ]
  },
  {
    "id": 282,
    "forms": [
      null,
      [
        "happiness"
      ],
      [
        "happy"
      ],
      [
        "unhappy"
      ],
      [
        "happily",
        "unhappily"
      ]
    ]
  },
  {
    "id": 283,
    "forms": [
      [
        "heighten"
      ],
      [
        "height"
      ],
      [
        "high"
      ],
      null,
      [
        "highly",
        "high"
      ]
    ]
  },
  {
    "id": 284,
    "forms": [
      null,
      [
        "honesty"
      ],
      [
        "honest"
      ],
      [
        "dishonest"
      ],
      [
        "honestly",
        "dishonestly"
      ]
    ]
  },
  {
    "id": 285,
    "forms": [
      [
        "hunger"
      ],
      [
        "hunger"
      ],
      [
        "hungry"
      ],
      null,
      [
        "hungrily"
      ]
    ]
  },
  {
    "id": 286,
    "forms": [
      [
        "legalise",
        "legalize"
      ],
      [
        "legality",
        "legalisation",
        "legalization"
      ],
      [
        "legal"
      ],
      [
        "illegal"
      ],
      [
        "legally",
        "illegally"
      ]
    ]
  },
  {
    "id": 287,
    "forms": [
      null,
      [
        "luck"
      ],
      [
        "lucky"
      ],
      [
        "unlucky"
      ],
      [
        "luckily",
        "unluckily"
      ]
    ]
  },
  {
    "id": 288,
    "forms": [
      [
        "mature"
      ],
      [
        "maturity"
      ],
      [
        "mature"
      ],
      [
        "immature"
      ],
      [
        "maturely",
        "immaturely"
      ]
    ]
  },
  {
    "id": 289,
    "forms": [
      null,
      [
        "nature"
      ],
      [
        "natural"
      ],
      [
        "unnatural"
      ],
      [
        "naturally",
        "unnaturally"
      ]
    ]
  },
  {
    "id": 290,
    "forms": [
      null,
      [
        "noise"
      ],
      [
        "noisy"
      ],
      [
        "noiseless"
      ],
      [
        "noisily",
        "noiselessly"
      ]
    ]
  },
  {
    "id": 291,
    "forms": [
      null,
      [
        "patience"
      ],
      [
        "patient"
      ],
      [
        "impatient"
      ],
      [
        "patiently",
        "impatiently"
      ]
    ]
  },
  {
    "id": 292,
    "forms": [
      [
        "perfect"
      ],
      [
        "perfection"
      ],
      [
        "perfect"
      ],
      [
        "imperfect"
      ],
      [
        "perfectly",
        "imperfectly"
      ]
    ]
  },
  {
    "id": 293,
    "forms": [
      null,
      [
        "politeness"
      ],
      [
        "polite"
      ],
      [
        "impolite"
      ],
      [
        "politely",
        "impolitely"
      ]
    ]
  },
  {
    "id": 294,
    "forms": [
      [
        "quiet",
        "quieten"
      ],
      [
        "quiet",
        "quietness"
      ],
      [
        "quiet"
      ],
      null,
      [
        "quietly"
      ]
    ]
  },
  {
    "id": 295,
    "forms": [
      [
        "reason"
      ],
      [
        "reason",
        "reasoning"
      ],
      [
        "reasonable"
      ],
      [
        "unreasonable"
      ],
      [
        "reasonably",
        "unreasonably"
      ]
    ]
  },
  {
    "id": 296,
    "forms": [
      [
        "sadden"
      ],
      [
        "sadness"
      ],
      [
        "sad"
      ],
      null,
      [
        "sadly"
      ]
    ]
  },
  {
    "id": 297,
    "forms": [
      [
        "shorten"
      ],
      [
        "shortness"
      ],
      [
        "short"
      ],
      null,
      [
        "shortly"
      ]
    ]
  },
  {
    "id": 298,
    "forms": [
      [
        "soften"
      ],
      [
        "softness"
      ],
      [
        "soft"
      ],
      null,
      [
        "softly"
      ]
    ]
  },
  {
    "id": 299,
    "forms": [
      null,
      [
        "thirst"
      ],
      [
        "thirsty"
      ],
      null,
      [
        "thirstily"
      ]
    ]
  },
  {
    "id": 300,
    "forms": [
      [
        "warm"
      ],
      [
        "warmth"
      ],
      [
        "warm"
      ],
      null,
      [
        "warmly"
      ]
    ]
  },
  {
    "id": 301,
    "forms": [
      [
        "absorb"
      ],
      [
        "absorption"
      ],
      [
        "absorbent"
      ],
      [
        "absorbing"
      ],
      null
    ]
  },
  {
    "id": 302,
    "forms": [
      [
        "accelerate"
      ],
      [
        "acceleration",
        "accelerator"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 303,
    "forms": [
      [
        "accommodate"
      ],
      [
        "accommodation"
      ],
      [
        "accommodating"
      ],
      null,
      null
    ]
  },
  {
    "id": 304,
    "forms": [
      [
        "accompany"
      ],
      [
        "accompaniment"
      ],
      [
        "accompanying"
      ],
      [
        "unaccompanied"
      ],
      null
    ]
  },
  {
    "id": 305,
    "forms": [
      [
        "accomplish"
      ],
      [
        "accomplishment"
      ],
      [
        "accomplished"
      ],
      null,
      null
    ]
  },
  {
    "id": 306,
    "forms": [
      [
        "accumulate"
      ],
      [
        "accumulation"
      ],
      [
        "cumulative"
      ],
      null,
      [
        "cumulatively"
      ]
    ]
  },
  {
    "id": 307,
    "forms": [
      [
        "accuse"
      ],
      [
        "accusation",
        "accuser"
      ],
      [
        "accusatory"
      ],
      null,
      null
    ]
  },
  {
    "id": 308,
    "forms": [
      [
        "acquire"
      ],
      [
        "acquisition"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 309,
    "forms": [
      [
        "access"
      ],
      [
        "access",
        "accessibility"
      ],
      [
        "accessible"
      ],
      [
        "inaccessible"
      ],
      null
    ]
  },
  {
    "id": 310,
    "forms": [
      [
        "adjust"
      ],
      [
        "adjustment"
      ],
      [
        "adjustable"
      ],
      null,
      null
    ]
  },
  {
    "id": 311,
    "forms": [
      [
        "administer"
      ],
      [
        "administration",
        "administrator"
      ],
      [
        "administrative"
      ],
      null,
      [
        "administratively"
      ]
    ]
  },
  {
    "id": 312,
    "forms": [
      [
        "adopt"
      ],
      [
        "adoption"
      ],
      [
        "adoptive"
      ],
      [
        "adopted"
      ],
      null
    ]
  },
  {
    "id": 313,
    "forms": [
      [
        "advertise"
      ],
      [
        "advertisement",
        "advertising",
        "advertiser"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 314,
    "forms": [
      [
        "affirm"
      ],
      [
        "affirmation"
      ],
      [
        "affirmative"
      ],
      null,
      [
        "affirmatively"
      ]
    ]
  },
  {
    "id": 315,
    "forms": [
      [
        "age"
      ],
      [
        "age",
        "ageing",
        "aging"
      ],
      [
        "ageless"
      ],
      [
        "ageing",
        "aging"
      ],
      null
    ]
  },
  {
    "id": 316,
    "forms": [
      [
        "alarm"
      ],
      [
        "alarm"
      ],
      [
        "alarming"
      ],
      [
        "alarmed"
      ],
      [
        "alarmingly"
      ]
    ]
  },
  {
    "id": 317,
    "forms": [
      [
        "alienate"
      ],
      [
        "alienation"
      ],
      [
        "alienated"
      ],
      null,
      null
    ]
  },
  {
    "id": 318,
    "forms": [
      [
        "alter"
      ],
      [
        "alteration"
      ],
      [
        "unalterable"
      ],
      null,
      [
        "unalterably"
      ]
    ]
  },
  {
    "id": 319,
    "forms": [
      [
        "anticipate"
      ],
      [
        "anticipation"
      ],
      [
        "anticipated"
      ],
      [
        "unanticipated"
      ],
      null
    ]
  },
  {
    "id": 320,
    "forms": [
      [
        "assess"
      ],
      [
        "assessment",
        "assessor"
      ],
      [
        "assessable"
      ],
      null,
      null
    ]
  },
  {
    "id": 321,
    "forms": [
      [
        "assign"
      ],
      [
        "assignment"
      ],
      [
        "assigned"
      ],
      [
        "unassigned"
      ],
      null
    ]
  },
  {
    "id": 322,
    "forms": [
      [
        "assist"
      ],
      [
        "assistance",
        "assistant"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 323,
    "forms": [
      [
        "assume"
      ],
      [
        "assumption"
      ],
      [
        "assumed"
      ],
      null,
      null
    ]
  },
  {
    "id": 324,
    "forms": [
      [
        "assure"
      ],
      [
        "assurance"
      ],
      [
        "assured"
      ],
      [
        "self-assured"
      ],
      [
        "assuredly"
      ]
    ]
  },
  {
    "id": 325,
    "forms": [
      [
        "attach"
      ],
      [
        "attachment"
      ],
      [
        "attached"
      ],
      [
        "unattached"
      ],
      null
    ]
  },
  {
    "id": 326,
    "forms": [
      [
        "attain"
      ],
      [
        "attainment"
      ],
      [
        "attainable"
      ],
      [
        "unattainable"
      ],
      null
    ]
  },
  {
    "id": 327,
    "forms": [
      [
        "attend"
      ],
      [
        "attendance",
        "attendant"
      ],
      [
        "attentive"
      ],
      [
        "inattentive"
      ],
      [
        "attentively",
        "inattentively"
      ]
    ]
  },
  {
    "id": 328,
    "forms": [
      [
        "authorise",
        "authorize"
      ],
      [
        "authorisation",
        "authorization",
        "authority"
      ],
      [
        "authorised",
        "authorized"
      ],
      [
        "unauthorised",
        "unauthorized"
      ],
      null
    ]
  },
  {
    "id": 329,
    "forms": [
      [
        "automate"
      ],
      [
        "automation"
      ],
      [
        "automatic"
      ],
      [
        "automated"
      ],
      [
        "automatically"
      ]
    ]
  },
  {
    "id": 330,
    "forms": [
      [
        "balance"
      ],
      [
        "balance",
        "imbalance"
      ],
      [
        "balanced"
      ],
      [
        "unbalanced"
      ],
      null
    ]
  },
  {
    "id": 331,
    "forms": [
      [
        "bleed"
      ],
      [
        "blood",
        "bleeding"
      ],
      [
        "bloody"
      ],
      [
        "bloodless"
      ],
      null
    ]
  },
  {
    "id": 332,
    "forms": [
      [
        "boast"
      ],
      [
        "boast",
        "boastfulness"
      ],
      [
        "boastful"
      ],
      null,
      [
        "boastfully"
      ]
    ]
  },
  {
    "id": 333,
    "forms": [
      [
        "boil"
      ],
      [
        "boiling"
      ],
      [
        "boiling"
      ],
      null,
      null
    ]
  },
  {
    "id": 334,
    "forms": [
      [
        "broaden"
      ],
      [
        "breadth"
      ],
      [
        "broad"
      ],
      null,
      [
        "broadly"
      ]
    ]
  },
  {
    "id": 335,
    "forms": [
      [
        "build"
      ],
      [
        "building",
        "builder"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 336,
    "forms": [
      [
        "burn"
      ],
      [
        "burn",
        "burner"
      ],
      [
        "burning"
      ],
      [
        "burnt",
        "burned"
      ],
      null
    ]
  },
  {
    "id": 337,
    "forms": [
      [
        "bury"
      ],
      [
        "burial"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 338,
    "forms": [
      [
        "centralise",
        "centralize"
      ],
      [
        "centre",
        "center",
        "centralisation",
        "centralization"
      ],
      [
        "central"
      ],
      null,
      [
        "centrally"
      ]
    ]
  },
  {
    "id": 339,
    "forms": [
      [
        "charm"
      ],
      [
        "charm"
      ],
      [
        "charming"
      ],
      [
        "charmed"
      ],
      [
        "charmingly"
      ]
    ]
  },
  {
    "id": 340,
    "forms": [
      [
        "circulate"
      ],
      [
        "circulation"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 341,
    "forms": [
      [
        "coincide"
      ],
      [
        "coincidence"
      ],
      [
        "coincidental"
      ],
      null,
      [
        "coincidentally"
      ]
    ]
  },
  {
    "id": 342,
    "forms": [
      [
        "collaborate"
      ],
      [
        "collaboration",
        "collaborator"
      ],
      [
        "collaborative"
      ],
      null,
      [
        "collaboratively"
      ]
    ]
  },
  {
    "id": 343,
    "forms": [
      [
        "colonise",
        "colonize"
      ],
      [
        "colony",
        "colonisation",
        "colonization"
      ],
      [
        "colonial"
      ],
      null,
      null
    ]
  },
  {
    "id": 344,
    "forms": [
      [
        "commercialise",
        "commercialize"
      ],
      [
        "commerce",
        "commercialisation",
        "commercialization"
      ],
      [
        "commercial"
      ],
      [
        "noncommercial",
        "non-commercial"
      ],
      [
        "commercially"
      ]
    ]
  },
  {
    "id": 345,
    "forms": [
      [
        "commit"
      ],
      [
        "commitment"
      ],
      [
        "committed"
      ],
      [
        "uncommitted"
      ],
      null
    ]
  },
  {
    "id": 346,
    "forms": [
      [
        "compensate"
      ],
      [
        "compensation"
      ],
      [
        "compensatory"
      ],
      null,
      null
    ]
  },
  {
    "id": 347,
    "forms": [
      [
        "complicate"
      ],
      [
        "complication"
      ],
      [
        "complicated"
      ],
      [
        "uncomplicated"
      ],
      null
    ]
  },
  {
    "id": 348,
    "forms": [
      [
        "comply"
      ],
      [
        "compliance"
      ],
      [
        "compliant"
      ],
      [
        "noncompliant",
        "non-compliant"
      ],
      null
    ]
  },
  {
    "id": 349,
    "forms": [
      [
        "conceal"
      ],
      [
        "concealment"
      ],
      [
        "concealed"
      ],
      null,
      null
    ]
  },
  {
    "id": 350,
    "forms": [
      [
        "confirm"
      ],
      [
        "confirmation"
      ],
      [
        "confirmed"
      ],
      [
        "unconfirmed"
      ],
      null
    ]
  },
  {
    "id": 351,
    "forms": [
      [
        "conserve"
      ],
      [
        "conservation",
        "conservationist"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 352,
    "forms": [
      [
        "constitute"
      ],
      [
        "constitution"
      ],
      [
        "constitutional"
      ],
      [
        "unconstitutional"
      ],
      [
        "constitutionally",
        "unconstitutionally"
      ]
    ]
  },
  {
    "id": 353,
    "forms": [
      [
        "contaminate"
      ],
      [
        "contamination",
        "contaminant"
      ],
      [
        "contaminated"
      ],
      [
        "uncontaminated"
      ],
      null
    ]
  },
  {
    "id": 354,
    "forms": [
      [
        "contradict"
      ],
      [
        "contradiction"
      ],
      [
        "contradictory"
      ],
      null,
      null
    ]
  },
  {
    "id": 355,
    "forms": [
      [
        "convert"
      ],
      [
        "conversion",
        "convert"
      ],
      [
        "convertible"
      ],
      null,
      null
    ]
  },
  {
    "id": 356,
    "forms": [
      [
        "coordinate",
        "co-ordinate"
      ],
      [
        "coordination",
        "co-ordination",
        "coordinator",
        "co-ordinator"
      ],
      [
        "coordinated",
        "co-ordinated"
      ],
      [
        "uncoordinated",
        "unco-ordinated"
      ],
      null
    ]
  },
  {
    "id": 357,
    "forms": [
      [
        "corrupt"
      ],
      [
        "corruption"
      ],
      [
        "corrupt"
      ],
      [
        "incorruptible"
      ],
      [
        "corruptly"
      ]
    ]
  },
  {
    "id": 358,
    "forms": [
      [
        "cultivate"
      ],
      [
        "cultivation"
      ],
      [
        "cultivated"
      ],
      null,
      null
    ]
  },
  {
    "id": 359,
    "forms": [
      [
        "deceive"
      ],
      [
        "deception",
        "deceit"
      ],
      [
        "deceptive"
      ],
      [
        "deceitful"
      ],
      [
        "deceptively",
        "deceitfully"
      ]
    ]
  },
  {
    "id": 360,
    "forms": [
      [
        "declare"
      ],
      [
        "declaration"
      ],
      [
        "declarative"
      ],
      [
        "undeclared"
      ],
      null
    ]
  },
  {
    "id": 361,
    "forms": [
      [
        "dedicate"
      ],
      [
        "dedication"
      ],
      [
        "dedicated"
      ],
      null,
      null
    ]
  },
  {
    "id": 362,
    "forms": [
      [
        "demonstrate"
      ],
      [
        "demonstration",
        "demonstrator"
      ],
      [
        "demonstrable"
      ],
      [
        "demonstrative"
      ],
      [
        "demonstrably",
        "demonstratively"
      ]
    ]
  },
  {
    "id": 363,
    "forms": [
      [
        "deny"
      ],
      [
        "denial"
      ],
      [
        "deniable"
      ],
      [
        "undeniable"
      ],
      [
        "undeniably"
      ]
    ]
  },
  {
    "id": 364,
    "forms": [
      [
        "depress"
      ],
      [
        "depression"
      ],
      [
        "depressing"
      ],
      [
        "depressed"
      ],
      [
        "depressingly"
      ]
    ]
  },
  {
    "id": 365,
    "forms": [
      [
        "derive"
      ],
      [
        "derivation",
        "derivative"
      ],
      [
        "derivative"
      ],
      null,
      null
    ]
  },
  {
    "id": 366,
    "forms": [
      [
        "detect"
      ],
      [
        "detection",
        "detector"
      ],
      [
        "detectable"
      ],
      [
        "undetectable"
      ],
      null
    ]
  },
  {
    "id": 367,
    "forms": [
      [
        "deviate"
      ],
      [
        "deviation"
      ],
      [
        "deviant"
      ],
      null,
      null
    ]
  },
  {
    "id": 368,
    "forms": [
      [
        "devote"
      ],
      [
        "devotion"
      ],
      [
        "devoted"
      ],
      [
        "devotional"
      ],
      [
        "devotedly"
      ]
    ]
  },
  {
    "id": 369,
    "forms": [
      [
        "dictate"
      ],
      [
        "dictation",
        "dictator"
      ],
      [
        "dictatorial"
      ],
      null,
      [
        "dictatorially"
      ]
    ]
  },
  {
    "id": 370,
    "forms": [
      [
        "digest"
      ],
      [
        "digestion"
      ],
      [
        "digestible"
      ],
      [
        "indigestible"
      ],
      null
    ]
  },
  {
    "id": 371,
    "forms": [
      [
        "diminish"
      ],
      [
        "diminution"
      ],
      [
        "diminishing"
      ],
      [
        "undiminished"
      ],
      null
    ]
  },
  {
    "id": 372,
    "forms": [
      [
        "discriminate"
      ],
      [
        "discrimination"
      ],
      [
        "discriminatory"
      ],
      [
        "indiscriminate"
      ],
      [
        "indiscriminately"
      ]
    ]
  },
  {
    "id": 373,
    "forms": [
      [
        "disgust"
      ],
      [
        "disgust"
      ],
      [
        "disgusting"
      ],
      [
        "disgusted"
      ],
      [
        "disgustingly"
      ]
    ]
  },
  {
    "id": 374,
    "forms": [
      [
        "disrupt"
      ],
      [
        "disruption"
      ],
      [
        "disruptive"
      ],
      null,
      [
        "disruptively"
      ]
    ]
  },
  {
    "id": 375,
    "forms": [
      [
        "dissolve"
      ],
      [
        "dissolution"
      ],
      [
        "dissolvable"
      ],
      null,
      null
    ]
  },
  {
    "id": 376,
    "forms": [
      [
        "distinguish"
      ],
      [
        "distinction"
      ],
      [
        "distinctive"
      ],
      [
        "distinguishable"
      ],
      [
        "distinctively"
      ]
    ]
  },
  {
    "id": 377,
    "forms": [
      [
        "distribute"
      ],
      [
        "distribution",
        "distributor"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 378,
    "forms": [
      [
        "disturb"
      ],
      [
        "disturbance"
      ],
      [
        "disturbing"
      ],
      [
        "disturbed"
      ],
      [
        "disturbingly"
      ]
    ]
  },
  {
    "id": 379,
    "forms": [
      [
        "dominate"
      ],
      [
        "domination",
        "dominance"
      ],
      [
        "dominant"
      ],
      null,
      null
    ]
  },
  {
    "id": 380,
    "forms": [
      [
        "donate"
      ],
      [
        "donation",
        "donor"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 381,
    "forms": [
      [
        "draw"
      ],
      [
        "drawing"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 382,
    "forms": [
      [
        "dream"
      ],
      [
        "dream",
        "dreamer"
      ],
      [
        "dreamy"
      ],
      [
        "dreamless"
      ],
      [
        "dreamily"
      ]
    ]
  },
  {
    "id": 383,
    "forms": [
      [
        "economise",
        "economize"
      ],
      [
        "economy",
        "economics",
        "economist"
      ],
      [
        "economic"
      ],
      [
        "economical"
      ],
      [
        "economically"
      ]
    ]
  },
  {
    "id": 384,
    "forms": [
      [
        "elaborate"
      ],
      [
        "elaboration"
      ],
      [
        "elaborate"
      ],
      null,
      [
        "elaborately"
      ]
    ]
  },
  {
    "id": 385,
    "forms": [
      [
        "elect"
      ],
      [
        "election",
        "elector"
      ],
      [
        "electoral"
      ],
      [
        "elective"
      ],
      null
    ]
  },
  {
    "id": 386,
    "forms": [
      [
        "electrify"
      ],
      [
        "electricity",
        "electrification"
      ],
      [
        "electric"
      ],
      [
        "electrical"
      ],
      [
        "electrically"
      ]
    ]
  },
  {
    "id": 387,
    "forms": [
      [
        "eliminate"
      ],
      [
        "elimination"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 388,
    "forms": [
      [
        "emerge"
      ],
      [
        "emergence"
      ],
      [
        "emergent"
      ],
      [
        "emerging"
      ],
      null
    ]
  },
  {
    "id": 389,
    "forms": [
      [
        "emphasise",
        "emphasize"
      ],
      [
        "emphasis"
      ],
      [
        "emphatic"
      ],
      null,
      [
        "emphatically"
      ]
    ]
  },
  {
    "id": 390,
    "forms": [
      [
        "endure"
      ],
      [
        "endurance"
      ],
      [
        "endurable"
      ],
      [
        "unendurable"
      ],
      null
    ]
  },
  {
    "id": 391,
    "forms": [
      [
        "enforce"
      ],
      [
        "enforcement"
      ],
      [
        "enforceable"
      ],
      [
        "unenforceable"
      ],
      null
    ]
  },
  {
    "id": 392,
    "forms": [
      [
        "engage"
      ],
      [
        "engagement"
      ],
      [
        "engaging"
      ],
      [
        "engaged"
      ],
      [
        "engagingly"
      ]
    ]
  },
  {
    "id": 393,
    "forms": [
      [
        "enhance"
      ],
      [
        "enhancement"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 394,
    "forms": [
      [
        "enquire",
        "inquire"
      ],
      [
        "enquiry",
        "inquiry"
      ],
      [
        "enquiring",
        "inquiring"
      ],
      null,
      [
        "enquiringly",
        "inquiringly"
      ]
    ]
  },
  {
    "id": 395,
    "forms": [
      [
        "evacuate"
      ],
      [
        "evacuation",
        "evacuee"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 396,
    "forms": [
      [
        "evaluate"
      ],
      [
        "evaluation",
        "evaluator"
      ],
      [
        "evaluative"
      ],
      null,
      null
    ]
  },
  {
    "id": 397,
    "forms": [
      [
        "evaporate"
      ],
      [
        "evaporation"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 398,
    "forms": [
      [
        "exaggerate"
      ],
      [
        "exaggeration"
      ],
      [
        "exaggerated"
      ],
      null,
      null
    ]
  },
  {
    "id": 399,
    "forms": [
      [
        "exceed"
      ],
      [
        "excess"
      ],
      [
        "excessive"
      ],
      null,
      [
        "excessively"
      ]
    ]
  },
  {
    "id": 400,
    "forms": [
      [
        "exclude"
      ],
      [
        "exclusion"
      ],
      [
        "exclusive"
      ],
      null,
      [
        "exclusively"
      ]
    ]
  },
  {
    "id": 401,
    "forms": [
      [
        "exhaust"
      ],
      [
        "exhaustion"
      ],
      [
        "exhausting"
      ],
      [
        "exhausted"
      ],
      null
    ]
  },
  {
    "id": 402,
    "forms": [
      [
        "exhibit"
      ],
      [
        "exhibition",
        "exhibitor"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 403,
    "forms": [
      [
        "exploit"
      ],
      [
        "exploitation"
      ],
      [
        "exploitative"
      ],
      null,
      null
    ]
  },
  {
    "id": 404,
    "forms": [
      [
        "explode"
      ],
      [
        "explosion"
      ],
      [
        "explosive"
      ],
      null,
      [
        "explosively"
      ]
    ]
  },
  {
    "id": 405,
    "forms": [
      [
        "export"
      ],
      [
        "export",
        "exporter"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 406,
    "forms": [
      [
        "face"
      ],
      [
        "face"
      ],
      [
        "facial"
      ],
      [
        "faceless"
      ],
      null
    ]
  },
  {
    "id": 407,
    "forms": [
      [
        "familiarise",
        "familiarize"
      ],
      [
        "familiarity"
      ],
      [
        "familiar"
      ],
      [
        "unfamiliar"
      ],
      null
    ]
  },
  {
    "id": 408,
    "forms": [
      [
        "fear"
      ],
      [
        "fear"
      ],
      [
        "fearful"
      ],
      [
        "fearless"
      ],
      [
        "fearfully",
        "fearlessly"
      ]
    ]
  },
  {
    "id": 409,
    "forms": [
      [
        "fertilise",
        "fertilize"
      ],
      [
        "fertility",
        "fertilisation",
        "fertilization",
        "fertiliser",
        "fertilizer"
      ],
      [
        "fertile"
      ],
      [
        "infertile"
      ],
      null
    ]
  },
  {
    "id": 410,
    "forms": [
      [
        "flatter"
      ],
      [
        "flattery"
      ],
      [
        "flattering"
      ],
      [
        "unflattering"
      ],
      null
    ]
  },
  {
    "id": 411,
    "forms": [
      [
        "float"
      ],
      [
        "float",
        "flotation"
      ],
      [
        "floating"
      ],
      null,
      null
    ]
  },
  {
    "id": 412,
    "forms": [
      [
        "flow"
      ],
      [
        "flow"
      ],
      [
        "flowing"
      ],
      null,
      null
    ]
  },
  {
    "id": 413,
    "forms": [
      [
        "fold"
      ],
      [
        "fold",
        "folder"
      ],
      [
        "foldable"
      ],
      null,
      null
    ]
  },
  {
    "id": 414,
    "forms": [
      [
        "freeze"
      ],
      [
        "freezer",
        "freezing"
      ],
      [
        "freezing"
      ],
      [
        "frozen"
      ],
      null
    ]
  },
  {
    "id": 415,
    "forms": [
      [
        "generalise",
        "generalize"
      ],
      [
        "generalisation",
        "generalization"
      ],
      [
        "general"
      ],
      null,
      [
        "generally"
      ]
    ]
  },
  {
    "id": 416,
    "forms": [
      [
        "gratify"
      ],
      [
        "gratification"
      ],
      [
        "gratifying"
      ],
      [
        "gratified"
      ],
      null
    ]
  },
  {
    "id": 417,
    "forms": [
      [
        "guarantee"
      ],
      [
        "guarantee"
      ],
      [
        "guaranteed"
      ],
      null,
      null
    ]
  },
  {
    "id": 418,
    "forms": [
      [
        "guess"
      ],
      [
        "guess",
        "guesswork"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 419,
    "forms": [
      [
        "harden"
      ],
      [
        "hardness"
      ],
      [
        "hard"
      ],
      null,
      [
        "hard"
      ]
    ]
  },
  {
    "id": 420,
    "forms": [
      [
        "horrify"
      ],
      [
        "horror"
      ],
      [
        "horrific"
      ],
      [
        "horrified"
      ],
      [
        "horrifically"
      ]
    ]
  },
  {
    "id": 421,
    "forms": [
      [
        "humiliate"
      ],
      [
        "humiliation"
      ],
      [
        "humiliating"
      ],
      [
        "humiliated"
      ],
      null
    ]
  },
  {
    "id": 422,
    "forms": [
      [
        "imitate"
      ],
      [
        "imitation",
        "imitator"
      ],
      [
        "imitative"
      ],
      null,
      null
    ]
  },
  {
    "id": 423,
    "forms": [
      [
        "import"
      ],
      [
        "import",
        "importer"
      ],
      [
        "imported"
      ],
      null,
      null
    ]
  },
  {
    "id": 424,
    "forms": [
      [
        "impress"
      ],
      [
        "impression"
      ],
      [
        "impressive"
      ],
      [
        "unimpressive"
      ],
      [
        "impressively"
      ]
    ]
  },
  {
    "id": 425,
    "forms": [
      [
        "inhabit"
      ],
      [
        "inhabitant"
      ],
      [
        "inhabited"
      ],
      [
        "uninhabited"
      ],
      null
    ]
  },
  {
    "id": 426,
    "forms": [
      [
        "inhibit"
      ],
      [
        "inhibition"
      ],
      [
        "inhibited"
      ],
      [
        "uninhibited"
      ],
      null
    ]
  },
  {
    "id": 427,
    "forms": [
      [
        "integrate"
      ],
      [
        "integration"
      ],
      [
        "integrated"
      ],
      null,
      null
    ]
  },
  {
    "id": 428,
    "forms": [
      [
        "interfere"
      ],
      [
        "interference"
      ],
      [
        "interfering"
      ],
      null,
      null
    ]
  },
  {
    "id": 429,
    "forms": [
      [
        "interrupt"
      ],
      [
        "interruption"
      ],
      [
        "uninterrupted"
      ],
      null,
      null
    ]
  },
  {
    "id": 430,
    "forms": [
      [
        "invest"
      ],
      [
        "investment",
        "investor"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 431,
    "forms": [
      [
        "isolate"
      ],
      [
        "isolation"
      ],
      [
        "isolated"
      ],
      null,
      null
    ]
  },
  {
    "id": 432,
    "forms": [
      [
        "liberate"
      ],
      [
        "liberation",
        "liberator"
      ],
      [
        "liberating"
      ],
      [
        "liberated"
      ],
      null
    ]
  },
  {
    "id": 433,
    "forms": [
      [
        "locate"
      ],
      [
        "location"
      ],
      [
        "local"
      ],
      null,
      [
        "locally"
      ]
    ]
  },
  {
    "id": 434,
    "forms": [
      [
        "maintain"
      ],
      [
        "maintenance"
      ],
      [
        "maintainable"
      ],
      null,
      null
    ]
  },
  {
    "id": 435,
    "forms": [
      [
        "manipulate"
      ],
      [
        "manipulation"
      ],
      [
        "manipulative"
      ],
      null,
      [
        "manipulatively"
      ]
    ]
  },
  {
    "id": 436,
    "forms": [
      [
        "migrate"
      ],
      [
        "migration",
        "migrant"
      ],
      [
        "migratory"
      ],
      null,
      null
    ]
  },
  {
    "id": 437,
    "forms": [
      [
        "minimise",
        "minimize"
      ],
      [
        "minimum",
        "minimisation",
        "minimization"
      ],
      [
        "minimal"
      ],
      null,
      [
        "minimally"
      ]
    ]
  },
  {
    "id": 438,
    "forms": [
      [
        "multiply"
      ],
      [
        "multiplication",
        "multiple"
      ],
      [
        "multiple"
      ],
      null,
      null
    ]
  },
  {
    "id": 439,
    "forms": [
      [
        "negotiate"
      ],
      [
        "negotiation",
        "negotiator"
      ],
      [
        "negotiable"
      ],
      [
        "nonnegotiable",
        "non-negotiable"
      ],
      null
    ]
  },
  {
    "id": 440,
    "forms": [
      [
        "nourish"
      ],
      [
        "nourishment"
      ],
      [
        "nourishing"
      ],
      [
        "undernourished"
      ],
      null
    ]
  },
  {
    "id": 441,
    "forms": [
      [
        "obey"
      ],
      [
        "obedience",
        "disobedience"
      ],
      [
        "obedient"
      ],
      [
        "disobedient"
      ],
      [
        "obediently",
        "disobediently"
      ]
    ]
  },
  {
    "id": 442,
    "forms": [
      [
        "occupy"
      ],
      [
        "occupation",
        "occupant"
      ],
      [
        "occupied"
      ],
      [
        "unoccupied"
      ],
      null
    ]
  },
  {
    "id": 443,
    "forms": [
      [
        "perceive"
      ],
      [
        "perception"
      ],
      [
        "perceptive"
      ],
      [
        "perceptible"
      ],
      [
        "perceptively",
        "perceptibly"
      ]
    ]
  },
  {
    "id": 444,
    "forms": [
      [
        "persist"
      ],
      [
        "persistence"
      ],
      [
        "persistent"
      ],
      null,
      [
        "persistently"
      ]
    ]
  },
  {
    "id": 445,
    "forms": [
      [
        "possess"
      ],
      [
        "possession",
        "possessor"
      ],
      [
        "possessive"
      ],
      null,
      [
        "possessively"
      ]
    ]
  },
  {
    "id": 446,
    "forms": [
      [
        "preserve"
      ],
      [
        "preservation",
        "preservative"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 447,
    "forms": [
      [
        "prioritise",
        "prioritize"
      ],
      [
        "priority",
        "prioritisation",
        "prioritization"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 448,
    "forms": [
      [
        "prohibit"
      ],
      [
        "prohibition"
      ],
      [
        "prohibitive"
      ],
      [
        "prohibited"
      ],
      [
        "prohibitively"
      ]
    ]
  },
  {
    "id": 449,
    "forms": [
      [
        "promote"
      ],
      [
        "promotion",
        "promoter"
      ],
      [
        "promotional"
      ],
      null,
      null
    ]
  },
  {
    "id": 450,
    "forms": [
      [
        "prosper"
      ],
      [
        "prosperity"
      ],
      [
        "prosperous"
      ],
      null,
      null
    ]
  },
  {
    "id": 451,
    "forms": [
      [
        "regulate"
      ],
      [
        "regulation",
        "regulator"
      ],
      [
        "regulatory"
      ],
      [
        "unregulated"
      ],
      null
    ]
  },
  {
    "id": 452,
    "forms": [
      [
        "reinforce"
      ],
      [
        "reinforcement"
      ],
      [
        "reinforced"
      ],
      null,
      null
    ]
  },
  {
    "id": 453,
    "forms": [
      [
        "reside"
      ],
      [
        "residence",
        "resident"
      ],
      [
        "residential"
      ],
      [
        "resident"
      ],
      null
    ]
  },
  {
    "id": 454,
    "forms": [
      [
        "restrict"
      ],
      [
        "restriction"
      ],
      [
        "restrictive"
      ],
      [
        "unrestricted"
      ],
      null
    ]
  },
  {
    "id": 455,
    "forms": [
      [
        "retain"
      ],
      [
        "retention"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 456,
    "forms": [
      [
        "reveal"
      ],
      [
        "revelation"
      ],
      [
        "revealing"
      ],
      null,
      [
        "revealingly"
      ]
    ]
  },
  {
    "id": 457,
    "forms": [
      [
        "rotate"
      ],
      [
        "rotation"
      ],
      [
        "rotational"
      ],
      null,
      null
    ]
  },
  {
    "id": 458,
    "forms": [
      [
        "sacrifice"
      ],
      [
        "sacrifice"
      ],
      [
        "sacrificial"
      ],
      null,
      null
    ]
  },
  {
    "id": 459,
    "forms": [
      [
        "sharpen"
      ],
      [
        "sharpness"
      ],
      [
        "sharp"
      ],
      null,
      [
        "sharply"
      ]
    ]
  },
  {
    "id": 460,
    "forms": [
      [
        "signify"
      ],
      [
        "significance"
      ],
      [
        "significant"
      ],
      [
        "insignificant"
      ],
      [
        "significantly",
        "insignificantly"
      ]
    ]
  },
  {
    "id": 461,
    "forms": [
      [
        "simulate"
      ],
      [
        "simulation",
        "simulator"
      ],
      [
        "simulated"
      ],
      null,
      null
    ]
  },
  {
    "id": 462,
    "forms": [
      [
        "stabilise",
        "stabilize"
      ],
      [
        "stability",
        "instability"
      ],
      [
        "stable"
      ],
      [
        "unstable"
      ],
      null
    ]
  },
  {
    "id": 463,
    "forms": [
      [
        "stimulate"
      ],
      [
        "stimulation"
      ],
      [
        "stimulating"
      ],
      null,
      null
    ]
  },
  {
    "id": 464,
    "forms": [
      [
        "substitute"
      ],
      [
        "substitution",
        "substitute"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 465,
    "forms": [
      [
        "summarise",
        "summarize"
      ],
      [
        "summary",
        "summarisation",
        "summarization"
      ],
      null,
      null,
      null
    ]
  },
  {
    "id": 466,
    "forms": [
      [
        "supervise"
      ],
      [
        "supervision",
        "supervisor"
      ],
      [
        "supervisory"
      ],
      null,
      null
    ]
  },
  {
    "id": 467,
    "forms": [
      [
        "suspect"
      ],
      [
        "suspicion",
        "suspect"
      ],
      [
        "suspicious"
      ],
      [
        "unsuspecting"
      ],
      [
        "suspiciously"
      ]
    ]
  },
  {
    "id": 468,
    "forms": [
      [
        "sustain"
      ],
      [
        "sustainability"
      ],
      [
        "sustainable"
      ],
      [
        "unsustainable"
      ],
      [
        "sustainably"
      ]
    ]
  },
  {
    "id": 469,
    "forms": [
      [
        "symbolise",
        "symbolize"
      ],
      [
        "symbol",
        "symbolism"
      ],
      [
        "symbolic"
      ],
      null,
      [
        "symbolically"
      ]
    ]
  },
  {
    "id": 470,
    "forms": [
      [
        "sympathise",
        "sympathize"
      ],
      [
        "sympathy"
      ],
      [
        "sympathetic"
      ],
      [
        "unsympathetic"
      ],
      [
        "sympathetically"
      ]
    ]
  },
  {
    "id": 471,
    "forms": [
      [
        "terrify"
      ],
      [
        "terror"
      ],
      [
        "terrifying"
      ],
      [
        "terrified"
      ],
      null
    ]
  },
  {
    "id": 472,
    "forms": [
      [
        "tighten"
      ],
      [
        "tightness"
      ],
      [
        "tight"
      ],
      null,
      [
        "tightly"
      ]
    ]
  },
  {
    "id": 473,
    "forms": [
      [
        "translate"
      ],
      [
        "translation",
        "translator"
      ],
      [
        "translatable"
      ],
      [
        "untranslatable"
      ],
      null
    ]
  },
  {
    "id": 474,
    "forms": [
      [
        "transmit"
      ],
      [
        "transmission",
        "transmitter"
      ],
      [
        "transmissible"
      ],
      null,
      null
    ]
  },
  {
    "id": 475,
    "forms": [
      [
        "validate"
      ],
      [
        "validation",
        "validity"
      ],
      [
        "valid"
      ],
      [
        "invalid"
      ],
      [
        "validly"
      ]
    ]
  },
  {
    "id": 476,
    "forms": [
      [
        "value"
      ],
      [
        "value",
        "valuation"
      ],
      [
        "valuable"
      ],
      [
        "invaluable"
      ],
      null
    ]
  },
  {
    "id": 477,
    "forms": [
      [
        "verify"
      ],
      [
        "verification"
      ],
      [
        "verifiable"
      ],
      [
        "unverifiable"
      ],
      null
    ]
  },
  {
    "id": 478,
    "forms": [
      [
        "weary"
      ],
      [
        "weariness"
      ],
      [
        "weary"
      ],
      null,
      [
        "wearily"
      ]
    ]
  },
  {
    "id": 479,
    "forms": [
      null,
      [
        "accuracy",
        "inaccuracy"
      ],
      [
        "accurate"
      ],
      [
        "inaccurate"
      ],
      [
        "accurately",
        "inaccurately"
      ]
    ]
  },
  {
    "id": 480,
    "forms": [
      null,
      [
        "adequacy",
        "inadequacy"
      ],
      [
        "adequate"
      ],
      [
        "inadequate"
      ],
      [
        "adequately",
        "inadequately"
      ]
    ]
  },
  {
    "id": 481,
    "forms": [
      null,
      [
        "ambition"
      ],
      [
        "ambitious"
      ],
      [
        "unambitious"
      ],
      [
        "ambitiously"
      ]
    ]
  },
  {
    "id": 482,
    "forms": [
      null,
      [
        "convenience",
        "inconvenience"
      ],
      [
        "convenient"
      ],
      [
        "inconvenient"
      ],
      [
        "conveniently",
        "inconveniently"
      ]
    ]
  },
  {
    "id": 483,
    "forms": [
      null,
      [
        "courage"
      ],
      [
        "courageous"
      ],
      null,
      [
        "courageously"
      ]
    ]
  },
  {
    "id": 484,
    "forms": [
      null,
      [
        "curiosity"
      ],
      [
        "curious"
      ],
      [
        "incurious"
      ],
      [
        "curiously"
      ]
    ]
  },
  {
    "id": 485,
    "forms": [
      null,
      [
        "danger"
      ],
      [
        "dangerous"
      ],
      null,
      [
        "dangerously"
      ]
    ]
  },
  {
    "id": 486,
    "forms": [
      null,
      [
        "efficiency",
        "inefficiency"
      ],
      [
        "efficient"
      ],
      [
        "inefficient"
      ],
      [
        "efficiently",
        "inefficiently"
      ]
    ]
  },
  {
    "id": 487,
    "forms": [
      null,
      [
        "emotion"
      ],
      [
        "emotional"
      ],
      [
        "unemotional"
      ],
      [
        "emotionally",
        "unemotionally"
      ]
    ]
  },
  {
    "id": 488,
    "forms": [
      null,
      [
        "fame"
      ],
      [
        "famous"
      ],
      null,
      [
        "famously"
      ]
    ]
  },
  {
    "id": 489,
    "forms": [
      null,
      [
        "generosity"
      ],
      [
        "generous"
      ],
      null,
      [
        "generously"
      ]
    ]
  },
  {
    "id": 490,
    "forms": [
      null,
      [
        "intelligence"
      ],
      [
        "intelligent"
      ],
      [
        "unintelligent"
      ],
      [
        "intelligently"
      ]
    ]
  },
  {
    "id": 491,
    "forms": [
      null,
      [
        "loyalty",
        "disloyalty"
      ],
      [
        "loyal"
      ],
      [
        "disloyal"
      ],
      [
        "loyally",
        "disloyally"
      ]
    ]
  },
  {
    "id": 492,
    "forms": [
      null,
      [
        "necessity"
      ],
      [
        "necessary"
      ],
      [
        "unnecessary"
      ],
      [
        "necessarily",
        "unnecessarily"
      ]
    ]
  },
  {
    "id": 493,
    "forms": [
      null,
      [
        "opportunity"
      ],
      [
        "opportune"
      ],
      [
        "inopportune"
      ],
      null
    ]
  },
  {
    "id": 494,
    "forms": [
      null,
      [
        "optimism",
        "optimist"
      ],
      [
        "optimistic"
      ],
      null,
      [
        "optimistically"
      ]
    ]
  },
  {
    "id": 495,
    "forms": [
      null,
      [
        "pessimism",
        "pessimist"
      ],
      [
        "pessimistic"
      ],
      null,
      [
        "pessimistically"
      ]
    ]
  },
  {
    "id": 496,
    "forms": [
      null,
      [
        "poverty"
      ],
      [
        "poor"
      ],
      null,
      [
        "poorly"
      ]
    ]
  },
  {
    "id": 497,
    "forms": [
      null,
      [
        "responsibility",
        "irresponsibility"
      ],
      [
        "responsible"
      ],
      [
        "irresponsible"
      ],
      [
        "responsibly",
        "irresponsibly"
      ]
    ]
  },
  {
    "id": 498,
    "forms": [
      null,
      [
        "science",
        "scientist"
      ],
      [
        "scientific"
      ],
      [
        "unscientific"
      ],
      [
        "scientifically"
      ]
    ]
  },
  {
    "id": 499,
    "forms": [
      null,
      [
        "tradition"
      ],
      [
        "traditional"
      ],
      null,
      [
        "traditionally"
      ]
    ]
  },
  {
    "id": 500,
    "forms": [
      null,
      [
        "wisdom"
      ],
      [
        "wise"
      ],
      [
        "unwise"
      ],
      [
        "wisely",
        "unwisely"
      ]
    ]
  }
];

export function createWordFamiliesHandler({ supabase }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('Vary', 'Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const authorization = req.headers?.authorization;
    const token = typeof authorization === 'string' ? authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
    if (!token) return res.status(401).json({ error: 'Please sign in to access Word Families.' });

    try {
      // Same bearer-token verification used by the existing payment/account APIs.
      // User identity and tier come only from Supabase, never request parameters.
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user?.id) {
        return res.status(error?.status >= 500 ? 503 : 401).json({ error: 'Your account could not be verified. Please sign in again.' });
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier,is_admin')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) return res.status(503).json({ error: 'Access could not be checked. Please try again.' });
      const tier = profile?.is_admin === true ? 'admin' : profile?.tier;
      if (!hasFullAccessTier(tier)) {
        return res.status(403).json({ error: 'Word Families is included with ePeak+.' });
      }
      return res.status(200).json({ userId: data.user.id, families: WORD_FAMILIES });
    } catch {
      return res.status(503).json({ error: 'Access could not be checked. Please try again.' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createWordFamiliesHandler({
      supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    })
  : null;

export default async function handler(req, res) {
  if (!configuredHandler) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Word Families access is not configured. Please try again later.' });
  }
  return configuredHandler(req, res);
}
