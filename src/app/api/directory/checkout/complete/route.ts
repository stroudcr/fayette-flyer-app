import { NextResponse, type NextRequest } from "next/server";
import { fulfillCheckout } from "@/lib/guide/fulfillment";
import { startSession } from "@/lib/guide/session";
import { stripe } from "@/lib/guide/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout sends owners here after paying. The webhook is the source
 * of truth, but we also record the payment here (idempotently) so the owner
 * lands on a ready dashboard, signed in, even if the webhook is a few seconds behind.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id") ?? "";
  const manage = new URL("/directory/manage", request.nextUrl.origin);

  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.redirect(manage);
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const listing = await fulfillCheckout(session);
    if (listing && listing.status !== "draft") {
      await startSession(listing.owner_email);
      manage.searchParams.set("welcome", listing.id);
    } else {
      manage.searchParams.set("checkout", "processing");
    }
  } catch (error) {
    console.error("[guide checkout] Could not finish checkout:", error);
    manage.searchParams.set("checkout", "processing");
  }
  return NextResponse.redirect(manage);
}
