import DeadlineCard from "@/components/DeadlineCard";
import FilterBar from "@/components/FilterBar";
import CourseDot from "@/components/CourseDot";
import { SupabaseNotConfigured } from "@/components/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase";
import { filterDeadlines, getDeadlinesWithCourse } from "@/lib/data/deadlines";
import { getCourses } from "@/lib/data/courses";
import { getCommentsForDeadline } from "@/lib/data/comments";
import type { Comment, DeadlineStatus, DeadlineType, DeadlineWithCourse } from "@/lib/types";

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; course?: string; search?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status as DeadlineStatus | "all") ?? "all";
  const type = (params.type as DeadlineType | "all") ?? "all";
  const courseCode = params.course ?? "all";
  const search = params.search ?? "";

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Deadlines</h1>
        <SupabaseNotConfigured />
      </div>
    );
  }

  const [all, courses] = await Promise.all([getDeadlinesWithCourse(), getCourses()]);
  const filtered = filterDeadlines(all, { status, type, courseCode, search });

  const commentsByDeadline = new Map<string, Comment[]>();
  await Promise.all(
    filtered.map(async (d) => {
      commentsByDeadline.set(d.id, await getCommentsForDeadline(d.id));
    })
  );

  const grouped = groupByCourse(filtered);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Deadlines</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Grouped by course. Toggle done/undone and leave notes for yourself.
        </p>
      </div>

      <FilterBar status={status} type={type} courseCode={courseCode} search={search} courses={courses} />

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500">No deadlines match these filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ course, deadlines }) => (
            <section key={course.id} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <CourseDot color={course.color} />
                {course.code} — {course.name}
              </h2>
              <div className="space-y-3">
                {deadlines.map((deadline) => (
                  <DeadlineCard
                    key={deadline.id}
                    deadline={deadline}
                    comments={commentsByDeadline.get(deadline.id) ?? []}
                    showComments
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByCourse(deadlines: DeadlineWithCourse[]) {
  const map = new Map<string, { course: DeadlineWithCourse["course"]; deadlines: DeadlineWithCourse[] }>();
  for (const d of deadlines) {
    const existing = map.get(d.course_id);
    if (existing) {
      existing.deadlines.push(d);
    } else {
      map.set(d.course_id, { course: d.course, deadlines: [d] });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.course.code.localeCompare(b.course.code));
}
