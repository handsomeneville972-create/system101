import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "@/components/AuthNav";

const links = [
  { href: "/home", label: "Home" },
  { href: "/findem", label: "Find'em" },
  { href: "/ebooku", label: "Ebooku" },
  { href: "/suggy", label: "Suggy" },
  { href: "/apps", label: "Apps" },
  { href: "/decourse", label: "De-Course" },
];

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
    <header className="sticky top-0 z-40 border-b hairline bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="0.01%SYSTEM"
            width={406}
            height={396}
            className="h-8 w-auto"
            priority
          />
          <span className="text-sm font-semibold tracking-tight">
            0.01%SYSTEM <span className="text-zinc-400">· Grow</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={<AuthFallback />}>
            <AuthNav />
          </Suspense>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t hairline px-4 py-2 text-sm text-zinc-300 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-white">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
