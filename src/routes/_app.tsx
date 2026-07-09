import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/relay/app-sidebar";
import { TopBar } from "@/components/relay/top-bar";
import { ExceptionDrawer } from "@/components/relay/exception-drawer";
import { CommandSearch } from "@/components/relay/command-search";
import { AvatarCluster } from "@/components/relay/avatar-initials";
import { SlaLegend } from "@/components/relay/sla-countdown";
import { MobileBottomNav } from "@/components/relay/mobile-bottom-nav";
import { useRelayStore } from "@/lib/relay/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { role, currentUser } = useRelayStore();
  const user = role === "dispatcher" ? currentUser.dispatcher : currentUser.manager;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-col bg-background">
          <div className="min-h-0 flex-1 p-0 sm:p-3">
            <div className="flex h-full min-h-0 flex-col overflow-hidden border-0 bg-white sm:rounded-2xl sm:border sm:border-slate-200/70 sm:shadow-panel">
              {/* Sticky header cluster: breadcrumbs + search + avatars stay pinned */}
              <div className="sticky top-0 z-30 shrink-0 bg-white">
                <TopBar />
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-2 sm:px-5">
                  <AvatarCluster
                    names={[user, "Jordan Fields", "Priya Anand"]}
                    size={22}
                    activeNames={[user]}
                  />
                  <SlaLegend />
                </div>
              </div>
              <main className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarInset>
      </div>
      <ExceptionDrawer />
      <CommandSearch />
      <MobileBottomNav />
    </SidebarProvider>
  );
}
