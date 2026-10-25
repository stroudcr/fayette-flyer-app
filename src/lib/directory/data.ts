import "server-only";
import { cache } from "react";
import { toBusiness } from "@/lib/guide/content";
import { hasDatabase } from "@/lib/guide/env";
import { publicListings } from "@/lib/guide/listings";
import { BUSINESSES } from "./businesses";
import { sortBusinesses } from "./index";
import type { Business } from "./types";

/**
 * Every business on the public site: the listings in businesses.ts plus paid
 * listings from the database that are approved and paid up. If the database
 * is unreachable, the guide still renders with the static listings.
 */
export const getGuideBusinesses = cache(async (): Promise<Business[]> => {
  let paid: Business[] = [];
  if (hasDatabase()) {
    try {
      paid = (await publicListings()).map(toBusiness);
    } catch (error) {
      console.error("[directory] Could not load paid listings:", error);
    }
  }
  return sortBusinesses([...BUSINESSES, ...paid]);
});

/** Slugs of listings owners manage themselves (paid listings from the database). */
export const getOwnerManagedSlugs = cache(async (): Promise<Set<string>> => {
  const all = await getGuideBusinesses();
  const staticSlugs = new Set(BUSINESSES.map((b) => b.slug));
  return new Set(all.filter((b) => !staticSlugs.has(b.slug)).map((b) => b.slug));
});
