/**
 * English Peak collocation catalogue.
 * Add one pipe-delimited row per item: first|second|CEFR|category.
 * IDs are stable as long as existing rows keep their order; append new rows.
 */
const ROWS = `make|a mistake|A1|Verb + Noun
make|a decision|A1|Verb + Noun
make|an effort|A1|Verb + Noun
make|a mess|A1|Verb + Noun
make|money|A1|Verb + Noun
do|your best|A1|Verb + Noun
do|a favor|A1|Verb + Noun
do|business|A1|Verb + Noun
do|the dishes|A1|Verb + Noun
do|research|A1|Verb + Noun
have|a look|A2|Verb + Noun
have|a chat|A2|Verb + Noun
have|a baby|A2|Verb + Noun
have|a problem|A2|Verb + Noun
have|a good time|A2|Verb + Noun
take|a break|A2|Verb + Noun
take|a chance|A2|Verb + Noun
take|a picture|A2|Verb + Noun
take|a seat|A2|Verb + Noun
take|notes|A2|Verb + Noun
get|ready|B1|Verb + Noun
get|married|B1|Verb + Noun
get|lost|B1|Verb + Noun
get|upset|B1|Verb + Noun
get|a job|B1|Verb + Noun
pay|attention|B1|Verb + Noun
pay|a visit|B1|Verb + Noun
pay|the bill|B1|Verb + Noun
pay|cash|B1|Verb + Noun
pay|a compliment|B1|Verb + Noun
keep|a secret|B2|Verb + Noun
keep|in touch|B2|Verb + Noun
keep|quiet|B2|Verb + Noun
keep|a promise|B2|Verb + Noun
keep|in mind|B2|Verb + Noun
catch|a cold|B2|Verb + Noun
catch|fire|B2|Verb + Noun
catch|sight of|B2|Verb + Noun
catch|someone's eye|B2|Verb + Noun
catch|a bus|B2|Verb + Noun
save|time|C1|Verb + Noun
save|money|C1|Verb + Noun
save|energy|C1|Verb + Noun
save|a seat|C1|Verb + Noun
save|a life|C1|Verb + Noun
break|a habit|C1|Verb + Noun
break|the rules|C1|Verb + Noun
break|a promise|C1|Verb + Noun
break|the ice|C1|Verb + Noun
break|the news|C1|Verb + Noun
heavy|rain|A1|Adjective + Noun
heavy|traffic|A1|Adjective + Noun
heavy|smoker|A1|Adjective + Noun
heavy|burden|A1|Adjective + Noun
heavy|schedule|A1|Adjective + Noun
strong|coffee|A1|Adjective + Noun
strong|accent|A1|Adjective + Noun
strong|language|A1|Adjective + Noun
strong|smell|A1|Adjective + Noun
strong|wind|A1|Adjective + Noun
deep|sleep|A2|Adjective + Noun
deep|breath|A2|Adjective + Noun
deep|thought|A2|Adjective + Noun
deep|trouble|A2|Adjective + Noun
deep|voice|A2|Adjective + Noun
high|standard|A2|Adjective + Noun
high|quality|A2|Adjective + Noun
high|price|A2|Adjective + Noun
high|energy|A2|Adjective + Noun
high|risk|A2|Adjective + Noun
fast|food|B1|Adjective + Noun
fast|pace|B1|Adjective + Noun
fast|track|B1|Adjective + Noun
fast|learner|B1|Adjective + Noun
fast|asleep|B1|Adjective + Noun
quick|glance|B1|Adjective + Noun
quick|meal|B1|Adjective + Noun
quick|decision|B1|Adjective + Noun
quick|shower|B1|Adjective + Noun
quick|fix|B1|Adjective + Noun
bad|temper|B2|Adjective + Noun
bad|habit|B2|Adjective + Noun
bad|breath|B2|Adjective + Noun
bad|luck|B2|Adjective + Noun
bad|mood|B2|Adjective + Noun
good|deal|B2|Adjective + Noun
good|time|B2|Adjective + Noun
good|luck|B2|Adjective + Noun
good|idea|B2|Adjective + Noun
good|company|B2|Adjective + Noun
big|deal|C1|Adjective + Noun
big|mistake|C1|Adjective + Noun
big|surprise|C1|Adjective + Noun
big|difference|C1|Adjective + Noun
big|mouth|C1|Adjective + Noun
great|deal|C1|Adjective + Noun
great|success|C1|Adjective + Noun
great|time|C1|Adjective + Noun
great|effort|C1|Adjective + Noun
great|importance|C1|Adjective + Noun
agree|with|A1|Verb + Preposition
apologize|for|A1|Verb + Preposition
apply|for|A1|Verb + Preposition
argue|about|A1|Verb + Preposition
ask|for|A1|Verb + Preposition
believe|in|A1|Verb + Preposition
belong|to|A1|Verb + Preposition
care|for|A1|Verb + Preposition
complain|about|A1|Verb + Preposition
concentrate|on|A1|Verb + Preposition
depend|on|A2|Verb + Preposition
dream|about|A2|Verb + Preposition
focus|on|A2|Verb + Preposition
happen|to|A2|Verb + Preposition
hear|about|A2|Verb + Preposition
insist|on|A2|Verb + Preposition
laugh|at|A2|Verb + Preposition
listen|to|A2|Verb + Preposition
look|at|A2|Verb + Preposition
look|for|A2|Verb + Preposition
pay|for|B1|Verb + Preposition
point|at|B1|Verb + Preposition
prepare|for|B1|Verb + Preposition
recover|from|B1|Verb + Preposition
rely|on|B1|Verb + Preposition
smile|at|B1|Verb + Preposition
stare|at|B1|Verb + Preposition
suffer|from|B1|Verb + Preposition
talk|about|B1|Verb + Preposition
think|about|B1|Verb + Preposition
wait|for|B2|Verb + Preposition
worry|about|B2|Verb + Preposition
object|to|B2|Verb + Preposition
participate|in|B2|Verb + Preposition
succeed|in|B2|Verb + Preposition
apologize|to|B2|Verb + Preposition
blame|for|B2|Verb + Preposition
consist|of|B2|Verb + Preposition
excuse|for|B2|Verb + Preposition
forgive|for|B2|Verb + Preposition
hide|from|C1|Verb + Preposition
protect|from|C1|Verb + Preposition
rescue|from|C1|Verb + Preposition
save|from|C1|Verb + Preposition
smell|of|C1|Verb + Preposition
warn|about|C1|Verb + Preposition
care|about|C1|Verb + Preposition
result|in|C1|Verb + Preposition
vote|for|C1|Verb + Preposition
wish|for|C1|Verb + Preposition
fully|aware|A1|Adverb + Adjective / Verb
fully|understand|A1|Adverb + Adjective / Verb
fully|booked|A1|Adverb + Adjective / Verb
fully|equipped|A1|Adverb + Adjective / Verb
fully|recovered|A1|Adverb + Adjective / Verb
highly|recommended|A1|Adverb + Adjective / Verb
highly|educated|A1|Adverb + Adjective / Verb
highly|likely|A1|Adverb + Adjective / Verb
highly|successful|A1|Adverb + Adjective / Verb
highly|profitable|A1|Adverb + Adjective / Verb
bitterly|cold|A2|Adverb + Adjective / Verb
bitterly|disappointed|A2|Adverb + Adjective / Verb
bitterly|complain|A2|Adverb + Adjective / Verb
bitterly|opposed|A2|Adverb + Adjective / Verb
bitterly|regret|A2|Adverb + Adjective / Verb
deeply|concerned|A2|Adverb + Adjective / Verb
deeply|offended|A2|Adverb + Adjective / Verb
deeply|rooted|A2|Adverb + Adjective / Verb
deeply|moved|A2|Adverb + Adjective / Verb
deeply|regret|A2|Adverb + Adjective / Verb
strongly|agree|B1|Adverb + Adjective / Verb
strongly|condemn|B1|Adverb + Adjective / Verb
strongly|recommend|B1|Adverb + Adjective / Verb
strongly|suggest|B1|Adverb + Adjective / Verb
strongly|dislike|B1|Adverb + Adjective / Verb
widely|accepted|B1|Adverb + Adjective / Verb
widely|available|B1|Adverb + Adjective / Verb
widely|known|B1|Adverb + Adjective / Verb
widely|read|B1|Adverb + Adjective / Verb
widely|used|B1|Adverb + Adjective / Verb
dead|tired|B2|Adverb + Adjective / Verb
dead|right|B2|Adverb + Adjective / Verb
dead|certain|B2|Adverb + Adjective / Verb
dead|wrong|B2|Adverb + Adjective / Verb
dead|silence|B2|Adverb + Adjective / Verb
absolutely|certain|B2|Adverb + Adjective / Verb
absolutely|clear|B2|Adverb + Adjective / Verb
absolutely|necessary|B2|Adverb + Adjective / Verb
absolutely|wrong|B2|Adverb + Adjective / Verb
absolutely|fabulous|B2|Adverb + Adjective / Verb
painfully|slow|C1|Adverb + Adjective / Verb
painfully|aware|C1|Adverb + Adjective / Verb
painfully|shy|C1|Adverb + Adjective / Verb
painfully|obvious|C1|Adverb + Adjective / Verb
painfully|thin|C1|Adverb + Adjective / Verb
perfectly|normal|C1|Adverb + Adjective / Verb
perfectly|clear|C1|Adverb + Adjective / Verb
perfectly|safe|C1|Adverb + Adjective / Verb
perfectly|capable|C1|Adverb + Adjective / Verb
perfectly|honest|C1|Adverb + Adjective / Verb`;

export const COLLOCATION_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1']);

export const COLLOCATIONS = Object.freeze(ROWS.trim().split('\n').map((row, index) => {
  const [first, second, level, category] = row.split('|');
  return Object.freeze({ id: index + 1, first, second, full: `${first} ${second}`, level, category });
}));
