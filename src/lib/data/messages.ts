import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";

export const CHAT_HISTORY_LIMIT = 100;

export type ConversationSummary = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  lastBody: string | null;
  lastHasImage: boolean;
  lastSender: string | null;
  lastAt: string | null;
  unreadCount: number;
};

export type ChatMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  attachmentPath: string | null;
  attachmentUrl: string | null;
  attachmentMime: string | null;
  attachmentWidth: number | null;
  attachmentHeight: number | null;
  createdAt: string;
  deletedAt: string | null;
  canDelete: boolean;
};

export type ChatGroup = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
};

export type ChatRoomData =
  | {
      status: "ok";
      conversationId: string;
      group: ChatGroup;
      isLeader: boolean;
      me: { id: string; name: string; avatarUrl: string | null };
      members: ChatMember[];
      messages: ChatMessage[];
    }
  | { status: "not_member"; group: ChatGroup }
  | { status: "not_found" };

type ProfileJoin =
  | { display_name: string | null; avatar_url: string | null }
  | { display_name: string | null; avatar_url: string | null }[]
  | null;

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_path: string | null;
  attachment_mime: string | null;
  attachment_bytes: number | null;
  attachment_width: number | null;
  attachment_height: number | null;
  deleted_at: string | null;
  created_at: string;
  profiles: ProfileJoin;
};

type MemberRow = {
  user_id: string;
  role: string;
  profiles: ProfileJoin;
};

type GroupLookup = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  leader_id: string;
};

function profileOf(value: ProfileJoin): { display_name: string | null; avatar_url: string | null } | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function signedPaths(bucket: "chat" | "avatars", paths: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return new Map();

  const admin = supabaseAdmin();
  const signed = new Map<string, string>();

  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    const { data } = await admin.storage.from(bucket).createSignedUrls(chunk, 3600);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }

  return signed;
}

async function loadRoomContext(slug: string) {
  const user = await getUser();
  if (!user) return { user: null, group: null, conversationId: null, sb: null } as const;

  const sb = await supabaseServer();
  const { data: groupData, error: groupError } = await sb
    .from("groups")
    .select("id, slug, name, active, leader_id")
    .eq("slug", slug)
    .maybeSingle();
  if (groupError) console.error("loadRoomContext group", groupError);
  const group = (groupData as GroupLookup | null) ?? null;
  if (!group) return { user, group: null, conversationId: null, sb } as const;

  // Conversations are selectable only by members, so this doubles as the
  // membership check for both the page and the realtime gap-fill reads.
  const { data: conversation, error: conversationError } = await sb
    .from("conversations")
    .select("id")
    .eq("group_id", group.id)
    .maybeSingle();
  if (conversationError) console.error("loadRoomContext conversation", conversationError);

  return {
    user,
    group,
    conversationId: (conversation?.id as string | undefined) ?? null,
    sb,
  } as const;
}

async function loadMembers(
  sb: Awaited<ReturnType<typeof supabaseServer>>,
  groupId: string
): Promise<ChatMember[]> {
  const { data } = await sb
    .from("group_members")
    .select("user_id, role, profiles(display_name, avatar_url)")
    .eq("group_id", groupId);

  const rows = (data ?? []) as MemberRow[];
  const avatars = await signedPaths(
    "avatars",
    rows.map((row) => profileOf(row.profiles)?.avatar_url ?? "").filter(Boolean)
  );

  return rows
    .map((row) => {
      const profile = profileOf(row.profiles);
      const avatarPath = profile?.avatar_url ?? null;
      return {
        id: row.user_id,
        name: profile?.display_name || "Member",
        avatarUrl: avatarPath ? avatars.get(avatarPath) ?? null : null,
        role: row.role,
      };
    })
    .sort((a, b) => {
      if (a.role === "leader" && b.role !== "leader") return -1;
      if (b.role === "leader" && a.role !== "leader") return 1;
      return a.name.localeCompare(b.name);
    });
}

async function hydrateMessages(
  rows: MessageRow[],
  members: ChatMember[],
  userId: string,
  isLeader: boolean
): Promise<ChatMessage[]> {
  const memberById = new Map(members.map((member) => [member.id, member]));
  const attachments = await signedPaths(
    "chat",
    rows
      .filter((row) => !row.deleted_at && row.attachment_path)
      .map((row) => row.attachment_path as string)
  );

  return rows.map((row) => {
    const profile = profileOf(row.profiles);
    const member = memberById.get(row.sender_id);
    const deleted = !!row.deleted_at;

    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: member?.name ?? profile?.display_name ?? "Member",
      senderAvatarUrl: member?.avatarUrl ?? null,
      body: deleted ? "" : row.body,
      attachmentPath: deleted ? null : row.attachment_path,
      attachmentUrl:
        !deleted && row.attachment_path ? attachments.get(row.attachment_path) ?? null : null,
      attachmentMime: deleted ? null : row.attachment_mime,
      attachmentWidth: deleted ? null : row.attachment_width,
      attachmentHeight: deleted ? null : row.attachment_height,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      canDelete: !deleted && (row.sender_id === userId || isLeader),
    };
  });
}

export const unreadMessageCount = cache(async (): Promise<number> => {
  const user = await getUser();
  if (!user) return 0;

  const sb = await supabaseServer();
  const { data } = await sb.rpc("unread_message_count");
  return typeof data === "number" ? data : 0;
});

export async function myConversations(): Promise<ConversationSummary[]> {
  const user = await getUser();
  if (!user) return [];

  const sb = await supabaseServer();
  const { data } = await sb.rpc("my_conversations");
  const rows = (data ?? []) as {
    conversation_id: string;
    group_slug: string;
    group_name: string;
    group_active: boolean;
    last_body: string | null;
    last_has_image: boolean;
    last_sender: string | null;
    last_at: string | null;
    unread_count: number;
  }[];

  return rows.map((row) => ({
    id: row.conversation_id,
    slug: row.group_slug,
    name: row.group_name,
    active: row.group_active,
    lastBody: row.last_body,
    lastHasImage: row.last_has_image,
    lastSender: row.last_sender,
    lastAt: row.last_at,
    unreadCount: row.unread_count,
  }));
}

export async function chatRoom(slug: string): Promise<ChatRoomData> {
  const { user, group, conversationId, sb } = await loadRoomContext(slug);
  if (!group) return { status: "not_found" };
  if (!user || !conversationId || !sb) {
    return {
      status: "not_member",
      group: { id: group.id, slug: group.slug, name: group.name, active: group.active },
    };
  }

  const isLeader = group.leader_id === user.id;
  const [members, messageResult] = await Promise.all([
    loadMembers(sb, group.id),
    sb
      .from("messages")
      .select(
        "id, conversation_id, sender_id, body, attachment_path, attachment_mime, attachment_bytes, attachment_width, attachment_height, deleted_at, created_at, profiles(display_name, avatar_url)"
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(CHAT_HISTORY_LIMIT),
  ]);

  const rows = ((messageResult.data ?? []) as MessageRow[]).reverse();
  const messages = await hydrateMessages(rows, members, user.id, isLeader);
  const me = members.find((member) => member.id === user.id);

  return {
    status: "ok",
    conversationId,
    group: { id: group.id, slug: group.slug, name: group.name, active: group.active },
    isLeader,
    me: {
      id: user.id,
      name: me?.name ?? "You",
      avatarUrl: me?.avatarUrl ?? null,
    },
    members,
    messages,
  };
}

/**
 * Gap-fill read used when realtime reconnects, the tab regains focus, or the
 * polling fallback fires. Returns only messages newer than the client cursor.
 */
export async function messagesAfter(slug: string, afterIso: string | null): Promise<ChatMessage[]> {
  const { user, group, conversationId, sb } = await loadRoomContext(slug);
  if (!group || !user || !conversationId || !sb) return [];

  const after = afterIso && !Number.isNaN(Date.parse(afterIso)) ? afterIso : null;
  const isLeader = group.leader_id === user.id;

  const [members, messageResult] = await Promise.all([
    loadMembers(sb, group.id),
    (() => {
      let query = sb
        .from("messages")
        .select(
          "id, conversation_id, sender_id, body, attachment_path, attachment_mime, attachment_bytes, attachment_width, attachment_height, deleted_at, created_at, profiles(display_name, avatar_url)"
        )
        .eq("conversation_id", conversationId);

      if (after) query = query.gte("created_at", after);

      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(CHAT_HISTORY_LIMIT);
    })(),
  ]);

  const rows = ((messageResult.data ?? []) as MessageRow[]).reverse();
  return hydrateMessages(rows, members, user.id, isLeader);
}
