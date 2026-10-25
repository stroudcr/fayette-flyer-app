import type { Business } from "./types";

/**
 * Every business in the Local Business Guide.
 *
 * The guide starts empty. To add a business, add an object to this array;
 * the full shape is `Business` in ./types.ts. A minimal free listing:
 *
 *   {
 *     slug: "business-name",
 *     name: "Business Name",
 *     category: "plumbers",              // a slug from ./categories.ts
 *     tier: "free",                      // or "featured" for paying members
 *     town: "Peachtree City",
 *     address: { street: "123 Street Name", city: "Peachtree City", state: "GA", zip: "30269" },
 *     phone: "(770) 000-0000",
 *     website: "https://example.com",
 *     addedAt: "2026-11-01",
 *   },
 *
 * Featured members can also have tagline, description, services, hours,
 * tags, perk, photos and flyerMentions.
 *
 * `npm run test:directory` checks the entries (unique slugs, real categories,
 * valid dates and hours) before you deploy.
 */
export const BUSINESSES: Business[] = [];
