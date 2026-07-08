# RelayOps — Design Spec (one page, final)

**Direction: Attio-style.** Calm enterprise ops tooling — soft neutrals, generous whitespace, small refined type, borders over shadows. Not Dribbble-glossy. If a choice makes it feel like a landing page, it's wrong; if it makes it feel like software a dispatcher lives in for 8 hours, it's right.

**Attio calibration (the three signatures):**
- Primary action buttons are dark neutral (`slate-900` bg, white text, hover `slate-800`) — not colored. Indigo is reserved for links, active nav, and focus states only.
- Soft gray hover states on every clickable row/card (`hover:bg-slate-50`).
- Pills and badges use tinted backgrounds with darker text of the same hue — never solid fills.

## Hard rules

- Light mode only. No theme toggle (scope).
- No gradients, no glassmorphism, no hero sections, no illustrations.
- Borders over shadows: `border-slate-200`, shadow only on the detail drawer and toasts.
- One accent color. Everything else is neutral + semantic status.
- Every color/spacing value comes from Tailwind defaults — zero custom CSS values.

## Tokens

| Role | Value |
|---|---|
| Background | `slate-50` |
| Surface (cards) | `white`, border `slate-200`, `rounded-lg` |
| Text primary / secondary | `slate-900` / `slate-500` |
| Accent (actions, links, active nav) | `indigo-600`, hover `indigo-700` |
| Critical | `red-600` text, `red-50` bg, `red-200` border |
| Warning / High load | `amber-600` text, `amber-50` bg |
| Stable / Resolved | `emerald-600` text, `emerald-50` bg |
| AI Insight surface | `violet-50` bg, `violet-200` border, violet-700 label |
| Font | Inter (or Geist), `text-sm` base; page titles `text-lg font-semibold` — nothing bigger |
| Numbers (SLA timers, $) | `tabular-nums font-medium` |
| Spacing | 8px grid: `p-4` cards, `gap-3` lists, `p-6` page gutter |
| Radius | `rounded-lg` cards, `rounded-full` pills/badges |

## Components (all shadcn/ui primitives, styled with tokens above)

- **App shell:** slim top bar — product name left, role badge + "Switch role" right. No sidebar (4 screens don't need one).
- **Exception card:** priority badge + customer name (semibold) → issue one-liner (secondary) → footer row: SLA countdown (tabular, turns red under 60 min) · branch · revenue at risk. Entire card clickable → drawer.
- **Priority badge:** pill, semantic colors. Critical / High / Medium.
- **Status pill (branch health):** dot + label. `● Stable` `● High load` `● Critical`. Exactly three, no charts.
- **AI Insight card:** violet surface, small "AI SUGGESTION" label, bold recommended action, 3–4 reasoning bullets, confidence tag. Visually distinct from everything else — it should read as "the platform thought about this."
- **Audit timeline:** vertical line, dot per event, `time + actor + action`. Newest at bottom (reads like a story).
- **Decision queue row (manager):** exception summary left, dispatcher's escalation reason in a quote block, Approve (indigo) / Deny (ghost) right. Deny requires a note.
- **Toast:** bottom-right, icon + sentence with a next-step ("Escalation sent to Regional Operations — a manager will review shortly.").
- **Empty states:** one icon, one sentence, one suggested action. Written, not defaulted. ("No escalations waiting. Nice — check branch health below.")
- **Role select:** two cards centered, role name + one-line description of what this role decides + stub disclosure footnote.

## Interaction rules

- Role switch is instant (top-bar), state persists — this is what makes the closed-loop demo land.
- Optimistic updates, no artificial spinners; data is local anyway.
- Escalate/Approve/Deny each: update state → append audit event → toast. Same pattern, three actions, zero surprises.
