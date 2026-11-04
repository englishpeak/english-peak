import { QuizRound } from './quiz.js';

const $ = id => document.getElementById(id);
let round = null;
let exampleOpen = false;
let spanishOpen = false;

function toggleDetail(kind) {
  if (!round?.item) return;
  const example = kind === 'example';
  if (example) exampleOpen = !exampleOpen;
  else spanishOpen = !spanishOpen;
  const open = example ? exampleOpen : spanishOpen;
  $(example ? 'examplesPanel' : 'spanishPanel').classList.toggle('hidden', !open);
  const button = $(example ? 'exampleBtn' : 'spanishBtn');
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('span').textContent = example
    ? (open ? 'Hide example sentences' : 'See example sentences')
    : (open ? 'Hide Spanish equivalent' : 'Show Spanish equivalent');
}

function render() {
  if (!round) return;
  const total = round.items.length;
  $('nextBtn').classList.toggle('hidden', round.complete);
  $('questionPanel').classList.toggle('hidden', round.complete);
  $('completePanel').classList.toggle('hidden', !round.complete);
  $('prevBtn').disabled = round.pos === 0;
  const current = Math.min(round.pos + 1, total);
  $('counter').textContent = `${current} of ${total}`;
  $('progressFill').style.width = `${current / total * 100}%`;
  $('progress').setAttribute('aria-valuemax', total);
  $('progress').setAttribute('aria-valuenow', current);
  if (round.complete) {
    $('completionText').textContent = `You finished all ${total} idioms.`;
    $('scoreText').textContent = `${round.score} / ${total} correct answers`;
    $('footNote').textContent = 'Practice makes progress';
    return;
  }
  const item = round.item;
  const answer = round.answer;
  exampleOpen = false;
  spanishOpen = false;
  $('idiom').textContent = `“${item.idiom}”`;
  $('answers').replaceChildren();
  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer';
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = 'ABCD'[index];
    const text = document.createElement('span');
    text.textContent = option;
    button.append(letter, text);
    if (answer !== null) {
      button.disabled = true;
      if (index === item.correct) button.classList.add('correct');
      else if (index === answer) button.classList.add('wrong');
    }
    button.addEventListener('click', () => {
      if (!round?.choose(index)) return;
      render();
      $('nextBtn').focus({ preventScroll: true });
    });
    $('answers').appendChild(button);
  });
  $('feedback').className = 'feedback hidden';
  if (answer !== null) {
    const right = answer === item.correct;
    $('feedback').className = `feedback ${right ? 'success' : 'retry'}`;
    $('feedback').textContent = right
      ? `✓ Exactly right! ${item.options[item.correct]}.`
      : `Not quite. The correct answer is: ${item.options[item.correct]}.`;
  }
  $('exampleList').replaceChildren();
  item.examples.forEach(sentence => {
    const li = document.createElement('li');
    li.textContent = sentence;
    $('exampleList').appendChild(li);
  });
  $('spanishText').textContent = item.spanish || '';
  $('spanishBtn').classList.toggle('hidden', !item.spanish);
  $('examplesPanel').classList.add('hidden');
  $('spanishPanel').classList.add('hidden');
  $('exampleBtn').setAttribute('aria-expanded', 'false');
  $('spanishBtn').setAttribute('aria-expanded', 'false');
  $('exampleBtn').querySelector('span').textContent = 'See example sentences';
  $('spanishBtn').querySelector('span').textContent = 'Show Spanish equivalent';
  $('nextBtn').disabled = answer === null;
  $('nextBtn').textContent = round.pos === total - 1 ? 'Finish lesson →' : 'Next idiom →';
  $('footNote').textContent = answer === null ? 'Select an answer to continue' : 'You can explore the examples before moving on';
}

export function clearPractice() {
  round = null;
  $('lessonView').classList.add('hidden');
  for (const id of ['idiom', 'answers', 'feedback', 'exampleList', 'spanishText', 'scoreText']) $(id).replaceChildren();
}

export function showPractice(lesson, items, { preserve = false } = {}) {
  if (!preserve || !round) round = new QuizRound(items);
  $('home').classList.add('hidden');
  $('lessonView').classList.remove('hidden');
  $('lessonTitle').textContent = lesson.title.toUpperCase();
  $('lessonSubtitle').textContent = `/ ${lesson.subtitle}`;
  render();
}

$('exampleBtn').addEventListener('click', () => toggleDetail('example'));
$('spanishBtn').addEventListener('click', () => toggleDetail('spanish'));
$('nextBtn').addEventListener('click', () => {
  if (round?.next()) { render(); window.scrollTo(0, 0); }
});
$('prevBtn').addEventListener('click', () => { if (round?.previous()) render(); });
$('retryBtn').addEventListener('click', () => { if (round) { round.reset(); render(); window.scrollTo(0, 0); } });
