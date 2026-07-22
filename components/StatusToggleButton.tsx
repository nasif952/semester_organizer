"use client";

import { useState, useTransition } from "react";
import { toggleDeadlineStatusAction } from "@/app/actions";
import type { DeadlineStatus } from "@/lib/types";

export default function StatusToggleButton({
  id,
  status,
}: {
  id: string;
  status: DeadlineStatus;
}) {
  const [optimisticStatus, setOptimisticStatus] = useState<DeadlineStatus>(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  const isDone = optimisticStatus === "done";

  function handleClick() {
    const next: DeadlineStatus = isDone ? "todo" : "done";
    setOptimisticStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await toggleDeadlineStatusAction(id, next);
      if (result.error) {
        setOptimisticStatus(isDone ? "done" : "todo");
        setError(result.error);
      }
    });
  }

  const label = isDone
    ? hovering ? "↩ Undo" : "✓ Done"
    : "Mark done";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isDone}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`inline-flex min-w-[90px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
          isDone
            ? hovering
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        }`}
      >
        {label}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
