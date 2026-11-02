"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Lightbulb,
  UsersRound,
} from "lucide-react";
import { VoteRing } from "@/components/landing/VoteRing";

const MODULES = [
  { icon: UsersRound, name: "Find'em", detail: "Groups", status: "LIVE", spark: "M0 14 L8 12 L16 13 L24 9 L32 10 L40 6 L48 7 L56 3" },
  { icon: Lightbulb, name: "Suggy", detail: "Signals", status: "LIVE", spark: "M0 12 L8 13 L16 10 L24 11 L32 8 L40 9 L48 5 L56 6" },
  { icon: BookOpen, name: "Ebooku", detail: "Books", status: "LIVE", spark: "M0 15 L8 13 L16 14 L24 10 L32 11 L40 8 L48 9 L56 5" },
  { icon: GraduationCap, name: "De-Course", detail: "Courses", status: "FREE", spark: "M0 13 L8 14 L16 11 L24 12 L32 9 L40 10 L48 7 L56 8" },
  { icon: LayoutGrid, name: "Apps", detail: "Tools", status: "LIVE", spark: "M0 14 L8 11 L16 12 L24 8 L32 9 L40 5 L48 6 L56 2" },
];

const STAGES = ["Find", "Join", "Vote", "Build", "Ship"];

function useCountdown(initial = 31 * 3600 + 42 * 60 + 8) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${rest}`;
}

export function NetworkPanel() {
  const tiltRef = useRef<HTMLDivElement>(null);
  const timer = useCountdown();

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }
    const element = tiltRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--ry", `${x * 3.2}deg`);
    element.style.setProperty("--rx", `${-y * 3.2}deg`);
    element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  function onPointerLeave() {
    const element = tiltRef.current;
    if (!element) return;
    element.style.setProperty("--ry", "0deg");
    element.style.setProperty("--rx", "0deg");
  }

  return (
    <div className="landing-panel-in relative">
      <div
        ref={tiltRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="landing-tilt landing-spotlight relative rounded-2xl border border-white/[0.1] bg-[#080808]/90 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
              <span className="landing-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Network / preview
            </div>
            <span className="rounded-full border border-white/[0.08] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
              7D
            </span>
          </div>

          <div className="pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  The growth loop
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-zinc-50">5</span>
                  <span className="text-sm text-zinc-400">modules, one system</span>
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">
                All live
              </span>
            </div>

            <div className="mt-5">
              <svg
                viewBox="0 0 560 180"
                preserveAspectRatio="none"
                className="h-[150px] w-full overflow-visible"
                aria-hidden
              >
                <defs>
                  <linearGradient id="landing-chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[36, 72, 108, 144].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="560"
                    y2={y}
                    stroke="rgba(255,255,255,0.055)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path
                  className="landing-chart-area"
                  d="M0,150 C60,146 80,138 120,130 C170,120 200,124 240,112 C290,97 320,104 360,86 C410,64 450,72 500,48 C520,38 540,32 560,26 L560,180 L0,180 Z"
                  fill="url(#landing-chart-fill)"
                />
                <path
                  className="landing-chart-line"
                  pathLength={1}
                  d="M0,150 C60,146 80,138 120,130 C170,120 200,124 240,112 C290,97 320,104 360,86 C410,64 450,72 500,48 C520,38 540,32 560,26"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="560" cy="26" r="3" fill="#34d399" />
                <circle
                  cx="560"
                  cy="26"
                  r="8"
                  fill="none"
                  stroke="#34d399"
                  strokeOpacity="0.35"
                  className="landing-chart-dot"
                  style={{ transformOrigin: "560px 26px" }}
                />
              </svg>
              <div className="mt-2 grid grid-cols-5 gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                {STAGES.map((stage) => (
                  <span key={stage} className="text-center">
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.name}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03]">
                    <Icon className="h-3.5 w-3.5 text-zinc-300" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200">{module.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                      {module.detail}
                    </p>
                  </div>
                  <svg viewBox="0 0 56 18" className="hidden h-4 w-12 shrink-0 sm:block" aria-hidden>
                    <path
                      d={module.spark}
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    {module.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="landing-vote-in relative z-20 mx-3 -mt-4 rounded-2xl border border-white/[0.1] bg-[#0d0d0d] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] sm:p-5 lg:mx-10 lg:-mt-5 lg:rotate-[-1.5deg]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
              Join request
            </span>
            <span className="rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
              Preview
            </span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-100">Business & Startups</p>
              <p className="mt-0.5 text-xs text-zinc-400">New member · 48h vote</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300">
              Passing
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <VoteRing percent={80} size={84} stroke={6} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                <span>4 of 5 yes</span>
                <span className="tabular-nums">{timer}</span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <span className="h-full w-4/5 bg-emerald-400" />
                <span className="h-full w-1/5 bg-rose-400/70" />
              </div>
              <p className="mt-2 text-[10px] leading-4 text-zinc-400">Leader breaks ties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
