import Link from "next/link";
import DeadlineCard from "@/components/DeadlineCard";
import TimetablePanel from "@/components/TimetablePanel";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getUpcomingDeadlines } from "@/lib/data/deadlines";

const UPCOMING_LIMIT = 10;

export default async function DashboardPage() {
  const all = isSupabaseConfigured ? await getUpcomingDeadlines(UPCOMING_LIMIT) : [];

  const nowMs = new Date().getTime();
  const overdue = all.filter((d) => d.due_at && new Date(d.due_at).getTime() < nowMs);
  const upcoming = all.filter((d) => !d.due_at || new Date(d.due_at).getTime() >= nowMs);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your deadlines and class schedule (Australia/Hobart time).
        </p>
      </div>

      {/* Timetable panel — always shown */}
      <TimetablePanel />

      {!isSupabaseConfigured ? (
        <SupabaseNotConfigured />
      ) : all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Nothing to show. Add a deadline to get started.
          </p>
          <Link
            href="/deadlines/new"
            className="mt-3 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add a deadline
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Overdue — action needed
              </h2>
              <div className="space-y-3">
                {overdue.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Next up
              </h2>
              <div className="space-y-3">
                {upcoming.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
