import Link from "next/link";
import { INTERESTS } from "@/lib/domain";
import { interestCounts } from "@/lib/data/groups";

export const instant = false;

export default async function FindEm() {
  const counts = await interestCounts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Find&apos;em</h1>
      <p className="mt-1 text-sm text-zinc-400">Pick your interest. Enter or create.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {INTERESTS.map((p) => (
          <Link key={p.slug} href={`/findem/${p.slug}`} className="card p-6 hover:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{p.label}</h2>
              <span className="text-xs text-zinc-500">{counts[p.slug] ?? 0}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{p.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
