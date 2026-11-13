import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { PUBLIC_FEED_CACHE, TAGS } from "@/lib/cache";

export type GroupRow = {
  id: string;
  slug: string;
  name: string;
  interest: string;
  active: boolean;
  created_at: string;
  member_count: number;
};

export async function interestCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife(PUBLIC_FEED_CACHE);
  cacheTag(TAGS.groups);

  const sb = supabasePublic();
  const { data } = await sb.from("groups").select("interest");
  const counts: Record<string, number> = {};
  (data ?? []).forEach((g: { interest: string }) => {
    counts[g.interest] = (counts[g.interest] ?? 0) + 1;
  });
  return counts;
}

export async function groupsByInterest(slug: string): Promise<GroupRow[]> {
  "use cache";
  cacheLife(PUBLIC_FEED_CACHE);
  cacheTag(TAGS.groups);

  const sb = supabasePublic();
  const { data } = await sb
    .from("groups")
    .select("id, slug, name, interest, active, created_at, group_members(count)")
    .eq("interest", slug)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((g: Record<string, unknown>) => ({
    id: g.id as string,
    slug: g.slug as string,
    name: g.name as string,
    interest: g.interest as string,
    active: g.active as boolean,
    created_at: g.created_at as string,
    member_count:
      Array.isArray(g.group_members) && g.group_members[0]
        ? ((g.group_members[0] as { count: number | string }).count as number)
        : 0,
  }));
}

export type GroupDetail = {
  id: string;
  slug: string;
  name: string;
  interest: string;
  rules: string | null;
  active: boolean;
  leader_id: string | null;
  members: {
    user_id: string;
    role: string;
    display_name: string | null;
    username: string | null;
  }[];
  invites: {
    id: string;
    token: string;
    email: string | null;
    status: string;
    expires_at: string | null;
  }[];
  invitees: {
    id: string;
    username: string;
    display_name: string | null;
    status: string;
    expires_at: string | null;
    responded_at: string | null;
  }[];
  myInvite: { id: string; expires_at: string | null } | null;
  isMember: boolean;
  isLeader: boolean;
  pendingRequest: { id: string; reason: string } | null;
  lastDenied: { reason: string | null; decided_at: string; retry_at: string } | null;
  openRequests: {
    id: string;
    user_id: string;
    reason: string;
    display_name: string | null;
    votes_yes: number;
    votes_no: number;
    my_vote: boolean | null;
  }[];
};

export async function groupBySlug(slug: string): Promise<GroupDetail | null> {
  const sb = await supabaseServer();

  // The user lookup and group lookup are independent. Run them together.
  const [groupResult, user] = await Promise.all([
    sb
      .from("groups")
      .select("id, slug, name, interest, rules, active, leader_id")
      .eq("slug", slug)
      .maybeSingle(),
    getUser(),
  ]);
  const group = groupResult.data;
  if (!group) return null;

  // Settle and read members together, but settling can add members (an
  // approved request becomes a group_member). Re-read only when the RPC
  // actually settled something so the common path stays one round trip.
  const [membersResult, settleResult] = await Promise.all([
    sb
      .from("group_members")
      .select("user_id, role, profiles(display_name, username)")
      .eq("group_id", group.id),
    user ? sb.rpc("settle_due_join_requests", { p_group: group.id }) : Promise.resolve(null),
  ]);

  const settledCount = typeof settleResult?.data === "number" ? settleResult.data : 0;
  const members =
    settledCount > 0
      ? (
          await sb
            .from("group_members")
            .select("user_id, role, profiles(display_name, username)")
            .eq("group_id", group.id)
        ).data
      : membersResult.data;

  const memberList = (members ?? []).map((m: Record<string, unknown>) => {
    const p = m.profiles as
      | { display_name: string | null; username: string | null }
      | { display_name: string | null; username: string | null }[]
      | null;
    const prof = Array.isArray(p) ? p[0] : p;
    return {
      user_id: m.user_id as string,
      role: m.role as string,
      display_name: prof?.display_name ?? null,
      username: prof?.username ?? null,
    };
  });

  const isMember = !!user && memberList.some((m) => m.user_id === user.id);
  const isLeader = !!user && group.leader_id === user.id;

  const loadInvites = async (): Promise<GroupDetail["invites"]> => {
    if (!isLeader) return [];
    const { data } = await sb
      .from("group_invites")
      .select("id, token, email, status, expires_at")
      .eq("group_id", group.id)
      .is("invitee_id", null)
      .order("created_at");
    return (data ?? []) as GroupDetail["invites"];
  };

  const loadInvitees = async (): Promise<GroupDetail["invitees"]> => {
    if (!isLeader) return [];
    const { data } = await sb
      .from("group_invites")
      .select(
        "id, status, expires_at, responded_at, created_at, profiles!group_invites_invitee_id_fkey(username, display_name)"
      )
      .eq("group_id", group.id)
      .not("invitee_id", "is", null)
      .order("created_at", { ascending: false });

    return (data ?? []).map((row: Record<string, unknown>) => {
      const p = row.profiles as
        | { username: string | null; display_name: string | null }
        | { username: string | null; display_name: string | null }[]
        | null;
      const prof = Array.isArray(p) ? p[0] : p;
      return {
        id: row.id as string,
        username: prof?.username ?? "member",
        display_name: prof?.display_name ?? null,
        status: row.status as string,
        expires_at: (row.expires_at as string | null) ?? null,
        responded_at: (row.responded_at as string | null) ?? null,
      };
    });
  };

  const loadMyInvite = async (): Promise<GroupDetail["myInvite"]> => {
    if (!user || isMember) return null;
    const { data } = await sb
      .from("group_invites")
      .select("id, expires_at, status")
      .eq("group_id", group.id)
      .eq("invitee_id", user.id)
      .eq("status", "invited")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at) <= new Date()) return null;
    return {
      id: data.id as string,
      expires_at: (data.expires_at as string | null) ?? null,
    };
  };

  const loadOpenRequests = async (): Promise<GroupDetail["openRequests"]> => {
    if (!isMember) return [];
    const { data } = await sb
      .from("join_requests")
      .select("id, user_id, reason, profiles(display_name), request_votes(yes, voter_id)")
      .eq("group_id", group.id)
      .eq("status", "pending");

    return (data ?? []).map((r: Record<string, unknown>) => {
      const p = r.profiles as { display_name: string | null } | { display_name: string | null }[] | null;
      const prof = Array.isArray(p) ? p[0] : p;
      const votes = (r.request_votes as { yes: boolean; voter_id: string }[] | null) ?? [];
      return {
        id: r.id as string,
        user_id: r.user_id as string,
        reason: r.reason as string,
        display_name: prof?.display_name ?? null,
        votes_yes: votes.filter((v) => v.yes).length,
        votes_no: votes.filter((v) => !v.yes).length,
        my_vote: user ? votes.find((v) => v.voter_id === user.id)?.yes ?? null : null,
      };
    });
  };

  // One query covers both the pending application and the latest denial.
  const loadOwnRequests = async (): Promise<{
    pendingRequest: GroupDetail["pendingRequest"];
    lastDenied: GroupDetail["lastDenied"];
  }> => {
    if (!user || isMember) return { pendingRequest: null, lastDenied: null };

    const { data } = await sb
      .from("join_requests")
      .select("id, reason, outcome_reason, status, decided_at")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .in("status", ["pending", "denied"]);

    const rows = (data ?? []) as {
      id: string;
      reason: string;
      outcome_reason: string | null;
      status: string;
      decided_at: string | null;
    }[];

    const pending = rows.find((row) => row.status === "pending") ?? null;
    const denied = rows
      .filter((row) => row.status === "denied" && row.decided_at)
      .sort((a, b) => (a.decided_at! < b.decided_at! ? 1 : -1))[0];

    if (!denied?.decided_at) {
      return {
        pendingRequest: pending ? { id: pending.id, reason: pending.reason } : null,
        lastDenied: null,
      };
    }

    const decided = new Date(denied.decided_at);
    const retry = new Date(decided.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      pendingRequest: pending ? { id: pending.id, reason: pending.reason } : null,
      lastDenied: {
        reason: denied.outcome_reason,
        decided_at: decided.toISOString(),
        retry_at: retry.toISOString(),
      },
    };
  };

  // These reads are independent of one another. Settling due suggies only
  // changes signal state, so it can run alongside the member-facing reads.
  const [invites, openRequests, ownRequests, invitees, myInvite] = await Promise.all([
    loadInvites(),
    loadOpenRequests(),
    loadOwnRequests(),
    loadInvitees(),
    loadMyInvite(),
    isMember ? sb.rpc("settle_due_suggies", { p_group: group.id }) : Promise.resolve(null),
  ]);

  return {
    ...(group as Omit<GroupDetail, "members" | "invites" | "invitees" | "myInvite" | "isMember" | "isLeader" | "pendingRequest" | "lastDenied" | "openRequests">),
    members: memberList,
    invites,
    invitees,
    myInvite,
    isMember,
    isLeader,
    pendingRequest: ownRequests.pendingRequest,
    lastDenied: ownRequests.lastDenied,
    openRequests,
  };
}

export type MyGroup = {
  role: string;
  group: { id: string; slug: string; name: string; interest: string; active: boolean } | null;
};

export const myGroups = cache(async (): Promise<MyGroup[]> => {
  const user = await getUser();
  if (!user) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("group_members")
    .select("role, groups(id, slug, name, interest, active)")
    .eq("user_id", user.id);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    role: row.role as string,
    group: (Array.isArray(row.groups) ? row.groups[0] : row.groups) as MyGroup["group"],
  }));
});
