import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRateSave, clearExchangeSnapshot, convertUsdToMxn, defaultTeacherRate, filterPayments, formatRateAmount, money, monthlyPaymentSummary, OPERATING_CURRENCY, paymentDisplay, paymentTotals, rateBalanceStatus, rateCurrency, suggestedPaymentAmount, validatePayment } from './payment-core.js';

test('admin pay reports use the MXN currency configured for class rates', () => {
  assert.equal(OPERATING_CURRENCY, 'MXN');
});

test('calculates the automatic teacher rate as 80% of the class charge', () => {
  assert.equal(defaultTeacherRate(140), 112);
  assert.equal(defaultTeacherRate(279.99), 223.99);
  assert.equal(defaultTeacherRate(''), 0);
});

test('calculates class charges and uses the 80/20 default split', () => {
  assert.deepEqual(paymentTotals([{ class_id: 'a', hours: 2 }], [{ class_id: 'a', charge_rate: 50 }]), { hours: 2, charged: 100, teacherPay: 80, schoolShare: 20 });
});

test('uses configured teacher rates and manual totals', () => {
  const lines = [{ class_id: 'a', hours: 1.5 }, { class_id: null, hours: .5 }];
  assert.equal(paymentTotals(lines, [{ class_id: 'a', charge_rate: 60, teacher_rate: 30 }], 20).teacherPay, 55);
  assert.equal(paymentTotals(lines, [], 20, { teacher_total: 70, school_total: 10 }).schoolShare, 10);
});

test('applies the 80% class split per line while retaining the profile rate for extra hours', () => {
  const lines = [{ class_id: 'a', hours: 2 }, { class_id: 'b', hours: 1 }, { class_id: null, hours: .5 }];
  const rates = [{ class_id: 'a', charge_rate: 100 }, { class_id: 'b', charge_rate: 50, teacher_rate: 45 }];
  assert.equal(paymentTotals(lines, rates, 20).teacherPay, 215);
});

test('converts and displays USD payment snapshots in both currencies', () => {
  assert.equal(convertUsdToMxn(100, 18.7654), 1876.54);
  assert.equal(convertUsdToMxn(100, 0), null);
  assert.deepEqual(paymentDisplay({ payment_currency: 'USD', payment_amount: 100, payment_amount_mxn: 1876.54 }), { primary: '$100.00 USD', equivalent: '$1,876.54 MXN' });
  assert.deepEqual(paymentDisplay({ payment_currency: 'MXN', payment_amount: 1876.54 }), { primary: '$1,876.54 MXN', equivalent: null });
});

test('displays a captured zero-value USD equivalent instead of hiding it', () => {
  assert.deepEqual(paymentDisplay({ payment_currency: 'USD', payment_amount: 0, payment_amount_mxn: 0 }), {
    primary: '$0.00 USD', equivalent: '$0.00 MXN'
  });
});

test('requires explicit currencies and validates MXN/USD snapshots', () => {
  assert.throws(() => money(2));
  const base={studentId:'s',classId:'c',amount:'100.01',quantity:2};
  assert.equal(validatePayment({...base,currency:'MXN'}).valid,true);
  assert.equal(validatePayment({...base,currency:'USD'}).valid,false);
  assert.equal(validatePayment({...base,currency:'USD',rate:18.8,source:'Manual',fetchedAt:'2026-01-01T00:00:00Z'}).valid,true);
  assert.equal(validatePayment({...base,currency:'MXN',quantity:1.5}).valid,true);
});
test('suggests a payment total from covered hours while preserving money precision',()=>{
  assert.equal(suggestedPaymentAmount(2.5,140),350);
  assert.equal(suggestedPaymentAmount(.75,18.99),14.24);
  assert.equal(suggestedPaymentAmount('',140),null);
});
test('clears stale snapshots and rounds decimal conversion',()=>{
  assert.deepEqual(clearExchangeSnapshot('MXN',{rate:18}),{rate:null,source:null,fetchedAt:null});
  assert.equal(convertUsdToMxn(.1,18.85),1.89);
});
test('summaries use payment month and preserve original USD totals',()=>{
 const rows=[{transaction_type:'Payment',payment_date:'2026-07-01',payment_currency:'USD',payment_amount:10,payment_amount_mxn:188,quantity:2},{transaction_type:'Payment',payment_date:'2026-06-30',payment_currency:'MXN',payment_amount:100,quantity:1}];
 assert.deepEqual(monthlyPaymentSummary(rows,new Date('2026-07-31T12:00:00Z')),{mxn:0,usd:10,mxnValue:188,count:1,classes:2});
 assert.equal(filterPayments(rows,{currency:'USD'}).length,1);
});
test('historical null currency displays safely as MXN only with an amount',()=>{
 assert.equal(paymentDisplay({payment_currency:null,payment_amount:20}).primary,'$20.00 MXN');
 assert.equal(paymentDisplay({payment_currency:null,payment_amount:null}).primary,'Currency unavailable');
});

test('class rates default missing and null currencies to MXN but retain explicit USD', () => {
  assert.equal(rateCurrency(), 'MXN');
  assert.equal(rateCurrency(null), 'MXN');
  assert.equal(rateCurrency('USD'), 'USD');
  assert.equal(formatRateAmount(140, null), '$140.00 MXN');
  assert.equal(formatRateAmount(18, 'USD'), '$18.00 USD');
});

test('rate save payload uses the selected shared currency without converting amounts', () => {
  assert.deepEqual(buildRateSave({ chargeRate: '18', teacherRate: '14.40', manual: true, currencyCode: 'USD' }), { charge_rate: 18, teacher_rate: 14.4, currency_code: 'USD' });
  assert.deepEqual(buildRateSave({ chargeRate: '18', teacherRate: '14.40', manual: false, currencyCode: 'MXN' }), { charge_rate: 18, teacher_rate: null, currency_code: 'MXN' });
  assert.throws(() => buildRateSave({ chargeRate: 10, manual: false, currencyCode: 'EUR' }), /MXN or USD/);
});

test('class balance traffic lights use green above five, orange from one to five, and red at zero or below', () => {
  for (const balance of [6, 7, 10]) assert.equal(rateBalanceStatus(balance).key, 'healthy');
  for (const balance of [1, 2, 3, 4, 5]) assert.equal(rateBalanceStatus(balance).key, 'low');
  for (const balance of [0, -1, -4]) assert.equal(rateBalanceStatus(balance).key, 'critical');
});
