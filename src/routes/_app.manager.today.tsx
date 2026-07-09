import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRelayStore, branchById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { SlaCountdown, slaTone } from "@/components/relay/sla-countdown";
import { BranchHealthPill, StatusDot } from "@/components/relay/status-pill";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { QuoteBlock } from "@/components/relay/quote-block";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/manager/today")({
  component: ManagerToday,
});

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ManagerToday() {
  const { exceptions, decisionHistory, openDrawer } = useRelayStore();

  const escalated = exceptions.filter((e) => e.status === "escalated");
  const criticalBranch = branches.filter((b) => b.health === "critical").length;
  const decisionsToday = useMemo(() => {
    const cutoff = Date.now() - 24 * 3_600_000;
    return [...exceptions.filter((e) => e.decision && new Date(e.decision.at).getTime() > cutoff)]
      .length;
  }, [exceptions]);

  const primary = useMemo(() => {
    const rank = { critical: 0, high: 1, medium: 2 } as const;
    return [...escalated].sort(
      (a, b) =>
        rank[a.priority] - rank[b.priority] ||
        new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
    )[0];
  }, [escalated]);

  const sub =
    escalated.length === 0
      ? "No decisions are blocking dispatch right now."
      : `${escalated.length} decision${escalated.length === 1 ? " is" : "s are"} currently blocking dispatch.`;

  const recent = useMemo(() => {
    return [...exceptions.filter((e) => e.decision), ...decisionHistory]
      .filter((e) => e.decision)
      .sort((a, b) => new Date(b.decision!.at).getTime() - new Date(a.decision!.at).getTime())
      .slice(0, 6);
  }, [exceptions, decisionHistory]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <section>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
          Regional Operations
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">{sub}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
          <span>{branches.length} branches</span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-700">{escalated.length} pending escalations</span>
          <span className="text-slate-300">·</span>
          <span className={cn(criticalBranch > 0 && "text-red-600")}>
            {criticalBranch} critical branch{criticalBranch === 1 ? "" : "es"}
          </span>
          <span className="text-slate-300">·</span>
          <span>{decisionsToday} decisions today</span>
        </div>
      </section>

      {primary ? <PrimaryDecision ex={primary} onOpen={() => openDrawer(primary.id)} /> : null}

      <section>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Branch status
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            branches.find((b) => b.id === "north")!,
            branches.find((b) => b.id === "west")!,
            branches.find((b) => b.id === "east")!,
          ].map((b) => (
            <BranchHealthPill key={b.id} branch={b.name} health={b.health} />
          ))}
        </div>
      </section>

      {primary ? <AiRecommendationCard ex={primary} /> : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <h3 className="text-[13px] font-semibold text-slate-900">Recent decisions</h3>
          <span className="tnum text-[11px] text-slate-400">{recent.length}</span>
        </header>
        {recent.length === 0 ? (
          <div className="px-4 py-4 text-[12.5px] text-slate-500">
            No decisions logged in the last few days.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => openDrawer(e.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <StatusDot status={e.decision!.outcome} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-slate-900">
                        {e.customer}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                          e.decision!.outcome === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {e.decision!.outcome}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-slate-500">
                      {e.issueType}
                    </div>
                  </div>
                  <span className="tnum shrink-0 text-[11px] text-slate-400">
                    {relative(e.decision!.at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PrimaryDecision({ ex, onOpen }: { ex: Exception; onOpen: () => void }) {
  const branch = branchById(ex.branchId);
  const tone = slaTone(ex.slaDueAt);
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-card sm:p-6",
        tone === "breached" || tone === "critical" ? "border-red-200" : "border-slate-200",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
          Primary decision
        </span>
        <PriorityBadge priority={ex.priority} />
        <span className="tnum text-[11px] text-slate-400">{ex.id}</span>
      </div>
      <h2 className="mt-2 text-[17px] font-semibold text-slate-900">{ex.customer}</h2>
      <p className="mt-1 text-[13px] text-slate-600">{ex.issueType}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-600">
        <SlaCountdown dueAt={ex.slaDueAt} />
        <span>{branch?.name ?? "·"}</span>
        <span className="tnum">${ex.revenueAtRisk.toLocaleString()} at risk</span>
      </div>

      {ex.escalation ? (
        <QuoteBlock label={`Dispatcher note · ${ex.escalation.by}`} className="mt-4">
          {ex.escalation.reason}
        </QuoteBlock>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[12.5px] font-medium text-white hover:bg-slate-800"
        >
          Review decision
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AiRecommendationCard({ ex }: { ex: Exception }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">
          AI recommendation
        </span>
        <span className="ml-auto text-[11px] text-violet-700/80">{ex.recommendation.quality}</span>
      </div>
      <p className="mt-2 text-[14px] font-medium text-slate-900">{ex.recommendation.action}</p>
      {ex.recommendation.bullets.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[12.5px] text-slate-700">
          {ex.recommendation.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
