import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  message,
  action,
  className,
}: {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-10 text-center",
        className,
      )}
    >
      <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
      <p className="mt-3 text-sm text-slate-600">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
