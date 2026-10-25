"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { isEmail, isPublic, normalizeEmail, parseListingForm, type FieldErrors, type ListingContent } from "@/lib/guide/content";
import { sendEmail } from "@/lib/guide/email";
import { refreshGuidePages } from "@/lib/guide/fulfillment";
import { getListing, ownerHasListings, updateContent } from "@/lib/guide/listings";
import { requestOrigin } from "@/lib/guide/origin";
import { createLoginToken, endSession, getSession, isAdminEmail, redeemLoginToken, startSession, SIGN_IN_LINK_MINUTES } from "@/lib/guide/session";
import { createPortalSession } from "@/lib/guide/stripe";

/* ---------- sign in / out ---------- */

export interface SignInState {
  sent?: boolean;
  error?: string;
  email?: string;
}

export async function requestSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const raw = form.get("email");
  const email = normalizeEmail(typeof raw === "string" ? raw : "");
  if (!isEmail(email)) return { error: "Enter the email you used when you signed up.", email };

  try {
    // Same answer whether or not the email has a listing, so this can't be used to probe for accounts.
    if (isAdminEmail(email) || (await ownerHasListings(email))) {
      const token = await createLoginToken(email);
      if (token) {
        const link = `${await requestOrigin()}/directory/manage?token=${token}`;
        const sent = await sendEmail({
          to: email,
          subject: "Your Fayette Flyer sign-in link",
          paragraphs: [
            `Here's your link to manage your Local Business Guide listing. It works once and expires in ${SIGN_IN_LINK_MINUTES} minutes.`,
            link,
            `If you didn't ask for this, you can ignore this email.`,
          ],
        });
        if (!sent) {
          return { error: `We couldn't send email just now. Please try again shortly, or contact ${SITE_CONFIG.email}.`, email };
        }
      }
    }
  } catch (error) {
    console.error("[guide sign-in] Could not send sign-in link:", error);
    return { error: "Something went wrong. Please try again in a minute.", email };
  }
  return { sent: true, email };
}

export async function completeSignIn(form: FormData) {
  const token = form.get("token");
  const email = typeof token === "string" ? await redeemLoginToken(token) : null;
  if (!email) redirect("/directory/manage?signin=expired");
  await startSession(email);
  redirect(isAdminEmail(email) && !(await ownerHasListings(email)) ? "/directory/admin" : "/directory/manage");
}

export async function signOut() {
  await endSession();
  redirect("/directory/manage");
}

/* ---------- owner access ---------- */

async function requireOwnedListing(id: string) {
  const session = await getSession();
  if (!session) redirect("/directory/manage");
  const listing = await getListing(id);
  if (!listing || listing.status === "draft") redirect("/directory/manage");
  if (!session.isAdmin && normalizeEmail(listing.owner_email) !== session.email) redirect("/directory/manage");
  return { session, listing };
}

export async function openBillingPortal(form: FormData) {
  const id = String(form.get("id") ?? "");
  const { listing } = await requireOwnedListing(id);
  if (!listing.stripe_customer_id) redirect("/directory/manage?billing=unavailable");
  let url: string;
  try {
    const portal = await createPortalSession(listing.stripe_customer_id, `${await requestOrigin()}/directory/manage`);
    url = portal.url;
  } catch (error) {
    console.error("[guide billing] Could not open portal:", error);
    redirect("/directory/manage?billing=unavailable");
  }
  redirect(url);
}

/* ---------- editing ---------- */

export interface EditState {
  errors?: FieldErrors;
  message?: string;
  saved?: boolean;
}

function blobUrls(content: ListingContent): Set<string> {
  return new Set((content.photos ?? []).map((p) => p.src));
}

export async function saveListing(id: string, _prev: EditState, form: FormData): Promise<EditState> {
  const { listing } = await requireOwnedListing(id);
  const { errors, content } = parseListingForm(form, listing.content);
  if (Object.keys(errors).length) return { errors, message: "Please fix the highlighted fields." };

  const updated = await updateContent(listing.id, content);
  if (!updated) return { message: "Something went wrong saving. Please try again." };

  // Delete photos the owner removed (best effort).
  const kept = blobUrls(content);
  const removed = [...blobUrls(listing.content)].filter((url) => !kept.has(url));
  if (removed.length) await del(removed).catch((error) => console.error("[guide photos] Could not delete:", error));

  if (isPublic(updated)) refreshGuidePages();
  revalidatePath(`/directory/manage/${listing.id}`);
  return { saved: true };
}
