const QUESTIONS = [
  { type:'affirmative', sentence:'My sister ___ from home three days a week.', base:'work', third:'works', answer:'works', explanation:'My sister = she → use the third-person singular form: works.' },
  { type:'question', sentence:'Do your friends ___ nearby?', base:'live', third:'lives', answer:'live', explanation:'After do, use the base verb: live.' },
  { type:'negative', sentence:"Daniel doesn't ___ coffee after 6 p.m.", base:'drink', third:'drinks', answer:'drink', explanation:"After doesn't, use the base verb: drink." },
  { type:'affirmative', sentence:'Most people in my office ___ lunch around one.', base:'eat', third:'eats', answer:'eat', explanation:'Most people = they → use the base verb: eat.' },
  { type:'question', sentence:'Does your manager ___ everyone personally?', base:'know', third:'knows', answer:'know', explanation:'After does, use the base verb: know.' },
  { type:'negative', sentence:"My parents don't ___ much television.", base:'watch', third:'watches', answer:'watch', explanation:"After don't, use the base verb: watch." },
  { type:'affirmative', sentence:'Our accountant usually ___ the final numbers before the monthly meeting.', base:'check', third:'checks', answer:'checks', explanation:'Our accountant = she/he → use the third-person singular form: checks.' },
  { type:'question', sentence:'Does your company ___ employees to work remotely on Fridays?', base:'allow', third:'allows', answer:'allow', explanation:'After does, use the base verb: allow.' },
  { type:'negative', sentence:"The software doesn't ___ properly on older laptops.", base:'work', third:'works', answer:'work', explanation:"After doesn't, use the base verb: work." },
  { type:'affirmative', sentence:'I usually ___ the early train when I visit the regional office.', base:'take', third:'takes', answer:'take', explanation:'I → use the base verb: take.' },
  { type:'affirmative', sentence:'Laura ___ two languages with her clients every day.', base:'speak', third:'speaks', answer:'speaks', explanation:'Laura = she → use the third-person singular form: speaks.' },
  { type:'question', sentence:'Do those restaurants ___ vegetarian options?', base:'have', third:'has', answer:'have', explanation:'After do, use the base verb: have.' },
  { type:'negative', sentence:"Our marketing team doesn't ___ every idea immediately.", base:'approve', third:'approves', answer:'approve', explanation:"After doesn't, use the base verb: approve." },
  { type:'affirmative', sentence:'The evening course ___ at 6:30 and finishes at nine.', base:'start', third:'starts', answer:'starts', explanation:'The evening course = it → use the third-person singular form: starts.' },
  { type:'question', sentence:'Does Nancy’s brother ___ abroad for work very often?', base:'travel', third:'travels', answer:'travel', explanation:'After does, use the base verb: travel.' },
  { type:'negative', sentence:"We don't ___ personal calls during client meetings.", base:'take', third:'takes', answer:'take', explanation:"After don't, use the base verb: take." },
  { type:'affirmative', sentence:'She often ___ a second opinion before making a major decision.', base:'want', third:'wants', answer:'wants', explanation:'She → use the third-person singular form: wants.' },
  { type:'question', sentence:'Do you ___ the new booking system easy to use?', base:'find', third:'finds', answer:'find', explanation:'After do, use the base verb: find.' },
  { type:'negative', sentence:"Marcus doesn't ___ his work email at weekends.", base:'check', third:'checks', answer:'check', explanation:"After doesn't, use the base verb: check." },
  { type:'affirmative', sentence:'My neighbors ___ to the coast whenever they have a free weekend.', base:'go', third:'goes', answer:'go', explanation:'My neighbors = they → use the base verb: go.' },
  { type:'affirmative', sentence:'The new employee ___ every technical issue carefully.', base:'study', third:'studies', answer:'studies', explanation:'With he/she/it, study changes to studies.' },
  { type:'question', sentence:'Does she ___ here, or is she visiting from another branch?', base:'work', third:'works', answer:'work', explanation:'After does, use the base verb: work, not works.' },
  { type:'negative', sentence:"They don't ___ the same view on flexible working hours.", base:'share', third:'shares', answer:'share', explanation:"After don't, use the base verb: share." },
  { type:'affirmative', sentence:'This subscription ___ less than most competing services.', base:'cost', third:'costs', answer:'costs', explanation:'This subscription = it → use the third-person singular form: costs.' },
  { type:'question', sentence:'Do the new interns ___ much support during their first week?', base:'need', third:'needs', answer:'need', explanation:'After do, use the base verb: need.' },
  { type:'negative', sentence:"Priya doesn't ___ to impress people with job titles.", base:'try', third:'tries', answer:'try', explanation:"After doesn't, use the base verb: try, not tries." },
  { type:'affirmative', sentence:'He ___ all the equipment in a small case when he travels.', base:'carry', third:'carries', answer:'carries', explanation:'With he/she/it, carry changes to carries.' },
  { type:'question', sentence:'Does the film ___ before or after the evening news?', base:'finish', third:'finishes', answer:'finish', explanation:'After does, use the base verb: finish, not finishes.' },
  { type:'negative', sentence:"I don't ___ every notification as soon as it appears.", base:'open', third:'opens', answer:'open', explanation:"After don't, use the base verb: open." },
  { type:'affirmative', sentence:'You always ___ useful questions during our planning sessions.', base:'ask', third:'asks', answer:'ask', explanation:'You → use the base verb: ask.' },
  { type:'affirmative', sentence:'Maya ___ a short coding course at the local college.', base:'teach', third:'teaches', answer:'teaches', explanation:'With he/she/it, teach adds -es: teaches.' },
  { type:'question', sentence:'Do we ___ enough time to discuss the budget today?', base:'have', third:'has', answer:'have', explanation:'After do, use the base verb: have.' },
  { type:'negative', sentence:"The repair shop doesn't ___ devices without proof of purchase.", base:'fix', third:'fixes', answer:'fix', explanation:"After doesn't, use the base verb: fix, not fixes." },
  { type:'affirmative', sentence:'Our clients often ___ a video call to a long email exchange.', base:'prefer', third:'prefers', answer:'prefer', explanation:'Our clients = they → use the base verb: prefer.' },
  { type:'question', sentence:'Does Leo ___ his grandmother every Sunday?', base:'call', third:'calls', answer:'call', explanation:'After does, use the base verb: call.' },
  { type:'negative', sentence:"The last bus doesn't ___ the airport terminal after midnight.", base:'pass', third:'passes', answer:'pass', explanation:"After doesn't, use the base verb: pass, not passes." },
  { type:'affirmative', sentence:'It ___ as though the conference will sell out this year.', base:'seem', third:'seems', answer:'seems', explanation:'It → use the third-person singular form: seems.' },
  { type:'question', sentence:'Do your students ___ English outside the classroom?', base:'use', third:'uses', answer:'use', explanation:'After do, use the base verb: use.' },
  { type:'negative', sentence:"You don't ___ any important details when you tell a story.", base:'miss', third:'misses', answer:'miss', explanation:"After don't, use the base verb: miss." },
  { type:'affirmative', sentence:'Sophie usually ___ her emails before breakfast.', base:'check', third:'checks', answer:'checks', explanation:'Sophie = she → use the third-person singular form: checks.' },
  { type:'affirmative', sentence:'We ___ that face-to-face conversations solve problems faster.', base:'think', third:'thinks', answer:'think', explanation:'We → use the base verb: think.' },
  { type:'question', sentence:'Does this train ___ directly to the city center?', base:'go', third:'goes', answer:'go', explanation:'After does, use the base verb: go, not goes.' },
  { type:'negative', sentence:"Aisha doesn't ___ client data on her personal computer.", base:'store', third:'stores', answer:'store', explanation:"After doesn't, use the base verb: store." },
  { type:'affirmative', sentence:'The customer service team ___ urgent requests within an hour.', base:'handle', third:'handles', answer:'handles', explanation:'The team is singular here → use handles.' },
  { type:'question', sentence:'Do Martin and Elena ___ tennis after work?', base:'play', third:'plays', answer:'play', explanation:'After do, use the base verb: play.' },
  { type:'negative', sentence:"These headphones don't ___ much when you move around.", base:'move', third:'moves', answer:'move', explanation:"After don't, use the base verb: move." },
  { type:'affirmative', sentence:'His project manager ___ weekly updates for international partners.', base:'write', third:'writes', answer:'writes', explanation:'His project manager = she/he → use the third-person singular form: writes.' },
  { type:'question', sentence:'Does your university ___ evening classes for working adults?', base:'offer', third:'offers', answer:'offer', explanation:'After does, use the base verb: offer.' },
  { type:'negative', sentence:"She doesn't ___ her day until she reviews the team calendar.", base:'plan', third:'plans', answer:'plan', explanation:"After doesn't, use the base verb: plan." },
  { type:'affirmative', sentence:'The documentary ___ a convincing case for changing the policy.', base:'make', third:'makes', answer:'makes', explanation:'The documentary = it → use the third-person singular form: makes.' }
];

let session = [], current = 0, score = 0, mistakes = [], answered = false;
const $ = id => document.getElementById(id);
const shuffle = items => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
const sentenceHTML = text => text.replace('___', '<span class="blank">___</span>');
const complete = (text, answer) => text.replace('___', answer);

function start() {
  session = shuffle(QUESTIONS); current = 0; score = 0; mistakes = []; answered = false;
  $('score').textContent = '0'; $('results').hidden = true; $('practice').hidden = false; render();
}
function render() {
  answered = false; const q = session[current]; const number = current + 1;
  $('progress-text').textContent = `Question ${number} of ${session.length}`;
  $('progress-percent').textContent = `${Math.round(number / session.length * 100)}% complete`;
  $('progress-bar').style.width = `${number / session.length * 100}%`;
  $('sentence').innerHTML = sentenceHTML(q.sentence); $('feedback').hidden = true; $('feedback').className = 'feedback'; $('next').hidden = true;
  $('options').replaceChildren(...shuffle([q.base, q.third]).map(option => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'answer-button'; button.textContent = option;
    button.setAttribute('aria-label', `Choose ${option}`); button.addEventListener('click', () => choose(option, button)); return button;
  }));
  $('options').querySelector('button').focus();
}
function choose(choice, selectedButton) {
  if (answered) return; answered = true; const q = session[current]; const correct = choice === q.answer;
  [...$('options').children].forEach(button => { button.disabled = true; if (button.textContent === q.answer) button.classList.add('correct'); });
  if (correct) score++; else { selectedButton.classList.add('incorrect'); mistakes.push({ ...q, choice }); }
  $('score').textContent = String(score); $('feedback-title').textContent = correct ? 'Correct' : 'Not quite';
  $('completed-sentence').textContent = complete(q.sentence, q.answer); $('explanation').textContent = q.explanation;
  $('feedback').classList.toggle('error', !correct); $('feedback').hidden = false; $('next').textContent = current === session.length - 1 ? 'See results' : 'Next'; $('next').hidden = false; $('next').focus();
}
function next() { if (!answered) return; if (current < session.length - 1) { current++; render(); } else showResults(); }
function showResults() {
  $('practice').hidden = true; $('results').hidden = false; const percentage = Math.round(score / session.length * 100);
  $('final-score').textContent = `Your score: ${score} / ${session.length} · ${percentage}%`;
  $('performance').textContent = score >= 45 ? 'Excellent. Your subject–verb agreement is very consistent.' : score >= 40 ? 'Very good. A few patterns still need attention.' : score >= 35 ? 'Good progress. Review third-person singular forms and do/does structures.' : 'Keep practicing. Focus on when English uses the base verb and when it uses the third-person singular form.';
  if (!mistakes.length) $('mistakes').innerHTML = '<p>Perfect score — no mistakes to review.</p>';
  else $('mistakes').replaceChildren(...mistakes.map((m, index) => {
    const article = document.createElement('article'); article.className = 'mistake-card';
    article.innerHTML = `<p class="original">${index + 1}. ${sentenceHTML(m.sentence)}</p><p class="answer-wrong"><strong>Your answer:</strong> ${m.choice}</p><p class="answer-right"><strong>Correct answer:</strong> ${m.answer}</p><p><strong>Correct sentence:</strong> ${complete(m.sentence, m.answer)}</p><p class="mini-explanation">${m.explanation}</p>`; return article;
  }));
  window.scrollTo({ top: 0, behavior: 'smooth' }); $('restart').focus();
}
$('next').addEventListener('click', next); $('restart').addEventListener('click', start); start();
