import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";
import { AppCard } from "@/components/apps/AppCard";
import { listApps } from "@/lib/data/apps";
import { getProfile } from "@/lib/auth";
import { donateVisible } from "@/lib/donate";

export const instant = false;

export default async function Apps() {
  const profile = await getProfile();
  const apps = await listApps();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Community Apps</h1>
          <p className="text-sm text-zinc-400">Apps built by members. $4.99 to publish to the community.</p>
        </div>
        <Link
          href="/apps/publish"
          className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black"
        >
          Publish an app
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-zinc-500">No apps yet. Be the first to publish.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {donateVisible(profile, "apps") && (
        <div className="mt-10 border-t hairline pt-6">
          <DonateButton surface="apps" />
        </div>
      )}
    </div>
  );
}
