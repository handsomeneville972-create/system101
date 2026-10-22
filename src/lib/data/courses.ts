import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseListItem = {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  tags: string[] | null;
  created_at: string;
  creator_id: string | null;
  creator: string | null;
  has_pdf: boolean;
};

export type CourseDetail = CourseListItem & {
  video_provider: string;
  video_id: string;
  video_hash: string | null;
  video_url: string;
  is_creator: boolean;
};

type ProfileJoin = { display_name: string | null } | { display_name: string | null }[] | null;

function nameOf(p: ProfileJoin): string | null {
  const v = Array.isArray(p) ? p[0] : p;
  return v?.display_name ?? null;
}

export async function listCourses(limit = 60): Promise<CourseListItem[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("courses")
    .select("id,title,description,level,tags,created_at,creator_id,pdf_path,profiles(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    level: r.level as CourseLevel,
    tags: (r.tags as string[] | null) ?? null,
    created_at: r.created_at as string,
    creator_id: (r.creator_id as string | null) ?? null,
    creator: nameOf(r.profiles as ProfileJoin),
    has_pdf: !!r.pdf_path,
  }));
}

export async function courseDetail(id: string): Promise<CourseDetail | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("courses")
    .select(
      "id,title,description,level,tags,created_at,creator_id,status,pdf_path,video_provider,video_id,video_hash,video_url,profiles(display_name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const user = await getUser();
  const isCreator = !!user && data.creator_id === user.id;
  if (data.status !== "published" && !isCreator) return null;

  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string,
    level: data.level as CourseLevel,
    tags: (data.tags as string[] | null) ?? null,
    created_at: data.created_at as string,
    creator_id: (data.creator_id as string | null) ?? null,
    creator: nameOf(data.profiles as ProfileJoin),
    has_pdf: !!data.pdf_path,
    video_provider: data.video_provider as string,
    video_id: data.video_id as string,
    video_hash: (data.video_hash as string | null) ?? null,
    video_url: data.video_url as string,
    is_creator: isCreator,
  };
}
