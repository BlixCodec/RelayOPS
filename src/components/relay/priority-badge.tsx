import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/relay/types";

const styles: Record<Priority, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-slate-100 text-slate-700 border-slate-200",
};

const label: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none tracking-wide",
        styles[priority],
        className,
      )}
    >
      {label[priority]}
    </span>
  );
}
