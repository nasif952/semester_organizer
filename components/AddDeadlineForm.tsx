"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDeadlineAction } from "@/app/actions";
import { DEADLINE_TYPES, type Course } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-800";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function AddDeadlineForm({ courses }: { courses: Course[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createDeadlineAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/deadlines");
    });
  }

  if (courses.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No courses found yet. Connect Supabase and run the seed script first.
      </p>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Course</label>
        <select
          name="course_id"
          required
          defaultValue={courses[0]?.id}
          className={inputClass}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Title</label>
        <input
          name="title"
          required
          placeholder="e.g. Assignment 2 (Written)"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" defaultValue="assignment" className={inputClass}>
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
            placeholder="e.g. 25"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Due date/time</label>
        <input name="due_at" type="datetime-local" className={inputClass} />
        <p className="mt-1 text-xs text-zinc-400">
          Enter the time exactly as shown in Mylo — interpreted as{" "}
          <strong>Australia/Hobart (Tasmania) local time</strong>. Leave blank if the exact
          date/time isn&apos;t known yet and use the note field below instead.
        </p>
      </div>

      <div>
        <label className={labelClass}>Due date note (optional)</label>
        <input
          name="due_date_note"
          placeholder="e.g. Week 4 tutorial, exact time TBC on Mylo"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          name="description"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Rubric / assessment criteria (optional)</label>
        <textarea
          name="rubric_text"
          rows={4}
          placeholder="Paste rubric criteria, marking guide, or any assessment notes here…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "Adding…" : "Add deadline"}
      </button>
    </form>
  );
}
