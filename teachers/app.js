import { calculateReport, getReportableSessions, getWeekRange } from './academic-core.js';
import { ACADEMIC_TABLES, ensureTeacherProfile, loadAcademicData, matchStudentAccount } from './academic-data.js';
import { AUTH_STORAGE_KEY, canUseAcademicManagement, migrateLegacyAdminSession } from './auth.js';
import { activeTeacherClasses, canLoadTeacherDetail, currentTeacherReport, profileStatus, teacherRoleCounts, teacherScopedData, uniqueTeacherStudentIds, weeklyTeacherHours } from './teacher-metrics.js';

const SUPABASE_URL = 'https://jnqekougzmihjqffhuva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i';
// Older versions of the admin panel used Supabase's default project-specific
// key. Migrate that session here as well as in the admin panel so a direct visit
// to /teachers works without requiring the user to revisit the admin page first.
try {
  migrateLegacyAdminSession(localStorage);
} catch (error) {
  console.warn('Unable to migrate the previous admin session.', error);
}
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storageKey: AUTH_STORAGE_KEY, persistSession: true } });
const state = { user: null, profile: null, isAdmin: false, teachers: [], teacherProfiles: [], notes: [], studentAccounts: [], students: [], assignments: [], classes: [], classStudents: [], classTeachers: [], sessions: [], reports: [], tasks: [] };
const $ = s => document.querySelector(s);
const esc = value => String(value ?? '—').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const badge = value => `<span class="badge ${esc(value).replaceAll(' ','-')}">${esc(value)}</span>`;
const title = (name, sub, action='') => `<div class="page-head"><div><h1>${name}</h1><p>${sub}</p></div>${action}</div>`;
const table = (heads, rows, empty='No records yet.') => `<table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${heads.length}">${empty}</td></tr>`}</tbody></table>`;
const teacherName = id => state.teachers.find(t=>t.id===id)?.full_name || state.teachers.find(t=>t.id===id)?.email || 'Unassigned';
const studentName = id => state.students.find(s=>s.id===id)?.full_name || 'Student';
const className = id => state.classes.find(item=>item.id===id)?.name || 'Legacy class';
const classTypes = value => (Array.isArray(value) ? value : [value]).filter(Boolean);

async function query(name, select='*', configure=q=>q) { const {data,error}=await configure(sb.from(name).select(select)); if(error) throw error; return data||[]; }
async function loadData() {
  const result = await loadAcademicData(sb, { isAdmin: state.isAdmin, week: getWeekRange() });
  Object.assign(state, result.data);
  state.dataErrors = result.errors;
  if (state.isAdmin) {
    [state.teachers,state.studentAccounts] = await Promise.all([
      query('profiles','id,email,full_name,tier,is_admin,created_at',q=>q.eq('tier','teacher')),
      query('profiles','id,email,full_name,tier,is_admin,created_at',q=>q.eq('tier','student').order('created_at',{ascending:false}))
    ]);
    state.teachers=state.teachers.map(account=>({...account,teacherProfile:state.teacherProfiles.find(profile=>profile.user_id===account.id)||null}));
  }
  else state.teachers = [{id:state.user.id,email:state.user.email,full_name:state.profile.full_name}];
}

function nav() {
  const admin=[['','Overview'],['directory','Teachers'],['students','Students'],['classes','Classes'],['schedule','Schedule'],['reports','Weekly Reports'],['tasks','Tasks']];
  const teacher=[['','My Overview'],['students','My Students'],['classes','My Classes'],['schedule','My Schedule'],['reports','Weekly Report'],['tasks','My Tasks']];
  const page=location.pathname.replace(/^\/teachers\/?/,'').split('/')[0];
  $('#nav').innerHTML=(state.isAdmin?admin:teacher).map(([path,label])=>`<a class="nav-link ${page===path?'active':''}" href="/teachers/${path}">${label}</a>`).join('');
}

function overview() {
  const week=getWeekRange(), ownReport=state.reports.find(r=>r.teacher_user_id===state.user.id&&r.week_start===week.start);
  if(!state.isAdmin){
    const pending=state.tasks.filter(t=>t.status!=='Completed').length;
    return title('My Overview','Your students, schedule and weekly work at a glance.')+
      `<section class="report-cta"><h2>Create Weekly Report</h2><p>Report the hours you taught this week.</p>${ownReport?.status==='Submitted'?badge('Submitted'):`<button class="ep-btn-primary" data-action="report">${ownReport?'Continue report':'Create Weekly Report'}</button>`}${ownReport?.status==='Needs Changes'?`<p><strong>Changes requested:</strong> ${esc(ownReport.admin_comments)}</p>`:''}</section>`+
      stats([['Assigned students',state.students.length],['Classes this week',state.sessions.length],['Pending tasks',pending],['Report status',ownReport?.status||'Not started']]);
  }
  const activeTeachers=state.teachers.length, activeStudents=state.students.filter(s=>s.status==='Active').length;
  const pendingReports=state.reports.filter(r=>r.status==='Submitted').length, changes=state.reports.filter(r=>r.status==='Needs Changes').length;
  const submitted=new Set(state.reports.filter(r=>r.week_start===week.start&&r.status!=='Draft').map(r=>r.teacher_user_id));
  return title('Academic Overview','Administration for the current teaching week.')+stats([
    ['Active teachers',activeTeachers],['Active students',activeStudents],['Classes scheduled',state.sessions.filter(s=>s.status==='Scheduled').length],['Reports pending',pendingReports],['Need corrections',changes],['Reports missing',Math.max(0,activeTeachers-submitted.size)],['Pending tasks',state.tasks.filter(t=>t.status!=='Completed').length],['No-shows',state.sessions.filter(s=>s.status==='No-show').length]
  ])+`<div class="quick"><button class="ep-btn-primary" data-action="class">Add Class</button><button class="btn" data-action="student">Add Student</button><button class="btn" data-action="assign">Assign Student</button><a class="btn link" href="/teachers/reports">View Weekly Reports</a><button class="btn" data-action="task">Create Task</button></div>`;
}
function stats(items){return `<div class="grid">${items.map(([label,value])=>`<article class="ep-card stat"><strong>${esc(value)}</strong><span>${label}</span></article>`).join('')}</div>`}

function teacherMetrics(teacher){
  const id=teacher.id, week=getWeekRange(), classLinks=activeTeacherClasses(id,state.classes,state.classTeachers), studentIds=uniqueTeacherStudentIds(id,state.assignments,state.classes,state.classTeachers,state.classStudents), hours=weeklyTeacherHours(id,state.sessions), report=currentTeacherReport(id,state.reports,week.start), pending=state.tasks.filter(task=>task.assigned_teacher_user_id===id&&task.status!=='Completed').length;
  return {classLinks,studentIds,hours,report,pending,status:profileStatus(teacher.teacherProfile),roles:teacherRoleCounts(id,state.classes,state.classTeachers)};
}

function roleSummary(roles){return Object.entries(roles).map(([role,count])=>`${count} ${role.replace(' teacher','')}`).join('<br>')||'—'}

function directory(){
  const metrics=state.teachers.map(teacher=>[teacher,teacherMetrics(teacher)]), missing=metrics.filter(([,m])=>!m.report).length;
  return title('Teachers','Operational directory for Teacher-tier accounts.')+
    stats([['Total accounts',state.teachers.length],['Active',metrics.filter(([,m])=>m.status==='Active').length],['Paused',metrics.filter(([,m])=>m.status==='Paused').length],['Inactive',metrics.filter(([,m])=>m.status==='Inactive').length],['Profiles incomplete',metrics.filter(([,m])=>m.status==='Profile incomplete').length],['Weekly reports missing',missing]])+
    `<div class="filters teacher-filters"><input id="teacherSearch" aria-label="Search teachers" placeholder="Search name or email"><select id="teacherStatus"><option value="">All operational statuses</option>${['Active','Paused','Inactive','Profile incomplete'].map(x=>`<option>${x}</option>`).join('')}</select><select id="teacherReport"><option value="">All report statuses</option>${['Missing','Not started','Draft','Submitted','Needs Changes','Approved','Paid'].map(x=>`<option>${x}</option>`).join('')}</select><select id="teacherTasks"><option value="">All task states</option><option value="pending">Has pending tasks</option><option value="clear">No pending tasks</option></select><button class="btn" id="clearTeacherFilters">Clear filters</button></div>`+
    `<div class="table-scroll">${table(['Teacher','Email','Operational status','Assigned students','Active classes','Role in classes','Taught hours this week','Billable hours this week','Weekly report','Pending tasks','Actions'],metrics.map(([teacher,m])=>`<tr data-teacher-row data-search="${esc(`${teacher.full_name||''} ${teacher.email||''}`.toLowerCase())}" data-status="${esc(m.status)}" data-report="${esc(m.report?.status||'Missing')}" data-pending="${m.pending?'pending':'clear'}"><td><strong>${esc(teacher.full_name||'Teacher')}</strong></td><td>${esc(teacher.email)}</td><td>${badge(m.status)}</td><td>${m.studentIds.size}</td><td>${m.classLinks.length}</td><td>${roleSummary(m.roles)}</td><td>${(m.hours.taughtMinutes/60).toFixed(1)}h</td><td>${(m.hours.billableMinutes/60).toFixed(1)}h</td><td>${badge(m.report?.status||'Missing')}</td><td>${m.pending}</td><td><div class="row-actions"><a class="btn compact link" href="/teachers/directory/${teacher.id}">Open profile</a>${teacher.teacherProfile?`<button class="btn compact" data-edit-teacher="${teacher.id}">Edit profile</button>`:`<button class="btn compact" data-init-teacher="${teacher.id}">Initialize profile</button>`}${m.report?`<a class="btn compact link" href="/teachers/directory/${teacher.id}?tab=reports">View report</a>`:''}<button class="btn compact" data-task-teacher="${teacher.id}">Create task</button></div></td></tr>`).join(''),'No teachers match these filters.') }</div>`;
}
function students(){return title(state.isAdmin?'Students':'My Students','Student records and active teacher assignments.',state.isAdmin?'<button class="ep-btn-primary" data-action="student">Add Student</button>':'')+
  (state.isAdmin?`<aside class="match-help"><strong>Account matching</strong><span>Use <b>Match account</b> to merge a manual student record with a newly registered English Peak Student account.</span></aside>`:'')+
  `<div class="filters"><input id="studentSearch" placeholder="Search name or email"><select id="statusFilter"><option value="">All statuses</option>${['Active','Paused','Inactive','Prospect'].map(x=>`<option>${x}</option>`)}</select></div>`+
  table(['Student','Email','Account','Level','Status','Teacher','Actions'],state.students.map(s=>{const a=state.assignments.find(a=>a.student_id===s.id&&a.status==='Active');return `<tr data-student-row data-search="${esc((s.full_name+' '+(s.email||'')).toLowerCase())}" data-status="${s.status}"><td>${esc(s.full_name)}</td><td>${esc(s.email)}</td><td>${s.account_matched_at?badge('Matched'):s.user_id?badge('Registered'):state.isAdmin?`<button class="btn compact" data-match="${s.id}">Match account</button>`:badge('Manual record')}</td><td>${esc(s.level)}</td><td>${badge(s.status)}</td><td>${esc(teacherName(a?.teacher_user_id))}</td><td><div class="row-actions"><a class="btn compact link" href="/teachers/students/${s.id}">Open</a><button class="btn compact" data-edit-student="${s.id}">Edit</button></div></td></tr>`}).join(''),'No students assigned yet.')}

function studentDetail(id){const s=state.students.find(x=>x.id===id);if(!s)return title('Student unavailable','The record does not exist or you are not authorized to access it.');const a=state.assignments.find(x=>x.student_id===id&&x.status==='Active');return title(esc(s.full_name),`${esc(s.level)} · ${esc(s.status)}`,`<div class="quick"><button class="btn" data-edit-student="${s.id}">Edit Student</button>${state.isAdmin?'<button class="btn" data-action="assign">Reassign</button>':''}</div>`)+`<div class="tabs"><span>Overview</span><span>Schedule & Classes</span><span>Tasks</span><span>Notes</span><span>History</span></div><div class="grid"><article class="ep-card card"><h3>Basic information</h3><p>${esc(s.email)}<br>${esc(s.phone)}<br>${esc(s.company)}<br>${esc(s.timezone)}</p></article><article class="ep-card card"><h3>Current teacher</h3><p>${esc(teacherName(a?.teacher_user_id))}</p><p>${esc(s.classes_per_week)} classes/week · ${esc(s.default_class_duration)} minutes</p></article></div>`+table(['Date','Time','Status','Notes'],state.sessions.filter(x=>x.student_id===id).map(x=>`<tr><td>${x.class_date}</td><td>${x.start_time}</td><td>${badge(x.status)}</td><td>${esc(x.notes)}</td></tr>`).join(''))}

function classes(){
  const visible=state.isAdmin?state.classes:state.classes.filter(item=>state.classTeachers.some(link=>link.class_id===item.id&&link.teacher_user_id===state.user.id&&link.status==='Active'));
  return title(state.isAdmin?'Classes':'My Classes','Students may join multiple classes, and every class can have a teaching team.',state.isAdmin?'<button class="ep-btn-primary" data-action="class">Add Class</button>':'')+
    table(['Class','Type','Weekly','Students','Main teacher','Secondary teachers','Status','Actions'],visible.map(item=>{
      const links=state.classTeachers.filter(link=>link.class_id===item.id&&link.status==='Active');
      const students=state.classStudents.filter(link=>link.class_id===item.id&&link.status==='Active').map(link=>studentName(link.student_id));
      const main=links.find(link=>link.role==='Main teacher');
      const secondary=links.filter(link=>link.role==='Secondary teacher').map(link=>teacherName(link.teacher_user_id));
      return `<tr><td><strong>${esc(item.name)}</strong></td><td><div class="type-list">${classTypes(item.class_type).map(type=>badge(type)).join('')}</div></td><td>${item.classes_per_week}</td><td>${esc(students.join(', ')||'No students')}</td><td>${esc(teacherName(main?.teacher_user_id))}</td><td>${esc(secondary.join(', ')||'—')}</td><td>${badge(item.status)}</td><td><button class="btn compact" data-edit-class="${item.id}">Edit</button></td></tr>`;
    }).join(''),'No classes have been added yet.');
}

function schedule(){return title(state.isAdmin?'Schedule':'My Schedule','Sessions for the current Monday–Sunday week.')+table(['Date','Time','Class','Student','Teacher','Duration','Status','Payable','Notes'],state.sessions.map(s=>`<tr><td>${s.class_date}</td><td>${s.start_time}–${s.end_time}</td><td>${esc(className(s.class_id))}</td><td>${esc(studentName(s.student_id))}</td><td>${esc(teacherName(s.teacher_user_id))}</td><td>${s.duration_minutes} min</td><td>${badge(s.status)}</td><td>${s.is_billable===true||['Completed','Make-up class'].includes(s.status)||s.billing_status==='Billable no-show'?'Yes':'No'}</td><td>${esc(s.notes)}</td></tr>`).join(''))}

function reports(){return title(state.isAdmin?'Weekly Reports':'My Weekly Reports','Review teaching time, payable time and approval status.',!state.isAdmin?'<button class="ep-btn-primary" data-action="report">Create Weekly Report</button>':'')+table(['Week','Teacher','Taught','Payable','Classes','No-shows','Status','Actions'],state.reports.map(r=>`<tr><td>${r.week_start} – ${r.week_end}</td><td>${esc(teacherName(r.teacher_user_id))}</td><td>${(r.total_completed_minutes/60).toFixed(1)}h</td><td>${(r.total_billable_minutes/60).toFixed(1)}h</td><td>${r.total_completed_classes}</td><td>${r.total_no_shows}</td><td>${badge(r.status)}</td><td>${state.isAdmin&&r.status==='Submitted'?`<button class="btn" data-approve="${r.id}">Approve</button> <button class="btn" data-changes="${r.id}">Needs changes</button>`:''}</td></tr>`).join(''),'No report has been created for this week.')}

function tasks(){return title(state.isAdmin?'Tasks':'My Tasks','Assignments and append-only comment history.',state.isAdmin?'<button class="ep-btn-primary" data-action="task">Create Task</button>':'')+table(['Task','Teacher','Student','Due','Status',''],state.tasks.map(t=>`<tr><td><strong>${esc(t.title)}</strong><br>${esc(t.description)}</td><td>${esc(teacherName(t.assigned_teacher_user_id))}</td><td>${esc(studentName(t.related_student_id))}</td><td>${esc(t.due_date)}</td><td><select data-task-status="${t.id}">${['Not Started','In Progress','Completed'].map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`)}</select></td><td><button class="btn" data-comment="${t.id}">Comments</button></td></tr>`).join(''),'No tasks assigned.')}

function detailTabs(active){return `<div class="tabs teacher-tabs" role="tablist">${[['overview','Overview'],['students','Students'],['classes','Classes & Schedule'],['reports','Weekly Reports'],['tasks','Tasks'],['notes','Admin Notes']].map(([key,label])=>`<button role="tab" aria-selected="${active===key}" class="${active===key?'active':''}" data-teacher-tab="${key}">${label}</button>`).join('')}</div>`}

function studentConnections(id,studentId,classLinks){
  const values=[]; if(state.assignments.some(a=>a.teacher_user_id===id&&a.student_id===studentId&&a.status==='Active'))values.push('Direct assignment');
  const classIds=new Set(classLinks.map(x=>x.class_id)); state.classStudents.filter(x=>x.student_id===studentId&&x.status==='Active'&&classIds.has(x.class_id)).forEach(x=>values.push(`Class: ${className(x.class_id)}`)); return values;
}

function teacherDetailPanel(tab,t,m,scoped){
  if(tab==='students') return `<div class="table-scroll">${table(['Student','Email','Level','Connection','Active classes with teacher','Next scheduled class','Status','Open student'],[...m.studentIds].map(id=>{const student=state.students.find(x=>x.id===id);if(!student)return '';const connections=studentConnections(t.id,id,m.classLinks),next=scoped.sessions.filter(x=>x.student_id===id&&`${x.class_date}T${x.start_time||'00:00'}`>=new Date().toISOString().slice(0,16)).sort((a,b)=>a.class_date.localeCompare(b.class_date))[0];return `<tr><td>${esc(student.full_name)}</td><td>${esc(student.email)}</td><td>${esc(student.level)}</td><td>${connections.map(esc).join('<br>')}</td><td>${connections.filter(x=>x.startsWith('Class:')).length}</td><td>${next?`${esc(next.class_date)} ${esc(next.start_time)}`:'—'}</td><td>${badge(student.status)}</td><td><a href="/teachers/students/${student.id}">Open student</a></td></tr>`}).join(''),'No students currently connected to this teacher.') }</div>`;
  if(tab==='classes') return `<h2 class="section-title">Active classes</h2><div class="table-scroll">${table(['Class name','Class type or types','Teacher role','Students','Weekly schedule','Status'],m.classLinks.map(link=>{const item=state.classes.find(x=>x.id===link.class_id);const count=state.classStudents.filter(x=>x.class_id===link.class_id&&x.status==='Active').length;return `<tr><td>${esc(item?.name)}</td><td>${classTypes(item?.class_type).map(badge).join(' ')}</td><td>${esc(link.role)}</td><td>${count}</td><td>${esc(item?.weekly_schedule||item?.schedule||'Not specified')}</td><td>${badge(item?.status)}</td></tr>`}).join(''),'No active classes assigned.') }</div><h2 class="section-title">Sessions this week</h2><div class="table-scroll">${table(['Date','Time','Class','Student','Status','Duration','Taught','Billable','Notes'],scoped.sessions.map(x=>`<tr><td>${esc(x.class_date)}</td><td>${esc(x.start_time)}–${esc(x.end_time)}</td><td>${esc(className(x.class_id))}</td><td>${esc(studentName(x.student_id))}</td><td>${badge(x.status)}</td><td>${x.duration_minutes||0} min</td><td>${['Completed','Make-up class'].includes(x.status)?'Yes':'No'}</td><td>${calculateReport([x]).totalBillableMinutes?'Yes':'No'}</td><td>${esc(x.notes)}</td></tr>`).join(''),'No sessions scheduled this week.') }</div>`;
  if(tab==='reports') return `<div class="table-scroll">${table(['Week','Completed hours','Billable hours','Completed classes','No-shows','Status','Submitted at','Approved at','Action'],scoped.reports.sort((a,b)=>String(b.week_start).localeCompare(String(a.week_start))).map(r=>`<tr><td>${esc(r.week_start)} – ${esc(r.week_end)}</td><td>${(Number(r.total_completed_minutes||0)/60).toFixed(1)}h</td><td>${(Number(r.total_billable_minutes||0)/60).toFixed(1)}h</td><td>${r.total_completed_classes||0}</td><td>${r.total_no_shows||0}</td><td>${badge(r.status)}</td><td>${esc(r.submitted_at)}</td><td>${esc(r.approved_at)}</td><td><div class="row-actions"><a href="/teachers/reports" class="btn compact link">Open</a>${r.status==='Submitted'?`<button class="btn compact" data-approve="${r.id}">Approve</button>`:''}${['Submitted','Approved'].includes(r.status)?`<button class="btn compact" data-changes="${r.id}">Request changes</button>`:''}${['Needs Changes','Paid'].includes(r.status)?'':r.status==='Draft'?`<button class="btn compact" data-reopen-report="${r.id}">Reopen</button>`:''}</div></td></tr>`).join(''),'No weekly reports submitted yet.') }</div>`;
  if(tab==='tasks') return `<div class="quick detail-action"><button class="ep-btn-primary" data-task-teacher="${t.id}">Create Task for this teacher</button></div><div class="table-scroll">${table(['Title','Related student','Due date','Status','Comments','Created by','Updated'],scoped.tasks.map(task=>`<tr><td><strong>${esc(task.title)}</strong></td><td>${esc(studentName(task.related_student_id))}</td><td>${esc(task.due_date)}</td><td><select data-task-status="${task.id}">${['Not Started','In Progress','Completed'].map(x=>`<option ${x===task.status?'selected':''}>${x}</option>`).join('')}</select></td><td><button class="btn compact" data-comment="${task.id}">Open comments</button></td><td>${esc(teacherName(task.assigned_by_user_id))}</td><td>${esc(task.updated_at)}</td></tr>`).join(''),'No tasks assigned.') }</div>`;
  if(tab==='notes') return `<article class="ep-card card admin-note"><strong>Visible only to administrators.</strong><form id="teacherNotesForm" data-id="${t.id}"><div class="field"><label>Private administrative notes</label><textarea name="internal_notes">${esc(t.teacherProfile?.internal_notes||'')}</textarea></div><button class="ep-btn-primary" ${t.teacherProfile?'':'disabled'}>Save note</button></form></article><h2 class="section-title">Administrator notes</h2>${scoped.notes.map(note=>`<article class="ep-card card"><p>${esc(note.note||note.content)}</p><small>${esc(note.created_at)}</small></article>`).join('')||'<p class="empty-state">No administrator notes.</p>'}`;
  const upcoming=scoped.sessions.filter(x=>`${x.class_date}T${x.start_time||'00:00'}`>=new Date().toISOString().slice(0,16)).slice(0,5), pending=scoped.tasks.filter(x=>x.status!=='Completed').slice(0,5);
  return `<div class="detail-grid"><article class="ep-card card"><h2>Operational profile</h2><dl><dt>Status</dt><dd>${badge(m.status)}</dd><dt>Timezone</dt><dd>${esc(t.teacherProfile?.timezone)}</dd><dt>Hourly rate</dt><dd>${t.teacherProfile?.hourly_rate==null?'—':`$${Number(t.teacherProfile.hourly_rate).toFixed(2)}`}</dd><dt>Updated</dt><dd>${esc(t.teacherProfile?.updated_at)}</dd></dl></article><article class="ep-card card"><h2>Current weekly report</h2><p>${badge(m.report?.status||'Missing')}</p><p>${m.report?`${(Number(m.report.total_billable_minutes||0)/60).toFixed(1)} billable hours`:'No report has been created for this week.'}</p></article><article class="ep-card card"><h2>Next upcoming classes</h2>${upcoming.map(x=>`<p><strong>${esc(x.class_date)} ${esc(x.start_time)}</strong><br>${esc(className(x.class_id))} · ${esc(studentName(x.student_id))}</p>`).join('')||'<p>No upcoming classes.</p>'}</article><article class="ep-card card"><h2>Latest pending tasks</h2>${pending.map(x=>`<p><strong>${esc(x.title)}</strong><br>Due ${esc(x.due_date)}</p>`).join('')||'<p>No pending tasks.</p>'}</article></div><article class="ep-card card"><h2>Recent admin activity</h2><p>${[t.teacherProfile?.updated_at,...scoped.tasks.map(x=>x.updated_at),...scoped.reports.map(x=>x.approved_at||x.submitted_at)].filter(Boolean).sort().reverse().slice(0,4).map(x=>new Date(x).toLocaleString()).join('<br>')||'No recent teacher activity.'}</p></article>`;
}

function teacherDetail(id){
  if(!canLoadTeacherDetail(state,id))return title('Access denied','Teacher operational profiles are administrative only.'); const t=state.teachers.find(x=>x.id===id);if(!t)return title('Teacher not found','This Teacher account is unavailable.');
  const m=teacherMetrics(t),scoped=teacherScopedData(id,state),tab=new URLSearchParams(location.search).get('tab')||'overview', future=scoped.sessions.some(x=>x.class_date>new Date().toISOString().slice(0,10));
  return title(esc(t.full_name||'Teacher'),`${esc(t.email)} · ${esc(t.teacherProfile?.timezone||'Timezone not set')}`,`<div class="quick">${t.teacherProfile?`<button class="btn" data-edit-teacher="${id}">Edit Profile</button>`:''}<button class="ep-btn-primary" data-task-teacher="${id}">Create Task</button></div>`)+
    `<div class="teacher-meta">${badge(m.status)}<span>Teacher since ${esc((t.teacherProfile?.created_at||t.created_at||'').slice(0,10))}</span></div>`+
    (!t.teacherProfile?`<article class="ep-card incomplete-card"><h2>Operational profile incomplete</h2><p>Initialize this profile before managing operational status, rate, or private notes.</p><button class="ep-btn-primary" data-init-teacher="${id}">Initialize Teacher Profile</button></article>`:'')+
    (m.status==='Inactive'&&(m.studentIds.size||m.classLinks.length||future)?`<aside class="warning-card"><strong>Inactive teacher still has operational connections.</strong> ${m.studentIds.size} active students, ${m.classLinks.length} active classes${future?', and future sessions':''}. Nothing has been reassigned automatically.</aside>`:'')+
    stats([['Unique assigned students',m.studentIds.size],['Active classes',m.classLinks.length],['Classes this week',scoped.sessions.length],['Taught hours',(m.hours.taughtMinutes/60).toFixed(1)],['Billable hours',(m.hours.billableMinutes/60).toFixed(1)],['Pending tasks',m.pending],['Current report',m.report?.status||'Missing']])+detailTabs(tab)+`<section role="tabpanel">${teacherDetailPanel(tab,t,m,scoped)}</section>`;
}
function render(){nav();const parts=location.pathname.replace(/^\/teachers\/?/,'').split('/').filter(Boolean);const page=parts[0]||'';$('#view').innerHTML=page==='directory'?(parts[1]?teacherDetail(parts[1]):directory()):page==='students'?(parts[1]?studentDetail(parts[1]):students()):page==='classes'?classes():page==='schedule'?schedule():page==='reports'?reports():page==='tasks'?tasks():overview();bind()}

function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden')} function closeModal(){$('#modal').classList.add('hidden')}
function formField(label,name,type='text',extra=''){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" ${extra}></div>`}
function studentForm(){openModal(`<h2 class="ep-heading">Add Student</h2><form id="studentForm">${formField('Full name','full_name','text','required')}${formField('Email','email','email')}${formField('Level','level')}${formField('Start date','start_date','date')}<div class="field"><label>Status</label><select name="status">${['Active','Paused','Inactive','Prospect'].map(x=>`<option>${x}</option>`)}</select></div>${formField('Classes per week','classes_per_week','number','min="0"')}${formField('Default duration','default_class_duration','number','value="60" min="1"')}<button class="ep-btn-primary">Save Student</button></form>`)}
function studentEditForm(id){const s=state.students.find(x=>x.id===id);if(!s)return;openModal(`<h2 class="ep-heading">Edit Student</h2><p class="form-note">Update academic and contact details. Account matching remains an Admin-only action.</p><form id="studentEditForm" data-id="${id}">${formField('Full name','full_name','text',`required value="${esc(s.full_name)}"`)}${formField('Email','email','email',`value="${esc(s.email||'')}"`)}${formField('Phone','phone','tel',`value="${esc(s.phone||'')}"`)}${formField('Company','company','text',`value="${esc(s.company||'')}"`)}${formField('Level','level','text',`value="${esc(s.level||'')}"`)}${formField('Start date','start_date','date',`value="${esc(s.start_date||'')}"`)}<div class="field"><label>Status</label><select name="status">${['Active','Paused','Inactive','Prospect'].map(x=>`<option ${x===s.status?'selected':''}>${x}</option>`)}</select></div>${formField('Classes per week','classes_per_week','number',`min="0" value="${esc(s.classes_per_week??'')}"`)}${formField('Default duration','default_class_duration','number',`min="1" required value="${esc(s.default_class_duration||60)}"`)}${formField('Timezone','timezone','text',`required value="${esc(s.timezone||'America/Mexico_City')}"`)}<div class="field"><label>Academic notes</label><textarea name="academic_notes">${esc(s.academic_notes||'')}</textarea></div><button class="ep-btn-primary">Save Changes</button></form>`)}
function assignForm(){openModal(`<h2 class="ep-heading">Assign Student</h2><form id="assignForm"><div class="field"><label>Student</label><select name="student_id">${state.students.map(s=>`<option value="${s.id}">${esc(s.full_name)}</option>`)}</select></div><div class="field"><label>Teacher</label><select name="teacher_user_id">${state.teachers.map(t=>`<option value="${t.id}">${esc(t.full_name||t.email)}</option>`)}</select></div><button class="ep-btn-primary">Assign</button></form>`)}
function classForm(){openModal(`<h2 class="ep-heading">Add Class</h2><p class="form-note">Build a class from existing students and assign its teaching team.</p><form id="classForm">${formField('Class name','name','text','required')}<fieldset><legend>Type of class</legend><p class="field-help">Select one or more types.</p><div class="check-list class-type-list">${['General English','Conversational','Business English','Test Prep & Other'].map(x=>`<label><input type="checkbox" name="class_types" value="${x}"> ${x}</label>`).join('')}</div></fieldset>${formField('Classes weekly','classes_per_week','number','value="1" min="1" required')}<fieldset><legend>Students</legend><div class="check-list">${state.students.map(s=>`<label><input type="checkbox" name="student_ids" value="${s.id}"> ${esc(s.full_name)}</label>`).join('')}</div></fieldset><div class="field"><label>Main teacher</label><select name="main_teacher_id" required><option value="">Select a teacher…</option>${state.teachers.map(t=>`<option value="${t.id}">${esc(t.full_name||t.email)}</option>`)}</select></div><fieldset><legend>Secondary teachers</legend><div class="check-list">${state.teachers.map(t=>`<label><input type="checkbox" name="secondary_teacher_ids" value="${t.id}"> ${esc(t.full_name||t.email)}</label>`).join('')}</div></fieldset><button class="ep-btn-primary">Add Class</button></form>`)}
function classEditForm(id){const item=state.classes.find(x=>x.id===id);if(!item)return;const selected=classTypes(item.class_type);openModal(`<h2 class="ep-heading">Edit Class</h2><p class="form-note">Update class details. Student rosters and teaching teams are managed separately by Admins.</p><form id="classEditForm" data-id="${id}">${formField('Class name','name','text',`required value="${esc(item.name)}"`)}<fieldset><legend>Type of class</legend><div class="check-list class-type-list">${['General English','Conversational','Business English','Test Prep & Other'].map(x=>`<label><input type="checkbox" name="class_types" value="${x}" ${selected.includes(x)?'checked':''}> ${x}</label>`).join('')}</div></fieldset>${formField('Classes weekly','classes_per_week','number',`value="${esc(item.classes_per_week)}" min="1" required`)}<div class="field"><label>Status</label><select name="status">${['Active','Paused','Ended'].map(x=>`<option ${x===item.status?'selected':''}>${x}</option>`)}</select></div><button class="ep-btn-primary">Save Changes</button></form>`)}
function taskForm(teacherId=''){openModal(`<h2 class="ep-heading">Create Task</h2><form id="taskForm">${formField('Title','title','text','required')}<div class="field"><label>Description</label><textarea name="description"></textarea></div><div class="field"><label>Teacher</label><select name="assigned_teacher_user_id">${state.teachers.map(t=>`<option value="${t.id}" ${teacherId===t.id?'selected':''}>${esc(t.full_name||t.email)}</option>`)}</select></div>${formField('Due date','due_date','date')}<button class="ep-btn-primary">Create Task</button></form>`)}
function teacherProfileForm(id){const teacher=state.teachers.find(x=>x.id===id),profile=teacher?.teacherProfile;openModal(`<h2 class="ep-heading">${profile?'Edit':'Initialize'} Teacher Profile</h2><p class="form-note">Account and authentication fields cannot be changed here.</p><form id="teacherProfileForm" data-id="${id}" data-previous-status="${esc(profile?.status||'')}"><div class="field"><label>Status</label><select name="status" required>${['Active','Paused','Inactive'].map(x=>`<option ${x===(profile?.status||'Active')?'selected':''}>${x}</option>`).join('')}</select></div>${formField('Timezone','timezone','text',`required value="${esc(profile?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC')}"`)}${formField('Hourly rate','hourly_rate','number',`min="0" step="0.01" value="${esc(profile?.hourly_rate??'')}"`)}<div class="field"><label>Internal notes</label><textarea name="internal_notes">${esc(profile?.internal_notes||'')}</textarea></div><p class="form-note">Pausing or deactivating preserves every assignment, class membership, session, report, and task. It does not reassign students or classes.</p><button class="ep-btn-primary">Save operational profile</button></form>`)}
function reportForm(){const week=getWeekRange(), sessions=getReportableSessions(state.sessions,state.classes,state.classTeachers,state.user.id), totals=calculateReport(sessions);openModal(`<h2 class="ep-heading">Create Weekly Report</h2><p>${week.start} – ${week.end}</p><p class="form-note">Only sessions from classes currently assigned to you are included.</p>${table(['Class','Student','Date','Time','Duration','Status','Payable','Notes'],sessions.map(s=>`<tr><td>${esc(className(s.class_id))}</td><td>${esc(studentName(s.student_id))}</td><td>${s.class_date}</td><td>${s.start_time}</td><td>${s.duration_minutes}</td><td>${esc(s.status)}</td><td>${s.is_billable===true||['Completed','Make-up class'].includes(s.status)||s.billing_status==='Billable no-show'?'Yes':'No'}</td><td>${esc(s.notes)}</td></tr>`).join(''))}<div class="grid"><div class="stat"><strong>${totals.totalCompletedClasses}</strong><span>completed</span></div><div class="stat"><strong>${(totals.totalCompletedMinutes/60).toFixed(1)}h</strong><span>taught</span></div><div class="stat"><strong>${(totals.totalBillableMinutes/60).toFixed(1)}h</strong><span>payable</span></div><div class="stat"><strong>${totals.totalNoShows}</strong><span>no-shows</span></div></div><form id="reportForm"><textarea name="teacher_comments" placeholder="Comments for the admin"></textarea><button class="ep-btn-primary" ${sessions.length?'':'disabled'}>Submit Weekly Report</button></form>`)}
function matchForm(studentId){
  if(!state.isAdmin)return;
  const student=state.students.find(s=>s.id===studentId);
  const available=state.studentAccounts.filter(account=>!state.students.some(s=>s.user_id===account.id&&s.account_matched_at));
  openModal(`<h2 class="ep-heading">Match student account</h2><p>Merge <strong>${esc(student?.full_name)}</strong>'s manual academic record with a registered English Peak Student account. Classes, assignments, notes, and academic details will remain on this record.</p><form id="matchForm" data-student-id="${studentId}"><div class="field"><label>Registered account</label><select name="user_id" required><option value="">Select an account…</option>${available.map(a=>`<option value="${a.id}">${esc(a.full_name||a.email)} · ${esc(a.email)}</option>`).join('')}</select></div><p class="form-note">The registered account email becomes the student's email. This action is recorded in the Admin audit log.</p><button class="ep-btn-primary" ${available.length?'':'disabled'}>Review and merge</button></form>`);
}
async function confirmStudentMatch(form,data){
  if(!state.isAdmin)throw new Error('Only Admins can match student accounts.');
  const account=state.studentAccounts.find(a=>a.id===data.user_id);
  const student=state.students.find(s=>s.id===form.dataset.studentId);
  if(!confirm(`Merge ${student?.full_name} with ${account?.email}? This cannot be automatically undone.`))return;
  await matchStudentAccount(sb,form.dataset.studentId,data.user_id);
  show('Student account matched and records merged.');closeModal();await loadData();render();
}

async function createClass(form,data){
  const formData=new FormData(form);
  const studentIds=formData.getAll('student_ids');
  const selectedClassTypes=formData.getAll('class_types');
  const secondaryTeacherIds=formData.getAll('secondary_teacher_ids').filter(id=>id!==data.main_teacher_id);
  if(!selectedClassTypes.length)throw new Error('Select at least one type of class.');
  if(!studentIds.length)throw new Error('Select at least one student for this class.');
  const result=await sb.from(ACADEMIC_TABLES.classes).insert({name:data.name,class_type:selectedClassTypes,classes_per_week:Number(data.classes_per_week),status:'Active',created_by_user_id:state.user.id}).select('id').single();
  if(result.error)throw result.error;
  const classId=result.data.id;
  const studentRows=studentIds.map(student_id=>({class_id:classId,student_id,status:'Active'}));
  const teacherRows=[{class_id:classId,teacher_user_id:data.main_teacher_id,role:'Main teacher',status:'Active'},...secondaryTeacherIds.map(teacher_user_id=>({class_id:classId,teacher_user_id,role:'Secondary teacher',status:'Active'}))];
  const [studentsResult,teachersResult]=await Promise.all([sb.from(ACADEMIC_TABLES.classStudents).insert(studentRows),sb.from(ACADEMIC_TABLES.classTeachers).insert(teacherRows)]);
  if(studentsResult.error||teachersResult.error)throw studentsResult.error||teachersResult.error;
  show('Class added with its students and teaching team.');closeModal();await loadData();render();
}

async function comments(id){const rows=await query(ACADEMIC_TABLES.comments,'*',q=>q.eq('task_id',id).order('created_at'));openModal(`<h2 class="ep-heading">Task comments</h2>${rows.map(c=>`<div class="ep-card card"><p>${esc(c.comment)}</p><small>${new Date(c.created_at).toLocaleString()}</small></div>`).join('')||'<p>No comments yet.</p>'}<form id="commentForm" data-id="${id}"><textarea name="comment" required placeholder="Add a comment"></textarea><button class="ep-btn-primary">Add comment</button></form>`)}
async function mutate(promise,message){const {error}=await promise;if(error)throw error;show(message);closeModal();await loadData();render()}
function show(message){$('#notice').textContent=message;$('#notice').classList.add('show');setTimeout(()=>$('#notice').classList.remove('show'),3000)}
function bind(){document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({student:studentForm,assign:assignForm,class:classForm,task:taskForm,report:reportForm}[b.dataset.action]?.()));document.querySelectorAll('[data-match]').forEach(b=>b.onclick=()=>matchForm(b.dataset.match));document.querySelectorAll('[data-edit-student]').forEach(b=>b.onclick=()=>studentEditForm(b.dataset.editStudent));document.querySelectorAll('[data-edit-class]').forEach(b=>b.onclick=()=>classEditForm(b.dataset.editClass));document.querySelectorAll('[data-comment]').forEach(b=>b.onclick=()=>comments(b.dataset.comment));document.querySelectorAll('[data-task-status]').forEach(s=>s.onchange=()=>mutate(sb.from(ACADEMIC_TABLES.tasks).update({status:s.value}).eq('id',s.dataset.taskStatus),'Task updated.'));document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>mutate(sb.from(ACADEMIC_TABLES.reports).update({status:'Approved',approved_at:new Date().toISOString()}).eq('id',b.dataset.approve),'Report approved.'));document.querySelectorAll('[data-changes]').forEach(b=>b.onclick=async()=>{const note=prompt('Admin comment (required):');if(note?.trim())await mutate(sb.from(ACADEMIC_TABLES.reports).update({status:'Needs Changes',admin_comments:note.trim()}).eq('id',b.dataset.changes),'Changes requested.')});document.querySelectorAll('[data-reopen-report]').forEach(b=>b.onclick=()=>mutate(sb.from(ACADEMIC_TABLES.reports).update({status:'Draft',approved_at:null}).eq('id',b.dataset.reopenReport),'Report reopened.'));document.querySelectorAll('[data-edit-teacher],[data-init-teacher]').forEach(b=>b.onclick=()=>teacherProfileForm(b.dataset.editTeacher||b.dataset.initTeacher));document.querySelectorAll('[data-task-teacher]').forEach(b=>b.onclick=()=>taskForm(b.dataset.taskTeacher));document.querySelectorAll('[data-teacher-tab]').forEach(b=>b.onclick=()=>{const url=new URL(location.href);url.searchParams.set('tab',b.dataset.teacherTab);history.pushState({},'',url);render()});$('#studentSearch')?.addEventListener('input',filterStudents);$('#statusFilter')?.addEventListener('change',filterStudents);['teacherSearch','teacherStatus','teacherReport','teacherTasks'].forEach(id=>$(`#${id}`)?.addEventListener(id==='teacherSearch'?'input':'change',filterTeachers));$('#clearTeacherFilters')?.addEventListener('click',()=>{['teacherSearch','teacherStatus','teacherReport','teacherTasks'].forEach(id=>{$(`#${id}`).value=''});filterTeachers()})}
function filterStudents(){const text=$('#studentSearch').value.toLowerCase(),status=$('#statusFilter').value;document.querySelectorAll('[data-student-row]').forEach(r=>r.hidden=!r.dataset.search.includes(text)||(status&&r.dataset.status!==status))}
function filterTeachers(){const text=$('#teacherSearch').value.toLowerCase(),status=$('#teacherStatus').value,report=$('#teacherReport').value,tasks=$('#teacherTasks').value;document.querySelectorAll('[data-teacher-row]').forEach(row=>row.hidden=!row.dataset.search.includes(text)||(status&&row.dataset.status!==status)||(report&&row.dataset.report!==report)||(tasks&&row.dataset.pending!==tasks))}

document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f));try{if(f.id==='studentEditForm'){const payload={full_name:d.full_name.trim(),email:d.email||null,phone:d.phone||null,company:d.company||null,level:d.level||null,start_date:d.start_date||null,status:d.status,classes_per_week:d.classes_per_week===''?null:Number(d.classes_per_week),default_class_duration:Number(d.default_class_duration),timezone:d.timezone.trim(),academic_notes:d.academic_notes||null};await mutate(sb.from(ACADEMIC_TABLES.students).update(payload).eq('id',f.dataset.id),'Student details updated.');return;}if(f.id==='classEditForm'){const types=new FormData(f).getAll('class_types');if(!types.length)throw new Error('Select at least one type of class.');await mutate(sb.from(ACADEMIC_TABLES.classes).update({name:d.name.trim(),class_type:types,classes_per_week:Number(d.classes_per_week),status:d.status}).eq('id',f.dataset.id),'Class details updated.');return;}if(f.id==='teacherProfileForm'){const rate=d.hourly_rate===''?null:Number(d.hourly_rate);if(!['Active','Paused','Inactive'].includes(d.status))throw new Error('Choose a valid operational status.');if(!d.timezone?.trim())throw new Error('Timezone is required.');if(rate!==null&&rate<0)throw new Error('Hourly rate cannot be negative.');if(['Paused','Inactive'].includes(d.status)&&d.status!==f.dataset.previousStatus&&!confirm('This status change will not reassign students or classes. All historical and active records will be preserved. Continue?'))return;const payload={status:d.status,timezone:d.timezone.trim(),hourly_rate:rate,internal_notes:d.internal_notes||'',updated_at:new Date().toISOString()};const teacher=state.teachers.find(x=>x.id===f.dataset.id);await mutate(teacher?.teacherProfile?sb.from(ACADEMIC_TABLES.teacherProfiles).update(payload).eq('user_id',f.dataset.id):sb.from(ACADEMIC_TABLES.teacherProfiles).insert({...payload,user_id:f.dataset.id}),'Teacher operational profile saved.');return;}if(f.id==='teacherNotesForm'){await mutate(sb.from(ACADEMIC_TABLES.teacherProfiles).update({internal_notes:d.internal_notes||'',updated_at:new Date().toISOString()}).eq('user_id',f.dataset.id),'Administrator note saved.');return;}if(f.id==='classForm')await createClass(f,d);if(f.id==='matchForm')await confirmStudentMatch(f,d);if(f.id==='studentForm')await mutate(sb.from(ACADEMIC_TABLES.students).insert({...d,classes_per_week:Number(d.classes_per_week)||null,default_class_duration:Number(d.default_class_duration)}),'Student created.');if(f.id==='assignForm'){await sb.from(ACADEMIC_TABLES.assignments).update({status:'Ended',end_date:new Date().toISOString().slice(0,10)}).eq('student_id',d.student_id).eq('status','Active');await mutate(sb.from(ACADEMIC_TABLES.assignments).insert({...d,status:'Active'}),'Student assigned.')}if(f.id==='taskForm')await mutate(sb.from(ACADEMIC_TABLES.tasks).insert({...d,assigned_by_user_id:state.user.id,status:'Not Started'}),'Task created.');if(f.id==='commentForm')await mutate(sb.from(ACADEMIC_TABLES.comments).insert({task_id:f.dataset.id,author_user_id:state.user.id,comment:d.comment}),'Comment preserved.');if(f.id==='reportForm'){if(!confirm('Submit this weekly report? You will not be able to edit it unless an admin requests changes.'))return;const week=getWeekRange(),sessions=getReportableSessions(state.sessions,state.classes,state.classTeachers,state.user.id),t=calculateReport(sessions);await mutate(sb.from(ACADEMIC_TABLES.reports).upsert({teacher_user_id:state.user.id,week_start:week.start,week_end:week.end,total_completed_minutes:t.totalCompletedMinutes,total_billable_minutes:t.totalBillableMinutes,total_completed_classes:t.totalCompletedClasses,total_no_shows:t.totalNoShows,status:'Submitted',teacher_comments:d.teacher_comments,submitted_at:new Date().toISOString()},{onConflict:'teacher_user_id,week_start'}),'Weekly report submitted.')}}catch(err){alert(err.message)}});
document.addEventListener('click',e=>{if(e.target.matches('[data-close]')||e.target.id==='modal')closeModal()});$('#signOut').onclick=async()=>{await sb.auth.signOut();location.href='/'};

function showDenied(){
  $('#loading').classList.add('hidden');
  $('#denied').classList.remove('hidden');
}

async function init(){
  let session;
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    session=data.session;
  }catch(error){
    console.error(error);
    showDenied();
    return;
  }
  if(!session){
    showDenied();
    return;
  }

  state.user=session.user;
  let profile;
  let profileError;
  try{
    const result=await sb.from('profiles').select('id,email,full_name,tier,is_admin').eq('id',session.user.id).single();
    profile=result.data;
    profileError=result.error;
  }catch(error){
    profileError=error;
  }
  if(profileError||!canUseAcademicManagement(profile)){
    if(profileError)console.error(profileError);
    showDenied();
    return;
  }

  state.profile=profile;
  state.isAdmin=Boolean(profile.is_admin);
  try { state.teacherProfile = await ensureTeacherProfile(sb, state.user.id, state.isAdmin); }
  catch (error) { console.warn('Teacher profile could not be initialized.', error); state.profileInitializationError = error; }
  $('#identity').textContent=`${profile.full_name||session.user.email} · ${state.isAdmin?'Master Admin':'Teacher'}`;
  $('#loading').classList.add('hidden');
  $('#app').classList.remove('hidden');

  try{
    await loadData();
    render();
    const failures=Object.entries(state.dataErrors||{});
    if(failures.length){
      const missing=failures.filter(([,failure])=>failure.type==='missing').map(([name])=>name);
      const denied=failures.filter(([,failure])=>failure.type==='authorization').map(([name])=>name);
      $('#notice').textContent=missing.length?`Academic database migration required for: ${missing.join(', ')}.`:`Some academic sections could not be loaded${denied.length?` because access was denied: ${denied.join(', ')}`:''}.`;
      $('#notice').classList.add('show');
    }
  }catch(error){
    console.error(error);
    $('#notice').textContent=`Academic data could not be loaded: ${error.message}`;
    $('#notice').classList.add('show');
    $('#view').innerHTML=title('Academic Management unavailable','Your account is authorized, but the academic data could not be loaded. Please try again or contact support.');
  }
}init();
