"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CHAT_MAX_BODY,
  CHAT_MAX_IMAGE_BYTES,
  chatDayLabel,
  chatFullTime,
  chatImageExtension,
  chatMessageTime,
  isChatImageMime,
  type ChatImageMime,
} from "@/lib/chat";
import type { ChatMember, ChatMessage } from "@/lib/data/messages";
import {
  deleteChatMessage,
  markConversationRead as markReadAction,
  sendChatMessage,
  syncChatMessages,
} from "@/lib/actions/messages";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ChatAvatar } from "@/components/messages/ChatAvatar";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_path: string | null;
  attachment_mime: string | null;
  attachment_width: number | null;
  attachment_height: number | null;
  deleted_at: string | null;
  created_at: string;
};

type PendingSend = {
  id: string;
  body: string;
  previewUrl: string | null;
  createdAt: string;
};

type ChatRoomProps = {
  conversationId: string;
  slug: string;
  group: { name: string; active: boolean };
  me: { id: string; name: string; avatarUrl: string | null };
  members: ChatMember[];
  initialMessages: ChatMessage[];
  isLeader: boolean;
};

function fromRow(
  row: MessageRow,
  memberById: Map<string, ChatMember>,
  meId: string,
  isLeader: boolean
): ChatMessage {
  const member = memberById.get(row.sender_id);
  const deleted = !!row.deleted_at;

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: member?.name ?? "Member",
    senderAvatarUrl: member?.avatarUrl ?? null,
    body: deleted ? "" : row.body,
    attachmentPath: deleted ? null : row.attachment_path,
    attachmentUrl: null,
    attachmentMime: deleted ? null : row.attachment_mime,
    attachmentWidth: deleted ? null : row.attachment_width,
    attachmentHeight: deleted ? null : row.attachment_height,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    canDelete: !deleted && (row.sender_id === meId || isLeader),
  };
}

function fittedImageSize(
  width: number | null,
  height: number | null
): { width: number; height: number } | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  const scale = Math.min(1, 280 / width, 320 / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function asDeleted(message: ChatMessage): ChatMessage {
  return {
    ...message,
    body: "",
    attachmentPath: null,
    attachmentUrl: null,
    attachmentMime: null,
    attachmentWidth: null,
    attachmentHeight: null,
    deletedAt: message.deletedAt ?? new Date().toISOString(),
    canDelete: false,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function imageSize(
  file: File
): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return new Promise<{ width: number | null; height: number | null }>((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
        URL.revokeObjectURL(url);
      };
      image.onerror = () => {
        resolve({ width: null, height: null });
        URL.revokeObjectURL(url);
      };
      image.src = url;
    });
  }
}

export function ChatRoom({
  conversationId,
  slug,
  group,
  me,
  members,
  initialMessages,
  isLeader,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<PendingSend[]>([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const totalRef = useRef(initialMessages.length);
  const readTimerRef = useRef<number | null>(null);
  const previewRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestIsoRef = useRef(initialMessages.at(-1)?.createdAt ?? null);
  const syncingRef = useRef(false);
  const sendingRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    nearBottomRef.current = true;
    setAtBottom(true);
    setNewCount(0);
  }, []);

  const attachScroller = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  const scheduleRead = useCallback(() => {
    if (readTimerRef.current !== null) window.clearTimeout(readTimerRef.current);
    readTimerRef.current = window.setTimeout(() => {
      readTimerRef.current = null;
      if (document.visibilityState !== "visible") return;
      void markReadAction(slug)
        .then(() => {
          window.dispatchEvent(new Event("ds:messages-read"));
        })
        .catch(() => {});
    }, 400);
  }, [slug]);

  const receive = useCallback(
    async (row: MessageRow) => {
      const message = fromRow(row, memberById, me.id, isLeader);
      setMessages((prev) =>
        prev.some((item) => item.id === message.id) ? prev : [...prev, message]
      );
      if (row.sender_id !== me.id && !row.deleted_at) scheduleRead();

      if (message.attachmentPath) {
        const sb = supabaseBrowser();
        const { data } = await sb.storage
          .from("chat")
          .createSignedUrl(message.attachmentPath, 3600);
        const signedUrl = data?.signedUrl;
        if (signedUrl) {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === message.id ? { ...item, attachmentUrl: signedUrl } : item
            )
          );
        }
      }
    },
    [isLeader, me.id, memberById, scheduleRead]
  );

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const incoming = await syncChatMessages(slug, latestIsoRef.current);
      if (incoming.length === 0) return;

      setMessages((prev) => {
        const ids = new Set(prev.map((item) => item.id));
        const additions = incoming.filter((item) => !ids.has(item.id));
        return additions.length > 0 ? [...prev, ...additions] : prev;
      });

      if (
        document.visibilityState === "visible" &&
        incoming.some((item) => item.senderId !== me.id && !item.deletedAt)
      ) {
        scheduleRead();
      }
    } catch {
      // A later reconnect, focus event, or poll will retry.
    } finally {
      syncingRef.current = false;
    }
  }, [me.id, scheduleRead, slug]);

  // Realtime subscription. The select policy on messages filters events for
  // non-members, and the channel reconnects on its own after network changes.
  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          void receive(payload.new as MessageRow);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!row.deleted_at) return;
          setMessages((prev) =>
            prev.map((item) => (item.id === row.id ? asDeleted(item) : item))
          );
        }
      )
      .subscribe((status) => {
        const live = status === "SUBSCRIBED";
        setConnected(live);
        if (live) void syncNow();
      });

    return () => {
      void sb.removeChannel(channel);
    };
  }, [conversationId, receive, syncNow]);

  // Polling fallback only while the socket is down.
  useEffect(() => {
    if (connected) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void syncNow();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [connected, syncNow]);

  // First open marks the conversation read; returning to the tab and new
  // incoming messages re-run the debounced mark.
  useEffect(() => {
    scheduleRead();
    return () => {
      if (readTimerRef.current !== null) {
        window.clearTimeout(readTimerRef.current);
        readTimerRef.current = null;
        void markReadAction(slug).catch(() => {});
      }
    };
  }, [scheduleRead, slug]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      scheduleRead();
      void syncNow();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [scheduleRead, syncNow]);

  useEffect(() => {
    const last = messages.at(-1);
    if (last) latestIsoRef.current = last.createdAt;
  }, [messages]);

  useEffect(() => {
    const total = messages.length + pending.length;
    const previous = totalRef.current;
    if (total === previous) return;
    totalRef.current = total;
    if (total < previous) return;

    const latest = messages.at(-1);
    const own = pending.length > 0 || latest?.senderId === me.id;
    if (own || nearBottomRef.current) {
      scrollToBottom(true);
    } else {
      setNewCount((count) => count + (total - previous));
    }
  }, [me.id, messages, pending, scrollToBottom]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [text]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const near =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    nearBottomRef.current = near;
    setAtBottom(near);
    if (near) setNewCount(0);
  };

  const pickImage = useCallback((file: File) => {
    setError(null);
    if (!isChatImageMime(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > CHAT_MAX_IMAGE_BYTES) {
      setError("Images must be 5 MB or smaller.");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  }, []);

  const clearImage = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setMessages((prev) => prev.map((item) => (item.id === id ? asDeleted(item) : item)));
  }, []);

  const handleSend = useCallback(async () => {
    const body = text.trim();
    if ((!body && !imageFile) || sendingRef.current || body.length > CHAT_MAX_BODY) return;

    sendingRef.current = true;
    const file = imageFile;
    const preview = imagePreview;
    const tempId = `pending-${newId()}`;

    setError(null);
    setSending(true);
    setPending((prev) => [
      ...prev,
      { id: tempId, body, previewUrl: preview, createdAt: new Date().toISOString() },
    ]);
    setText("");
    setImageFile(null);
    setImagePreview(null);
    previewRef.current = null;

    let uploadedPath: string | null = null;

    try {
      let attachment:
        | {
            path: string;
            mime: string;
            bytes: number;
            width: number | null;
            height: number | null;
          }
        | null = null;

      if (file) {
        const size = await imageSize(file);
        const extension = chatImageExtension(file.type as ChatImageMime);
        const path = `${conversationId}/${me.id}/${newId()}.${extension}`;
        const sb = supabaseBrowser();
        const { error: uploadError } = await sb.storage
          .from("chat")
          .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error("Could not upload that image. Try again.");
        uploadedPath = path;
        attachment = {
          path,
          mime: file.type,
          bytes: file.size,
          width: size.width,
          height: size.height,
        };
      }

      const result = await sendChatMessage({ slug, body, attachment });
      if (!result.ok) throw new Error(result.error);

      if (preview) URL.revokeObjectURL(preview);
      setPending((prev) => prev.filter((item) => item.id !== tempId));
      setMessages((prev) =>
        prev.some((item) => item.id === result.message.id)
          ? prev
          : [...prev, result.message]
      );
    } catch (cause) {
      if (uploadedPath) {
        void supabaseBrowser().storage.from("chat").remove([uploadedPath]);
      }
      setPending((prev) => prev.filter((item) => item.id !== tempId));
      setText((current) => current || body);
      if (file && preview) {
        setImageFile(file);
        setImagePreview(preview);
        previewRef.current = preview;
      }
      setError(
        cause instanceof Error ? cause.message : "Could not send your message. Try again."
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
      window.requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [conversationId, imageFile, imagePreview, me.id, slug, text]);

  const canSend =
    (text.trim().length > 0 || !!imageFile) &&
    !sending &&
    text.length <= CHAT_MAX_BODY;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-black md:h-dvh">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b hairline bg-black/80 px-2 backdrop-blur sm:px-4">
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <ChatAvatar name={group.name} url={null} className="h-8 w-8 text-[10px]" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-medium">{group.name}</h1>
          <p className="truncate text-[11px] text-zinc-500">
            {members.length} {members.length === 1 ? "member" : "members"}
            {group.active ? "" : " · forming"}
          </p>
        </div>
        <Link
          href={`/groups/${slug}`}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Users className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Group</span>
        </Link>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={attachScroller}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overscroll-contain px-3 py-4 sm:px-6"
        >
          <div className="mx-auto w-full max-w-3xl">
            {messages.length === 0 && pending.length === 0 ? (
              <div className="flex h-full min-h-[50dvh] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border hairline bg-white/[0.04]">
                  <Users className="h-5 w-5 text-zinc-500" aria-hidden />
                </div>
                <p className="mt-3 text-sm text-zinc-300">This is the start of {group.name}.</p>
                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                  Say hello. Only members can see this chat.
                </p>
              </div>
            ) : (
              (() => {
                const nodes: ReactNode[] = [];
                let previous: ChatMessage | null = null;

                for (const message of messages) {
                  const previousDay = previous ? chatDayLabel(previous.createdAt) : null;
                  const thisDay = chatDayLabel(message.createdAt);
                  if (previousDay !== thisDay) {
                    nodes.push(
                      <div key={`day-${thisDay}-${message.id}`} className="my-5 flex items-center gap-3 px-2">
                        <span className="h-px flex-1 bg-white/[0.06]" />
                        <span
                          suppressHydrationWarning
                          className="text-[10px] uppercase tracking-widest text-zinc-500"
                        >
                          {thisDay}
                        </span>
                        <span className="h-px flex-1 bg-white/[0.06]" />
                      </div>
                    );
                  }

                  const showMeta =
                    !previous ||
                    previousDay !== thisDay ||
                    previous.senderId !== message.senderId ||
                    new Date(message.createdAt).getTime() -
                      new Date(previous.createdAt).getTime() >
                      5 * 60_000;

                  nodes.push(
                    <MessageBubble
                      key={message.id}
                      message={message}
                      mine={message.senderId === me.id}
                      showMeta={showMeta}
                      onImage={setLightbox}
                      onDeleted={handleDeleted}
                    />
                  );
                  previous = message;
                }

                return nodes;
              })()
            )}

            {pending.map((item) => (
              <PendingBubble key={item.id} item={item} />
            ))}
          </div>
        </div>

        {!atBottom && newCount > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border hairline bg-[#111] px-3 py-1.5 text-xs text-zinc-200 shadow-lg transition-colors hover:bg-[#181818] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            {newCount} new {newCount === 1 ? "message" : "messages"}
          </button>
        )}
      </div>

      <div className="shrink-0 border-t hairline bg-[#0a0a0a] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <div className="mx-auto w-full max-w-3xl">
          {error && (
            <p role="alert" className="mb-2 text-xs text-red-400">
              {error}
            </p>
          )}

          {imagePreview && (
            <div className="mb-2 inline-flex items-start gap-2 rounded-xl border hairline bg-black/40 p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Selected image"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}

          <div className="flex items-end gap-1.5 rounded-2xl border hairline bg-black/60 p-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) pickImage(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={sending}
              aria-label="Attach an image"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
            >
              <ImagePlus className="h-[18px] w-[18px]" aria-hidden />
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              onPaste={(event) => {
                const file = Array.from(event.clipboardData.files).find((item) =>
                  item.type.startsWith("image/")
                );
                if (file) {
                  event.preventDefault();
                  pickImage(file);
                }
              }}
              rows={1}
              maxLength={CHAT_MAX_BODY}
              placeholder={`Message ${group.name}`}
              aria-label={`Message ${group.name}`}
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-2 text-sm leading-5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          <p className="mt-1.5 hidden text-[10px] text-zinc-600 sm:block">
            Enter to send · Shift+Enter for a new line · JPEG, PNG, WebP or GIF up to 5 MB
          </p>
        </div>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close image"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size image"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85dvh] max-w-[92vw] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  showMeta,
  onImage,
  onDeleted,
}: {
  message: ChatMessage;
  mine: boolean;
  showMeta: boolean;
  onImage: (url: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setDeleting(true);
    setError(null);
    const result = await deleteChatMessage(message.id);
    setDeleting(false);
    if (result.ok) {
      setConfirming(false);
      onDeleted(message.id);
    } else {
      setError(result.error);
      setConfirming(false);
    }
  };

  const deleted = !!message.deletedAt;
  const hasBody = message.body.trim().length > 0;
  const hasImage = !!message.attachmentUrl;
  const displaySize = fittedImageSize(
    message.attachmentWidth,
    message.attachmentHeight
  );

  return (
    <div className="group/msg">
      {!mine && showMeta && (
        <p className="mb-1 pl-9 text-[11px] text-zinc-500">{message.senderName}</p>
      )}
      <div className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
        {!mine &&
          (showMeta ? (
            <ChatAvatar
              name={message.senderName}
              url={message.senderAvatarUrl}
              className="mt-0.5 h-7 w-7 text-[9px]"
            />
          ) : (
            <span className="w-7 shrink-0" aria-hidden />
          ))}

        <div
          className={cn(
            "flex max-w-[85%] flex-col sm:max-w-[75%]",
            mine ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "overflow-hidden",
              deleted
                ? "rounded-2xl border border-dashed border-white/10 px-3 py-2"
                : mine
                  ? "rounded-2xl rounded-br-md bg-white text-black"
                  : "rounded-2xl rounded-bl-md border hairline bg-white/[0.07] text-zinc-100",
              !deleted && (hasBody ? "px-3 py-2" : "p-1")
            )}
          >
            {deleted ? (
              <p className="text-xs italic text-zinc-500">Message removed</p>
            ) : (
              <>
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => onImage(message.attachmentUrl as string)}
                    aria-label="Open image"
                    className={cn(
                      "block max-w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                      hasBody && "mb-2"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.attachmentUrl as string}
                      alt=""
                      width={message.attachmentWidth ?? undefined}
                      height={message.attachmentHeight ?? undefined}
                      loading={displaySize ? "lazy" : "eager"}
                      decoding="async"
                      style={
                        displaySize ?? { maxWidth: 280, maxHeight: 320 }
                      }
                      className="block h-auto w-auto max-w-full rounded-xl object-contain"
                    />
                  </button>
                )}
                {hasBody && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.body}
                  </p>
                )}
                {!hasImage && !hasBody && (
                  <p className="px-1 text-xs italic text-zinc-500">
                    {message.attachmentPath ? "Loading image…" : "Image unavailable"}
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className={cn(
              "mt-1 flex items-center gap-2 px-1 text-[10px] text-zinc-600",
              mine && "flex-row-reverse"
            )}
          >
            <time
              dateTime={message.createdAt}
              title={chatFullTime(message.createdAt)}
              suppressHydrationWarning
            >
              {chatMessageTime(message.createdAt)}
            </time>
            {message.canDelete && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label="Delete message"
                className="opacity-40 transition-opacity hover:text-red-400 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none sm:opacity-0 sm:group-hover/msg:opacity-100"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>

          {confirming && (
            <div
              className={cn(
                "mt-1 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-2 py-1 text-[11px]",
                mine ? "self-end" : "self-start"
              )}
            >
              <span className="text-zinc-300">Delete?</span>
              <button
                type="button"
                onClick={() => void remove()}
                disabled={deleting}
                className="font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          )}

          {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function PendingBubble({ item }: { item: PendingSend }) {
  return (
    <div className="mt-2 flex justify-end">
      <div className="flex max-w-[85%] flex-col items-end sm:max-w-[75%]">
        <div className="overflow-hidden rounded-2xl rounded-br-md bg-white text-black opacity-70">
          {item.previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.previewUrl}
              alt=""
              style={{ maxWidth: 280, maxHeight: 320 }}
              className="block h-auto w-auto max-w-full object-contain"
            />
          )}
          {item.body && (
            <p className="whitespace-pre-wrap break-words px-3 py-2 text-sm leading-relaxed">
              {item.body}
            </p>
          )}
        </div>
        <p className="mt-1 px-1 text-[10px] text-zinc-600">Sending…</p>
      </div>
    </div>
  );
}
