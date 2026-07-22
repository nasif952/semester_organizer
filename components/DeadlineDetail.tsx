"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import CourseDot from "@/components/CourseDot";
import StatusToggleButton from "@/components/StatusToggleButton";
import CommentsSection from "@/components/CommentsSection";
import CountdownBadge from "@/components/CountdownBadge";
import EditDeadlineForm from "@/components/EditDeadlineForm";
import { deleteDeadlineAction } from "@/app/actions";
import { formatDueAt } from "@/lib/dates";
import type { Comment, DeadlineWithCourse } from "@/lib/types";

const TYPE_LABEL: Record<DeadlineWithCourse["type"], string> = {
  quiz: "Quiz",
  assignment: "Assignment",
  exam: "Exam",
  presentation: "Presentation",
  other: "Other",
};

export default function DeadlineDetail({
  deadline,
  comments,
}: {
  deadline: DeadlineWithCourse;
  comments: Comment[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const isDone = deadline.status === "done";
  const isOverdue =
    !isDone && deadline.due_at && new Date(deadline.due_at).getTime() < new Date().getTime();

  function handleDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteDeadlineAction(deadline.id);
      } catch {
        // deleteDeadlineAction redirects on success; an error won't redirect
        setDeleteError("Failed to delete. Please try again.");
        setConfirmDelete(false);
      }
    });
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit deadline</h2>
        <EditDeadlineForm deadline={deadline} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div
        className={`rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${
          isDone ? "opacity-70" : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Course + type row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <CourseDot color={deadline.course.color} />
              <Link
                href={`/courses/${deadline.course.code}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {deadline.course.code}
              </Link>
              <span aria-hidden>·</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {TYPE_LABEL[deadline.type]}
              </span>
              {deadline.weight_percent != null && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {deadline.weight_percent}%
                </span>
              )}
              {isOverdue && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-400">
                  Overdue
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className={`mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50 ${
                isDone ? "line-through" : ""
              }`}
            >
              {deadline.title}
            </h1>

            {/* Due date */}
            {deadline.due_at ? (
              <p
                className={`mt-1 text-sm ${
                  isOverdue
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Due {formatDueAt(deadline.due_at)}
              </p>
            ) : deadline.due_date_note ? (
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                {deadline.due_date_note}
              </p>
            ) : null}
          </div>

          {/* Right column: countdown + toggle */}
          <div className="flex flex-col items-end gap-3">
            {!isDone && deadline.due_at ? (
              <CountdownBadge dueAt={deadline.due_at} />
            ) : null}
            <StatusToggleButton id={deadline.id} status={deadline.status} />
          </div>
        </div>

        {/* Description */}
        {deadline.description && (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {deadline.description}
            </p>
          </div>
        )}

        {/* Edit / Delete actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Edit
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Delete this deadline?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          )}
          {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
        </div>
      </div>

      {/* Rubric card */}
      {deadline.rubric_text && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Rubric / Assessment criteria
          </h2>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {deadline.rubric_text}
          </p>
        </div>
      )}

      {/* Comments card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Notes &amp; comments
        </h2>
        <CommentsSection
          deadlineId={deadline.id}
          initialComments={comments}
          defaultOpen
        />
      </div>
    </div>
  );
}
