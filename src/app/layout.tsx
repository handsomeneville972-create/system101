import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppContent } from "@/components/shell/AppContent";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { SidebarAccount } from "@/components/shell/SidebarAccount";
import { SidebarCompany } from "@/components/shell/SidebarCompany";
import { SidebarInbox } from "@/components/shell/SidebarInbox";
import { SidebarProvider } from "@/components/shell/sidebar-context";
import { SITE } from "@/lib/nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${SITE.name} · Grow`,
  description: "Find your people. Build. Grow.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${SITE.name} · Grow`,
    description: "Find your people. Build. Grow.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

function AccountFallback() {
  return (
    <div className="space-y-0.5">
      <div className="h-10 rounded-lg bg-white/[0.04]" />
      <div className="h-10 rounded-lg bg-white/[0.04]" />
    </div>
  );
}

function InboxFallback() {
  return <div className="h-9 rounded-lg bg-white/[0.04]" />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-black text-zinc-50">
        <SidebarProvider>
          <AppSidebar
            company={
              <Suspense fallback={null}>
                <SidebarCompany />
              </Suspense>
            }
            inbox={
              <Suspense fallback={<InboxFallback />}>
                <SidebarInbox />
              </Suspense>
            }
            account={
              <Suspense fallback={<AccountFallback />}>
                <SidebarAccount />
              </Suspense>
            }
          />
          <AppContent>
            <AppHeader />
            <main className="flex-1">{children}</main>
          </AppContent>
        </SidebarProvider>
      </body>
    </html>
  );
}
