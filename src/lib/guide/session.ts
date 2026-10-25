import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";
import { env } from "./env";
import { normalizeEmail } from "./content";

const COOKIE = "ff_guide_session";
const SESSION_DAYS = 30;
const LINK_MINUTES = 30;
const LINKS_PER_HOUR = 5;

export interface GuideSession {
  email: string;
  isAdmin: boolean;
}

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret()).update(payload).digest("base64url");
}

function encode(email: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ e: email, x: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): { email: string; expiresAt: number } | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e?: unknown; x?: unknown };
    if (typeof data.e !== "string" || typeof data.x !== "number" || data.x < Date.now()) return null;
    return { email: data.e, expiresAt: data.x };
  } catch {
    return null;
  }
}

export function isAdminEmail(email: string): boolean {
  return env.adminEmails().includes(normalizeEmail(email));
}

/** The signed-in owner or admin, if any. */
export async function getSession(): Promise<GuideSession | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = decode(value);
    return decoded ? { email: decoded.email, isAdmin: isAdminEmail(decoded.email) } : null;
  } catch {
    return null; // missing secret: treat as signed out
  }
}

/** Only call from a Server Action or Route Handler. */
export async function startSession(email: string) {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(COOKIE, encode(normalizeEmail(email), expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/* ---------- one-time sign-in links ---------- */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a sign-in token, or returns null when this email asked too often. */
export async function createLoginToken(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const recent = await sql<{ n: number }>(
    `select count(*)::int as n from guide_login_tokens
     where lower(email) = $1 and created_at > now() - interval '1 hour'`,
    [normalized]
  );
  if ((recent[0]?.n ?? 0) >= LINKS_PER_HOUR) return null;

  await sql(`delete from guide_login_tokens where expires_at < now() - interval '1 day'`);
  const token = randomBytes(32).toString("base64url");
  await sql(
    `insert into guide_login_tokens (token_hash, email, expires_at)
     values ($1, $2, now() + ($3::int * interval '1 minute'))`,
    [hashToken(token), normalized, LINK_MINUTES]
  );
  return token;
}

/** Marks the token used and returns its email, if it's valid. */
export async function redeemLoginToken(token: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(token)) return null;
  const rows = await sql<{ email: string }>(
    `update guide_login_tokens set used_at = now()
     where token_hash = $1 and used_at is null and expires_at > now()
     returning email`,
    [hashToken(token)]
  );
  return rows[0]?.email ?? null;
}

export const SIGN_IN_LINK_MINUTES = LINK_MINUTES;
