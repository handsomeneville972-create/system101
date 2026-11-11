import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Image as ImageIcon, MessageSquare, Plus } from "lucide-react";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { chatListTime } from "@/lib/chat";
import { myConversations, unreadMessageCount, type ConversationSummary } from "@/lib/data/messages";
import { ChatAvatar } from "@/components/messages/ChatAvatar";

export const instant = false;

export const metadata: Metadata = {
  title: "Messages",
};

function previewOf(conversation: ConversationSummary): string {
  if (!conversation.lastAt) return "No messages yet. Say hello.";

  const sender = conversation.lastSender ?? "Member";
  if (conversation.lastHasImage) {
    return conversation.lastBody
      ? `${sender}: ${conversation.lastBody}`
      : `${sender} sent a photo`;
  }
  return `${sender}: ${conversation.lastBody ?? ""}`;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/?mode=signin&next=/messages");

  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";

  const [conversations, totalUnread] = await Promise.all([
    myConversations(),
    unreadMessageCount(),
  ]);

  const visible =
    filter === "unread"
      ? conversations.filter((conversation) => conversation.unreadCount > 0)
      : conversations;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {totalUnread > 0
              ? `${totalUnread} unread`
              : "Group chats with your people."}
          </p>
        </div>
        <Link
          href="/findem"
          className="btn-pill inline-flex items-center gap-1.5 border hairline px-4 py-2 text-xs text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Find groups
        </Link>
      </div>

      {conversations.length > 0 && (
        <div className="mt-5 inline-flex items-center gap-1 rounded-lg border hairline p-1 text-sm">
          <Link
            href="/messages"
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              filter === "all" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            All
          </Link>
          <Link
            href="/messages?filter=unread"
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              filter === "unread" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            Unread{totalUnread > 0 ? ` ${totalUnread}` : ""}
          </Link>
        </div>
      )}

      <div className="card mt-4 overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <MessageSquare className="h-5 w-5 text-zinc-500" aria-hidden />
            <p className="mt-3 text-sm text-zinc-400">
              {filter === "unread"
                ? "No unread messages."
                : conversations.length === 0
                  ? "No group chats yet."
                  : "Nothing here."}
            </p>
            {filter === "unread" ? (
              <Link href="/messages" className="mt-3 text-xs text-zinc-500 underline">
                View all
              </Link>
            ) : (
              <>
                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                  Join a group and its chat appears here.
                </p>
                <Link
                  href="/findem"
                  className="btn-pill mt-5 bg-white px-5 py-2.5 text-sm font-medium text-black"
                >
                  Find your people
                </Link>
              </>
            )}
          </div>
        ) : (
          visible.map((conversation) => {
            const unread = conversation.unreadCount > 0;

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.slug}`}
                className={cn(
                  "group flex items-center gap-3 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40",
                  unread && "bg-white/[0.015]"
                )}
              >
                <ChatAvatar
                  name={conversation.name}
                  url={null}
                  className="h-10 w-10 text-xs"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>
                      {conversation.name}
                    </span>
                    {!conversation.active && (
                      <span className="shrink-0 rounded-full border hairline px-1.5 py-0.5 text-[10px] text-zinc-500">
                        forming
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-[11px] text-zinc-500">
                      {chatListTime(conversation.lastAt)}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={cn(
                        "truncate text-xs",
                        unread ? "text-zinc-300" : "text-zinc-500"
                      )}
                    >
                      {previewOf(conversation)}
                    </p>
                    {conversation.lastHasImage && (
                      <ImageIcon className="h-3 w-3 shrink-0 text-zinc-600" aria-hidden />
                    )}
                    {unread && (
                      <span className="ml-auto min-w-5 shrink-0 rounded-full bg-white px-1.5 text-center text-[10px] font-medium leading-5 text-black">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {conversations.length > 0 && (
        <p className="mt-4 text-center text-[11px] text-zinc-600">
          Chat is visible to group members only.
        </p>
      )}
    </div>
  );
}
