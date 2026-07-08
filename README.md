# RelayOps

Exception management for a multi-branch field-service company. Two roles, one
closed loop: dispatchers triage and escalate; operations managers decide;
decisions flow back to the floor with a full audit trail.

**Live app:** _[Vercel link — add before submitting]_

## The problem

Meridian Field Services (6 branches, ~140 technicians) loses revenue and
customer trust when jobs go sideways — missed appointment windows, parts
delays, repeat-visit callbacks, safety flags. These "exceptions" live in phone
calls and manager texts. Nobody owns them, SLAs quietly breach.

Meridian doesn't need another ticket tracker. Each role needs one answer:
**"What do I need to decide next?"**

## Roles

| Role | Decides |
|---|---|
| **Dispatcher** (branch) | Priority, technician assignment, when to escalate |
| **Operations Manager** (regional) | Overtime, cross-branch transfers, goodwill credits — approve or deny with instructions |

Both roles make decisions. Nobody just watches a dashboard.

## What makes it different

RelayOps is organized around decisions, not records. The dispatcher's screen
answers "what needs action now"; the manager's screen is a decision queue, not
a chart wall. One role's action changes the other role's view in real time,
and the audit trail captures who decided what, and why.

**Design target:** a dispatcher understands what needs attention within 10
seconds of landing; a manager resolves an escalation in under 30 seconds.

## Deliberately stubbed

Authentication (per the brief — role selection is a stubbed login),
notifications/SMS, reporting exports, and the technician mobile view. Each stub
is labeled in the UI. The AI "Suggested action" is rule-based and labeled as
such — in production, confidence would derive from certification match, travel
time, and SLA headroom.

## AI tools used

_[Finalize before submitting — keep honest and specific: what Claude Code /
Claude generated, what was decided by hand before prompting.]_

## First three production improvements

1. **Real authentication with role-based permissions** — server-enforced RBAC
   so escalation authority and audit entries are tied to verified identity.
2. **Persistent store with an append-only audit log** — exception decisions
   are compliance-relevant; the trail must be immutable and queryable, not
   React state.
3. **SLA-driven escalation routing and notifications** — timers that
   auto-escalate approaching breaches and notify the on-call manager, so the
   system surfaces risk instead of waiting to be checked.

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · local JSON · Vercel

## Docs

- [`docs/decision-doc.md`](docs/decision-doc.md) — problem, roles, workflow, scope decisions
- [`docs/design-spec.md`](docs/design-spec.md) — tokens, components, interaction rules
