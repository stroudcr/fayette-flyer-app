"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { sendEmail } from "@/lib/guide/email";
import { publicUrl, refreshGuidePages, MANAGE_URL } from "@/lib/guide/fulfillment";
import { getListing, logEvent, setStatus } from "@/lib/guide/listings";
import { createLoginToken, getSession, SIGN_IN_LINK_MINUTES } from "@/lib/guide/session";
import { cancelAndRefund } from "@/lib/guide/stripe";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/directory/manage");
  return session;
}

function done(message: string): never {
  revalidatePath("/directory/admin");
  redirect(`/directory/admin?done=${encodeURIComponent(message)}`);
}

async function listingFrom(form: FormData) {
  const listing = await getListing(String(form.get("id") ?? ""));
  if (!listing) done("That listing no longer exists.");
  return listing;
}

export async function approveListing(form: FormData) {
  const admin = await requireAdmin();
  const listing = await listingFrom(form);
  if (listing.status !== "pending" && listing.status !== "hidden") done(`${listing.content.name} can't be approved from its current status.`);

  const updated = await setStatus(listing.id, "live");
  await logEvent(listing.id, "approved", { by: admin.email });
  refreshGuidePages();
  if (listing.status === "pending" && updated) {
    await sendEmail({
      to: listing.owner_email,
      subject: `${listing.content.name} is live in the Local Business Guide`,
      paragraphs: [
        `Good news: your featured listing is live in the Fayette Flyer Local Business Guide.`,
        publicUrl(updated),
        `You can update your photos, hours, description and Flyer Perk any time from ${MANAGE_URL}.`,
      ],
    });
  }
  done(`${listing.content.name} is live.`);
}

export async function rejectListing(form: FormData) {
  const admin = await requireAdmin();
  const listing = await listingFrom(form);
  const reason = String(form.get("reason") ?? "").trim().slice(0, 300);
  if (listing.status !== "pending") done(`Only listings in review can be rejected. Hide live listings instead.`);

  let billing = "No subscription to cancel.";
  if (listing.stripe_subscription_id) {
    try {
      billing = (await cancelAndRefund(listing.stripe_subscription_id)).message;
    } catch (error) {
      console.error("[guide admin] Cancel/refund failed:", error);
      done(`Couldn't cancel or refund ${listing.content.name} in Stripe, so nothing changed. Try again, or do it in the Stripe Dashboard first.`);
    }
  }

  await setStatus(listing.id, "rejected", reason || null);
  await logEvent(listing.id, "rejected", { by: admin.email, reason, billing });
  await sendEmail({
    to: listing.owner_email,
    subject: `About your Local Business Guide listing for ${listing.content.name}`,
    paragraphs: [
      `Thanks for your interest in the Fayette Flyer Local Business Guide. We weren't able to approve the featured listing for ${listing.content.name}.`,
      ...(reason ? [`Reason: ${reason}`] : []),
      `Your subscription has been canceled and your payment refunded. Refunds usually reach your card in 5 to 10 business days.`,
      `Questions? Reply to ${SITE_CONFIG.email}.`,
    ],
  });
  done(`${listing.content.name} was rejected. ${billing}`);
}

export async function hideListing(form: FormData) {
  const admin = await requireAdmin();
  const listing = await listingFrom(form);
  if (listing.status !== "live") done(`${listing.content.name} isn't live.`);
  await setStatus(listing.id, "hidden");
  await logEvent(listing.id, "hidden", { by: admin.email });
  refreshGuidePages();
  done(`${listing.content.name} is hidden. Billing continues until you cancel it in Stripe.`);
}

export async function sendOwnerSignInLink(form: FormData) {
  await requireAdmin();
  const listing = await listingFrom(form);
  const token = await createLoginToken(listing.owner_email);
  if (!token) done(`Too many sign-in links were sent to ${listing.owner_email} in the last hour. Try again later.`);
  const sent = await sendEmail({
    to: listing.owner_email,
    subject: "Your Fayette Flyer sign-in link",
    paragraphs: [
      `Here's your link to manage your Local Business Guide listing for ${listing.content.name}. It works once and expires in ${SIGN_IN_LINK_MINUTES} minutes.`,
      `${SITE_CONFIG.url}/directory/manage?token=${token}`,
    ],
  });
  done(sent ? `Sign-in link sent to ${listing.owner_email}.` : `Email isn't working yet, so no link was sent.`);
}
