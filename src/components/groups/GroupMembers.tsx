"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { removeMember, transferLeader, type FormState } from "@/lib/actions/groups";

const initial: FormState = {};

type Member = { user_id: string; role: string; display_name: string | null };

function PendingButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function RemoveForm({
  groupId,
  slug,
  member,
}: {
  groupId: string;
  slug: string;
  member: Member;
}) {
  const [state, action] = useActionState(removeMember, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Remove ${member.display_name ?? "this member"}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="user_id" value={member.user_id} />
      <PendingButton
        label="Remove"
        pendingLabel="…"
        className="text-xs text-zinc-500 hover:text-red-400"
      />
      {state.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
    </form>
  );
}

function TransferForm({
  groupId,
  slug,
  members,
}: {
  groupId: string;
  slug: string;
  members: Member[];
}) {
  const [state, action] = useActionState(transferLeader, initial);
  if (members.length === 0) return null;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Transfer leadership? You will become a regular member.")) e.preventDefault();
      }}
      className="mt-4 border-t hairline pt-4"
    >
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="slug" value={slug} />
      <p className="text-xs text-zinc-500">Transfer leadership before leaving.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          name="user_id"
          required
          defaultValue=""
          className="rounded-md border hairline bg-black px-2 py-1.5 text-xs"
        >
          <option value="" disabled>
            Pick member
          </option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.display_name ?? "Member"}
            </option>
          ))}
        </select>
        <PendingButton
          label="Make leader"
          pendingLabel="Transferring…"
          className="btn-pill border hairline px-3 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
        />
      </div>
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="mt-2 text-xs text-zinc-400">Leadership transferred.</p>}
    </form>
  );
}

export function GroupMembers({
  groupId,
  slug,
  members,
  leaderId,
  isLeader,
  currentUserId,
}: {
  groupId: string;
  slug: string;
  members: Member[];
  leaderId: string | null;
  isLeader: boolean;
  currentUserId: string;
}) {
  const others = members.filter((m) => m.user_id !== leaderId);

  return (
    <div>
      <ul className="space-y-2 text-sm">
        {members.map((m) => (
          <li key={m.user_id} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <Link href={`/u/${m.user_id}`} className="truncate hover:underline">
                {m.display_name ?? "Member"}
                {m.user_id === currentUserId ? " (you)" : ""}
              </Link>
              {m.role !== "member" && (
                <span className="shrink-0 text-xs text-zinc-500">{m.role}</span>
              )}
            </span>
            {isLeader && m.user_id !== leaderId && (
              <RemoveForm groupId={groupId} slug={slug} member={m} />
            )}
          </li>
        ))}
      </ul>
      {isLeader && <TransferForm groupId={groupId} slug={slug} members={others} />}
    </div>
  );
}
