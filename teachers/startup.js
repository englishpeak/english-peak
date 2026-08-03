export const STARTUP_TIMEOUT_MS = 12_000;

export function withTimeout(promise, timeoutMs = STARTUP_TIMEOUT_MS, message = 'Academic Management took too long to respond.') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
