import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (pairs) => {
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
}
