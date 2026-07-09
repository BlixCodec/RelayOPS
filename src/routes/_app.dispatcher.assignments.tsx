import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/relay/page-header";
import { StatusPill } from "@/components/relay/status-pill";
import { SlaCountdown } from "@/components/relay/sla-countdown";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { AvatarWithTooltip } from "@/components/relay/avatar-initials";
import { CompanyLogo } from "@/components/relay/location-badge";

export const Route = createFileRoute("/_app/dispatcher/assignments")({
  component: MyAssignments,
});

function nextAction(status: string): string {
  switch (status) {
    case "open":
      return "Assign a technician";
    case "assigned":
      return "Monitor SLA";
    case "escalated":
      return "Wait for decision";
    case "approved":
      return "Dispatch and confirm";
    case "denied":
      return "Follow denial instruction";
    default:
      return "·";
  }
}

function MyAssignments() {
  const { exceptions, currentUser, openDrawer } = useRelayStore();
  const [tab, setTab] = useState<"mine" | "team">("mine");

  const mine = useMemo(
    () =>
      exceptions.filter(
        (e) => e.ownerDispatcher === currentUser.dispatcher && e.status !== "resolved",
      ),
    [exceptions, currentUser],
  );
  const team = useMemo(() => exceptions.filter((e) => e.status !== "resolved"), [exceptions]);

  const rows = tab === "mine" ? mine : team;

  return (
    <>
      <PageHeader
        title="Assignments"
        guidance="Track work already assigned to your team."
        actions={
          <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "team")}>
            <TabsList className="h-8">
              <TabsTrigger value="mine" className="text-xs">
                My assignments
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs">
                Team assignments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="p-3 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Customer</Th>
                <Th>Issue</Th>
                <Th>SLA</Th>
                <Th>Technician</Th>
                <Th>Status</Th>
                <Th>Next action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                const tech = techById(e.assignedTech);
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
                          <div className="text-[11px] text-slate-400">
                            {branch?.name} · {e.id}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="max-w-[280px] truncate text-slate-600">{e.issueType}</Td>
                    <Td>
                      <SlaCountdown dueAt={e.slaDueAt} />
                    </Td>
                    <Td className="text-slate-700">
                      {tech ? (
                        <span className="inline-flex items-center gap-2">
                          <AvatarWithTooltip name={tech.name} size={20} />
                          <span>{tech.name}</span>
                        </span>
                      ) : (
                        "·"
                      )}
                    </Td>
                    <Td>
                      <StatusPill status={e.status} />
                    </Td>
                    <Td className="text-slate-600">{nextAction(e.status)}</Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Nothing assigned in this view.
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
