import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as academicCore from './academic-core.js';
import * as paymentCore from './payment-core.js';
import { ACADEMIC_TABLES } from './academic-data.js';
import * as receivables from './receivables-ledger.js';

const source = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const day = (id, date, status = 'Open') => ({ id, pay_date: date, period_start: date === '2026-10-23' ? '2026-10-17' : '2026-10-10', period_end: date, status });

// Exercise the real page handlers without signing in or writing to Supabase.
function appHarness() {
  const listeners = {}, elements = new Map(), writes = [], alerts = [];
  const client = { from(table) {
    return {
      insert(payload) {
        writes.push({ table, operation: 'insert', payload });
        return Promise.resolve({ error: null });
      },
      upsert(payload, options) {
        writes.push({ table, operation: 'upsert', payload, options });
        return { select: () => ({ single: async () => ({ data: { id: `report-${payload.pay_day_id}` }, error: null }) }) };
      },
      delete() {
        return { eq(column, value) {
          writes.push({ table, operation: 'delete', column, value });
          return Promise.resolve({ error: null });
        } };
      }
    };
  } };
  const context = vm.createContext({
    ...academicCore, ...paymentCore, ...receivables, ACADEMIC_TABLES,
    localStorage: {}, AUTH_STORAGE_KEY: 'test-session', migrateLegacyAdminSession() {},
    supabase: { createClient: () => client },
    document: {
      addEventListener(name, handler) { listeners[name] = handler; },
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, { classList: { add() {}, remove() {} }, addEventListener() {} });
        return elements.get(selector);
      }
    },
    FormData: class { constructor(form) { return new Map(Object.entries(form.values)); } },
    confirm: () => true, alert: message => alerts.push(message), setTimeout() {},
    location: { pathname: '/teachers/', search: '' }, URLSearchParams,
  });
  vm.runInContext(source.replace(/^import .*;\n/gm, '').replace('init().catch(showStartupError);', '') + `
    loadData=async()=>{};
    render=()=>{};
    openModal=html=>{globalThis.modal=html};
    globalThis.app={state,overview,reports,payments,reportForm,openPayDays};
  `, context);
  const app = context.app;
  Object.assign(app.state, { user: { id: 'teacher-1' }, payDays: [day('later', '2026-10-23'), day('earlier', '2026-10-16'), day('closed', '2026-10-09', 'Closed')] });
  return {
    ...app, context, writes, alerts, elements,
    submit: (id, values, dataset = {}) => listeners.submit({ preventDefault() {}, target: { id, values, dataset } }),
    click: button => listeners.click({ target: { closest: () => button }, preventDefault() {}, stopImmediatePropagation() {} })
  };
}

test('teacher main panel and reports show every open date in chronological order with distinct actions', () => {
  const app = appHarness();
  app.state.reports = [{ id: 'saved', teacher_user_id: 'teacher-1', pay_day_id: 'earlier', status: 'Submitted' }];
  for (const html of [app.overview(), app.reports()]) {
    assert.ok(html.indexOf('2026-10-16') < html.indexOf('2026-10-23'));
    assert.match(html, /data-pay-day="earlier"[^>]*>Edit hours/);
    assert.match(html, /data-pay-day="later"[^>]*>Report hours/);
    assert.doesNotMatch(html, /data-pay-day="closed"/);
  }
  assert.equal(app.state.payDays[0].id, 'later', 'display sorting must not mutate loaded data');
});

test('admin main panel and Payments show independent close actions for every open date', () => {
  const app = appHarness();
  app.state.isAdmin = true;
  for (const html of [app.overview(), app.payments()]) {
    assert.match(html, /data-close-payday="earlier"/);
    assert.match(html, /data-close-payday="later"/);
    assert.doesNotMatch(html, /data-close-payday="closed"/);
  }
});

test('activation inserts the additional date without closing existing open dates', async () => {
  const app = appHarness();
  app.state.isAdmin = true;
  app.state.payDays = [day('earlier', '2026-10-16')];
  await app.submit('payDayForm', { pay_date: '2026-10-23', period_start: '2026-10-17', period_end: '2026-10-23' });
  assert.equal(app.alerts.length, 0);
  assert.equal(app.writes.length, 1);
  assert.equal(app.writes[0].operation, 'insert');
  assert.equal(app.writes[0].payload.status, 'Open');
  assert.equal(app.state.payDays[0].status, 'Open');
});

test('activation rejects duplicate dates and inverted periods without any writes', async () => {
  const app = appHarness();
  app.state.isAdmin = true;
  await app.submit('payDayForm', { pay_date: '2026-10-23', period_start: '2026-10-17', period_end: '2026-10-23' });
  await app.submit('payDayForm', { pay_date: '2026-10-30', period_start: '2026-10-31', period_end: '2026-10-30' });
  assert.equal(app.writes.length, 0);
  assert.match(app.alerts[0], /already exists/);
  assert.match(app.alerts[1], /on or before/);
});

test('clicking a specific date opens that form with only its saved hours and comments', () => {
  const app = appHarness();
  // These dates deliberately share a week: week_start must not choose the report.
  app.state.payDays = [day('earlier', '2026-10-16'), day('later', '2026-10-17')];
  app.state.reports = [
    { id: 'one', teacher_user_id: 'teacher-1', pay_day_id: 'earlier', week_start: '2026-10-12', status: 'Submitted', teacher_comments: 'First date' },
    { id: 'two', teacher_user_id: 'teacher-1', pay_day_id: 'later', week_start: '2026-10-12', status: 'Submitted', teacher_comments: 'Second date' }
  ];
  app.state.classes = [{ id: 'class-1', status: 'Active', name: 'English' }];
  app.state.classTeachers = [{ teacher_user_id: 'teacher-1', class_id: 'class-1', status: 'Active' }];
  app.state.reportLines = [{ report_id: 'one', class_id: 'class-1', hours: 2 }, { report_id: 'two', class_id: 'class-1', hours: 5 }];
  app.click({ dataset: { action: 'report', payDay: 'later' } });
  assert.match(app.context.modal, /data-pay-day="later"/);
  assert.match(app.context.modal, /value="5.00"/);
  assert.match(app.context.modal, /Second date/);
  assert.doesNotMatch(app.context.modal, /First date/);
});

test('closed and approved dates cannot open an editing form', () => {
  const app = appHarness();
  app.reportForm('closed');
  assert.equal(app.context.modal, undefined);
  app.state.reports = [{ id: 'approved', teacher_user_id: 'teacher-1', pay_day_id: 'earlier', status: 'Approved' }];
  assert.doesNotMatch(app.overview(), /data-pay-day="earlier"/);
  app.reportForm('earlier');
  assert.equal(app.context.modal, undefined);
});

test('future report suggestions exclude hours from the earlier reporting period', () => {
  const app = appHarness();
  app.state.classes = [{ id: 'class-1', status: 'Active', name: 'English' }];
  app.state.classTeachers = [{ teacher_user_id: 'teacher-1', class_id: 'class-1', status: 'Active' }];
  app.state.sessions = [{ class_id: 'class-1', teacher_user_id: 'teacher-1', class_date: '2026-10-15', status: 'Completed', duration_minutes: 120 }];
  app.reportForm('earlier');
  assert.match(app.context.modal, /value="2.00"/);
  app.reportForm('later');
  assert.match(app.context.modal, /value="0.00"/);
});

test('submitting each date saves to a distinct report and deletes only that report’s previous lines', async () => {
  const app = appHarness();
  app.state.payDays = [day('earlier', '2026-10-16'), day('later', '2026-10-17')];
  await app.submit('reportForm', { 'class_class-1': '2', teacher_comments: 'First date' }, { payDay: 'earlier' });
  await app.submit('reportForm', { 'class_class-1': '5', teacher_comments: 'Second date' }, { payDay: 'later' });
  assert.equal(app.alerts.length, 0);
  const reports = app.writes.filter(write => write.operation === 'upsert');
  assert.deepEqual(reports.map(write => write.payload.pay_day_id), ['earlier', 'later']);
  assert.ok(reports.every(write => write.options.onConflict === 'teacher_user_id,pay_day_id'));
  const deletes = app.writes.filter(write => write.operation === 'delete');
  assert.deepEqual(deletes.map(write => write.value), ['report-earlier', 'report-later']);
  const lines = app.writes.filter(write => write.table === ACADEMIC_TABLES.reportLines && write.operation === 'insert');
  assert.deepEqual(lines.map(write => write.payload[0].hours), [2, 5]);
});

test('closing one date leaves the other available for reporting', () => {
  const app = appHarness();
  app.state.payDays.find(item => item.id === 'earlier').status = 'Closed';
  assert.doesNotMatch(app.overview(), /data-pay-day="earlier"/);
  assert.match(app.overview(), /data-pay-day="later"/);
  app.reportForm('later');
  assert.match(app.context.modal, /data-pay-day="later"/);
});

test('submitting a closed date does not write a report', async () => {
  const app = appHarness();
  await app.submit('reportForm', { 'class_class-1': '2' }, { payDay: 'closed' });
  assert.equal(app.writes.length, 0);
  assert.match(app.alerts[0], /Reporting is closed/);
});

test('no open dates shows an empty state with no reporting action', () => {
  const app = appHarness();
  app.state.payDays = [];
  assert.match(app.overview(), /has not opened a pay day/);
  assert.doesNotMatch(app.overview(), /data-action="report"/);
});
