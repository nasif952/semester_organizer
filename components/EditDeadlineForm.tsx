"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDeadlineAction } from "@/app/actions";
import { toHobartDateTimeLocal } from "@/lib/dates";
import { DEADLINE_TYPES, type DeadlineWithCourse } from "@/lib/types";

export default function EditDeadlineForm({
  deadline,
  onCancel,
}: {
  deadline: DeadlineWithCourse;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultDueAt = deadline.due_at ? toHobartDateTimeLocal(deadline.due_at) : "";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateDeadlineAction(deadline.id, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onCancel();
    });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-800";
  const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input
          name="title"
          required
          defaultValue={deadline.title}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" defaultValue={deadline.type} className={inputClass}>
            {DEADLINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Weight (%)</label>
          <input
            name="weight_percent"
            type="number"
            step="0.1"
            min="0"
            max="100"
            defaultValue={deadline.weight_percent ?? ""}
            placeholder="e.g. 25"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Due date/time (Australia/Hobart)</label>
        <input
          name="due_at"
          type="datetime-local"
          defaultValue={defaultDueAt}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Enter time as it appears in Mylo (Hobart/Tasmania local time). Leave blank and use the note field if the exact time isn&apos;t known.
        </p>
      </div>

      <div>
        <label className={labelClass}>Due date note (optional)</label>
        <input
          name="due_date_note"
          defaultValue={deadline.due_date_note ?? ""}
          placeholder="e.g. Week 4 tutorial, exact time TBC on Mylo"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={deadline.description ?? ""}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Rubric / assessment criteria (optional)</label>
        <textarea
          name="rubric_text"
          rows={5}
          defaultValue={deadline.rubric_text ?? ""}
          placeholder="Paste rubric criteria, marking guide, or any assessment notes here…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
