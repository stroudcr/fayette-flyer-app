import type { Business } from "@/lib/directory/types";
import { parseBusinessForm, parseHours, type ListingContent } from "./content";

export interface FreeSubmission {
  id: string;
  slug: string;
  claimed_slug: string | null;
  category: string;
  status: "pending" | "live" | "rejected" | "hidden" | "superseded";
  owner_email: string;
  contact_name: string;
  contact_role: string;
  content: ListingContent;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function parseFreeForm(form: FormData) {
  const parsed = parseBusinessForm(form);
  const value = (key: string, max: number) => {
    const raw = form.get(key);
    return typeof raw === "string" ? raw.trim().slice(0, max) : "";
  };
  const contactName = value("contactName", 80);
  const contactRole = value("contactRole", 80);
  parsed.content.hours = parseHours(form, parsed.errors);
  if (parsed.errors.email) parsed.errors.email = "Enter an email we can reach you at.";
  if (contactName.length < 2) parsed.errors.contactName = "Enter your name.";
  if (contactRole.length < 2) parsed.errors.contactRole = "Tell us your role at the business.";
  if (form.get("authorized") !== "yes") parsed.errors.authorized = "Confirm that you can represent this business.";
  return { ...parsed, contactName, contactRole, claim: value("claim", 80) };
}

/** Private contact information never enters the public business object. */
export function freeBusiness(row: FreeSubmission, original?: Business): Business {
  return {
    ...original,
    ...row.content,
    slug: row.slug,
    category: row.category,
    tier: "free",
    addedAt: original?.addedAt ?? row.created_at.slice(0, 10),
    verifiedAt: (row.reviewed_at ?? row.created_at).slice(0, 10),
  };
}

/** Later approved claims replace the same business instead of making duplicates. */
export function mergeFreeBusinesses(originals: Business[], submissions: FreeSubmission[]): Business[] {
  const businesses = new Map(originals.map((b) => [b.slug, b]));
  for (const row of submissions) {
    if (row.status !== "live") continue;
    const original = businesses.get(row.slug);
    // A free claim must never replace a featured member.
    if (original?.tier === "featured") continue;
    businesses.set(row.slug, freeBusiness(row, original));
  }
  return [...businesses.values()];
}
