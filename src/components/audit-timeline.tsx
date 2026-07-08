// Audit trail per docs/design-spec.md: vertical line, dot per event,
// time + actor + action. Newest at bottom — it reads like a story.

import type { AuditEntry } from "@/lib/types";

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-4">
      {entries.map((entry, i) => (
        <li key={`${entry.time}-${i}`} className="relative">
          <span
            aria-hidden
            className="absolute -left-[21.5px] top-1.5 size-2 rounded-full border border-white bg-slate-300"
          />
          <p className="text-xs tabular-nums text-slate-500">
            {entry.time} · {entry.actor}
          </p>
          <p className="mt-0.5 text-sm text-slate-900">{entry.action}</p>
        </li>
      ))}
    </ol>
  );
}
