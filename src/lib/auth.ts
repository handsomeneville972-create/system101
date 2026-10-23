import { supabaseServer } from "@/lib/supabase-server";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  interest: string | null;
  bio: string | null;
  goals: string | null;
};

export async function getUser() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("profiles")
    .select("id, display_name, avatar_url, interest, bio, goals")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}
