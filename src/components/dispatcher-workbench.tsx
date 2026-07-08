"use client";

// Screen 2 of 4: the dispatcher workbench. Queue sorted by SLA urgency —
// the screen answers "what needs action now" (docs/decision-doc.md).

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ExceptionCard } from "@/components/exception-card";
import { ExceptionDrawer } from "@/components/exception-drawer";
import { useRelay } from "@/lib/store";

export function DispatcherWorkbench() {
  const { exceptions } = useRelay();
  const [openId, setOpenId] = useState<string | null>(null);

  const active = exceptions
    .filter((e) => e.status !== "resolved")
    .sort((a, b) => a.slaMinutesRemaining - b.slaMinutesRemaining);
  const resolved = exceptions.filter((e) => e.status === "resolved");
  const selected = exceptions.find((e) => e.id === openId) ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Today&apos;s exceptions
        </h1>
        <p className="text-xs text-slate-500">
          Sorted by SLA urgency — most at-risk first.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
          <p className="mt-2 text-sm text-slate-900">
            Nothing needs action right now.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            New exceptions land here the moment they&apos;re created.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {active.map((e) => (
            <li key={e.id}>
              <ExceptionCard exception={e} onOpen={setOpenId} />
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-slate-500">
            Resolved today
          </h2>
          <ul className="mt-3 space-y-3">
            {resolved.map((e) => (
              <li key={e.id} className="opacity-70">
                <ExceptionCard exception={e} onOpen={setOpenId} />
              </li>
            ))}
          </ul>
        </>
      )}

      <ExceptionDrawer exception={selected} onClose={() => setOpenId(null)} />
    </main>
  );
}
