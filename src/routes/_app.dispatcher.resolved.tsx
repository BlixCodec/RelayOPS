import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/relay/page-header";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { StatusPill } from "@/components/relay/status-pill";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { AvatarWithTooltip } from "@/components/relay/avatar-initials";
import { CompanyLogo } from "@/components/relay/location-badge";

export const Route = createFileRoute("/_app/dispatcher/resolved")({
  component: Resolved,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Resolved() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const openDrawer = useRelayStore((s) => s.openDrawer);
  const rows = exceptions.filter((e) => e.status === "resolved");

  return (
    <>
      <PageHeader
        title="Resolved exceptions"
        guidance="Review completed work and operational outcomes."
      />
      <div className="p-3 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Customer</Th>
                <Th>Issue</Th>
                <Th>Branch</Th>
                <Th>Priority</Th>
                <Th>Resolved at</Th>
                <Th>Resolved by</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                const tech = techById(e.assignedTech);
                const lastAudit = e.audit[e.audit.length - 1];
                return (
                  <tr
                    key={e.id}
                    onClick={() => openDrawer(e.id)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={e.customer} size={22} />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">{e.customer}</div>
                          <div className="text-[11px] text-slate-400">{e.id}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="max-w-[280px] truncate text-slate-600">
                      {e.issueType}
                    </Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <CompanyLogo name={branch?.name ?? "Branch"} size={18} />
                        {branch?.name}
                      </span>
                    </Td>
                    <Td><PriorityBadge priority={e.priority} /></Td>
                    <Td className="tnum text-slate-600">
                      <ClientDate iso={lastAudit?.at ?? e.createdAt} />
                    </Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <AvatarWithTooltip name={tech?.name ?? e.ownerDispatcher} size={20} />
                        <span>{tech?.name ?? e.ownerDispatcher}</span>
                      </span>
                    </Td>
                    <Td><StatusPill status="resolved" /></Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No resolved exceptions yet.
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

function ClientDate({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => setText(formatDate(iso)), [iso]);
  return <span suppressHydrationWarning>{text || "\u00A0"}</span>;
}
