"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  acceptDirectInvite,
  declineDirectInvite,
  type FormState,
} from "@/lib/actions/groups";

const initial: FormState = {};

function AcceptButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Joining…" : "Accept invite"}
    </button>
  );
}

function DeclineButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill border hairline px-5 py-2 text-sm text-zinc-300 disabled:opacity-50"
    >
      {pending ? "Declining…" : "Decline"}
    </button>
  );
}

export function InviteResponse({
  inviteId,
  slug,
  groupName,
}: {
  inviteId: string;
  slug: string;
  groupName: string;
}) {
  const [acceptState, accept] = useActionState(acceptDirectInvite, initial);
  const [declineState, decline] = useActionState(declineDirectInvite, initial);
  const error = acceptState.error ?? declineState.error;

  return (
    <div className="card mt-6 p-6">
      <h2 className="text-sm font-medium">You&apos;re invited</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Join <span className="text-white">{groupName}</span>. Accepting adds you as a
        member; two accepts activate the group.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={accept}>
          <input type="hidden" name="invite_id" value={inviteId} />
          <input type="hidden" name="slug" value={slug} />
          <AcceptButton />
        </form>
        <form action={decline}>
          <input type="hidden" name="invite_id" value={inviteId} />
          <input type="hidden" name="slug" value={slug} />
          <DeclineButton />
        </form>
      </div>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
