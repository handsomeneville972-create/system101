"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

export function SidebarInboxLink({ count }: { count: number }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const active =
    pathname === "/notifications" || pathname.startsWith("/notifications/");
  const title = collapsed
    ? count > 0
      ? `Inbox, ${count} unread`
      : "Inbox"
    : undefined;

  return (
    <Link
      href="/notifications"
      title={title}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "bg-white/10 text-white"
          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
        collapsed && "md:gap-0"
      )}
    >
      <Inbox className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span
        className={cn(
          "truncate whitespace-nowrap transition-opacity duration-150",
          collapsed && "md:w-0 md:opacity-0"
        )}
      >
        Inbox
      </span>
      {count > 0 && (
        <span
          className={cn(
            "ml-auto min-w-5 rounded-full bg-white px-1.5 text-center text-[10px] font-medium leading-5 text-black",
            collapsed && "md:hidden"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
      {count > 0 && collapsed && (
        <span className="absolute right-1 top-1 hidden h-1.5 w-1.5 rounded-full bg-white md:block" />
      )}
    </Link>
  );
}
