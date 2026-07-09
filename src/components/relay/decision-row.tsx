import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { SlaCountdown } from "./sla-countdown";
import { AvatarWithTooltip } from "./avatar-initials";
import { CompanyLogo } from "./location-badge";
import { DenyDialog } from "./deny-dialog";
import { useRelayStore, branchById } from "@/lib/relay/store";
import type { Exception } from "@/lib/relay/types";

export function DecisionRow({ exception }: { exception: Exception }) {
  const { approve, openDrawer } = useRelayStore();
  const branch = branchById(exception.branchId);
  const escalatedBy = exception.escalation?.by;

  return (
    <article className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-card md:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={exception.priority} />
          <span className="tnum text-[11px] text-slate-400">{exception.id}</span>
          {escalatedBy ? (
            <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <AvatarWithTooltip name={escalatedBy} size={16} />
              {escalatedBy}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => openDrawer(exception.id)}
            className="ml-auto text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            Review details →
          </button>
        </div>

        <h3 className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CompanyLogo name={exception.customer} size={20} />
          <span className="truncate">{exception.customer}</span>
        </h3>

        {exception.escalation ? (
          <p className="mt-1 text-xs italic text-slate-700">
            "{exception.escalation.reason}"
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <SlaCountdown dueAt={exception.slaDueAt} />
          <span className="inline-flex items-center gap-1.5">
            <CompanyLogo name={branch?.name ?? "Branch"} size={14} />
            {branch?.name}
          </span>
          <span className="tnum">
            ${exception.revenueAtRisk.toLocaleString()} at risk
          </span>
          <span className="ml-auto text-violet-700">
            {exception.recommendation.quality}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-end gap-2 md:flex-col md:items-stretch md:justify-between">
        <Button
          className="min-w-[110px]"
          onClick={() => {
            approve(exception.id);
            toast("Decision approved. Dispatch has been notified.");
          }}
        >
          Approve
        </Button>
        <DenyDialog
          exceptionId={exception.id}
          customer={exception.customer}
          trigger={
            <Button
              variant="ghost"
              className="min-w-[110px] text-slate-600 hover:text-slate-900"
            >
              Deny
            </Button>
          }
        />
      </div>
    </article>
  );
}
