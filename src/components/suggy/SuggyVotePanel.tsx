"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { GroupSignal } from "@/lib/data/suggy";
import { voteSuggy, type FormState } from "@/lib/actions/suggy";

const initial: FormState = {};

function VoteButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-2">
      <button
        name="vote"
        value="up"
        disabled={pending}
        className="btn-pill bg-white px-4 py-1.5 text-xs font-medium text-black disabled:opacity-50"
      >
        Yes
      </button>
      <button
        name="vote"
        value="down"
        disabled={pending}
        className="btn-pill border hairline px-4 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
      >
        No
      </button>
    </div>
  );
}

function hoursLeft(decideBy: string) {
  const ms = new Date(decideBy).getTime() - Date.now();
  if (ms <= 0) return "ended";
  return `${Math.ceil(ms / 3600000)}h left`;
}

function SignalRow({ slug, signal }: { slug: string; signal: GroupSignal }) {
  const [state, action] = useActionState(voteSuggy, initial);
  const voting = signal.status === "voting";

  return (
    <form action={action} className="rounded-lg border hairline p-4">
      <input type="hidden" name="suggy_id" value={signal.id} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{signal.title}</p>
          {signal.description && (
            <p className="mt-1 text-xs text-zinc-400">{signal.description}</p>
          )}
          {signal.hashtags?.length ? (
            <p className="mt-1 text-xs text-zinc-500">
              {signal.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-zinc-500">
          {voting
            ? `${signal.votes_yes} yes · ${signal.votes_no} no · ${hoursLeft(signal.decide_by)}`
            : signal.status}
        </span>
      </div>

      {voting && (
        <div className="mt-3 flex items-center gap-3">
          <VoteButtons />
          <input
            name="reason"
            placeholder="Reason if no (required to downvote)"
            className="flex-1 rounded-md border hairline bg-black px-2 py-1 text-xs"
          />
        </div>
      )}

      {signal.my_vote !== null && voting && (
        <p className="mt-2 text-xs text-zinc-500">
          You voted {signal.my_vote ? "yes" : "no"}.
        </p>
      )}
      {signal.status === "rejected" && signal.outcome_reason && (
        <p className="mt-2 text-xs text-zinc-500">Dissenter: {signal.outcome_reason}</p>
      )}
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

export function SuggyVotePanel({
  slug,
  signals,
}: {
  slug: string;
  signals: GroupSignal[];
}) {
  if (signals.length === 0) {
    return <p className="text-sm text-zinc-500">No signals yet.</p>;
  }
  return (
    <div className="space-y-3">
      {signals.map((s) => (
        <SignalRow key={s.id} slug={slug} signal={s} />
      ))}
    </div>
  );
}
