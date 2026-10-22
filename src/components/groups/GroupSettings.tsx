"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateGroup, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save group"}
    </button>
  );
}

export function GroupSettings({
  groupId,
  slug,
  name,
  rules,
}: {
  groupId: string;
  slug: string;
  name: string;
  rules: string | null;
}) {
  const [state, action] = useActionState(updateGroup, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="slug" value={slug} />
      <input
        name="name"
        defaultValue={name}
        required
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="rules"
        defaultValue={rules ?? ""}
        rows={4}
        placeholder="Group rules"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Saved.</p>}
      <Save />
    </form>
  );
}
