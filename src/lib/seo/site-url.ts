const DEFAULT_SITE_URL = "https://www.fayetteflyer.com";

export function normalizeSiteUrl(value?: string): string {
  const normalized = value?.trim().replace(/\/+$/, "");

  return normalized || DEFAULT_SITE_URL;
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
