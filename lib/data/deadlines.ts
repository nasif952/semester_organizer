import { getSupabaseServerClient } from "@/lib/supabase";
import type { Deadline, DeadlineStatus, DeadlineType, DeadlineWithCourse } from "@/lib/types";

export async function getDeadlinesWithCourse(): Promise<DeadlineWithCourse[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("deadlines")
    .select("*, course:courses(*)")
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getDeadlinesWithCourse failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as DeadlineWithCourse[];
}

export async function getDeadlineById(id: string): Promise<DeadlineWithCourse | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("deadlines")
    .select("*, course:courses(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getDeadlineById failed:", error.message);
    return null;
  }

  return (data as unknown as DeadlineWithCourse) ?? null;
}

/** All not-done deadlines sorted by due_at, including overdue ones.
 * Overdue items naturally sort first (past dates < future dates).
 * Undated items (only a due_date_note) are appended at the end. */
export async function getUpcomingDeadlines(limit = 8): Promise<DeadlineWithCourse[]> {
  const all = await getDeadlinesWithCourse();

  const active = all.filter((d) => d.status !== "done");

  active.sort((a, b) => {
    if (a.due_at && b.due_at) {
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    }
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return 0;
  });

  return active.slice(0, limit);
}

export interface SearchDeadlinesInput {
  courseCode?: string;
  titleQuery?: string;
  includeCompleted?: boolean;
}

/** Fuzzy lookup by (optional) course code + a case-insensitive substring
 * match on title. Used by the AI agent to resolve a deadline the user
 * describes in natural language into concrete row(s). */
export async function searchDeadlines(
  input: SearchDeadlinesInput
): Promise<DeadlineWithCourse[]> {
  const all = await getDeadlinesWithCourse();
  const courseCode = input.courseCode?.trim().toLowerCase();
  const titleQuery = input.titleQuery?.trim().toLowerCase();

  return all.filter((d) => {
    if (!input.includeCompleted && d.status === "done") return false;
    if (courseCode && d.course.code.toLowerCase() !== courseCode) return false;
    if (titleQuery && !d.title.toLowerCase().includes(titleQuery)) return false;
    return true;
  });
}

export interface DeadlineFilters {
  status?: DeadlineStatus | "all";
  type?: DeadlineType | "all";
  courseCode?: string | "all";
  search?: string;
}

export function filterDeadlines(
  deadlines: DeadlineWithCourse[],
  filters: DeadlineFilters
): DeadlineWithCourse[] {
  const search = filters.search?.trim().toLowerCase();
  return deadlines.filter((d) => {
    if (filters.status && filters.status !== "all" && d.status !== filters.status) {
      return false;
    }
    if (filters.type && filters.type !== "all" && d.type !== filters.type) {
      return false;
    }
    if (filters.courseCode && filters.courseCode !== "all" && d.course.code !== filters.courseCode) {
      return false;
    }
    if (search) {
      const inTitle = d.title.toLowerCase().includes(search);
      const inDesc = d.description?.toLowerCase().includes(search) ?? false;
      if (!inTitle && !inDesc) return false;
    }
    return true;
  });
}

export interface NewDeadlineInput {
  course_id: string;
  title: string;
  type: DeadlineType;
  due_at: string | null;
  due_date_note: string | null;
  weight_percent: number | null;
  description: string | null;
  rubric_text?: string | null;
}

export async function createDeadline(input: NewDeadlineInput): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured yet." };
  }

  const { error } = await supabase.from("deadlines").insert({
    ...input,
    created_from: "manual",
  } satisfies Partial<Deadline> & { created_from: "manual" });

  if (error) {
    console.error("createDeadline failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export interface UpdateDeadlineInput {
  title?: string;
  type?: DeadlineType;
  due_at?: string | null;
  due_date_note?: string | null;
  weight_percent?: number | null;
  description?: string | null;
  rubric_text?: string | null;
}

export async function updateDeadline(
  id: string,
  input: UpdateDeadlineInput
): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured yet." };

  const { error } = await supabase
    .from("deadlines")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("updateDeadline failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteDeadline(id: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured yet." };

  const { error } = await supabase.from("deadlines").delete().eq("id", id);

  if (error) {
    console.error("deleteDeadline failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export async function setDeadlineStatus(
  id: string,
  status: DeadlineStatus
): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured yet." };
  }

  const { error } = await supabase
    .from("deadlines")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("setDeadlineStatus failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}
