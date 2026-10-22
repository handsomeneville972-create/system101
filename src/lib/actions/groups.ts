"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };
  const sb = await supabaseServer();

  const name = String(formData.get("name") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();
  const inviteEmails = [formData.get("invite1"), formData.get("invite2")]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

  if (!name || !profession) return { error: "Name and craft are required." };

  let slug = slugify(name) || `group-${Date.now().toString(36)}`;
  const { data: existing } = await sb.from("groups").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: group, error } = await sb
    .from("groups")
    .insert({ slug, name, profession, rules, leader_id: user.id, active: false })
    .select("id, slug")
    .single();
  if (error) return { error: error.message };

  await sb.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "leader" });

  const rows: { group_id: string; email: string | null }[] = inviteEmails
    .slice(0, 2)
    .map((email) => ({ group_id: group.id, email }));
  while (rows.length < 2) rows.push({ group_id: group.id, email: null });
  await sb.from("group_invites").insert(rows);

  revalidatePath("/findem");
  redirect(`/groups/${group.slug}?created=1`);
}

export async function requestToJoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in to request." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id"));
  const slug = String(formData.get("slug"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 50) return { error: "Reason must be at least 50 characters." };

  const { data: member } = await sb
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member) return { error: "You are already a member." };

  const { data: pending } = await sb
    .from("join_requests")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (pending) return { error: "You already have a pending request." };

  const { data: denied } = await sb
    .from("join_requests")
    .select("decided_at, created_at")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "denied")
    .order("decided_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (denied) {
    const base = new Date((denied.decided_at ?? denied.created_at) as string);
    const retry = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (retry > new Date()) {
      return {
        error: `You were not approved recently. You can request again on ${retry
          .toISOString()
          .slice(0, 10)}.`,
      };
    }
  }

  const { error } = await sb.from("join_requests").insert({ group_id: groupId, user_id: user.id, reason });
  if (error) return { error: error.message };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function voteOnJoinRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const requestId = String(formData.get("request_id"));
  const slug = String(formData.get("slug"));
  const yes = formData.get("vote") === "yes";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const { error } = await sb
    .from("request_votes")
    .upsert({ request_id: requestId, voter_id: user.id, yes, reason });
  if (error) return { error: error.message };

  await sb.rpc("settle_join_request", { p_request: requestId });
  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function acceptInvite(formData: FormData) {
  const user = await getUser();
  const token = String(formData.get("token") ?? "");
  if (!user) redirect(`/auth/sign-in?next=${encodeURIComponent(`/groups/join?token=${token}`)}`);

  const sb = await supabaseServer();
  const { data } = await sb.rpc("accept_group_invite", { p_token: token });
  const result = data as { status?: string } | null;
  if (result?.status === "not_found" || result?.status === "expired") {
    redirect(`/groups/join?token=${token}&error=1`);
  }
  redirect("/home");
}

export async function updateGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (name.length > 80) return { error: "Name is too long." };
  if (rules.length > 2000) return { error: "Rules are too long." };

  const { data: group } = await sb
    .from("groups")
    .select("leader_id")
    .eq("id", groupId)
    .maybeSingle();
  if (!group || group.leader_id !== user.id) return { error: "Leader only." };

  const { error } = await sb
    .from("groups")
    .update({ name, rules: rules || null })
    .eq("id", groupId)
    .eq("leader_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${slug}`);
  revalidatePath("/findem");
  return { ok: true };
}

export async function removeMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const target = String(formData.get("user_id") ?? "");
  if (!target || target === user.id) return { error: "You cannot remove yourself." };

  const { data: group } = await sb
    .from("groups")
    .select("leader_id")
    .eq("id", groupId)
    .maybeSingle();
  if (!group || group.leader_id !== user.id) return { error: "Leader only." };

  const { error } = await sb
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", target);
  if (error) return { error: error.message };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function transferLeader(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const target = String(formData.get("user_id") ?? "");
  if (!target) return { error: "Pick a member." };

  const { data } = await sb.rpc("transfer_group_leadership", {
    p_group: groupId,
    p_new_leader: target,
  });
  const status = (data as { status?: string } | null)?.status;

  if (status === "not_member") return { error: "That person is not a member." };
  if (status === "same") return { error: "You are already leader." };
  if (status !== "transferred") return { error: "Could not transfer leadership." };

  revalidatePath(`/groups/${slug}`);
  revalidatePath("/home");
  return { ok: true };
}

export async function leaveGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  const { data: group } = await sb
    .from("groups")
    .select("leader_id, slug")
    .eq("id", groupId)
    .maybeSingle();
  if (!group) return { error: "Group not found." };
  if (group.leader_id === user.id) {
    return { error: "Transfer leadership before leaving." };
  }

  const { error } = await sb
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/home");
  revalidatePath(`/groups/${group.slug}`);
  redirect("/home");
}
