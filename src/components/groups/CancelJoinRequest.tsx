"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cancelJoinRequest, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function Cancel() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "Canceling…" : "Cancel request"}
    </button>
  );
}

export function CancelJoinRequest({ requestId, slug }: { requestId: string; slug: string }) {
  const [state, action] = useActionState(cancelJoinRequest, initial);

  return (
    <form action={action}>
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="mt-3">
        <Cancel />
      </div>
      {state.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
