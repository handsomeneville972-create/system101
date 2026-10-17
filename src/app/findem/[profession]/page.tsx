import Link from "next/link";
import { PROFESSIONS } from "@/lib/domain";

export const instant = false;

export default async function ProfessionPage({ params }: { params: Promise<{ profession: string }> }) {
  const { profession } = await params;
  const meta = PROFESSIONS.find((p) => p.slug === profession);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{meta?.label ?? profession}</h1>
      <p className="mt-1 text-sm text-zinc-400">Groups · Enter with reason + vote · Or create (needs 2 invites).</p>
      <div className="mt-6 flex gap-3">
        <Link href="/groups/new" className="btn-pill bg-white px-5 py-2.5 text-sm text-black">
          Create group
        </Link>
        <Link href="/home" className="btn-pill border hairline px-5 py-2.5 text-sm">
          My groups
        </Link>
      </div>
      <div className="card mt-6 p-6 text-sm text-zinc-400">
        No groups yet. Be first. Invite 2 to activate. Join requests need 80% yes in 48h.
      </div>
    </div>
  );
}
