export const CHAT_MAX_BODY = 4000;
export const CHAT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const CHAT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ChatImageMime = (typeof CHAT_IMAGE_TYPES)[number];

export function isChatImageMime(value: string): value is ChatImageMime {
  return (CHAT_IMAGE_TYPES as readonly string[]).includes(value);
}

export function chatImageExtension(mime: ChatImageMime): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "gif";
}

export function chatInitials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Day divider label for a message list. */
export function chatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const days = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

/** Clock time shown beside a message bubble. */
export function chatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compact timestamp for the conversation list. */
export function chatListTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 60) return "now";
  if (abs < 3600) return `${Math.max(1, Math.round(abs / 60))}m`;
  if (abs < 86_400) return `${Math.max(1, Math.round(abs / 3600))}h`;
  if (abs < 604_800) return `${Math.max(1, Math.round(abs / 86_400))}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Full timestamp used for accessible labels and tooltips. */
export function chatFullTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
