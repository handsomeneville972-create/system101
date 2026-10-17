import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";
import { SuggyCard } from "@/components/suggy/SuggyCard";
import { publishedFeed } from "@/lib/data/suggy";
import { getUser } from "@/lib/auth";

export const instant = false;

export default async function Suggy() {
  const [feed, user] = await Promise.all([publishedFeed(), getUser()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Suggy</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Group signals. Up or down only. 80% to pass in-group.
      </p>

      {!user && (
        <div className="card mt-6 flex items-center justify-between p-4">
          <p className="text-sm text-zinc-400">Sign in to up/down signals.</p>
          <Link
            href="/auth/sign-in?next=/suggy"
            className="btn-pill bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Sign in
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {feed.length === 0 && (
          <div className="card p-6 text-sm text-zinc-400">
            No signals yet. Join a group to post one.
          </div>
        )}
        {feed.map((s) => (
          <SuggyCard key={s.id} signal={s} />
        ))}
      </div>

      <div className="mt-6">
        <DonateButton surface="suggy" />
      </div>
    </div>
  );
}
