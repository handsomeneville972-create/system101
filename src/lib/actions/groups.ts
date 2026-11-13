"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { INTERESTS } from "@/lib/domain";
import { TAGS } from "@/lib/cache";
import { actionRateLimit } from "@/lib/action-limit";

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
  const limited = await actionRateLimit("groups.create", user.id, {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (limited) return { error: limited };
  const sb = await supabaseServer();

  const name = String(formData.get("name") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();

  if (!name || !interest) return { error: "Name and interest are required." };
  if (!INTERESTS.some((p) => p.slug === interest)) return { error: "Pick a valid interest." };

  let slug = slugify(name) || `group-${Date.now().toString(36)}`;
  const { data: existing } = await sb.from("groups").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: group, error } = await sb
    .from("groups")
    .insert({ slug, name, interest, rules, leader_id: user.id, active: false })
    .select("id, slug")
    .single();
  if (error) return { error: error.message };

  await sb.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "leader" });

  updateTag(TAGS.groups);
  revalidatePath("/findem");
  redirect(`/groups/${group.slug}?created=1`);
}

export async function requestToJoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in to request." };
  const limited = await actionRateLimit("groups.join", user.id, {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return { error: limited };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id"));
  const slug = String(formData.get("slug"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 50) return { error: "Reason must be at least 50 characters." };

  const { data, error } = await sb.rpc("request_to_join", {
    p_group: groupId,
    p_reason: reason,
  });
  if (error) return { error: error.message };
  const result = data as { status?: string; retry_at?: string } | null;

  if (result?.status === "cooldown") {
    const retry = result.retry_at ? new Date(result.retry_at) : null;
    return {
      error: `You were not approved recently. You can request again on ${
        retry ? retry.toISOString().slice(0, 10) : "a later date"
      }.`,
    };
  }
  if (result?.status === "already_member") return { error: "You are already a member." };
  if (result?.status === "pending") return { error: "You already have a pending request." };
  if (result?.status === "group_not_active") return { error: "This group is not accepting requests yet." };
  if (result?.status === "not_found") return { error: "Group not found." };
  if (result?.status !== "created") return { error: "Could not send request." };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function cancelJoinRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const sb = await supabaseServer();

  const requestId = String(formData.get("request_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!requestId) return { error: "Missing request." };

  const { data, error } = await sb.rpc("cancel_join_request", { p_request: requestId });
  if (error) return { error: error.message };
  if ((data as { status?: string } | null)?.status !== "cancelled") {
    return { error: "Could not cancel request." };
  }

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function voteOnJoinRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.vote", user.id, {
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return { error: limited };
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
  updateTag(TAGS.groups);
  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function acceptInvite(formData: FormData) {
  const user = await getUser();
  const token = String(formData.get("token") ?? "");
  if (!user) redirect(`/?mode=signin&next=${encodeURIComponent(`/groups/join?token=${token}`)}`);

  const sb = await supabaseServer();
  const { data: info } = await sb.rpc("join_invite_info", { p_token: token });
  const slug = (info as { group_slug?: string } | null)?.group_slug;

  const { data } = await sb.rpc("accept_group_invite", { p_token: token });
  const result = data as { status?: string } | null;

  if (result?.status === "accepted" || result?.status === "already_member") {
    updateTag(TAGS.groups);
  }

  if (result?.status === "accepted") redirect(slug ? `/groups/${slug}` : "/home");
  if (result?.status === "already_member") redirect(slug ? `/groups/${slug}` : "/home");
  if (result?.status === "already") {
    redirect(slug ? `/groups/${slug}?invite=used` : "/groups/join?error=used");
  }
  if (result?.status === "leader_cannot_accept") redirect(slug ? `/groups/${slug}` : "/home");
  redirect(`/groups/join?token=${token}&error=1`);
}

export type InviteLookup = {
  status: string;
  query?: string;
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    interest: string | null;
  } | null;
  suggestions?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    invited: boolean;
  }[];
  slots_left?: number;
  active?: boolean;
  interest?: string;
  error?: string;
};

export async function lookupGroupInvitees(
  groupId: string,
  query: string
): Promise<InviteLookup> {
  const user = await getUser();
  if (!user) return { status: "auth_required" };

  const limited = await actionRateLimit("groups.invite.search", user.id, {
    limit: 240,
    windowMs: 60_000,
  });
  if (limited) return { status: "rate_limited", error: limited };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("search_group_invitees", {
    p_group: groupId,
    p_query: query,
  });
  if (error) return { status: "error", error: error.message };
  return (data ?? { status: "error" }) as InviteLookup;
}

export type InviteState = FormState & { message?: string };

function inviteErrorMessage(status: string | undefined) {
  switch (status) {
    case "not_found":
      return "No member with that username.";
    case "wrong_interest":
      return "That username is in another interest.";
    case "self":
      return "That's your username.";
    case "member":
      return "That person is already a member.";
    case "already_invited":
      return "That person is already invited.";
    case "full":
      return "Both invite slots are used.";
    case "group_active":
      return "This group is already active. Use join requests.";
    case "not_leader":
      return "Leader only.";
    default:
      return "Could not send invite.";
  }
}

export async function sendGroupInvite(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.invite.send", user.id, {
    limit: 60,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  if (!groupId || !username) return { error: "Type a username first." };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("invite_group_member", {
    p_group: groupId,
    p_username: username,
  });
  if (error) return { error: error.message };

  const result = (data ?? {}) as { status?: string; username?: string };
  if (result.status !== "ok") {
    return { error: inviteErrorMessage(result.status) };
  }

  revalidatePath(`/groups/${slug}`);
  return {
    ok: true,
    message: `Invite sent to @${result.username ?? username.replace(/^@+/, "")}.`,
  };
}

export async function acceptDirectInvite(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.invite.accept", user.id, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const inviteId = String(formData.get("invite_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!inviteId) return { error: "Missing invite." };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("accept_group_invite_by_id", {
    p_invite: inviteId,
  });
  if (error) return { error: error.message };

  const result = (data ?? {}) as { status?: string };
  if (
    result.status === "accepted" ||
    result.status === "already_member" ||
    result.status === "already"
  ) {
    updateTag(TAGS.groups);
    revalidatePath(`/groups/${slug}`);
    revalidatePath("/home");
    redirect(`/groups/${slug}`);
  }

  if (result.status === "wrong_interest") {
    return { error: "Your interest changed. Ask the leader to invite you again." };
  }
  if (result.status === "expired") {
    revalidatePath(`/groups/${slug}`);
    return { error: "This invite has expired." };
  }
  if (result.status === "group_active") {
    return { error: "This group is already active. Request to join instead." };
  }
  if (result.status === "forbidden") return { error: "This invite is not yours." };
  if (result.status === "declined") return { error: "You already declined this invite." };
  if (result.status === "not_found") return { error: "Invite not found." };
  return { error: "Could not accept invite." };
}

export async function declineDirectInvite(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.invite.decline", user.id, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const inviteId = String(formData.get("invite_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!inviteId) return { error: "Missing invite." };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("decline_group_invite", {
    p_invite: inviteId,
  });
  if (error) return { error: error.message };

  const result = (data ?? {}) as { status?: string };
  if (
    result.status === "declined" ||
    result.status === "expired" ||
    result.status === "accepted"
  ) {
    revalidatePath(`/groups/${slug}`);
    return { ok: true };
  }
  if (result.status === "forbidden") return { error: "This invite is not yours." };
  return { error: "Could not decline invite." };
}

export async function regenerateInvite(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.invite.regen", user.id, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
  const sb = await supabaseServer();

  const inviteId = String(formData.get("invite_id") ?? "");
  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!inviteId || !groupId) return { error: "Missing invite." };

  const token = randomUUID().replace(/-/g, "");
  const { data, error } = await sb
    .from("group_invites")
    .update({
      token,
      status: "invited",
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      accepted_by: null,
      accepted_at: null,
    })
    .eq("id", inviteId)
    .eq("group_id", groupId)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Could not regenerate invite." };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function revokeInvite(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.invite.revoke", user.id, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
  const sb = await supabaseServer();

  const inviteId = String(formData.get("invite_id") ?? "");
  const groupId = String(formData.get("group_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!inviteId || !groupId) return { error: "Missing invite." };

  const { data, error } = await sb
    .from("group_invites")
    .delete()
    .eq("id", inviteId)
    .eq("group_id", groupId)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Could not revoke invite." };

  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function updateGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.update", user.id, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
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

  updateTag(TAGS.groups);
  revalidatePath(`/groups/${slug}`);
  revalidatePath("/findem");
  return { ok: true };
}

export async function removeMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.member.remove", user.id, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
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

  updateTag(TAGS.groups);
  revalidatePath(`/groups/${slug}`);
  return { ok: true };
}

export async function transferLeader(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in." };
  const limited = await actionRateLimit("groups.leader.transfer", user.id, {
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
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
  const limited = await actionRateLimit("groups.leave", user.id, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };
  const sb = await supabaseServer();

  const groupId = String(formData.get("group_id") ?? "");
  if (!groupId) return { error: "Missing group." };

  const { data, error } = await sb.rpc("leave_group", { p_group: groupId });
  if (error) return { error: error.message };
  const result = data as { status?: string; slug?: string } | null;

  if (result?.status === "leader_transfer_required") {
    return { error: "Transfer leadership before leaving." };
  }
  if (result?.status === "not_member") return { error: "You are not a member." };
  if (result?.status !== "left") return { error: "Could not leave group." };

  updateTag(TAGS.groups);
  revalidatePath("/home");
  if (result.slug) revalidatePath(`/groups/${result.slug}`);
  redirect("/home");
}
