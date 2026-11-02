"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { savePayoutAccount, type PayoutFormState } from "@/lib/actions/payouts";
import type { PayoutAccount } from "@/lib/data/earnings";

const initial: PayoutFormState = {};

const FIELD =
  "w-full rounded-md border hairline bg-black px-3 py-2 text-sm placeholder:text-zinc-600";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save payout details"}
    </button>
  );
}

export function PayoutForm({ account }: { account: PayoutAccount | null }) {
  const [state, action] = useActionState(savePayoutAccount, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-medium">Payout account</h2>
        <p className="text-xs text-zinc-400">
          Payouts are sent manually. Add the account where you want to be paid.
        </p>
        <input
          name="bank_name"
          defaultValue={account?.bank_name ?? ""}
          placeholder="Bank name"
          required
          className={FIELD}
        />
        <input
          name="account_name"
          defaultValue={account?.account_name ?? ""}
          placeholder="Account name"
          required
          className={FIELD}
        />
        <input
          name="account_number"
          defaultValue={account?.account_number ?? ""}
          placeholder="Account number"
          required
          inputMode="numeric"
          className={FIELD}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="country"
            defaultValue={account?.country ?? ""}
            placeholder="Country code (e.g. KE)"
            maxLength={2}
            className={FIELD}
          />
          <select
            name="currency"
            defaultValue={account?.currency ?? "USD"}
            aria-label="Payout currency"
            className={FIELD}
          >
            {["USD", "KES", "NGN", "GHS", "ZAR", "GBP", "EUR"].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Saved.</p>}
      <Submit />
    </form>
  );
}
