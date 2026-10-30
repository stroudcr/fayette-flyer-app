"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { getGuideBusinesses } from "@/lib/directory/data";
import type { FieldErrors } from "@/lib/guide/content";
import { emailAdmins } from "@/lib/guide/email";
import { parseFreeForm } from "@/lib/guide/free-content";
import { createFreeSubmission } from "@/lib/guide/free-listings";

export interface FreeState {
  attempt?: number;
  errors?: FieldErrors;
  values?: Record<string, string>;
  message?: string;
  submitted?: boolean;
}

export async function submitFreeListing(_previous: FreeState, form: FormData): Promise<FreeState> {
  const respond = (state: FreeState): FreeState => ({ ...state, attempt: (_previous.attempt ?? 0) + 1 });
  const values = Object.fromEntries([...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  if (form.get("companyFax")) return respond({ values, message: "We couldn't submit this form. Please try again." });
  const parsed = parseFreeForm(form);
  if (Object.keys(parsed.errors).length) return respond({ errors: parsed.errors, values });

  try {
    const businesses = await getGuideBusinesses();
    const original = parsed.claim ? businesses.find((b) => b.slug === parsed.claim && b.tier === "free") : undefined;
    if (parsed.claim && !original) return respond({ values, message: "That listing is no longer available to claim. Please return to the directory and try again." });
    // Claims retain their current category and URL until reviewed by staff.
    if (original && parsed.category !== original.category) return respond({ values, errors: { category: "Keep the listing's current category when claiming it." } });
    const h = await headers();
    const ip = h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for") ?? parsed.email;
    const requesterHash = createHash("sha256").update(ip.split(",")[0].trim()).digest("hex");
    const result = await createFreeSubmission({ ...parsed, requesterHash, existingSlugs: businesses.map((b) => b.slug) });
    if (result.limited) return respond({ values, message: "Too many submissions. Please try again in an hour." });
    if (!result.listing) return respond({ submitted: true }); // Existing pending claim; don't send duplicate notifications.

    const c = parsed.content;
    await emailAdmins(`Free listing ${original ? "claim" : "submission"} to review: ${c.name}`, [
      `${c.name} submitted a free ${original ? "listing claim" : "listing"} for your approval. Nothing has been published.`,
      `Contact: ${parsed.contactName} (${parsed.contactRole}), ${parsed.email}`,
      `Business: ${c.name}. Address: ${c.address.street}${c.address.suite ? `, ${c.address.suite}` : ""}, ${c.town}, GA ${c.address.zip}. Phone: ${c.phone ?? "Not provided"}. Website: ${c.website ?? "Not provided"}.`,
      ...(original ? [`Existing listing: ${SITE_CONFIG.url}/directory/${original.category}/${original.slug}`] : []),
      "Review the details and approve or decline the submission:",
      `${SITE_CONFIG.url}/directory/admin`,
    ]);
    revalidatePath("/directory/admin");
    return respond({ submitted: true });
  } catch (error) {
    console.error("[free listing] Submission failed:", error);
    return respond({ values, message: "We couldn't save your submission. Your details are still below. Please try again shortly." });
  }
}
