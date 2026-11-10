import { cache } from "react";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

export type SessionUser = {
  id: string;
  email: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  interest: string | null;
  bio: string | null;
  goals: string | null;
};

const PROXY_USER_ID = "x-ds-user-id";
const PROXY_USER_EMAIL = "x-ds-user-email";
const PROXY_AUTH_CHECKED = "x-ds-auth-checked";

type ProxyAuth = { checked: boolean; user: SessionUser | null };

/**
 * The proxy verifies the Supabase session once per request and forwards the
 * result as internal request headers. Reading them here avoids a second Auth
 * round trip from every Server Component that needs the current user.
 */
async function userFromProxy(): Promise<ProxyAuth> {
  const requestHeaders = await headers();
  const checked = requestHeaders.get(PROXY_AUTH_CHECKED) === "1";
  const id = requestHeaders.get(PROXY_USER_ID);
  if (!checked || !id) return { checked, user: null };

  return {
    checked,
    user: {
      id,
      email: requestHeaders.get(PROXY_USER_EMAIL) || null,
    },
  };
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const fromProxy = await userFromProxy();
  if (fromProxy.user) return fromProxy.user;

  // The proxy already determined there is no session. Do not pay for a second
  // Auth request on every anonymous page view.
  if (fromProxy.checked) return null;

  // Fallback for requests that did not pass through the proxy.
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  return user ? { id: user.id, email: user.email ?? null } : null;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const sb = await supabaseServer();
  const { data } = await sb
    .from("profiles")
    .select("id, display_name, avatar_url, interest, bio, goals")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
});
