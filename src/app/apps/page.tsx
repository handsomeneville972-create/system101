import { DonateButton } from "@/components/DonateButton";
import { Monitor, Apple } from "lucide-react";

export default function Apps() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">System Apps</h1>
      <p className="text-sm text-zinc-400">Windows + Mac. In-apps later.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <Monitor size={20} />
          <h2 className="mt-2 font-medium">Windows · Coming soon</h2>
          <button className="mt-3 rounded-full border hairline px-4 py-2 text-sm">Notify me</button>
        </div>
        <div className="card p-6">
          <Apple size={20} />
          <h2 className="mt-2 font-medium">Mac · Coming soon</h2>
          <button className="mt-3 rounded-full border hairline px-4 py-2 text-sm">Notify me</button>
        </div>
      </div>
      <div className="mt-6"><DonateButton surface="apps" /></div>
    </div>
  );
}
