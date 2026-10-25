"use server";

import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { parseJoinForm, type FieldErrors } from "@/lib/guide/content";
import { GuideConfigError } from "@/lib/guide/env";
import { createDraft, customerIdForOwner, setCheckoutSession } from "@/lib/guide/listings";
import { requestOrigin } from "@/lib/guide/origin";
import { createCheckoutSession } from "@/lib/guide/stripe";

export interface JoinState {
  errors?: FieldErrors;
  message?: string;
  values?: Record<string, string>;
}

export async function startCheckout(_prev: JoinState, form: FormData): Promise<JoinState> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") values[key] = value;

  const { errors, content, category, email, plan } = parseJoinForm(form);
  if (Object.keys(errors).length) return { errors, values };

  let checkoutUrl: string;
  try {
    const listing = await createDraft({ content, category, email, plan });
    if (!listing) throw new Error("Could not save the listing");
    const session = await createCheckoutSession({
      listingId: listing.id,
      businessName: content.name,
      plan,
      email,
      customerId: await customerIdForOwner(email),
      origin: await requestOrigin(),
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    await setCheckoutSession(listing.id, session.id);
    checkoutUrl = session.url;
  } catch (error) {
    console.error("[guide join] Could not start checkout:", error);
    return {
      values,
      message:
        error instanceof GuideConfigError
          ? `Online signup isn't switched on yet. Email ${SITE_CONFIG.email} and we'll set up your listing.`
          : "Something went wrong opening checkout. Please try again in a minute.",
    };
  }
  redirect(checkoutUrl);
}
