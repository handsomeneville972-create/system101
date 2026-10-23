"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import {
  COMPANY_NAV,
  CONTRIBUTE_NAV,
  NAV_LINKS,
  SITE,
  WORK_NAV,
  type NavItem,
} from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useSidebar } from "@/components/shell/sidebar-context";

function isActive(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const isMail = item.href.startsWith("mailto:");
  const isExternal = item.external === true || item.href.startsWith("http");
  const className = cn(
    "group flex h-9 items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    active
      ? "bg-white/10 text-white"
      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
    collapsed && "md:gap-0",
  );
  const title = collapsed ? item.label : undefined;
  const content = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span
        className={cn(
          "truncate whitespace-nowrap transition-opacity duration-150",
          collapsed && "md:w-0 md:opacity-0",
        )}
      >
        {item.label}
      </span>
      {isExternal ? (
        <ArrowUpRight
          className={cn(
            "ml-auto h-3.5 w-3.5 shrink-0 text-zinc-500",
            collapsed && "md:hidden",
          )}
          aria-hidden
        />
      ) : null}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        title={title}
        className={className}
      >
        {content}
      </a>
    );
  }

  if (isMail) {
    return (
      <a href={item.href} title={title} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      title={title}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function SidebarSection({
  title,
  links,
  pathname,
  collapsed,
  divider,
}: {
  title: string;
  links: NavItem[];
  pathname: string;
  collapsed: boolean;
  divider?: boolean;
}) {
  return (
    <section className={cn(divider && "mt-2 border-t border-white/[0.06] pt-2")}>
      <h2
        className={cn(
          "h-6 overflow-hidden px-2.5 pb-1 text-[11px] font-medium uppercase tracking-widest text-zinc-400 transition-all duration-200",
          collapsed && "md:h-0 md:pb-0 md:opacity-0",
        )}
      >
        {title}
      </h2>
      <ul className="space-y-0.5">
        {links.map((item) => {
          const inert =
            item.external === true ||
            item.href.startsWith("http") ||
            item.href.startsWith("mailto:");
          return (
            <li key={item.href}>
              <SidebarLink
                item={item}
                active={!inert && isActive(pathname, item.href)}
                collapsed={collapsed}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function AppSidebar({ account }: { account: ReactNode }) {
  const {
    collapsed,
    mounted,
    mobileOpen,
    isDesktop,
    toggleCollapsed,
    closeMobile,
  } = useSidebar();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [mobileOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!mobileOpen || event.key !== "Tab") return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div
        aria-hidden
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
        inert={!isDesktop && !mobileOpen ? true : undefined}
        data-collapsed={collapsed ? "true" : "false"}
        onKeyDown={handleKeyDown}
        onClickCapture={(event) => {
          if ((event.target as Element).closest("a[href]")) closeMobile();
        }}
        onSubmitCapture={closeMobile}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col overflow-hidden border-r hairline bg-[#0a0a0a] text-zinc-200",
          "max-md:transition-transform max-md:duration-300 max-md:ease-[cubic-bezier(0.4,0,0.2,1)]",
          mounted
            ? "md:transition-[width] md:duration-200 md:ease-out"
            : "md:transition-none",
          collapsed ? "md:w-[52px]" : "md:w-[260px]",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-1 px-2.5",
            collapsed && "md:justify-center md:px-0",
          )}
        >
          <Link
            href="/"
            onClick={closeMobile}
            aria-label={`${SITE.name} home`}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              collapsed && "md:hidden",
            )}
          >
            <Image
              src="/logo.png"
              alt=""
              width={406}
              height={396}
              className="h-7 w-7 shrink-0"
              priority
            />
            <span className="truncate text-sm font-semibold tracking-tight">
              {SITE.name}
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>

        <nav
          aria-label="Primary"
          className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2"
        >
          <SidebarSection
            title="Explore"
            links={NAV_LINKS}
            pathname={pathname}
            collapsed={collapsed}
          />
          <SidebarSection
            title="Your work"
            links={WORK_NAV}
            pathname={pathname}
            collapsed={collapsed}
            divider
          />
          <SidebarSection
            title="Contribute"
            links={CONTRIBUTE_NAV}
            pathname={pathname}
            collapsed={collapsed}
            divider
          />
          <SidebarSection
            title="Company"
            links={COMPANY_NAV}
            pathname={pathname}
            collapsed={collapsed}
            divider
          />
        </nav>

        <div className="shrink-0 border-t hairline p-1.5">{account}</div>
      </aside>
    </>
  );
}
