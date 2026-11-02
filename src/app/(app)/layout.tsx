import { Suspense } from "react";
import { AppContent } from "@/components/shell/AppContent";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { SidebarAccount } from "@/components/shell/SidebarAccount";
import { SidebarCompany } from "@/components/shell/SidebarCompany";
import { SidebarInbox } from "@/components/shell/SidebarInbox";
import { SidebarProvider } from "@/components/shell/sidebar-context";

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
