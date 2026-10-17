"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestToJoin, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Sending…" : "Request to join"}
    </button>
  );
}

export function JoinRequestForm({ groupId, slug }: { groupId: string; slug: string }) {
  const [state, action] = useActionState(requestToJoin, initial);
  if (state.ok) {
    return (
      <div className="card mt-6 p-6 text-sm text-zinc-300">
        Request sent. Members vote. 80% yes within 48h.
      </div>
    );
  }
  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="slug" value={slug} />
      <textarea
        name="reason"
        required
        minLength={50}
        rows={4}
        placeholder="Why should you join? (min 50 chars)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <Submit />
    </form>
  );
}
