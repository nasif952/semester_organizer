import Link from "next/link";
import CourseDot from "@/components/CourseDot";
import { buildMonthGrid, monthLabel, shiftMonth } from "@/lib/calendar";
import { dateKeyInAppTimezone } from "@/lib/dates";
import type { DeadlineWithCourse } from "@/lib/types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({
  year,
  monthIndex,
  deadlines,
}: {
  year: number;
  monthIndex: number;
  deadlines: DeadlineWithCourse[];
}) {
  const weeks = buildMonthGrid(year, monthIndex);

  const byDate = new Map<string, DeadlineWithCourse[]>();
  for (const d of deadlines) {
    if (!d.due_at) continue;
    const key = dateKeyInAppTimezone(d.due_at);
    const list = byDate.get(key) ?? [];
    list.push(d);
    byDate.set(key, list);
  }

  const todayKey = dateKeyInAppTimezone(new Date());
  const prev = shiftMonth(year, monthIndex, -1);
  const next = shiftMonth(year, monthIndex, 1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/calendar?month=${prev.year}-${String(prev.monthIndex + 1).padStart(2, "0")}`}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Prev
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {monthLabel(year, monthIndex)}
        </h2>
        <Link
          href={`/calendar?month=${next.year}-${String(next.monthIndex + 1).padStart(2, "0")}`}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((cell) => {
          const dayDeadlines = byDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          return (
            <div
              key={cell.key}
              className={`min-h-20 rounded-lg border p-1.5 text-xs sm:min-h-24 ${
                cell.inMonth
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                  : "border-transparent bg-zinc-50 text-zinc-400 dark:bg-zinc-900/40"
              } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
            >
              <div className={`text-right font-medium ${cell.inMonth ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}`}>
                {cell.date.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayDeadlines.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    title={`${d.course.code}: ${d.title}`}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5"
                    style={{ backgroundColor: `${d.course.color}1a` }}
                  >
                    <CourseDot color={d.course.color} />
                    <span className="truncate text-[11px] text-zinc-700 dark:text-zinc-200">{d.title}</span>
                  </div>
                ))}
                {dayDeadlines.length > 3 ? (
                  <div className="text-[11px] text-zinc-400">+{dayDeadlines.length - 3} more</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
