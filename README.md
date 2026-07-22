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
components/               UI components (cards, forms, calendar grid, nav, etc.)
lib/                      Supabase clients, data-access helpers, date/calendar utils, shared types
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
| `GEMINI_API_KEY` | reserved for the future AI agent route (not used yet) |

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

## Future phase: AI agent

Not built yet — deliberately left as a placeholder. The plan is a
serverless API route (e.g. `app/api/agent/route.ts`) that calls the
**free-tier Google Gemini API** (e.g. `gemini-1.5-flash`, or whichever
current free-tier model is available at build time) using function/tool
calling against Supabase to answer questions like "what's my next deadline"
or "what's the rubric for X", using live date/time in Australia/Hobart. It
will read `GEMINI_API_KEY` from the environment once implemented — you'll
need to grab a free key from [Google AI Studio](https://aistudio.google.com/)
before that phase starts.

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
