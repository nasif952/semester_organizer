"use server";

import { revalidatePath } from "next/cache";
import { addComment } from "@/lib/data/comments";
import { createDeadline, setDeadlineStatus, type NewDeadlineInput } from "@/lib/data/deadlines";
import type { DeadlineStatus, DeadlineType } from "@/lib/types";

export async function toggleDeadlineStatusAction(
  id: string,
  nextStatus: DeadlineStatus
): Promise<{ error: string | null }> {
  const result = await setDeadlineStatus(id, nextStatus);
  revalidatePath("/");
  revalidatePath("/deadlines");
  revalidatePath("/calendar");
  return result;
}

export async function addCommentAction(
  deadlineId: string,
  body: string
): Promise<{ error: string | null }> {
  const result = await addComment(deadlineId, body);
  revalidatePath("/deadlines");
  return result;
}

export async function createDeadlineAction(formData: FormData): Promise<{ error: string | null }> {
  const course_id = String(formData.get("course_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as DeadlineType;
  const dueAtRaw = String(formData.get("due_at") ?? "").trim();
  const due_date_note = String(formData.get("due_date_note") ?? "").trim() || null;
  const weightRaw = String(formData.get("weight_percent") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!course_id || !title) {
    return { error: "Course and title are required." };
  }

  const input: NewDeadlineInput = {
    course_id,
    title,
    type,
    due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
    due_date_note,
    weight_percent: weightRaw ? Number(weightRaw) : null,
    description,
  };

  const result = await createDeadline(input);
  revalidatePath("/");
  revalidatePath("/deadlines");
  revalidatePath("/calendar");
  return result;
}
