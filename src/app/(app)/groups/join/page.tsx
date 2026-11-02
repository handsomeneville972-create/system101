import Link from "next/link";
import { supabasePublic } from "@/lib/supabase-public";
import { acceptInvite } from "@/lib/actions/groups";
import { getUser } from "@/lib/auth";

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
  const { token, error } = await searchParams;
  const user = await getUser();

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

  if (!info || info.expired || info.status !== "invited") {
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
      {user ? (
        <form action={acceptInvite} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <button className="btn-pill w-full bg-white py-2.5 text-sm font-medium text-black">
            Accept invite
          </button>
        </form>
      ) : (
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(`/groups/join?token=${token}`)}`}
          className="btn-pill mt-6 block w-full bg-white py-2.5 text-center text-sm font-medium text-black"
        >
          Sign in to accept
        </Link>
      )}
      {error && <p className="mt-3 text-xs text-red-400">That invite is no longer available.</p>}
      <Link
        href={`/groups/${info.group_slug}`}
        className="mt-4 inline-block text-xs text-zinc-500 underline"
      >
        View group
      </Link>
    </div>
  );
}
