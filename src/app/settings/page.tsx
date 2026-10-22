import Link from "next/link";
import { redirect } from "next/navigation";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getProfile } from "@/lib/auth";
import { signedAvatar } from "@/lib/data/profiles";

export const instant = false;

export default async function Settings() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/sign-in?next=/settings");
  const avatarUrl = await signedAvatar(profile.avatar_url);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link
          href={`/u/${profile.id}`}
          className="text-xs text-zinc-400 underline hover:text-zinc-200"
        >
          View public profile
        </Link>
      </div>
      <div className="card mt-6 p-6">
        <h2 className="text-sm font-medium">Photo</h2>
        <div className="mt-4">
          <AvatarUploader currentUrl={avatarUrl} />
        </div>
      </div>
      <div className="mt-4">
        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
