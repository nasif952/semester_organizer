import { getSupabaseServerClient } from "@/lib/supabase";
import type { Course } from "@/lib/types";

export async function getCourses(): Promise<Course[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("code", { ascending: true });

  if (error) {
    console.error("getCourses failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCourseById failed:", error.message);
    return null;
  }

  return data ?? null;
}
