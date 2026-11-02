import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { SpotlightCard } from "@/components/landing/SpotlightCard";

const MONO = "font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400";

function CardLink({
  href,
  title,
  description,
  icon: Icon,
  className,
  children,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof UsersRound;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <SpotlightCard className={className}>
      <Link
        href={href}
        className="flex h-full flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
            <Icon className="h-4 w-4 text-zinc-200" aria-hidden />
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-zinc-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-200"
            aria-hidden
          />
        </div>
        <h3 className="mt-5 text-xl font-medium tracking-tight text-zinc-50">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-zinc-400">{description}</p>
        <div className="mt-6 flex-1">{children}</div>
      </Link>
    </SpotlightCard>
  );
}

function FindEmVisual() {
  return (
    <div className="grid gap-4 sm:grid-cols-[1.15fr_1fr]">
      <div className="space-y-2">
        {[
          { label: "Business & Startups", state: "Voting" },
          { label: "Tech & Coding", state: "Open" },
          { label: "Art & Design", state: "Open" },
        ].map((row, index) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={
                  index === 0
                    ? "h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                    : "h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600"
                }
                aria-hidden
              />
              <span className="truncate text-xs text-zinc-200">{row.label}</span>
            </div>
            <span className={MONO}>{row.state}</span>
          </div>
        ))}
        <p className="pt-1 text-[10px] leading-4 text-zinc-500">
          Apply with a reason. Members vote.
        </p>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-3.5">
        <div className="flex items-center justify-between">
          <span className={MONO}>Join request</span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300">
            80%
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-300">Why do you want in?</p>
        <div className="mt-2 space-y-1.5" aria-hidden>
          <span className="block h-1.5 w-full rounded-full bg-white/[0.07]" />
          <span className="block h-1.5 w-4/5 rounded-full bg-white/[0.07]" />
          <span className="block h-1.5 w-2/3 rounded-full bg-white/[0.07]" />
        </div>
        <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
          <span className="h-full w-[80%] bg-emerald-400" />
          <span className="h-full w-[20%] bg-rose-400/60" />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-500">
          <span>Yes</span>
          <span>48h</span>
        </div>
      </div>
    </div>
  );
}

function SuggyVisual() {
  return (
    <div className="space-y-2">
      {[
        { label: "Weekly build check-in", state: "Building" },
        { label: "Open resource thread", state: "Shipped" },
        { label: "Design critique thread", state: "Voting" },
      ].map((signal) => (
        <div
          key={signal.label}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
        >
          <p className="truncate text-xs text-zinc-200">{signal.label}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">
              <Lightbulb className="h-3 w-3" aria-hidden />
              Signal
            </span>
            <span className={MONO}>{signal.state}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EbookuVisual() {
  return (
    <div className="flex gap-2.5">
      {[
        { tag: "Free", tone: "bg-white/[0.06]" },
        { tag: "Paid", tone: "bg-emerald-400/[0.12]" },
        { tag: "Free", tone: "bg-white/[0.04]" },
      ].map((book, index) => (
        <div
          key={index}
          className="flex-1 rounded-md border border-white/[0.07] bg-[#0d0d0d] p-2.5"
        >
          <div className={`h-16 rounded-sm ${book.tone}`} aria-hidden />
          <div className="mt-2 space-y-1" aria-hidden>
            <span className="block h-1 w-4/5 rounded-full bg-white/[0.12]" />
            <span className="block h-1 w-3/5 rounded-full bg-white/[0.07]" />
          </div>
          <span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400">
            {book.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

function DecourseVisual() {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-3">
      <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-md bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.14),transparent_70%)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06]">
          <Play className="h-3.5 w-3.5 translate-x-px text-zinc-100" aria-hidden />
        </span>
        <span className="absolute inset-x-3 bottom-2 h-0.5 rounded-full bg-white/[0.08]" aria-hidden>
          <span className="block h-full w-1/3 rounded-full bg-emerald-400" />
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
        <span>Video + notes</span>
        <span>Free</span>
      </div>
    </div>
  );
}

function AppsVisual() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[LayoutGrid, Lightbulb, BookOpen, GraduationCap, UsersRound, Play, Search, Sparkles].map(
        (Icon, index) => (
          <div
            key={index}
            className="flex aspect-square items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]"
          >
            <Icon className="h-4 w-4 text-zinc-400" aria-hidden />
          </div>
        ),
      )}
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section id="system" className="scroll-mt-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="The system"
          title="One system. Five ways to grow."
          body="Each module feeds the next. Find your group, learn in public, share what works, and ship."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          <Reveal className="h-full lg:col-span-4">
            <CardLink
              href="/findem"
              title="Find'em"
              description="Groups by interest. Apply with a reason. Members vote you in."
              icon={UsersRound}
              className="h-full"
            >
              <FindEmVisual />
            </CardLink>
          </Reveal>

          <Reveal delay={80} className="h-full lg:col-span-2">
            <CardLink
              href="/suggy"
              title="Suggy"
              description="Group signals. Upvote what matters. Ship it."
              icon={Lightbulb}
              className="h-full"
            >
              <SuggyVisual />
            </CardLink>
          </Reveal>

          <Reveal delay={120} className="h-full lg:col-span-2">
            <CardLink
              href="/ebooku"
              title="Ebooku"
              description="Books from members. Free or paid. 90% to the author."
              icon={BookOpen}
              className="h-full"
            >
              <EbookuVisual />
            </CardLink>
          </Reveal>

          <Reveal delay={160} className="h-full lg:col-span-2">
            <CardLink
              href="/decourse"
              title="De-Course"
              description="Free courses. Video plus notes."
              icon={GraduationCap}
              className="h-full"
            >
              <DecourseVisual />
            </CardLink>
          </Reveal>

          <Reveal delay={200} className="h-full lg:col-span-2">
            <CardLink
              href="/apps"
              title="Apps"
              description="Tools built by members. Browse, share, track."
              icon={LayoutGrid}
              className="h-full"
            >
              <AppsVisual />
            </CardLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
