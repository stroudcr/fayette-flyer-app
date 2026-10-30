// Pure listing-content helpers (no database or network), so they can be tested.
import { SITE_CONFIG } from "@/lib/seo/constants";
import { CATEGORIES } from "@/lib/directory/categories";
import { DAY_ORDER } from "@/lib/directory/format";
import { TAG_KEYS } from "@/lib/directory/tags";
import type { Business, BusinessPhoto, DayKey, FlyerPerk, TagKey, Town, WeeklyHours } from "@/lib/directory/types";

export type ListingStatus = "draft" | "pending" | "live" | "hidden" | "rejected" | "canceled";
export type Plan = "monthly" | "yearly";

/** What an owner controls. Stored as JSON on the listing row. */
export interface ListingContent {
  name: string;
  town: Town;
  address: { street: string; suite?: string; city: string; state: "GA"; zip: string };
  phone?: string;
  website?: string;
  tagline?: string;
  description?: string[];
  services?: string[];
  hours?: WeeklyHours;
  tags?: TagKey[];
  perk?: FlyerPerk;
  photos?: BusinessPhoto[];
}

export interface ListingRow {
  id: string;
  slug: string;
  category: string;
  status: ListingStatus;
  owner_email: string;
  plan: Plan;
  content: ListingContent;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
}

export const MAX_PHOTOS = 3;
export const MAX_SERVICES = 12;
export const MAX_PARAGRAPHS = 4;

/** Stripe statuses that keep a listing on the site (past_due = Stripe is still retrying). */
const PAYING_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isPaying(subscriptionStatus: string | null): boolean {
  return Boolean(subscriptionStatus && PAYING_STATUSES.has(subscriptionStatus));
}

/** On the public site: approved and paid up. */
export function isPublic(row: Pick<ListingRow, "status" | "subscription_status">): boolean {
  return row.status === "live" && isPaying(row.subscription_status);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value) && value.length <= 254;
}

/** Converts a database listing to the shape the directory pages render. */
export function toBusiness(row: ListingRow): Business {
  const c = row.content;
  return {
    slug: row.slug,
    name: c.name,
    category: row.category,
    tier: "featured",
    town: c.town,
    address: c.address,
    phone: c.phone,
    website: c.website,
    tagline: c.tagline,
    description: c.description,
    services: c.services,
    hours: c.hours,
    tags: c.tags,
    perk: c.perk,
    photos: c.photos,
    addedAt: (row.approved_at ?? row.created_at).slice(0, 10),
    verifiedAt: row.updated_at.slice(0, 10),
  };
}

/* ---------- form parsing ---------- */

export type FieldErrors = Record<string, string>;

function text(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optional(value: string): string | undefined {
  return value ? value : undefined;
}

function normalizePhone(raw: string): string | undefined | null {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizeWebsite(raw: string): string | undefined | null {
  if (!raw) return undefined;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseHours(form: FormData, errors: FieldErrors): WeeklyHours | undefined {
  const hours: WeeklyHours = {};
  for (const day of DAY_ORDER) {
    const mode = text(form, `hours.${day}.mode`, 10);
    if (mode === "closed") {
      hours[day] = [];
    } else if (mode === "open") {
      const opens = text(form, `hours.${day}.opens`, 5);
      const closes = text(form, `hours.${day}.closes`, 5);
      if (!TIME.test(opens) || !TIME.test(closes)) {
        errors[`hours.${day}`] = "Add an opening and closing time.";
      } else {
        hours[day] = [{ opens, closes }];
      }
    }
  }
  return Object.keys(hours).length ? hours : undefined;
}

function parsePhotos(form: FormData, errors: FieldErrors): BusinessPhoto[] | undefined {
  const raw = text(form, "photos", 4000);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("not a list");
    const photos = parsed
      .filter((p): p is BusinessPhoto => typeof p?.src === "string" && typeof p?.alt === "string")
      .filter((p) => /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(p.src))
      .slice(0, MAX_PHOTOS)
      .map((p) => ({ src: p.src, alt: p.alt.trim().slice(0, 140) }));
    if (photos.some((p) => !p.alt)) errors.photos = "Describe each photo in a few words (for screen readers and Google).";
    return photos.length ? photos : undefined;
  } catch {
    errors.photos = "Something went wrong with the photos. Try uploading again.";
    return undefined;
  }
}

/** Basic business details shared by free submissions and featured signup. */
export function parseBusinessForm(form: FormData) {
  const errors: FieldErrors = {};
  const name = text(form, "name", 80);
  const category = text(form, "category", 60);
  const town = text(form, "town", 40) as Town;
  const street = text(form, "street", 120);
  const suite = text(form, "suite", 40);
  const zip = text(form, "zip", 10);
  const email = normalizeEmail(text(form, "email", 254));
  const phone = normalizePhone(text(form, "phone", 30));
  const website = normalizeWebsite(text(form, "website", 200));

  if (name.length < 2) errors.name = "Enter your business name.";
  if (!CATEGORIES.some((c) => c.slug === category)) errors.category = "Pick the category that fits best.";
  if (!SITE_CONFIG.cities.includes(town)) errors.town = "Pick your town.";
  if (street.length < 3) errors.street = "Enter your street address.";
  if (!/^\d{5}$/.test(zip)) errors.zip = "Enter a 5-digit ZIP code.";
  if (!isEmail(email)) errors.email = "Enter an email you check. You'll use it to sign in.";
  if (phone === null) errors.phone = "Enter a 10-digit phone number.";
  if (website === null) errors.website = "Enter a full web address, like example.com.";

  const content: ListingContent = {
    name,
    town,
    address: { street, suite: optional(suite), city: town, state: "GA", zip },
    phone: phone ?? undefined,
    website: website ?? undefined,
  };
  return { errors, content, category, email };
}

/** Fields collected on the join form (before checkout). */
export function parseJoinForm(form: FormData) {
  const parsed = parseBusinessForm(form);
  const plan = text(form, "plan", 10) as Plan;
  if (plan !== "monthly" && plan !== "yearly") parsed.errors.plan = "Pick monthly or yearly.";
  return { ...parsed, plan };
}

/** Every owner-editable field, from the manage form. */
export function parseListingForm(form: FormData, existing: ListingContent) {
  const errors: FieldErrors = {};
  const name = text(form, "name", 80);
  const town = text(form, "town", 40) as Town;
  const street = text(form, "street", 120);
  const suite = text(form, "suite", 40);
  const zip = text(form, "zip", 10);
  const phone = normalizePhone(text(form, "phone", 30));
  const website = normalizeWebsite(text(form, "website", 200));
  const tagline = text(form, "tagline", 140);
  const description = text(form, "description", 3000)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const services = text(form, "services", 1200)
    .split("\n")
    .map((s) => s.trim().slice(0, 60))
    .filter(Boolean);
  const tags = form.getAll("tags").filter((t): t is TagKey => typeof t === "string" && TAG_KEYS.includes(t as TagKey));
  const perkTitle = text(form, "perk.title", 80);
  const perkDetails = text(form, "perk.details", 200);
  const perkCode = text(form, "perk.code", 20).toUpperCase();

  if (name.length < 2) errors.name = "Enter your business name.";
  if (!SITE_CONFIG.cities.includes(town)) errors.town = "Pick your town.";
  if (street.length < 3) errors.street = "Enter your street address.";
  if (!/^\d{5}$/.test(zip)) errors.zip = "Enter a 5-digit ZIP code.";
  if (phone === null) errors.phone = "Enter a 10-digit phone number.";
  if (website === null) errors.website = "Enter a full web address, like example.com.";
  if (description.length > MAX_PARAGRAPHS) errors.description = `Keep it to ${MAX_PARAGRAPHS} short paragraphs.`;
  if (services.length > MAX_SERVICES) errors.services = `List up to ${MAX_SERVICES} services.`;
  if (!perkTitle && (perkDetails || perkCode)) errors["perk.title"] = "Give your perk a short headline.";

  const hours = parseHours(form, errors);
  const photos = parsePhotos(form, errors);

  const content: ListingContent = {
    ...existing,
    name,
    town,
    address: { street, suite: optional(suite), city: town, state: "GA", zip },
    phone: phone ?? undefined,
    website: website ?? undefined,
    tagline: optional(tagline),
    description: description.length ? description : undefined,
    services: services.length ? services : undefined,
    hours,
    tags: tags.length ? Array.from(new Set(tags)) : undefined,
    perk: perkTitle ? { title: perkTitle, details: optional(perkDetails), code: optional(perkCode) } : undefined,
    photos,
  };
  return { errors, content };
}

export const HOUR_DAYS: DayKey[] = DAY_ORDER;
