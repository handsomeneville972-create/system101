import Link from "next/link";
import { LogIn, LogOut, Settings, UserPlus } from "lucide-react";
import { getProfile, getUser } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

const ROW =
  "sidebar-account-row flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";
const LABEL = "sidebar-account-label truncate";
const ICON = "h-[18px] w-[18px] shrink-0";

export async function SidebarAccount() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="space-y-0.5">
        <Link href="/auth/sign-in" className={ROW}>
          <LogIn className={ICON} aria-hidden />
          <span className={LABEL}>Sign in</span>
        </Link>
        <Link href="/auth/sign-up" className={ROW}>
          <UserPlus className={ICON} aria-hidden />
          <span className={LABEL}>Sign up</span>
        </Link>
      </div>
    );
  }

  const profile = await getProfile();
  const name = profile?.display_name ?? user.email?.split("@")[0] ?? "You";

  return (
    <div className="space-y-0.5">
      <Link href={`/u/${user.id}`} className={ROW} title={name}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-black">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className={LABEL}>{name}</span>
      </Link>
      <Link href="/settings" className={ROW} title="Settings">
        <Settings className={ICON} aria-hidden />
        <span className={LABEL}>Settings</span>
      </Link>
      <SignOutButton className={ROW}>
        <LogOut className={ICON} aria-hidden />
        <span className={LABEL}>Sign out</span>
      </SignOutButton>
    </div>
  );
}
