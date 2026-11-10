import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseFetch } from "@/lib/supabase-fetch";

// Use the untyped SupabaseClient rather than ReturnType<typeof createClient>:
// ReturnType collapses the generic parameters and makes every table `never`.
let adminClient: SupabaseClient | null = null;

/**
 * Service-role client. It must never carry user state, so one client per
 * server instance is safe and avoids re-creating it for every event write.
 */
export function supabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: supabaseFetch },
      }
    );
  }
  return adminClient;
}
