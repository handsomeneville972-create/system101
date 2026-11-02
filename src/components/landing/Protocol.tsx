import { Check, ShieldCheck, UserCheck, UsersRound } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { VoteRing } from "@/components/landing/VoteRing";

const STEPS = [
  {
    number: "01",
    title: "Apply with intent",
    body: "Pick an interest, then tell the group why you belong. A reason is required — no drive-by joins.",
    icon: UserCheck,
  },
  {
    number: "02",
    title: "Members vote",
    body: "80% yes of cast votes passes a request. The window is 48 hours, and it settles early once every member has voted.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Belong and build",
    body: "Get in, contribute, ship. A no comes with feedback and a 7-day cooldown before you can reapply.",
    icon: ShieldCheck,
  },
];

const MONO = "font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400";

export function Protocol() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-white/[0.06] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="The protocol"
          title="Membership, not sign-ups."
          body="Groups are small and member-run. Access is earned, decisions are transparent, and every vote is on the record."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <ol className="space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={index * 90}>
                  <li className="group relative flex gap-5 rounded-xl border border-transparent p-4 transition-colors hover:border-white/[0.06] hover:bg-white/[0.015] sm:p-5">
                    <div className="flex flex-col items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] font-mono text-[11px] text-zinc-300">
                        {step.number}
                      </span>
                      {index < STEPS.length - 1 ? (
                        <span className="mt-2 h-full w-px flex-1 bg-white/[0.08]" aria-hidden />
                      ) : null}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                        <h3 className="text-base font-medium tracking-tight text-zinc-50">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">{step.body}</p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>

          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#080808] p-5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/[0.08] blur-3xl"
              />

              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <span className="landing-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                    Vote terminal
                  </div>
                  <span className="rounded-full border border-white/[0.08] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                    Preview
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-zinc-50">Join request</p>
                    <p className="mt-0.5 text-sm text-zinc-400">Business &amp; Startups</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300">
                    Passing
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <p className={MONO}>Applicant reason</p>
                  <div className="mt-2.5 space-y-1.5" aria-hidden>
                    <span className="block h-1.5 w-full rounded-full bg-white/[0.08]" />
                    <span className="block h-1.5 w-11/12 rounded-full bg-white/[0.08]" />
                    <span className="block h-1.5 w-2/3 rounded-full bg-white/[0.08]" />
                  </div>
                  <p className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                    50+ characters required
                  </p>
                </div>

                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                  <VoteRing percent={80} size={148} stroke={9} label="Yes" />
                  <div className="w-full min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-zinc-300">4 of 5 yes</span>
                      <span className="font-mono text-xs tabular-nums text-zinc-400">47:58:12</span>
                    </div>
                    <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                      <span className="h-full w-4/5 bg-emerald-400" />
                      <span className="h-full w-1/5 bg-rose-400/60" />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                      <span>80% threshold</span>
                      <span>48h window</span>
                    </div>

                    <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
                      {[
                        ["Cast", "5/5"],
                        ["Rule", "80%"],
                        ["Tie", "Leader"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className={MONO}>{label}</dt>
                          <dd className="mt-1 font-mono text-sm text-zinc-200">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
                  <p className="text-[11px] leading-5 text-zinc-400">
                    Leader breaks ties. Every no vote keeps its reason.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
