import { startOfUtcWindow } from './daily-window.util';

describe('startOfUtcWindow', () => {
  it('devolve 00:00 UTC do primeiro dia da janela', () => {
    const now = new Date('2026-10-28T23:30:00Z');

    expect(startOfUtcWindow(7, now).toISOString()).toBe('2026-10-22T00:00:00.000Z');
    expect(startOfUtcWindow(1, now).toISOString()).toBe('2026-10-28T00:00:00.000Z');
  });

  it('usa a data atual por padrao', () => {
    const start = startOfUtcWindow(7);

    expect(start.getUTCHours()).toBe(0);
    expect(start.getTime()).toBeLessThan(Date.now());
  });
});
