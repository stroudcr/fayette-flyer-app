import { SITE_CONFIG } from "@/lib/seo/constants";
import { BUSINESSES } from "./businesses";
import { CATEGORIES, CATEGORY_GROUPS } from "./categories";
import type { Business, Category, CategoryGroup, Town } from "./types";

export * from "./types";
export * from "./format";
export { CATEGORIES, CATEGORY_GROUPS } from "./categories";
export { TAGS, TAG_KEYS } from "./tags";

export const GUIDE_NAME = "Local Business Guide";
export const DIRECTORY_PATH = "/directory";

/** Featured membership pricing, in whole dollars. */
export const PRICING = {
  monthly: 29,
  yearly: 288,
  get yearlySavings() {
    return this.monthly * 12 - this.yearly;
  },
};

/* ---------- lookups ---------- */

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getGroup(slug: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.slug === slug);
}

export function categoriesInGroup(groupSlug: string): Category[] {
  return CATEGORIES.filter((c) => c.group === groupSlug);
}

/** Featured members first, then A to Z. */
export function sortBusinesses(list: Business[]): Business[] {
  return [...list].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "featured" ? -1 : 1;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });
}

/** Static listings only. Pages should use getGuideBusinesses() from ./data, which adds paid ones. */
export function staticBusinesses(): Business[] {
  return sortBusinesses(BUSINESSES);
}

export function businessesInCategory(list: Business[], categorySlug: string): Business[] {
  return sortBusinesses(list.filter((b) => b.category === categorySlug));
}

export function getBusiness(list: Business[], categorySlug: string, businessSlug: string): Business | undefined {
  return list.find((b) => b.category === categorySlug && b.slug === businessSlug);
}

export function recentlyAdded(list: Business[], count: number): Business[] {
  return [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, count);
}

/* ---------- urls ---------- */

export function categoryHref(categorySlug: string): string {
  return `${DIRECTORY_PATH}/${categorySlug}`;
}

export function businessHref(business: Pick<Business, "category" | "slug">): string {
  return `${DIRECTORY_PATH}/${business.category}/${business.slug}`;
}

export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_CONFIG.url}${path}`;
}

/* ---------- indexing ---------- */

/** Empty categories stay out of Google until they have a listing. */
export function isCategoryIndexable(list: Business[], categorySlug: string): boolean {
  return list.some((b) => b.category === categorySlug);
}

/**
 * Bare listings (name, address, phone) are thin pages, so they're kept out of
 * Google. A listing is indexed once it's featured or has a written description.
 */
export function isBusinessIndexable(business: Business): boolean {
  return business.tier === "featured" || Boolean(business.description?.some((p) => p.trim()));
}

/* ---------- display helpers ---------- */

const TOWN_CODES: Record<Town, string> = {
  "Peachtree City": "PTC",
  Fayetteville: "FAY",
  Tyrone: "TYR",
  Brooks: "BRK",
  Woolsey: "WLS",
};

export function townCode(town: Town): string {
  return TOWN_CODES[town];
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function streetLine(business: Business): string {
  const { street, suite } = business.address;
  return suite ? `${street}, ${suite}` : street;
}

export function fullAddress(business: Business): string {
  const { city, state, zip } = business.address;
  return `${streetLine(business)}, ${city}, ${state} ${zip}`;
}

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `tel:+1${national}`;
}

export function directionsUrl(business: Business): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${fullAddress(business)}`)}`;
}

export function mapEmbedUrl(business: Business): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(fullAddress(business))}&output=embed`;
}

/** "https://www.example.com/path" → "example.com" */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function mailtoHref(subject: string, body?: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SITE_CONFIG.email}?${params.join("&")}`;
}

/* ---------- calls to action ---------- */

const LISTING_DETAILS = "Business name:\nCategory:\nAddress:\nPhone:\nWebsite:\n";

export const FREE_LISTING_HREF = "/directory/submit";

export const FEATURED_MAILTO = mailtoHref(
  `Featured membership in the ${GUIDE_NAME}`,
  `${LISTING_DETAILS}Monthly or yearly:\n`
);

export function claimHref(businessSlug: string): string {
  return `${FREE_LISTING_HREF}?claim=${encodeURIComponent(businessSlug)}`;
}

export function updateMailto(businessName: string): string {
  return mailtoHref(`Update my listing: ${businessName}`, "What should change:\n");
}

export function recommendMailto(categoryHeading: string): string {
  return mailtoHref(`Recommendation for ${categoryHeading} in the ${GUIDE_NAME}`, "Business name:\nWhy you recommend them:\n");
}

/* ---------- dates ---------- */

function parseDay(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

/** "2026-10-01" → "Oct 2026" */
export function formatMonthYear(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(parseDay(date));
}

/** "2026-10-22" → "Thu, Oct 22" */
export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(parseDay(date));
}

/** The most recent addedAt / verifiedAt across the given listings. */
export function lastUpdated(list: Business[]): string | undefined {
  const dates = list.flatMap((b) => [b.addedAt, b.verifiedAt].filter((d): d is string => Boolean(d)));
  return dates.sort().at(-1);
}

/** "Fall 2026", based on the current month in Fayette County. */
export function guideEdition(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    year: "numeric",
    timeZone: SITE_CONFIG.location.timeZone,
  }).formatToParts(now);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const year = parts.find((p) => p.type === "year")?.value;
  const season = month <= 2 || month === 12 ? "Winter" : month <= 5 ? "Spring" : month <= 8 ? "Summer" : "Fall";
  return `${season} ${year}`;
}
