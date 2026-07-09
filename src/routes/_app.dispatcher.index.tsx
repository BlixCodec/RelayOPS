import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Inbox, X } from "lucide-react";
import { PageHeader } from "@/components/relay/page-header";
import { ExceptionCard } from "@/components/relay/exception-card";
import { EmptyState } from "@/components/relay/empty-state";
import { useRelayStore, branchById } from "@/lib/relay/store";
import { slaBucket } from "@/components/relay/sla-countdown";

export const Route = createFileRoute("/_app/dispatcher/")({
  component: DispatcherWorkbench,
});

function DispatcherWorkbench() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const favoriteFilter = useRelayStore((s) => s.favoriteFilter);
  const setFavoriteFilter = useRelayStore((s) => s.setFavoriteFilter);
  const filteredBranch = branchById(favoriteFilter ?? "");

  const scoped = useMemo(
    () =>
      favoriteFilter
        ? exceptions.filter((e) => e.branchId === favoriteFilter)
        : exceptions,
    [exceptions, favoriteFilter],
  );

  const active = useMemo(
    () => scoped.filter((e) => e.status !== "resolved"),
    [scoped],
  );

  const criticalOpen = useMemo(
    () =>
      active.filter(
        (e) =>
          e.priority === "critical" &&
          e.status !== "approved" &&
          e.status !== "denied",
      ).length,
    [active],
  );

  const groups = useMemo(() => {
    const overdue = active.filter((e) => slaBucket(e.slaDueAt) === "overdue");
    const under60 = active.filter((e) => slaBucket(e.slaDueAt) === "under60");
    const today = active.filter((e) => slaBucket(e.slaDueAt) === "today");
    const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    const sort = (arr: typeof active) =>
      [...arr].sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
      );
    return [
      { key: "overdue", label: "Overdue", items: sort(overdue) },
      { key: "under60", label: "Under 60 min", items: sort(under60) },
      { key: "today", label: "Today", items: sort(today) },
    ];
  }, [active]);

  const headline =
    criticalOpen === 0
      ? "No critical exceptions open right now."
      : `${criticalOpen} critical exception${criticalOpen === 1 ? "" : "s"} require attention today.`;

  return (
    <>
      <PageHeader
        title={headline}
        guidance="Review the highest-priority exception first to reduce SLA risk."
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

      <div className="space-y-5 p-4 sm:p-6">
        {groups.every((g) => g.items.length === 0) ? (
          <EmptyState
            icon={Inbox}
            message="No active exceptions. Your queue is caught up."
          />
        ) : (
          groups.map((g) => {
            if (g.items.length === 0) return null;
            return (
              <section key={g.key}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {g.label}
                  </h2>
                  <span className="tnum text-[11px] text-slate-400">
                    {g.items.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {g.items.map((e) => (
                    <ExceptionCard key={e.id} exception={e} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
