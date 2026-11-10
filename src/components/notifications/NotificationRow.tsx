import { createElement } from "react";
import { openNotification } from "@/lib/actions/notifications";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";
import {
  notificationIcon,
  notificationTime,
  type NotificationItem,
} from "@/lib/notifications";

export function NotificationRow({ item }: { item: NotificationItem }) {
  const unread = !item.read_at;

  return (
    <form
      action={openNotification}
      className="border-b border-white/[0.06] last:border-b-0"
    >
      <input type="hidden" name="id" value={item.id} />
      <SubmitButton
        className="group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40"
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border hairline",
            unread ? "bg-white/10" : "bg-white/[0.03]"
          )}
        >
          {createElement(notificationIcon(item.kind), {
            className: cn(
              "h-4 w-4",
              unread ? "text-white" : "text-zinc-400"
            ),
            "aria-hidden": true,
          })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm",
                unread ? "font-medium text-white" : "text-zinc-300"
              )}
            >
              {item.title}
            </span>
            {unread && (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                <span className="sr-only">Unread</span>
              </>
            )}
          </span>
          {item.body && (
            <span className="mt-1 block text-sm text-zinc-400">{item.body}</span>
          )}
          <span className="mt-1 block text-xs text-zinc-500">
            {notificationTime(item.created_at)}
          </span>
        </span>
      </SubmitButton>
    </form>
  );
}
