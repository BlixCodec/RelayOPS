"use client";

// Live SLA countdown. slaMinutesRemaining in the seed data is anchored to
// page load; one shared module-level ticker (single setInterval, no matter
// how many readouts subscribe) advances elapsed seconds so every SLA readout
// counts down visibly. Display math only — store state never mutates.

import { useSyncExternalStore } from "react";
import type { Exception } from "@/lib/types";

const loadedAt = Date.now();

let elapsedSeconds = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  const next = Math.floor((Date.now() - loadedAt) / 1000);
  if (next !== elapsedSeconds) {
    elapsedSeconds = next;
    listeners.forEach((notify) => notify());
  }
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (intervalId === null) intervalId = setInterval(tick, 1000);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function useSecondsElapsed(): number {
  return useSyncExternalStore(
    subscribe,
    () => elapsedSeconds,
    () => 0, // server snapshot — SLA readouts only render client-side
  );
}

export interface SlaInfo {
  /** Seconds left, clamped at 0. Null when the exception is resolved. */
  seconds: number | null;
  met: boolean;
  breached: boolean;
  /** Under an hour (or breached) — render red. */
  urgent: boolean;
}

export function slaInfo(e: Exception, elapsed: number): SlaInfo {
  if (e.status === "resolved")
    return { seconds: null, met: true, breached: false, urgent: false };
  const seconds = Math.max(0, e.slaMinutesRemaining * 60 - elapsed);
  const breached = seconds === 0;
  return { seconds, met: false, breached, urgent: breached || seconds < 3600 };
}

// Under an hour: mm:ss ticking ("41:52"). An hour or more: "7h 00m" style.
export function formatSlaClock(totalSeconds: number): string {
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
