"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { voteOnJoinRequest, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function VoteButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-2">
      <button
        name="vote"
        value="yes"
        disabled={pending}
        className="btn-pill bg-white px-4 py-1.5 text-xs font-medium text-black disabled:opacity-50"
      >
        Yes
      </button>
      <button
        name="vote"
        value="no"
        disabled={pending}
        className="btn-pill border hairline px-4 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
      >
        No
      </button>
    </div>
  );
}

function RequestRow({
  slug,
  req,
}: {
  slug: string;
  req: {
    id: string;
    display_name: string | null;
    user_id: string;
    reason: string;
    votes_yes: number;
    votes_no: number;
    my_vote: boolean | null;
  };
}) {
  const [state, action] = useActionState(voteOnJoinRequest, initial);
  return (
    <form action={action} className="rounded-lg border hairline p-4">
      <input type="hidden" name="request_id" value={req.id} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            <Link href={`/u/${req.user_id}`} className="hover:underline">
              {req.display_name ?? "Applicant"}
            </Link>
          </p>
          <p className="mt-1 text-xs text-zinc-400">{req.reason}</p>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">
          {req.votes_yes} yes · {req.votes_no} no
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <VoteButtons />
        <input
          name="reason"
          placeholder="Reason if no (optional)"
          className="flex-1 rounded-md border hairline bg-black px-2 py-1 text-xs"
        />
      </div>
      {req.my_vote !== null && (
        <p className="mt-2 text-xs text-zinc-500">You voted {req.my_vote ? "yes" : "no"}.</p>
      )}
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

export function VotePanel({
  slug,
  requests,
}: {
  slug: string;
  requests: {
    id: string;
    display_name: string | null;
    user_id: string;
    reason: string;
    votes_yes: number;
    votes_no: number;
    my_vote: boolean | null;
  }[];
}) {
  if (requests.length === 0) {
    return <p className="text-sm text-zinc-500">No open requests.</p>;
  }
  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <RequestRow key={r.id} slug={slug} req={r} />
      ))}
    </div>
  );
}
