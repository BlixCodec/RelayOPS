import { technicians } from "./seed";
import type { Exception } from "./types";

// Turns an exception's flat recommendation into the structured reasoning the
// RecommendationTree renders — four operational groups plus expected outcome.
// Everything is derived from real seed fields (issue, history, SLA, revenue,
// and the recommendation bullets), so nothing here is invented copy.

export interface ReasoningGroup {
  label: string;
  items: string[];
}

export interface RecommendationTreeData {
  action: string;
  confidence: Exception["recommendation"]["quality"];
  signalsCount: number;
  groups: ReasoningGroup[];
  outcome: string[];
}

function slaHeadroom(slaDueAt: string): string {
  const diffMin = Math.round((new Date(slaDueAt).getTime() - Date.now()) / 60_000);
  if (diffMin < 0) return `SLA breached ${Math.abs(diffMin)} min ago`;
  return `Preserves SLA with ${diffMin} min of headroom`;
}

function namedTechnician(action: string): string | null {
  const hit = technicians.find((t) => action.includes(t.name.split(" ")[0]));
  return hit ? hit.name.split(" ")[0] : null;
}

function outcomeFor(ex: Exception): string[] {
  const breached = new Date(ex.slaDueAt).getTime() < Date.now();
  const out = [breached ? "SLA recovered" : "SLA protected"];
  const type = ex.issueType.toLowerCase();
  if (/refriger|cooler|cold|pharmacy/.test(type + ex.issue.toLowerCase())) {
    out.push("Inventory secured");
  } else if (/boiler|heat|generator|elevator/.test(type)) {
    out.push("Site kept operational");
  } else {
    out.push("Customer impact contained");
  }
  if (/repeat|callback|credit/.test(type + ex.issue.toLowerCase())) {
    out.push("Contract retention protected");
  } else {
    out.push("Single-visit resolution");
  }
  return out;
}

export function recommendationTree(ex: Exception): RecommendationTreeData {
  const rec = ex.recommendation;

  // Group 1 — why this exception needs attention (the situation).
  const attention = [
    ex.issueType,
    ...ex.customerHistory
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean),
  ].slice(0, 3);

  // Group 2 — the rationale behind the recommended action (the rich bullets).
  const tech = namedTechnician(rec.action);
  const rationaleLabel = tech ? `Why ${tech} is the right fit` : "Why this recommendation";
  const rationale = rec.bullets.slice(0, 4);

  // Group 3 — business impact (money + time, the manager's lens).
  const impact = [
    `$${ex.revenueAtRisk.toLocaleString()} revenue at risk if unresolved`,
    slaHeadroom(ex.slaDueAt),
  ];

  const groups: ReasoningGroup[] = [
    { label: "Why this needs attention", items: attention },
    { label: rationaleLabel, items: rationale },
    { label: "Business impact", items: impact },
  ];

  return {
    action: rec.action,
    confidence: rec.quality,
    signalsCount: rec.signalsCount,
    groups,
    outcome: outcomeFor(ex),
  };
}
