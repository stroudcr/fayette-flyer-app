import "server-only";

/**
 * Settings for paid Local Business Guide listings. Every value comes from a
 * Vercel environment variable; nothing secret lives in the repo.
 */

export class GuideConfigError extends Error {
  constructor(public readonly variable: string) {
    super(`${variable} is not set`);
    this.name = "GuideConfigError";
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new GuideConfigError(name);
  return value;
}

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  stripeSecretKey: () => required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => required("STRIPE_WEBHOOK_SECRET"),
  stripePortalConfiguration: () => process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim() || undefined,
  sessionSecret: () => required("DIRECTORY_SESSION_SECRET"),
  adminEmails: (): string[] =>
    (process.env.DIRECTORY_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  emailFrom: () => process.env.EMAIL_FROM?.trim() || "guide@fayetteflyer.com",
  cloudflareAccountId: () => process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || undefined,
  cloudflareEmailToken: () => process.env.CLOUDFLARE_EMAIL_API_TOKEN?.trim() || undefined,
};

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
