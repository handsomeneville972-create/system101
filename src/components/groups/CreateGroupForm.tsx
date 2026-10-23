"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INTERESTS } from "@/lib/domain";
import { createGroup, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create group"}
    </button>
  );
}

export function CreateGroupForm({ defaultInterest = "" }: { defaultInterest?: string }) {
  const [state, action] = useActionState(createGroup, initial);
  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <input
        name="name"
        required
        placeholder="Group name"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <select
        name="interest"
        required
        defaultValue={defaultInterest}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Pick an interest
        </option>
        {INTERESTS.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.label}
          </option>
        ))}
      </select>
      <input
        name="invite1"
        type="email"
        placeholder="Invite email 1 (optional)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <input
        name="invite2"
        type="email"
        placeholder="Invite email 2 (optional)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="rules"
        placeholder="Rules"
        rows={3}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <Submit />
    </form>
  );
}
