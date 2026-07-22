export const APP_TIMEZONE = "Australia/Hobart";

/** Convert a datetime-local string (no timezone) entered by the user as
 * Australia/Hobart time into a UTC ISO string for storage.
 * Semester 2 2026 runs in AEST (+10), switching to AEDT (+11) on Oct 4 2026. */
export function parseHobartDateTimeLocal(localStr: string): string | null {
  if (!localStr) return null;
  const aest = new Date(localStr + "+10:00");
  if (aest.getTime() >= new Date("2026-10-04T02:00:00+10:00").getTime()) {
    return new Date(localStr + "+11:00").toISOString();
  }
  return aest.toISOString();
}

/** Convert a UTC ISO string to "YYYY-MM-DDTHH:MM" in Hobart local time,
 * suitable for pre-populating a datetime-local input. */
export function toHobartDateTimeLocal(isoUtc: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(isoUtc));
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const mo = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${y}-${mo}-${d}T${h === "24" ? "00" : h}:${m}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

export function formatDueAt(dueAt: string | null): string {
  if (!dueAt) return "";
  return dateTimeFormatter.format(new Date(dueAt));
}

export function formatDateOnly(iso: string | Date): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTimeOnly(iso: string | Date): string {
  return timeFormatter.format(new Date(iso));
}

/** yyyy-mm-dd for a date, expressed in the app timezone. Useful for grouping
 * deadlines onto calendar day cells regardless of the server's local tz. */
export function dateKeyInAppTimezone(iso: string | Date): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${day}`;
}

export interface Countdown {
  totalMs: number;
  overdue: boolean;
  label: string;
}

/** Human-friendly countdown label like "2d 4h" or "Overdue by 3h". */
export function getCountdown(dueAt: string, now: Date = new Date()): Countdown {
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const overdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(absMs / day);
  const hours = Math.floor((absMs % day) / hour);
  const minutes = Math.floor((absMs % hour) / minute);

  let label: string;
  if (days > 0) {
    label = `${days}d ${hours}h`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${Math.max(minutes, 0)}m`;
  }

  return {
    totalMs: diffMs,
    overdue,
    label: overdue ? `Overdue by ${label}` : `${label} left`,
  };
}
