"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { leaveGroup, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function Leave() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "Leaving…" : "Leave group"}
    </button>
  );
}

export function LeaveGroup({ groupId }: { groupId: string }) {
  const [state, action] = useActionState(leaveGroup, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Leave this group?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="group_id" value={groupId} />
      <Leave />
      {state.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
