"use client";

import { useSyncExternalStore } from "react";
import type { DayKey, WeeklyHours } from "@/lib/directory/types";
import { formatIntervals } from "@/lib/directory/format";

const WEEKDAY_TO_KEY: Record<string, DayKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

function todayKey(): DayKey {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York",
  }).format(new Date());
  return WEEKDAY_TO_KEY[weekday] ?? "mon";
}

const subscribe = () => () => {};

/**
 * Today's hours, worked out in the visitor's browser so a cached page never
 * shows yesterday. Renders nothing on the server or when today is unknown.
 */
export function TodayHours({ hours }: { hours: WeeklyHours }) {
  const day = useSyncExternalStore(subscribe, todayKey, () => null);
  if (!day) return null;
  const intervals = hours[day];
  if (!intervals) return null;

  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">Today</dt>
      <dd className="mt-1">
        {intervals.length === 0 ? (
          <span className="text-white/80">Closed today</span>
        ) : (
          formatIntervals(intervals)
        )}
      </dd>
    </div>
  );
}
