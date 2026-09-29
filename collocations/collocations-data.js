/**
 * English Peak collocation catalogue.
 * Add one pipe-delimited row per item: first|second|CEFR|category.
 * IDs are stable as long as existing rows keep their order; append new rows.
 * Medium-mode distractors are explicitly curated in DISTRACTOR_ROWS below and
 * must remain aligned with this catalogue.
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
perfectly|honest|C1|Adverb + Adjective / Verb
make|progress|A2|Verb + Noun
make|sense|A2|Verb + Noun
make|an appointment|A2|Verb + Noun
make|a difference|B1|Verb + Noun
make|a complaint|B1|Verb + Noun
take|responsibility|B1|Verb + Noun
take|advantage of|B2|Verb + Noun
take|action|B1|Verb + Noun
take|part|A2|Verb + Noun
take|control|B1|Verb + Noun
have|experience|A2|Verb + Noun
have|difficulty|B1|Verb + Noun
have|access|B1|Verb + Noun
have|confidence|B1|Verb + Noun
have|an impact|B2|Verb + Noun
give|advice|A2|Verb + Noun
give|permission|B1|Verb + Noun
give|someone a hand|A2|Verb + Noun
give|an example|A2|Verb + Noun
give|priority to|B2|Verb + Noun
get|permission|B1|Verb + Noun
get|involved|B1|Verb + Noun
get|attention|B1|Verb + Noun
get|the impression|B2|Verb + Noun
get|rid of|B1|Verb + Noun
keep|control|B1|Verb + Noun
keep|track of|B2|Verb + Noun
keep|an eye on|B1|Verb + Noun
keep|your distance|B1|Verb + Noun
keep|records|B2|Verb + Noun
reach|an agreement|B1|Verb + Noun
reach|a conclusion|B2|Verb + Noun
reach|a decision|B1|Verb + Noun
reach|a goal|B1|Verb + Noun
reach|a compromise|B2|Verb + Noun
raise|awareness|B2|Verb + Noun
raise|money|A2|Verb + Noun
raise|a question|B1|Verb + Noun
raise|concerns|B2|Verb + Noun
raise|standards|B2|Verb + Noun
close|friend|A1|Adjective + Noun
close|relationship|B1|Adjective + Noun
close|attention|B1|Adjective + Noun
serious|problem|A2|Adjective + Noun
serious|injury|B1|Adjective + Noun
serious|consequences|B2|Adjective + Noun
serious|concern|B2|Adjective + Noun
major|problem|B1|Adjective + Noun
major|change|B1|Adjective + Noun
major|role|B1|Adjective + Noun
major|challenge|B2|Adjective + Noun
key|factor|B2|Adjective + Noun
key|role|B1|Adjective + Noun
key|issue|B2|Adjective + Noun
key|difference|B2|Adjective + Noun
clear|message|A2|Adjective + Noun
clear|evidence|B2|Adjective + Noun
clear|understanding|B2|Adjective + Noun
clear|distinction|C1|Adjective + Noun
clear|advantage|B2|Adjective + Noun
growing|concern|B2|Adjective + Noun
growing|demand|B2|Adjective + Noun
growing|number|B1|Adjective + Noun
growing|awareness|B2|Adjective + Noun
growing|pressure|B2|Adjective + Noun
reasonable|price|B1|Adjective + Noun
reasonable|explanation|B2|Adjective + Noun
reasonable|chance|B1|Adjective + Noun
reasonable|assumption|C1|Adjective + Noun
reasonable|request|B2|Adjective + Noun
deal|with|B1|Verb + Preposition
cope|with|B2|Verb + Preposition
agree|on|B1|Verb + Preposition
agree|about|B1|Verb + Preposition
approve|of|B2|Verb + Preposition
benefit|from|B1|Verb + Preposition
contribute|to|B2|Verb + Preposition
refer|to|B2|Verb + Preposition
respond|to|B1|Verb + Preposition
react|to|B1|Verb + Preposition
lead|to|B2|Verb + Preposition
result|from|B2|Verb + Preposition
account|for|C1|Verb + Preposition
search|for|A2|Verb + Preposition
ask|about|A1|Verb + Preposition
think|of|A2|Verb + Preposition
learn|about|A1|Verb + Preposition
hear|from|A2|Verb + Preposition
complain|to|B1|Verb + Preposition
apologize|about|B1|Verb + Preposition
closely|related|B2|Adverb + Adjective / Verb
closely|connected|B2|Adverb + Adjective / Verb
closely|associated|C1|Adverb + Adjective / Verb
seriously|injured|B1|Adverb + Adjective / Verb
seriously|concerned|B2|Adverb + Adjective / Verb
seriously|consider|B2|Adverb + Adjective / Verb
greatly|appreciate|B2|Adverb + Adjective / Verb
greatly|improve|B1|Adverb + Adjective / Verb
clearly|understand|B1|Adverb + Adjective / Verb
clearly|demonstrate|C1|Adverb + Adjective / Verb`;

// Two prevalidated wrong completions for every catalogue row. These are kept as
// data (rather than borrowed from other collocations at runtime) so Medium mode
// never labels another natural English collocation as incorrect.
const DISTRACTOR_ROWS = `a homework|an attention
a homework|an attention
a homework|an attention
a homework|an attention
a homework|an attention
a mistake|a decision
a mistake|a decision
a mistake|a decision
a mistake|a decision
a mistake|a decision
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|an attention
a homework|an attention
a homework|an attention
a homework|an attention
a homework|an attention
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|a mistake
a homework|a mistake
a homework|a mistake
a homework|a mistake
a homework|a mistake
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
a homework|a decision
sunshine|a whisper
sunshine|a whisper
sunshine|a whisper
sunshine|a whisper
sunshine|a whisper
rain|sleep
rain|sleep
rain|sleep
rain|sleep
rain|sleep
traffic|sunshine
traffic|sunshine
traffic|sunshine
traffic|sunshine
traffic|sunshine
rain|sleep
rain|sleep
rain|sleep
rain|sleep
rain|sleep
rain|coffee
rain|coffee
rain|coffee
rain|coffee
rain|coffee
food|traffic
food|traffic
food|traffic
food|traffic
food|traffic
sunshine|luggage
sunshine|luggage
sunshine|luggage
sunshine|luggage
sunshine|luggage
thunder|luggage
thunder|luggage
thunder|luggage
thunder|luggage
thunder|luggage
rain|sleep
rain|sleep
rain|sleep
rain|sleep
rain|sleep
traffic|weather
traffic|weather
traffic|weather
traffic|weather
traffic|weather
for|to
on|with
to|at
for|over
on|with
on|at
with|for
on|by
for|of
at|in
of|with
of|for
at|into
with|for
of|at
at|for
to|with
at|for
on|with
by|with
at|under
to|towards
to|against
of|at
at|from
to|towards
to|towards
of|with
for|of
under|across
to|on
for|over
against|about
on|at
at|with
at|with
on|about
from|on
of|about
about|of
of|behind
against|of
of|out of
against|out of
at|for
of|against
on|by
to|at
on|about
about|after
sleepy|chilly
sleepy|chilly
sleepy|chilly
sleepy|chilly
sleepy|chilly
asleep|ready
asleep|ready
asleep|ready
asleep|ready
asleep|ready
warm|pleased
warm|pleased
warm|pleased
warm|pleased
warm|pleased
tiny|brief
tiny|brief
tiny|brief
tiny|brief
tiny|brief
sleep|arrive
sleep|arrive
sleep|arrive
sleep|arrive
sleep|arrive
asleep|ready
asleep|ready
asleep|ready
asleep|ready
asleep|ready
aware|asleep
aware|asleep
aware|asleep
aware|asleep
aware|asleep
mild|partial
mild|partial
mild|partial
mild|partial
mild|partial
quick|cheerful
quick|cheerful
quick|cheerful
quick|cheerful
quick|cheerful
tiny|partial
tiny|partial
tiny|partial
tiny|partial
tiny|partial
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|a research
a homework|a progress
a homework|a progress
a homework|a progress
a homework|a progress
a homework|a progress
an advice|a progress
an advice|a progress
an advice|a progress
an advice|a progress
an advice|a progress
a progress|a decision
a progress|a decision
a progress|a decision
a progress|a decision
a progress|a decision
an advice|a sense
an advice|a sense
an advice|a sense
an advice|a sense
an advice|a sense
a decision|an agreement
a decision|an agreement
a decision|an agreement
a decision|an agreement
a decision|an agreement
an appointment|a complaint
an appointment|a complaint
an appointment|a complaint
an appointment|a complaint
an appointment|a complaint
a decision|an appointment
a decision|an appointment
a decision|an appointment
a decision|an appointment
a decision|an appointment
solution|result
solution|result
solution|result
price|message
price|message
price|message
price|message
friend|evidence
friend|evidence
friend|evidence
friend|evidence
relationship|price
relationship|price
relationship|price
relationship|price
friend|pressure
friend|pressure
friend|pressure
friend|pressure
friend|pressure
price|explanation
price|explanation
price|explanation
price|explanation
price|explanation
injury|role
injury|role
injury|role
injury|role
injury|role
for|to
for|of
for|to
for|to
on|from
of|to
for|with
with|from
on|for
on|for
with|from
to|with
to|with
about|to
on|of
at|for
on|of
to|on
of|from
on|with
aware|improve
aware|improve
aware|improve
connected|appreciate
connected|appreciate
connected|appreciate
related|consider
related|consider
injured|associated
injured|associated`;

// Contexts are deliberately stored beside the catalogue rather than in the UI.
// Each entry aligns with the row at the same index and contains one answer blank.
const EXAMPLES = [
  'I wrote the wrong date, so I had to admit I had made _____.',
  'We have discussed both options; now we need to make _____.',
  'You will improve if you make _____ to practise every day.',
  'The children spilled paint everywhere and made _____.',
  'She sells handmade jewellery online to make _____.',
  'Even if the task is difficult, just do _____.',
  'Could you do _____ and open the window?',
  'The two companies meet here to do _____.',
  'After dinner, I usually do _____.',
  'Scientists must do _____ before drawing a conclusion.',
  'Could I have _____ at the menu, please?',
  'We sat down to have _____ about our weekend.',
  'They are excited because they are going to have _____.',
  'Call me if you have _____ with the new software.',
  'Everyone danced and had _____ at the party.',
  'You have worked for hours; you should take _____.',
  'I decided to take _____ and apply for the role.',
  'Please take _____ of us in front of the museum.',
  'The receptionist asked me to take _____ while I waited.',
  'Students should take _____ during the lecture.',
  'We need to leave soon, so please get _____.',
  'They are engaged and plan to get _____ next spring.',
  'Use the map so that we do not get _____.',
  'He gets _____ when people interrupt him repeatedly.',
  'After three interviews, she finally managed to get _____.',
  'Please pay _____ while I explain the safety rules.',
  'We should pay _____ to Grandma this weekend.',
  'The waiter brought the check, and I offered to pay _____.',
  'This shop does not accept cards, so I had to pay _____.',
  'He paid her _____ on her excellent presentation.',
  'I trust you to keep _____ and tell nobody.',
  'We moved apart, but we still keep _____ by phone.',
  'The baby is asleep, so please keep _____.',
  'If you say you will help, you should keep _____.',
  'When choosing a flat, keep _____ that rent may rise.',
  'Wear a coat outside or you might catch _____.',
  'The dry grass caught _____ from a single spark.',
  'From the train, we caught _____ the sea for a moment.',
  'I waved across the room to catch _____.',
  'We need to leave now if we want to catch _____.',
  'Taking the motorway can save _____ on this journey.',
  'Cooking at home is a good way to save _____.',
  'Turn off unused lights to save _____.',
  'Could you save _____ for me near the front?',
  'The surgeon acted quickly and managed to save _____.',
  'Replacing dessert with fruit helped her break _____.',
  'Players who break _____ may be removed from the game.',
  'He said he would come, but he broke _____ again.',
  'A friendly question can help break _____ at a first meeting.',
  'She had to break _____ that their flight was cancelled.',
  'The match was cancelled because of heavy _____ overnight.',
  'We left early to avoid heavy _____ on the motorway.',
  'He smokes two packs a day and is a heavy _____.',
  'Caring for the whole family became a heavy _____ for her alone.',
  'With six meetings today, I have a heavy _____.',
  'I need strong _____ to wake me up in the morning.',
  'Even after years abroad, she still speaks with a strong _____.',
  'The film contains strong _____ that may not be suitable for children.',
  'We opened the fridge and noticed a strong _____ inside.',
  'The trees bent in the strong _____ during the storm.',
  'After the long flight, he fell into a deep _____.',
  'Take a deep _____ before you go underwater.',
  'She sat in deep _____, considering the difficult question.',
  'He is in deep _____ after borrowing more than he can repay.',
  'The singer is famous for his unusually deep _____ on the radio.',
  'Our work must meet a high _____ of accuracy.',
  'These shoes last for years because they are high _____.',
  'Few people bought the coat because of its high _____.',
  'The children ran around all day with high _____.',
  'Investing all your savings in one company is high _____.',
  'We stopped for fast _____ on the way home.',
  'Life in the capital moves at a fast _____.',
  'The training programme puts talented staff on the fast _____.',
  'She understood the new grammar immediately; she is a fast _____.',
  'The house was silent because everyone was fast _____.',
  'He took a quick _____ at his watch before leaving.',
  'I only have twenty minutes, so let us have a quick _____.',
  'With no time to discuss it, the manager made a quick _____.',
  'I took a quick _____ before rushing back to work.',
  'Tape is only a quick _____; the pipe needs replacing.',
  'He loses his bad _____ over very small problems.',
  'Checking my phone in bed has become a bad _____.',
  'Brush your teeth regularly to prevent bad _____.',
  'Missing the last train was just bad _____.',
  'She was in a bad _____ after the argument.',
  'Half price for a new laptop is a good _____.',
  'We laughed all evening and had a good _____.',
  'I wished her good _____ before her driving test.',
  'Taking an umbrella sounds like a good _____.',
  'On a long trip, friendly people are good _____.',
  'Losing one game is not a big _____ in the long term.',
  'Ignoring the warning signs was a big _____.',
  'The party was a big _____ because I expected a quiet dinner.',
  'A few minutes of daily practice can make a big _____.',
  'Do not tell him private things; he has a big _____.',
  'The repair took a great _____ longer than expected.',
  'The new product became a great _____ around the world.',
  'We had a great _____ exploring the city together.',
  'Finishing the marathon required great _____.',
  'Clean water is of great _____ to public health.',
  'I agree _____ your opinion on this issue.',
  'You should apologize _____ arriving so late.',
  'She plans to apply _____ a teaching position.',
  'They always argue _____ who should wash the dishes.',
  'If you need help, ask _____ it politely.',
  'Many children believe _____ magic.',
  'This blue jacket belongs _____ my sister.',
  'Nurses care _____ patients in the hospital.',
  'Guests complained _____ the noise from the street.',
  'Please turn off your phone so you can concentrate _____.',
  'Whether we go hiking will depend _____ the weather.',
  'I often dream _____ travelling around the world.',
  'Let us focus _____ the most urgent task first.',
  'What happened _____ your bicycle?',
  'Did you hear _____ the new café near the station?',
  'She insisted _____ paying for dinner herself.',
  'It is unkind to laugh _____ someone who makes a mistake.',
  'I listen _____ a podcast on my way to work.',
  'Look _____ the board and read the first sentence.',
  'We are looking _____ the keys you lost.',
  'Who is going to pay _____ the broken window?',
  'The guide pointed _____ the mountain in the distance.',
  'The team is training hard to prepare _____ the final.',
  'It took months to recover _____ the operation.',
  'You can rely _____ Mia; she always keeps her promises.',
  'The baby smiled _____ me from her chair.',
  'It is rude to stare _____ strangers on the train.',
  'He suffers _____ severe headaches in hot weather.',
  'We need to talk _____ what happened yesterday.',
  'Think _____ the consequences before you decide.',
  'We had to wait _____ the next bus in the rain.',
  'Try not to worry _____ things you cannot control.',
  'Several residents objected _____ the building plan.',
  'Everyone can participate _____ the discussion.',
  'With practice, you can succeed _____ learning a language.',
  'He apologized _____ the neighbour he had upset.',
  'Do not blame me _____ a decision you made.',
  'The course consists _____ six short modules.',
  'There is no excuse _____ treating people that way.',
  'Can you forgive me _____ forgetting your birthday?',
  'The child tried to hide _____ his parents behind the curtain.',
  'Sunscreen helps protect your skin _____ the sun.',
  'Firefighters rescued the family _____ the burning building.',
  'This vaccine can save children _____ a dangerous disease.',
  'The kitchen began to smell _____ freshly baked bread.',
  'Doctors warn people _____ the risks of smoking.',
  'Good leaders care _____ the wellbeing of their staff.',
  'A small error can result _____ a serious delay.',
  'Many young people voted _____ the first time.',
  'As a child, she used to wish _____ a pony.',
  'I am fully _____ of the risks involved.',
  'After your explanation, I fully _____ the problem.',
  'There are no rooms tonight; the hotel is fully _____.',
  'The ambulance is fully _____ for emergencies.',
  'After two weeks of rest, she has fully _____.',
  'This restaurant comes highly _____ by local residents.',
  'Both surgeons are highly _____ and experienced.',
  'With those dark clouds, rain is highly _____.',
  'The campaign was highly _____ and exceeded its target.',
  'Despite rising costs, the business remains highly _____.',
  'Without a coat, we were bitterly _____ outside.',
  'I was bitterly _____ when my application was rejected.',
  'Residents bitterly _____ about the late-night noise.',
  'Local people are bitterly _____ to the proposed airport.',
  'I bitterly _____ not accepting the offer sooner.',
  'Doctors are deeply _____ about the patient’s condition.',
  'She was deeply _____ by his insulting remark.',
  'The custom is deeply _____ in the region’s history.',
  'The audience was deeply _____ by the final scene.',
  'We deeply _____ any inconvenience this closure causes.',
  'I strongly _____ with your main conclusion.',
  'The organization will strongly _____ any attack on civilians.',
  'I strongly _____ this book to anyone learning English.',
  'The evidence strongly _____ that the policy is working.',
  'She strongly _____ having to wait in long queues.',
  'The approach is now widely _____ by researchers.',
  'Tickets are widely _____ online and at the venue.',
  'The town is widely _____ for its beautiful gardens.',
  'Her novels are widely _____ in schools across the country.',
  'This software is widely _____ in small businesses.',
  'After working all night, I was dead _____.',
  'Your calculation is exactly correct; you are dead _____.',
  'I checked twice and am dead _____ that the door is locked.',
  'The claim has no evidence; it is dead _____.',
  'When the power failed, the room fell into dead _____.',
  'I am absolutely _____ that I left my keys on the desk.',
  'The instructions make it absolutely _____ what to do next.',
  'A passport is absolutely _____ for international travel.',
  'It is absolutely _____ to assume everyone has internet access.',
  'The view from our balcony was absolutely _____.',
  'Traffic through the roadworks was painfully _____ this morning.',
  'I am painfully _____ of how much this decision will cost.',
  'He avoids parties because he is painfully _____.',
  'From the empty shelves, the shortage was painfully _____.',
  'After months of illness, he looked painfully _____.',
  'Feeling nervous before an exam is perfectly _____.',
  'Let me be perfectly _____: the deadline cannot move.',
  'The path is perfectly _____ in daylight, but avoid it after dark.',
  'With her experience, she is perfectly _____ of leading the project.',
  'To be perfectly _____, I did not enjoy the film.',
  'She practices every day and is finally starting to make _____.',
  'Once the missing detail was explained, the confusing instructions began to make _____.',
  'I called the dentist to make _____ for Tuesday morning.',
  'Even a small donation can make _____ to a child’s future.',
  'The meal was cold, so the customer asked to make _____ to the manager.',
  'The manager admitted the error and agreed to take _____ for what happened.',
  'Students should take _____ the free language workshops.',
  'The council must take _____ now to prevent further flooding.',
  'More than fifty runners will take _____ in Sunday’s race.',
  'The pilot had to take _____ of the aircraft manually.',
  'Applicants should have _____ of working with young children.',
  'Some learners have _____ understanding very fast speech.',
  'Only authorized staff have _____ to these confidential files.',
  'After weeks of practice, she finally had _____ in her ability to present.',
  'The new railway could have _____ on local wildlife.',
  'A financial expert can give _____ about saving for retirement.',
  'A parent must give _____ before a child joins the trip.',
  'These boxes are heavy; could you give _____ carrying them?',
  'The teacher asked Maya to give _____ of renewable energy.',
  'During the shortage, hospitals will give _____ emergency patients.',
  'You must get _____ from the owner before entering the land.',
  'She decided to get _____ in the local environmental campaign.',
  'The bright warning sign was designed to get _____.',
  'From his relaxed smile, I got _____ that the interview had gone well.',
  'We need to get _____ these broken chairs before moving.',
  'Despite the panic around her, the captain managed to keep _____.',
  'Use this app to keep _____ your daily expenses.',
  'Could you keep _____ my bag while I buy a ticket?',
  'The sign warns visitors to keep _____ from the wild animals.',
  'Clinics must keep _____ of every patient’s treatment.',
  'After hours of negotiation, both sides finally reached _____.',
  'After reviewing all the evidence, the jury reached _____.',
  'The panel expects to reach _____ by Friday.',
  'Careful planning helped the team reach _____ of reducing waste by half.',
  'Neither side got everything it wanted, but they reached _____.',
  'The campaign aims to raise _____ about mental health at work.',
  'The school fair will raise _____ for new library books.',
  'The unexpected result may raise _____ about the accuracy of the test.',
  'The cracks in the bridge have raised _____ about public safety.',
  'The new training programme is intended to raise _____ across the industry.',
  'I have known Lena since childhood, and she is still a close _____.',
  'The twins have always shared a close _____.',
  'Please pay close _____ to the emergency instructions.',
  'Water leaking near electrical wires is a serious _____.',
  'Fortunately, everyone escaped the crash without serious _____.',
  'Ignoring the safety rules could have serious _____.',
  'The rapid loss of forest is a serious _____ for local communities.',
  'A shortage of trained staff remains a major _____.',
  'Moving production overseas would be a major _____ for the company.',
  'Public transport will play a major _____ in reducing traffic.',
  'Providing clean water to every village is a major _____.',
  'Regular practice is a key _____ in language learning.',
  'The goalkeeper played a key _____ in the team’s victory.',
  'The cost of housing is a key _____ in the election.',
  'Price is the key _____ between the two plans.',
  'The election result sent a clear _____ that voters wanted change.',
  'The fingerprints provided clear _____ linking him to the scene.',
  'Before signing, make sure you have a clear _____ of the terms.',
  'The law draws a clear _____ between personal and business expenses.',
  'Her fluency gave her a clear _____ over the other candidates.',
  'Air pollution is a growing _____ among city residents.',
  'Factories are expanding to meet growing _____ for electric cars.',
  'A growing _____ of commuters now cycle to work.',
  'There is growing _____ of the need to protect oceans.',
  'The minister faces growing _____ to resign.',
  'The hotel offers clean rooms at a reasonable _____.',
  'There must be a reasonable _____ for why the alarm sounded.',
  'With more training, she has a reasonable _____ of winning.',
  'Given the dark clouds, rain was a reasonable _____.',
  'Asking for one day’s notice seems like a reasonable _____.',
  'A trained mediator helped the neighbours deal _____ their dispute.',
  'He found it hard to cope _____ the stress of two jobs.',
  'Before booking, we need to agree _____ a date.',
  'The experts agree _____ the need for urgent reform.',
  'Her parents do not approve _____ her decision to leave college.',
  'Small businesses will benefit _____ the lower tax rate.',
  'Regular exercise can contribute _____ better mental health.',
  'In her speech, the minister referred _____ the latest report.',
  'The company failed to respond _____ my email.',
  'Some patients may react badly _____ this medicine.',
  'A lack of sleep can lead _____ poor concentration.',
  'The damage appears to result _____ years of neglect.',
  'Online sales now account _____ half of the company’s income.',
  'Rescue teams continued to search _____ the missing climber.',
  'At reception, ask _____ the guided tours.',
  'Can you think _____ a safer way to cross the river?',
  'The class visited the museum to learn _____ local history.',
  'I hope to hear _____ the employer after my interview.',
  'If the service is poor, complain _____ the duty manager.',
  'I called to apologize _____ the confusion over your booking.',
  'The two issues are closely _____, so we should discuss them together.',
  'Diet and long-term health are closely _____.',
  'The condition is closely _____ with prolonged exposure to dust.',
  'Two passengers were seriously _____ in the collision.',
  'Doctors are seriously _____ about the patient’s sudden decline.',
  'With rent rising, we must seriously _____ moving to a smaller office.',
  'We would greatly _____ your feedback on the proposal.',
  'Better lighting would greatly _____ safety on this road.',
  'Before starting, make sure you clearly _____ the instructions.',
  'The trial results clearly _____ the treatment’s effectiveness.'
];

export const COLLOCATION_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1']);

const DISTRACTORS = DISTRACTOR_ROWS.trim().split('\n').map(row => Object.freeze(row.split('|')));

// Common partners which are valid English but are not necessarily catalogue
// targets for the same first component. Catalogue siblings are added
// automatically below, so this table only records cross-group and out-of-list
// relationships discovered during the Easy/Medium ambiguity audit.
export const SUPPLEMENTAL_ACCEPTED_PARTNERS = Object.freeze({
  make: ['a promise', 'a good decision'],
  have: ['a break', 'a chance', 'a seat'],
  take: ['a look', 'a decision', 'a chance', 'a photo'],
  get: ['a chance', 'a compliment', 'experience'],
  pay: ['money'],
  quick: ['learner'],
  good: ['effort', 'decision', 'luck', 'time', 'company', 'idea', 'deal'],
  great: ['idea', 'company', 'luck'],
  big: ['decision', 'problem'],
  strong: ['decision'],
  close: ['connection'],
  serious: ['damage'],
  major: ['concern'],
  key: ['advantage'],
  clear: ['difference'],
  growing: ['problem'],
  reasonable: ['decision'],
  agree: ['with'],
  result: ['in'],
  apologize: ['for', 'to'],
  talk: ['to'],
  care: ['about', 'for'],
  smell: ['like'],
  look: ['into', 'after'],
  think: ['of'],
  deeply: ['aware', 'disappointed'],
  highly: ['aware'],
  absolutely: ['right', 'clear', 'certain', 'wrong'],
  perfectly: ['aware', 'right', 'wrong'],
  painfully: ['clear']
});

const CATALOGUE_PARTNERS = new Map();
ROWS.trim().split('\n').forEach(row => {
  const [first, second] = row.split('|');
  CATALOGUE_PARTNERS.set(first, [...(CATALOGUE_PARTNERS.get(first) ?? []), second]);
});

export const COLLOCATIONS = Object.freeze(ROWS.trim().split('\n').map((row, index) => {
  const [first, second, level, category] = row.split('|');
  return Object.freeze({
    id: index + 1,
    first,
    second,
    full: `${first} ${second}`,
    level,
    category,
    example: EXAMPLES[index],
    distractors: DISTRACTORS[index],
    acceptedAlternatives: Object.freeze([...new Set([
      ...(CATALOGUE_PARTNERS.get(first) ?? []),
      ...(SUPPLEMENTAL_ACCEPTED_PARTNERS[first] ?? [])
    ])].filter(partner => partner !== second))
  });
}));
