import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type FeedSignal = {
  id: string;
  title: string;
  description: string | null;
  hashtags: string[] | null;
  created_at: string;
  group_name: string | null;
  group_slug: string | null;
  ups: number;
  downs: number;
  my_vote: boolean | null;
};

type RawFeed = {
  id: string;
  title: string;
  description: string | null;
  hashtags: string[] | null;
  created_at: string;
  groups: { name: string; slug: string } | { name: string; slug: string }[] | null;
  suggy_global_votes: { up: boolean; voter_id: string }[] | null;
};

function pickGroup(g: RawFeed["groups"]) {
  if (!g) return null;
  return Array.isArray(g) ? g[0] ?? null : g;
}

export async function publishedFeed(limit = 30): Promise<FeedSignal[]> {
  const sb = await supabaseServer();
  const user = await getUser();
  const { data } = await sb
    .from("suggies")
    .select(
      "id, title, description, hashtags, created_at, groups(name, slug), suggy_global_votes(up, voter_id)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as RawFeed[]).map((s) => {
    const votes = s.suggy_global_votes ?? [];
    const group = pickGroup(s.groups);
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      hashtags: s.hashtags,
      created_at: s.created_at,
      group_name: group?.name ?? null,
      group_slug: group?.slug ?? null,
      ups: votes.filter((v) => v.up).length,
      downs: votes.filter((v) => !v.up).length,
      my_vote: user ? votes.find((v) => v.voter_id === user.id)?.up ?? null : null,
    };
  });
}

export type TrendingSignal = {
  id: string;
  title: string;
  score: number;
  group_slug: string | null;
};

export async function trendingSignals(limit = 5): Promise<TrendingSignal[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("suggies")
    .select("id, title, created_at, groups(slug), suggy_global_votes(up)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as RawFeed[])
    .map((s) => {
      const votes = s.suggy_global_votes ?? [];
      return {
        id: s.id,
        title: s.title,
        score: votes.filter((v) => v.up).length - votes.filter((v) => !v.up).length,
        group_slug: pickGroup(s.groups)?.slug ?? null,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export type GroupSignal = {
  id: string;
  title: string;
  description: string | null;
  hashtags: string[] | null;
  status: string;
  votes_yes: number;
  votes_no: number;
  decide_by: string;
  created_at: string;
  outcome_reason: string | null;
  my_vote: boolean | null;
};

type RawGroupSignal = Omit<GroupSignal, "my_vote"> & {
  suggy_votes: { up: boolean; voter_id: string }[] | null;
};

export async function groupSignals(groupId: string): Promise<GroupSignal[]> {
  const sb = await supabaseServer();
  const user = await getUser();
  const { data } = await sb
    .from("suggies")
    .select(
      "id, title, description, hashtags, status, votes_yes, votes_no, decide_by, created_at, outcome_reason, suggy_votes(up, voter_id)"
    )
    .eq("group_id", groupId)
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  return ((data ?? []) as RawGroupSignal[]).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    hashtags: s.hashtags,
    status: s.status,
    votes_yes: s.votes_yes,
    votes_no: s.votes_no,
    decide_by: s.decide_by,
    created_at: s.created_at,
    outcome_reason: s.outcome_reason,
    my_vote: user
      ? (s.suggy_votes ?? []).find((v) => v.voter_id === user.id)?.up ?? null
      : null,
  }));
}
