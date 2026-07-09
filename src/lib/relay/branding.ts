import {
  Building2,
  GraduationCap,
  Hospital,
  MapPin,
  Plane,
  Stethoscope,
  Trees,
  Truck,
  Warehouse,
  Building,
  ShoppingBag,
  Hotel,
  Flame,
  Zap,
  type LucideIcon,
} from "lucide-react";

const rules: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /harbor|freight|terminal|port/i, icon: Plane },
  { match: /riverside|oak\s*park|park/i, icon: Trees },
  { match: /tower|corporate|plaza/i, icon: Building2 },
  { match: /elementary|school|academy|college/i, icon: GraduationCap },
  { match: /grocery|distribution|warehouse|logistics/i, icon: Truck },
  { match: /medical|hospital|clinic|health/i, icon: Stethoscope },
  { match: /hotel|resort|inn|hospitality/i, icon: Hotel },
  { match: /assisted|living|care|retail/i, icon: ShoppingBag },
  { match: /generator|electric|power/i, icon: Zap },
  { match: /boiler|refriger|thermal/i, icon: Flame },
  { match: /pinegrove|hill|forest/i, icon: Trees },
  { match: /bayfront|greenfield|cedar/i, icon: Warehouse },
];

export function iconFor(name: string): LucideIcon {
  for (const r of rules) if (r.match.test(name)) return r.icon;
  return MapPin;
}

const palette = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function toneFor(name: string) {
  return palette[hash(name) % palette.length];
}

export function monogram(name: string) {
  return name
    .replace(/&/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Real brand marks used purely as visual placeholders for fictional customers.
// Rendered via Clearbit's public logo endpoint — no auth required. If the
// image fails, CompanyLogo falls back to a monogram tile.
const domainMap: Array<{ match: RegExp; domain: string }> = [
  { match: /lakeside\s*grocery/i, domain: "sysco.com" },
  { match: /beacon\s*hill/i, domain: "scholastic.com" },
  { match: /north\s*ridge\s*medical|northridge\s*medical/i, domain: "kaiserpermanente.org" },
  { match: /harbor\s*freight|freight\s*terminal/i, domain: "maersk.com" },
  { match: /riverside\s*office|office\s*park/i, domain: "wework.com" },
  { match: /meridian\s*corporate|corporate\s*tower/i, domain: "wellstower.com" },
  { match: /pinegrove|assisted\s*living/i, domain: "brookdale.com" },
  { match: /fairmont\s*plaza|plaza\s*retail/i, domain: "simon.com" },
  { match: /cedar\s*point/i, domain: "usfoods.com" },
  { match: /bayfront\s*hotel|hotel\s*group/i, domain: "hilton.com" },
  { match: /greenfield\s*logistics/i, domain: "xpo.com" },
];

export function logoDomainFor(name: string): string | undefined {
  for (const r of domainMap) if (r.match.test(name)) return r.domain;
  return undefined;
}

// Companion helper: unused Building keeps import stable if rules shift.
export const _iconRegistry = { Building, Hospital };
