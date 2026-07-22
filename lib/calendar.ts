export interface CalendarCell {
  date: Date;
  key: string;
  inMonth: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function dateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Builds a Monday-start month grid as an array of 7-day weeks. `monthIndex`
 * is 0-based (0 = January). Dates are plain calendar dates (not timezone
 * aware) - they represent day cells, matched against Hobart-local due dates
 * via lib/dates.ts's dateKeyInAppTimezone. */
export function buildMonthGrid(year: number, monthIndex: number): CalendarCell[][] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const mondayIndexedDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = mondayIndexedDay; i > 0; i--) {
    const d = new Date(year, monthIndex, 1 - i);
    cells.push({ date: d, key: dateKeyFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate()), inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    cells.push({ date: d, key: dateKeyFromParts(year, monthIndex + 1, day), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: d, key: dateKeyFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate()), inMonth: false });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
}

export function shiftMonth(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const total = year * 12 + monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}
