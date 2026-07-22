"use client";

import { useNow } from "@/lib/useNow";
import { getCountdown } from "@/lib/dates";

export default function CountdownBadge({ dueAt }: { dueAt: string }) {
  const now = useNow();

  if (!now) {
    // Avoid a hydration mismatch: render nothing until mounted client-side.
    return <span className="text-xs text-zinc-400">&nbsp;</span>;
  }

  const countdown = getCountdown(dueAt, now);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        countdown.overdue
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : countdown.totalMs < 24 * 60 * 60 * 1000
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      {countdown.label}
    </span>
  );
}
