import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDIOM_LESSONS } from './catalog.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('New Practice contains only Idioms Lessons; relocated cards occur once in General English', () => {
  const html = read('../index.html');
  const newPractice = html.slice(html.indexOf('id="new-practice-section"'), html.indexOf('<h2>Free Exercises</h2>'));
  const general = html.slice(html.indexOf('<h2>General English</h2>'), html.indexOf('<h2>Business</h2>'));
  assert.equal((newPractice.match(/class="ex-card"/g) || []).length, 1);
  assert.match(newPractice, /Idioms Lessons/);
  assert.match(html, /function openIdioms\(\) \{\s*window.location.assign\('\/idioms'\)/);
  for (const handler of ['openCollocations', 'openListenAndWrite', 'openWordFamilies']) {
    assert.equal(html.split(`onclick="${handler}()"`).length - 1, 1);
    assert.ok(general.includes(`onclick="${handler}()"`));
    assert.ok(!newPractice.includes(handler));
  }
  assert.match(html, /\['word-families', 'idioms'\].*showModal\(\)/);
});

test('extensionless /idioms serves the shell with no static lesson content or secret', () => {
  const routes = JSON.parse(read('../vercel.json')).rewrites;
  assert.ok(routes.some(route => route.source === '/idioms' && route.destination === '/idioms/index.html'));
  const sources = ['index.html', 'app.js', 'practice.js', 'quiz.js', 'catalog.js'].map(read).join('\n');
  assert.doesNotMatch(sources, /Break the ice|Romper el hielo|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(read('index.html'), /type="module" src="\/idioms\/app.js"/);
  assert.match(read('app.js'), /storageKey: 'ep-auth-token'/);
  assert.match(read('app.js'), /Authorization: `Bearer \$\{token\}`/);
  assert.match(read('app.js'), /cache: 'no-store'/);
});

test('catalog reserves six lessons without fabricated learning content', () => {
  assert.deepEqual(IDIOM_LESSONS.map(item => item.id), [1, 2, 3, 4, 5, 6]);
  assert.equal(IDIOM_LESSONS[0].published, true);
  assert.equal(IDIOM_LESSONS[0].access, 'free');
  for (const item of IDIOM_LESSONS.slice(1)) {
    assert.equal(item.access, 'premium');
    assert.equal(item.published, false);
    assert.equal(item.items, undefined);
  }
});
