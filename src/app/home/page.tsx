import Link from "next/link";
import { redirect } from "next/navigation";
import { DonateButton } from "@/components/DonateButton";
import { getProfile } from "@/lib/auth";
import { donateVisible } from "@/lib/donate";
import { myGroups } from "@/lib/data/groups";
import { trendingSignals } from "@/lib/data/suggy";
import { recentEbooks } from "@/lib/data/ebooks";

export const instant = false;

export default async function HomePage() {
  const [profile, groups, trending, ebooks] = await Promise.all([
    getProfile(),
    myGroups(),
    trendingSignals(),
    recentEbooks(3),
  ]);

  if (!profile?.profession) redirect("/onboarding");

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
        <div className="card p-6">
          <h2 className="text-sm font-medium">Trending suggies</h2>
          {trending.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              Nothing yet.{" "}
              <Link href="/suggy" className="text-zinc-200 underline">
                Browse
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {trending.map((s) => (
                <li key={s.id}>
                  <Link
                    href="/suggy"
                    className="flex items-center justify-between text-sm hover:text-white"
                  >
                    <span className="truncate">{s.title}</span>
                    <span className="ml-3 shrink-0 text-xs text-zinc-500">{s.score}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-medium">New ebooks</h2>
          {ebooks.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              No books yet.{" "}
              <Link href="/ebooku/upload" className="text-zinc-200 underline">
                Upload one
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ebooks.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/ebooku/${b.id}`}
                    className="flex items-center justify-between text-sm hover:text-white"
                  >
                    <span className="truncate">{b.title}</span>
                    <span className="ml-3 shrink-0 text-xs text-zinc-500">
                      {b.price_cents === 0 ? "Free" : `$${(b.price_cents / 100).toFixed(2)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/ebooku" className="mt-3 inline-block text-xs text-zinc-500 underline">
            All books
          </Link>
        </div>
      </div>

      {donateVisible(profile, "home") && (
        <div className="mt-6">
          <DonateButton surface="home" />
        </div>
      )}
    </div>
  );
}
