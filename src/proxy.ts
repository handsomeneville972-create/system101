import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseFetch } from "@/lib/supabase-fetch";

const PROTECTED = [
  "/home",
  "/messages",
  "/notifications",
  "/groups/new",
  "/onboarding",
  "/settings",
  "/admin",
  "/ebooku/upload",
  "/decourse/upload",
  "/dashboard",
];

const INTERNAL_USER_ID = "x-ds-user-id";
const INTERNAL_USER_EMAIL = "x-ds-user-email";
const INTERNAL_AUTH_CHECKED = "x-ds-auth-checked";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function isProtected(path: string) {
  return PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));
}

function hasAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

function signInRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("mode", "signin");
  url.searchParams.set("next", `${path}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

/** Legacy auth URLs live at the root now. Redirect before rendering. */
function legacyAuthRedirect(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path !== "/auth/sign-in" && path !== "/auth/sign-up") return null;

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("mode", path === "/auth/sign-up" ? "signup" : "signin");

  const next = request.nextUrl.searchParams.get("next");
  const error = request.nextUrl.searchParams.get("error");
  if (next) url.searchParams.set("next", next);
  if (error) url.searchParams.set("error", error);

  return NextResponse.redirect(url);
}

/** Recovery links require a session; without one, restart at sign in. */
function recoveryRedirect(request: NextRequest) {
  if (request.nextUrl.pathname !== "/auth/reset-password") return null;
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("mode", "signin");
  url.searchParams.set("error", "auth");
  return NextResponse.redirect(url);
}

function withCookies(response: NextResponse, cookies: CookieToSet[]) {
  cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const legacyRedirect = legacyAuthRedirect(request);
  if (legacyRedirect) return legacyRedirect;

  const protectedRoute = isProtected(path);

  // Never trust identity headers supplied by the client. Only this proxy may
  // set them, after Supabase has verified the session.
  request.headers.delete(INTERNAL_USER_ID);
  request.headers.delete(INTERNAL_USER_EMAIL);
  request.headers.delete(INTERNAL_AUTH_CHECKED);

  // Anonymous traffic is the majority of public pages. Skip the Auth request
  // entirely when there is no session cookie to verify. Mark the request as
  // checked so getUser() does not fall back to a redundant Auth call.
  if (!hasAuthCookie(request)) {
    if (protectedRoute) return signInRedirect(request);
    const recovery = recoveryRedirect(request);
    if (recovery) return recovery;
    request.headers.set(INTERNAL_AUTH_CHECKED, "1");
    return NextResponse.next({ request: { headers: request.headers } });
  }

  const cookiesToSet: CookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: supabaseFetch },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (pairs: CookieToSet[]) => {
          cookiesToSet.push(...pairs);
          pairs.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    request.headers.set(INTERNAL_AUTH_CHECKED, "1");
    if (protectedRoute) return withCookies(signInRedirect(request), cookiesToSet);
    const recovery = recoveryRedirect(request);
    if (recovery) return withCookies(recovery, cookiesToSet);
    return withCookies(
      NextResponse.next({ request: { headers: request.headers } }),
      cookiesToSet
    );
  }

  request.headers.set(INTERNAL_AUTH_CHECKED, "1");
  request.headers.set(INTERNAL_USER_ID, user.id);
  if (user.email) request.headers.set(INTERNAL_USER_EMAIL, user.email);

  return withCookies(
    NextResponse.next({ request: { headers: request.headers } }),
    cookiesToSet
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
