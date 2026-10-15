import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as academicCore from './academic-core.js';
import * as paymentCore from './payment-core.js';
import { ACADEMIC_TABLES } from './academic-data.js';
import * as receivables from './receivables-ledger.js';
import { activatePayDay } from './pay-days.js';
import { savePayDayReport } from './pay-reports.js';

const source = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const day = (id, date, status = 'Open') => ({ id, pay_date: date, period_start: date === '2026-10-23' ? '2026-10-17' : '2026-10-10', period_end: date, status });

// Exercise the real page handlers without signing in or writing to Supabase.
function appHarness() {
  const listeners = {}, elements = new Map(), writes = [], alerts = [];
  const client = { from(table) {
    if(table===ACADEMIC_TABLES.reports){
      let operation='select',payload;
      const filters=[];
      const execute=async()=>{
        const rows=context.app.state.reports;
        const row=rows.find(row=>filters.every(([key,value])=>Array.isArray(value)?value.includes(row[key]):row[key]===value));
        if(operation==='select')return {data:row||null};
        if(operation==='update'){
          if(!row)return {error:{message:'Report is no longer editable'}};
          Object.assign(row,payload);writes.push({table,operation,payload,filters});
          return {data:{id:row.id}};
        }
        const created={id:`report-${payload.pay_day_id}`,...payload};
        rows.push(created);writes.push({table,operation,payload});return {data:{id:created.id}};
      };
      const q={select(){return q;},eq(key,value){filters.push([key,value]);return q;},
        in(key,value){filters.push([key,value]);return q;},
        insert(value){operation='insert';payload=value;return q;},update(value){operation='update';payload=value;return q;},
        maybeSingle:execute,single:execute};return q;
    }
    if(table===ACADEMIC_TABLES.payDays){
      let operation='select',payload,filter;
      const execute=async()=>{
        const rows=context.app.state.payDays;
        if(operation==='select')return {data:rows.find(row=>row[filter[0]]===filter[1])||null};
        if(operation==='update'){
          assert.equal(filter[0],'id');
          const row=rows.find(row=>row.id===filter[1]);
          Object.assign(row,payload);writes.push({table,operation,payload,column:filter[0],value:filter[1]});
          return {data:row};
        }
        const row={id:'new-date',...payload};rows.push(row);writes.push({table,operation,payload});return {data:row};
      };
      const q={select(){return q;},eq(key,value){filter=[key,value];return q;},
        insert(value){operation='insert';payload=value;return q;},update(value){operation='update';payload=value;return q;},
        maybeSingle:execute,single:execute};return q;
    }
    return {
      insert(payload) {
        writes.push({ table, operation: 'insert', payload });
        return Promise.resolve({ error: null });
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
    ...academicCore, ...paymentCore, ...receivables, ACADEMIC_TABLES, activatePayDay, savePayDayReport,
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
    submit: (id, values, dataset = {}) => listeners.submit({ preventDefault() {}, target: { id, values, dataset, querySelector:()=>({disabled:false}) } }),
    submitForm: form => listeners.submit({ preventDefault() {}, target: form }),
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

test('activation of an open date is harmless and inverted new periods are rejected', async () => {
  const app = appHarness();
  app.state.isAdmin = true;
  await app.submit('payDayForm', { pay_date: '2026-10-23', period_start: '2026-10-17', period_end: '2026-10-23' });
  await app.submit('payDayForm', { pay_date: '2026-10-30', period_start: '2026-10-31', period_end: '2026-10-30' });
  assert.equal(app.writes.length, 0);
  assert.equal(app.alerts.length,1);
  assert.match(app.alerts[0], /on or before/);
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
  const reports = app.writes.filter(write => write.table === ACADEMIC_TABLES.reports && write.operation === 'insert');
  assert.deepEqual(reports.map(write => write.payload.pay_day_id), ['earlier', 'later']);
  const deletes = app.writes.filter(write => write.operation === 'delete');
  assert.deepEqual(deletes.map(write => write.value), ['report-earlier', 'report-later']);
  const lines = app.writes.filter(write => write.table === ACADEMIC_TABLES.reportLines && write.operation === 'insert');
  assert.deepEqual(lines.map(write => write.payload[0].hours), [2, 5]);
});

test('editing a reopened pay day preserves its report ID and the other pay day’s report', async () => {
  const app=appHarness();
  app.state.reports=[
    {id:'existing',teacher_user_id:'teacher-1',pay_day_id:'earlier',status:'Submitted'},
    {id:'other',teacher_user_id:'teacher-1',pay_day_id:'later',status:'Submitted',teacher_comments:'Keep these hours'}
  ];
  await app.submit('reportForm',{'class_class-1':'3',teacher_comments:'Corrected'}, {payDay:'earlier'});
  assert.deepEqual(app.alerts,[]);
  assert.equal(app.state.reports.length,2);
  assert.equal(app.state.reports[0].id,'existing');
  assert.equal(app.state.reports[0].teacher_comments,'Corrected');
  assert.equal(app.state.reports[1].teacher_comments,'Keep these hours');
  assert.equal(app.writes.find(write=>write.operation==='delete').value,'existing');
});

test('double submission of the same form saves once and re-enables its button', async () => {
  const app=appHarness(),button={disabled:false};
  const form={id:'reportForm',values:{'class_class-1':'2'},dataset:{payDay:'earlier'},querySelector:()=>button};
  await Promise.all([app.submitForm(form),app.submitForm(form)]);
  assert.deepEqual(app.alerts,[]);
  assert.equal(app.writes.filter(write=>write.table===ACADEMIC_TABLES.reports).length,1);
  assert.equal(app.writes.filter(write=>write.operation==='delete').length,1);
  assert.equal(button.disabled,false);
});

test('a reviewed report fails before deleting hours and allows the form to recover', async () => {
  const app=appHarness(),button={disabled:false};
  app.state.reports=[{id:'reviewed',teacher_user_id:'teacher-1',pay_day_id:'earlier',status:'Approved'}];
  const form={id:'reportForm',values:{'class_class-1':'2'},dataset:{payDay:'earlier'},querySelector:()=>button};
  await app.submitForm(form);
  assert.match(app.alerts[0],/already been reviewed/);
  assert.deepEqual(app.writes,[]);
  assert.equal(button.disabled,false);
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

test('reopening a closed date preserves its identity, period, creator and existing reports', async () => {
  const app=appHarness();app.state.isAdmin=true;
  const existing={...day('earlier','2026-10-16','Closed'),created_by_user_id:'original-admin'};
  app.state.payDays=[existing,day('later','2026-10-23')];
  app.state.reports=[{id:'saved',teacher_user_id:'teacher-1',pay_day_id:'earlier',status:'Submitted'}];
  await app.submit('payDayForm',{pay_date:'2026-10-16',period_start:'2026-01-01',period_end:'2026-10-16'});
  assert.equal(app.alerts.length,0);
  assert.equal(app.writes.length,1);
  assert.deepEqual(app.writes[0].payload,{status:'Open'});
  assert.equal(app.writes[0].value,'earlier');
  assert.equal(existing.created_by_user_id,'original-admin');
  assert.equal(existing.period_start,'2026-10-10');
  assert.ok(app.state.payDays.every(day=>day.status==='Open'));
  assert.equal(app.state.reports[0].id,'saved');
});

test('only administrators see reopen controls on Overview and Payments', () => {
  const app=appHarness();
  assert.doesNotMatch(app.overview(),/data-reopen-payday/);
  app.state.isAdmin=true;
  for(const html of [app.overview(),app.payments()]){
    assert.match(html,/Previously closed pay days/);
    assert.match(html,/data-reopen-payday="closed"/);
    assert.doesNotMatch(html,/data-reopen-payday="earlier"/);
    assert.match(html,/data-close-payday="earlier"/);
    assert.match(html,/data-close-payday="later"/);
  }
});
