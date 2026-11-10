import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseFetch } from "@/lib/supabase-fetch";

// Use the untyped SupabaseClient rather than ReturnType<typeof createClient>:
// ReturnType collapses the generic parameters and makes every table `never`.
let publicClient: SupabaseClient | null = null;

/**
 * Anonymous, stateless client. Reusing it avoids rebuilding the client for
 * every public query; it carries no per-user state.
 */
export function supabasePublic() {
  if (!publicClient) {
    publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: supabaseFetch },
      }
    );
  }
  return publicClient;
}
