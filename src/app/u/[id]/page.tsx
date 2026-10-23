import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Users } from "lucide-react";
import { EbookCard } from "@/components/ebooku/EbookCard";
import { getUser } from "@/lib/auth";
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
