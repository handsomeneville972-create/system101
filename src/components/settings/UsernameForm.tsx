"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveUsername, type UsernameState } from "@/lib/actions/username";
import { UsernameInput } from "@/components/profile/UsernameInput";
import type { Profile } from "@/lib/auth";

const initial: UsernameState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save username"}
    </button>
  );
}

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UsernameForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(saveUsername, initial);
  const nextChangeAt = profile.username_changed_at
    ? new Date(
        new Date(profile.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
      )
    : null;
  const locked = !!nextChangeAt && nextChangeAt > new Date();

  return (
    <form action={action} className="card mt-4 space-y-4 p-6">
      <div>
        <h2 className="text-sm font-medium">Username</h2>
        <p className="mt-1 text-xs text-zinc-500">
          How group leaders find you. Not your login.
        </p>
      </div>

      {locked ? (
        <div>
          <div className="flex items-center gap-2 rounded-md border hairline bg-black px-3 py-2 text-sm text-zinc-400">
            <span className="text-zinc-500">@</span>
            {profile.username}
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            You can change it on {dateLabel(nextChangeAt.toISOString())}.
          </p>
        </div>
      ) : (
        <>
          <UsernameInput key={profile.username} defaultValue={profile.username} />
          <p className="text-xs text-zinc-500">
            Changes are limited to once every 7 days.
          </p>
          <Submit />
        </>
      )}

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Username saved.</p>}
    </form>
  );
}
