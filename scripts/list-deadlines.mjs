import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const sb = createClient(
  'https://xlwaqdftxcvbspimfmyf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsd2FxZGZ0eGN2YnNwaW1mbXlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDcxNDMxNSwiZXhwIjoyMTAwMjkwMzE1fQ.E2RfAPGaOQ5hAPNLS2WbBcVFqAuIjCM7Ia71U4euGgs'
);

// Find KIT514 Assignment 1 and update its due date
const { data: courses } = await sb.from('courses').select('id,code').eq('code', 'KIT514').single();
const { data: rows, error: fe } = await sb
  .from('deadlines')
  .select('id,title')
  .eq('course_id', courses.id)
  .ilike('title', '%Assignment 1%');

if (fe) { console.error(fe); process.exit(1); }
console.log('Found:', JSON.stringify(rows));

// 6 Sep 2026 23:55 AEST = 6 Sep 2026 13:55 UTC
const { error: ue } = await sb
  .from('deadlines')
  .update({ due_at: '2026-09-06T13:55:00+00:00' })
  .eq('id', rows[0].id);

if (ue) { console.error(ue); process.exit(1); }
console.log('Updated due_at for:', rows[0].title);
