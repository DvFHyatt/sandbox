export function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export function calculateTarget(rangeStart: Date, rangeEnd: Date): number {
  const s = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), rangeStart.getUTCDate()));
  const e = new Date(Date.UTC(rangeEnd.getUTCFullYear(), rangeEnd.getUTCMonth(), rangeEnd.getUTCDate()));
  if (e < s) throw new Error('Invalid range');

  let cursor = new Date(s);
  let expected = 0;
  while (cursor <= e) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const monthEnd = new Date(Date.UTC(y, m, 0));
    const segmentEnd = monthEnd < e ? monthEnd : e;
    const overlap = Math.floor((segmentEnd.getTime() - cursor.getTime()) / 86400000) + 1;
    expected += (20 * overlap) / daysInMonth(y, m);
    cursor = new Date(Date.UTC(y, m, 1));
  }
  return Math.ceil(expected);
}

export function ojtDistinctDays(dates: string[]): number {
  return new Set(dates).size;
}

export function isCompliant(ojtDates: string[], rangeStart: Date, rangeEnd: Date): boolean {
  return ojtDistinctDays(ojtDates) >= calculateTarget(rangeStart, rangeEnd);
}
