"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addComment, deleteComment } from "@/lib/data/comments";
import {
  createDeadline,
  deleteDeadline,
  setDeadlineStatus,
  updateDeadline,
  type NewDeadlineInput,
  type UpdateDeadlineInput,
} from "@/lib/data/deadlines";
import { parseHobartDateTimeLocal } from "@/lib/dates";
import type { DeadlineStatus, DeadlineType } from "@/lib/types";

function revalidateDeadlinePaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/deadlines");
  revalidatePath("/calendar");
  if (id) revalidatePath(`/deadlines/${id}`);
}

export async function toggleDeadlineStatusAction(
  id: string,
  nextStatus: DeadlineStatus
): Promise<{ error: string | null }> {
  const result = await setDeadlineStatus(id, nextStatus);
  revalidateDeadlinePaths(id);
  return result;
}

export async function addCommentAction(
  deadlineId: string,
  body: string
): Promise<{ error: string | null }> {
  const result = await addComment(deadlineId, body);
  revalidatePath("/deadlines");
  revalidatePath(`/deadlines/${deadlineId}`);
  return result;
}

export async function deleteCommentAction(
  commentId: string,
  deadlineId: string
): Promise<{ error: string | null }> {
  const result = await deleteComment(commentId);
  revalidatePath("/deadlines");
  revalidatePath(`/deadlines/${deadlineId}`);
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
  const rubric_text = String(formData.get("rubric_text") ?? "").trim() || null;

  if (!course_id || !title) {
    return { error: "Course and title are required." };
  }

  const input: NewDeadlineInput = {
    course_id,
    title,
    type,
    due_at: dueAtRaw ? parseHobartDateTimeLocal(dueAtRaw) : null,
    due_date_note,
    weight_percent: weightRaw ? Number(weightRaw) : null,
    description,
    rubric_text,
  };

  const result = await createDeadline(input);
  if (result.error) return result;

  revalidateDeadlinePaths();
  return { error: null };
}

export async function updateDeadlineAction(
  id: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as DeadlineType;
  const dueAtRaw = String(formData.get("due_at") ?? "").trim();
  const due_date_note = String(formData.get("due_date_note") ?? "").trim() || null;
  const weightRaw = String(formData.get("weight_percent") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const rubric_text = String(formData.get("rubric_text") ?? "").trim() || null;

  if (!title) return { error: "Title is required." };

  const input: UpdateDeadlineInput = {
    title,
    type,
    due_at: dueAtRaw ? parseHobartDateTimeLocal(dueAtRaw) : null,
    due_date_note,
    weight_percent: weightRaw ? Number(weightRaw) : null,
    description,
    rubric_text,
  };

  const result = await updateDeadline(id, input);
  if (result.error) return result;

  revalidateDeadlinePaths(id);
  return { error: null };
}

export async function deleteDeadlineAction(id: string): Promise<void> {
  await deleteDeadline(id);
  revalidateDeadlinePaths();
  redirect("/deadlines");
}
