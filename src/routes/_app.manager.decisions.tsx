import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/relay/page-header";
import { StatusPill } from "@/components/relay/status-pill";
import { useRelayStore, branchById } from "@/lib/relay/store";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/manager/decisions")({
  component: Decisions,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function decisionLabel(e: Exception) {
  const reason = e.escalation?.reason ?? "";
  if (/transfer|cross-branch/i.test(reason)) return "Cross-branch transfer";
  if (/overtime/i.test(reason)) return "Overtime authorization";
  if (/credit|goodwill/i.test(reason)) return "Goodwill credit";
  return "Operational decision";
}

function Decisions() {
  const { exceptions, decisionHistory } = useRelayStore();

  const rows = useMemo(() => {
    const live = exceptions.filter((e) => e.decision);
    return [...live, ...decisionHistory].sort(
      (a, b) => new Date(b.decision!.at).getTime() - new Date(a.decision!.at).getTime(),
    );
  }, [exceptions, decisionHistory]);

  return (
    <>
      <PageHeader
        title="Decisions"
        guidance="Every approval and denial, decision-maker on record."
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Decision</Th>
                <Th>Customer</Th>
                <Th>Branch</Th>
                <Th>Decided by</Th>
                <Th>Date &amp; time</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="font-medium text-slate-900">{decisionLabel(e)}</div>
                      <div className="text-[11px] text-slate-400">{e.id}</div>
                    </Td>
                    <Td className="text-slate-800">{e.customer}</Td>
                    <Td className="text-slate-700">{branch?.name}</Td>
                    <Td className="text-slate-700">{e.decision?.by}</Td>
                    <Td className="tnum text-slate-600">{formatDate(e.decision!.at)}</Td>
                    <Td>
                      <StatusPill
                        status={e.decision?.outcome === "approved" ? "approved" : "denied"}
                      />
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No decisions have been recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 align-middle ${className ?? ""}`}>{children}</td>;
}
