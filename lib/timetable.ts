// Class timetable for Semester 2, 2026.
// Edit times/rooms here whenever MyTimetable is updated.
// day: 0 = Monday … 4 = Friday (matches JS Date.getDay() - 1)

export type SessionType = "lecture" | "tutorial" | "workshop" | "practical";

export interface ClassSession {
  courseCode: string;
  /** Display label for the session type + group, e.g. "Lecture (LecA-01)" */
  label: string;
  type: SessionType;
  /** 0 = Monday, 4 = Friday */
  day: 0 | 1 | 2 | 3 | 4;
  /** "HH:MM" 24-hour Hobart local time, or null if unknown */
  startTime: string | null;
  /** "HH:MM" 24-hour Hobart local time, or null if unknown */
  endTime: string | null;
  /** Human-readable location, e.g. "Online (Zoom)" or "AR15 L1·139 (Sandy Bay)" */
  location: string;
  online: boolean;
  /** ISO date the session first ran, for reference */
  firstDate: string;
}

// Room code decoder: "SB.AR15L01139" → "AR15 L1·139 (Sandy Bay)"
// SB = Sandy Bay campus, AR15 = building, L0 = floor separator, 1139 = room
function room(code: string): string {
  // e.g. SB.AR15L01139 → extract after SB. and format
  const stripped = code.replace(/^SB\./, "").trim();
  // split on "L0" → ["AR15", "1139"] or "L1" etc.
  const match = stripped.match(/^([A-Z0-9]+)L0*(\d+)$/);
  if (!match) return `${stripped} (Sandy Bay)`;
  return `${match[1]} Room ${match[2]} (Sandy Bay)`;
}

export const TIMETABLE: ClassSession[] = [
  // ─── Monday ──────────────────────────────────────────────
  {
    courseCode: "KIT501",
    label: "Lecture (LecA-01)",
    type: "lecture",
    day: 0,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: "Online — confirm in MyTimetable",
    online: true,
    firstDate: "2026-07-06",
  },
  {
    courseCode: "KIT519",
    label: "Lecture (LecA-01)",
    type: "lecture",
    day: 0,
    startTime: "13:00",
    endTime: "14:00",
    location: "Online (Zoom)",
    online: true,
    firstDate: "2026-07-06",
  },
  {
    courseCode: "KIT514",
    label: "Lecture (LecA-01)",
    type: "lecture",
    day: 0,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: "Online — confirm in MyTimetable",
    online: true,
    firstDate: "2026-07-06",
  },

  // ─── Tuesday ─────────────────────────────────────────────
  {
    courseCode: "KIT719",
    label: "Lecture (LecA-01)",
    type: "lecture",
    day: 1,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: "On campus — confirm in MyTimetable",
    online: false,
    firstDate: "2026-07-07",
  },
  {
    courseCode: "KIT519",
    label: "Workshop (WksA-01)",
    type: "workshop",
    day: 1,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: room("SB.AR15L01139"),
    online: false,
    firstDate: "2026-07-14", // starts week 2
  },
  {
    courseCode: "KIT514",
    label: "Tutorial (TutA-02)",
    type: "tutorial",
    day: 1,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: room("SB.AR15L01139"),
    online: false,
    firstDate: "2026-07-07",
  },

  // ─── Wednesday ───────────────────────────────────────────
  {
    courseCode: "KIT719",
    label: "Tutorial (TutA-02)",
    type: "tutorial",
    day: 2,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: room("SB.AR15L03369"),
    online: false,
    firstDate: "2026-07-08",
  },

  // ─── Friday ──────────────────────────────────────────────
  {
    courseCode: "KIT501",
    label: "Practical (PracA-03)",
    type: "practical",
    day: 4,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: room("SB.AR15L03376"),
    online: false,
    firstDate: "2026-07-17", // starts week 2
  },
  {
    courseCode: "KIT501",
    label: "Tutorial (TutA-04)",
    type: "tutorial",
    day: 4,
    startTime: null, // confirm in MyTimetable
    endTime: null,
    location: room("SB.AR15L03372"),
    online: false,
    firstDate: "2026-07-17", // starts week 2
  },
];

export const COURSE_COLORS: Record<string, string> = {
  KIT519: "#4f46e5",
  KIT501: "#f59e0b",
  KIT514: "#0d9488",
  KIT719: "#db2777",
};

/** Sessions happening on a given day of week (0=Mon). */
export function sessionsForDay(day: number): ClassSession[] {
  return TIMETABLE.filter((s) => s.day === day).sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });
}

const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  lecture: "Lecture",
  tutorial: "Tutorial",
  workshop: "Workshop",
  practical: "Practical",
};

export function sessionTypeLabel(type: SessionType): string {
  return SESSION_TYPE_LABEL[type];
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export function dayName(day: number): string {
  return DAY_NAMES[day] ?? "";
}
