import Link from "next/link";
import { COMPANY_LINKS, SITE } from "@/lib/nav";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

const LINK =
  "text-xs leading-5 text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:rounded-sm";

export async function SidebarCompany() {
  const year = await getYear();

  return (
    <nav
      aria-label="Company"
      className="mt-2 border-t border-white/[0.06] pt-2 pb-1"
    >
      <h2 className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
        Company
      </h2>
      <ul className="flex flex-wrap items-center gap-x-3 px-2.5">
        {COMPANY_LINKS.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("mailto:") ? (
              <a href={link.href} className={LINK}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={LINK}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 px-2.5 text-xs leading-5 text-zinc-400">
        © {year} {SITE.name} · From {SITE.company}
      </p>
    </nav>
  );
}
