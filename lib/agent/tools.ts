// Tool (function-calling) layer for the AI chat agent. Every tool is a thin,
// read-mostly wrapper around the existing lib/data/* Supabase helpers so the
// agent can only do what the rest of the app can already do - no raw SQL,
// no schema access beyond what's already exposed.

import { getCourseByCode, getCourses } from "@/lib/data/courses";
import { getCourseDocuments } from "@/lib/data/courseDocuments";
import {
  getDeadlinesWithCourse,
  searchDeadlines,
  setDeadlineStatus,
  type SearchDeadlinesInput,
} from "@/lib/data/deadlines";
import { formatDueAt } from "@/lib/dates";
import type { DeadlineStatus, DeadlineWithCourse } from "@/lib/types";
import type { GeminiFunctionDeclaration } from "@/lib/agent/gemini";

const MAX_DOC_CHARS = 6000;

export const TOOL_DECLARATIONS: GeminiFunctionDeclaration[] = [
  {
    name: "getUpcomingDeadlines",
    description:
      "List deadlines across the user's courses, sorted by due date soonest-first. Overdue todos (past due but not marked done) appear first — they are the highest priority. Use this for any 'what's next / what's due / what's coming up / what's overdue' question. Deadlines with no exact time (only a rough note) are listed last.",
    parameters: {
      type: "OBJECT",
      properties: {
        courseCode: {
          type: "STRING",
          description:
            "Optional course code to filter by, e.g. 'KIT519'. Omit to search across all courses.",
        },
        limit: {
          type: "INTEGER",
          description: "Max number of deadlines to return. Defaults to 5, max 30.",
        },
        includeCompleted: {
          type: "BOOLEAN",
          description: "If true, also include deadlines already marked done. Defaults to false.",
        },
      },
    },
  },
  {
    name: "getDeadlineDetails",
    description:
      "Get full details (description, rubric text, weight, status, due date) for one specific deadline. Provide either deadlineId (if already known from a previous tool result) or a title/courseCode to fuzzy-match by name. If the match is ambiguous, returns multiple candidates for you to disambiguate with the user.",
    parameters: {
      type: "OBJECT",
      properties: {
        deadlineId: { type: "STRING", description: "Exact deadline UUID, if already known." },
        title: {
          type: "STRING",
          description: "Full or partial deadline title to fuzzy-match, e.g. 'Assignment 1'.",
        },
        courseCode: {
          type: "STRING",
          description: "Optional course code to narrow the title search, e.g. 'KIT519'.",
        },
      },
    },
  },
  {
    name: "getCourseInfo",
    description:
      "Get a course's unit outline summary and/or full schedule/outline documents (raw text pasted from the unit outline / study schedule). Use this for 'what's the course plan / outline / schedule for X' questions.",
    parameters: {
      type: "OBJECT",
      properties: {
        courseCode: {
          type: "STRING",
          description: "Course code, e.g. 'KIT501'. Required.",
        },
        kind: {
          type: "STRING",
          description:
            "Optional document kind to fetch: 'outline', 'schedule', 'rubric', or 'other'. Omit to fetch all available documents for the course.",
        },
      },
      required: ["courseCode"],
    },
  },
  {
    name: "markDeadlineStatus",
    description:
      "Mark a deadline as done or todo on the user's behalf. Only call this after you've identified an unambiguous deadline (use getDeadlineDetails first if unsure) and the user has clearly asked to mark it done/undone/complete/incomplete.",
    parameters: {
      type: "OBJECT",
      properties: {
        deadlineId: { type: "STRING", description: "Exact deadline UUID, if already known." },
        title: { type: "STRING", description: "Deadline title to fuzzy-match if id is unknown." },
        courseCode: { type: "STRING", description: "Optional course code to narrow the match." },
        status: {
          type: "STRING",
          description: "New status: 'done' or 'todo'.",
        },
      },
      required: ["status"],
    },
  },
];

function serializeDeadline(d: DeadlineWithCourse) {
  return {
    id: d.id,
    title: d.title,
    courseCode: d.course.code,
    courseName: d.course.name,
    type: d.type,
    status: d.status,
    weightPercent: d.weight_percent,
    dueAtIso: d.due_at,
    dueAtFormatted: d.due_at ? formatDueAt(d.due_at) : null,
    dueDateNote: d.due_date_note,
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[...truncated, ${text.length - max} more characters not shown...]`;
}

async function toolGetUpcomingDeadlines(args: {
  courseCode?: string;
  limit?: number;
  includeCompleted?: boolean;
}) {
  const all = await getDeadlinesWithCourse();
  const now = Date.now();
  const courseCode = args.courseCode?.trim().toLowerCase();
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 30);

  let filtered = all.filter((d) => {
    if (!args.includeCompleted && d.status === "done") return false;
    if (courseCode && d.course.code.toLowerCase() !== courseCode) return false;
    // Include overdue todo items (past due_at but not done) — they are the most urgent.
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return 0;
  });

  const results = filtered.slice(0, limit).map(serializeDeadline);
  return {
    nowIso: new Date(now).toISOString(),
    timezone: "Australia/Hobart",
    count: results.length,
    deadlines: results,
  };
}

async function resolveDeadlines(input: SearchDeadlinesInput): Promise<DeadlineWithCourse[]> {
  if (input.titleQuery || input.courseCode) {
    return searchDeadlines(input);
  }
  return [];
}

async function toolGetDeadlineDetails(args: {
  deadlineId?: string;
  title?: string;
  courseCode?: string;
}) {
  if (args.deadlineId) {
    const all = await getDeadlinesWithCourse();
    const match = all.find((d) => d.id === args.deadlineId);
    if (!match) return { found: false, error: "No deadline exists with that id." };
    return {
      found: true,
      deadline: {
        ...serializeDeadline(match),
        description: match.description,
        rubricText: match.rubric_text,
      },
    };
  }

  const matches = await resolveDeadlines({
    courseCode: args.courseCode,
    titleQuery: args.title,
    includeCompleted: true,
  });

  if (matches.length === 0) {
    return { found: false, error: "No deadline matched that title/course. Try a broader search or check the spelling." };
  }
  if (matches.length > 1) {
    return {
      found: false,
      ambiguous: true,
      candidates: matches.slice(0, 10).map(serializeDeadline),
      hint: "Multiple deadlines matched - ask the user which one they mean, or narrow with courseCode.",
    };
  }

  const d = matches[0];
  return {
    found: true,
    deadline: {
      ...serializeDeadline(d),
      description: d.description,
      rubricText: d.rubric_text,
    },
  };
}

async function toolGetCourseInfo(args: { courseCode: string; kind?: string }) {
  if (!args.courseCode) {
    return { found: false, error: "courseCode is required." };
  }
  const course = await getCourseByCode(args.courseCode);
  if (!course) {
    const all = await getCourses();
    return {
      found: false,
      error: `No course found with code '${args.courseCode}'.`,
      availableCourseCodes: all.map((c) => c.code),
    };
  }

  const docs = await getCourseDocuments(course.id);
  const kindFilter = args.kind?.trim().toLowerCase();
  const filteredDocs = kindFilter ? docs.filter((doc) => doc.kind === kindFilter) : docs;

  return {
    found: true,
    course: {
      code: course.code,
      name: course.name,
      semester: course.semester,
      outlineText: course.outline_text ? truncate(course.outline_text, MAX_DOC_CHARS) : null,
    },
    documents: filteredDocs.map((doc) => ({
      kind: doc.kind,
      text: truncate(doc.raw_text, MAX_DOC_CHARS),
    })),
  };
}

async function toolMarkDeadlineStatus(args: {
  deadlineId?: string;
  title?: string;
  courseCode?: string;
  status?: string;
}) {
  const status = args.status?.trim().toLowerCase();
  if (status !== "done" && status !== "todo") {
    return { success: false, error: "status must be 'done' or 'todo'." };
  }

  let target: DeadlineWithCourse | null = null;

  if (args.deadlineId) {
    const all = await getDeadlinesWithCourse();
    target = all.find((d) => d.id === args.deadlineId) ?? null;
    if (!target) return { success: false, error: "No deadline exists with that id." };
  } else {
    const matches = await resolveDeadlines({
      courseCode: args.courseCode,
      titleQuery: args.title,
      includeCompleted: true,
    });
    if (matches.length === 0) {
      return { success: false, error: "No deadline matched that title/course." };
    }
    if (matches.length > 1) {
      return {
        success: false,
        ambiguous: true,
        candidates: matches.slice(0, 10).map(serializeDeadline),
        hint: "Multiple deadlines matched - ask the user which one they mean, or narrow with courseCode.",
      };
    }
    target = matches[0];
  }

  const result = await setDeadlineStatus(target.id, status as DeadlineStatus);
  if (result.error) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    deadline: { ...serializeDeadline(target), status },
  };
}

export async function runTool(
  name: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (name) {
    case "getUpcomingDeadlines":
      return toolGetUpcomingDeadlines(args as { courseCode?: string; limit?: number; includeCompleted?: boolean });
    case "getDeadlineDetails":
      return toolGetDeadlineDetails(args as { deadlineId?: string; title?: string; courseCode?: string });
    case "getCourseInfo":
      return toolGetCourseInfo(args as { courseCode: string; kind?: string });
    case "markDeadlineStatus":
      return toolMarkDeadlineStatus(
        args as { deadlineId?: string; title?: string; courseCode?: string; status?: string }
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
