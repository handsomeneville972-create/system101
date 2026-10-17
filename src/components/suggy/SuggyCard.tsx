"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import type { FeedSignal } from "@/lib/data/suggy";
import { voteGlobalSuggy, type FormState } from "@/lib/actions/suggy";

const initial: FormState = {};

function Score() {
  const { pending } = useFormStatus();
  return pending ? <span className="text-xs text-zinc-500">…</span> : null;
}

export function SuggyCard({ signal }: { signal: FeedSignal }) {
  const [state, action] = useActionState(voteGlobalSuggy, initial);
  const score = signal.ups - signal.downs;

  return (
    <form action={action} className="card flex items-center gap-4 p-4">
      <input type="hidden" name="suggy_id" value={signal.id} />
      <div className="flex flex-col items-center gap-1">
        <button
          name="vote"
          value="up"
          aria-label="Upvote"
          className={`hover:text-white ${signal.my_vote === true ? "text-white" : "text-zinc-400"}`}
        >
          <ArrowBigUp size={20} />
        </button>
        <span className="text-sm">{score}</span>
        <button
          name="vote"
          value="down"
          aria-label="Downvote"
          className={`hover:text-white ${signal.my_vote === false ? "text-white" : "text-zinc-400"}`}
        >
          <ArrowBigDown size={20} />
        </button>
      </div>
      <div className="flex-1">
        <p className="font-medium">{signal.title}</p>
        {signal.description && (
          <p className="mt-1 text-sm text-zinc-400">{signal.description}</p>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {signal.hashtags?.length
            ? signal.hashtags.map((h) => `#${h}`).join(" ") + " · "
            : ""}
          {signal.group_slug ? (
            <a href={`/groups/${signal.group_slug}`} className="underline">
              Join group →
            </a>
          ) : (
            "Group"
          )}
        </p>
        <Score />
        {state.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
