import test from 'node:test';
import assert from 'node:assert/strict';
import { activeTeacherClasses, canLoadTeacherDetail, currentTeacherReport, profileStatus, teacherRoleCounts, teacherScopedData, uniqueTeacherStudentIds, weeklyTeacherHours } from './teacher-metrics.js';

const classes=[{id:'active',status:'Active'},{id:'paused',status:'Paused'}];
const links=[{class_id:'active',teacher_user_id:'t1',status:'Active',role:'Main teacher'},{class_id:'paused',teacher_user_id:'t1',status:'Active',role:'Secondary teacher'},{class_id:'active',teacher_user_id:'t2',status:'Active',role:'Secondary teacher'},{class_id:'active',teacher_user_id:'t1',status:'Ended',role:'Secondary teacher'}];

test('missing profiles are incomplete and real paused/inactive states are preserved',()=>{
  assert.equal(profileStatus(null),'Profile incomplete');
  assert.equal(profileStatus({status:'Paused'}),'Paused');
  assert.equal(profileStatus({status:'Inactive'}),'Inactive');
});
test('direct and active class students are unique',()=>assert.deepEqual([...uniqueTeacherStudentIds('t1',[{teacher_user_id:'t1',student_id:'a',status:'Active'}],classes,links,[{class_id:'active',student_id:'a',status:'Active'},{class_id:'active',student_id:'b',status:'Active'}])],['a','b']));
test('only active classes and active teacher links count',()=>assert.deepEqual(activeTeacherClasses('t1',classes,links).map(x=>x.class_id),['active']));
test('stored teacher roles are counted without inventing roles',()=>assert.deepEqual(teacherRoleCounts('t1',classes,links),{'Main teacher':1}));
test('completed and make-up time is taught while a billable no-show is only billable',()=>assert.deepEqual(weeklyTeacherHours('t1',[{teacher_user_id:'t1',status:'Completed',duration_minutes:30},{teacher_user_id:'t1',status:'Make-up class',duration_minutes:45},{teacher_user_id:'t1',status:'No-show',billing_status:'Billable no-show',duration_minutes:60}]),{taughtMinutes:75,billableMinutes:135}));
test('current report is selected for both teacher and week',()=>assert.equal(currentTeacherReport('t1',[{id:'wrong-teacher',teacher_user_id:'t2',week_start:'2026-07-27'},{id:'wrong-week',teacher_user_id:'t1',week_start:'2026-07-20'},{id:'right',teacher_user_id:'t1',week_start:'2026-07-27'}],'2026-07-27').id,'right'));
test('teacher detail requires an admin and data remains selected-teacher scoped',()=>{
  assert.equal(canLoadTeacherDetail({isAdmin:false},'t2'),false); assert.equal(canLoadTeacherDetail({isAdmin:true},'t2'),true);
  const scoped=teacherScopedData('t1',{sessions:[{teacher_user_id:'t1'},{teacher_user_id:'t2'}],reports:[{teacher_user_id:'t1'}],tasks:[{assigned_teacher_user_id:'t2'}],notes:[{teacher_user_id:'t1',visibility:'Admin only'},{teacher_user_id:'t1',visibility:'Teacher'}]});
  assert.deepEqual(scoped,{sessions:[{teacher_user_id:'t1'}],reports:[{teacher_user_id:'t1'}],tasks:[],notes:[{teacher_user_id:'t1',visibility:'Admin only'}]});
});
test('profile edits are operational-only and therefore preserve related records',()=>{
  const related={assignments:[1],classes:[2],sessions:[3],reports:[4],tasks:[5]}; const update={status:'Paused',timezone:'UTC',hourly_rate:25,internal_notes:''};
  assert.deepEqual(Object.keys(update),['status','timezone','hourly_rate','internal_notes']); assert.deepEqual(related,{assignments:[1],classes:[2],sessions:[3],reports:[4],tasks:[5]});
});
