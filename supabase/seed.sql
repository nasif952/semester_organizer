-- Seed data for KIT519 (course 1 of 4). Safe to re-run: uses ON CONFLICT
-- upserts keyed on the unique constraints added in 0001_init.sql.
--
-- Timezone note: all due_at values below are Australia/Hobart local time.
-- Hobart is AEST (+10:00) from early Apr to early Oct, and AEDT (+11:00)
-- otherwise. Every date below falls in AEST (+10:00) *except* the
-- Assignment 3 deadlines on Sun 4 Oct 2026 23:59, which falls after that
-- year's DST changeover (2am AEST -> 3am AEDT), hence the +11:00 offset.

insert into courses (code, name, semester, color, outline_text)
values (
  'KIT519',
  'Software Engineering and HCI',
  'Semester 2 2026',
  '#4f46e5',
  $txt$KIT519 Development Methodologies & User Experience

Welcome to KIT519 Development Methodologies & User Experience. In this unit you will explore the System Development Life Cycle (SDLC) guided by Software Engineering principles and practices, combined with Human-Computer Interaction (HCI) and User Experience (UX) theory. The unit is delivered in hybrid mode (online + face-to-face).

Unit coordinator: Dr Meredith Castles (Meredith.Castles@utas.edu.au)
Lectures: Online, Monday 1pm, Weeks 1-11 (Zoom)
Tutorials: Face-to-face, Weeks 1-12

Assessment: this unit has 4 assessment tasks - 3 are group-based project assessments (each with a presentation + written component, plus a peer & self review), and 1 is a series of quizzes throughout the semester.

Pass requirement: students must achieve at least 50% against each Intended Learning Outcome (ILO) and at least 50% overall.$txt$
)
on conflict (code) do update set
  name = excluded.name,
  semester = excluded.semester,
  color = excluded.color,
  outline_text = excluded.outline_text;

with course as (
  select id from courses where code = 'KIT519'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'schedule', $txt$KIT519 SOFTWARE ENGINEERING & HCI (SEMESTER 2, 2026) - Study Schedule

Week 1, July 6: Human-Centred Systems Development and Professional Practice.
- Review Week 1 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 1

Week 2, July 13: Software Development Methodologies and Lifecycle Strategy.
- Review Week 2 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 2

Week 3, July 20: Requirements Engineering, Stakeholder Analysis and Traceability.
- Review Week 3 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 3
- Quiz 1 (SDLC Quiz) due: in tutorial window (Mylo shows exact due 23 Jul 2026 14:30, available 20-24 Jul 2026)

Week 4, July 27: Translating Requirements into Design Strategy.
- Review Week 4 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 4
- Assignment 1 (Presentation) due: in Week 4 Tutorial
- Assignment 1 (Written) due: 11:59pm Sun 2 Aug 2026

Week 5, Aug 3: Advanced HCI Theory and User-Centred Design.
- Review Week 5 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 5
- Quiz 2 (HCI Theory Quiz) due: in tutorial window (Mylo shows exact due 7 Aug 2026 18:00, available 3-7 Aug 2026)

Week 6, Aug 10: Interaction Design, Information Architecture and Experience Planning.
- Review Week 6 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 6

Week 7, Aug 17: Prototyping, Accessibility, Evaluation Planning and Inclusive User Experiences.
- Review Week 7 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 7
- Quiz 3 (Design & Prototyping Quiz) due: in tutorial window (Mylo shows exact due 21 Aug 2026 18:00, available 17-21 Aug 2026)

Mid-Semester Break.

Week 8, Aug 31: Design Critique, Evaluation Findings and Iterative Development.
- Review Week 8 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 8
- Assignment 2 (Presentation) due: in Week 8 Tutorial
- Assignment 2 (Written) due: 11:59pm Sun 6 Sept 2026

Week 9, Sept 7: Evaluation Frameworks for Interactive Systems.
- Review Week 9 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 9
- Quiz 4 (HCI Evaluation Quiz) due: in tutorial window (Mylo shows exact due 11 Sept 2026 18:00, available 7-11 Sept 2026)

Week 10, Sept 14: User Research, Usability Testing and Evidence-Based Design.
- Review Week 10 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 10

Week 11, Sept 21: Design Communication, UML and Integrating HCI with Software Engineering.
- Review Week 11 & 12 content on MyLO
- Attend online lecture 1pm Monday
- Attend Tutorial 11
- Quiz 5 (HCI & Software Engineering Quiz) due: in tutorial window (Mylo shows exact due 25 Sept 2026 18:00, available 21-25 Sept 2026)

Week 12, Sept 28: Project Presentations and Professional Reflection.
- Attend Tutorial 12
- Assignment 3 (Presentation) due: in Week 12 Tutorial
- Assignment 3 (Written) due: 11:59pm Sun 4 Oct 2026$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

with course as (
  select id from courses where code = 'KIT519'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'outline', $txt$Welcome to KIT519 Development Methodologies & User Experience. In this unit you will explore the System Development Life Cycle (SDLC) guided by Software Engineering principles and practices, combined with HCI/UX theory, delivered in hybrid online/face-to-face mode.

Unit coordinator: Dr Meredith Castles (Meredith.Castles@utas.edu.au). Lectures: Online Monday 1pm, Weeks 1-11 (Zoom). Face-to-face tutorials Weeks 1-12. This unit has 4 assessment tasks: 3 are group-based project assessments, 1 is a series of quizzes throughout the semester. Pass requires >=50% per Intended Learning Outcome and >=50% overall.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

-- Deadlines. weight_percent is left null everywhere - the unit outline and
-- study schedule never state assessment weightings; confirm these on Mylo's
-- assessment page and update via the "Add deadline" form or SQL later.
with course as (
  select id from courses where code = 'KIT519'
)
insert into deadlines (course_id, title, type, due_at, due_date_note, weight_percent, description, created_from)
select course.id, v.title, v.type, v.due_at, v.due_date_note, v.weight_percent, v.description, 'pasted'
from course, (
  values
    (
      'SDLC Quiz (Quiz 1)',
      'quiz',
      '2026-07-23T14:30:00+10:00'::timestamptz,
      null::text,
      null::numeric,
      'Week 3 quiz. Password-protected on Mylo; available 20-24 Jul 2026, due 23 Jul 2026 2:30pm.'
    ),
    (
      'Assignment 1 (Presentation)',
      'presentation',
      null,
      'Week 4 tutorial (week of 27 Jul 2026) - exact day/time TBC, confirm on Mylo.',
      null,
      'In-tutorial presentation component of Assignment 1. Not listed as a separate Mylo submission item.'
    ),
    (
      'Assignment 1 (Written): Requirements Analysis & Design Strategy',
      'assignment',
      '2026-08-02T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Group assessment (Team 17 on Mylo). Turnitin-enabled submission.'
    ),
    (
      'Assignment 1 Peer & Self Review',
      'other',
      '2026-08-02T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Peer & self review accompanying Assignment 1, same due date as the written submission.'
    ),
    (
      'HCI Theory Quiz (Quiz 2)',
      'quiz',
      '2026-08-07T18:00:00+10:00'::timestamptz,
      null,
      null,
      'Week 5 quiz. Password-protected on Mylo; available 3-7 Aug 2026, due 7 Aug 2026 6:00pm.'
    ),
    (
      'Design & Prototyping Quiz (Quiz 3)',
      'quiz',
      '2026-08-21T18:00:00+10:00'::timestamptz,
      null,
      null,
      'Week 7 quiz. Password-protected on Mylo; available 17-21 Aug 2026, due 21 Aug 2026 6:00pm.'
    ),
    (
      'Assignment 2 (Presentation)',
      'presentation',
      null,
      'Week 8 tutorial (week of 31 Aug 2026) - exact day/time TBC, confirm on Mylo.',
      null,
      'In-tutorial presentation component of Assignment 2. Not listed as a separate Mylo submission item.'
    ),
    (
      'Assignment 2 (Written): Prototyping, Modelling & Design Evaluation',
      'assignment',
      '2026-09-06T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Group assessment (Team 17 on Mylo). Turnitin-enabled submission.'
    ),
    (
      'Assignment 2 Peer & Self Review',
      'other',
      '2026-09-06T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Peer & self review accompanying Assignment 2, same due date as the written submission.'
    ),
    (
      'HCI Evaluation Quiz (Quiz 4)',
      'quiz',
      '2026-09-11T18:00:00+10:00'::timestamptz,
      null,
      null,
      'Week 9 quiz. Password-protected on Mylo; available 7-11 Sept 2026, due 11 Sept 2026 6:00pm.'
    ),
    (
      'HCI & Software Engineering Quiz (Quiz 5)',
      'quiz',
      '2026-09-25T18:00:00+10:00'::timestamptz,
      null,
      null,
      'Week 11 quiz. Password-protected on Mylo; available 21-25 Sept 2026, due 25 Sept 2026 6:00pm.'
    ),
    (
      'Assignment 3 (Presentation)',
      'presentation',
      null,
      'Week 12 tutorial (week of 28 Sept 2026) - exact day/time TBC, confirm on Mylo.',
      null,
      'In-tutorial presentation component of Assignment 3. Not listed as a separate Mylo submission item.'
    ),
    (
      'Assignment 3 (Written): Final Project Evaluation & Professional Defence',
      'assignment',
      '2026-10-04T23:59:00+11:00'::timestamptz,
      null,
      null,
      'Group assessment (Team 17 on Mylo). Turnitin-enabled submission. Note: this due date falls after the Oct 2026 AEDT changeover, hence the +11:00 offset.'
    ),
    (
      'Assignment 3 Peer & Self Review',
      'other',
      '2026-10-04T23:59:00+11:00'::timestamptz,
      null,
      null,
      'Peer & self review accompanying Assignment 3, same due date as the written submission.'
    )
) as v(title, type, due_at, due_date_note, weight_percent, description)
on conflict (course_id, title) do update set
  type = excluded.type,
  due_at = excluded.due_at,
  due_date_note = excluded.due_date_note,
  weight_percent = excluded.weight_percent,
  description = excluded.description;

-- ===========================================================================
-- Seed data for KIT501 (course 2 of 4). Sources cross-referenced: the MyLO
-- unit home page + announcements + calendar widget ("501/1.txt"), the
-- official Unit Outline with assessment schedule/details ("501/1 - Copy.txt"),
-- and the live MyLO Assignments dropbox + Quiz List export
-- ("501/1 - Copy (2).txt"). Where the Unit Outline only gives a coarse
-- "Week N" due date and the MyLO export gives an exact date/time for the
-- same item, the MyLO export is treated as authoritative (it is the more
-- precise, more current source), per the Unit Outline's own due dates being
-- placeholders ("Refer to Assessment Description" for two of the five tasks).
--
-- Timezone note: all due_at values below are Australia/Hobart local time.
-- Every date below falls in AEST (+10:00) - none of KIT501's exact-timed
-- deadlines fall after the Oct 2026 AEDT changeover (2am AEST -> 3am AEDT
-- on Sun 4 Oct 2026).
insert into courses (code, name, semester, color, outline_text)
values (
  'KIT501',
  'ICT Systems Administration Fundamentals',
  'Semester 2 2026',
  '#f59e0b',
  $txt$KIT501 ICT Systems Administration Fundamentals

Welcome to KIT501 ICT Systems Administration Fundamentals. This unit introduces operating systems and scripting (Unix-focused: OS structure/services, process management, memory management including virtual memory, OS security, introductory shell scripting, file systems, device management, I/O) alongside the fundamentals of distributed networked environments (internetworking standards, network architecture/technology/operation, OSI security architecture, common internet risks, encryption, digital signatures, PKI, authentication and non-repudiation).

Unit coordinator: David Herbert (David.Herbert@utas.edu.au)
Lecture: Online (Zoom), Monday 9:00am - live in Week 1 for all students; Weeks 2-12 used on an as-needed basis with notice given via MyLO announcements/email. All students are expected to attend all lectures.
Tutorials: Face-to-face, 2 hours weekly, Weeks 2-12, in ICT's networks labs (networks & security stream).
Practicals: Face-to-face, 1 hour weekly, Weeks 2-12, via the unit's teaching Unix server (operating systems stream).

Assessment: 5 assessment tasks - a UNIX Scripting Assignment (15%, due Week 11), a Security Assignment (15%, due Week 12), an ongoing Operating Systems Quiz series (10% total, weekly in practicals), an ongoing Network Device Configuration item combining weekly tutorial checkpoint demonstrations plus Networks quizzes (20% total, weekly in tutorials), and two Tutorial Practical Demonstrations (40% total, 20% each - Week 7 and Week 13). Both weekly quizzes require attendance at the associated tutorial/practical to submit; no late submissions are accepted for missed classes.

Pass requirement: demonstrate attainment of each Intended Learning Outcome and achieve a final unit grade of 50% or greater.$txt$
)
on conflict (code) do update set
  name = excluded.name,
  semester = excluded.semester,
  color = excluded.color,
  outline_text = excluded.outline_text;

with course as (
  select id from courses where code = 'KIT501'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'schedule', $txt$KIT501 ICT SYSTEMS ADMINISTRATION FUNDAMENTALS (SEMESTER 2, 2026) - Key Dates

Week 1, July 6: Unit begins. First (live) lecture 9:00am Monday via Zoom, for all students. No tutorials/practicals this week.

Week 2, July 13: Tutorials and practicals begin (continue through Week 12). Lecture 9:00am Monday. OS Quiz 1 and Networks Quiz 1 due 17 Jul 2026 (in the Week 2 practical/tutorial; must attend to submit).

Week 3, July 20: OS Quiz 2 and Networks Quiz 2 due 24 Jul 2026 (OS Quiz 2 due 17:00, Networks Quiz 2 due 23:59).

Week 4, July 27: OS Quiz 3 due 31 Jul 2026 17:00. Networks Quiz 3 due 31 Jul 2026 23:59.

Week 5, Aug 3: OS Quiz 4 due 7 Aug 2026 17:00. Networks Quiz 4 due 7 Aug 2026 23:59.

Week 6, Aug 10: OS Quiz 5 due 14 Aug 2026 17:00. Networks Quiz 5 due 14 Aug 2026 23:59.

Week 7, Aug 17: OS Quiz 6 due 21 Aug 2026 17:00. Tutorial Practical Demonstration 1 (20%) held this week - subnet addressing scheme + basic network infrastructure configuration. No Networks Quiz shown for Week 7 in the MyLO quiz list (it resumes in Week 8) - flagged, not fabricated.

Mid-Semester Break (~24-30 Aug 2026, per the shared UTAS semester calendar).

Week 8, Aug 31: OS Quiz 7 due 4 Sept 2026 17:00. Networks Quiz 6 due 4 Sept 2026 23:59 (numbering resumes here after skipping Week 7).

Week 9, Sept 7: OS Quiz 8 due 11 Sept 2026 17:00. Networks Quiz 7 due 11 Sept 2026 23:59.

Week 10, Sept 14: OS Quiz 9 due 18 Sept 2026 17:00. Networks Quiz 8 due 18 Sept 2026 23:59.

Week 11, Sept 21: Networks Quiz 9 due 25 Sept 2026 23:59. UNIX Scripting Assignment due this week (exact day/time not published in the provided MyLO export). No OS Quiz shown for Week 11 in the MyLO quiz list (it resumes in Week 12) - flagged, not fabricated.

Week 12, Sept 28: OS Quiz 10 due 2 Oct 2026 17:00. Networks Quiz 10 due 2 Oct 2026 23:59. Security Assignment due 2 Oct 2026 17:00 (submitted on MyLO as 8 separate dropbox items, all due at the same date/time).

Week 13, Oct 5 (the study break - on-campus attendance still required): Tutorial Practical Demonstration 2 (20%) - advanced network infrastructure configuration including secure protocols and routing/routing protocols.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

with course as (
  select id from courses where code = 'KIT501'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'outline', $txt$Welcome to KIT501 ICT Systems Administration Fundamentals - an introduction to operating systems/scripting (Unix-focused) and the fundamentals of distributed networked environments and network security.

Unit coordinator: David Herbert (David.Herbert@utas.edu.au). Lecture: Online (Zoom) Monday 9:00am, live Week 1, then as-needed Weeks 2-12. Tutorials (2hr, networks/security stream) and Practicals (1hr, operating systems stream) run face-to-face Weeks 2-12. Assessment: UNIX Scripting Assignment (15%, Week 11), Security Assignment (15%, Week 12), Operating Systems Quiz series (10%, weekly), Network Device Configuration - tutorial checkpoints + Networks Quiz series (20%, weekly), Tutorial Practical Demonstrations (40%, two demos of 20% each in Weeks 7 and 13). Pass requires >=50% per Intended Learning Outcome and >=50% overall.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

-- Deadlines. The two major assignments and the two demonstrations carry the
-- weights explicitly stated in the Unit Outline's assessment schedule. The
-- 20 individual weekly quizzes belong to two 100%-continuous categories (OS
-- Quiz = 10% total = Assessment Task 3; Networks Quiz = part of the 20%
-- Assessment Task 4 alongside in-tutorial checkpoint demonstrations) whose
-- per-instance weighting is never broken down anywhere in the source
-- material, so weight_percent is left null on each instance rather than
-- guessed (e.g. assumed evenly split) - confirm on MyLO if a per-quiz mark
-- breakdown is needed.
with course as (
  select id from courses where code = 'KIT501'
)
insert into deadlines (course_id, title, type, due_at, due_date_note, weight_percent, description, rubric_text, created_from)
select course.id, v.title, v.type, v.due_at, v.due_date_note, v.weight_percent, v.description, v.rubric_text, 'pasted'
from course, (
  values
    (
      'UNIX Scripting Assignment',
      'assignment',
      null::timestamptz,
      'Week 11 (21-25 Sept 2026) - the Unit Outline only states "Week 11"; the provided MyLO assignments dropbox export does not include this item, so no exact day/time is available. Confirm on Mylo.',
      15::numeric,
      'Assessment Task 1. Develop working shell scripts to solve UNIX scenarios, some relating to networking-associated processes. Students are given 4 weeks to complete this task.',
      'Criteria (Unit Outline): 1) Correct execution of implemented script according to specifications (LO2). 2) Script produces outcomes according to given specifications (LO3). 3) Correctly aligns with industry standards for programming structure, layout and documentation (LO2). 4) Script design aligns with industry standards for programming structure, layout and documentation (LO1).'
    ),
    (
      'Security Assignment',
      'assignment',
      '2026-10-02T17:00:00+10:00'::timestamptz,
      null,
      15,
      'Assessment Task 2. Practical exercise using standard industry cryptographic techniques - asymmetric cryptography to encrypt/decrypt messages, and calculating/comparing cryptographic hashes to verify message integrity. Students are given 3 weeks to complete this task. On MyLO this is submitted as 8 separate dropbox items (Security Assignment Submission 1-8, corresponding to Tasks T-2, T-4, T-7, T-9, T-11, T-13, T-16, T-19), all due at this same date/time, available 7 Sept - 12 Oct 2026.',
      'Criteria (Unit Outline): 1) Evaluate the appropriate tools and commands to maintain the confidentiality, integrity, and authenticity of messages for a security scenario (LO4). 2) Apply cryptographic tools to solve a given security scenario (LO1).'
    ),
    (
      'OS Quiz 1',
      'quiz',
      '2026-07-17T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3, 10% total across the series - per-quiz weighting not stated). Password-protected, one question, completed at the start of the Week 2 practical; must attend to submit. Available 13-17 Jul 2026.',
      null
    ),
    (
      'Networks Quiz 1',
      'quiz',
      '2026-07-17T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz, part of Network Device Configuration (Assessment Task 4, 20% total alongside tutorial checkpoint demonstrations - per-quiz weighting not stated). Password-protected, one question, completed at the start of the Week 2 tutorial; must attend to submit. Available 13-17 Jul 2026.',
      null
    ),
    (
      'OS Quiz 2',
      'quiz',
      '2026-07-24T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 20-24 Jul 2026.',
      null
    ),
    (
      'Networks Quiz 2',
      'quiz',
      '2026-07-24T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 20-24 Jul 2026.',
      null
    ),
    (
      'OS Quiz 3',
      'quiz',
      '2026-07-31T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 27-31 Jul 2026.',
      null
    ),
    (
      'Networks Quiz 3',
      'quiz',
      '2026-07-31T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 27-31 Jul 2026.',
      null
    ),
    (
      'OS Quiz 4',
      'quiz',
      '2026-08-07T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 3-7 Aug 2026.',
      null
    ),
    (
      'Networks Quiz 4',
      'quiz',
      '2026-08-07T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 3-7 Aug 2026.',
      null
    ),
    (
      'OS Quiz 5',
      'quiz',
      '2026-08-14T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 10-14 Aug 2026.',
      null
    ),
    (
      'Networks Quiz 5',
      'quiz',
      '2026-08-14T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 10-14 Aug 2026.',
      null
    ),
    (
      'OS Quiz 6',
      'quiz',
      '2026-08-21T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 17-21 Aug 2026. Same week as Tutorial Practical Demonstration 1.',
      null
    ),
    (
      'OS Quiz 7',
      'quiz',
      '2026-09-04T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 31 Aug - 4 Sept 2026 (first quiz after the mid-semester break).',
      null
    ),
    (
      'Networks Quiz 6',
      'quiz',
      '2026-09-04T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 31 Aug - 4 Sept 2026. Note: the MyLO quiz list has no "Networks Quiz" numbered for Week 7 (Aug 17-21) - numbering jumps from Networks Quiz 5 to Networks Quiz 6 across the break, unlike the OS Quiz series which runs Week 7 then skips Week 11 instead. Flagged as an observed quirk in the MyLO export, not corrected/guessed.',
      null
    ),
    (
      'OS Quiz 8',
      'quiz',
      '2026-09-11T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 7-11 Sept 2026.',
      null
    ),
    (
      'Networks Quiz 7',
      'quiz',
      '2026-09-11T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 7-11 Sept 2026.',
      null
    ),
    (
      'OS Quiz 9',
      'quiz',
      '2026-09-18T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 14-18 Sept 2026.',
      null
    ),
    (
      'Networks Quiz 8',
      'quiz',
      '2026-09-18T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 14-18 Sept 2026.',
      null
    ),
    (
      'Networks Quiz 9',
      'quiz',
      '2026-09-25T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 21-25 Sept 2026. Same week as the UNIX Scripting Assignment due date. Note: the MyLO quiz list has no "OS Quiz" numbered for Week 11 (Sept 21-25) - numbering jumps from OS Quiz 9 to OS Quiz 10 across this week. Flagged, not corrected/guessed.',
      null
    ),
    (
      'OS Quiz 10',
      'quiz',
      '2026-10-02T17:00:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Operating Systems Quiz (Assessment Task 3). Available 28 Sept - 2 Oct 2026. Same date as the Security Assignment.',
      null
    ),
    (
      'Networks Quiz 10',
      'quiz',
      '2026-10-02T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Weekly Networks Quiz (Assessment Task 4). Available 28 Sept - 2 Oct 2026. Same date as the Security Assignment.',
      null
    ),
    (
      'Tutorial Practical Demonstration 1',
      'presentation',
      null,
      'Week 7 tutorial (17-21 Aug 2026) - exact day/time not stated anywhere in the source material; confirm on Mylo.',
      20,
      'Assessment Task 5 (Tutorial Practical Demonstrations, 40% total across two demonstrations). Devise a TCP/IP subnet addressing scheme meeting scenario specifications and configure network infrastructure to a basic level. 30 minutes.',
      'Criteria (Unit Outline, Assessment Task 5): 1) Design a network addressing scheme for a specified network scenario (LO2). 2) Apply core networking concepts to configure networking infrastructure to specification (LO1, LO4). 3) Troubleshoot faults and configuration errors in networking infrastructure (LO3). 4) Correctly configure networking infrastructure based on provided specifications (LO2, LO3).'
    ),
    (
      'Tutorial Practical Demonstration 2',
      'presentation',
      null,
      'Week 13 (5-9 Oct 2026, the study break - on-campus attendance is still required this week) - exact day/time not stated anywhere in the source material; confirm on Mylo.',
      20,
      'Assessment Task 5 (Tutorial Practical Demonstrations, 40% total across two demonstrations). Configure advanced network infrastructure including secure protocols, plus routing and routing protocols, for a more advanced networking scenario. 30 minutes.',
      'Criteria (Unit Outline, Assessment Task 5): 1) Design a network addressing scheme for a specified network scenario (LO2). 2) Apply core networking concepts to configure networking infrastructure to specification (LO1, LO4). 3) Troubleshoot faults and configuration errors in networking infrastructure (LO3). 4) Correctly configure networking infrastructure based on provided specifications (LO2, LO3).'
    )
) as v(title, type, due_at, due_date_note, weight_percent, description, rubric_text)
on conflict (course_id, title) do update set
  type = excluded.type,
  due_at = excluded.due_at,
  due_date_note = excluded.due_date_note,
  weight_percent = excluded.weight_percent,
  description = excluded.description,
  rubric_text = excluded.rubric_text;

-- ===========================================================================
-- Seed data for KIT514 (course 3 of 4), "Secure Web and Cloud Development"
-- (dual-coded KIT214/514 - undergraduate/postgraduate share the same
-- assessments). Sources cross-referenced: the official Unit Outline with
-- assessment schedule/details + weekly schedule table ("514/1.txt") and the
-- live MyLO "KIT214/514 Assessment Items" export ("514/1 - Copy.txt"). Both
-- sources agree exactly on which week each item is due (Week 8, Week 8,
-- Week 13, Week 14 respectively) - no conflicts to reconcile. The MyLO
-- export additionally gives the exact calendar date (always a Sunday) but,
-- unlike KIT501's quiz list or KIT719's assignment dropbox, it never states
-- a time of day for any item, so due_at is left null throughout and the
-- known date is carried in due_date_note instead of guessing a time.
insert into courses (code, name, semester, color, outline_text)
values (
  'KIT514',
  'Secure Web and Cloud Development',
  'Semester 2 2026',
  '#0d9488',
  $txt$KIT514 Secure Web and Cloud Development (dual-coded KIT214/514)

Welcome to KIT514 Secure Web and Cloud Development. This unit introduces advanced principles and practice for developing secure, scalable web deployments on a cloud platform - implementation strategies, load balancing and server configuration, Web Design Architecture in PHP or NodeJS, and database management (e.g. MySQL). You will build secure distributed web applications with customised, dynamically-adapting user interfaces.

Unit coordinator: Lindsay Wells (Lindsay.Wells@utas.edu.au)
Pre-requisite: KIT502
Lecture: Online, 2 hours weekly, Weeks 1-12.
Tutorial: 2 hours weekly, Weeks 1-12.

Assessment: 5 assessment tasks - Quiz 1 (20%, Week 8), Assignment 1: a secure web application with login/authenticator app/Discord chatbot features (25%, Week 8), Quiz 2 (20%, Week 13), Assignment 2: adding an intelligent web-service front-end to Assignment 1 (25%, Week 14), and weekly Tutorials (10% total, due the week following each scheduled tutorial).

Pass requirement: demonstrate attainment of each Intended Learning Outcome and achieve a final unit grade of 50% or greater.$txt$
)
on conflict (code) do update set
  name = excluded.name,
  semester = excluded.semester,
  color = excluded.color,
  outline_text = excluded.outline_text;

with course as (
  select id from courses where code = 'KIT514'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'schedule', $txt$KIT514 SECURE WEB AND CLOUD DEVELOPMENT (SEMESTER 2, 2026) - Weekly Schedule

Week 1: Lecture 1 - Introduction to Unit and Cloud. Tutorial 1 - Cloud Platform (Azure) and Web Deployment.

Week 2: Lecture 2 - Web Application Technologies and Pattern. Tutorial 2 - continuing Tutorial 1.

Week 3: Lecture 3 - Service Models and Load Balancing. Tutorial 3 - Load Balancing with HAProxy.

Week 4: Lecture 4 - More Load Balancing, Web Security, Password Hashing. Tutorial 4 - HTTPS, Encryption, XML and JSON.

Week 5: Lecture 5 - Web Security, OAuth, Cryptography, HTTPS. Tutorial 5 - Web APIs.

Week 6: Lecture 6 - Web Attacks. Tutorial 6 - Web Application Vulnerabilities.

Week 7: Lecture 7 - Web Services and SOAP. Tutorial 7 - REST APIs.

Week 8: Lecture 8 - REST APIs. Tutorial 8 - Introduction to NodeJS. Quiz 1 and Assignment 1 both due Sunday 6 Sept 2026 (exact time of day not published on Mylo).

Week 9: Lecture 9 - Web APIs and Web Crawling. Tutorial 9 - CRUD RESTful API with PHP and NodeJS.

Week 10: Lecture 10 - Recommender Systems. Tutorial 10 - Recommender Systems and Web Crawling.

Week 11: Lecture 11 - Containerization (Docker). Tutorial 11 - SOAP and Docker.

Week 12: Lecture 12 - Cloud Security / Unit Wrap Up. Assignment Help session (no new content).

Week 13 (study break): Quiz 2 due Sunday 11 Oct 2026 (exact time of day not published on Mylo).

Week 14: Assignment 2 due Sunday 18 Oct 2026 (exact time of day not published on Mylo).$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

with course as (
  select id from courses where code = 'KIT514'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'outline', $txt$Welcome to KIT514 Secure Web and Cloud Development (dual-coded KIT214/514). Advanced principles and practice for developing secure, scalable web deployments on a cloud platform: load balancing, server configuration, PHP/NodeJS Web Design Architecture, MySQL database management, and secure distributed web applications with dynamic, customised interfaces.

Unit coordinator: Lindsay Wells (Lindsay.Wells@utas.edu.au). Pre-requisite: KIT502. Lecture 2hr/week and Tutorial 2hr/week, Weeks 1-12. Assessment: Quiz 1 (20%, Week 8), Assignment 1 (25%, Week 8), Quiz 2 (20%, Week 13), Assignment 2 (25%, Week 14), weekly Tutorials (10%, due the week following each scheduled tutorial). Pass requires >=50% per Intended Learning Outcome and >=50% overall.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

-- Deadlines. due_at is left null for every item here because neither source
-- ever states a time of day (only a date, or only "Week N") - see the
-- header comment above. Confirm exact submission times on Mylo.
with course as (
  select id from courses where code = 'KIT514'
)
insert into deadlines (course_id, title, type, due_at, due_date_note, weight_percent, description, rubric_text, created_from)
select course.id, v.title, v.type, v.due_at, v.due_date_note, v.weight_percent, v.description, v.rubric_text, 'pasted'
from course, (
  values
    (
      'Quiz 1',
      'quiz',
      null::timestamptz,
      'Sunday 6 September 2026 (Week 8) - both the Unit Outline ("Week 8") and the Mylo Assessment Items page ("Sunday 6 September") agree on the date; neither states a time of day. Confirm exact time on Mylo.',
      20::numeric,
      'Assessment Task 1. Open-book quiz with two sections: Section 1 short-answer questions on security settings; Section 2 tests system design/programming capability with diagrams and programs. 1 hour.',
      'Criteria (Unit Outline): 1) Analyse the security issues in a given scenario (LO1, LO3). 2) Indicate solutions and techniques to solve security and scalability issues (LO2, LO3).'
    ),
    (
      'Assignment 1: Secure Login, Authenticator App Integration, and Discord Chatbot',
      'assignment',
      null,
      'Sunday 6 September 2026 (Week 8) - both sources agree on the date; neither states a time of day. Confirm exact time on Mylo.',
      25,
      'Assessment Task 2. Implement a web application with fundamental security features - a particular scenario consisting of a number of connected web pages, with correctly-configured web servers to protect access. MyLO names this item "Secure Login, Authenticator App Integration, and Discord Chatbot". Approx. 6 hours estimated.',
      'Criteria (Unit Outline): 1) Design and implement secure web application (LO4). 2) Analyse the situation and implement countermeasures to develop a secure web application (LO1, LO3). 3) Configure the web server securely (LO1, LO3).'
    ),
    (
      'Quiz 2',
      'quiz',
      null,
      'Sunday 11 October 2026 (Week 13) - both the Unit Outline ("Week 13") and the Mylo Assessment Items page ("Sunday 11 October") agree on the date; neither states a time of day. Confirm exact time on Mylo.',
      20,
      'Assessment Task 3. Open-book quiz with two sections: Section 1 short-answer questions on intelligent web services; Section 2 tests system design/programming capability with diagrams and programs. 1 hour.',
      'Criteria (Unit Outline): 1) Design intelligent cloud-based intelligent web applications (LO4). 2) Analyse and discuss security issues in traditional and cloud-based web applications (LO1). 3) Design configuration plans for cloud resources (LO2).'
    ),
    (
      'Assignment 2: Web Application with Intelligent Web-Service Front-End',
      'assignment',
      null,
      'Sunday 18 October 2026 (Week 14) - both the Unit Outline ("Week 14") and the Mylo Assessment Items page ("Sunday 18 October") agree on the date; neither states a time of day. Confirm exact time on Mylo. Note: Week 12 is "Unit Wrap Up" (last taught content) and Week 13 is explicitly the study break (per the weekly schedule), so Week 14 (12-18 Oct 2026) likely falls within the university''s study/exam period rather than a teaching week - the source material never uses that term for Week 14 itself, so this is inferred from the surrounding weeks, not stated outright.',
      25,
      'Assessment Task 4. Add new API-driven features to the Assignment 1 web application; the interface should provide intelligent recommendations and feedback based on the user''s choices. Approx. 6 hours estimated.',
      'Criteria (Unit Outline): 1) Implement secure web application to handle user input (LO4). 2) Implement individual web services for each component of the Web API (LO1, LO3). 3) Apply a configuration plan to web server (LO2).'
    ),
    (
      'Weekly Tutorial Tasks',
      'other',
      null,
      'Recurring, Weeks 1-12 - due by the week following each scheduled tutorial (per the Mylo Assessment Items page); exact per-week deadlines are not itemised anywhere in the source material. Confirm on Mylo.',
      10,
      'Assessment Task 5. Each week a topic for secure configurations or web programming is covered; students complete tutorial exercises and answer weekly questions about the completed work.',
      'Criteria (Unit Outline): 1) Apply different aspects of intelligent cloud computing solutions (LO2, LO4). 2) Analyse prevention techniques to solve security and scalability issues (LO1, LO3).'
    )
) as v(title, type, due_at, due_date_note, weight_percent, description, rubric_text)
on conflict (course_id, title) do update set
  type = excluded.type,
  due_at = excluded.due_at,
  due_date_note = excluded.due_date_note,
  weight_percent = excluded.weight_percent,
  description = excluded.description,
  rubric_text = excluded.rubric_text;

-- ===========================================================================
-- Seed data for KIT719 (course 4 of 4), "Natural Language Processing and
-- Generative AI". Sources cross-referenced: the live MyLO Assignments
-- dropbox export ("719/1.txt"), the official Unit Outline with assessment
-- schedule/details ("719/1 - Copy.txt"), and the study schedule table
-- ("719/1 - Copy (2).txt"). All three agree on Project 1 falling in Week 6 -
-- the Mylo export's exact date/time (16 Aug 2026) is treated as
-- authoritative over the outline/schedule's coarse "Week 6" label. Project 2
-- and the in-person test have no matching Mylo dropbox export in the
-- provided files, so only the coarse Week 12 / Week 13 labels are available
-- for those - flagged below rather than guessing exact times.
insert into courses (code, name, semester, color, outline_text)
values (
  'KIT719',
  'Natural Language Processing and Generative AI',
  'Semester 2 2026',
  '#db2777',
  $txt$KIT719 Natural Language Processing and Generative AI

Welcome to KIT719 Natural Language Processing and Generative AI. This unit gives insight into a range of NLP and Generative AI (GenAI) techniques - basic NLP pipeline steps plus advanced patterns such as information extraction and text summarisation, classification/clustering, text mining, sentiment analysis, and the use of GenAI for NLP application domains. You will use these technologies to develop a system for an NLP application.

Unit coordinator: Quan Bai (Quan.Bai@utas.edu.au)
Pre-requisite: KIT509
Lecture: On-campus, 1 hour weekly.
Tutorial: 2 hours weekly.

Assessment: 4 assessment tasks - Project 1 report (25%, Week 6, group NLP project + technical report + self-evaluation + peer review), Project 2 report (25%, Week 12, group text-analysis/GenAI project + demo), an in-person test (30%, Week 13, supervised, on-campus computer lab), and weekly tutorial tasks/quizzes (20% total, 2% each, Weeks 2-11).

Note: per the Unit Outline's "Alterations as a result of student feedback" section, assessment deadlines have been adjusted to align with a new 12-week semester schedule, and the ILO-to-assessment-item linkage has been updated.

Pass requirement: demonstrate attainment of each Intended Learning Outcome and achieve a final unit grade of 50% or greater.$txt$
)
on conflict (code) do update set
  name = excluded.name,
  semester = excluded.semester,
  color = excluded.color,
  outline_text = excluded.outline_text;

with course as (
  select id from courses where code = 'KIT719'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'schedule', $txt$KIT719 NATURAL LANGUAGE PROCESSING AND GENERATIVE AI (SEMESTER 2, 2026) - Study Schedule

Week 1: Introduction to the unit.

Week 2: Introduction to NLP 1. Tutorial tasks (2%).

Week 3: Introduction to NLP 2. Tutorial tasks (2%).

Week 4: Word Sense Disambiguation. Tutorial tasks (2%).

Week 5: Text mining. Tutorial tasks (2%).

Week 6: Sentiment analysis. Tutorial tasks (2%). Project 1 submission (25%) - Mylo shows the exact due date/time as 16 Aug 2026 12:00 for "Project 1: Technical Report & Self-review" (Turnitin-enabled), plus a separate "Project 1 Peer Review" due the same day at 23:59.

Week 7: Semantic Web. Tutorial tasks (2%).

Week 8: Introduction to GAI. Tutorial tasks (2%).

Week 9: Large Language Models. Tutorial tasks (2%).

Week 10: RAG. Tutorial tasks (2%).

Week 11: Agentic AI. Tutorial tasks (2%).

Week 12: Social media and SNA. Project 2 submission (25%). Project 2 demo. Exact day/time not yet published in the provided Mylo export - confirm.

Week 13: In-person test (30%), on-campus computer lab, supervised conditions, 1 hour. Exact day/time not yet published in the provided Mylo export - confirm.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

with course as (
  select id from courses where code = 'KIT719'
)
insert into course_documents (course_id, kind, raw_text)
select course.id, 'outline', $txt$Welcome to KIT719 Natural Language Processing and Generative AI - NLP and GenAI techniques including classification/clustering, text mining, sentiment analysis, and building an NLP application/system.

Unit coordinator: Quan Bai (Quan.Bai@utas.edu.au). Pre-requisite: KIT509. Lecture 1hr/week (on-campus) and Tutorial 2hr/week. Assessment: Project 1 report (25%, Week 6), Project 2 report (25%, Week 12), In-person test (30%, Week 13, supervised on-campus), weekly tutorial tasks/quizzes (20%, Weeks 2-11). Pass requires >=50% per Intended Learning Outcome and >=50% overall.$txt$
from course
on conflict (course_id, kind) do update set raw_text = excluded.raw_text;

-- Deadlines. Project 1's two items have exact Mylo-sourced due_at values;
-- Project 2, its demo, and the in-person test only have a "Week N" label
-- (no Mylo assignment-dropbox export for these was provided), so due_at is
-- left null with the known week noted in due_date_note - confirm exact
-- day/time on Mylo before relying on these.
with course as (
  select id from courses where code = 'KIT719'
)
insert into deadlines (course_id, title, type, due_at, due_date_note, weight_percent, description, rubric_text, created_from)
select course.id, v.title, v.type, v.due_at, v.due_date_note, v.weight_percent, v.description, v.rubric_text, 'pasted'
from course, (
  values
    (
      'Project 1: Technical Report & Self-Evaluation',
      'assignment',
      '2026-08-16T12:00:00+10:00'::timestamptz,
      null::text,
      25::numeric,
      'Assessment Task 1 (Project 1 report, Week 6). Group NLP project: develop an NLP approach against a simple requirement document and dataset, and produce a written report (~25 pages) covering the design and implementation, plus a self-evaluation. Turnitin-enabled Mylo submission; Mylo attachments include the Project 1 brief, a Peer Review Form and a Self Evaluation Form.',
      'Criteria (Unit Outline): 1) Explained the problem and background (LO2, LO4). 2) Justify the selected NLP methods (LO1, LO2, LO3). 3) Evaluate the designed NLP methods (LO2, LO3).'
    ),
    (
      'Project 1 Peer Review',
      'other',
      '2026-08-16T23:59:00+10:00'::timestamptz,
      null,
      null,
      'Peer review component accompanying Project 1, due later the same day as the Technical Report & Self-Evaluation. Its weighting is not stated separately from the 25% Project 1 report grade in the Unit Outline - confirm on Mylo whether this is separately marked or a hurdle requirement.',
      null
    ),
    (
      'Project 2 Report',
      'assignment',
      null,
      'Week 12 (28 Sept - 2 Oct 2026) - the Unit Outline and study schedule only state "Week 12"; no Mylo assignment-dropbox export for this item was provided. Confirm exact day/time on Mylo.',
      25,
      'Assessment Task 2 (Project 2 report, Week 12). Group project implementing text analysis / Generative AI techniques into an application; submit both the software product and a written report (~25 pages) covering objectives, design rationale and implementation specifications.',
      'Criteria (Unit Outline): 1) Explain the motivation and objectives (LO1, LO4). 2) Justify the selected text mining methods (LO3, LO4). 3) Evaluate the designed text mining methods (LO3, LO4). 4) Justify the conclusion based on the analysis result (LO2, LO4).'
    ),
    (
      'Project 2 Demo',
      'presentation',
      null,
      'Week 12 (28 Sept - 2 Oct 2026), alongside the Project 2 submission - the study schedule lists a "Project 2 demo" for this week with no further detail. Confirm exact day/time on Mylo. Week 12 still has a listed topic ("Social media and SNA"), so this is a normal teaching week, not the study break.',
      null,
      'In-class demonstration of the Project 2 software product. Weighting is not stated separately from the 25% Project 2 report grade - confirm on Mylo whether this is separately marked.',
      null
    ),
    (
      'In-Person Test',
      'exam',
      null,
      'Week 13 (5-9 Oct 2026) - on-campus computer lab, supervised conditions. The Unit Outline only states "Week 13"; no exact day/time was published in the provided source material. Confirm on Mylo. Note: unlike Weeks 1-12, the KIT719 study schedule lists no lecture/tutorial topic for Week 13 (just the test) - this is the same calendar week that KIT501 and KIT514''s own source material explicitly label the "study break"/swot-vac week, so this is very likely a non-teaching week for KIT719 too, even though KIT719''s own material never uses that term.',
      30,
      'Assessment Task 3. A 1-hour supervised in-person test held in a computer laboratory on campus; students must attend physically and complete the assessment under supervised conditions.',
      'Criteria (Unit Outline): 1) Explain NLP techniques to support decision making (LO1, LO2). 2) Analyse and apply techniques to support decision making (LO3, LO4).'
    ),
    (
      'Weekly Tutorial Tasks and Quizzes',
      'quiz',
      null,
      'Recurring, Weeks 2-11 (13 Jul - 25 Sept 2026) - a practical task or quiz each week related to the previous lecture; exact per-week due day/time is not stated anywhere in the source material. Confirm on Mylo.',
      20,
      'Assessment Task 4. Ten weekly tutorial tasks/quizzes worth 2% each (Weeks 2-11), each covering the concepts addressed in the preceding lecture.',
      'Criteria (Unit Outline): Explain the concepts addressed in each given weekly task (LO1, LO2).'
    )
) as v(title, type, due_at, due_date_note, weight_percent, description, rubric_text)
on conflict (course_id, title) do update set
  type = excluded.type,
  due_at = excluded.due_at,
  due_date_note = excluded.due_date_note,
  weight_percent = excluded.weight_percent,
  description = excluded.description,
  rubric_text = excluded.rubric_text;
