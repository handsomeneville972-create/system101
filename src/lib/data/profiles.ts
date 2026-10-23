import { interestLabel } from "@/lib/domain";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";
import { appsByUploader, type AppListItem } from "@/lib/data/apps";
import { listEbooks, type EbookListItem } from "@/lib/data/ebooks";

export type ProfileGroup = {
  slug: string;
  name: string;
  interest: string;
  active: boolean;
};

export type PublicProfile = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  interest: string | null;
  interest_label: string | null;
  bio: string | null;
  goals: string | null;
  created_at: string;
  groups: ProfileGroup[];
  apps: AppListItem[];
  ebooks: EbookListItem[];
};

type GroupJoin =
  | { id: string; slug: string; name: string; interest: string; active: boolean }
  | { id: string; slug: string; name: string; interest: string; active: boolean }[]
  | null;

function groupOf(g: GroupJoin): ProfileGroup | null {
  const v = Array.isArray(g) ? g[0] : g;
  return v ? { slug: v.slug, name: v.name, interest: v.interest, active: v.active } : null;
}

export async function signedAvatar(path: string | null): Promise<string | null> {
  if (!path) return null;
  const admin = supabaseAdmin();
  const { data } = await admin.storage.from("avatars").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function profileById(id: string): Promise<PublicProfile | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("profiles")
    .select("id, display_name, avatar_url, interest, bio, goals, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const [{ data: memberships }, ebooks, apps, avatarUrl] = await Promise.all([
    sb
      .from("group_members")
      .select("role, groups(id, slug, name, interest, active)")
      .eq("user_id", id),
    listEbooks("all", 6, id),
    appsByUploader(id, 6),
    signedAvatar(data.avatar_url ?? null),
  ]);

  const groups = ((memberships ?? []) as { groups: GroupJoin }[])
    .map((m) => groupOf(m.groups))
    .filter((g): g is ProfileGroup => !!g)
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));

  const interest = data.interest ?? null;

  return {
    id: data.id as string,
    display_name: (data.display_name as string | null) ?? null,
    avatar_path: (data.avatar_url as string | null) ?? null,
    avatar_url: avatarUrl,
    interest,
    interest_label: interestLabel(interest),
    bio: (data.bio as string | null) ?? null,
    goals: (data.goals as string | null) ?? null,
    created_at: data.created_at as string,
    groups,
    apps,
    ebooks,
  };
}
