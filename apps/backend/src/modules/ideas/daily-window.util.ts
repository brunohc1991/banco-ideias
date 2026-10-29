const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Início (00:00 UTC) do primeiro dia de uma janela de `days` dias que termina hoje.
export function startOfUtcWindow(days: number, now: Date = new Date()): Date {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return new Date(today - (days - 1) * DAY_IN_MS);
}
