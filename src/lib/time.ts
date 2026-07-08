// Seed-time normalization. The JSON audit times are authored as a fictional
// morning (07:15–09:25). At app load we shift them all by one delta so the
// latest seeded event lands ~10 minutes ago — the timeline then always reads
// chronologically next to live actions, which stamp the real clock.
//
// "yesterday HH:MM" entries are left alone: they're a day old either way.
// Known edge: within ~2h after midnight the earliest seed times can wrap
// past 00:00 and read as late-evening; acceptable for a demo dataset.

const SEED_ANCHOR = "09:25"; // latest "today" time in the seed data
const ANCHOR_AGE_MINUTES = 10; // where the anchor should land: N minutes ago

const CLOCK_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toClock(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function nowHHMM(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Minutes to add to every seeded "today" time so the anchor lands ~10 min ago. */
export function computeSeedShift(now: string = nowHHMM()): number {
  return toMinutes(now) - ANCHOR_AGE_MINUTES - toMinutes(SEED_ANCHOR);
}

/** Shift a seeded time string; anything that isn't a bare HH:MM (e.g. "yesterday 15:40") passes through. */
export function shiftSeedTime(time: string, shiftMinutes: number): string {
  if (!CLOCK_RE.test(time)) return time;
  return toClock(toMinutes(time) + shiftMinutes);
}
