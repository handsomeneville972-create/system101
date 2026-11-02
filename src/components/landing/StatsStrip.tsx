import { CountUp } from "@/components/landing/CountUp";
import { Reveal } from "@/components/landing/Reveal";

const STATS = [
  { value: 12, suffix: "", label: "Interests", note: "Distinct rooms, one standard." },
  { value: 80, suffix: "%", label: "To pass", note: "Yes share of cast votes." },
  { value: 48, suffix: "h", label: "Vote window", note: "Settles early once all members vote." },
  { value: 90, suffix: "%", label: "Creator share", note: "Authors keep the majority." },
];

export function StatsStrip() {
  return (
    <section aria-label="Protocol facts" className="border-y border-white/[0.06] bg-[#050505]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.06] px-5 sm:px-8 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 80}>
            <div
              className={`px-4 py-10 sm:px-7 sm:py-12 ${
                index >= 2 ? "border-t border-white/[0.06] lg:border-t-0" : ""
              }`}
            >
              <p className="font-mono text-4xl font-medium tracking-[-0.04em] text-zinc-50 sm:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                {stat.label}
              </p>
              <p className="mt-2 max-w-[22ch] text-xs leading-5 text-zinc-500">{stat.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
