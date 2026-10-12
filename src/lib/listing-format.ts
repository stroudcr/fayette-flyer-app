import { displayDay, type Listing } from "./issue-listings";

/** Display helpers shared by the events page and the homepage. */
export function dateParts(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date);
  return {
    weekday: fmt({ weekday: "long" }),
    weekdayShort: fmt({ weekday: "short" }),
    day: fmt({ day: "numeric" }),
    month: fmt({ month: "long" }),
    monthShort: fmt({ month: "short" }),
  };
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function relativeLabel(isoDate: string, today: string): string | null {
  if (isoDate === today) return "Today";
  if (isoDate === addDays(today, 1)) return "Tomorrow";
  return null;
}

export function formatClock(time: string): { clock: string; meridiem: string } {
  const [h, m] = time.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { clock: `${hour}:${String(m).padStart(2, "0")}`, meridiem };
}

/** The town from an address like "Venue, 123 Street, Peachtree City, GA 30269". */
export function townFrom(whereText?: string): string | null {
  if (!whereText) return null;
  const matches = [...whereText.matchAll(/,\s*([^,]+?),\s*(?:GA|Georgia)\b/g)];
  return matches.length ? matches[matches.length - 1][1].trim() : null;
}

export function groupByDay(listings: Listing[], today: string): [string, Listing[]][] {
  const groups = new Map<string, Listing[]>();
  for (const listing of listings) {
    const day = displayDay(listing, today);
    groups.set(day, [...(groups.get(day) ?? []), listing]);
  }
  return [...groups.entries()];
}

