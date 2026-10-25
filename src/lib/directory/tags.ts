import type { TagKey } from "./types";

/** Display labels for amenity tags, in the order filters should show them. */
export const TAGS: Record<TagKey, string> = {
  "open-saturday": "Open Saturday",
  "open-sunday": "Open Sunday",
  "evening-hours": "Evening hours",
  "new-clients": "New clients welcome",
  "same-week": "Same-week appointments",
  "emergency-service": "24/7 emergency service",
  "golf-cart-parking": "Golf-cart parking",
  "dog-friendly": "Dog friendly",
  "family-owned": "Family owned",
  "veteran-owned": "Veteran owned",
  "woman-owned": "Woman owned",
};

export const TAG_KEYS = Object.keys(TAGS) as TagKey[];
