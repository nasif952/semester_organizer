import Link from "next/link";
import CourseDot from "@/components/CourseDot";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCourses } from "@/lib/data/courses";
import { getDeadlinesWithCourse } from "@/lib/data/deadlines";

export default async function CoursesPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Courses</h1>
        <SupabaseNotConfigured />
      </div>
    );
  }

  const [courses, allDeadlines] = await Promise.all([
    getCourses(),
    getDeadlinesWithCourse(),
  ]);

  const statsByCourse = new Map(
    courses.map((c) => {
      const deadlines = allDeadlines.filter((d) => d.course_id === c.id);
      const total = deadlines.length;
      const done = deadlines.filter((d) => d.status === "done").length;
      const nowMs = new Date().getTime();
      const overdue = deadlines.filter(
        (d) => d.status !== "done" && d.due_at && new Date(d.due_at).getTime() < nowMs
      ).length;
      return [c.id, { total, done, overdue }];
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Courses</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Unit outlines, schedules, and deadline summaries for each course.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const stats = statsByCourse.get(course.id) ?? { total: 0, done: 0, overdue: 0 };
          const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

          return (
            <Link
              key={course.id}
              href={`/courses/${course.code}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start gap-3">
                <CourseDot color={course.color} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
                    {course.code}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {course.name}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>{stats.done}/{stats.total} done</span>
                  {stats.overdue > 0 && (
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {stats.overdue} overdue
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
