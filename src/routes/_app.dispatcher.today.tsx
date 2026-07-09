import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { SlaCountdown, slaTone } from "@/components/relay/sla-countdown";
import { StatusDot } from "@/components/relay/status-pill";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { AvatarInitials } from "@/components/relay/avatar-initials";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/dispatcher/today")({
  component: DispatcherToday,
});

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [g, setG] = useState("Hello");
  useEffect(() => {
    setG(computeGreeting());
  }, []);
  return g;
}


function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function DispatcherToday() {
  const {
    exceptions,
    currentUser,
    activeBranchId,
    openDrawer,
  } = useRelayStore();
  const firstName = currentUser.dispatcher.split(" ")[0];
  const branch = branchById(activeBranchId);
  const greeting = useGreeting();

  const active = exceptions.filter((e) => e.status !== "resolved");
  const branchActive = active.filter((e) => e.branchId === activeBranchId);
  const critical = branchActive.filter((e) => e.priority === "critical");
  const escalated = active.filter((e) => e.status === "escalated");
  const mine = active.filter((e) => e.ownerDispatcher === currentUser.dispatcher);

  const primary = useMemo(() => {
    const rank = { critical: 0, high: 1, medium: 2 } as const;
    return [...branchActive].sort(
      (a, b) =>
        rank[a.priority] - rank[b.priority] ||
        new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
    )[0];
  }, [branchActive]);

  const recentActivity = useMemo(() => {
    const all = branchActive.flatMap((e) =>
      e.audit.map((a) => ({ ...a, customer: e.customer, exceptionId: e.id })),
    );
    return all
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
  }, [branchActive]);

  const sub =
    critical.length > 0
      ? `${branch?.name ?? "Your branch"} needs attention in ${critical.length} place${critical.length === 1 ? "" : "s"}.`
      : `${branch?.name ?? "Your branch"} is holding steady. Review anything close to SLA first.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <section>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-slate-900" suppressHydrationWarning>
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">{sub}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
          <span className="font-medium text-slate-700">{branch?.name ?? "Branch"}</span>
          <span className="text-slate-300">·</span>
          <span>Today</span>
          <span className="text-slate-300">·</span>
          <span>{branchActive.length} active exceptions</span>
          <span className="text-slate-300">·</span>
          <span className="text-red-600">{critical.length} critical</span>
          <span className="text-slate-300">·</span>
          <span>{escalated.filter((e) => e.branchId === activeBranchId).length} awaiting decision</span>
        </div>
      </section>

      {primary ? <PrimaryCard ex={primary} onOpen={() => openDrawer(primary.id)} /> : null}

      <Section title="Waiting on manager" count={escalated.length}>
        {escalated.length === 0 ? (
          <EmptyRow message="No escalations awaiting a decision." />
        ) : (
          <div className="divide-y divide-slate-100">
            {escalated.map((e) => (
              <MiniRow key={e.id} ex={e} onOpen={() => openDrawer(e.id)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Your active assignments" count={mine.length}>
        {mine.length === 0 ? (
          <EmptyRow message="No assignments currently under your name." />
        ) : (
          <div className="divide-y divide-slate-100">
            {mine.slice(0, 4).map((e) => (
              <MiniRow key={e.id} ex={e} onOpen={() => openDrawer(e.id)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Recent activity" count={recentActivity.length}>
        {recentActivity.length === 0 ? (
          <EmptyRow message="No branch activity in the last few hours." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-slate-800">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-slate-500">{a.action.toLowerCase()}</span>{" "}
                    <button
                      type="button"
                      onClick={() => openDrawer(a.exceptionId)}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {a.customer}
                    </button>
                  </div>
                  {a.note ? (
                    <div className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">{a.note}</div>
                  ) : null}
                </div>
                <span className="tnum shrink-0 text-[11px] text-slate-400">{relative(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function PrimaryCard({ ex, onOpen }: { ex: Exception; onOpen: () => void }) {
  const branch = branchById(ex.branchId);
  const tone = slaTone(ex.slaDueAt);
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-card sm:p-6",
        tone === "breached" || tone === "critical"
          ? "border-red-200"
          : "border-slate-200",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
          Start here
        </span>
        <PriorityBadge priority={ex.priority} />
        <span className="tnum text-[11px] text-slate-400">{ex.id}</span>
      </div>
      <h2 className="mt-2 text-[17px] font-semibold text-slate-900">{ex.customer}</h2>
      <p className="mt-1 text-[13px] text-slate-600">{ex.issue}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-600">
        <SlaCountdown dueAt={ex.slaDueAt} />
        <span>{branch?.name ?? "·"}</span>
        <span className="tnum">${ex.revenueAtRisk.toLocaleString()} at risk</span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[12.5px] text-violet-900">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        <span>
          <span className="font-medium">Recommendation · </span>
          {ex.recommendation.action}
        </span>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[12.5px] font-medium text-white hover:bg-slate-800"
        >
          Open exception
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        <span className="tnum text-[11px] text-slate-400">{count}</span>
      </header>
      {children}
    </section>
  );
}

function MiniRow({ ex, onOpen }: { ex: Exception; onOpen: () => void }) {
  const tech = techById(ex.assignedTech);
  const branch = branchById(ex.branchId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
    >
      <StatusDot status={ex.status} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-slate-900">{ex.customer}</span>
          <span className="tnum hidden text-[11px] text-slate-400 sm:inline">{ex.id}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-slate-500">
          <SlaCountdown dueAt={ex.slaDueAt} compact />
          <span className="hidden sm:inline">{branch?.name}</span>
          <span className="truncate">{ex.issueType}</span>
        </div>
      </div>
      {tech ? (
        <span className="hidden shrink-0 items-center gap-1.5 text-[11.5px] text-slate-600 sm:inline-flex">
          <AvatarInitials name={tech.name} size={18} />
          <span className="truncate">{tech.name.split(" ")[0]}</span>
        </span>
      ) : null}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
    </button>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-4 py-4 text-[12.5px] text-slate-500">{message}</div>;
}

export { branches };
