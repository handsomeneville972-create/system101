"use client";

import { cn } from "@/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { collapsed, mounted } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        mounted
          ? "md:transition-[padding-left] md:duration-200 md:ease-out"
          : "md:transition-none",
        collapsed ? "md:pl-[52px]" : "md:pl-[260px]",
      )}
    >
      {children}
    </div>
  );
}
