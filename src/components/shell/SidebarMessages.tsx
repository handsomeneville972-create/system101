import { connection } from "next/server";
import { getUser } from "@/lib/auth";
import { unreadMessageCount } from "@/lib/data/messages";
import { SidebarMessagesLink } from "@/components/shell/SidebarMessagesLink";

export async function SidebarMessages() {
  // The unread badge is per-request. Deferring past `connection()` keeps the
  // Supabase auth/session work out of the prerendered layout shell, where
  // Date.now()-based token expiry checks are not allowed.
  await connection();

  const user = await getUser();
  if (!user) return null;

  const count = await unreadMessageCount();
  return <SidebarMessagesLink count={count} />;
}
