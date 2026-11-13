import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

export const instant = false;

export default async function Onboarding() {
  const user = await getUser();
  if (!user) redirect("/?mode=signin&next=/onboarding");

  const sb = await supabaseServer();
  const { data: profile } = await sb
    .from("profiles")
    .select("display_name, username, interest, goals")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.interest) redirect("/home");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Pick a username and interest. Tell goals.
      </p>
      <OnboardingForm profile={profile} />
    </div>
  );
}
