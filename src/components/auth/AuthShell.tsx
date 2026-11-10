import Link from "next/link";
import type { ReactNode } from "react";

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M19.5 9.5c-2.6 1.6-4 3.8-4.2 6.6" strokeWidth="1.7" />
      <path
        d="M13.5 9.5c-2.6 1.6-4 3.8-4.2 6.6"
        strokeWidth="1.7"
        opacity=".42"
      />
    </svg>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <link
        rel="preload"
        as="image"
        href="/wide_dark_monochrome_doodle_wallpaper_background.png"
        fetchPriority="high"
      />
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-scrim" aria-hidden="true" />

      <header className="auth-topbar">
        <Link href="/" className="auth-brand" aria-label="De`System home">
          <span className="auth-mark">
            <BrandMark />
          </span>
          <span className="auth-wordmark">De`System</span>
        </Link>
        <span className="auth-topnote">
          <span className="auth-topnote-dot" aria-hidden="true" />
          Member-run rooms
        </span>
      </header>

      <main className="auth-main">{children}</main>

      <footer className="auth-footer">
        <span>De`System · From C. Levi Company</span>
        <span className="auth-footer-links">
          <span className="auth-footer-lead" aria-hidden="true">
            /
          </span>
          <a href="mailto:support@001system.dev">Support</a>
          <span aria-hidden="true">/</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </footer>
    </div>
  );
}
