import { DailyCount } from "../../src";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Conta por dia de criação (UTC) dentro da janela de `days` dias terminada hoje.
export function countByCreatedDay(
  items: { createdAt: Date }[],
  days: number,
  now: Date = new Date(),
): DailyCount[] {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (days - 1) * DAY_IN_MS;
  const counts = new Map<string, number>();

  for (const item of items) {
    if (item.createdAt.getTime() < start) continue;

    const date = item.createdAt.toISOString().slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return Array.from(counts, ([date, count]) => ({ date, count }));
}
