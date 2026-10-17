"use client";

import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="rounded-full border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5">
        Sign out
      </button>
    </form>
  );
}
