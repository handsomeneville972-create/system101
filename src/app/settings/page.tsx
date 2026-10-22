import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getProfile } from "@/lib/auth";

export const instant = false;

export default async function Settings() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/sign-in?next=/settings");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6">
        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
