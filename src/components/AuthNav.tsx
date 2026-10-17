import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export async function AuthNav() {
  const user = await getUser();
  if (!user) {
    return (
      <>
        <Link
          href="/auth/sign-in"
          className="rounded-full border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="btn-pill bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
        >
          Sign up
        </Link>
      </>
    );
  }

  const profile = await getProfile();
  const name = profile?.display_name ?? user.email?.split("@")[0] ?? "You";

  return (
    <>
      <Link
        href="/home"
        className="flex items-center gap-2 rounded-full border hairline px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-medium text-black">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[90px] truncate">{name}</span>
      </Link>
      <SignOutButton />
    </>
  );
}
