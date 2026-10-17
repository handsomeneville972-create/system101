import Link from "next/link";
import { notFound } from "next/navigation";
import { groupBySlug } from "@/lib/data/groups";
import { getUser } from "@/lib/auth";
import { JoinRequestForm } from "@/components/groups/JoinRequestForm";
import { VotePanel } from "@/components/groups/VotePanel";
import { InviteLinks } from "@/components/groups/InviteLinks";

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
            Group created. Share these invites — 2 accepted activates the group.
          </p>
          <div className="mt-4">
            <InviteLinks invites={group.invites} />
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
                <InviteLinks invites={group.invites} />
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
            <h2 className="text-sm font-medium">Members</h2>
            <ul className="mt-3 space-y-1 text-sm text-zinc-400">
              {group.members.map((m) => (
                <li key={m.user_id}>
                  {m.display_name ?? "Member"}
                  {m.role !== "member" && (
                    <span className="ml-2 text-xs text-zinc-500">{m.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : group.pendingRequest ? (
        <div className="card mt-6 p-6 text-sm text-zinc-300">
          Your request is pending. Members vote. 80% yes within 48h.
        </div>
      ) : user ? (
        <JoinRequestForm groupId={group.id} slug={group.slug} />
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
