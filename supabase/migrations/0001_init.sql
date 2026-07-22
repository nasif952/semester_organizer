-- Initial schema for the sem2-deadlines personal deadline tracker.
-- Run this against a fresh Supabase (Postgres) project, e.g. via the
-- Supabase SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  semester text not null,
  color text not null default '#4f46e5',
  outline_text text,
  created_at timestamptz not null default now()
);

comment on table courses is 'One row per university course/unit.';

-- ---------------------------------------------------------------------------
-- deadlines
-- ---------------------------------------------------------------------------
create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  type text not null check (type in ('quiz', 'assignment', 'exam', 'presentation', 'other')),
  due_at timestamptz,
  due_date_note text,
  weight_percent numeric(5, 2) check (weight_percent is null or (weight_percent >= 0 and weight_percent <= 100)),
  description text,
  rubric_text text,
  status text not null default 'todo' check (status in ('todo', 'done')),
  created_from text not null default 'pasted' check (created_from in ('manual', 'pasted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Keeps re-running supabase/seed.sql idempotent per course.
  constraint deadlines_course_title_unique unique (course_id, title),
  -- A deadline should carry either a concrete due_at or at least a note
  -- about roughly when it's due - never neither.
  constraint deadlines_due_info_present check (due_at is not null or due_date_note is not null)
);

create index if not exists deadlines_due_at_idx on deadlines (due_at);
create index if not exists deadlines_course_id_idx on deadlines (course_id);

comment on table deadlines is 'Quizzes, assignments, exams etc. belonging to a course.';

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists deadlines_set_updated_at on deadlines;
create trigger deadlines_set_updated_at
  before update on deadlines
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references deadlines (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_deadline_id_idx on comments (deadline_id);

comment on table comments is 'Free-text notes a student leaves on a deadline.';

-- ---------------------------------------------------------------------------
-- course_documents
-- ---------------------------------------------------------------------------
create table if not exists course_documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  kind text not null check (kind in ('outline', 'rubric', 'schedule', 'other')),
  raw_text text not null,
  created_at timestamptz not null default now(),

  -- Assumes one canonical document per (course, kind) for now, e.g. a single
  -- 'outline' and a single 'schedule' blob. Relax this if a course later
  -- needs multiple documents of the same kind (e.g. several rubrics).
  constraint course_documents_course_kind_unique unique (course_id, kind)
);

comment on table course_documents is 'Raw pasted text from Mylo (unit outline, study schedule, rubrics) - future AI agent context.';
