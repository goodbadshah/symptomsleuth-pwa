import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  // Inline card collection means activation is driven by the client calling
  // /api/activate-plan after a successful confirm. This webhook no longer
  // provisions profiles; it only handles post-activation subscription state.
  switch (event.type) {
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("profiles")
          .update({
            premium_type: "none",
            premium_expires_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
      }
      break;
    }

    case "invoice.payment_failed": {
      // Stripe dunning will retry; in-app retention messaging reads current
      // subscription state directly from the profile.
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
