import Link from "next/link";
import CountdownBadge from "@/components/CountdownBadge";
import CourseDot from "@/components/CourseDot";
import StatusToggleButton from "@/components/StatusToggleButton";
import CommentsSection from "@/components/CommentsSection";
import { formatDueAt } from "@/lib/dates";
import type { Comment, DeadlineWithCourse } from "@/lib/types";

const TYPE_LABEL: Record<DeadlineWithCourse["type"], string> = {
  quiz: "Quiz",
  assignment: "Assignment",
  exam: "Exam",
  presentation: "Presentation",
  other: "Other",
};

export default function DeadlineCard({
  deadline,
  comments = [],
  showComments = false,
}: {
  deadline: DeadlineWithCourse;
  comments?: Comment[];
  showComments?: boolean;
}) {
  const isDone = deadline.status === "done";

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <CourseDot color={deadline.course.color} />
            <span>{deadline.course.code}</span>
            <span aria-hidden>·</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {TYPE_LABEL[deadline.type]}
            </span>
            {deadline.weight_percent != null ? (
              <span>{deadline.weight_percent}%</span>
            ) : null}
          </div>

          <Link
            href={`/deadlines/${deadline.id}`}
            className={`mt-1 block font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400 ${isDone ? "line-through" : ""}`}
          >
            {deadline.title}
          </Link>

          {deadline.due_at ? (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Due {formatDueAt(deadline.due_at)}
            </p>
          ) : deadline.due_date_note ? (
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
              {deadline.due_date_note}
            </p>
          ) : null}

          {deadline.description ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{deadline.description}</p>
          ) : null}

          {showComments ? (
            <CommentsSection deadlineId={deadline.id} initialComments={comments} />
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isDone && deadline.due_at ? <CountdownBadge dueAt={deadline.due_at} /> : null}
          <StatusToggleButton id={deadline.id} status={deadline.status} />
        </div>
      </div>
    </div>
  );
}
