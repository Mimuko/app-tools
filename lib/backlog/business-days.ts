const TZ = 'Asia/Tokyo';

/** 日付を Asia/Tokyo の年月日に正規化 */
function toTokyoDateParts(d: Date): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, day] = fmt.format(d).split('-').map(Number);
  return { y, m, day };
}

function toUtcDate(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m - 1, day));
}

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * from（含む）から to（含む）までの営業日数。
 * 土日のみ除外（祝日カレンダーは今後拡張）。
 */
export function businessDaysBetween(from: Date, to: Date): number {
  const a = toTokyoDateParts(from);
  const b = toTokyoDateParts(to);
  let cur = toUtcDate(a.y, a.m, a.day);
  const end = toUtcDate(b.y, b.m, b.day);
  if (cur > end) return 0;

  let count = 0;
  while (cur <= end) {
    if (!isWeekend(cur)) count++;
    cur = new Date(cur.getTime() + 86400000);
  }
  return Math.max(0, count - 1);
}

/** 指定日時から現在（観測時点）までの経過営業日 */
export function businessDaysSince(isoDate: string, observedAt: Date): number {
  const from = new Date(isoDate);
  if (Number.isNaN(from.getTime())) return 0;
  return businessDaysBetween(from, observedAt);
}
