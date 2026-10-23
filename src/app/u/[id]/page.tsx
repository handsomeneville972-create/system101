import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, LayoutGrid, Users } from "lucide-react";
import { EbookCard } from "@/components/ebooku/EbookCard";
import { getUser } from "@/lib/auth";
import { analyticsFor, ctr } from "@/lib/data/analytics";
import { profileById } from "@/lib/data/profiles";

export const instant = false;

function joined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, user] = await Promise.all([profileById(id), getUser()]);
  if (!profile) notFound();

  const isOwn = user?.id === profile.id;
  const analytics = isOwn ? await analyticsFor(null, 30) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border hairline bg-white/5">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name ?? "Member"}
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-zinc-500">
              {(profile.display_name ?? "M").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{profile.display_name ?? "Member"}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {profile.interest_label ?? "No interest set"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Member since {joined(profile.created_at)}</p>
          {isOwn && (
            <Link
              href="/settings"
              className="btn-pill mt-3 inline-block border hairline px-4 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {(profile.bio || profile.goals) && (
        <div className="card mt-6 space-y-4 p-6">
          {profile.bio && (
            <div>
              <h2 className="text-sm font-medium">Bio</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">{profile.bio}</p>
            </div>
          )}
          {profile.goals && (
            <div>
              <h2 className="text-sm font-medium">Goals</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">{profile.goals}</p>
            </div>
          )}
        </div>
      )}

      <div className="card mt-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Users size={15} /> Groups
        </h2>
        {profile.groups.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No groups yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {profile.groups.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/groups/${g.slug}`}
                  className="flex items-center justify-between text-sm hover:text-white"
                >
                  <span>{g.name}</span>
                  <span className="text-xs text-zinc-500">{g.active ? "active" : "forming"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card mt-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <LayoutGrid size={15} /> Apps
          </h2>
          <Link
            href={isOwn ? "/dashboard/apps" : "/apps"}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {isOwn ? "Analytics" : "All apps"}
          </Link>
        </div>

        {profile.apps.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            {isOwn ? "No published apps yet." : "No published apps."}
          </p>
        ) : (
          <ul className="mt-3 space-y-1">
            {profile.apps.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/apps/${app.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-md p-2 hover:bg-white/[0.03]"
                >
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border hairline bg-white/5">
                    {app.icon_url ? (
                      <Image
                        src={app.icon_url}
                        alt=""
                        fill
                        unoptimized
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        {app.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-zinc-200">
                      {app.title}
                    </span>
                    {app.tagline && (
                      <span className="block truncate text-xs text-zinc-500">
                        {app.tagline}
                      </span>
                    )}
                  </span>
                  <ArrowRight size={14} className="text-zinc-600" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isOwn && (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            {profile.apps.length === 0 && (
              <Link href="/apps/publish" className="text-zinc-400 hover:text-white">
                Publish an app
              </Link>
            )}
            <Link href="/dashboard/apps" className="text-zinc-400 hover:text-white">
              Manage listings
            </Link>
          </div>
        )}

        {isOwn && analytics && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t hairline pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Views 30d
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {analytics.totals.views.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Clicks 30d
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {analytics.totals.clicks.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                CTR 30d
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {ctr(analytics.totals.clicks, analytics.totals.views).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <BookOpen size={15} /> Books
        </h2>
        {profile.ebooks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No published books.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {profile.ebooks.map((b) => (
              <EbookCard key={b.id} ebook={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
