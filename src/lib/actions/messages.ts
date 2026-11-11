"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";
import { actionRateLimit } from "@/lib/action-limit";
import {
  CHAT_MAX_BODY,
  CHAT_MAX_IMAGE_BYTES,
  isChatImageMime,
  type ChatImageMime,
} from "@/lib/chat";
import { messagesAfter, type ChatMessage } from "@/lib/data/messages";

export type SendChatMessageInput = {
  slug: string;
  body: string;
  attachment?: {
    path: string;
    mime: string;
    bytes: number;
    width: number | null;
    height: number | null;
  } | null;
};

export type SendChatMessageResult =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string };

export type DeleteChatMessageResult = { ok: true } | { ok: false; error: string };

function friendlySendError(message: string | undefined): string {
  const text = message ?? "";
  if (text.includes("too quickly")) {
    return "You’re sending messages too quickly. Try again in a moment.";
  }
  if (text.includes("messages_body_len")) {
    return `Messages are limited to ${CHAT_MAX_BODY.toLocaleString()} characters.`;
  }
  if (text.includes("messages_payload")) {
    return "Write something or attach an image.";
  }
  if (text.includes("row-level security") || text.includes("permission denied")) {
    return "You don’t have access to post in this chat.";
  }
  return "Could not send your message. Try again.";
}

async function conversationIdFor(
  sb: Awaited<ReturnType<typeof supabaseServer>>,
  slug: string
): Promise<string | null> {
  const { data: group } = await sb
    .from("groups")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!group) return null;

  // Members-only select; a non-member gets no row.
  const { data: conversation } = await sb
    .from("conversations")
    .select("id")
    .eq("group_id", group.id)
    .maybeSingle();
  return (conversation?.id as string | undefined) ?? null;
}

export async function sendChatMessage(
  input: SendChatMessageInput
): Promise<SendChatMessageResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (!input || typeof input.body !== "string" || typeof input.slug !== "string") {
    return { ok: false, error: "Could not send your message. Try again." };
  }

  const limited = await actionRateLimit("messages.send", user.id, {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return { ok: false, error: limited };

  const body = input.body.replace(/\r\n/g, "\n").trim();
  if (body.length > CHAT_MAX_BODY) {
    return { ok: false, error: `Messages are limited to ${CHAT_MAX_BODY.toLocaleString()} characters.` };
  }

  const attachment = input.attachment ?? null;
  if (!body && !attachment) return { ok: false, error: "Write something or attach an image." };

  if (attachment) {
    if (
      typeof attachment.path !== "string" ||
      typeof attachment.mime !== "string" ||
      typeof attachment.bytes !== "number"
    ) {
      return { ok: false, error: "That attachment is not valid." };
    }
    if (!isChatImageMime(attachment.mime)) {
      return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are supported." };
    }
    if (
      !Number.isInteger(attachment.bytes) ||
      attachment.bytes <= 0 ||
      attachment.bytes > CHAT_MAX_IMAGE_BYTES
    ) {
      return { ok: false, error: "Images must be 5 MB or smaller." };
    }
    if (
      attachment.width !== null &&
      (!Number.isInteger(attachment.width) || attachment.width <= 0 || attachment.width > 20_000)
    ) {
      return { ok: false, error: "That image is too large." };
    }
    if (
      attachment.height !== null &&
      (!Number.isInteger(attachment.height) || attachment.height <= 0 || attachment.height > 20_000)
    ) {
      return { ok: false, error: "That image is too large." };
    }
  }

  if (!input.slug) return { ok: false, error: "Chat not found." };
  const sb = await supabaseServer();
  const conversationId = await conversationIdFor(sb, input.slug);
  if (!conversationId) return { ok: false, error: "You’re not a member of this chat." };

  if (attachment) {
    const prefix = `${conversationId}/${user.id}/`;
    const filename = attachment.path.startsWith(prefix)
      ? attachment.path.slice(prefix.length)
      : "";
    if (
      !filename ||
      filename.length > 180 ||
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return { ok: false, error: "That attachment path is not allowed." };
    }
    if (!filename.toLowerCase().endsWith(`.${attachment.mime === "image/jpeg" ? "jpg" : attachment.mime.split("/")[1]}`)) {
      return { ok: false, error: "That attachment path is not allowed." };
    }
  }

  const insert = sb
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      attachment_path: attachment?.path ?? null,
      attachment_mime: (attachment?.mime as ChatImageMime | undefined) ?? null,
      attachment_bytes: attachment?.bytes ?? null,
      attachment_width: attachment?.width ?? null,
      attachment_height: attachment?.height ?? null,
    })
    .select(
      "id, conversation_id, sender_id, body, attachment_path, attachment_mime, attachment_width, attachment_height, deleted_at, created_at"
    )
    .single();

  const [insertResult, profileResult] = await Promise.all([
    insert,
    sb.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
  ]);

  if (insertResult.error || !insertResult.data) {
    console.error("sendChatMessage", insertResult.error);
    return { ok: false, error: friendlySendError(insertResult.error?.message) };
  }

  const row = insertResult.data;
  const admin = supabaseAdmin();
  const [attachmentSigned, avatarSigned] = await Promise.all([
    row.attachment_path
      ? admin.storage.from("chat").createSignedUrl(row.attachment_path, 3600)
      : Promise.resolve({ data: null }),
    profileResult.data?.avatar_url
      ? admin.storage.from("avatars").createSignedUrl(profileResult.data.avatar_url, 3600)
      : Promise.resolve({ data: null }),
  ]);

  revalidatePath("/messages");

  return {
    ok: true,
    message: {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: profileResult.data?.display_name || "Member",
      senderAvatarUrl: avatarSigned.data?.signedUrl ?? null,
      body: row.body,
      attachmentPath: row.attachment_path,
      attachmentUrl: attachmentSigned.data?.signedUrl ?? null,
      attachmentMime: row.attachment_mime,
      attachmentWidth: row.attachment_width,
      attachmentHeight: row.attachment_height,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      canDelete: true,
    },
  };
}

export async function deleteChatMessage(messageId: string): Promise<DeleteChatMessageResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (!messageId || typeof messageId !== "string") return { ok: false, error: "Message not found." };

  const limited = await actionRateLimit("messages.delete", user.id, {
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return { ok: false, error: limited };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("delete_message", { p_message: messageId });
  if (error) {
    const text = error.message ?? "";
    if (text.includes("cannot remove")) return { ok: false, error: "You cannot remove this message." };
    if (text.includes("not a member")) return { ok: false, error: "You’re not a member of this chat." };
    return { ok: false, error: "Could not delete this message." };
  }

  if (typeof data === "string" && data) {
    // Best effort: the message is already hidden even if storage cleanup fails.
    await supabaseAdmin().storage.from("chat").remove([data]);
  }

  revalidatePath("/messages");
  return { ok: true };
}

export async function markConversationRead(slug: string): Promise<void> {
  const user = await getUser();
  if (!user || !slug) return;

  const sb = await supabaseServer();
  const conversationId = await conversationIdFor(sb, slug);
  if (!conversationId) return;

  await sb.rpc("mark_conversation_read", { p_conversation: conversationId });
}

export async function syncChatMessages(
  slug: string,
  afterIso: string | null
): Promise<ChatMessage[]> {
  return messagesAfter(slug, afterIso);
}

export async function refreshMessageBadge(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  const sb = await supabaseServer();
  const { data } = await sb.rpc("unread_message_count");
  return typeof data === "number" ? data : 0;
}
