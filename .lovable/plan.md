# Round of polish: icons, notifications, AI audit, mobile + favorites

## 1. Strip background colors from icons

Auditing every icon-in-a-tinted-tile in the app and reducing to a plain icon (currentColor, no `bg-*`, no `ring-*`):

- `notification-panel.tsx` — the 6×6 rounded tile behind each notification icon (`toneFor` map). Icon color stays semantic (amber/emerald/red/slate) but the pill/ring is dropped.
- `location-badge.tsx` — remove `bg-slate-100 ring-1 ring-slate-200/70`; render the lucide glyph alone at the same footprint. Keep the size prop so layout is unchanged.
- `exception-card.tsx` recommendation strip — the violet Sparkles tile stays because we're removing that block entirely in §3 (AI audit).
- `drawer/recommendation.tsx`, `page-header.tsx`, `workspace-context-bar.tsx` — same treatment for any icon currently sitting on a colored pill.

`CompanyLogo` monograms (the 2-letter tiles) keep their tinted background — they're logos, not icons, so tint is the brand cue. See §7.

## 2. Grouped, connected notification center

Rebuild `notification-panel.tsx` around notification **kind**, not time-of-day. Group order + labels:

```text
Escalations awaiting decision (2)
├── Alicia escalated Lakeside Grocery cross-branch transfer
└── Alicia escalated Riverside Office Park credit request

SLA at risk (1)
└── Beacon Hill Elementary boiler — 28 min to breach

Recent decisions (1)
└── Regional Ops approved Greenfield Logistics overtime

Daily summary (1)
└── 8 exceptions today · 3 critical · 2 awaiting approval
```

Visual treatment:
- One header per group with count + kind color dot.
- Items in a group share a **thin left rail** (`border-l border-slate-200`) with a small dot where each item joins the rail — the "playful line" the user asked for, but calm.
- Collapsed count if a group has > 3 items ("+2 more"), expandable.
- Empty groups hidden entirely.
- Unread pill on the group header (not per item) so the header itself tells you where the work is.

Still using existing `Notification.kind` — no data changes.

## 3. AI usage audit

Every place labeled "Recommendation / Sparkles / AI" needs to justify itself. Pass:

| Location | Current | Verdict | Change |
|---|---|---|---|
| `exception-card.tsx` violet "Recommendation" strip on **every** card | Always shown | ❌ Noise — most cards' recommendation is trivial ("Standard repair procedure") | Show **only** when `recommendation.quality === "High Confidence"` AND `signalsCount >= 3`. Otherwise the card is silent. |
| `exception-drawer` recommendation panel | Full panel with signals + bullets | ✅ Keep — this is the reason to open the drawer; dispatcher is making a decision here | Keep, but rename header from "AI recommendation" to "Recommended action · N signals" and drop the Sparkles icon in favor of a small quality chip (High/Medium confidence). |
| Command search "AI" affordance if present | — | ✅ Search is deterministic, not AI | No AI branding. |
| Manager decision row recommendation preview | Always shown | ✅ Keep — this is literally the decision-support surface | Keep, same high-signal filter as §above. |
| Notification "Daily summary" | Written as if AI wrote it | ✅ Keep — genuinely a rollup | Keep, drop any sparkle icon. |

Net effect: Sparkles/violet appears in ~2 places instead of ~6, and every remaining instance is tied to a real decision the user is about to make.

## 4. Mobile profile switcher

`mobile-bottom-nav.tsx` currently has 4 nav items. Add a 5th trailing slot:

```text
[ Today ] [ Work ] [ Mine ] [ Done ] [ ⦿ Avatar ]
```

- Grid becomes `grid-cols-5`.
- The avatar slot renders `AvatarInitials` (size 20) + first name below.
- Tapping it opens the existing `RoleSwitchDialog` (same dialog the sidebar footer uses) so behavior is identical to desktop.
- Active state (indigo) fires when `RoleSwitchDialog` is open.

## 5. Sticky mobile header

Today: `TopBar` is sticky, but the avatar-cluster + SLA-legend row and `PageHeader` are not — they scroll away.

Fix in `src/routes/_app.tsx`:
- Wrap TopBar + avatar/SLA row in a single `sticky top-0 z-30` container so both rows pin together.
- `PageHeader` keeps its own `sticky top-0 z-20` but that's inside a scroll container, so it stacks below the outer sticky region — which is exactly the requested "breadcrumbs + search + avatars sticky, page title + list scrolls" behavior. On desktop we double-check the offsets so PageHeader doesn't overlap.

## 6. Avatar tooltip: name **below**, centered

`avatar-initials.tsx` `AvatarWithTooltip`:
- `TooltipContent side="bottom"` (currently `"top"`).
- `align="center"` explicit.
- `sideOffset={6}` so it visually anchors under the dot.
- Verify with Playwright at 375px that the tooltip doesn't get clipped by the sticky header — if it does, add `collisionPadding` on the tooltip.

## 7. Real logo placeholders per location

Fictional brands (Lakeside Grocery, Beacon Hill Elementary, Northridge Medical Center, etc.) can't hit Logo.dev directly — no real domain. Approach:

1. Extend `seed.ts` per exception with an optional `logoDomain` field mapping each fictional customer to a real, thematically-matching domain used purely as a **visual placeholder**:
   - Lakeside Grocery Distribution → `sysco.com`
   - Beacon Hill Elementary → `scholastic.com`
   - Northridge Medical Center → `kaiserpermanente.org`
   - Harbor Freight Terminal → `maersk.com`
   - Riverside Office Park → `wework.com`
   - Meridian Corporate Tower → `wellstower.com`
   - Pinegrove Assisted Living → `brookdale.com`
   - Fairmont Plaza Retail → `simon.com`
2. `CompanyLogo` becomes: if `logoDomain` provided, render `<img src="https://img.logo.dev/{domain}?token=…" onError={fallback to monogram} />`. Otherwise monogram (unchanged).
3. Logo.dev connector needs to be linked so `VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY` exists. If it isn't linked at build time, `CompanyLogo` silently falls through to the monogram — no broken images.
4. Every place that currently shows `LocationBadge` (icon) also gets `CompanyLogo` next to the customer name on cards, drawer header, tables — so the location icon = *what kind of place*, the logo = *who the customer is*.

If the user prefers not to use real brand marks as placeholders (trademark concern), the fallback is to keep monograms — I'll ask that in step 4 if it becomes ambiguous, but for now the plan is real-brand placeholders because they said "figure it out."

## 8. Favorites filter on click

Today: clicking a favorite in the sidebar opens the drawer. Change so clicking **filters** first:

- Add `favoriteFilter: string | null` to the store (branchId of clicked favorite's exception).
- Clicking a favorite sets `favoriteFilter` to that exception's `branchId` and navigates to `/dispatcher` (or `/manager`) — the drawer no longer auto-opens on click.
- Workbench (`_app.dispatcher.index.tsx`) and Decision Queue read `favoriteFilter` and narrow `exceptions` to that branch.
- Sticky filter chip appears above the list: `Filtered by [BranchName] × Clear`. Clearing sets `favoriteFilter = null`.
- Long-press / right-click on the favorite still opens the drawer directly (kept as escape hatch).
- Selecting a branch in the sidebar's branch dropdown also updates `favoriteFilter` to keep the two in sync.

## Files touched

- edit: `src/components/relay/notification-panel.tsx` (regroup by kind, connecting rail, no icon tiles)
- edit: `src/components/relay/location-badge.tsx` (bare icon, no bg)
- edit: `src/components/relay/exception-card.tsx` (conditional recommendation strip)
- edit: `src/components/relay/exception-drawer.tsx`, `drawer/recommendation.tsx` (AI framing + confidence chip)
- edit: `src/components/relay/avatar-initials.tsx` (tooltip side/align)
- edit: `src/components/relay/mobile-bottom-nav.tsx` (5th avatar slot, opens `RoleSwitchDialog`)
- edit: `src/routes/_app.tsx` (sticky wrapper for TopBar + avatar row)
- edit: `src/routes/_app.dispatcher.index.tsx`, `_app.manager.index.tsx` (favoriteFilter chip + filtering)
- edit: `src/components/relay/app-sidebar.tsx` (favorites click → filter, not drawer)
- edit: `src/lib/relay/store.ts` (add `favoriteFilter`, keep in sync with `setBranch`)
- edit: `src/lib/relay/seed.ts` (add `logoDomain` per customer)
- new: none

## Out of scope

- No backend, routes, or auth changes.
- No new AI features — this pass reduces AI surface, doesn't add it.
- Real Logo.dev connector linking is a one-tool action if you approve; if not, monogram fallback stays as-is.
