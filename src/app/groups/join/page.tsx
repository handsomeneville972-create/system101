import Link from "next/link";
import { supabasePublic } from "@/lib/supabase-public";
import { acceptInvite } from "@/lib/actions/groups";

export const instant = false;

type InviteInfo = {
  group_name: string;
  group_slug: string;
  status: string;
  expired: boolean;
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Invite</h1>
        <p className="mt-2 text-sm text-zinc-400">Missing invite token.</p>
        <Link href="/findem" className="mt-6 inline-block text-sm text-zinc-300 underline">
          Browse groups
        </Link>
      </div>
    );
  }

  const sb = supabasePublic();
  const { data } = await sb.rpc("join_invite_info", { p_token: token });
  const info = data as InviteInfo | null;

  if (!info || info.expired || info.status === "expired") {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Invite</h1>
        <p className="mt-2 text-sm text-zinc-400">This invite is invalid or has expired.</p>
        <Link href="/findem" className="mt-6 inline-block text-sm text-zinc-300 underline">
          Browse groups
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">You&apos;re invited</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Join <span className="text-zinc-200">{info.group_name}</span>.
      </p>
      <form action={acceptInvite} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button className="btn-pill w-full bg-white py-2.5 text-sm font-medium text-black">
          Accept invite
        </button>
      </form>
      <Link
        href={`/groups/${info.group_slug}`}
        className="mt-4 inline-block text-xs text-zinc-500 underline"
      >
        View group
      </Link>
    </div>
  );
}
