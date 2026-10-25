import "server-only";
import { revalidatePath } from "next/cache";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { getCategory } from "@/lib/directory";
import { emailAdmins, sendEmail } from "./email";
import { isPublic, type ListingRow } from "./content";
import { getListing, getListingBySubscription, logEvent, recordPayment, syncSubscription } from "./listings";
import { getSubscription, summarizeSubscription, type Stripe } from "./stripe";

const MANAGE_URL = `${SITE_CONFIG.url}/directory/manage`;
const ADMIN_URL = `${SITE_CONFIG.url}/directory/admin`;

/** Refreshes every guide page (and the sitemap) after a listing changes. */
export function refreshGuidePages() {
  revalidatePath("/directory", "layout");
  revalidatePath("/sitemap.xml");
}

export function publicUrl(row: ListingRow): string {
  return `${SITE_CONFIG.url}/directory/${row.category}/${row.slug}`;
}

/**
 * Records a completed checkout. Safe to call more than once (the webhook and
 * the success redirect both call it). Returns the listing, or null when the
 * session isn't a guide checkout.
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<ListingRow | null> {
  const listingId = session.client_reference_id;
  if (session.mode !== "subscription" || !listingId) return null;
  const listing = await getListing(listingId);
  if (!listing || listing.stripe_checkout_session_id !== session.id) return null;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return listing;

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);
  const summary = subscriptionId ? await getSubscription(subscriptionId) : null;
  const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
  const wasDraft = listing.status === "draft";

  const updated = await recordPayment(listing.id, {
    customerId: summary?.customerId ?? customerId,
    subscriptionId,
    subscriptionStatus: summary?.status ?? null,
    currentPeriodEnd: summary?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: summary?.cancelAtPeriodEnd ?? false,
    plan: summary?.plan ?? null,
  });

  if (updated && wasDraft) {
    await logEvent(updated.id, "paid", { session: session.id, subscription: subscriptionId });
    const category = getCategory(updated.category);
    await Promise.all([
      sendEmail({
        to: updated.owner_email,
        subject: `Thanks! ${updated.content.name} is in review`,
        paragraphs: [
          `Thanks for becoming a featured member of the Fayette Flyer Local Business Guide.`,
          `We review every new listing, usually within one business day, and will email you the moment ${updated.content.name} is live.`,
          `In the meantime, add your description, photos, hours and a Flyer Perk so your page is ready on day one:`,
          MANAGE_URL,
        ],
      }),
      emailAdmins(`New featured listing to review: ${updated.content.name}`, [
        `${updated.content.name} (${category?.heading ?? updated.category}, ${updated.content.town}) just paid for a ${updated.plan} featured listing.`,
        `Owner: ${updated.owner_email}`,
        `Approve or reject it here:`,
        ADMIN_URL,
      ]),
    ]);
  }
  return updated;
}

/** Copies a subscription's current state onto its listing. */
export async function applySubscription(subscription: Stripe.Subscription): Promise<ListingRow | null> {
  const listing = await getListingBySubscription(subscription.id);
  if (!listing) return null; // not a guide subscription (this Stripe account sells other things too)

  const summary = summarizeSubscription(subscription);
  // "unpaid" only hides the listing (isPublic checks payment); it comes back if the card is fixed.
  const ended = summary.status === "canceled" || summary.status === "incomplete_expired";
  const before = isPublic(listing);
  const updated = await syncSubscription(listing.id, {
    status: summary.status,
    currentPeriodEnd: summary.currentPeriodEnd,
    cancelAtPeriodEnd: summary.cancelAtPeriodEnd,
    plan: summary.plan,
    ended,
  });
  if (!updated) return null;

  if (before || isPublic(updated)) refreshGuidePages();
  if (ended && listing.status !== "canceled" && listing.status !== "rejected") {
    await logEvent(updated.id, "ended", { status: summary.status });
    await sendEmail({
      to: updated.owner_email,
      subject: `${updated.content.name}'s featured listing has ended`,
      paragraphs: [
        `Your featured listing for ${updated.content.name} in the Fayette Flyer Local Business Guide has ended, so it's no longer on the site.`,
        `If that's a surprise, it usually means a payment didn't go through. You can start a new listing any time at ${SITE_CONFIG.url}/directory/join.`,
      ],
    });
  }
  return updated;
}

export async function notifyPaymentFailed(listing: ListingRow) {
  await logEvent(listing.id, "payment_failed");
  await sendEmail({
    to: listing.owner_email,
    subject: `Payment problem with ${listing.content.name}'s listing`,
    paragraphs: [
      `We couldn't charge the card on file for ${listing.content.name}'s featured listing. Stripe will try again over the next few days.`,
      `To keep your listing on the site, sign in and choose "Billing" to update your card:`,
      MANAGE_URL,
    ],
  });
}

export { ADMIN_URL, MANAGE_URL };
