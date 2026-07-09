import { ArrowUpRight, Bookmark, CheckCircle2, MoreHorizontal, XCircle } from "lucide-react";
import { AvatarInitials } from "../avatar-initials";
import { roleFor } from "@/lib/relay/people";
import { useNow } from "@/lib/relay/use-now";
import type { AuditEvent } from "@/lib/relay/types";
import { cn } from "@/lib/utils";

function relative(iso: string, now: number) {
  const nowMs = now === 0 ? new Date(iso).getTime() : now;
  const diff = nowMs - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type HighlightKind = "resolved" | "approved" | "denied" | "escalated";

function highlightKind(e: AuditEvent): HighlightKind | null {
  const a = e.action.toLowerCase();
  if (a.includes("resolved")) return "resolved";
  if (a.includes("approved")) return "approved";
  if (a.includes("denied")) return "denied";
  if (a.includes("escalated")) return "escalated";
  return null;
}

const highlightMap: Record<
  HighlightKind,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    border: string;
    text: string;
    label: string;
  }
> = {
  resolved: {
    icon: CheckCircle2,
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
    label: "Marked resolved",
  },
  approved: {
    icon: CheckCircle2,
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
    label: "Escalation approved",
  },
  denied: {
    icon: XCircle,
    bg: "bg-red-50/70",
    border: "border-red-200/70",
    text: "text-red-800",
    label: "Escalation denied",
  },
  escalated: {
    icon: ArrowUpRight,
    bg: "bg-amber-50/70",
    border: "border-amber-200/70",
    text: "text-amber-800",
    label: "Escalated to Regional Ops",
  },
};

// Group consecutive events by actor.
function groupByActor(events: AuditEvent[]): AuditEvent[][] {
  const groups: AuditEvent[][] = [];
  for (const e of events) {
    const last = groups[groups.length - 1];
    if (last && last[0].actor === e.actor) last.push(e);
    else groups.push([e]);
  }
  return groups;
}

function EventCard({ e, now }: { e: AuditEvent; now: number }) {
  const hi = highlightKind(e);

  if (hi) {
    const cfg = highlightMap[hi];
    const Icon = cfg.icon;
    return (
      <div className={cn("rounded-xl border px-4 py-3 shadow-card", cfg.bg, cfg.border)}>
        <div className="flex items-center justify-between">
          <span className="tnum text-[11px] font-medium text-slate-500">{relative(e.at, now)}</span>
          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              aria-label="Bookmark"
              className="rounded p-0.5 hover:bg-white/60 hover:text-slate-600"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="More"
              className="rounded p-0.5 hover:bg-white/60 hover:text-slate-600"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className={cn("mt-1.5 flex items-center gap-2 text-[13px] font-medium", cfg.text)}>
          <Icon className="h-4 w-4 shrink-0" />
          <span>
            {cfg.label}: {e.action}
          </span>
        </div>
        {e.note ? (
          <p className={cn("mt-1.5 text-[12px] italic", cfg.text, "opacity-90")}>"{e.note}"</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between">
        <span className="tnum text-[11px] font-medium text-slate-400">{relative(e.at, now)}</span>
        <div className="flex items-center gap-1 text-slate-300">
          <button
            type="button"
            aria-label="Bookmark"
            className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-500"
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="More"
            className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-500"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">{e.action}</p>
      {e.note ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{e.note}</p>
      ) : null}
    </div>
  );
}

export function ActivityTracker({ events }: { events: AuditEvent[] }) {
  const now = useNow();
  const groups = groupByActor(events);

  return (
    <ol className="space-y-6">
      {groups.map((group, gi) => {
        const head = group[0];
        const role = roleFor(head.actor);
        return (
          <li key={gi} className="relative">
            {/* Person cluster header */}
            <div className="flex items-center gap-2.5">
              <AvatarInitials name={head.actor} size={32} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold leading-tight text-slate-900">
                  {head.actor}
                </div>
                {role ? (
                  <div className="text-[11px] leading-tight text-slate-400">{role}</div>
                ) : null}
              </div>
            </div>

            {/* Dashed vertical rail + cards */}
            <div className="relative mt-3 pl-11">
              <span
                aria-hidden
                className="absolute left-[15px] top-0 bottom-0 border-l border-dashed border-slate-200"
              />
              <div className="space-y-3">
                {group.map((e) => (
                  <EventCard key={e.id} e={e} now={now} />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
