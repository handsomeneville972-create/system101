import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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
          <Image
            src="/logo.png"
            alt=""
            width={406}
            height={396}
            className="auth-logo"
            priority
          />
          <span className="auth-wordmark">De`System</span>
        </Link>
      </header>

      <main className="auth-main">{children}</main>

      <footer className="auth-footer">
        <span>De`System · From C. Levi Company</span>
        <span className="auth-footer-links">
          <a href="mailto:support@001system.dev">Support</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </footer>
    </div>
  );
}
