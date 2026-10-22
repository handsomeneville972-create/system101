import Image from "next/image";
import Link from "next/link";
import { Youtube } from "lucide-react";
import { PROFESSIONS } from "@/lib/domain";

const YOUTUBE_URL = "https://www.youtube.com/@PERSPECTIVExGROWTH";
const CONTACT_EMAIL = "support@001system.dev";

const EXPLORE = [
  { href: "/findem", label: "Find'em" },
  { href: "/ebooku", label: "Ebooku" },
  { href: "/suggy", label: "Suggy" },
  { href: "/decourse", label: "De-Course" },
  { href: "/apps", label: "System Apps" },
];

const CONTRIBUTE = [
  { href: "/groups/new", label: "Create a group" },
  { href: "/ebooku/upload", label: "Upload a book" },
  { href: "/decourse/upload", label: "Upload a course" },
];

const COMPANY = [
  { href: "/#about", label: "About us" },
  { href: `mailto:${CONTACT_EMAIL}`, label: "Contact" },
  { href: `mailto:${CONTACT_EMAIL}?subject=Support%20request`, label: "Support" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const cls = "inline-block py-1.5 text-sm text-zinc-400 hover:text-white";
  if (href.startsWith("mailto:")) return <a href={href} className={cls}>{label}</a>;
  if (href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

function FooterGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs uppercase tracking-widest text-zinc-400">{title}</h2>
      <ul className="mt-3 space-y-1">
        {links.map((l) => (
          <li key={l.label}>
            <FooterLink href={l.href} label={l.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getYear();

  return (
    <footer className="mt-16 border-t hairline">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={406} height={396} className="h-8 w-auto" />
              <span className="text-sm font-semibold tracking-tight">
                0.01%SYSTEM <span className="text-zinc-400">· Grow</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-zinc-400">
              For those who aspire. Build something great. Find your people.
            </p>
            <a
              href={YOUTUBE_URL}
              aria-label="YouTube"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full border hairline text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <Youtube size={16} />
            </a>
          </div>

          <FooterGroup title="Explore" links={EXPLORE} />
          <FooterGroup title="Contribute" links={CONTRIBUTE} />
          <FooterGroup title="Company" links={COMPANY} />
        </div>

        <div className="mt-10 border-t hairline pt-6">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400">Crafts</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            {PROFESSIONS.map((p) => (
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

        <div className="mt-10 flex flex-col gap-3 border-t hairline pt-6 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>© {year} 0.01%SYSTEM · From C. Levi Company</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
