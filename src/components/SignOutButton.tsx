"use client";

import { signOut } from "@/lib/actions/auth";

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={signOut}>
      <button
        className={
          className ??
          "rounded-full border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
        }
      >
        {children ?? "Sign out"}
      </button>
    </form>
  );
}
