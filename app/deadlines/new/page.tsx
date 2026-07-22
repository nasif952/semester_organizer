import AddDeadlineForm from "@/components/AddDeadlineForm";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCourses } from "@/lib/data/courses";

export default async function NewDeadlinePage() {
  const courses = isSupabaseConfigured ? await getCourses() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Add a deadline</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manually add a deadline that isn&apos;t in the schedule yet.
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <SupabaseNotConfigured />
      ) : (
        <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <AddDeadlineForm courses={courses} />
        </div>
      )}
    </div>
  );
}
