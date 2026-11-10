import type { Business, BusinessType } from "./types";

export const BUSINESS_TYPES: { value: BusinessType; label: string; hint: string }[] = [
  { value: "storefront", label: "Storefront", hint: "Customers visit my location" },
  { value: "service-area", label: "Service-area business", hint: "I travel to customers" },
  { value: "online-only", label: "Online only", hint: "Customers order online" },
];

export function isStorefront(business: { businessType?: string }): boolean {
  return !business.businessType || business.businessType === "storefront";
}

export function locationLabel(business: Pick<Business, "town" | "businessType">): string {
  return isStorefront(business)
    ? business.town
    : `Based in ${business.town}${business.businessType === "online-only" ? " · Online only" : ""}`;
}

/** Sanitize before serializing public data, even when an older row contains an address. */
export function publicLocation<T extends Pick<Business, "address" | "businessType">>(business: T): T {
  if (isStorefront(business)) return business;
  return { ...business, address: { city: business.address.city, state: business.address.state, street: "", zip: "" } };
}
