import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useRelayStore } from "@/lib/relay/store";

export const Route = createFileRoute("/")({
  component: RoleSelect,
});

function RoleSelect() {
  const setRole = useRelayStore((s) => s.setRole);
  const navigate = useNavigate();

  const enter = (role: "dispatcher" | "manager") => {
    setRole(role);
    navigate({ to: role === "dispatcher" ? "/dispatcher/today" : "/manager/today" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex h-14 items-center px-8">
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
            R
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">RelayOps</span>
        </span>
        <span className="ml-3 text-xs text-slate-400">· Meridian Field Services</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Continue as
            </p>
            <h1 className="mt-2 text-[22px] font-semibold text-slate-900">
              Which role are you signing in for?
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              RelayOps organizes exception decisions for two roles that both make calls · pick the
              one that matches the work you're doing.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <RoleCard
              title="Dispatcher"
              description="Triage exceptions, assign technicians, and escalate when approval is needed."
              cta="Continue as Dispatcher"
              onClick={() => enter("dispatcher")}
            />
            <RoleCard
              title="Operations Manager"
              description="Review escalations, approve exceptions, and send decisions back to dispatch."
              cta="Continue as Operations Manager"
              onClick={() => enter("manager")}
            />
          </div>

          <p className="mx-auto mt-8 max-w-md text-center text-[11px] leading-relaxed text-slate-400">
            Built for evaluation with local mock data. Authentication, notifications, and
            persistence are intentionally stubbed.
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-between px-8 py-4 text-[11px] text-slate-400">
        <span>© Meridian Field Services · Prototype build</span>
        <Link to="/" className="hover:text-slate-600">
          Product tour
        </Link>
      </footer>
    </div>
  );
}

function RoleCard({
  title,
  description,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
    >
      <span className="text-[13px] font-semibold text-slate-900">{title}</span>
      <span className="mt-1.5 text-xs text-slate-500">{description}</span>
      <span className="mt-6 inline-flex items-center gap-1 text-[12px] font-medium text-indigo-600 group-hover:text-indigo-700">
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
