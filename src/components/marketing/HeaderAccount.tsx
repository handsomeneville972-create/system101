import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import { MobileMenu } from "@/components/marketing/MobileMenu";

const SIGN_IN =
  "inline-flex h-9 items-center rounded-full px-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const START =
  "btn-pill inline-flex h-9 items-center gap-1.5 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const MOBILE_START =
  "btn-pill inline-flex h-9 items-center bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";

export function SignedOutActions() {
  return (
    <>
      <Link href="/auth/sign-in" className={SIGN_IN}>
        Sign in
      </Link>
      <Link href="/auth/sign-up" className={START}>
        Start
      </Link>
    </>
  );
}

export function HeaderActionsView({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        {signedIn ? (
          <Link href="/home" className={START}>
            Open app
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <SignedOutActions />
        )}
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <Link href={signedIn ? "/home" : "/auth/sign-up"} className={MOBILE_START}>
          {signedIn ? "Open app" : "Start"}
        </Link>
        <MobileMenu signedIn={signedIn} />
      </div>
    </>
  );
}

export async function HeaderAccount() {
  const user = await getUser();
  return <HeaderActionsView signedIn={Boolean(user)} />;
}
