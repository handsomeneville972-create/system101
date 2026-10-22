"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinNotify, type FormState } from "@/lib/actions/notify";

const initial: FormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Notify me"}
    </button>
  );
}

export function NotifyForm({ surface }: { surface: "apps" | "decourse" }) {
  const [state, action] = useActionState(joinNotify, initial);

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="surface" value={surface} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <Submit />
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">You are on the list.</p>}
    </form>
  );
}
