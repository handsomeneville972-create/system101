"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

function SignOutSubmit({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        className ??
          "rounded-full border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5",
        "disabled:opacity-50"
      )}
    >
      {pending && !children ? "Signing out…" : (children ?? "Sign out")}
    </button>
  );
}

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={signOut}>
      <SignOutSubmit className={className}>{children}</SignOutSubmit>
    </form>
  );
}
