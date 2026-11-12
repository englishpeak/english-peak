import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DEBATE_SETS } from './sets/index.js';

function activity(sets = DEBATE_SETS) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        listeners: {}, children: [],
        addEventListener(event, handler) { this.listeners[event] = handler; },
        append(child) { this.children.push(child); }
      });
      return elements.get(id);
    },
    createElement() { return {}; }
  };
  const window = {};
  window.self = window.top = window;
  const source = fs.readFileSync(new URL('./app.js', import.meta.url), 'utf8').replace(/^import .*;\n/, '');
  vm.runInNewContext(source, { document, window, DEBATE_SETS: sets });
  return id => document.getElementById(id);
}

for (const set of DEBATE_SETS) {
  test(`${set.title}: all ten slides retain the matching question and numbered image through Next, Back, and Start Over`, () => {
    const $ = activity();
    $('debate-set').value = set.id;
    $('debate-set').listeners.change();
    assert.equal(set.debates.length, 10);
    const checkSlide = index => {
      const image = `${set.imageDirectory}/${String(index + 1).padStart(2, '0')}.jpg`;
      assert.equal($('debate-title').textContent, set.debates[index].title);
      assert.equal($('debate-question').textContent, set.debates[index].question);
      assert.equal($('debate-image').src, image);
      assert.equal($('progress').textContent, `${index + 1} / 10`);
      assert.equal($('back').disabled, index === 0);
      assert.equal($('next').disabled, index === 9);
      const bytes = fs.readFileSync(new URL(`..${image}`, import.meta.url));
      assert.equal(bytes.readUInt16BE(0), 0xffd8, `${image} must be a JPEG`);
    };
    checkSlide(0);
    $('back').listeners.click();
    checkSlide(0);
    for (let i = 1; i < 10; i += 1) {
      $('next').listeners.click();
      checkSlide(i);
    }
    $('next').listeners.click();
    checkSlide(9);
    for (let i = 8; i >= 0; i -= 1) {
      $('back').listeners.click();
      checkSlide(i);
    }
    $('next').listeners.click();
    $('start-over').listeners.click();
    checkSlide(0);
  });
}

test('both registered sets can be selected repeatedly and reset to their first slide', () => {
  const $ = activity();
  assert.deepEqual($('debate-set').children.map(option => [option.value, option.textContent]), [
    ['set-1', 'Set 1'], ['set-2', 'Set 2']
  ]);
  for (const id of ['set-2', 'set-1', 'set-2', 'set-1']) {
    $('next').listeners.click();
    $('debate-set').value = id;
    $('debate-set').listeners.change();
    const set = DEBATE_SETS.find(set => set.id === id);
    assert.equal($('debate-title').textContent, set.debates[0].title);
    assert.equal($('debate-question').textContent, set.debates[0].question);
    assert.equal($('debate-image').src, `${set.imageDirectory}/01.jpg`);
    assert.equal($('progress').textContent, '1 / 10');
    assert.equal($('back').disabled, true);
    assert.equal($('next').disabled, false);
  }
});

test('switching sets resets progress and uses that set’s images and slide count', () => {
  const second = { ...DEBATE_SETS[0], id: 'test-set', title: 'Test set', imageDirectory: '/images/test-set', debates: DEBATE_SETS[0].debates.slice(0, 2) };
  const $ = activity([DEBATE_SETS[0], second]);
  assert.equal($('debate-set').children.length, 2);
  $('next').listeners.click();
  $('debate-set').value = second.id;
  $('debate-set').listeners.change();
  assert.equal($('progress').textContent, '1 / 2');
  assert.equal($('debate-image').src, '/images/test-set/01.jpg');
  assert.equal($('back').disabled, true);
  $('next').listeners.click();
  assert.equal($('next').disabled, true);
  $('start-over').listeners.click();
  assert.equal($('progress').textContent, '1 / 2');
  $('debate-set').value = DEBATE_SETS[0].id;
  $('debate-set').listeners.change();
  assert.equal($('progress').textContent, '1 / 10');
  assert.equal($('debate-image').src, '/images/debates/set-1/01.jpg');
});
