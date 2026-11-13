"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  lookupGroupInvitees,
  sendGroupInvite,
  type InviteLookup,
  type InviteState,
} from "@/lib/actions/groups";
import { interestLabel } from "@/lib/domain";
import { normalizeUsername } from "@/lib/username";

type Invitee = {
  id: string;
  username: string;
  display_name: string | null;
  status: string;
  expires_at: string | null;
  responded_at: string | null;
};

const initial: InviteState = {};

function InviteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending || disabled}
      className="btn-pill shrink-0 bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
    >
      {pending ? "Sending…" : "Invite"}
    </button>
  );
}

function statusMessage(lookup: InviteLookup | null): {
  tone: "muted" | "good" | "bad";
  text: string;
} | null {
  if (!lookup) return null;
  const username = lookup.profile?.username ?? lookup.query;
  switch (lookup.status) {
    case "ok":
      return {
        tone: "good",
        text: lookup.profile?.display_name
          ? `Ready to invite @${username} (${lookup.profile.display_name}).`
          : `Ready to invite @${username}.`,
      };
    case "not_found":
      return { tone: "bad", text: "No member with that username." };
    case "wrong_interest":
      return { tone: "bad", text: "That username is in another interest." };
    case "self":
      return { tone: "bad", text: "That's your username." };
    case "member":
      return { tone: "bad", text: "That person is already a member." };
    case "already_invited":
      return { tone: "bad", text: "That person is already invited." };
    case "full":
      return { tone: "bad", text: "Both invite slots are used." };
    case "group_active":
      return { tone: "bad", text: "This group is already active." };
    case "not_leader":
      return { tone: "bad", text: "Leader only." };
    case "rate_limited":
      return { tone: "bad", text: "Too many searches. Pause a moment." };
    default:
      return null;
  }
}

function expiryLabel(iso: string | null) {
  if (!iso) return "72h";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UsernameInvites({
  groupId,
  slug,
  interest,
  invitees,
  justCreated = false,
}: {
  groupId: string;
  slug: string;
  interest: string;
  invitees: Invitee[];
  justCreated?: boolean;
}) {
  const router = useRouter();
  const [state, action] = useActionState(sendGroupInvite, initial);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<{
    query: string;
    result: InviteLookup;
  } | null>(null);

  const pending = invitees.filter(
    (invite) =>
      invite.status === "invited" &&
      (!invite.expires_at || new Date(invite.expires_at) > new Date())
  );
  const slotsLeft = Math.max(0, 2 - pending.length);
  const normalized = normalizeUsername(query);
  const lookup = checked?.query === normalized ? checked.result : null;
  const canInvite = lookup?.status === "ok" && slotsLeft > 0;
  const suggestions = lookup?.suggestions ?? [];

  useEffect(() => {
    if (!normalized) return;

    let live = true;
    const timer = setTimeout(async () => {
      try {
        const result = await lookupGroupInvitees(groupId, normalized);
        if (live) setChecked({ query: normalized, result });
      } catch {
        if (live) setChecked(null);
      }
    }, 350);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [groupId, normalized]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const message = statusMessage(lookup);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Invite by username</h2>
        <span className="text-xs text-zinc-500">{slotsLeft}/2 slots open</span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Only people in {interestLabel(interest) ?? "this interest"} can be invited.
        Two accepts activate the group.
      </p>
      {justCreated && (
        <p className="mt-3 text-sm text-zinc-300">
          Group created. Invite two people to activate it.
        </p>
      )}

      <form
        action={action}
        onSubmit={() => {
          if (canInvite) setQuery("");
        }}
        className="mt-4"
      >
        <input type="hidden" name="group_id" value={groupId} />
        <input type="hidden" name="slug" value={slug} />
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">
              @
            </span>
            <input
              name="username"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value.replace(/^@+/, "").toLowerCase())
              }
              placeholder="username"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={20}
              disabled={slotsLeft === 0}
              className="w-full rounded-md border hairline bg-black py-2 pl-7 pr-3 text-sm lowercase disabled:opacity-50"
            />
          </div>
          <InviteButton disabled={!canInvite} />
        </div>
      </form>

      {message && (
        <p
          className={`mt-2 text-xs ${
            message.tone === "good"
              ? "text-emerald-400"
              : message.tone === "bad"
                ? "text-red-400"
                : "text-zinc-500"
          }`}
        >
          {message.text}
        </p>
      )}
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state.message && <p className="mt-2 text-xs text-zinc-400">{state.message}</p>}

      {suggestions.length > 0 && (
        <ul className="mt-3 divide-y divide-white/[0.06] rounded-md border hairline">
          {suggestions.map((suggestion) => (
            <li key={suggestion.username}>
              <button
                type="button"
                onClick={() => setQuery(suggestion.username)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/[0.04]"
              >
                <span className="min-w-0">
                  <span className="block truncate">@{suggestion.username}</span>
                  {suggestion.display_name && (
                    <span className="block truncate text-xs text-zinc-500">
                      {suggestion.display_name}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {suggestion.invited ? "invited" : "invite"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t hairline pt-4">
        <h3 className="text-xs font-medium text-zinc-400">Pending</h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">No pending invites.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate">
                  @{invite.username}
                  {invite.display_name && (
                    <span className="ml-2 text-xs text-zinc-500">
                      {invite.display_name}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  until {expiryLabel(invite.expires_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
