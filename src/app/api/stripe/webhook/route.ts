import { NextResponse } from "next/server";
import { env, hasDatabase } from "@/lib/guide/env";
import { emailAdmins } from "@/lib/guide/email";
import { applySubscription, fulfillCheckout, notifyPaymentFailed, ADMIN_URL } from "@/lib/guide/fulfillment";
import { getListingBySubscription, logEvent, markProcessed, wasProcessed } from "@/lib/guide/listings";
import { paymentIntentForCharge, stripe, subscriptionForPaymentIntent, type Stripe } from "@/lib/guide/stripe";

export const dynamic = "force-dynamic";

/** The subscription an invoice belongs to (API 2025-03-31.basil and later). */
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (invoice.parent?.type !== "subscription_details") return null;
  const sub = invoice.parent.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

function id(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Refund, dispute and fraud-warning events: find the listing, log it, tell the admins. */
async function handleRiskEvent(kind: string, paymentIntentId: string | null, chargeId: string | null, detail: Record<string, unknown>) {
  const pi = paymentIntentId ?? (chargeId ? await paymentIntentForCharge(chargeId) : null);
  const subscriptionId = await subscriptionForPaymentIntent(pi);
  const listing = subscriptionId ? await getListingBySubscription(subscriptionId) : null;
  if (!listing) return; // not a guide payment

  await logEvent(listing.id, kind, detail);
  if (kind === "refund") return; // refunds are started by us; logging is enough

  await emailAdmins(`${kind === "dispute" ? "Dispute" : "Fraud warning"} on ${listing.content.name}'s listing`, [
    `Stripe reported a ${kind === "dispute" ? "payment dispute" : "possible fraud warning"} on the featured listing for ${listing.content.name} (${listing.owner_email}).`,
    `Review it in the Stripe Dashboard, and hide the listing from the admin page if needed:`,
    ADMIN_URL,
  ]);
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await fulfillCheckout(event.data.object);
      break;

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await applySubscription(event.data.object);
      break;

    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = invoiceSubscriptionId(event.data.object);
      if (!subscriptionId) break;
      const listing = await getListingBySubscription(subscriptionId);
      if (!listing) break;
      // Re-read the subscription so the listing reflects Stripe's latest status.
      await applySubscription(await stripe().subscriptions.retrieve(subscriptionId));
      if (event.type === "invoice.payment_failed") await notifyPaymentFailed(listing);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      await handleRiskEvent("refund", id(charge.payment_intent), charge.id, { charge: charge.id, amount_refunded: charge.amount_refunded });
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object;
      await handleRiskEvent("dispute", id(dispute.payment_intent), id(dispute.charge), { dispute: dispute.id, reason: dispute.reason });
      break;
    }

    case "radar.early_fraud_warning.created": {
      const warning = event.data.object;
      await handleRiskEvent("fraud_warning", id(warning.payment_intent), id(warning.charge), { warning: warning.id, type: warning.fraud_type });
      break;
    }
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  // This Stripe account also sells other products. Until the guide is fully
  // configured there can't be guide payments, so accept and ignore events
  // rather than making Stripe retry them for days.
  if (!hasDatabase() || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, skipped: "guide not configured" });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe().webhooks.constructEvent(body, signature, env.stripeWebhookSecret());
  } catch (error) {
    console.error("[stripe webhook] Signature check failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (await wasProcessed(event.id)) return NextResponse.json({ received: true, duplicate: true });
    await handle(event);
    await markProcessed(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 500 makes Stripe retry later, which is what we want for temporary failures.
    console.error(`[stripe webhook] Failed to handle ${event.type} ${event.id}:`, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
