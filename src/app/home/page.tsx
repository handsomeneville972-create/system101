import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";
import { getProfile } from "@/lib/auth";
import { myGroups } from "@/lib/data/groups";

export const instant = false;

export default async function HomePage() {
  const profile = await getProfile();
  const groups = await myGroups();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        {profile?.display_name ? `Hey, ${profile.display_name}` : "Home"}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">My groups · Trending suggies · New ebooks.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card p-6 md:col-span-1">
          <h2 className="text-sm font-medium">My groups</h2>
          {groups.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              No groups yet.{" "}
              <Link href="/findem" className="text-zinc-200 underline">
                Find one
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {groups
                .filter((g) => g.group)
                .map((g) => (
                  <li key={g.group!.id}>
                    <Link
                      href={`/groups/${g.group!.slug}`}
                      className="flex items-center justify-between text-sm hover:text-white"
                    >
                      <span>{g.group!.name}</span>
                      <span className="text-xs text-zinc-500">
                        {g.group!.active ? "active" : "forming"}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="card p-6">Trending suggies — up/down only.</div>
        <div className="card p-6">New ebooks — free + paid.</div>
      </div>

      <div className="mt-6">
        <DonateButton surface="home" />
      </div>
    </div>
  );
}
