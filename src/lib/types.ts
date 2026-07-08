// Domain types for RelayOps. These mirror the seed data in /data exactly.
// If you edit the JSON shape, update these in lockstep.

export type BranchId = "north" | "west" | "east";
export type BranchHealth = "stable" | "high-load" | "critical";

export interface Branch {
  id: BranchId;
  name: string;
  city: string;
  health: BranchHealth;
  openExceptions: number;
  techsAvailable: number;
  techsTotal: number;
}

export type TechnicianStatus = "available" | "on-job" | "off-shift";

export interface Technician {
  id: string;
  name: string;
  branch: BranchId;
  skills: string[];
  status: TechnicianStatus;
  etaMinutes: number | null;
  jobsToday: number;
}

export type ExceptionType =
  | "equipment-failure"
  | "safety-flag"
  | "repeat-callback"
  | "parts-delay"
  | "missed-appointment";

export type Priority = "critical" | "high" | "medium";

export type ExceptionStatus =
  | "open"
  | "awaiting-decision"
  | "assigned"
  | "resolved";

export type ApprovalType =
  | "overtime"
  | "cross-branch-transfer"
  | "goodwill-credit";

export type Confidence = "high" | "medium" | "low";

export interface AiSuggestion {
  action: string;
  confidence: Confidence;
  reasons: string[];
}

export interface AuditEntry {
  time: string;
  actor: string;
  action: string;
}

export interface EscalationDecision {
  outcome: "approved" | "denied";
  by: string;
  note: string;
  at: string;
}

export interface Escalation {
  reason: string;
  requestedApproval: ApprovalType;
  escalatedBy: string;
  escalatedAt: string;
  decision?: EscalationDecision;
}

export interface Exception {
  id: string;
  customer: string;
  branch: BranchId;
  type: ExceptionType;
  issue: string;
  priority: Priority;
  status: ExceptionStatus;
  slaMinutesRemaining: number;
  revenueAtRisk: number;
  visitsThisQuarter: number;
  assignedTech: string | null;
  escalation: Escalation | null;
  aiSuggestion: AiSuggestion | null;
  auditTrail: AuditEntry[];
}

export type Role = "dispatcher" | "manager";
