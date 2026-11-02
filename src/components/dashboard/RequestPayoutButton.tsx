"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPayout, type PayoutFormState } from "@/lib/actions/payouts";

const initial: PayoutFormState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Requesting…" : label}
    </button>
  );
}

export function RequestPayoutButton({ label }: { label: string }) {
  const [state, action] = useActionState(requestPayout, initial);

  return (
    <form action={action} className="space-y-2">
      <Submit label={label} />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Payout requested. We’ll review it.</p>}
    </form>
  );
}
