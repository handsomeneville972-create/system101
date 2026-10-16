import { DonateButton } from "@/components/DonateButton";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-sm text-zinc-400">My groups · Trending suggies · New ebooks.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card p-6">My groups — sign in to see.</div>
        <div className="card p-6">Trending suggies — up/down only.</div>
        <div className="card p-6">New ebooks — free + paid.</div>
      </div>
      <div className="mt-6"><DonateButton surface="home" /></div>
    </div>
  );
}
