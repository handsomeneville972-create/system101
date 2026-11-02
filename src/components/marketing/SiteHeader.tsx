import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SITE } from "@/lib/nav";
import { HeaderAccount, HeaderActionsView } from "@/components/marketing/HeaderAccount";

const LINKS = [
  { href: "/#system", label: "System" },
  { href: "/#about", label: "About" },
  { href: "/#interests", label: "Interests" },
];

const NAV_LINK =
  "rounded-full px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-black/70 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          aria-label={`${SITE.name} home`}
          className="flex shrink-0 items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Image src="/logo.png" alt="" width={406} height={396} className="h-6 w-auto" priority />
          <span className="text-sm font-semibold tracking-tight">{SITE.name}</span>
        </Link>

        <nav aria-label="Marketing" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={NAV_LINK}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Suspense fallback={<HeaderActionsView signedIn={false} />}>
          <HeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}
