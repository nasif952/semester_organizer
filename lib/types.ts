export type DeadlineType =
  | "quiz"
  | "assignment"
  | "exam"
  | "presentation"
  | "other";

export type DeadlineStatus = "todo" | "done";

export type CreatedFrom = "manual" | "pasted";

export type CourseDocumentKind = "outline" | "rubric" | "schedule" | "other";

export const DEADLINE_TYPES: DeadlineType[] = [
  "quiz",
  "assignment",
  "exam",
  "presentation",
  "other",
];

export interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  color: string;
  outline_text: string | null;
  created_at: string;
}

export interface Deadline {
  id: string;
  course_id: string;
  title: string;
  type: DeadlineType;
  due_at: string | null;
  due_date_note: string | null;
  weight_percent: number | null;
  description: string | null;
  rubric_text: string | null;
  status: DeadlineStatus;
  created_from: CreatedFrom;
  created_at: string;
  updated_at: string;
}

export interface DeadlineWithCourse extends Deadline {
  course: Course;
}

export interface Comment {
  id: string;
  deadline_id: string;
  body: string;
  created_at: string;
}

export interface CourseDocument {
  id: string;
  course_id: string;
  kind: CourseDocumentKind;
  raw_text: string;
  created_at: string;
}
