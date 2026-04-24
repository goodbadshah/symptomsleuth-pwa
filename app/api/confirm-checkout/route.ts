import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

interface RequestBody {
  sessionId: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sessionId } = body;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch (err) {
    const msg =
      err instanceof Stripe.errors.StripeError ? err.message : "Failed to retrieve session";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const email =
    session.customer_details?.email ??
    (typeof session.customer === "object" && session.customer && "email" in session.customer
      ? (session.customer.email as string | null) ?? null
      : null);

  if (session.mode === "payment") {
    // Lifetime one-time purchase
    const paid = session.payment_status === "paid";
    if (!paid) {
      return NextResponse.json({ error: "Payment not complete" }, { status: 400 });
    }
    return NextResponse.json({
      plan: "lifetime" as const,
      customerId,
      email,
    });
  }

  if (session.mode === "subscription") {
    const sub = session.subscription as Stripe.Subscription | null;
    if (!sub) {
      return NextResponse.json({ error: "Subscription missing on session" }, { status: 400 });
    }
    const item = sub.items.data[0];
    const priceId = item?.price.id;
    const plan: "monthly" | "annual" =
      priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? "annual" : "monthly";
    const trialEnd = sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null;
    const periodEndSeconds = item?.current_period_end;
    const currentPeriodEnd = periodEndSeconds
      ? new Date(periodEndSeconds * 1000).toISOString()
      : new Date(Date.now()).toISOString();
    return NextResponse.json({
      plan,
      customerId,
      email,
      subscriptionId: sub.id,
      trialEndsAt: trialEnd,
      expiresAt: currentPeriodEnd,
    });
  }

  return NextResponse.json({ error: "Unsupported session mode" }, { status: 400 });
}
