# Sem 2 Deadlines

A personal, mobile-first deadline tracker for UTAS Semester 2 2026 courses.
Deadlines normally live scattered across Mylo's Quizzes / Assignments /
Assessments tabs per course — this pulls them into one dashboard with
countdowns, a filterable list, and a calendar view. All 4 courses
(KIT519, KIT501, KIT514, KIT719) are seeded now.

## Stack

- **Frontend:** Next.js (App Router, TypeScript) + Tailwind CSS
- **Database:** Supabase (Postgres)
- **Hosting:** Vercel
- **Mobile access:** installable PWA (Safari → Share → Add to Home Screen)

## Project structure

```
app/                     Routes (dashboard, /deadlines, /calendar, /deadlines/new) + server actions
app/api/chat/route.ts    AI agent chat endpoint (Gemini + Supabase function calling)
components/               UI components (cards, forms, calendar grid, nav, ChatWidget, etc.)
lib/                      Supabase clients, data-access helpers, date/calendar utils, shared types
lib/agent/                Gemini REST client + tool declarations/dispatcher for the chat agent
supabase/
  migrations/0001_init.sql   Table definitions (courses, deadlines, comments, course_documents)
  seed.sql                   KIT519 course + all extracted deadlines + course documents
scripts/generate-icons.mjs   Regenerates the placeholder PWA icons in public/icons
public/manifest.json         PWA manifest
```

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's provisioned, open **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Run the migration + seed

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — creates the tables.
2. `supabase/seed.sql` — inserts all 4 courses (KIT519, KIT501, KIT514,
   KIT719), their deadlines, and the raw unit outline/schedule text. It's
   written with `ON CONFLICT` upserts, so it's safe to re-run any time you
   tweak a deadline in the file.

(If you prefer the CLI: `supabase db push` / `supabase db execute -f <file>`
works the same way once you've linked the project with the Supabase CLI.)

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the four values in `.env.local`:

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only Supabase client (Server Components/Actions) |
| `GEMINI_API_KEY` | server-only, used by `app/api/chat/route.ts` (AI agent chat) |

`.env.local` is gitignored — never commit real keys. Until these are set,
the app still builds and runs; every page just shows a "Connect Supabase"
empty state instead of data.

## 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Dashboard** (`/`) — next N deadlines across all courses, with a live
  countdown (Australia/Hobart time). Deadlines with only a rough date note
  (e.g. "Week 4 tutorial, exact time TBC") show that note instead.
- **List** (`/deadlines`) — deadlines grouped by course, filterable by
  status/type, with a done/undone toggle and per-deadline comments.
- **Calendar** (`/calendar`) — month grid, deadlines colour-coded by course;
  undated deadlines are listed separately below the grid.
- **Add deadline** (`/deadlines/new`) — manual entry form.

## 5. Deploy to Vercel

1. Push this repo to GitHub (not done automatically — see below).
2. In Vercel: **New Project → Import** your repo.
3. Add the same four environment variables from `.env.local` in the
   Vercel project settings (Production + Preview).
4. Deploy. Vercel auto-detects Next.js — no extra build config needed.

## PWA / "Add to Home Screen" on iPhone

`public/manifest.json` + the metadata in `app/layout.tsx` (theme colour,
`apple-touch-icon`, `appleWebApp` meta) are already wired up. On an iPhone:
Safari → open the deployed URL → Share → **Add to Home Screen**. The icons
in `public/icons/` are intentionally plain placeholders (solid colour) —
regenerate them any time with `node scripts/generate-icons.mjs`, or replace
them with real artwork later.

## AI agent chat

A floating "Deadlines assistant" button (bottom-right, on every page) opens
a chat panel backed by `app/api/chat/route.ts`, which calls the **free-tier
Google Gemini API** (`gemini-flash-latest` by default — override with
`GEMINI_MODEL` if a different free-tier model becomes preferable) using
`X-goog-api-key: $GEMINI_API_KEY`. Requires `GEMINI_API_KEY` in the
environment (see table above) — grab a free key from
[Google AI Studio](https://aistudio.google.com/) if you don't have one.

**How it stays grounded, not hallucinated:** the route uses Gemini's native
function calling (`lib/agent/tools.ts` + `lib/agent/gemini.ts`) with four
tools that wrap the existing `lib/data/*` Supabase helpers — the model never
answers a deadline/date/rubric/course-plan question from its own knowledge,
it has to call a tool first:

- `getUpcomingDeadlines({ courseCode?, limit?, includeCompleted? })` — sorted
  by `due_at` (undated deadlines with only a `due_date_note` sort last),
  filtered against the real current time.
- `getDeadlineDetails({ deadlineId? | title?, courseCode? })` — full
  description/rubric/weight/status for one deadline, fuzzy-matched by title
  if no id is given (returns disambiguation candidates if the match isn't
  unique).
- `getCourseInfo({ courseCode, kind? })` — a course's `outline_text` plus its
  `course_documents` rows (`outline`/`schedule`/`rubric`/`other`).
- `markDeadlineStatus({ deadlineId? | title?, courseCode?, status })` — lets
  the user mark something done/todo via chat; idempotent (same call twice is
  a no-op) and only fires on an unambiguous match.

The system prompt is rebuilt on every request with the real current
date/time computed server-side in `Australia/Hobart` (via `Intl.DateTimeFormat`,
same helper conventions as `lib/dates.ts` — never hardcoded), the list of
seeded course codes, and instructions to always call a tool for date/rubric/
course-plan questions and to cite the exact course code + due date in every
answer. The route loops calling Gemini → running any requested tool(s) →
feeding the results back as `functionResponse` parts, until the model
returns a plain text answer (capped at 6 rounds).

If Gemini returns a rate-limit/quota error (common on the free tier), the
route responds with `429` and a friendly "try again in a moment" message
instead of a raw error — the chat panel shows that message inline rather
than crashing.

## Data model

See `supabase/migrations/0001_init.sql` for the authoritative schema:

- **courses** — one row per unit (code, name, semester, colour, outline text).
- **deadlines** — quizzes/assignments/exams/etc. per course, with either an
  exact `due_at` or a free-text `due_date_note` when the exact time isn't
  known, plus status (`todo`/`done`) and optional weight/description/rubric.
- **comments** — free-text notes attached to a deadline.
- **course_documents** — raw pasted text (outline, schedule, rubric) kept for
  reference and for the future AI agent's context.

## Known gaps / things to double-check on Mylo

See each course's ingestion report (chat history) for the full list. In
short, across all 4 courses:

- **KIT519**: assessment weight percentages are never stated in any
  available source and are left `null`; exact tutorial weekday/time is
  never stated anywhere, so the 3 presentation deadlines have `due_at =
  null` with a `due_date_note` instead of a guessed time.
- **KIT501**: the UNIX Scripting Assignment (Week 11) and both Tutorial
  Practical Demonstrations (Weeks 7 and 13) have no exact day/time in any
  provided source. The weekly OS/Networks quiz series also has an unusual
  gap (no "Networks Quiz" for Week 7, no "OS Quiz" for Week 11) — this was
  taken verbatim from the live Mylo quiz list rather than corrected.
- **KIT514**: every deadline date is confirmed (Quiz 1/Assignment 1 on
  6 Sept, Quiz 2 on 11 Oct, Assignment 2 on 18 Oct), but no source ever
  states a *time of day*, so all 4 have `due_at = null`.
- **KIT719**: Project 2's report + demo (Week 12) and the in-person test
  (Week 13) have no exact day/time in any provided source — only Project 1
  had a live Mylo assignment-dropbox export with an exact date/time.

For all courses, confirm the flagged items above on Mylo and update via the
"Add deadline" form or SQL once known.
