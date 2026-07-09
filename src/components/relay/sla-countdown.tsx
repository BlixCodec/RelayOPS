import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/relay/use-now";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function format(ms: number) {
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

// Urgency thresholds (single source of truth)
export const SLA_THRESHOLDS = {
  critical: 15, // minutes, red + pulse
  warning: 60, // minutes, amber
};

export type SlaTone = "breached" | "critical" | "warning" | "calm";

export function slaTone(dueAt: string, now = Date.now()): SlaTone {
  const diff = new Date(dueAt).getTime() - now;
  if (diff < 0) return "breached";
  if (diff < SLA_THRESHOLDS.critical * 60_000) return "critical";
  if (diff < SLA_THRESHOLDS.warning * 60_000) return "warning";
  return "calm";
}

const toneClass: Record<SlaTone, { text: string; dot: string; bg?: string; pulse?: boolean }> = {
  breached: { text: "text-red-700", dot: "bg-red-600", bg: "bg-red-50", pulse: true },
  critical: { text: "text-red-600", dot: "bg-red-500", pulse: true },
  warning: { text: "text-amber-600", dot: "bg-amber-500" },
  calm: { text: "text-slate-600", dot: "bg-slate-300" },
};

export function SlaCountdown({
  dueAt,
  className,
  compact,
  showIcon = true,
}: {
  dueAt: string;
  className?: string;
  compact?: boolean;
  showIcon?: boolean;
}) {
  const now = useNow();
  const nowMs = now === 0 ? new Date(dueAt).getTime() : now;
  const diff = new Date(dueAt).getTime() - nowMs;
  const tone = slaTone(dueAt, nowMs);
  const t = toneClass[tone];

  const label =
    tone === "breached"
      ? compact
        ? `-${format(diff)}`
        : `SLA breached · ${format(diff)} ago`
      : compact
        ? format(diff)
        : `${format(diff)} to SLA`;

  return (
    <span
      className={cn(
        "tnum inline-flex items-center gap-1.5 text-xs font-medium",
        t.text,
        tone === "breached" && !compact && "rounded-md px-1.5 py-0.5",
        tone === "breached" && !compact && t.bg,
        className,
      )}
    >
      {showIcon ? <Timer className="h-3 w-3" strokeWidth={2} /> : null}
      {tone !== "calm" ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", t.dot, t.pulse && "animate-pulse")} />
      ) : null}
      {label}
    </span>
  );
}

export function slaBucket(dueAt: string): "overdue" | "under60" | "today" {
  const t = slaTone(dueAt);
  if (t === "breached") return "overdue";
  if (t === "critical" || t === "warning") return "under60";
  return "today";
}

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SlaLegend({ className }: { className?: string }) {
  const item = (dotClass: string, label: string, pulse?: boolean) => (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass, pulse && "animate-pulse")} />
      {label}
    </span>
  );
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100",
            className,
          )}
          aria-label="SLA urgency legend"
        >
          <Timer className="h-3 w-3" />
          SLA urgency
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="flex flex-col gap-1.5 bg-white p-2.5 text-slate-700 shadow-lg ring-1 ring-slate-200"
      >
        {item("bg-slate-300", "Over 60 min")}
        {item("bg-amber-500", "Under 60 min")}
        {item("bg-red-500", "Under 15 min", true)}
        {item("bg-red-600", "Breached", true)}
      </TooltipContent>
    </Tooltip>
  );
}
