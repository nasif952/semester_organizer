import { getSupabaseServerClient } from "@/lib/supabase";
import type { Comment } from "@/lib/types";

export async function getCommentsForDeadline(deadlineId: string): Promise<Comment[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("deadline_id", deadlineId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCommentsForDeadline failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function addComment(
  deadlineId: string,
  body: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured yet." };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Comment can't be empty." };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ deadline_id: deadlineId, body: trimmed });

  if (error) {
    console.error("addComment failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}
