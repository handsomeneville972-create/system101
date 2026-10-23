"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettings, type FormState } from "@/lib/actions/settings";
import { INTERESTS } from "@/lib/domain";
import type { Profile } from "@/lib/auth";
import type { DonateSurface } from "@/lib/donate";

const initial: FormState = {};

const SURFACES: { key: DonateSurface; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "ebooku", label: "Ebooku" },
  { key: "suggy", label: "Suggy" },
  { key: "apps", label: "Apps" },
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [state, action] = useActionState(saveSettings, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-medium">Profile</h2>
        <input
          name="display_name"
          defaultValue={profile?.display_name ?? ""}
          placeholder="Display name"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
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
          {INTERESTS.map((i) => (
            <option key={i.slug} value={i.slug}>
              {i.label}
            </option>
          ))}
        </select>
        <textarea
          name="bio"
          defaultValue={profile?.bio ?? ""}
          rows={3}
          placeholder="Bio"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <textarea
          name="goals"
          defaultValue={profile?.goals ?? ""}
          rows={2}
          placeholder="Goals"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-medium">Support button visibility</h2>
        <p className="text-sm text-zinc-400">Toggle per location. Reversible.</p>
        <div className="mt-4 space-y-3">
          {SURFACES.map((s) => (
            <label key={s.key} className="flex items-center justify-between text-sm">
              <span>{s.label}</span>
              <input
                type="checkbox"
                name={`donate_${s.key}`}
                defaultChecked={profile?.donate_surfaces?.[s.key] !== false}
              />
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="text-xs text-zinc-400">Saved.</p>}
      <Submit />
    </form>
  );
}
