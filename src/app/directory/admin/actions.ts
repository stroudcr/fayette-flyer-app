"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { PRICING, getCategory, perDayLabel, upgradeHref } from "@/lib/directory";
import { sendEmail } from "@/lib/guide/email";
import { publicUrl, refreshGuidePages, MANAGE_URL } from "@/lib/guide/fulfillment";
import { getListing, logEvent, setStatus, updateReviewDetails } from "@/lib/guide/listings";
import { getFreeSubmission, reviewFreeSubmission, updateFreeReviewDetails } from "@/lib/guide/free-listings";
import { hasPublicCategory, listingRequirements, parseBusinessForm, type FieldErrors } from "@/lib/guide/content";
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
  if (!hasPublicCategory(listing.category) || Object.keys(listingRequirements(listing.content)).length) done("Choose a public category and complete the business details before publishing.");

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

async function reviewFree(form: FormData, status: "live" | "rejected" | "hidden") {
  const admin = await requireAdmin();
  if (status === "live") {
    const current = await getFreeSubmission(String(form.get("id") ?? ""));
    if (!current || !hasPublicCategory(current.category) || Object.keys(listingRequirements(current.content)).length) done("Choose a public category and complete the business details before publishing.");
  }
  const reason = String(form.get("reason") ?? "").trim().slice(0, 300);
  const listing = await reviewFreeSubmission(String(form.get("id") ?? ""), status, admin.email, reason);
  if (!listing) done("This submission has already been reviewed or no longer exists.");
  refreshGuidePages();
  if (status !== "hidden") {
    await sendEmail({
      to: listing.owner_email,
      subject: status === "live" ? `${listing.content.name} is live in the Local Business Guide` : `About your listing for ${listing.content.name}`,
      paragraphs: status === "live" ? [
        "Your free business listing has been approved and is now in the Fayette Flyer Local Business Guide.",
        `[See your listing](${SITE_CONFIG.url}/directory/${listing.category}/${listing.slug})`,
        // A second, later invitation to upgrade, now that the free listing is done and live.
        `Want ${listing.content.name} to stand out? Featured members are listed first in ${(getCategory(listing.category)?.heading ?? "their category").toLowerCase()}, with photos, a full description and a Flyer Perk for readers. It's ${perDayLabel(PRICING.yearly)} ($${PRICING.yearly} a year, or $${PRICING.monthly} a month), and your details are already filled in.`,
        `[Upgrade to featured](${SITE_CONFIG.url}${upgradeHref({
          name: listing.content.name,
          category: listing.category,
          businessType: listing.content.businessType,
          street: listing.content.address.street,
          suite: listing.content.address.suite,
          city: listing.content.town,
          zip: listing.content.address.zip,
          phone: listing.content.phone,
          website: listing.content.website,
        })})`,
      ] : [
        `Thanks for submitting ${listing.content.name}. We weren't able to approve this submission.`,
        ...(reason ? [`Reason: ${reason}`] : []),
        `Questions? Contact ${SITE_CONFIG.email}.`,
      ],
    });
  }
  done(status === "live" ? `${listing.content.name} is live.` : status === "hidden" ? `Approved submission for ${listing.content.name} removed. Any original directory entry remains.` : `Submission for ${listing.content.name} declined.`);
}

export async function approveFreeListing(form: FormData) { await reviewFree(form, "live"); }
export async function rejectFreeListing(form: FormData) { await reviewFree(form, "rejected"); }
export async function hideFreeListing(form: FormData) { await reviewFree(form, "hidden"); }

export interface ReviewState {
  attempt?: number;
  values?: Record<string, string>;
  errors?: FieldErrors;
  saved?: boolean;
  message?: string;
}

export async function saveReviewDetails(kind: "free" | "featured", id: string, previous: ReviewState, form: FormData): Promise<ReviewState> {
  await requireAdmin();
  const respond = (state: ReviewState) => ({ ...state, attempt: (previous.attempt ?? 0) + 1 });
  const listing = kind === "free" ? await getFreeSubmission(id) : await getListing(id);
  if (!listing || listing.status !== "pending") return respond({ message: "Only submissions awaiting review can be edited here." });
  form.set("email", listing.owner_email);
  const values = Object.fromEntries([...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  delete values.email;
  const parsed = parseBusinessForm(form);
  if (!hasPublicCategory(parsed.category)) parsed.errors.category = "Choose a public category before publishing.";
  if (Object.keys(parsed.errors).length) return respond({ errors: parsed.errors, values, message: "Please fix the highlighted fields." });
  const content = { ...listing.content, ...parsed.content };
  const updated = kind === "free" ? await updateFreeReviewDetails(id, parsed.category, content) : await updateReviewDetails(id, parsed.category, content);
  if (!updated) return respond({ message: "This submission changed during review. Reload and try again." });
  revalidatePath("/directory/admin");
  return respond({ saved: true, message: "Details saved. The submission still needs approval." });
}
