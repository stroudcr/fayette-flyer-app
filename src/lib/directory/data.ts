import "server-only";
import { cache } from "react";
import { toBusiness } from "@/lib/guide/content";
import { hasDatabase } from "@/lib/guide/env";
import { publicListings } from "@/lib/guide/listings";
import { freeSubmissions } from "@/lib/guide/free-listings";
import { mergeFreeBusinesses } from "@/lib/guide/free-content";
import { BUSINESSES } from "./businesses";
import { sortBusinesses } from "./index";
import type { Business } from "./types";

/**
 * Every business on the public site: static entries, approved free submissions,
 * and featured listings that are approved and paid up. If the database
 * is unreachable, the guide still renders with the static listings.
 */
export const getGuideBusinesses = cache(async (): Promise<Business[]> => {
  let paid: Business[] = [];
  let free: Business[] = BUSINESSES;
  if (hasDatabase()) {
    try {
      const [paidRows, freeRows] = await Promise.all([publicListings(), freeSubmissions(true)]);
      paid = paidRows.map(toBusiness);
      free = mergeFreeBusinesses(BUSINESSES, freeRows);
    } catch (error) {
      console.error("[directory] Could not load paid listings:", error);
    }
  }
  return sortBusinesses([...free.filter((b) => !paid.some((p) => p.slug === b.slug)), ...paid]);
});

/** Slugs of featured listings owners manage themselves. Free edits need review. */
export const getOwnerManagedSlugs = cache(async (): Promise<Set<string>> => {
  const all = await getGuideBusinesses();
  const staticSlugs = new Set(BUSINESSES.map((b) => b.slug));
  return new Set(all.filter((b) => b.tier === "featured" && !staticSlugs.has(b.slug)).map((b) => b.slug));
});
