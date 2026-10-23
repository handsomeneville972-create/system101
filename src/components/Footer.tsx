import Image from "next/image";
import Link from "next/link";
import { INTERESTS } from "@/lib/domain";
import { LEGAL_LINKS, SITE } from "@/lib/nav";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getYear();

  return (
    <footer className="mt-16 border-t hairline">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={406} height={396} className="h-8 w-auto" />
              <span className="text-sm font-semibold tracking-tight">
                {SITE.name} <span className="text-zinc-400">· Grow</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-400">{SITE.tagline}</p>
          </div>

          <div className="md:max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400">Interests</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              {INTERESTS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/findem/${p.slug}`}
                  className="btn-pill border hairline px-3 py-1.5 text-xs whitespace-nowrap text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t hairline pt-6 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name} · From {SITE.company}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
