"use client";

import Link from "next/link";
import { DEADLINE_TYPES, type DeadlineStatus, type DeadlineType } from "@/lib/types";

function buildHref(current: { status: string; type: string }, next: Partial<{ status: string; type: string }>) {
  const merged = { ...current, ...next };
  const params = new URLSearchParams();
  if (merged.status && merged.status !== "all") params.set("status", merged.status);
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  const qs = params.toString();
  return qs ? `/deadlines?${qs}` : "/deadlines";
}

export default function FilterBar({
  status,
  type,
}: {
  status: DeadlineStatus | "all";
  type: DeadlineType | "all";
}) {
  const current = { status, type };
  const statusOptions: Array<DeadlineStatus | "all"> = ["all", "todo", "done"];

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
        {statusOptions.map((s) => (
          <Link
            key={s}
            href={buildHref(current, { status: s })}
            className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
              status === s
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <select
        defaultValue={type}
        onChange={(e) => {
          window.location.href = buildHref(current, { type: e.target.value });
        }}
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm capitalize focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="all">All types</option>
        {DEADLINE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
