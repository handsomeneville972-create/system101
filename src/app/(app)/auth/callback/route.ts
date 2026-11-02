import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const next =
    requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : null;

  if (!code) return NextResponse.redirect(`${origin}/auth/sign-in?error=auth`);

  const sb = await supabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/auth/sign-in?error=auth`);
  if (next) return NextResponse.redirect(`${origin}${next}`);

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/auth/sign-in?error=auth`);

  const { data: profile } = await sb
    .from("profiles")
    .select("interest")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.redirect(
    `${origin}${profile?.interest ? "/home" : "/onboarding"}`
  );
}
