import { DEBATE_SETS } from './sets/index.js';

const $ = id => document.getElementById(id);
const setSelect = $('debate-set');
let selectedSet = DEBATE_SETS[0];
let position = 0;

for (const set of DEBATE_SETS) {
  const option = document.createElement('option');
  option.value = set.id;
  option.textContent = set.title;
  setSelect.append(option);
}

function render() {
  const debate = selectedSet.debates[position];
  $('debate-title').textContent = debate.title;
  $('debate-image').alt = debate.title;
  $('debate-image').src = `${selectedSet.imageDirectory}/${String(position + 1).padStart(2, '0')}.jpg`;
  $('debate-question').textContent = debate.question;
  $('progress').textContent = `${position + 1} / ${selectedSet.debates.length}`;
  $('back').disabled = position === 0;
  $('next').disabled = position === selectedSet.debates.length - 1;
}

setSelect.addEventListener('change', () => {
  selectedSet = DEBATE_SETS.find(set => set.id === setSelect.value);
  position = 0;
  render();
});
$('back').addEventListener('click', () => {
  if (position > 0) position -= 1;
  render();
});
$('next').addEventListener('click', () => {
  if (position < selectedSet.debates.length - 1) position += 1;
  render();
});
$('start-over').addEventListener('click', () => {
  position = 0;
  render();
});

if (window.self !== window.top) $('dashboard-link').hidden = true;
render();
