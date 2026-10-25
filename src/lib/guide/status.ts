import { SITE_CONFIG } from "@/lib/seo/constants";
import { isPaying, isPublic, type ListingRow } from "./content";

export type Tone = "good" | "wait" | "warn" | "off";

export interface StatusInfo {
  label: string;
  tone: Tone;
  detail: string;
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: SITE_CONFIG.location.timeZone }).format(
    new Date(iso)
  );
}

/** Plain-language status for owners and admins. */
export function describeStatus(row: ListingRow): StatusInfo {
  const ends = formatDate(row.current_period_end);
  switch (row.status) {
    case "pending":
      return { label: "In review", tone: "wait", detail: "We review new listings within one business day. You can keep editing while you wait." };
    case "live":
      if (row.subscription_status === "past_due")
        return { label: "Payment issue", tone: "warn", detail: "Your last payment didn't go through. Update your card under Billing to stay listed." };
      if (!isPaying(row.subscription_status))
        return { label: "Paused", tone: "warn", detail: "Your listing is off the site until billing is sorted out. Open Billing to fix it." };
      if (row.cancel_at_period_end)
        return { label: "Ending", tone: "warn", detail: `Your listing stays up until ${ends ?? "the end of this billing period"}. Reopen Billing to keep it.` };
      return { label: "Live", tone: "good", detail: "Your listing is on the site. Edits show up within a few minutes." };
    case "hidden":
      return { label: "Hidden", tone: "off", detail: `Your listing is temporarily hidden. Contact ${SITE_CONFIG.email} with questions.` };
    case "rejected":
      return {
        label: "Not approved",
        tone: "off",
        detail: row.admin_note ? `Not approved: ${row.admin_note}` : "This listing wasn't approved and your payment was refunded.",
      };
    case "canceled":
      return { label: "Ended", tone: "off", detail: "This featured listing has ended and is no longer on the site." };
    default:
      return { label: "Awaiting payment", tone: "off", detail: "Checkout wasn't completed." };
  }
}

export const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  wait: "bg-amber-50 text-amber-900 ring-amber-200",
  warn: "bg-red-50 text-red-800 ring-red-200",
  off: "bg-slate-100 text-slate-700 ring-slate-200",
};

/** What a featured profile is still missing, for the "finish your listing" nudge. */
export function missingPieces(row: ListingRow): string[] {
  const c = row.content;
  const missing: string[] = [];
  if (!c.description?.length) missing.push("a description");
  if (!c.photos?.length) missing.push("photos");
  if (!c.hours) missing.push("hours");
  if (!c.perk) missing.push("a Flyer Perk");
  return missing;
}

export { isPublic };
