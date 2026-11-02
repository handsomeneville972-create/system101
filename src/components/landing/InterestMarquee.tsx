import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INTERESTS } from "@/lib/domain";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

function Row({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={reverse ? "landing-marquee-reverse" : undefined} aria-hidden="true">
      <div className="landing-marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden="true">
            {INTERESTS.map((interest, index) => (
              <Link
                key={`${copy}-${interest.slug}`}
                href={`/findem/${interest.slug}`}
                tabIndex={-1}
                className="group mx-1.5 flex w-[240px] shrink-0 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-4 py-3.5 transition-colors hover:border-white/[0.18] hover:bg-white/[0.03] sm:w-[280px]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-[9px] tabular-nums text-zinc-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-zinc-200">{interest.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                      {interest.blurb}
                    </span>
                  </span>
                </span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-300"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InterestMarquee() {
  return (
    <section id="interests" className="scroll-mt-24 overflow-hidden py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Interests"
            title="Twelve rooms. One standard."
            body="Pick your interest. Enter a group or start your own."
          />
          <Reveal delay={160}>
            <Link
              href="/findem"
              className="btn-pill inline-flex h-10 items-center gap-1.5 border border-white/[0.14] px-4 text-sm text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Browse all
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="landing-marquee landing-mask-x mt-12 space-y-3" aria-hidden="true">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
