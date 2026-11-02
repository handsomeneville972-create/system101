"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function VoteRing({
  percent = 80,
  size = 96,
  stroke = 7,
  label = "YES",
  className,
}: {
  percent?: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = visible ? circumference * (1 - percent / 100) : circumference;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#34d399"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="landing-ring-progress"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-mono font-medium tracking-tight text-zinc-50",
            size >= 120 ? "text-3xl" : "text-xl",
          )}
        >
          {percent}%
        </span>
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </span>
      </div>
    </div>
  );
}
