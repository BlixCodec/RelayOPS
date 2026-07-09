import { Bell, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRelayStore } from "@/lib/relay/store";
import { cn } from "@/lib/utils";
import { NotificationPopoverContent } from "./notification-panel";

interface Crumb {
  label: string;
  to?: string;
}

const routeMap: Record<string, Crumb[]> = {
  "/dispatcher/today": [{ label: "Dispatcher" }, { label: "Today" }],
  "/dispatcher": [{ label: "Dispatcher" }, { label: "Workbench" }],
  "/dispatcher/assignments": [{ label: "Dispatcher" }, { label: "Assignments" }],
  "/dispatcher/resolved": [{ label: "Dispatcher" }, { label: "Resolved" }],
  "/manager/today": [{ label: "Regional Ops" }, { label: "Today" }],
  "/manager": [{ label: "Regional Ops" }, { label: "Decision Queue" }],
  "/manager/escalations": [{ label: "Regional Ops" }, { label: "Escalations" }],
  "/manager/decisions": [{ label: "Regional Ops" }, { label: "Decisions" }],
};

export function TopBar() {
  const router = useRouter();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const crumbs = routeMap[path] ?? [{ label: "RelayOps" }];
  const { toggleCommand, notifications } = useRelayStore();
  const unread = notifications.filter((n) => !n.read);
  const urgentUnread = unread.some((n) => n.kind === "escalation" || n.kind === "sla");
  const dotClass = urgentUnread ? "bg-violet-600" : "bg-emerald-500";

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-100 bg-white/95 backdrop-blur">
      {/* Row 1 — breadcrumbs */}
      <div className="flex h-8 items-center gap-1 border-b border-slate-50 px-3 md:px-5">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => router.history.forward()}
          aria-label="Forward"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        <nav className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link to="/" className="shrink-0 text-slate-500 hover:text-slate-900">
            Meridian Field Services
          </Link>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="flex shrink-0 items-center gap-1.5">
                <span className="text-slate-300">/</span>
                <span className={cn(isLast ? "font-medium text-slate-800" : "text-slate-500")}>
                  {c.label}
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Row 2 — controls */}
      <div className="flex h-12 items-center gap-2 px-3 md:px-5">
        <SidebarTrigger
          aria-label="Toggle sidebar"
          className="h-8 w-8 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
        />
        <div className="flex min-w-0 flex-1 items-center sm:mx-auto sm:max-w-xl">
          <button
            type="button"
            onClick={() => toggleCommand(true)}
            className="flex h-8 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[12px] text-slate-500 hover:bg-slate-50"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Search</span>
              <span className="hidden sm:inline">Search exceptions, technicians, branches</span>
            </span>
            <kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-mono text-slate-500 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label={urgentUnread ? "Notifications — urgent items" : "Notifications"}
            >
              <Bell className="h-4 w-4" />
              {unread.length > 0 ? (
                <span
                  className={cn(
                    "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-white",
                    dotClass,
                    urgentUnread && "animate-pulse",
                  )}
                />
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-auto rounded-xl border-slate-200 p-0 shadow-xl"
          >
            <NotificationPopoverContent />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
