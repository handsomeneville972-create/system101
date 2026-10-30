import {
  Bell,
  Check,
  Crown,
  LayoutGrid,
  Lightbulb,
  ShoppingBag,
  Star,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationFilter = "all" | "unread";

const ICONS: Record<string, LucideIcon> = {
  join_request: UserPlus,
  join_approved: Check,
  join_denied: X,
  suggy_open: Lightbulb,
  suggy_published: Lightbulb,
  suggy_rejected: X,
  member_joined: Users,
  leadership_transferred: Crown,
  purchase: ShoppingBag,
  sale: ShoppingBag,
  review: Star,
  app_published: LayoutGrid,
};

export function notificationIcon(kind: string): LucideIcon {
  return ICONS[kind] ?? Bell;
}

export function safeNotificationHref(href: string | null | undefined): string {
  if (!href || !href.startsWith("/") || href.startsWith("//") || href.includes("\\")) {
    return "/notifications";
  }
  return href;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function notificationTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 60) return "just now";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 604800) return relative.format(Math.round(seconds / 86400), "day");

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}
