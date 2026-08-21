import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const stylesSource = await readFile(new URL('./styles.css', import.meta.url), 'utf8');

test('admin pay reports mark the first row of each subsequent pay day', () => {
  assert.match(appSource, /startsPayDay=index>0&&payDay!==reportPayDay\(state\.reports\[index-1\]\)/);
  assert.match(appSource, /class="pay-day-group-start"/);
});

test('pay day groups have a prominent full-row divider', () => {
  assert.match(stylesSource, /\.pay-report-table tr\.pay-day-group-start td\{border-top:3px solid var\(--ep-ink\)\}/);
});
