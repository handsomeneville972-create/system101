import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { NetworkPanel } from "@/components/landing/NetworkPanel";
import { SplitText } from "@/components/landing/SplitText";

const PRIMARY =
  "btn-pill inline-flex h-12 items-center justify-center gap-2 bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const SECONDARY =
  "btn-pill inline-flex h-12 items-center justify-center gap-2 border border-white/[0.14] bg-white/[0.02] px-6 text-sm text-zinc-100 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const FACTS = ["12 interests", "80% to pass", "48h vote", "90% creator share"];

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="landing-root relative isolate overflow-hidden">
      <LandingBackdrop />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="flex h-full flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5">
              <span className="landing-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Network live
            </span>
            <span>Find · Build · Grow</span>
          </div>

          <h1 className="mt-7 text-[clamp(4rem,12vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.055em] text-zinc-50">
            <span className="sr-only">Grow.</span>
            <span aria-hidden className="block">
              <SplitText text="Grow" />
              <span className="landing-period" aria-hidden />
            </span>
          </h1>

          <p className="mt-7 max-w-md text-balance text-lg leading-7 text-zinc-300 sm:text-xl sm:leading-8">
            Small groups. High standards. A system built for people who actually ship.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={signedIn ? "/home" : "/auth/sign-up"} className={PRIMARY}>
              {signedIn ? "Open app" : "Start"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/findem" className={SECONDARY}>
              Explore groups
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <dl className="mt-10 flex max-w-lg flex-wrap gap-x-6 gap-y-2.5 border-t border-white/[0.08] pt-6 font-mono text-[10px] uppercase tracking-[0.16em]">
            {FACTS.map((fact) => (
              <div key={fact} className="flex items-start gap-2 text-zinc-400">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                <dt className="sr-only">Protocol</dt>
                <dd className="whitespace-nowrap">{fact}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:pl-4">
          <NetworkPanel />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-5 pb-8 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:px-8">
        <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
        <span>Scroll</span>
        <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
      </div>
    </section>
  );
}
