import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { getUser } from "@/lib/auth";
import { chatRoom } from "@/lib/data/messages";
import { ChatRoom } from "@/components/messages/ChatRoom";

export const instant = false;

type ChatPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { slug } = await params;
  const user = await getUser();
  if (!user) redirect(`/?mode=signin&next=/messages/${encodeURIComponent(slug)}`);

  const room = await chatRoom(slug);
  if (room.status === "not_found") notFound();

  if (room.status === "not_member") {
    return (
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border hairline bg-white/[0.04]">
          <LockKeyhole className="h-5 w-5 text-zinc-500" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-semibold">{room.group.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Chat is for group members. View the group to request a spot.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/groups/${room.group.slug}`}
            className="btn-pill bg-white px-5 py-2.5 text-sm font-medium text-black"
          >
            View group
          </Link>
          <Link
            href="/messages"
            className="btn-pill inline-flex items-center gap-1.5 border hairline px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/[0.04]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChatRoom
      key={room.conversationId}
      conversationId={room.conversationId}
      slug={room.group.slug}
      group={{ name: room.group.name, active: room.group.active }}
      me={room.me}
      members={room.members}
      initialMessages={room.messages}
      isLeader={room.isLeader}
    />
  );
}
