import Link from "next/link";
import DeadlineCard from "@/components/DeadlineCard";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getUpcomingDeadlines } from "@/lib/data/deadlines";

const UPCOMING_LIMIT = 8;

export default async function DashboardPage() {
  const upcoming = isSupabaseConfigured ? await getUpcomingDeadlines(UPCOMING_LIMIT) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Next up</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your next {UPCOMING_LIMIT} deadlines across all courses, sorted by due date (Australia/Hobart).
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <SupabaseNotConfigured />
      ) : upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Nothing upcoming. Add a deadline to get started.
          </p>
          <Link
            href="/deadlines/new"
            className="mt-3 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add a deadline
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((deadline) => (
            <DeadlineCard key={deadline.id} deadline={deadline} />
          ))}
        </div>
      )}
    </div>
  );
}
