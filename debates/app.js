import { DEBATE_SETS } from './sets/index.js';

const $ = id => document.getElementById(id);
const setSelect = $('debate-set');
const image = $('debate-image');
const nextImage = new Image();
nextImage.fetchPriority = 'low';
let selectedSet = DEBATE_SETS[0];
let position = 0;

for (const set of DEBATE_SETS) {
  const option = document.createElement('option');
  option.value = set.id;
  option.textContent = set.title;
  setSelect.append(option);
}

function imageUrl(index) {
  const filename = selectedSet.debates[index].imageFilename ?? `${String(index + 1).padStart(2, '0')}.jpg`;
  return `${selectedSet.imageDirectory}/${filename}`;
}

function render() {
  const debate = selectedSet.debates[position];
  const src = imageUrl(position);
  $('debate-title').textContent = debate.title;
  image.alt = debate.title;
  if (image.getAttribute('src') !== src) image.src = src;
  $('debate-question').textContent = debate.question;
  $('progress').textContent = `${position + 1} / ${selectedSet.debates.length}`;
  $('back').disabled = position === 0;
  $('next').disabled = position === selectedSet.debates.length - 1;
}

function startOver() {
  position = 0;
  render();
}

function moveSlide(step) {
  const next = position + step;
  if (next < 0 || next >= selectedSet.debates.length) return;
  position = next;
  render();
}

export function resetActivity() {
  selectedSet = DEBATE_SETS[0];
  setSelect.value = selectedSet.id;
  startOver();
}

image.addEventListener('load', () => {
  if (position + 1 < selectedSet.debates.length && !navigator.connection?.saveData) {
    nextImage.src = imageUrl(position + 1);
  }
});
setSelect.addEventListener('change', () => {
  selectedSet = DEBATE_SETS.find(set => set.id === setSelect.value);
  startOver();
});
$('back').addEventListener('click', () => moveSlide(-1));
$('next').addEventListener('click', () => moveSlide(1));
$('start-over').addEventListener('click', startOver);

$('practice-content').addEventListener('keydown', event => {
  if (event.target === setSelect || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  moveSlide(event.key === 'ArrowLeft' ? -1 : 1);
});
