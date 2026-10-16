import { PROFESSIONS } from "@/lib/domain";

export default function Onboarding() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="text-sm text-zinc-400">Pick craft. Tell goals.</p>
      <form className="card mt-6 space-y-4 p-6">
        <input required placeholder="Display name" className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <select className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm">
          {PROFESSIONS.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
        </select>
        <textarea placeholder="Goals (1 line)" rows={2} className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <button className="btn-pill bg-white px-6 py-2.5 text-sm text-black">Continue</button>
      </form>
    </div>
  );
}
