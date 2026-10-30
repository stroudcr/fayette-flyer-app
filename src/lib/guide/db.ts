import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "./env";

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

/**
 * Tables for paid guide listings. Every statement is idempotent, so this runs
 * once per server instance and a brand-new database sets itself up.
 */
const SCHEMA = [
  `create table if not exists guide_free_submissions (
    id uuid primary key default gen_random_uuid(),
    slug text not null,
    claimed_slug text,
    category text not null,
    status text not null default 'pending' check (status in ('pending', 'live', 'rejected', 'hidden', 'superseded')),
    owner_email text not null,
    contact_name text not null,
    contact_role text not null,
    requester_hash text not null,
    content jsonb not null,
    admin_note text,
    reviewed_by text,
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
  )`,
  `create index if not exists guide_free_status_idx on guide_free_submissions (status)`,
  `create index if not exists guide_free_recent_idx on guide_free_submissions (created_at, owner_email, requester_hash)`,
  `create unique index if not exists guide_free_pending_idx on guide_free_submissions (lower(owner_email), slug) where status = 'pending'`,
  `create table if not exists guide_listings (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    category text not null,
    status text not null default 'draft',
    owner_email text not null,
    plan text not null,
    content jsonb not null,
    stripe_checkout_session_id text unique,
    stripe_customer_id text,
    stripe_subscription_id text unique,
    subscription_status text,
    current_period_end timestamptz,
    cancel_at_period_end boolean not null default false,
    admin_note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz,
    approved_at timestamptz
  )`,
  `create index if not exists guide_listings_owner_idx on guide_listings (lower(owner_email))`,
  `create index if not exists guide_listings_status_idx on guide_listings (status)`,
  `create table if not exists guide_login_tokens (
    token_hash text primary key,
    email text not null,
    expires_at timestamptz not null,
    used_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists guide_login_tokens_email_idx on guide_login_tokens (lower(email))`,
  `create table if not exists guide_events (
    id bigserial primary key,
    listing_id uuid references guide_listings(id) on delete set null,
    kind text not null,
    detail jsonb,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists guide_stripe_events (
    id text primary key,
    type text not null,
    received_at timestamptz not null default now()
  )`,
];

function getClient() {
  client ??= neon(env.databaseUrl());
  return client;
}

async function ensureSchema() {
  schemaReady ??= (async () => {
    const run = getClient();
    for (const statement of SCHEMA) await run.query(statement);
  })().catch((error) => {
    schemaReady = null; // try again on the next request
    throw error;
  });
  return schemaReady;
}

/** Runs a parameterized query ($1, $2, ...) and returns the rows. */
export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  return (await getClient().query(text, params)) as T[];
}
