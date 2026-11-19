import { createPronunciationPlayer } from './pronunciation.js';

// These tints match Word Families Easy. The vocabulary itself comes only from
// the protected API; this browser module contains no dictionary dataset.
const TINTS = ['#e8def9', '#d9eee5', '#ffe5d5', '#dceafa'];

function normalizeSearch(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en-US');
}

export function filterEntries(entries, query = '') {
  const search = normalizeSearch(query.trim());
  return entries.filter(entry => [entry.word, entry.spanish].some(text => normalizeSearch(text || '').includes(search)))
    .sort((a, b) => a.word.localeCompare(b.word, 'en-US'));
}

export function createWordTile(entry, index, onToggle) {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'word-' + entry.id;
  button.className = 'word-tile';
  button.textContent = entry.word;
  button.style.setProperty('--tint', TINTS[index % TINTS.length]);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'word-detail');
  button.addEventListener('click', () => onToggle(entry, button));
  return button;
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderDetails(entry, playPronunciation) {
  const content = document.createElement('div');
  content.className = 'word-detail-content';
  const metadata = document.createElement('div');
  metadata.className = 'word-metadata';
  metadata.append(textElement('span', 'part-of-speech', entry.partOfSpeech));
  if (entry.cefrLevel) {
    const badge = textElement('span', 'cefr-badge', entry.cefrLevel);
    badge.title = 'Estimated level for this meaning';
    metadata.append(badge);
  }
  const speaker = document.createElement('button');
  speaker.type = 'button';
  speaker.className = 'pronunciation-button';
  speaker.setAttribute('aria-label', `Listen to pronunciation: ${entry.word}`);
  speaker.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>
  </svg>`;
  const status = textElement('p', 'pronunciation-status sr-only', '');
  status.setAttribute('role', 'status');
  speaker.addEventListener('click', () => playPronunciation(entry.id, (state, message) => {
    speaker.dataset.state = state;
    status.classList.toggle('sr-only', state !== 'error');
    status.textContent = message;
  }));
  metadata.append(speaker);
  content.append(metadata, status, textElement('p', 'definition', entry.definition));
  const translation = document.createElement('p');
  translation.className = 'spanish-translation';
  translation.lang = 'es';
  translation.append(textElement('span', 'translation-label', 'Español'), ' ',
    textElement('span', 'translation-text', entry.spanish));
  content.append(translation, textElement('h2', '', 'Example sentences'));
  const examples = document.createElement('ol');
  examples.className = 'examples';
  entry.examples.forEach(example => examples.append(textElement('li', '', example)));
  content.append(examples);
  if (entry.collocations.length) {
    content.append(textElement('h2', '', 'Common collocations'));
    const tags = document.createElement('div');
    tags.className = 'collocations';
    entry.collocations.forEach(collocation => tags.append(textElement('span', 'collocation', collocation)));
    content.append(tags);
  }
  return content;
}

export function initializeDictionary(entries, fetchPronunciation) {
  const grid = document.getElementById('word-grid');
  const search = document.getElementById('vocabulary-search');
  const count = document.getElementById('word-count');
  const empty = document.getElementById('dictionary-empty');
  const panel = document.createElement('section');
  panel.id = 'word-detail';
  panel.className = 'word-detail';
  panel.setAttribute('role', 'region');
  panel.hidden = true;
  let active = null;
  let tiles = [];
  let animation = null;
  const pronunciation = createPronunciationPlayer(fetchPronunciation);

  function stopAnimation() {
    if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
    panel.classList.remove('is-animating');
  }

  function animatePanel(open) {
    stopAnimation();
    const finish = () => { panel.classList.remove('is-animating'); panel.hidden = !open; animation = null; };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !panel.animate) { finish(); return; }
    const height = panel.getBoundingClientRect().height;
    panel.classList.add('is-animating');
    animation = panel.animate(open
      ? [{ height: '0px', opacity: 0 }, { height: height + 'px', opacity: 1 }]
      : [{ height: height + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
    { duration: 180, easing: 'ease-out' });
    animation.onfinish = finish;
  }

  function positionPanel() {
    if (!active) return;
    // Insert after the selected tile's entire row. The full-width panel occupies
    // its own grid row, so neighboring tiles never overlap or constrain it.
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const selectedIndex = tiles.indexOf(active.button);
    const rowEnd = Math.min(tiles.length - 1, Math.floor(selectedIndex / columns) * columns + columns - 1);
    const after = tiles[rowEnd].nextSibling;
    if (after !== panel) grid.insertBefore(panel, after);
  }

  function close(immediate = false) {
    pronunciation.stop();
    active?.button.setAttribute('aria-expanded', 'false');
    active = null;
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    if (immediate) { stopAnimation(); panel.hidden = true; panel.replaceChildren(); }
    else if (!panel.hidden) animatePanel(false);
  }

  function toggle(entry, button, { preload = true } = {}) {
    if (active?.entry.id === entry.id) { close(); return; }
    close(true);
    stopAnimation();
    active = { entry, button };
    panel.replaceChildren(renderDetails(entry, pronunciation.play));
    panel.style.setProperty('--tint', button.style.getPropertyValue('--tint'));
    panel.setAttribute('aria-labelledby', button.id);
    panel.removeAttribute('aria-hidden');
    panel.inert = false;
    button.setAttribute('aria-expanded', 'true');
    positionPanel();
    panel.hidden = false;
    animatePanel(true);
    if (preload) pronunciation.preload(entry.id);
  }

  function render() {
    const visible = filterEntries(entries, search.value);
    const previousId = active?.entry.id;
    close(true);
    stopAnimation();
    grid.replaceChildren();
    tiles = visible.map(entry => createWordTile(entry, entries.indexOf(entry), toggle));
    grid.append(...tiles, panel);
    count.textContent = `${visible.length} ${visible.length === 1 ? 'word' : 'words'}`;
    empty.hidden = visible.length > 0;
    const previousIndex = visible.findIndex(entry => entry.id === previousId);
    if (previousIndex !== -1) toggle(visible[previousIndex], tiles[previousIndex], { preload: false });
  }

  search.addEventListener('input', render);
  const observer = new ResizeObserver(() => {
    if (grid.getClientRects().length) positionPanel();
    else pronunciation.stop();
  });
  observer.observe(grid);
  window.addEventListener('pagehide', pronunciation.stop);
  render();
  return () => {
    pronunciation.dispose();
    stopAnimation();
    observer.disconnect();
    search.removeEventListener('input', render);
    window.removeEventListener('pagehide', pronunciation.stop);
  };
}
