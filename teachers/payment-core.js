export const OPERATING_CURRENCY = 'USD';
export const DEFAULT_RATE_CURRENCY = 'MXN';

export function normalizeCurrency(value, fallback = null) {
  const code = String(value || '').toUpperCase();
  return code === 'MXN' || code === 'USD' ? code : fallback;
}
export function money(value, currency) {
  const code = normalizeCurrency(currency);
  if (!code) throw new TypeError('An explicit ISO currency is required');
  return `${new Intl.NumberFormat(code === 'MXN' ? 'es-MX' : 'en-US', { style: 'currency', currency: code }).format(Number(value) || 0)} ${code}`;
}
export function rateCurrency(value) {
  return normalizeCurrency(value, DEFAULT_RATE_CURRENCY);
}
export function formatRateAmount(value, currencyCode) {
  return money(value, rateCurrency(currencyCode));
}
export function rateBalanceStatus(value) {
  const balance = Number(value);
  if (balance > 5) return { key: 'healthy', label: 'Healthy balance' };
  if (balance >= 3) return { key: 'low', label: 'Low balance' };
  return { key: 'critical', label: 'Critical balance' };
}
export function buildRateSave({ chargeRate, teacherRate, manual, currencyCode }) {
  const currency = normalizeCurrency(currencyCode);
  const charge = Number(chargeRate), teacher = manual ? Number(teacherRate) : null;
  if (!currency) throw new TypeError('Choose MXN or USD for the class rate.');
  if (!Number.isFinite(charge) || charge < 0 || (manual && (!Number.isFinite(teacher) || teacher < 0))) {
    throw new TypeError('Enter valid non-negative class and teacher rates.');
  }
  return { charge_rate: charge, teacher_rate: teacher, currency_code: currency };
}
export function roundMoney(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
export function convertUsdToMxn(amount, exchangeRate) {
  const value = Number(amount), rate = Number(exchangeRate);
  return Number.isFinite(value) && value >= 0 && Number.isFinite(rate) && rate > 0 ? roundMoney(value * rate) : null;
}
export function clearExchangeSnapshot(currency, snapshot = {}) { return normalizeCurrency(currency) === 'USD' ? snapshot : { rate: null, source: null, fetchedAt: null }; }
export function validatePayment(input) {
  const currency = normalizeCurrency(input.currency), amount = Number(input.amount), quantity = Number(input.quantity), rate = Number(input.rate);
  if (!input.studentId || !input.classId) return { valid: false, error: 'Student and class are required.' };
  if (!currency) return { valid: false, error: 'Unsupported currency.' };
  if (!Number.isFinite(amount) || amount <= 0) return { valid: false, error: 'Amount must be greater than zero.' };
  if (!Number.isInteger(quantity) || quantity <= 0) return { valid: false, error: 'Classes must be a positive whole number.' };
  if (currency === 'USD' && (!Number.isFinite(rate) || rate <= 0 || !input.source || !input.fetchedAt)) return { valid: false, error: 'USD payments require a captured exchange rate.' };
  return { valid: true };
}
export function paymentDisplay(payment) {
  const currency = normalizeCurrency(payment.payment_currency, payment.payment_currency == null && payment.payment_amount != null ? 'MXN' : null);
  if (!currency) return { primary: 'Currency unavailable', equivalent: null };
  return { primary: money(payment.payment_amount, currency), equivalent: currency === 'USD' && payment.payment_amount_mxn != null ? money(payment.payment_amount_mxn, 'MXN') : null };
}
export function monthlyPaymentSummary(rows, now = new Date()) {
  const month = now.toISOString().slice(0, 7), payments = rows.filter(x => x.transaction_type === 'Payment' && !x.voided_at && String(x.payment_date).slice(0, 7) === month);
  return payments.reduce((a, x) => { const c=normalizeCurrency(x.payment_currency,'MXN'); a.count++; a.classes += Number(x.quantity)||0; if(c==='USD') a.usd += Number(x.payment_amount)||0; else a.mxn += Number(x.payment_amount)||0; a.mxnValue += Number(c==='USD'?x.payment_amount_mxn:x.payment_amount)||0; return a; }, { mxn:0, usd:0, mxnValue:0, count:0, classes:0 });
}
export function filterPayments(rows, filters={}) { const q=String(filters.search||'').toLowerCase(); return rows.filter(x=>x.transaction_type==='Payment'&&(!filters.currency||x.payment_currency===filters.currency)&&(!filters.studentId||x.student_id===filters.studentId)&&(!filters.classId||x.class_id===filters.classId)&&(!filters.from||x.payment_date>=filters.from)&&(!filters.to||x.payment_date<=filters.to)&&(!q||[x.student_name,x.class_name,x.note,x.payment_reference].some(v=>String(v||'').toLowerCase().includes(q)))).sort((a,b)=>String(b.payment_date).localeCompare(String(a.payment_date))); }
export function defaultTeacherRate(chargeRate) { return roundMoney((Number(chargeRate) || 0) * .8); }
export function paymentTotals(lines, rates, teacherRate = 0, adjustment = {}) {
  const hours = lines.reduce((sum, line) => sum + (Number(line.hours) || 0), 0);
  const charged = lines.reduce((sum, line) => sum + (Number(line.hours) || 0) * Number(rates.find(rate => rate.class_id === line.class_id)?.charge_rate || 0), 0);
  const defaultTeacher = lines.reduce((sum, line) => {
    const rate = rates.find(item => item.class_id === line.class_id);
    const value = rate?.teacher_rate ?? (line.class_id ? defaultTeacherRate(rate?.charge_rate) : teacherRate);
    return sum + (Number(line.hours) || 0) * Number(value || 0);
  }, 0);
  const teacherPay = adjustment.teacher_total == null ? defaultTeacher || charged * .8 : Number(adjustment.teacher_total);
  return { hours, charged, teacherPay, schoolShare: adjustment.school_total == null ? charged - teacherPay : Number(adjustment.school_total) };
}
