import Link from "next/link";
import { notFound } from "next/navigation";
import { PROFESSIONS } from "@/lib/domain";
import { groupsByProfession } from "@/lib/data/groups";

export const instant = false;

export default async function ProfessionPage({
  params,
}: {
  params: Promise<{ profession: string }>;
}) {
  const { profession } = await params;
  const meta = PROFESSIONS.find((p) => p.slug === profession);
  if (!meta) notFound();
  const groups = await groupsByProfession(profession);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{meta.label}</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Groups · Enter with reason + vote · Or create (needs 2 members).
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/groups/new" className="btn-pill bg-white px-5 py-2.5 text-sm text-black">
          Create group
        </Link>
        <Link href="/home" className="btn-pill border hairline px-5 py-2.5 text-sm">
          My groups
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {groups.length === 0 && (
          <div className="card p-6 text-sm text-zinc-400">
            No groups yet. Be first. Invite 2 to activate. Join requests need 80% yes in 48h.
          </div>
        )}
        {groups.map((g) => (
          <Link key={g.id} href={`/groups/${g.slug}`} className="card p-6 hover:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{g.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  g.active ? "bg-white/10 text-zinc-200" : "border hairline text-zinc-400"
                }`}
              >
                {g.active ? "active" : "forming"}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {g.member_count} {g.member_count === 1 ? "member" : "members"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
