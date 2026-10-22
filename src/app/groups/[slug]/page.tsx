import Link from "next/link";
import { notFound } from "next/navigation";
import { groupBySlug } from "@/lib/data/groups";
import { groupSignals } from "@/lib/data/suggy";
import { getUser } from "@/lib/auth";
import { JoinRequestForm } from "@/components/groups/JoinRequestForm";
import { VotePanel } from "@/components/groups/VotePanel";
import { InviteLinks } from "@/components/groups/InviteLinks";
import { GroupSettings } from "@/components/groups/GroupSettings";
import { GroupMembers } from "@/components/groups/GroupMembers";
import { LeaveGroup } from "@/components/groups/LeaveGroup";
import { CancelJoinRequest } from "@/components/groups/CancelJoinRequest";
import { CreateSuggyForm } from "@/components/suggy/CreateSuggyForm";
import { SuggyVotePanel } from "@/components/suggy/SuggyVotePanel";

export const instant = false;

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { slug } = await params;
  const { created } = await searchParams;
  const group = await groupBySlug(slug);
  if (!group) notFound();

  const user = await getUser();
  const memberCount = group.members.length;
  const signals = group.isMember ? await groupSignals(group.id) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            group.active ? "bg-white/10 text-zinc-200" : "border hairline text-zinc-400"
          }`}
        >
          {group.active ? "active" : "forming"}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        {memberCount} {memberCount === 1 ? "member" : "members"} · Enter with reason. Members vote
        80% in 48h.
      </p>

      {created && group.isLeader && (
        <div className="card mt-6 p-6">
          <p className="text-sm text-zinc-300">
            Group created. Share these invites — 2 members joining activates the group.
          </p>
          <div className="mt-4">
            <InviteLinks invites={group.invites} groupId={group.id} slug={group.slug} />
          </div>
        </div>
      )}

      {group.rules && (
        <div className="card mt-6 p-6">
          <h2 className="text-sm font-medium">Rules</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{group.rules}</p>
        </div>
      )}

      {group.isMember ? (
        <div className="mt-6 space-y-6">
          {group.isLeader && !created && (
            <div className="card p-6">
              <h2 className="text-sm font-medium">Invites</h2>
              <div className="mt-3">
                <InviteLinks invites={group.invites} groupId={group.id} slug={group.slug} />
              </div>
            </div>
          )}
          {group.isLeader && (
            <div className="card p-6">
              <h2 className="text-sm font-medium">Group settings</h2>
              <div className="mt-3">
                <GroupSettings
                  groupId={group.id}
                  slug={group.slug}
                  name={group.name}
                  rules={group.rules}
                />
              </div>
            </div>
          )}
          <div className="card p-6">
            <h2 className="text-sm font-medium">Join requests</h2>
            <div className="mt-3">
              <VotePanel slug={group.slug} requests={group.openRequests} />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-sm font-medium">Signals</h2>
            <div className="mt-3 space-y-4">
              {group.isLeader && group.active && (
                <CreateSuggyForm groupId={group.id} slug={group.slug} />
              )}
              {group.isLeader && !group.active && (
                <p className="text-sm text-zinc-500">Activate the group to post signals.</p>
              )}
              <SuggyVotePanel slug={group.slug} signals={signals} />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-sm font-medium">Members</h2>
            <div className="mt-3">
              <GroupMembers
                groupId={group.id}
                slug={group.slug}
                members={group.members}
                leaderId={group.leader_id}
                isLeader={group.isLeader}
                currentUserId={user?.id ?? ""}
              />
            </div>
            {!group.isLeader && (
              <div className="mt-4 border-t hairline pt-4">
                <LeaveGroup groupId={group.id} />
              </div>
            )}
          </div>
        </div>
      ) : group.pendingRequest ? (
        <div className="card mt-6 p-6 text-sm text-zinc-300">
          Your request is pending. Members vote. 80% yes within 48h.
          <CancelJoinRequest requestId={group.pendingRequest.id} slug={group.slug} />
        </div>
      ) : group.lastDenied ? (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <h2 className="text-sm font-medium">Last application</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {group.lastDenied.reason ?? "Not enough yes votes."}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              {new Date(group.lastDenied.retry_at) > new Date()
                ? `You can request again on ${new Date(group.lastDenied.retry_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}.`
                : "You can request again now."}
            </p>
          </div>
          {new Date(group.lastDenied.retry_at) <= new Date() && user && (
            <JoinRequestForm groupId={group.id} slug={group.slug} />
          )}
        </div>
      ) : user && group.active ? (
        <JoinRequestForm groupId={group.id} slug={group.slug} />
      ) : user ? (
        <div className="card mt-6 p-6 text-sm text-zinc-400">
          This group is still forming. Invites activate it.
        </div>
      ) : (
        <div className="card mt-6 p-6">
          <p className="text-sm text-zinc-400">Sign in to request to join.</p>
          <Link
            href={`/auth/sign-in?next=/groups/${group.slug}`}
            className="btn-pill mt-4 inline-block bg-white px-5 py-2.5 text-sm font-medium text-black"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
