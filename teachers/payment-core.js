export function money(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
}

export function defaultTeacherRate(chargeRate) {
  return Math.round((Number(chargeRate) || 0) * 80) / 100;
}

export function paymentTotals(lines, rates, teacherRate = 0, adjustment = {}) {
  const hours = lines.reduce((sum, line) => sum + (Number(line.hours) || 0), 0);
  const charged = lines.reduce((sum, line) => {
    const rate = rates.find(item => item.class_id === line.class_id)?.charge_rate || 0;
    return sum + (Number(line.hours) || 0) * Number(rate);
  }, 0);
  const defaultTeacher = lines.reduce((sum, line) => {
    const rate = rates.find(item => item.class_id === line.class_id);
    const classRate = rate?.teacher_rate ?? (line.class_id ? defaultTeacherRate(rate?.charge_rate) : teacherRate);
    return sum + (Number(line.hours) || 0) * Number(classRate || 0);
  }, 0);
  const teacherPay = adjustment.teacher_total == null ? defaultTeacher || charged * .8 : Number(adjustment.teacher_total);
  const schoolShare = adjustment.school_total == null ? charged - teacherPay : Number(adjustment.school_total);
  return { hours, charged, teacherPay, schoolShare };
}
