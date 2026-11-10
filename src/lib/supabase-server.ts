import { cache } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseFetch } from "@/lib/supabase-fetch";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * One client per request. React's cache is request-scoped, so this is safe for
 * concurrent users while avoiding a new client for every data call.
 */
export const supabaseServer = cache(async () => {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: supabaseFetch },
      cookies: {
        getAll: () => store.getAll(),
        setAll: (pairs: CookieToSet[]) => {
          pairs.forEach(({ name, value, options }) => {
            try {
              store.set(name, value, options);
            } catch {
              // read-only in Server Component
            }
          });
        },
      },
    }
  );
});
