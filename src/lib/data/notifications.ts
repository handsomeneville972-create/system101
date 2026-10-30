import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { myGroups } from "@/lib/data/groups";
import type { NotificationFilter, NotificationItem } from "@/lib/notifications";

type GroupJoin =
  | { name: string; slug: string }
  | { name: string; slug: string }[]
  | null;

type RequestRow = { group_id: string; groups: GroupJoin };
type SignalRow = { id: string; group_id: string; groups: GroupJoin };

export type InboxGroup = {
  slug: string;
  name: string;
  count: number;
};

export type HomeInbox = {
  unread: number;
  requests: InboxGroup[];
  signals: InboxGroup[];
};

function groupOf(value: GroupJoin): { name: string; slug: string } | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function addGroup(
  map: Map<string, InboxGroup>,
  groupId: string,
  group: GroupJoin
) {
  const value = groupOf(group);
  if (!value) return;
  const current = map.get(groupId) ?? {
    slug: value.slug,
    name: value.name,
    count: 0,
  };
  current.count += 1;
  map.set(groupId, current);
}

function sorted(map: Map<string, InboxGroup>): InboxGroup[] {
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export async function unreadCount(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  const sb = await supabaseServer();
  const { count } = await sb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}

export async function listNotifications(
  filter: NotificationFilter,
  limit = 50
): Promise<NotificationItem[]> {
  const user = await getUser();
  if (!user) return [];

  const sb = await supabaseServer();
  let query = sb
    .from("notifications")
    .select("id,kind,title,body,href,read_at,created_at")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filter === "unread") query = query.is("read_at", null);

  const { data } = await query;
  return (data ?? []) as NotificationItem[];
}

export async function purgeMyNotifications(): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const sb = await supabaseServer();
  await sb.rpc("purge_my_notifications");
}

export async function homeInbox(): Promise<HomeInbox> {
  const user = await getUser();
  if (!user) return { unread: 0, requests: [], signals: [] };

  const groups = await myGroups();
  const groupIds = groups
    .map((item) => item.group?.id)
    .filter((id): id is string => !!id);
  const leaderIds = groups
    .filter((item) => item.role === "leader" && item.group)
    .map((item) => item.group!.id);

  const sb = await supabaseServer();

  if (groupIds.length === 0) {
    const { count } = await sb
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);

    return { unread: count ?? 0, requests: [], signals: [] };
  }

  await Promise.all(
    groupIds.map((id) =>
      sb.rpc("settle_due_join_requests", { p_group: id })
    )
  );
  await Promise.all(
    groupIds.map((id) => sb.rpc("settle_due_suggies", { p_group: id }))
  );

  const { count } = await sb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  const requestMap = new Map<string, InboxGroup>();
  if (leaderIds.length > 0) {
    const { data } = await sb
      .from("join_requests")
      .select("group_id, groups(name,slug)")
      .in("group_id", leaderIds)
      .eq("status", "pending");

    for (const row of (data ?? []) as RequestRow[]) {
      addGroup(requestMap, row.group_id, row.groups);
    }
  }

  const signalMap = new Map<string, InboxGroup>();
  const { data: signalData } = await sb
    .from("suggies")
    .select("id, group_id, groups(name,slug)")
    .in("group_id", groupIds)
    .eq("status", "voting");

  const signals = (signalData ?? []) as SignalRow[];
  if (signals.length > 0) {
    const { data: votes } = await sb
      .from("suggy_votes")
      .select("suggy_id")
      .eq("voter_id", user.id)
      .in(
        "suggy_id",
        signals.map((signal) => signal.id)
      );

    const voted = new Set((votes ?? []).map((vote) => vote.suggy_id));
    for (const signal of signals) {
      if (voted.has(signal.id)) continue;
      addGroup(signalMap, signal.group_id, signal.groups);
    }
  }

  return {
    unread: count ?? 0,
    requests: sorted(requestMap),
    signals: sorted(signalMap),
  };
}
