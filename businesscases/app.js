import { businessCases, getBusinessCase } from '/src/data/businessCases.js';
import { getDropboxDirectUrl, dropboxAudioUrl } from '/businesscases/media-urls.js';
import { accessLabel, canAccessBusinessCase, resolveExistingUserTier } from '/businesscases/access.js';
import { initialiseBusinessCasesTheme } from '/businesscases/theme.js';

initialiseBusinessCasesTheme();
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const badge = (value, className = '') => `<span class="badge ${className}">${esc(value)}</span>`;
const caseImage = (item, className = '', loading = 'lazy') => `<div class="image-frame ${className}"><img src="${esc(getDropboxDirectUrl(item.imageSharingUrl))}" alt="${esc(item.imageAlt || '')}" loading="${esc(loading)}" decoding="async"><div class="image-placeholder" hidden aria-hidden="true"><span>BC</span><small>Image unavailable</small></div></div>`;
function wireImages(root = document) {
  root.querySelectorAll('.image-frame img').forEach(image => {
    const fail = () => { image.hidden = true; const fallback = image.nextElementSibling; fallback.hidden = false; fallback.removeAttribute('aria-hidden'); };
    image.addEventListener('error', fail, { once:true });
    if (!image.getAttribute('src')) fail();
  });
}

async function catalogue() {
  app.innerHTML = `<header class="hero"><span class="eyebrow">Business English</span><h1>Business Cases</h1><p>Step into realistic business decisions and build the language to analyse, discuss, and recommend a way forward.</p></header><div class="catalogue-intro"><div><span class="eyebrow catalogue-label">Explore the collection</span><h2>Choose your next case</h2></div><p>Suggested levels are guidance only. Choose a challenge that interests you and adapt the depth of your answer.</p></div><section class="case-catalogue" aria-live="polite"><p class="loading">Checking your access…</p></section>`;
  let tier = 'visitor';
  try { tier = await resolveExistingUserTier(); } catch { tier = 'visitor'; }
  const list = app.querySelector('.case-catalogue');
  list.innerHTML = businessCases.map(item => {
    const accessible = canAccessBusinessCase(item, tier);
    const available = accessible && !item.placeholder;
    const status = accessLabel(item, tier);
    return `<article class="case-card ${!available ? 'locked' : ''}">${caseImage(item, 'catalogue-image', 'lazy')}<div class="card-body"><div class="card-top">${badge(`Case ${item.caseNumber}`, 'case-number')}${badge(status, accessible ? 'access-open' : 'access-locked')}</div><h2>${esc(item.title)}</h2><p>${esc(item.teaser)}</p><div class="card-footer"><div class="meta">${badge(`Suggested ${item.level}`)}${badge(item.estimatedTime)}</div>${available ? `<a class="btn primary" href="/businesscases/${encodeURIComponent(item.slug)}">Explore case <span aria-hidden="true">→</span></a>` : `<span class="locked-message">${item.placeholder ? 'Coming soon' : '🔒 Locked'}</span>`}</div></div></article>`;
  }).join('');
  wireImages(list);
}

const sectionIcons = {
  vocabulary: '◇', background: '▤', meeting: '◉', decision: '✓', discussion: '◌', recommendation: '✎', takeaway: '◆'
};
function section(id, title, skill, content) {
  return `<section class="section"><button class="section-toggle" data-section="${id}" aria-expanded="false" aria-controls="panel-${id}"><span class="section-icon" aria-hidden="true">${sectionIcons[id]}</span><span class="section-title">${esc(title)}</span><span class="skill">${esc(skill)}</span><span class="chevron" aria-hidden="true"></span></button><div class="section-content closed" id="panel-${id}" aria-hidden="true" inert><div class="section-inner"><div class="section-pad">${content}</div></div></div></section>`;
}
function vocabularyMarkup(c) {
  return `<div class="vocabulary"><dl>${c.vocabulary.map(([term, definition]) => `<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl></div>`;
}
function readingMarkup(c) {
  return c.reading.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
}
function transcriptLineMarkup(line) {
  if (line.stageDirection) return `<div class="script-line stage-direction"><p><em>${esc(line.text)}</em></p></div>`;
  return `<div class="script-line"><strong>${esc(line.speaker)}:</strong><p>${esc(line.text)}</p></div>`;
}
function audioMarkup(c) {
  const context = c.listening.context ? `<p class="listening-context">${esc(c.listening.context)}</p>` : '';
  return `${context}<div class="audio-player"><audio preload="metadata" src="${esc(dropboxAudioUrl(c.listening.audioSharingUrl))}"></audio><div class="audio-controls"><button class="icon-btn play" aria-label="Play audio">▶</button><button class="icon-btn rewind" aria-label="Rewind 10 seconds">↶ 10</button><button class="icon-btn forward" aria-label="Fast forward 10 seconds">10 ↷</button><span class="time">0:00 / 0:00</span><label>Volume <input class="volume" type="range" min="0" max="1" step=".05" value="1"></label><label>Speed <select class="speed"><option>.75</option><option selected>1</option><option>1.25</option><option>1.5</option></select>×</label></div><input class="progress" aria-label="Audio progress" type="range" min="0" max="100" value="0"><p class="audio-error" hidden>The audio could not be loaded. Please check your connection and try again.</p></div><button class="btn script-toggle" type="button" aria-expanded="false">Show Script</button><div class="script-wrap closed"><div class="script-panel"><h3>Executive Meeting</h3>${c.listening.transcript.map(transcriptLineMarkup).join('')}</div></div>`;
}
function quizMarkup(c) {
  return `<form class="quiz" novalidate>${c.quizQuestions.map((q, index) => `<div class="quiz-question" data-id="${q.id}"><fieldset><legend><span class="question-source">${esc(q.source)}</span>${index + 1}. ${esc(q.question)}</legend>${q.options.map(o => `<label class="option" data-option="${o.id}"><input type="radio" name="${q.id}" value="${o.id}"><span><b>${o.id}.</b> ${esc(o.text)}</span></label>`).join('')}<p class="explanation" hidden></p></fieldset></div>`).join('')}<p class="form-error" role="alert" hidden>Please answer all five questions before checking.</p><p class="result" aria-live="polite" hidden></p><button class="btn primary check" type="submit">Check answers</button> <button class="btn retry" type="button" hidden>Try again</button></form>`;
}
function discussionMarkup(c) {
  return `<div class="conversation"><div class="discussion-progress" aria-hidden="true">${c.speaking.questions.map((_, i) => `<i data-dot="${i}"></i>`).join('')}</div><div class="conversation-card"><span class="counter"></span><p class="question-text"></p></div><p class="speaking-tip"><strong>Speaking tip:</strong> ${esc(c.speaking.tip)}</p><div class="nav-actions"><button class="btn previous">Previous</button><button class="btn primary next">Next question</button></div></div>`;
}
function writingMarkup(c) {
  const w = c.writingTask;
  return `<h3>${esc(w.title)}</h3><p>${esc(w.instructions)}</p><div class="writing-meta"><div class="task-facts"><span><strong>Format</strong>${esc(w.format)}</span><span><strong>Audience</strong>${esc(w.audience)}</span><span><strong>Suggested range</strong>${esc(w.wordRange)}</span></div><div class="columns"><div><h4>Planning questions</h4><ul>${w.planningQuestions.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h4>Tips</h4><ul>${w.tips.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Useful phrases</h4><ul>${w.usefulPhrases.map(x => `<li><code>${esc(x)}</code></li>`).join('')}</ul></div></div></div><label for="response"><strong>Your response</strong></label><textarea id="response" class="response" placeholder="Start writing here…"></textarea><p class="word-count" aria-live="polite">0 words</p><div class="writing-actions"><button class="btn clear-writing" type="button">Clear response</button><button class="btn primary copy-writing" type="button">Copy response</button></div>`;
}
function renderCase(c) {
  const takeaway = `<span class="eyebrow">Final reflection</span><p>${esc(c.takeaway.text)}</p><small>${esc(c.takeaway.reminder)}</small>`;
  app.innerHTML = `<div class="lesson"><a class="back" href="/businesscases">← All business cases</a><header class="case-head"><span class="eyebrow">Case ${c.caseNumber}</span><h1 class="case-title">${esc(c.title)}</h1><div class="meta">${badge(`Suggested ${c.level}`)}${badge(c.estimatedTime)}${badge(accessLabel(c, 'free'),'access-open')}</div><p class="introduction">${esc(c.introduction)}</p><p class="level-guidance">${esc(c.levelGuidance)}</p></header>${caseImage(c, 'case-photo', 'eager')}<div class="case-information"><div><span>Company</span><strong>${esc(c.company)}</strong></div><div><span>Industry</span><strong>${esc(c.industry)}</strong></div><div><span>Location</span><strong>${esc(c.location)}</strong></div><div><span>Key people</span>${c.characters.map(person => `<strong>${esc(person.name)} <small>— ${esc(person.role)}</small></strong>`).join('')}</div></div><div class="lesson-sections">${section('vocabulary','Useful Vocabulary','Vocabulary',vocabularyMarkup(c))}${section('background','Background Brief','Reading',readingMarkup(c))}${section('meeting','Executive Meeting','Listening',audioMarkup(c))}${section('decision','Decision Check','Comprehension',quizMarkup(c))}${section('discussion','Boardroom Discussion','Speaking',discussionMarkup(c))}${section('recommendation','Your Recommendation','Writing',writingMarkup(c))}${section('takeaway','Case Takeaway','Reflection',takeaway)}</div></div>`;
  wireImages(); wireCase(c);
}

const formatTime = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}` : '0:00';
function wireCase(c) {
  document.querySelectorAll('.section-toggle').forEach(button => {
    const panel = document.querySelector(`#panel-${button.dataset.section}`);
    const setOpen = next => {
      button.setAttribute('aria-expanded', String(next));
      panel.classList.toggle('closed', !next);
      panel.setAttribute('aria-hidden', String(!next));
      panel.inert = !next;
    };
    button.onclick = () => setOpen(button.getAttribute('aria-expanded') !== 'true');
  });
  wireAudio(c); wireQuiz(c); wireDiscussion(c); wireWriting(c);
}
function wireAudio(c) {
  const audio = document.querySelector('audio'); const play = document.querySelector('.play'); const progress = document.querySelector('.progress'); const time = document.querySelector('.time');
  play.onclick = () => audio.paused ? audio.play().catch(() => document.querySelector('.audio-error').hidden = false) : audio.pause();
  audio.onplay = () => { play.textContent = '❚❚'; play.ariaLabel = 'Pause audio'; }; audio.onpause = () => { play.textContent = '▶'; play.ariaLabel = 'Play audio'; };
  audio.ontimeupdate = () => { progress.value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; };
  audio.onerror = () => document.querySelector('.audio-error').hidden = false; progress.oninput = () => { if (audio.duration) audio.currentTime = progress.value / 100 * audio.duration; };
  document.querySelector('.rewind').onclick = () => audio.currentTime = Math.max(0, audio.currentTime - 10); document.querySelector('.forward').onclick = () => audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  document.querySelector('.volume').oninput = event => audio.volume = event.target.value; document.querySelector('.speed').onchange = event => audio.playbackRate = event.target.value;
  const toggle = document.querySelector('.script-toggle'); const wrap = document.querySelector('.script-wrap'); const key = `businessCase:${c.slug}:script`;
  const setScript = open => { toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Hide Script' : 'Show Script'; wrap.classList.toggle('closed', !open); };
  setScript(sessionStorage.getItem(key) === 'open'); toggle.onclick = () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; setScript(open); sessionStorage.setItem(key, open ? 'open' : 'closed'); };
}
function wireQuiz(c) {
  const form = document.querySelector('.quiz');
  form.onsubmit = event => { event.preventDefault(); const missing = c.quizQuestions.filter(q => !form.elements[q.id].value); form.querySelector('.form-error').hidden = !missing.length; form.querySelectorAll('.quiz-question').forEach(item => item.classList.toggle('unanswered', missing.some(q => q.id === item.dataset.id))); if (missing.length) { form.querySelector(`[data-id="${missing[0].id}"]`).scrollIntoView({behavior:'smooth',block:'center'}); return; }
    let score = 0; c.quizQuestions.forEach(q => { const chosen = form.elements[q.id].value; if (chosen === q.correctAnswer) score++; form.querySelector(`[data-id="${q.id}"]`).querySelectorAll('.option').forEach(option => { option.classList.toggle('correct', option.dataset.option === q.correctAnswer); option.classList.toggle('incorrect', option.dataset.option === chosen && chosen !== q.correctAnswer); }); const explanation = form.querySelector(`[data-id="${q.id}"] .explanation`); explanation.hidden = false; explanation.textContent = `Correct answer: ${q.correctAnswer}. ${q.explanation}`; });
    form.querySelector('.result').hidden = false; form.querySelector('.result').textContent = `Your score: ${score} / 5`; form.querySelector('.check').hidden = true; form.querySelector('.retry').hidden = false;
  };
  form.querySelector('.retry').onclick = () => { form.reset(); form.querySelectorAll('.correct,.incorrect,.unanswered').forEach(item => item.classList.remove('correct','incorrect','unanswered')); form.querySelectorAll('.explanation,.result,.form-error,.retry').forEach(item => item.hidden = true); form.querySelector('.check').hidden = false; };
}
function wireDiscussion(c) {
  let index = 0; const question = document.querySelector('.question-text');
  const draw = () => { question.classList.remove('question-enter'); void question.offsetWidth; question.textContent = c.speaking.questions[index]; question.classList.add('question-enter'); document.querySelector('.counter').textContent = `Question ${index + 1} of ${c.speaking.questions.length}`; document.querySelector('.previous').disabled = index === 0; const next = document.querySelector('.next'); next.disabled = index === c.speaking.questions.length - 1; next.textContent = index === c.speaking.questions.length - 1 ? 'Discussion complete' : 'Next question'; document.querySelectorAll('[data-dot]').forEach(dot => dot.classList.toggle('active', Number(dot.dataset.dot) <= index)); };
  document.querySelector('.previous').onclick = () => { if (index) index--; draw(); }; document.querySelector('.next').onclick = () => { if (index < c.speaking.questions.length - 1) index++; draw(); }; draw();
}
function wireWriting(c) {
  const area = document.querySelector('.response'); const count = document.querySelector('.word-count'); const key = `businessCase:${c.slug}:draft`; area.value = localStorage.getItem(key) || '';
  const update = () => { const words = area.value.trim() ? area.value.trim().split(/\s+/).length : 0; count.textContent = `${words} ${words === 1 ? 'word' : 'words'}`; localStorage.setItem(key, area.value); }; area.oninput = update; update();
  document.querySelector('.clear-writing').onclick = () => { area.value = ''; update(); area.focus(); }; document.querySelector('.copy-writing').onclick = async event => { await navigator.clipboard.writeText(area.value); event.currentTarget.textContent = 'Copied!'; setTimeout(() => event.currentTarget.textContent = 'Copy response', 1200); };
}

function lockedCaseMarkup(c) {
  return `<div class="hero access-prompt"><span class="eyebrow">${esc(accessLabel(c, 'visitor'))}</span><h1>${esc(c.title)}</h1><p>${esc(c.teaser)}</p><p><a href="/" class="hero-link">Sign in or create a free account to continue</a></p></div>`;
}

const slug = decodeURIComponent(location.pathname.replace(/^\/businesscases\/?/,'').split('/')[0]);
if (!slug) {
  catalogue();
} else {
  const current = getBusinessCase(slug);
  if (current && !current.placeholder) {
    app.innerHTML = '<div class="hero"><h1>Checking your access…</h1></div>';
    resolveExistingUserTier().then(tier => {
      if (canAccessBusinessCase(current, tier)) renderCase(current);
      else app.innerHTML = lockedCaseMarkup(current);
    }).catch(() => {
      app.innerHTML = canAccessBusinessCase(current, 'visitor') ? '' : lockedCaseMarkup(current);
      if (canAccessBusinessCase(current, 'visitor')) renderCase(current);
    });
  } else {
    app.innerHTML = '<div class="hero"><h1>Case not available</h1><p><a href="/businesscases" class="hero-link">Return to Business Cases</a></p></div>';
  }
}
