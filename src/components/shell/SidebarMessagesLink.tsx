"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { refreshMessageBadge } from "@/lib/actions/messages";
import { useSidebar } from "@/components/shell/sidebar-context";

export function SidebarMessagesLink({ count: initialCount }: { count: number }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [count, setCount] = useState(initialCount);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setCount(await refreshMessageBadge());
    } catch {
      // Keep the last known count; the next poll retries.
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // The first count comes from the server; this delayed refresh only catches
    // changes that happened between that render and hydration.
    const initialRefresh = window.setTimeout(() => void refresh(), 1200);

    const onRead = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("ds:messages-read", onRead);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(onVisible, 30_000);

    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener("ds:messages-read", onRead);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const active = pathname === "/messages" || pathname.startsWith("/messages/");
  const title = collapsed
    ? count > 0
      ? `Messages, ${count} unread`
      : "Messages"
    : undefined;

  return (
    <Link
      href="/messages"
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
      <MessageSquare className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span
        className={cn(
          "truncate whitespace-nowrap transition-opacity duration-150",
          collapsed && "md:w-0 md:opacity-0"
        )}
      >
        Messages
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
