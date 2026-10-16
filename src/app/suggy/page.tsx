import { DonateButton } from "@/components/DonateButton";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

const mock = [
  { id: "1", title: "Ship daily. 30 min rule.", group: "Developers", votes: 128 },
  { id: "2", title: "Save 20% first. Trade rest.", group: "Traders", votes: 96 },
];

export default function Suggy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Suggy</h1>
      <p className="text-sm text-zinc-400">Group signals. Up or down only. 80% to pass in-group.</p>
      <div className="mt-6 space-y-3">
        {mock.map((s) => (
          <div key={s.id} className="card flex items-center gap-4 p-4">
            <div className="flex flex-col items-center gap-1">
              <button aria-label="Upvote"><ArrowBigUp size={20} /></button>
              <span className="text-sm">{s.votes}</span>
              <button aria-label="Downvote"><ArrowBigDown size={20} /></button>
            </div>
            <div className="flex-1">
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-zinc-400">by {s.group} · Join group →</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6"><DonateButton surface="suggy" /></div>
    </div>
  );
}
