export const ACADEMIC_TABLES = Object.freeze({
  teacherProfiles: 'ep_teacher_profiles', students: 'ep_students',
  assignments: 'ep_student_teacher_assignments', sessions: 'ep_class_sessions',
  reports: 'ep_weekly_reports', tasks: 'ep_tasks', comments: 'ep_task_comments', notes: 'ep_notes'
});

const OPTIONAL_RESOURCES = ['students', 'assignments', 'sessions', 'reports', 'tasks'];

export function classifySupabaseError(error) {
  const message = String(error?.message || 'Unknown academic data error');
  const code = String(error?.code || '');
  if (code === '42P01' || code === 'PGRST205' || /schema cache|does not exist/i.test(message)) return 'missing';
  if (code === '42501' || /row-level security|permission denied|not authorized/i.test(message)) return 'authorization';
  return 'query';
}

async function selectRows(client, table, columns, configure = query => query) {
  const { data, error } = await configure(client.from(table).select(columns));
  if (error) throw error;
  return data || [];
}

export async function ensureTeacherProfile(client, userId, isAdmin) {
  if (isAdmin) return null;
  const table = ACADEMIC_TABLES.teacherProfiles;
  const columns = 'id,user_id,status,timezone,created_at,updated_at';
  const { data, error } = await client.from(table).select(columns).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const result = await client.from(table).insert({ user_id: userId }).select(columns).single();
  if (result.error) throw result.error;
  return result.data;
}

export async function loadAcademicData(client, { isAdmin, week }) {
  const studentColumns = isAdmin ? '*' : 'id,full_name,email,phone,company,level,status,start_date,class_type,classes_per_week,default_class_duration,timezone,academic_notes,created_at,updated_at';
  const sessionColumns = isAdmin ? '*' : 'id,student_id,teacher_user_id,class_date,start_time,end_time,duration_minutes,status,is_billable,notes,created_at,updated_at';
  const loaders = {
    students: () => selectRows(client, ACADEMIC_TABLES.students, studentColumns),
    assignments: () => selectRows(client, ACADEMIC_TABLES.assignments, '*'),
    sessions: () => selectRows(client, ACADEMIC_TABLES.sessions, sessionColumns, q => q.gte('class_date', week.start).lte('class_date', week.end)),
    reports: () => selectRows(client, ACADEMIC_TABLES.reports, '*', q => q.order('week_start', { ascending: false })),
    tasks: () => selectRows(client, ACADEMIC_TABLES.tasks, '*', q => q.order('created_at', { ascending: false }))
  };
  const settled = await Promise.all(OPTIONAL_RESOURCES.map(async name => {
    try { return [name, await loaders[name](), null]; }
    catch (error) { return [name, [], { type: classifySupabaseError(error), error }]; }
  }));
  return settled.reduce((result, [name, rows, failure]) => {
    result.data[name] = rows;
    if (failure) result.errors[name] = failure;
    return result;
  }, { data: {}, errors: {} });
}

export async function matchStudentAccount(client, studentId, userId) {
  const { data, error } = await client.rpc('ep_match_student_account', {
    p_roster_student_id: studentId,
    p_account_user_id: userId
  });
  if (error) throw error;
  return data;
}
