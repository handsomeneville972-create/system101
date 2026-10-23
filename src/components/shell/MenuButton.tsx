"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

export function MenuButton({ className }: { className?: string }) {
  const { mobileOpen, openMobile } = useSidebar();

  return (
    <button
      id="sidebar-mobile-toggle"
      type="button"
      onClick={openMobile}
      aria-label="Open navigation"
      aria-expanded={mobileOpen}
      aria-controls="app-sidebar"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden",
        className,
      )}
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}
