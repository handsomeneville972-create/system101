import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import {
  listNotifications,
  purgeMyNotifications,
  unreadCount,
} from "@/lib/data/notifications";
import { MarkAllRead } from "@/components/notifications/MarkAllRead";
import { NotificationRow } from "@/components/notifications/NotificationRow";

export const instant = false;

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/notifications");

  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";

  await purgeMyNotifications();

  const [items, count] = await Promise.all([
    listNotifications(filter),
    unreadCount(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {count > 0 ? `${count} unread` : "All caught up."}
          </p>
        </div>
        <MarkAllRead count={count} />
      </div>

      <div className="mt-5 inline-flex items-center gap-1 rounded-lg border hairline p-1 text-sm">
        <Link
          href="/notifications"
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            filter === "all"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          All
        </Link>
        <Link
          href="/notifications?filter=unread"
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            filter === "unread"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Unread{count > 0 ? ` ${count}` : ""}
        </Link>
      </div>

      <div className="card mt-4 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Inbox className="h-5 w-5 text-zinc-500" aria-hidden />
            <p className="mt-3 text-sm text-zinc-400">
              {filter === "unread"
                ? "No unread notifications."
                : "Nothing yet."}
            </p>
            {filter === "unread" ? (
              <Link
                href="/notifications"
                className="mt-3 text-xs text-zinc-500 underline"
              >
                View all
              </Link>
            ) : (
              <Link
                href="/findem"
                className="mt-3 text-xs text-zinc-500 underline"
              >
                Find your people
              </Link>
            )}
          </div>
        ) : (
          items.map((item) => <NotificationRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
