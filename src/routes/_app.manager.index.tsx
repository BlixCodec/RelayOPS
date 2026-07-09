import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, X } from "lucide-react";
import { PageHeader } from "@/components/relay/page-header";
import { BranchHealthStrip } from "@/components/relay/branch-health-strip";
import { DecisionRow } from "@/components/relay/decision-row";
import { EmptyState } from "@/components/relay/empty-state";
import { useRelayStore, branchById } from "@/lib/relay/store";

export const Route = createFileRoute("/_app/manager/")({
  component: DecisionQueue,
});

function DecisionQueue() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const favoriteFilter = useRelayStore((s) => s.favoriteFilter);
  const setFavoriteFilter = useRelayStore((s) => s.setFavoriteFilter);
  const filteredBranch = branchById(favoriteFilter ?? "");

  const scoped = useMemo(
    () => (favoriteFilter ? exceptions.filter((e) => e.branchId === favoriteFilter) : exceptions),
    [exceptions, favoriteFilter],
  );

  const pending = useMemo(() => scoped.filter((e) => e.status === "escalated"), [scoped]);

  const headline =
    pending.length === 0
      ? "No decisions are blocking dispatch operations."
      : `${pending.length} decision${pending.length === 1 ? "" : "s"} ${
          pending.length === 1 ? "is" : "are"
        } currently blocking dispatch operations.`;

  return (
    <>
      <PageHeader
        title={headline}
        guidance="Review pending escalations to unblock branch operations."
      />

      {favoriteFilter && filteredBranch ? (
        <div className="border-b border-slate-100 bg-indigo-50/40 px-4 py-2 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Filtered by {filteredBranch.name}
            <button
              type="button"
              onClick={() => setFavoriteFilter(null)}
              aria-label="Clear filter"
              className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-5 p-6">
        <BranchHealthStrip />

        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            message="No escalations are waiting. Regional Operations is caught up."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((e) => (
              <DecisionRow key={e.id} exception={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
