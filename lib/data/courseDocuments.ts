import { getSupabaseServerClient } from "@/lib/supabase";
import type { CourseDocument, CourseDocumentKind } from "@/lib/types";

export async function getCourseDocuments(courseId: string): Promise<CourseDocument[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("course_documents")
    .select("*")
    .eq("course_id", courseId)
    .order("kind", { ascending: true });

  if (error) {
    console.error("getCourseDocuments failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCourseDocument(
  courseId: string,
  kind: CourseDocumentKind
): Promise<CourseDocument | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("course_documents")
    .select("*")
    .eq("course_id", courseId)
    .eq("kind", kind)
    .maybeSingle();

  if (error) {
    console.error("getCourseDocument failed:", error.message);
    return null;
  }

  return data ?? null;
}
