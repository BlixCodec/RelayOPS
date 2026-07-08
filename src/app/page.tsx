"use client";

// Single route. Which of the four screens renders is driven by store state,
// never by navigation (see CLAUDE.md: no extra pages or nav items).

import { AppShell } from "@/components/app-shell";
import { DispatcherWorkbench } from "@/components/dispatcher-workbench";
import { RoleSelect } from "@/components/role-select";
import { useRelay } from "@/lib/store";

export default function Home() {
  const { role } = useRelay();

  return (
    <AppShell>
      {role === null && <RoleSelect />}
      {role === "dispatcher" && <DispatcherWorkbench />}
      {role === "manager" && <ManagerPlaceholder />}
    </AppShell>
  );
}

// TEMPORARY — replaced by the real manager decision queue in build step 4.

function ManagerPlaceholder() {
  const { exceptions } = useRelay();
  const waiting = exceptions.filter(
    (e) => e.status === "awaiting-decision" && !e.escalation?.decision,
  );

  return (
    <main className="p-6">
      <p className="mb-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Temporary placeholder — the manager decision queue lands in build step 4.
      </p>
      <h1 className="text-lg font-semibold">Decision queue</h1>
      <p className="mt-1 text-slate-500">
        {waiting.length} escalation{waiting.length === 1 ? "" : "s"} waiting on
        you.
      </p>
      <ul className="mt-4 max-w-md space-y-2">
        {waiting.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="font-semibold">
              {e.id} · {e.customer}
            </p>
            <p className="mt-1 text-slate-500">{e.escalation?.reason}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
