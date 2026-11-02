"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = `${value}${suffix}`;
      return;
    }

    let frame = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const duration = 1200;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(2, -10 * progress);
        element.textContent = `${Math.round(value * eased)}${suffix}`;
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          element.textContent = `${value}${suffix}`;
        }
      };

      frame = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [suffix, value]);

  return (
    <>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span ref={ref} aria-hidden className={cn("tabular-nums", className)}>
        {value}
        {suffix}
      </span>
    </>
  );
}
