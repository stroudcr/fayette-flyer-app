import "server-only";
import { headers } from "next/headers";
import { SITE_CONFIG } from "@/lib/seo/constants";

/** The site origin of the current request, so preview deployments link back to themselves. */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return SITE_CONFIG.url;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
