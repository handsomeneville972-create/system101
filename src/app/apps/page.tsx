import { DonateButton } from "@/components/DonateButton";
import { NotifyForm } from "@/components/NotifyForm";
import { Monitor, Apple } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { donateVisible } from "@/lib/donate";

export const instant = false;

export default async function Apps() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">System Apps</h1>
      <p className="text-sm text-zinc-400">Windows + Mac. In-apps later.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <Monitor size={20} />
          <h2 className="mt-2 font-medium">Windows · Coming soon</h2>
          <NotifyForm surface="apps" />
        </div>
        <div className="card p-6">
          <Apple size={20} />
          <h2 className="mt-2 font-medium">Mac · Coming soon</h2>
          <NotifyForm surface="apps" />
        </div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">One email at launch. No spam.</p>
      {donateVisible(profile, "apps") && (
        <div className="mt-6">
          <DonateButton surface="apps" />
        </div>
      )}
    </div>
  );
}
