import "server-only";
import Stripe from "stripe";
import { env } from "./env";
import type { Plan } from "./content";

let client: Stripe | null = null;

export function stripe(): Stripe {
  client ??= new Stripe(env.stripeSecretKey());
  return client;
}

/** Prices are found by lookup key, so the same code works in test and live mode. */
export const PRICE_LOOKUP_KEYS: Record<Plan, string> = {
  monthly: "ff_guide_featured_monthly",
  yearly: "ff_guide_featured_yearly",
};

/** Labels guide checkouts in the Stripe Dashboard. */
const INTEGRATION_IDENTIFIER = "ff-guide-featured-qkzwmtrb";

export async function priceIdFor(plan: Plan): Promise<string> {
  const prices = await stripe().prices.list({ lookup_keys: [PRICE_LOOKUP_KEYS[plan]], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) throw new Error(`No active Stripe price with lookup key ${PRICE_LOOKUP_KEYS[plan]}`);
  return price.id;
}

export function planFromPrice(price: Stripe.Price | string | null | undefined): Plan | null {
  if (!price || typeof price === "string") return null;
  if (price.lookup_key === PRICE_LOOKUP_KEYS.monthly) return "monthly";
  if (price.lookup_key === PRICE_LOOKUP_KEYS.yearly) return "yearly";
  return price.recurring?.interval === "year" ? "yearly" : price.recurring?.interval === "month" ? "monthly" : null;
}

export async function createCheckoutSession(input: {
  listingId: string;
  businessName: string;
  plan: Plan;
  email: string;
  customerId: string | null;
  origin: string;
}) {
  const price = await priceIdFor(input.plan);
  return stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    ...(input.customerId ? { customer: input.customerId } : { customer_email: input.email }),
    client_reference_id: input.listingId,
    metadata: { app: "fayette-flyer-guide", listing_id: input.listingId },
    subscription_data: {
      description: `Featured listing: ${input.businessName}`,
      metadata: { app: "fayette-flyer-guide", listing_id: input.listingId },
    },
    allow_promotion_codes: true,
    success_url: `${input.origin}/api/directory/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/directory/join?canceled=1`,
    integration_identifier: INTEGRATION_IDENTIFIER,
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration: env.stripePortalConfiguration(),
  });
}

export interface SubscriptionSummary {
  id: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan | null;
}

export function summarizeSubscription(subscription: Stripe.Subscription): SubscriptionSummary {
  const item = subscription.items.data[0];
  return {
    id: subscription.id,
    customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    status: subscription.status,
    currentPeriodEnd: item?.current_period_end ?? null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || Boolean(subscription.cancel_at),
    plan: planFromPrice(item?.price),
  };
}

export async function getSubscription(subscriptionId: string): Promise<SubscriptionSummary> {
  return summarizeSubscription(await stripe().subscriptions.retrieve(subscriptionId));
}

/**
 * Ends a subscription right away and refunds its most recent payment.
 * Used when a new listing is rejected. Returns what happened, for the admin.
 */
export async function cancelAndRefund(subscriptionId: string): Promise<{ refunded: boolean; message: string }> {
  const s = stripe();
  const subscription = await s.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== "canceled") await s.subscriptions.cancel(subscriptionId);

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const charges = await s.charges.list({ customer: customerId, limit: 10 });
  const paymentIntents = await paymentIntentsForSubscription(subscriptionId);
  const charge = charges.data.find(
    (c) =>
      c.paid &&
      !c.refunded &&
      typeof c.payment_intent === "string" &&
      paymentIntents.has(c.payment_intent)
  );
  if (!charge) return { refunded: false, message: "Subscription canceled. No refundable payment was found." };
  await s.refunds.create({ charge: charge.id, reason: "requested_by_customer" });
  return { refunded: true, message: `Subscription canceled and $${(charge.amount / 100).toFixed(2)} refunded.` };
}

/** PaymentIntent IDs paid on this subscription's invoices (most recent first). */
async function paymentIntentsForSubscription(subscriptionId: string): Promise<Set<string>> {
  const s = stripe();
  const ids = new Set<string>();
  const invoices = await s.invoices.list({ subscription: subscriptionId, limit: 5 });
  for (const invoice of invoices.data) {
    if (!invoice.id) continue;
    const payments = await s.invoicePayments.list({ invoice: invoice.id, status: "paid", limit: 10 });
    for (const p of payments.data) {
      const pi = p.payment.payment_intent;
      if (pi) ids.add(typeof pi === "string" ? pi : pi.id);
    }
  }
  return ids;
}

/**
 * Finds the subscription behind a charge, for refund, dispute and fraud
 * events: PaymentIntent -> invoice payments -> invoice -> parent subscription.
 */
export async function subscriptionForPaymentIntent(paymentIntentId: string | null): Promise<string | null> {
  if (!paymentIntentId) return null;
  const s = stripe();
  const payments = s.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    status: "paid",
    limit: 10,
  });
  for await (const payment of payments) {
    const invoiceId = typeof payment.invoice === "string" ? payment.invoice : payment.invoice?.id;
    if (!invoiceId) continue;
    const invoice = await s.invoices.retrieve(invoiceId);
    const subscription = invoice.parent?.type === "subscription_details" ? invoice.parent.subscription_details?.subscription : null;
    if (subscription) return typeof subscription === "string" ? subscription : subscription.id;
  }
  return null;
}

export async function paymentIntentForCharge(chargeId: string): Promise<string | null> {
  const charge = await stripe().charges.retrieve(chargeId);
  return typeof charge.payment_intent === "string" ? charge.payment_intent : (charge.payment_intent?.id ?? null);
}

export type { Stripe };
