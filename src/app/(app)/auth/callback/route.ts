import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { RATE_LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/http";

export const maxDuration = 15;

const NO_STORE = { "Cache-Control": "no-store" };

function authErrorRedirect(origin: string, next: string | null) {
  const url = new URL("/", origin);
  url.searchParams.set("mode", "signin");
  url.searchParams.set("error", "auth");
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url, { headers: NO_STORE });
}

export async function GET(request: Request) {
  const limited = rateLimit(
    `auth.callback:${requestIp(request.headers)}`,
    RATE_LIMITS.authCallback
  );
  if (!limited.ok) return tooManyRequests(limited);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const next =
    requested &&
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : null;

  if (!code) {
    return authErrorRedirect(origin, next);
  }

  const sb = await supabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return authErrorRedirect(origin, next);
  }
  if (next) {
    return NextResponse.redirect(`${origin}${next}`, { headers: NO_STORE });
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return authErrorRedirect(origin, next);
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("interest")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.redirect(
    `${origin}${profile?.interest ? "/home" : "/onboarding"}`,
    { headers: NO_STORE }
  );
}
