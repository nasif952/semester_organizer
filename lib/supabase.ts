import { createClient, SupabaseClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * True once real Supabase credentials are present. Until a Supabase project
 * is provisioned, every data-access helper falls back to empty results
 * instead of throwing, so the app keeps building/running.
 */
export const isSupabaseConfigured = Boolean(
  NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let browserClient: SupabaseClient | null = null;

/**
 * Client-safe Supabase client using the public anon key. Returns null when
 * env vars are absent so client components can render a "connect Supabase"
 * empty state instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  if (!browserClient) {
    browserClient = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}

/**
 * Server-only Supabase client using the service role key. Intended for use
 * in Server Components, Server Actions, and Route Handlers only - never
 * import this from client components. Creates a fresh, stateless client per
 * call (cheap, avoids sharing sessions across requests).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
