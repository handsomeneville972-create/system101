"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

function parseHashtags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

export async function createSuggy(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const hashtags = parseHashtags(String(formData.get("hashtags") ?? ""));

  if (!title) return { error: "Title is required." };

  const { data: group } = await sb
    .from("groups")
    .select("id, leader_id, active")
    .eq("id", groupId)
    .maybeSingle();
  if (!group) return { error: "Group not found." };
  if (group.leader_id !== user.id) return { error: "Only the leader can post a signal." };
  if (!group.active) return { error: "Group must be active first." };

  const { error } = await sb.from("suggies").insert({
    group_id: groupId,
    title,
    description: description || null,
    hashtags: hashtags.length ? hashtags : null,
    status: "voting",
  });
  if (error) return { error: error.message };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function voteSuggy(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const suggyId = String(formData.get("suggy_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const up = formData.get("vote") === "up";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!up && !reason) return { error: "Reason required for a downvote." };

  const { error } = await sb
    .from("suggy_votes")
    .upsert({ suggy_id: suggyId, voter_id: user.id, up, reason });
  if (error) return { error: error.message };

  await sb.rpc("settle_suggy", { p_suggy: suggyId });
  revalidatePath(`/groups/${slug}`);
  revalidatePath("/suggy");
  return { ok: true };
}

export async function voteGlobalSuggy(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in to vote." };
  const sb = await supabaseServer();

  const suggyId = String(formData.get("suggy_id") ?? "");
  const up = formData.get("vote") === "up";

  const { error } = await sb
    .from("suggy_global_votes")
    .upsert({ suggy_id: suggyId, voter_id: user.id, up });
  if (error) return { error: error.message };

  revalidatePath("/suggy");
  return { ok: true };
}
