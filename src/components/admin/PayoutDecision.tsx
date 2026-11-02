"use client";

import { useState, useTransition } from "react";
import { decidePayout } from "@/lib/actions/payouts";

export function PayoutDecision({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(status: "paid" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await decidePayout(id, status);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => decide("paid")}
        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black disabled:opacity-50"
      >
        Mark paid
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => decide("rejected")}
        className="rounded-full border hairline px-3 py-1 text-xs text-zinc-300 hover:text-white disabled:opacity-50"
      >
        Reject
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}
