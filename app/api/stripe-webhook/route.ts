import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // Fires once for every successful checkout. For `mode: 'subscription'`
      // (monthly/annual) the customer enters the trial window; for
      // `mode: 'payment'` (lifetime) the one-time charge has succeeded.
      // Client-side state is updated via the /payment-success redirect;
      // this handler exists for audit trail and future server-side persistence.
      break;
    }

    case "customer.subscription.deleted": {
      // Subscription cancelled or ended. Mark premium as expired in any
      // server-side record of the user if/when that layer exists.
      break;
    }

    case "invoice.payment_failed": {
      // Renewal charge failed. Stripe will retry per dunning config; this is
      // the hook for surfacing retention messaging in-app.
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
