"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEADLINE_TYPES, type Course, type DeadlineStatus, type DeadlineType } from "@/lib/types";

function buildHref(current: {
  status: string;
  type: string;
  courseCode: string;
  search: string;
}, next: Partial<{ status: string; type: string; courseCode: string; search: string }>) {
  const merged = { ...current, ...next };
  const params = new URLSearchParams();
  if (merged.status && merged.status !== "all") params.set("status", merged.status);
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  if (merged.courseCode && merged.courseCode !== "all") params.set("course", merged.courseCode);
  if (merged.search && merged.search.trim()) params.set("search", merged.search.trim());
  const qs = params.toString();
  return qs ? `/deadlines?${qs}` : "/deadlines";
}

export default function FilterBar({
  status,
  type,
  courseCode = "all",
  search = "",
  courses = [],
}: {
  status: DeadlineStatus | "all";
  type: DeadlineType | "all";
  courseCode?: string;
  search?: string;
  courses?: Course[];
}) {
  const router = useRouter();
  const current = { status, type, courseCode, search };
  const statusOptions: Array<DeadlineStatus | "all"> = ["all", "todo", "done"];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildHref(current, { search: value }));
    }, 300);
  }

  function handleTypeChange(value: string) {
    router.push(buildHref(current, { type: value }));
  }

  function handleCourseChange(value: string) {
    router.push(buildHref(current, { courseCode: value }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {/* Status pills */}
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

      {/* Type select — router.push for soft nav */}
      <select
        value={type}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm capitalize focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-800"
      >
        <option value="all">All types</option>
        {DEADLINE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Course filter */}
      {courses.length > 0 && (
        <select
          value={courseCode}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-800"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      )}

      {/* Search — uncontrolled, debounced URL update */}
      <input
        key={search}
        type="search"
        defaultValue={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search…"
        className="min-w-0 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600 dark:focus:ring-indigo-800"
      />
    </div>
  );
}
