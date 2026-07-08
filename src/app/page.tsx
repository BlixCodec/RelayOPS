import { branches, exceptions, getTechnicianById, technicians } from "@/lib/data";

// TEMPORARY scaffold sanity check — confirms the /data JSON is wired and typed.
// This is NOT one of the four screens; it gets replaced by the role-select
// screen in the next build step (see CLAUDE.md build order).
export default function Home() {
  const hero = exceptions.find((e) => e.id === "EX-1042");
  const awaitingDecision = exceptions.filter(
    (e) => e.status === "awaiting-decision",
  );

  return (
    <main className="mx-auto w-full max-w-2xl p-6 text-sm text-slate-900">
      <p className="mb-1 rounded-md bg-amber-50 px-3 py-2 text-amber-700">
        Scaffold sanity check — temporary. Replaced by the role-select screen
        next.
      </p>

      <h1 className="mt-6 text-lg font-semibold">RelayOps data wiring</h1>

      <ul className="mt-3 space-y-1 text-slate-500">
        <li>
          Branches loaded:{" "}
          <span className="font-medium text-slate-900">{branches.length}</span>{" "}
          ({branches.map((b) => b.name).join(", ")})
        </li>
        <li>
          Technicians loaded:{" "}
          <span className="font-medium text-slate-900">
            {technicians.length}
          </span>
        </li>
        <li>
          Exceptions loaded:{" "}
          <span className="font-medium text-slate-900">
            {exceptions.length}
          </span>
        </li>
        <li>
          Awaiting a manager decision:{" "}
          <span className="font-medium text-slate-900">
            {awaitingDecision.length}
          </span>
        </li>
      </ul>

      {hero && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Hero record — {hero.id}
          </p>
          <p className="mt-1 font-semibold">{hero.customer}</p>
          <p className="text-slate-500">{hero.issue}</p>
          <p className="mt-2 tabular-nums text-slate-500">
            SLA {hero.slaMinutesRemaining} min · $
            {hero.revenueAtRisk.toLocaleString()} at risk · AI suggests:{" "}
            <span className="text-slate-900">{hero.aiSuggestion?.action}</span>{" "}
            (→ {getTechnicianById("t-01")?.name})
          </p>
        </div>
      )}
    </main>
  );
}
