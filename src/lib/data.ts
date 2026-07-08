// Typed access to the seed data. JSON lives at the repo root in /data and is
// imported directly — no fetch, no API route (see CLAUDE.md hard constraints).

import branchesData from "@data/branches.json";
import techniciansData from "@data/technicians.json";
import exceptionsData from "@data/exceptions.json";
import type { Branch, Exception, Technician } from "@/lib/types";

export const branches = branchesData as unknown as Branch[];
export const technicians = techniciansData as unknown as Technician[];
export const exceptions = exceptionsData as unknown as Exception[];

export function getBranchById(id: string): Branch | undefined {
  return branches.find((b) => b.id === id);
}

export function getTechnicianById(id: string | null): Technician | undefined {
  if (!id) return undefined;
  return technicians.find((t) => t.id === id);
}
