export function classesUsed(classId, sessions = []) {
  return sessions.filter(session => session.class_id === classId && ['Completed', 'Make-up class'].includes(session.status)).length;
}

export function classCreditSummary(classId, transactions = [], sessions = []) {
  const added = transactions
    .filter(transaction => transaction.class_id === classId)
    .reduce((total, transaction) => total + (Number(transaction.quantity) || 0), 0);
  const used = classesUsed(classId, sessions);
  return { added, used, remaining: added - used };
}
