import { getUser } from "@/lib/auth";
import { unreadCount } from "@/lib/data/notifications";
import { SidebarInboxLink } from "@/components/shell/SidebarInboxLink";

export async function SidebarInbox() {
  const user = await getUser();
  if (!user) return null;

  const count = await unreadCount();
  return <SidebarInboxLink count={count} />;
}
