"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INTERESTS } from "@/lib/domain";
import { completeOnboarding, type OnboardingState } from "@/lib/actions/auth";
import { UsernameInput } from "@/components/profile/UsernameInput";

const initial: OnboardingState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Continue"}
    </button>
  );
}

export function OnboardingForm({
  profile,
}: {
  profile: {
    display_name: string | null;
    username: string;
    interest: string | null;
    goals: string | null;
  } | null;
}) {
  const [state, action] = useActionState(completeOnboarding, initial);

  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <input
        name="display_name"
        required
        defaultValue={profile?.display_name ?? ""}
        placeholder="Display name"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <UsernameInput defaultValue={profile?.username ?? ""} />
      <select
        name="interest"
        required
        defaultValue={profile?.interest ?? ""}
        aria-label="Interest"
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
      <textarea
        name="goals"
        defaultValue={profile?.goals ?? ""}
        placeholder="Goals (1 line)"
        rows={2}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      <Submit />
    </form>
  );
}
