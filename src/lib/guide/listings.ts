import "server-only";
import { BUSINESSES } from "@/lib/directory/businesses";
import { sql } from "./db";
import { normalizeEmail, slugify, type ListingContent, type ListingRow, type ListingStatus, type Plan } from "./content";

const COLUMNS = `id, slug, category, status, owner_email, plan, content, stripe_checkout_session_id,
  stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end,
  cancel_at_period_end, admin_note, created_at, updated_at, submitted_at, approved_at`;

type DbRow = Omit<ListingRow, "current_period_end" | "created_at" | "updated_at" | "submitted_at" | "approved_at"> & {
  current_period_end: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  submitted_at: Date | string | null;
  approved_at: Date | string | null;
};

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toRow(row: DbRow): ListingRow {
  return {
    ...row,
    current_period_end: iso(row.current_period_end),
    created_at: iso(row.created_at) ?? new Date().toISOString(),
    updated_at: iso(row.updated_at) ?? new Date().toISOString(),
    submitted_at: iso(row.submitted_at),
    approved_at: iso(row.approved_at),
  };
}

async function many(text: string, params: unknown[] = []): Promise<ListingRow[]> {
  return (await sql<DbRow>(text, params)).map(toRow);
}

async function one(text: string, params: unknown[] = []): Promise<ListingRow | null> {
  return (await many(text, params))[0] ?? null;
}

/** A slug that no static or paid listing uses yet. */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "business";
  const taken = new Set(BUSINESSES.map((b) => b.slug));
  const rows = await sql<{ slug: string }>(`select slug from guide_listings where slug = $1 or slug like $2`, [base, `${base}-%`]);
  for (const r of rows) taken.add(r.slug);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export async function createDraft(input: { content: ListingContent; category: string; email: string; plan: Plan }) {
  // Unpaid drafts are only useful for a little while; clear out old ones as we go.
  await sql(`delete from guide_listings where status = 'draft' and created_at < now() - interval '7 days'`);
  const slug = await uniqueSlug(input.content.name);
  return one(
    `insert into guide_listings (slug, category, status, owner_email, plan, content)
     values ($1, $2, 'draft', $3, $4, $5::jsonb) returning ${COLUMNS}`,
    [slug, input.category, normalizeEmail(input.email), input.plan, JSON.stringify(input.content)]
  );
}

export async function setCheckoutSession(id: string, sessionId: string) {
  await sql(`update guide_listings set stripe_checkout_session_id = $2, updated_at = now() where id = $1`, [id, sessionId]);
}

export function getListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve(null);
  return one(`select ${COLUMNS} from guide_listings where id = $1`, [id]);
}

export function getListingBySubscription(subscriptionId: string) {
  return one(`select ${COLUMNS} from guide_listings where stripe_subscription_id = $1`, [subscriptionId]);
}

export function listingsForOwner(email: string) {
  return many(
    `select ${COLUMNS} from guide_listings where lower(owner_email) = $1 and status <> 'draft' order by created_at desc`,
    [normalizeEmail(email)]
  );
}

export async function ownerHasListings(email: string): Promise<boolean> {
  const rows = await sql(`select 1 from guide_listings where lower(owner_email) = $1 and status <> 'draft' limit 1`, [
    normalizeEmail(email),
  ]);
  return rows.length > 0;
}

export async function customerIdForOwner(email: string): Promise<string | null> {
  const rows = await sql<{ stripe_customer_id: string }>(
    `select stripe_customer_id from guide_listings
     where lower(owner_email) = $1 and stripe_customer_id is not null order by created_at desc limit 1`,
    [normalizeEmail(email)]
  );
  return rows[0]?.stripe_customer_id ?? null;
}

export function allListingsForAdmin() {
  return many(
    `select ${COLUMNS} from guide_listings where status <> 'draft'
     order by case status when 'pending' then 0 when 'live' then 1 when 'hidden' then 2 else 3 end, created_at desc`
  );
}

/** Rows that belong on the public site. */
export function publicListings() {
  return many(
    `select ${COLUMNS} from guide_listings
     where status = 'live' and subscription_status in ('active', 'trialing', 'past_due')`
  );
}

export async function updateContent(id: string, content: ListingContent) {
  return one(
    `update guide_listings set content = $2::jsonb, updated_at = now() where id = $1 returning ${COLUMNS}`,
    [id, JSON.stringify(content)]
  );
}

export async function recordPayment(
  id: string,
  fields: {
    customerId: string | null;
    subscriptionId: string | null;
    subscriptionStatus: string | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
    plan: Plan | null;
  }
) {
  // draft -> pending the first time payment lands; later calls only refresh billing fields.
  return one(
    `update guide_listings set
       stripe_customer_id = coalesce($2::text, stripe_customer_id),
       stripe_subscription_id = coalesce($3::text, stripe_subscription_id),
       subscription_status = coalesce($4::text, subscription_status),
       current_period_end = coalesce(to_timestamp($5::double precision), current_period_end),
       cancel_at_period_end = $6::boolean,
       plan = coalesce($7::text, plan),
       status = case when status = 'draft' then 'pending' else status end,
       submitted_at = coalesce(submitted_at, now()),
       updated_at = now()
     where id = $1 returning ${COLUMNS}`,
    [id, fields.customerId, fields.subscriptionId, fields.subscriptionStatus, fields.currentPeriodEnd, fields.cancelAtPeriodEnd, fields.plan]
  );
}

export async function syncSubscription(
  id: string,
  fields: { status: string; currentPeriodEnd: number | null; cancelAtPeriodEnd: boolean; plan: Plan | null; ended: boolean }
) {
  return one(
    `update guide_listings set
       subscription_status = $2,
       current_period_end = coalesce(to_timestamp($3::double precision), current_period_end),
       cancel_at_period_end = $4::boolean,
       plan = coalesce($5::text, plan),
       status = case when $6::boolean and status in ('pending', 'live', 'hidden') then 'canceled' else status end,
       updated_at = now()
     where id = $1 returning ${COLUMNS}`,
    [id, fields.status, fields.currentPeriodEnd, fields.cancelAtPeriodEnd, fields.plan, fields.ended]
  );
}

export async function setStatus(id: string, status: ListingStatus, note?: string | null) {
  return one(
    `update guide_listings set
       status = $2::text,
       admin_note = coalesce($3::text, admin_note),
       approved_at = case when $2::text = 'live' then coalesce(approved_at, now()) else approved_at end,
       updated_at = now()
     where id = $1 returning ${COLUMNS}`,
    [id, status, note ?? null]
  );
}

export async function logEvent(listingId: string | null, kind: string, detail: Record<string, unknown> = {}) {
  await sql(`insert into guide_events (listing_id, kind, detail) values ($1, $2, $3::jsonb)`, [
    listingId,
    kind,
    JSON.stringify(detail),
  ]);
}

/* ---------- Stripe event bookkeeping ---------- */

export async function wasProcessed(eventId: string): Promise<boolean> {
  const rows = await sql(`select 1 from guide_stripe_events where id = $1`, [eventId]);
  return rows.length > 0;
}

export async function markProcessed(eventId: string, type: string) {
  await sql(`insert into guide_stripe_events (id, type) values ($1, $2) on conflict (id) do nothing`, [eventId, type]);
}
