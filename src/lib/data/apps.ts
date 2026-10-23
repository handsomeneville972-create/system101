import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type AppListItem = {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  developer_bio: string | null;
  category: string | null;
  tags: string[] | null;
  icon_url: string | null;
  created_at: string;
  author: string | null;
  uploader_id: string | null;
};

export type AppDetail = AppListItem & {
  repo_url: string | null;
  license: string | null;
  alternative_to: string | null;
  website_url: string | null;
  contact_email: string | null;
  status: string | null;
  is_uploader: boolean;
  screenshot_urls: string[];
};

type ProfileJoin = { display_name: string | null } | { display_name: string | null }[] | null;

function nameOf(p: ProfileJoin): string | null {
  const v = Array.isArray(p) ? p[0] : p;
  return v?.display_name ?? null;
}

export async function signPaths(bucket: string, paths: string[]): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (uniq.length === 0) return {};
  const admin = supabaseAdmin();
  const { data } = await admin.storage.from(bucket).createSignedUrls(uniq, 3600);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.signedUrl && d.path) map[d.path] = d.signedUrl;
  });
  return map;
}

const APP_CARD_FIELDS =
  "id,title,tagline,description,developer_bio,category,tags,icon_path,created_at,uploader_id,profiles(display_name)";

async function withIcons(rows: Record<string, unknown>[]): Promise<AppListItem[]> {
  const icons = await signPaths(
    "app-icons",
    rows.map((r) => (r.icon_path as string | null) ?? "").filter(Boolean)
  );

  return rows.map((r) => {
    const iconPath = (r.icon_path as string | null) ?? null;
    return {
      id: r.id as string,
      title: r.title as string,
      tagline: (r.tagline as string | null) ?? null,
      description: (r.description as string | null) ?? null,
      developer_bio: (r.developer_bio as string | null) ?? null,
      category: (r.category as string | null) ?? null,
      tags: (r.tags as string[] | null) ?? null,
      icon_url: iconPath ? icons[iconPath] ?? null : null,
      created_at: r.created_at as string,
      author: nameOf(r.profiles as ProfileJoin),
      uploader_id: (r.uploader_id as string | null) ?? null,
    };
  });
}

export async function listApps(limit = 60): Promise<AppListItem[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("apps")
    .select(APP_CARD_FIELDS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  return withIcons((data ?? []) as Record<string, unknown>[]);
}

export async function appsByUploader(
  uploaderId: string,
  limit = 6
): Promise<AppListItem[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("apps")
    .select(APP_CARD_FIELDS)
    .eq("uploader_id", uploaderId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  return withIcons((data ?? []) as Record<string, unknown>[]);
}

export async function appDetail(id: string): Promise<AppDetail | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("apps")
    .select(
      "id,title,tagline,description,developer_bio,category,tags,icon_path,screenshot_paths,repo_url,license,alternative_to,website_url,contact_email,status,uploader_id,created_at,profiles(display_name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  const row = data as Record<string, unknown>;
  const user = await getUser();
  const isUploader = !!user && row.uploader_id === user.id;

  const iconPath = (row.icon_path as string | null) ?? null;
  const screenshotPaths = ((row.screenshot_paths as string[] | null) ?? []) as string[];
  const icons = await signPaths("app-icons", iconPath ? [iconPath] : []);
  const screenshots = await signPaths("app-screenshots", screenshotPaths);

  return {
    id: row.id as string,
    title: row.title as string,
    tagline: (row.tagline as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    developer_bio: (row.developer_bio as string | null) ?? null,
    category: (row.category as string | null) ?? null,
    tags: (row.tags as string[] | null) ?? null,
    icon_url: iconPath ? icons[iconPath] ?? null : null,
    screenshot_urls: screenshotPaths
      .map((p) => screenshots[p])
      .filter((u): u is string => !!u),
    created_at: row.created_at as string,
    author: nameOf(row.profiles as ProfileJoin),
    uploader_id: (row.uploader_id as string | null) ?? null,
    repo_url: (row.repo_url as string | null) ?? null,
    license: (row.license as string | null) ?? null,
    alternative_to: (row.alternative_to as string | null) ?? null,
    website_url: (row.website_url as string | null) ?? null,
    contact_email: (row.contact_email as string | null) ?? null,
    status: (row.status as string | null) ?? null,
    is_uploader: isUploader,
  };
}
