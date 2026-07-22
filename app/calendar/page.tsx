import CalendarGrid from "@/components/CalendarGrid";
import CourseDot from "@/components/CourseDot";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getDeadlinesWithCourse } from "@/lib/data/deadlines";
import { APP_TIMEZONE } from "@/lib/dates";

function currentYearMonthInHobart(): { year: number; monthIndex: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value ?? new Date().getFullYear());
  const month = Number(parts.find((p) => p.type === "month")?.value ?? new Date().getMonth() + 1);
  return { year, monthIndex: month - 1 };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const fallback = currentYearMonthInHobart();

  let year = fallback.year;
  let monthIndex = fallback.monthIndex;
  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    year = y;
    monthIndex = m - 1;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Calendar</h1>
        <SupabaseNotConfigured />
      </div>
    );
  }

  const all = await getDeadlinesWithCourse();
  const undated = all.filter((d) => !d.due_at && d.due_date_note && d.status === "todo");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Calendar</h1>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
        <CalendarGrid year={year} monthIndex={monthIndex} deadlines={all} />
      </div>

      {undated.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Undated (exact date/time TBC)
          </h2>
          <ul className="space-y-2">
            {undated.map((d) => (
              <li
                key={d.id}
                className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <CourseDot color={d.course.color} className="mt-1" />
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">
                    {d.course.code}: {d.title}
                  </p>
                  <p className="text-amber-700 dark:text-amber-400">{d.due_date_note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
