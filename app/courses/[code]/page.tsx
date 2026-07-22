import { notFound } from "next/navigation";
import Link from "next/link";
import CourseDot from "@/components/CourseDot";
import DeadlineCard from "@/components/DeadlineCard";
import { getCourseByCode } from "@/lib/data/courses";
import { getCourseDocuments } from "@/lib/data/courseDocuments";
import { getDeadlinesWithCourse } from "@/lib/data/deadlines";
const KIND_LABEL: Record<string, string> = {
  outline: "Unit outline",
  schedule: "Study schedule",
  rubric: "Rubric",
  other: "Document",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const course = await getCourseByCode(code);

  if (!course) {
    notFound();
  }

  const [docs, allDeadlines] = await Promise.all([
    getCourseDocuments(course.id),
    getDeadlinesWithCourse(),
  ]);

  const deadlines = allDeadlines.filter((d) => d.course_id === course.id);
  const nowMs = new Date().getTime();
  const todo = deadlines.filter(
    (d) => d.status !== "done" && (!d.due_at || new Date(d.due_at).getTime() >= nowMs)
  );
  const overdue = deadlines.filter(
    (d) => d.status !== "done" && d.due_at && new Date(d.due_at).getTime() < nowMs
  );
  const done = deadlines.filter((d) => d.status === "done");

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Courses
        </Link>
      </nav>

      {/* Course header */}
      <div className="flex items-start gap-3">
        <CourseDot color={course.color} className="mt-2" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{course.code}</h1>
          <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">{course.name}</p>
          <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">{course.semester}</p>
        </div>
      </div>

      {/* Outline text */}
      {course.outline_text && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            About this unit
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {course.outline_text}
          </p>
        </section>
      )}

      {/* Course documents (outline, schedule, etc.) */}
      {docs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Documents
          </h2>
          {docs.map((doc) => (
            <details
              key={doc.id}
              className="group rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
                {KIND_LABEL[doc.kind] ?? doc.kind}
                <span className="ml-2 text-zinc-400 transition-transform group-open:rotate-90">›</span>
              </summary>
              <div className="border-t border-zinc-100 px-6 pb-6 pt-4 dark:border-zinc-800">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {doc.raw_text}
                </pre>
              </div>
            </details>
          ))}
        </section>
      )}

      {/* Deadlines for this course */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Deadlines
        </h2>

        {overdue.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              Overdue
            </h3>
            {overdue.map((d) => (
              <DeadlineCard key={d.id} deadline={d} />
            ))}
          </div>
        )}

        {todo.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Upcoming
            </h3>
            {todo.map((d) => (
              <DeadlineCard key={d.id} deadline={d} />
            ))}
          </div>
        )}

        {done.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
              ▸ Completed ({done.length})
            </summary>
            <div className="mt-3 space-y-3">
              {done.map((d) => (
                <DeadlineCard key={d.id} deadline={d} />
              ))}
            </div>
          </details>
        )}

        {deadlines.length === 0 && (
          <p className="text-sm text-zinc-400">No deadlines found for this course.</p>
        )}
      </section>
    </div>
  );
}
