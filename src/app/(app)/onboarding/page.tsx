import { redirect } from "next/navigation";
import { INTERESTS } from "@/lib/domain";
import { completeOnboarding } from "@/lib/actions/auth";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

export const instant = false;

export default async function Onboarding() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/onboarding");

  const sb = await supabaseServer();
  const { data: profile } = await sb
    .from("profiles")
    .select("display_name, interest, goals")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.interest) redirect("/home");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="mt-1 text-sm text-zinc-400">Pick an interest. Tell goals.</p>
      <form action={completeOnboarding} className="card mt-6 space-y-4 p-6">
        <input
          name="display_name"
          required
          defaultValue={profile?.display_name ?? ""}
          placeholder="Display name"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <select
          name="interest"
          required
          defaultValue={profile?.interest ?? ""}
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
        <button className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black">
          Continue
        </button>
      </form>
    </div>
  );
}
