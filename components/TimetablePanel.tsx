"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/useNow";
import { APP_TIMEZONE } from "@/lib/dates";
import {
  COURSE_COLORS,
  TIMETABLE,
  dayName,
  sessionsForDay,
  sessionTypeLabel,
  type ClassSession,
} from "@/lib/timetable";

const SESSION_TYPE_BG: Record<ClassSession["type"], string> = {
  lecture: "bg-indigo-50 dark:bg-indigo-950/40",
  tutorial: "bg-emerald-50 dark:bg-emerald-950/40",
  workshop: "bg-violet-50 dark:bg-violet-950/40",
  practical: "bg-amber-50 dark:bg-amber-950/40",
};
const SESSION_TYPE_TEXT: Record<ClassSession["type"], string> = {
  lecture: "text-indigo-700 dark:text-indigo-300",
  tutorial: "text-emerald-700 dark:text-emerald-300",
  workshop: "text-violet-700 dark:text-violet-300",
  practical: "text-amber-700 dark:text-amber-300",
};

function hobartDayOfWeek(date: Date): number {
  // 0=Sun,1=Mon,...,6=Sat in JS; we want 0=Mon,4=Fri
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const map: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  return map[weekday] ?? -1;
}

function hobartHHMM(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function SessionCard({
  session,
  nowHHMM,
  isToday,
}: {
  session: ClassSession;
  nowHHMM: string | null;
  isToday: boolean;
}) {
  const color = COURSE_COLORS[session.courseCode] ?? "#6366f1";

  const isActive =
    isToday &&
    nowHHMM !== null &&
    session.startTime !== null &&
    session.endTime !== null &&
    nowHHMM >= session.startTime &&
    nowHHMM < session.endTime;

  const isPast =
    isToday &&
    nowHHMM !== null &&
    session.endTime !== null &&
    nowHHMM >= session.endTime;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 transition-all ${
        isActive
          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
          : isPast
          ? "border-zinc-100 opacity-50 dark:border-zinc-800"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      {/* Course color stripe */}
      <div
        className="mt-0.5 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-xs font-bold"
            style={{ color }}
          >
            {session.courseCode}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SESSION_TYPE_BG[session.type]} ${SESSION_TYPE_TEXT[session.type]}`}
          >
            {sessionTypeLabel(session.type)}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Now
            </span>
          )}
        </div>

        <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {session.label}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {session.startTime && session.endTime
              ? `${session.startTime} – ${session.endTime}`
              : session.startTime
              ? `From ${session.startTime}`
              : "Time — check MyTimetable"}
          </span>
          <span className={`flex items-center gap-1 ${session.online ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`}>
            {session.online ? "🌐" : "📍"} {session.location}
          </span>
        </div>
      </div>
    </div>
  );
}

const DAYS: Array<{ label: string; short: string; idx: number }> = [
  { label: "Monday", short: "Mon", idx: 0 },
  { label: "Tuesday", short: "Tue", idx: 1 },
  { label: "Wednesday", short: "Wed", idx: 2 },
  { label: "Thursday", short: "Thu", idx: 3 },
  { label: "Friday", short: "Fri", idx: 4 },
];

export default function TimetablePanel() {
  const now = useNow();
  const todayIdx = now ? hobartDayOfWeek(now) : -1;
  const nowHHMM = now ? hobartHHMM(now) : null;

  // Show today if it's a weekday, otherwise Monday
  const defaultTab = todayIdx >= 0 && todayIdx <= 4 ? todayIdx : 0;
  const [activeDay, setActiveDay] = useState<number>(defaultTab);

  const sessionsToday = useMemo(() => sessionsForDay(todayIdx), [todayIdx]);
  const sessionsSelected = useMemo(() => sessionsForDay(activeDay), [activeDay]);

  const isWeekday = todayIdx >= 0 && todayIdx <= 4;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Classes</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {isWeekday
              ? `Today (${dayName(todayIdx)}) — ${sessionsToday.length} session${sessionsToday.length !== 1 ? "s" : ""}`
              : "Weekend — no classes"}
          </p>
        </div>
        <a
          href="https://mytimetable.utas.edu.au"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          MyTimetable ↗
        </a>
      </div>

      {/* Day tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        {DAYS.map((d) => {
          const count = sessionsForDay(d.idx).length;
          const isToday = d.idx === todayIdx;
          return (
            <button
              key={d.idx}
              type="button"
              onClick={() => setActiveDay(d.idx)}
              className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition-colors ${
                activeDay === d.idx
                  ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span>{d.short}</span>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  isToday
                    ? "bg-indigo-500 text-white"
                    : count > 0
                    ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              >
                {count > 0 ? count : "·"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Session list */}
      <div className="space-y-2 p-4">
        {sessionsSelected.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">No classes on {dayName(activeDay)}.</p>
        ) : (
          sessionsSelected.map((session, i) => (
            <SessionCard
              key={i}
              session={session}
              nowHHMM={nowHHMM}
              isToday={activeDay === todayIdx}
            />
          ))
        )}
      </div>

      {/* Footer note for unknown times */}
      {sessionsSelected.some((s) => !s.startTime) && (
        <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          ⚠ Some times are not confirmed — update{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">lib/timetable.ts</code>{" "}
          with exact times from MyTimetable.
        </p>
      )}
    </div>
  );
}
