import type { DayKey, OpeningInterval } from "./types";

// Kept free of data imports so client components can use it cheaply.

export const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABELS: Record<DayKey, { short: string; long: string }> = {
  mon: { short: "Mon", long: "Monday" },
  tue: { short: "Tue", long: "Tuesday" },
  wed: { short: "Wed", long: "Wednesday" },
  thu: { short: "Thu", long: "Thursday" },
  fri: { short: "Fri", long: "Friday" },
  sat: { short: "Sat", long: "Saturday" },
  sun: { short: "Sun", long: "Sunday" },
};

/** "08:00" → "8:00a", "13:30" → "1:30p", "00:00" → "12:00a" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const meridiem = h >= 12 ? "p" : "a";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")}${meridiem}`;
}

export function formatIntervals(intervals: OpeningInterval[]): string {
  if (intervals.length === 0) return "Closed";
  return intervals.map((i) => `${formatTime(i.opens)} – ${formatTime(i.closes)}`).join(", ");
}
