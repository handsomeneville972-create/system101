import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

const PRIMARY =
  "btn-pill inline-flex h-12 items-center justify-center gap-2 bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const SECONDARY =
  "btn-pill inline-flex h-12 items-center justify-center gap-2 border border-white/[0.14] bg-white/[0.02] px-6 text-sm text-zinc-100 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export function FinalCTA({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="landing-root relative isolate overflow-hidden border-t border-white/[0.06]">
      <div className="landing-cta-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="landing-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <Image
        src="/logo.png"
        alt=""
        width={406}
        height={396}
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-[420px] w-auto -translate-x-1/2 opacity-[0.05] sm:h-[520px]"
      />

      <div className="relative mx-auto max-w-3xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            Start
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-zinc-50 sm:text-6xl">
            Your people are already building.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-md text-balance text-sm leading-6 text-zinc-400 sm:text-base">
            Find your interest. Apply to a group. Build something that lasts.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={signedIn ? "/home" : "/auth/sign-up"} className={PRIMARY}>
              {signedIn ? "Open app" : "Start"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/findem" className={SECONDARY}>
              Browse groups
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            Free to join · Membership by vote
          </p>
        </Reveal>
      </div>
    </section>
  );
}
