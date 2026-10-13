import { normalizeCurrency, roundMoney, money } from './payment-core.js';

export function receiptTotals(payments) {
  const totals = payments.reduce((total, payment) => {
    const currency = normalizeCurrency(payment.payment_currency, 'MXN');
    total[currency === 'USD' ? 'usd' : 'mxn'] += Number(payment.payment_amount) || 0;
    total.mxnValue += Number(currency === 'USD' ? payment.payment_amount_mxn : payment.payment_amount) || 0;
    total.hours += Number(payment.quantity) || 0;
    total.count++;
    return total;
  }, { mxn: 0, usd: 0, mxnValue: 0, hours: 0, count: 0 });
  for (const key of ['mxn', 'usd', 'mxnValue']) totals[key] = roundMoney(totals[key]);
  return totals;
}

export function groupReceivablesByMonth(rows, now = new Date()) {
  // Payment dates are calendar dates; use the viewer's local month, not UTC.
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const groups = new Map([[currentMonth, []]]);
  for (const payment of rows) {
    if (payment.transaction_type !== 'Payment' || payment.voided_at) continue;
    const date = String(payment.payment_date || '');
    const month = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(date) ? date.slice(0, 7) : 'undated';
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month).push(payment);
  }
  const keys = [currentMonth, ...[...groups.keys()].filter(key => key !== currentMonth && key !== 'undated').sort().reverse()];
  if (groups.has('undated')) keys.push('undated');
  return keys.map(month => {
    const payments = [...groups.get(month)].sort((a, b) => String(b.payment_date || '').localeCompare(String(a.payment_date || '')));
    const label = month === 'undated' ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
    return { month, label, current: month === currentMonth, payments, totals: receiptTotals(payments) };
  });
}

export function renderReceivablesMonths(groups, renderRow, table, esc) {
  return groups.map(group => {
    const totals = group.totals;
    const content = `<div class="receivables-month-content"><div class="table-scroll payment-history">${table(['Date','Student / class','Currency','Amount','USD → MXN rate','Hours','Reference','Actions'], group.payments.map(renderRow).join(''), 'No student payments have been registered for this month.')}</div><div class="receivables-month-totals"><h3>${esc(group.label)} totals</h3><dl><div><dt>MXN received</dt><dd>${money(totals.mxn, 'MXN')}</dd></div><div><dt>USD received</dt><dd>${money(totals.usd, 'USD')}</dd></div><div><dt>MXN value received</dt><dd>${money(totals.mxnValue, 'MXN')}</dd></div><div><dt>Payments recorded</dt><dd>${totals.count}</dd></div><div><dt>Hours covered</dt><dd>${totals.hours.toFixed(2)}</dd></div></dl><p>MXN value includes captured MXN equivalents of USD receipts.</p></div></div>`;
    return group.current
      ? `<section class="receivables-month current-month" aria-labelledby="receivables-current-month"><h2 id="receivables-current-month" class="section-title">${esc(group.label)} <span class="badge">Current month</span></h2>${content}</section>`
      : `<details class="receivables-month archived-month"><summary>${esc(group.label)} <span class="rate-source">${totals.count} payment${totals.count === 1 ? '' : 's'}</span></summary>${content}</details>`;
  }).join('');
}
