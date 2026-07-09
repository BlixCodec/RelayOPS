import { BranchHealthPill } from "./status-pill";
import { branches } from "@/lib/relay/seed";

export function BranchHealthStrip() {
  // Exactly three pills per brief.
  const shown = [
    branches.find((b) => b.id === "north")!,
    branches.find((b) => b.id === "west")!,
    branches.find((b) => b.id === "east")!,
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-wider text-slate-400">Branch Health</span>
      <div className="flex flex-wrap gap-2">
        {shown.map((b) => (
          <BranchHealthPill key={b.id} branch={b.name} health={b.health} />
        ))}
      </div>
    </div>
  );
}
