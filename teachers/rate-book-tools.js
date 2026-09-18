const normalize = value => String(value ?? '').trim().toLocaleLowerCase();

export function rateBookRowMatches(row, { search = '', showInactive = false, balance = '' } = {}) {
  if (!showInactive && normalize(row.status) !== 'active') return false;
  if (!normalize(row.search).includes(normalize(search))) return false;
  return !balance || row.balanceStatus === balance;
}

export function compareRateBookRows(a, b, key, direction = 'asc') {
  const left = key === 'balance' ? Number(a[key]) : normalize(a[key]);
  const right = key === 'balance' ? Number(b[key]) : normalize(b[key]);
  const result = key === 'balance'
    ? left - right
    : left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'desc' ? -result : result;
}
