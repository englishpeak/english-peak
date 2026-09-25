/**
 * English Peak collocation catalogue.
 * Add one pipe-delimited row per item: first|second|CEFR|category.
 * IDs are stable as long as existing rows keep their order; append new rows.
 */
const ROWS = `make|a mistake|A1|Verb + Noun
do|homework|A1|Verb + Noun
take|a shower|A1|Verb + Noun
have|breakfast|A1|Verb + Noun
catch|a bus|A1|Verb + Noun
get|dressed|A1|Verb + Adjective
go|home|A1|Verb + Adverb
watch|television|A1|Verb + Noun
listen|to music|A1|Verb + Preposition
wait|for a friend|A1|Verb + Preposition
ask|a question|A1|Verb + Noun
give|an answer|A1|Verb + Noun
make|the bed|A1|Verb + Noun
take|a photo|A1|Verb + Noun
have|a good time|A1|Verb + Noun
go|shopping|A1|Verb + Noun
play|football|A1|Verb + Noun
read|a book|A1|Verb + Noun
drink|coffee|A1|Verb + Noun
wear|glasses|A1|Verb + Noun
heavy|rain|A1|Adjective + Noun
strong|coffee|A1|Adjective + Noun
fast|car|A1|Adjective + Noun
best|friend|A1|Adjective + Noun
big|problem|A1|Adjective + Noun
new|job|A1|Adjective + Noun
small|town|A1|Adjective + Noun
beautiful|day|A1|Adjective + Noun
good|idea|A1|Adjective + Noun
bad|weather|A1|Adjective + Noun
very|happy|A1|Adverb + Adjective / Verb
really|tired|A1|Adverb + Adjective / Verb
quite|easy|A1|Adverb + Adjective / Verb
speak|slowly|A1|Adverb + Adjective / Verb
work|hard|A1|Adverb + Adjective / Verb
look|at the picture|A1|Verb + Preposition
talk|to my teacher|A1|Verb + Preposition
live|with my family|A1|Verb + Preposition
come|from Mexico|A1|Verb + Preposition
pay|by card|A1|Verb + Preposition
make|a decision|A2|Verb + Noun
take|a break|A2|Verb + Noun
have|a conversation|A2|Verb + Noun
catch|a cold|A2|Verb + Noun
miss|a train|A2|Verb + Noun
save|money|A2|Verb + Noun
spend|time|A2|Verb + Noun
keep|a secret|A2|Verb + Noun
lose|weight|A2|Verb + Noun
tell|the truth|A2|Verb + Noun
make|friends|A2|Verb + Noun
take|notes|A2|Verb + Noun
have|a rest|A2|Verb + Noun
book|a table|A2|Verb + Noun
change|your mind|A2|Verb + Noun
strong|wind|A2|Adjective + Noun
heavy|traffic|A2|Adjective + Noun
close|friend|A2|Adjective + Noun
free|time|A2|Adjective + Noun
healthy|diet|A2|Adjective + Noun
high|price|A2|Adjective + Noun
low|cost|A2|Adjective + Noun
long|journey|A2|Adjective + Noun
quick|shower|A2|Adjective + Noun
fresh|air|A2|Adjective + Noun
completely|different|A2|Adverb + Adjective / Verb
really|enjoy|A2|Adverb + Adjective / Verb
speak|fluently|A2|Adverb + Adjective / Verb
drive|carefully|A2|Adverb + Adjective / Verb
work|together|A2|Adverb + Adjective / Verb
agree|with someone|A2|Verb + Preposition
apologize|for being late|A2|Verb + Preposition
belong|to me|A2|Verb + Preposition
depend|on the weather|A2|Verb + Preposition
look|for a job|A2|Verb + Preposition
prepare|for an exam|A2|Verb + Preposition
worry|about money|A2|Verb + Preposition
laugh|at a joke|A2|Verb + Preposition
arrive|at the station|A2|Verb + Preposition
pay|for dinner|A2|Verb + Preposition
make|an effort|B1|Verb + Noun
take|responsibility|B1|Verb + Noun
pay|attention|B1|Verb + Noun
keep|in touch|B1|Verb + Preposition
reach|an agreement|B1|Verb + Noun
solve|a problem|B1|Verb + Noun
meet|a deadline|B1|Verb + Noun
gain|experience|B1|Verb + Noun
raise|money|B1|Verb + Noun
do|research|B1|Verb + Noun
make|progress|B1|Verb + Noun
take|part|B1|Verb + Noun
have|an impact|B1|Verb + Noun
break|the law|B1|Verb + Noun
set|a goal|B1|Verb + Noun
heavy|workload|B1|Adjective + Noun
strong|opinion|B1|Adjective + Noun
wide|range|B1|Adjective + Noun
major|change|B1|Adjective + Noun
common|mistake|B1|Adjective + Noun
serious|injury|B1|Adjective + Noun
reasonable|price|B1|Adjective + Noun
valuable|experience|B1|Adjective + Noun
highly|successful|B1|Adverb + Adjective / Verb
deeply|worried|B1|Adverb + Adjective / Verb
fully|understand|B1|Adverb + Adjective / Verb
strongly|recommend|B1|Adverb + Adjective / Verb
closely|related|B1|Adverb + Adjective / Verb
deal|with a problem|B1|Verb + Preposition
focus|on the task|B1|Verb + Preposition
apply|for a job|B1|Verb + Preposition
suffer|from stress|B1|Verb + Preposition
participate|in a meeting|B1|Verb + Preposition
recover|from an illness|B1|Verb + Preposition
refer|to the report|B1|Verb + Preposition
concentrate|on your work|B1|Verb + Preposition
benefit|from experience|B1|Verb + Preposition
cope|with pressure|B1|Verb + Preposition
make|a difference|B1|Verb + Noun
take|advantage|B1|Verb + Noun
make|a commitment|B2|Verb + Noun
take|into account|B2|Verb + Preposition
draw|a conclusion|B2|Verb + Noun
pose|a threat|B2|Verb + Noun
raise|awareness|B2|Verb + Noun
meet|expectations|B2|Verb + Noun
exercise|caution|B2|Verb + Noun
bear|in mind|B2|Verb + Preposition
hold|a meeting|B2|Verb + Noun
launch|a campaign|B2|Verb + Noun
gain|access|B2|Verb + Noun
address|an issue|B2|Verb + Noun
conduct|an investigation|B2|Verb + Noun
reach|a compromise|B2|Verb + Noun
face|a challenge|B2|Verb + Noun
fierce|competition|B2|Adjective + Noun
mutual|respect|B2|Adjective + Noun
key|factor|B2|Adjective + Noun
pressing|issue|B2|Adjective + Noun
substantial|amount|B2|Adjective + Noun
compelling|evidence|B2|Adjective + Noun
reasonable|assumption|B2|Adjective + Noun
sustainable|growth|B2|Adjective + Noun
highly|unlikely|B2|Adverb + Adjective / Verb
widely|recognized|B2|Adverb + Adjective / Verb
closely|monitor|B2|Adverb + Adjective / Verb
strongly|oppose|B2|Adverb + Adjective / Verb
readily|available|B2|Adverb + Adjective / Verb
account|for the difference|B2|Verb + Preposition
comply|with regulations|B2|Verb + Preposition
contribute|to society|B2|Verb + Preposition
refrain|from commenting|B2|Verb + Preposition
resort|to violence|B2|Verb + Preposition
stem|from inequality|B2|Verb + Preposition
adhere|to the rules|B2|Verb + Preposition
engage|in debate|B2|Verb + Preposition
object|to the proposal|B2|Verb + Preposition
result|in failure|B2|Verb + Preposition
make|an exception|B2|Verb + Noun
strike|a balance|B2|Verb + Noun
mount|a challenge|C1|Verb + Noun
spark|controversy|C1|Verb + Noun
wield|influence|C1|Verb + Noun
shed|light|C1|Verb + Noun
set|a precedent|C1|Verb + Noun
pave|the way|C1|Verb + Noun
fuel|speculation|C1|Verb + Noun
curb|inflation|C1|Verb + Noun
voice|concern|C1|Verb + Noun
levy|a tax|C1|Verb + Noun
render|a verdict|C1|Verb + Noun
lodge|a complaint|C1|Verb + Noun
exert|pressure|C1|Verb + Noun
draw|a distinction|C1|Verb + Noun
scrutinize|the evidence|C1|Verb + Noun
heated|debate|C1|Adjective + Noun
stark|contrast|C1|Adjective + Noun
acute|shortage|C1|Adjective + Noun
unprecedented|growth|C1|Adjective + Noun
compelling|argument|C1|Adjective + Noun
inherent|risk|C1|Adjective + Noun
tangible|benefit|C1|Adjective + Noun
viable|alternative|C1|Adjective + Noun
utterly|unacceptable|C1|Adverb + Adjective / Verb
deeply|entrenched|C1|Adverb + Adjective / Verb
widely|acknowledged|C1|Adverb + Adjective / Verb
fundamentally|flawed|C1|Adverb + Adjective / Verb
categorically|deny|C1|Adverb + Adjective / Verb
abide|by a decision|C1|Verb + Preposition
allude|to a problem|C1|Verb + Preposition
detract|from the value|C1|Verb + Preposition
embark|on a project|C1|Verb + Preposition
grapple|with uncertainty|C1|Verb + Preposition
hinge|on the outcome|C1|Verb + Preposition
reconcile|with reality|C1|Verb + Preposition
subscribe|to the view|C1|Verb + Preposition
succumb|to pressure|C1|Verb + Preposition
veer|from the topic|C1|Verb + Preposition
cast|doubt|C1|Verb + Noun
prompt|a response|C1|Verb + Noun`;

export const COLLOCATION_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1']);

export const COLLOCATIONS = Object.freeze(ROWS.trim().split('\n').map((row, index) => {
  const [first, second, level, category] = row.split('|');
  return Object.freeze({ id: index + 1, first, second, full: `${first} ${second}`, level, category });
}));
