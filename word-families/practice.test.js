import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { WORD_FAMILIES } from '../api/word-families.js';

const source = readFileSync(new URL('./practice.js', import.meta.url), 'utf8');

// Minimal DOM for exercising the actual practice event handlers without a browser.
class Element {
  constructor(tagName = 'div') {
    Object.assign(this, { tagName, children: [], dataset: {}, attributes: {}, events: {}, className: '', textContent: '', innerHTML: '', value: '' });
    this.style = { setProperty() {} };
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(' '), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    };
  }
  appendChild(child) {
    if (child.tagName === 'fragment') { [...child.children].forEach(item => this.appendChild(item)); return child; }
    child.remove();
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
  replaceChildren(...children) { this.children = []; children.forEach(child => this.appendChild(child)); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, callback) { this.events[type] = callback; }
  fire(type, values = {}) { this.events[type]?.({ currentTarget: this, target: this, ...values }); }
  focus() {}
  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
    const attribute = selector.match(/^\[([^=]+)="([^"]+)"\]$/);
    if (attribute) return String(attribute[1] === 'data-word' ? this.dataset.word : this.attributes[attribute[1]]) === attribute[2];
    return this.tagName === selector;
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function fixture(families = WORD_FAMILIES, random = 0.25) {
  const root = new Element();
  const ids = ['practice-rows', 'feedback', 'check', 'reveal', 'next', 'bank', 'bank-rows', 'round-number', 'coverage', 'easy-workspace', 'easy-feedback', 'word-cloud', 'easy-targets', 'easy-round', 'easy-coverage', 'easy-check', 'easy-reveal', 'easy-next', 'level-easy', 'level-hard'];
  for (const id of ids) { const element = new Element(); element.id = id; root.appendChild(element); }
  for (const className of ['under-table', 'instructions', 'instruction-note']) { const element = new Element(); element.className = className; root.appendChild(element); }
  const hard = new Element(); hard.setAttribute('aria-labelledby', 'round-title'); root.appendChild(hard);
  const document = {
    getElementById: id => root.querySelector('#' + id),
    querySelector: selector => root.querySelector(selector),
    querySelectorAll: selector => root.querySelectorAll(selector),
    createElement: tag => new Element(tag),
    createDocumentFragment: () => new Element('fragment'),
  };
  const math = Object.create(Math); math.random = () => random;
  const context = { document, Math: math, families };
  vm.runInNewContext(source.replace('export function', 'function') + '\ninitializeWordFamilies(families);', context);
  return { get: document.getElementById, root };
}

test('both modes traverse all 500 families before repeating and the bank renders all rows once', () => {
  const { get, root } = fixture();
  const hardSeen = new Set();
  const easySeen = new Set();
  const familyByWord = new Map(WORD_FAMILIES.flatMap(family => family.forms.flatMap(group => (group || []).map(word => [word, family.id]))));
  for (let index = 0; index < WORD_FAMILIES.length; index++) {
    hardSeen.add(get('practice-rows').children[0].dataset.family);
    const cards = root.querySelectorAll('.word-card');
    const id = familyByWord.get(cards[0].textContent);
    easySeen.add(id);
    assert.equal(cards.length, WORD_FAMILIES.find(family => family.id === id).forms.filter(Boolean).length);
    get('easy-reveal').fire('click');
    assert.equal(get('easy-check').disabled, true);
    assert.ok(root.querySelectorAll('.word-card').every(card => card.parentElement.className === 'target-cards'));
    get('reveal').fire('click');
    assert.ok(get('practice-rows').querySelectorAll('input').every(input => input.value && input.readOnly));
    if (index < WORD_FAMILIES.length - 1) { get('next').fire('click'); get('easy-next').fire('click'); }
  }
  assert.equal(hardSeen.size, 500);
  assert.equal(easySeen.size, 500);
  assert.equal(get('coverage').textContent, '500 / 500');
  assert.equal(get('easy-coverage').textContent, '500 of 500 families seen');
  get('bank').open = true;
  get('bank').fire('toggle');
  get('bank').fire('toggle');
  assert.equal(get('bank-rows').children.length, 500);
  get('next').fire('click'); get('easy-next').fire('click');
  assert.equal(get('coverage').textContent, '500 / 500');
  assert.equal(get('easy-coverage').textContent, '500 of 500 families seen');
});

test('every new family accepts every stored alternative for each possible Hard clue', () => {
  for (const family of WORD_FAMILIES.slice(300)) {
    const available = family.forms.map((form, index) => form ? index : -1).filter(index => index >= 0);
    for (let clueIndex = 0; clueIndex < available.length; clueIndex++) {
      const { get } = fixture([family], (clueIndex + 0.5) / available.length);
      const inputs = get('practice-rows').querySelectorAll('input');
      assert.equal(get('answer-0-' + available[clueIndex]), null);
      for (const input of inputs) input.value = family.forms[input.dataset.col][0];
      for (const input of inputs) {
        for (const word of family.forms[input.dataset.col]) {
          input.value = word;
          get('check').fire('click');
          assert.ok(inputs.every(item => item.parentElement.className.split(' ').includes('correct')), `Family ${family.id}, clue ${available[clueIndex]}, answer ${word}`);
        }
      }
      const adjectives = inputs.filter(input => [2, 3].includes(input.dataset.col));
      if (adjectives.length === 2) {
        [adjectives[0].value, adjectives[1].value] = [adjectives[1].value, adjectives[0].value];
        get('check').fire('click');
        assert.ok(adjectives.every(input => input.parentElement.className.split(' ').includes('correct')));
      }
    }
  }
});

test('bank validation accepts variable sizes but rejects empty or malformed data', () => {
  assert.throws(() => fixture([]), /at least one family/);
  assert.throws(() => fixture(null), /at least one family/);
  assert.throws(() => fixture([WORD_FAMILIES[0], WORD_FAMILIES[0]]), /Invalid family record/);
  assert.throws(() => fixture([{ id: 1, forms: [['work'], null, null, null, null] }]), /clue and an answer/);
  assert.throws(() => fixture([{ id: 1, forms: [['work'], [], null, null, null] }]), /Invalid answer group/);
  assert.throws(() => fixture([{ id: 1, forms: [['work'], ['work'], ['working'], ['working'], null] }]), /Adjective groups overlap/);
});
