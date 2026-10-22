"use client";

import { useActionState, useState } from "react";
import { regenerateInvite, revokeInvite, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

type Invite = {
  id: string;
  token: string;
  email: string | null;
  status: string;
  expires_at: string | null;
};

function InviteRow({
  invite,
  groupId,
  slug,
}: {
  invite: Invite;
  groupId: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const [regenState, regen] = useActionState(regenerateInvite, initial);
  const [revokeState, revoke] = useActionState(revokeInvite, initial);

  const path = `/groups/join?token=${invite.token}`;
  const expired =
    invite.status === "expired" ||
    (invite.status === "invited" &&
      !!invite.expires_at &&
      new Date(invite.expires_at) < new Date());
  const status = expired ? "expired" : invite.status;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border-t hairline py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 ${
            status === "accepted"
              ? "bg-white/10 text-zinc-200"
              : "border hairline text-zinc-400"
          }`}
        >
          {status}
        </span>
        {invite.email && <span className="text-zinc-500">{invite.email}</span>}
        <code className="min-w-0 flex-1 truncate text-zinc-400">{path}</code>
        {status === "invited" ? (
          <>
            <button onClick={copy} className="text-zinc-300 hover:text-white">
              {copied ? "Copied" : "Copy"}
            </button>
            <form action={regen}>
              <input type="hidden" name="invite_id" value={invite.id} />
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="slug" value={slug} />
              <button className="text-zinc-500 hover:text-zinc-200">New link</button>
            </form>
          </>
        ) : status === "expired" ? (
          <form action={regen}>
            <input type="hidden" name="invite_id" value={invite.id} />
            <input type="hidden" name="group_id" value={groupId} />
            <input type="hidden" name="slug" value={slug} />
            <button className="text-zinc-300 hover:text-white">New link</button>
          </form>
        ) : null}
        <form action={revoke}>
          <input type="hidden" name="invite_id" value={invite.id} />
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="slug" value={slug} />
          <button className="text-zinc-600 hover:text-red-400">Remove</button>
        </form>
      </div>
      {(regenState.error || revokeState.error) && (
        <p className="mt-1 text-xs text-red-400">{regenState.error ?? revokeState.error}</p>
      )}
    </div>
  );
}

export function InviteLinks({
  invites,
  groupId,
  slug,
}: {
  invites: Invite[];
  groupId: string;
  slug: string;
}) {
  if (invites.length === 0) {
    return <p className="text-sm text-zinc-500">No invites left.</p>;
  }
  return (
    <div className="space-y-1">
      {invites.map((inv) => (
        <InviteRow key={inv.id} invite={inv} groupId={groupId} slug={slug} />
      ))}
    </div>
  );
}
