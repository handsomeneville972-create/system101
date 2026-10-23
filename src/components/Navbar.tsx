import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "@/components/AuthNav";
import { MenuButton } from "@/components/shell/MenuButton";

function AuthFallback() {
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

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b hairline bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <MenuButton />
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="0.01%SYSTEM"
              width={406}
              height={396}
              className="h-8 w-auto"
              priority
            />
            <span className="hidden truncate text-sm font-semibold tracking-tight sm:inline">
              0.01%SYSTEM <span className="text-zinc-400">· Grow</span>
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Suspense fallback={<AuthFallback />}>
            <AuthNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
