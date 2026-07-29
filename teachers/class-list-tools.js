const normalize = value => String(value ?? '').trim().toLocaleLowerCase();

export function classMatchesTeacherFilter(teacherIds, selectedTeacherIds, mode = 'include') {
  if (!selectedTeacherIds.length) return true;
  const hasSelectedTeacher = teacherIds.some(id => selectedTeacherIds.includes(id));
  return mode === 'exclude' ? !hasSelectedTeacher : hasSelectedTeacher;
}

export function compareClassRows(a, b, key, direction = 'asc') {
  const result = normalize(a[key]).localeCompare(normalize(b[key]), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
  return direction === 'desc' ? -result : result;
}
