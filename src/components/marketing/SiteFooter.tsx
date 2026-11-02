import Image from "next/image";
import Link from "next/link";
import { COMPANY_LINKS, NAV_LINKS, SITE } from "@/lib/nav";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

const COLUMN_TITLE = "font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400";
const FOOTER_LINK =
  "inline-flex rounded-sm text-sm text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={FOOTER_LINK}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={FOOTER_LINK}>
      {label}
    </Link>
  );
}

export async function SiteFooter() {
  const year = await getYear();
  const explore = NAV_LINKS.filter((link) => link.href !== "/home");

  return (
    <footer className="border-t hairline bg-[#050505]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label={`${SITE.name} home`}
              className="inline-flex items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Image src="/logo.png" alt="" width={406} height={396} className="h-7 w-auto" />
              <span className="text-sm font-semibold tracking-tight">{SITE.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">{SITE.tagline}</p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Built for builders.
            </p>
          </div>

          <div>
            <h2 className={COLUMN_TITLE}>Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {explore.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={COLUMN_TITLE}>Company</h2>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={COLUMN_TITLE}>Start</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterLink href="/auth/sign-up" label="Create account" />
              </li>
              <li>
                <FooterLink href="/auth/sign-in" label="Sign in" />
              </li>
              <li>
                <FooterLink href="/findem" label="Browse groups" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t hairline pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name} · From {SITE.company}
          </p>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            All systems live
          </p>
        </div>
      </div>
    </footer>
  );
}
