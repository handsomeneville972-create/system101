import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type GroupRow = {
  id: string;
  slug: string;
  name: string;
  profession: string;
  active: boolean;
  created_at: string;
  member_count: number;
};

export async function professionCounts(): Promise<Record<string, number>> {
  const sb = supabasePublic();
  const { data } = await sb.from("groups").select("profession");
  const counts: Record<string, number> = {};
  (data ?? []).forEach((g: { profession: string }) => {
    counts[g.profession] = (counts[g.profession] ?? 0) + 1;
  });
  return counts;
}

export async function groupsByProfession(slug: string): Promise<GroupRow[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("groups")
    .select("id, slug, name, profession, active, created_at, group_members(count)")
    .eq("profession", slug)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((g: Record<string, unknown>) => ({
    id: g.id as string,
    slug: g.slug as string,
    name: g.name as string,
    profession: g.profession as string,
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
  profession: string;
  rules: string | null;
  active: boolean;
  leader_id: string | null;
  members: { user_id: string; role: string; display_name: string | null }[];
  invites: {
    id: string;
    token: string;
    email: string | null;
    status: string;
    expires_at: string | null;
  }[];
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
  const { data: group } = await sb
    .from("groups")
    .select("id, slug, name, profession, rules, active, leader_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!group) return null;

  const user = await getUser();

  if (user) {
    await sb.rpc("settle_due_join_requests", { p_group: group.id });
  }

  const { data: members } = await sb
    .from("group_members")
    .select("user_id, role, profiles(display_name)")
    .eq("group_id", group.id);

  const memberList = (members ?? []).map((m: Record<string, unknown>) => {
    const p = m.profiles as { display_name: string | null } | { display_name: string | null }[] | null;
    const prof = Array.isArray(p) ? p[0] : p;
    return {
      user_id: m.user_id as string,
      role: m.role as string,
      display_name: prof?.display_name ?? null,
    };
  });

  const isMember = !!user && memberList.some((m) => m.user_id === user.id);
  const isLeader = !!user && group.leader_id === user.id;

  if (isMember) {
    await sb.rpc("settle_due_suggies", { p_group: group.id });
  }

  let invites: GroupDetail["invites"] = [];
  if (isLeader) {
    const { data: inv } = await sb
      .from("group_invites")
      .select("id, token, email, status, expires_at")
      .eq("group_id", group.id)
      .order("created_at");
    invites = (inv ?? []) as GroupDetail["invites"];
  }

  let pendingRequest: GroupDetail["pendingRequest"] = null;
  let lastDenied: GroupDetail["lastDenied"] = null;
  if (user && !isMember) {
    const { data: pr } = await sb
      .from("join_requests")
      .select("id, reason")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    pendingRequest = (pr as GroupDetail["pendingRequest"]) ?? null;

    const { data: dn } = await sb
      .from("join_requests")
      .select("outcome_reason, decided_at")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .eq("status", "denied")
      .order("decided_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dn?.decided_at) {
      const decided = new Date(dn.decided_at as string);
      const retry = new Date(decided.getTime() + 7 * 24 * 60 * 60 * 1000);
      lastDenied = {
        reason: (dn.outcome_reason as string | null) ?? null,
        decided_at: decided.toISOString(),
        retry_at: retry.toISOString(),
      };
    }
  }

  let openRequests: GroupDetail["openRequests"] = [];
  if (isMember) {
    const { data: reqs } = await sb
      .from("join_requests")
      .select("id, user_id, reason, profiles(display_name), request_votes(yes, voter_id)")
      .eq("group_id", group.id)
      .eq("status", "pending");

    openRequests = (reqs ?? []).map((r: Record<string, unknown>) => {
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
  }

  return {
    ...(group as Omit<GroupDetail, "members" | "invites" | "isMember" | "isLeader" | "pendingRequest" | "lastDenied" | "openRequests">),
    members: memberList,
    invites,
    isMember,
    isLeader,
    pendingRequest,
    lastDenied,
    openRequests,
  };
}

export type MyGroup = {
  role: string;
  group: { id: string; slug: string; name: string; profession: string; active: boolean } | null;
};

export async function myGroups(): Promise<MyGroup[]> {
  const user = await getUser();
  if (!user) return [];
  const sb = await supabaseServer();
  const { data } = await sb
    .from("group_members")
    .select("role, groups(id, slug, name, profession, active)")
    .eq("user_id", user.id);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    role: row.role as string,
    group: (Array.isArray(row.groups) ? row.groups[0] : row.groups) as MyGroup["group"],
  }));
}
