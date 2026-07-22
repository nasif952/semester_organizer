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

/** Upcoming, not-yet-done deadlines sorted by due_at. Deadlines without a
 * known due_at (only a due_date_note) are appended at the end. */
export async function getUpcomingDeadlines(limit = 5): Promise<DeadlineWithCourse[]> {
  const all = await getDeadlinesWithCourse();
  const now = Date.now();

  const upcoming = all.filter((d) => {
    if (d.status === "done") return false;
    if (!d.due_at) return true;
    return new Date(d.due_at).getTime() >= now;
  });

  upcoming.sort((a, b) => {
    if (a.due_at && b.due_at) {
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    }
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return 0;
  });

  return upcoming.slice(0, limit);
}

export interface DeadlineFilters {
  status?: DeadlineStatus | "all";
  type?: DeadlineType | "all";
}

export function filterDeadlines(
  deadlines: DeadlineWithCourse[],
  filters: DeadlineFilters
): DeadlineWithCourse[] {
  return deadlines.filter((d) => {
    if (filters.status && filters.status !== "all" && d.status !== filters.status) {
      return false;
    }
    if (filters.type && filters.type !== "all" && d.type !== filters.type) {
      return false;
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
