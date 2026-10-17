"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSuggy, type FormState } from "@/lib/actions/suggy";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Posting…" : "Post signal"}
    </button>
  );
}

export function CreateSuggyForm({ groupId, slug }: { groupId: string; slug: string }) {
  const [state, action] = useActionState(createSuggy, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="slug" value={slug} />
      <input
        name="title"
        required
        placeholder="Signal title"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="Description"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <input
        name="hashtags"
        placeholder="Hashtags (space separated)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Posted. Members vote 48h.</p>}
      <Submit />
    </form>
  );
}
