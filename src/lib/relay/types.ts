export type Role = "dispatcher" | "manager";

export type Priority = "critical" | "high" | "medium";

export type ExceptionStatus =
  "open" | "assigned" | "escalated" | "approved" | "denied" | "resolved";

export type BranchHealth = "stable" | "high_load" | "critical";

export interface Branch {
  id: string;
  name: string;
  region: "North" | "West" | "East";
  health: BranchHealth;
}

export interface Technician {
  id: string;
  name: string;
  certifications: string[];
  minutesAway: number;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorRole: Role | "system";
  action: string;
  note?: string;
}

export interface Escalation {
  reason: string;
  by: string;
  at: string;
}

export interface Decision {
  outcome: "approved" | "denied";
  by: string;
  at: string;
  note?: string;
}

export interface Recommendation {
  action: string;
  quality: "High Confidence" | "Medium Confidence" | "Low Confidence";
  bullets: string[];
  signalsCount: number;
}

export interface Exception {
  id: string;
  customer: string;
  issueType: string;
  issue: string;
  branchId: string;
  priority: Priority;
  status: ExceptionStatus;
  slaDueAt: string;
  revenueAtRisk: number;
  customerHistory: string;
  assignedTech?: string;
  createdAt: string;
  escalation?: Escalation;
  decision?: Decision;
  recommendation: Recommendation;
  audit: AuditEvent[];
  favoritedBy?: Role[];
  ownerDispatcher: string;
}

export interface Notification {
  id: string;
  kind: "escalation" | "decision" | "sla" | "summary" | "customer_stub";
  message: string;
  at: string;
  read: boolean;
  exceptionId?: string;
  actionLabel: string;
}
