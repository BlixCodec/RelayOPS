import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Circle,
  ClipboardList,
  FileCheck2,
  Gauge,
  LifeBuoy,
  ListChecks,
  Star,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarInitials } from "./avatar-initials";
import { useRelayStore } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { priorityDotClass } from "./status-pill";
import { RoleSwitchDialog } from "./role-switch-dialog";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/relay/types";

const dispatcherNav = [
  { title: "Today", to: "/dispatcher/today", icon: Sun },
  { title: "Workbench", to: "/dispatcher", icon: Gauge },
  { title: "My Assignments", to: "/dispatcher/assignments", icon: ClipboardList },
  { title: "Resolved", to: "/dispatcher/resolved", icon: FileCheck2 },
] as const;

const managerNav = [
  { title: "Today", to: "/manager/today", icon: Sun },
  { title: "Decision Queue", to: "/manager", icon: ListChecks },
  { title: "All Escalations", to: "/manager/escalations", icon: ClipboardList },
  { title: "Decisions", to: "/manager/decisions", icon: FileCheck2 },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const {
    role,
    currentUser,
    exceptions,
    openDrawer,
    toggleFavorite,
    activeBranchId,
    setBranch,
    setFavoriteFilter,
  } = useRelayStore();
  const [switchOpen, setSwitchOpen] = useState(false);

  const user = role === "dispatcher" ? currentUser.dispatcher : currentUser.manager;

  const isActive = (to: string) => {
    if (to === "/dispatcher" || to === "/manager") return currentPath === to;
    return currentPath === to || currentPath.startsWith(to + "/");
  };

  const nav = role === "dispatcher" ? dispatcherNav : managerNav;
  const navLabel = role === "dispatcher" ? "Dispatcher" : "Regional Operations";

  const favorites = exceptions.filter((e) =>
    (e.favoritedBy ?? []).includes(role as Role),
  );

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 transition-[width] duration-300 ease-out"
      >
        <SidebarHeader className="gap-2 border-b border-slate-200 px-3 py-3 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
              R
            </span>
            <span className="truncate text-[14px] font-semibold tracking-tight text-slate-900 group-data-[collapsible=icon]:hidden">
              RelayOps
            </span>
            <SidebarTrigger
              className="ml-auto h-6 w-6 shrink-0 text-slate-500 hover:text-slate-900 group-data-[collapsible=icon]:ml-0"
              aria-label="Toggle sidebar"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select value={activeBranchId} onValueChange={setBranch}>
              <SelectTrigger className="h-8 w-full border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-700">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-[12px]">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {navLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <NavRow key={item.title} item={item} active={isActive(item.to)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <Star className="h-3 w-3" /> Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {favorites.length === 0 ? (
                <div className="px-2 py-1.5 text-[11px] text-slate-400">
                  Star an exception to pin it here.
                </div>
              ) : (
                <SidebarMenu>
                  {favorites.map((ex) => (
                    <SidebarMenuItem key={ex.id}>
                      <div className="group/fav flex items-center gap-1">
                        <SidebarMenuButton
                          onClick={() => {
                            setFavoriteFilter(ex.branchId);
                            navigate({
                              to: role === "dispatcher" ? "/dispatcher" : "/manager",
                            });
                          }}
                          onDoubleClick={() => openDrawer(ex.id)}
                          title="Click to filter · double-click to open"
                          className="h-8 flex-1 gap-2 px-2 text-[13px] text-slate-700 hover:bg-slate-100"
                        >
                          <Circle
                            className={cn(
                              "h-2 w-2 shrink-0 fill-current",
                              priorityDotClass(ex.status).replace("bg-", "text-"),
                            )}
                            strokeWidth={0}
                          />
                          <span className="truncate">{ex.customer}</span>
                        </SidebarMenuButton>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(ex.id);
                            toast(`${ex.customer} removed from favorites.`);
                          }}
                          aria-label="Remove favorite"
                          className="mr-1 rounded p-1 text-amber-500 opacity-0 transition-opacity hover:bg-slate-100 group-hover/fav:opacity-100"
                        >
                          <Star className="h-3 w-3 fill-current" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-1 border-t border-slate-200 px-2 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() =>
                  toast("Help center is stubbed for this prototype.", {
                    description: "In production this would open docs and the support inbox.",
                  })
                }
                className="h-8 gap-2 px-2 text-[13px] text-slate-700 hover:bg-slate-100"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                <span>Need Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <button
            type="button"
            onClick={() => setSwitchOpen(true)}
            className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left transition-colors hover:bg-slate-50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:hover:bg-transparent"
            aria-label="Switch role"
          >
            <AvatarInitials name={user} size={28} />
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-[13px] font-medium text-slate-900">
                {user}
              </div>
              <div className="truncate text-[11px] text-slate-500 capitalize">
                {role}
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400 group-data-[collapsible=icon]:hidden" />
          </button>
        </SidebarFooter>
      </Sidebar>
      <RoleSwitchDialog open={switchOpen} onOpenChange={setSwitchOpen} />
    </>
  );
}

function NavRow({
  item,
  active,
}: {
  item: { title: string; to: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          "relative h-8 gap-2 px-2 text-[13px]",
          active
            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
            : "text-slate-700 hover:bg-slate-100",
        )}
      >
        <Link to={item.to}>
          {active ? (
            <span className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-indigo-600" />
          ) : null}
          <Icon className={cn("h-3.5 w-3.5", active ? "text-indigo-600" : "text-slate-500")} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
