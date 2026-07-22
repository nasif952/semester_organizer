"use client";

import { useRef, useState, useTransition } from "react";
import { addCommentAction, deleteCommentAction } from "@/app/actions";
import { formatDueAt } from "@/lib/dates";
import type { Comment } from "@/lib/types";

export default function CommentsSection({
  deadlineId,
  initialComments,
  defaultOpen = false,
}: {
  deadlineId: string;
  initialComments: Comment[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const result = await addCommentAction(deadlineId, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      setComments((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, deadline_id: deadlineId, body, created_at: new Date().toISOString() },
      ]);
      formRef.current?.reset();
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteCommentAction(commentId, deadlineId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        {open ? "Hide notes" : `Notes (${comments.length})`}
      </button>

      {open ? (
        <div className="mt-2 space-y-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
          {comments.length === 0 ? (
            <p className="text-xs text-zinc-400">No notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="group flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.body}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{formatDueAt(c.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={isPending || c.id.startsWith("temp-")}
                    className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 disabled:cursor-not-allowed dark:text-zinc-600 dark:hover:text-red-400"
                    aria-label="Delete note"
                    title="Delete note"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form ref={formRef} action={handleSubmit} className="flex items-start gap-2">
            <textarea
              name="body"
              rows={2}
              placeholder="Add a note…"
              required
              className="flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-800"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add
            </button>
          </form>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
