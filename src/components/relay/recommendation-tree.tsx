import { Check, Sparkles } from "lucide-react";
import { recommendationTree } from "@/lib/relay/recommendation-tree";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

const confidenceTone: Record<Exception["recommendation"]["quality"], string> = {
  "High Confidence": "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  "Medium Confidence": "bg-amber-50 text-amber-700 ring-amber-200/70",
  "Low Confidence": "bg-slate-100 text-slate-600 ring-slate-200/70",
};

/**
 * RecommendationTree — the RelayOps signature. Shows the recommended next
 * action and the reasoning behind it as connected operational groups, so a
 * dispatcher or manager can see *why* before they act. Rule-based for this
 * prototype; labeled honestly.
 */
export function RecommendationTree({
  exception,
  className,
}: {
  exception: Exception;
  className?: string;
}) {
  const tree = recommendationTree(exception);

  return (
    <section
      className={cn("rounded-xl border border-violet-200/70 bg-violet-50/40 p-4", className)}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Recommended Next Action
        </span>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
          AI Assisted
        </span>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
          Rule-Based Prototype
        </span>
        <span
          className={cn(
            "tnum ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
            confidenceTone[tree.confidence],
          )}
        >
          {tree.confidence}
          {tree.signalsCount > 0 ? (
            <>
              <span className="opacity-50">·</span>
              {tree.signalsCount} signals
            </>
          ) : null}
        </span>
      </div>

      {/* Recommended action */}
      <p className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
        {tree.action}
      </p>

      {/* Reasoning groups, connected by a subtle dashed rail */}
      <div className="relative mt-4">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-0 hidden border-t border-dashed border-violet-200 sm:block"
        />
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {tree.groups.map((group) => (
            <div key={group.label} className="relative sm:pt-4">
              <span
                aria-hidden
                className="absolute left-3 top-0 hidden h-4 w-px bg-violet-200 sm:block"
              />
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </h4>
              <ul className="mt-1.5 space-y-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-700"
                  >
                    <Check
                      className="mt-0.5 h-3 w-3 shrink-0 text-violet-500"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Expected outcome */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-violet-200/60 pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Expected outcome
        </span>
        {tree.outcome.map((o) => (
          <span
            key={o}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/70"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
            {o}
          </span>
        ))}
      </div>
    </section>
  );
}
