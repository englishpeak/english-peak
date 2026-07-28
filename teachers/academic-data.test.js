import test from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMIC_TABLES, classifySupabaseError, ensureTeacherProfile, loadAcademicData } from './academic-data.js';

function query(result, calls, table) {
  const chain = { select(columns) { calls.push(['select', table, columns]); return chain; }, eq() { return chain; }, gte() { return chain; }, lte() { return chain; }, order() { return chain; }, maybeSingle() { return Promise.resolve(result); }, single() { return Promise.resolve(result); }, then(resolve) { return Promise.resolve(result).then(resolve); } };
  return chain;
}

test('academic resources are table selects and never RPC calls', async () => {
  const calls=[];
  const client={ from(table){ calls.push(['from',table]); return query({data:[],error:null},calls,table); }, rpc(){ throw new Error('RPC must not be used'); } };
  const result=await loadAcademicData(client,{isAdmin:false,week:{start:'2026-07-20',end:'2026-07-26'}});
  assert.deepEqual(Object.values(ACADEMIC_TABLES).slice(1,6), calls.filter(c=>c[0]==='from').map(c=>c[1]));
  assert.deepEqual(result.errors, {});
});

test('one unavailable optional resource does not discard successful empty resources', async () => {
  const client={from(table){return query(table===ACADEMIC_TABLES.tasks?{data:null,error:{code:'42501',message:'permission denied'}}:{data:[],error:null},[],table);}};
  const result=await loadAcademicData(client,{isAdmin:true,week:{start:'2026-07-20',end:'2026-07-26'}});
  assert.deepEqual(result.data.students, []);
  assert.equal(result.errors.tasks.type, 'authorization');
});

test('missing schema and RLS errors are distinguished', () => {
  assert.equal(classifySupabaseError({code:'PGRST205',message:'table missing from schema cache'}),'missing');
  assert.equal(classifySupabaseError({code:'42501',message:'permission denied'}),'authorization');
});

test('a missing teacher profile is initialized with the authenticated user id', async () => {
  const inserted=[];
  const client = { from() { return {
    select() { return { eq() { return { maybeSingle: async () => ({ data: null, error: null }) }; } }; },
    insert(row) { inserted.push(row); return { select() { return { single: async () => ({ data: { ...row, status: 'Active' }, error: null }) }; } }; }
  }; } };
  const profile=await ensureTeacherProfile(client,'teacher-1',false);
  assert.deepEqual(inserted,[{user_id:'teacher-1'}]); assert.equal(profile.status,'Active');
});
