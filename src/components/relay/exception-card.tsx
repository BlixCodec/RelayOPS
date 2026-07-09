import { useRelayStore, branchById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { PriorityBadge } from "./priority-badge";
import { StatusDot } from "./status-pill";
import { SlaCountdown } from "./sla-countdown";
import { AvatarInitials, AvatarWithTooltip } from "./avatar-initials";
import { LocationBadge } from "./location-badge";
import { techById } from "@/lib/relay/store";
import { ChevronDown, Star } from "lucide-react";
import { toast } from "sonner";
import { RecommendationTree } from "./recommendation-tree";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export function ExceptionCard({ exception }: { exception: Exception }) {
  const openDrawer = useRelayStore((s) => s.openDrawer);
  const toggleFavorite = useRelayStore((s) => s.toggleFavorite);
  const role = useRelayStore((s) => s.role);
  const collapsed = useRelayStore((s) => !!s.collapsedCards[exception.id]);
  const toggleCollapsed = useRelayStore((s) => s.toggleCardCollapsed);

  const branch = branchById(exception.branchId);
  const tech = techById(exception.assignedTech);
  const isFav = (exception.favoritedBy ?? []).includes(role);

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col rounded-xl border border-slate-200/60 bg-white px-3.5 py-3 shadow-card transition-shadow sm:px-4 sm:py-3.5",
        "hover:shadow-panel",
      )}
    >
      <button
        type="button"
        onClick={() => openDrawer(exception.id)}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
        aria-label={`Open ${exception.customer}`}
      />

      <div className="relative flex min-w-0 items-center gap-2">
        <LocationBadge name={exception.customer} size={22} />
        <PriorityBadge priority={exception.priority} />
        <span className="tnum hidden text-[11px] text-slate-400 sm:inline">{exception.id}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(exception.id);
              toast(
                isFav
                  ? `${exception.customer} removed from favorites.`
                  : `${exception.customer} added to favorites.`,
              );
            }}
            className={cn(
              "relative rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-amber-500",
              isFav && "text-amber-500",
            )}
            aria-label={isFav ? "Unfavorite" : "Favorite"}
          >
            <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed(exception.id);
            }}
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="relative rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "-rotate-90")}
            />
          </button>
        </span>
      </div>

      <div className="relative mt-1.5 flex min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-slate-900 sm:text-sm">
          {exception.customer}
        </div>
        {tech ? (
          <span className="relative z-10 shrink-0">
            <AvatarWithTooltip name={tech.name} size={18} />
          </span>
        ) : null}
      </div>

      {!collapsed ? (
        <>
          <div className="relative mt-0.5 line-clamp-1 text-xs text-slate-500">
            {exception.issue}
          </div>

          {exception.status !== "resolved" && exception.recommendation.bullets.length > 0 ? (
            <div className="pointer-events-none relative mt-2.5">
              <RecommendationTree exception={exception} />
            </div>
          ) : null}

          <div className="relative mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <SlaCountdown dueAt={exception.slaDueAt} compact />
            <span className="inline-flex items-center gap-1.5">
              <StatusDot status={exception.status} />
              <span className="capitalize">{exception.status}</span>
            </span>
            <span className="hidden sm:inline">{branch?.name ?? "·"}</span>
            <span className="tnum">${exception.revenueAtRisk.toLocaleString()} at risk</span>
            {tech ? (
              <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
                <AvatarInitials name={tech.name} size={16} />
                <span className="text-slate-600">{tech.name}</span>
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <div className="relative mt-1.5">
          <SlaCountdown dueAt={exception.slaDueAt} compact />
        </div>
      )}
    </div>
  );
}

export { branches };
