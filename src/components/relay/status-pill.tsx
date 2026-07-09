import { cn } from "@/lib/utils";
import type { BranchHealth, ExceptionStatus } from "@/lib/relay/types";

const healthTone: Record<BranchHealth, { dot: string; text: string; label: string }> = {
  stable: { dot: "bg-emerald-500", text: "text-emerald-700", label: "Stable" },
  high_load: { dot: "bg-amber-500", text: "text-amber-700", label: "High load" },
  critical: { dot: "bg-red-500", text: "text-red-700", label: "Critical" },
};

const statusTone: Record<
  ExceptionStatus,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  open: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Open",
  },
  assigned: {
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    label: "Assigned",
  },
  escalated: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Escalated",
  },
  approved: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Approved",
  },
  denied: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Denied",
  },
  resolved: {
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "Resolved",
  },
};

export function BranchHealthPill({
  health,
  branch,
  className,
}: {
  health: BranchHealth;
  branch: string;
  className?: string;
}) {
  const t = healthTone[health];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      <span className="font-medium text-slate-900">{branch}</span>
      <span className={cn("text-[11px]", t.text)}>{t.label}</span>
    </span>
  );
}

export function StatusPill({ status, className }: { status: ExceptionStatus; className?: string }) {
  const t = statusTone[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        t.bg,
        t.text,
        t.border,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: ExceptionStatus; className?: string }) {
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", statusTone[status].dot, className)}
      aria-label={statusTone[status].label}
    />
  );
}

export function priorityDotClass(status: ExceptionStatus) {
  return statusTone[status].dot;
}
