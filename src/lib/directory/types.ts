import type { SITE_CONFIG } from "@/lib/seo/constants";

/** One of the towns the Flyer covers. */
export type Town = (typeof SITE_CONFIG.cities)[number];

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** 24-hour "HH:MM" times, e.g. { opens: "08:00", closes: "18:00" }. */
export interface OpeningInterval {
  opens: string;
  closes: string;
}

/**
 * Weekly hours. A day with an empty array is closed; a day left out is
 * unknown and simply isn't shown.
 */
export type WeeklyHours = Partial<Record<DayKey, OpeningInterval[]>>;

/** Amenity / attribute tags. Labels live in `TAGS` in ./tags.ts. */
export type TagKey =
  | "open-saturday"
  | "open-sunday"
  | "evening-hours"
  | "new-clients"
  | "same-week"
  | "emergency-service"
  | "golf-cart-parking"
  | "dog-friendly"
  | "family-owned"
  | "veteran-owned"
  | "woman-owned";

export interface FlyerPerk {
  /** Short headline, e.g. "Free first consultation". */
  title: string;
  /** Fine print, e.g. "Mention the Fayette Flyer when you book." */
  details?: string;
  /** Optional code readers show or say. */
  code?: string;
}

export interface FlyerMention {
  title: string;
  /** Link to the Flyer edition, e.g. "/issues/some-edition-slug". */
  url: string;
  /** "YYYY-MM-DD" */
  date: string;
}

export interface BusinessPhoto {
  /** A file under /public, e.g. "/directory/business-slug/storefront.jpg". */
  src: string;
  alt: string;
}

export interface Business {
  /** URL slug, unique within the guide: lowercase letters, numbers and dashes. */
  slug: string;
  name: string;
  /** Slug of the category from ./categories.ts. */
  category: string;
  /** "featured" = paying member ($29/mo or $288/yr). */
  tier: "free" | "featured";
  town: Town;
  address: {
    street: string;
    suite?: string;
    city: string;
    state: "GA";
    zip: string;
  };
  /** Digits only or formatted, e.g. "(770) 555-1234". */
  phone?: string;
  /** Full URL including https:// */
  website?: string;
  /** One-line italic summary under the name. */
  tagline?: string;
  /** About section, one string per paragraph. */
  description?: string[];
  services?: string[];
  hours?: WeeklyHours;
  tags?: TagKey[];
  perk?: FlyerPerk;
  photos?: BusinessPhoto[];
  flyerMentions?: FlyerMention[];
  /** When the listing went into the guide, "YYYY-MM-DD". */
  addedAt: string;
  /** When the Flyer last checked the details, "YYYY-MM-DD". */
  verifiedAt?: string;
}

export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface Category {
  slug: string;
  /** Short label used in the index, e.g. "Heating & air". */
  name: string;
  /** Plural heading used in page titles, e.g. "Heating & Air Companies". */
  heading: string;
  /** Lowercase singular, e.g. "heating and air company". */
  singular: string;
  /** Group slug from ./categories.ts. */
  group: string;
  /** Most specific schema.org LocalBusiness type that fits. */
  schemaType: string;
  /** What the category covers; used in the intro and meta description. */
  blurb: string;
  /** Extra search terms, e.g. ["hvac", "ac repair"]. */
  keywords?: string[];
  /** Optional local guide paragraphs shown on the category page. */
  guide?: string[];
  /** Optional category-specific questions shown on the category page. */
  faqs?: CategoryFaq[];
}

export interface CategoryGroup {
  slug: string;
  name: string;
}
