"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#system", label: "System" },
  { href: "/#about", label: "About" },
  { href: "/#interests", label: "Interests" },
  { href: "/findem", label: "Find'em" },
  { href: "/ebooku", label: "Ebooku" },
  { href: "/suggy", label: "Suggy" },
  { href: "/decourse", label: "De-Course" },
  { href: "/apps", label: "Apps" },
];

const ITEM =
  "flex h-11 items-center justify-between rounded-lg px-3 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="marketing-menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
      </button>
      {mounted && open
        ? createPortal(
            <>
              <div
                aria-hidden
                onClick={close}
                className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm"
              />
              <div
                id="marketing-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b hairline bg-[#0a0a0a] px-5 pb-6 pt-3"
              >
                <nav aria-label="Mobile">
                  <ul className="space-y-0.5">
                    {LINKS.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} onClick={close} className={ITEM}>
                          {link.label}
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-4 border-t hairline pt-4">
                  {signedIn ? (
                    <Link
                      href="/home"
                      onClick={close}
                      className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      Open app
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/auth/sign-in"
                        onClick={close}
                        className="inline-flex h-11 items-center justify-center rounded-full border hairline text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        onClick={close}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        Start
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
