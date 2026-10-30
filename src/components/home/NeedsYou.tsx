import Link from "next/link";
import { Bell, Lightbulb, UserPlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { HomeInbox, InboxGroup } from "@/lib/data/notifications";

function detail(groups: InboxGroup[], empty: string) {
  const first = groups[0];
  if (!first) return empty;
  return groups.length === 1
    ? first.name
    : `${first.name} +${groups.length - 1} more`;
}

function Stat({
  icon: Icon,
  label,
  count,
  note,
  href,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border hairline p-4 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <span className="flex items-center gap-2 text-xs text-zinc-400">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </span>
      <span className="mt-2 block text-2xl font-semibold text-white">
        {count}
      </span>
      <span className="mt-1 block truncate text-xs text-zinc-500">{note}</span>
    </Link>
  );
}

export function NeedsYou({ inbox }: { inbox: HomeInbox }) {
  const requests = inbox.requests.reduce((sum, group) => sum + group.count, 0);
  const signals = inbox.signals.reduce((sum, group) => sum + group.count, 0);
  const total = requests + signals + inbox.unread;

  return (
    <section className="card mt-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Needs you</h2>
        <Link
          href="/notifications"
          className="text-xs text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-white"
        >
          Inbox{inbox.unread > 0 ? ` (${inbox.unread})` : ""}
        </Link>
      </div>

      {total === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          You&apos;re all caught up.{" "}
          <Link href="/findem" className="text-zinc-200 underline">
            Find your people
          </Link>
          .
        </p>
      ) : (
        <div className={cn("mt-4 grid gap-3", "sm:grid-cols-3")}>
          {requests > 0 && (
            <Stat
              icon={UserPlus}
              label={requests === 1 ? "Join request" : "Join requests"}
              count={requests}
              note={detail(inbox.requests, "None waiting")}
              href={
                inbox.requests[0]
                  ? `/groups/${inbox.requests[0].slug}`
                  : "/findem"
              }
            />
          )}
          {signals > 0 && (
            <Stat
              icon={Lightbulb}
              label={signals === 1 ? "Signal to vote" : "Signals to vote"}
              count={signals}
              note={detail(inbox.signals, "All voted")}
              href={
                inbox.signals[0] ? `/groups/${inbox.signals[0].slug}` : "/findem"
              }
            />
          )}
          {inbox.unread > 0 && (
            <Stat
              icon={Bell}
              label="Unread"
              count={inbox.unread}
              note="Inbox"
              href="/notifications"
            />
          )}
        </div>
      )}
    </section>
  );
}
