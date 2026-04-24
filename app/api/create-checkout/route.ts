import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

type Plan = "monthly" | "annual" | "lifetime";

const PRICE_IDS: Record<Plan, string | undefined> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID,
  lifetime: process.env.STRIPE_LIFETIME_PRICE_ID,
};

const TRIAL_DAYS: Record<"monthly" | "annual", number> = {
  monthly: 7,
  annual: 14,
};

interface RequestBody {
  plan: Plan;
  email?: string;
  customerId?: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan, email, customerId } = body;

  if (plan !== "monthly" && plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing price id for plan: ${plan}` },
      { status: 500 },
    );
  }

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;
  const successUrl = `${origin}/payment-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/upgrade`;

  try {
    const params: Stripe.Checkout.SessionCreateParams =
      plan === "lifetime"
        ? {
            mode: "payment",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            ...(customerId ? { customer: customerId } : email ? { customer_email: email } : {}),
          }
        : {
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: { trial_period_days: TRIAL_DAYS[plan] },
            success_url: successUrl,
            cancel_url: cancelUrl,
            ...(customerId ? { customer: customerId } : email ? { customer_email: email } : {}),
          };

    const session = await stripe.checkout.sessions.create(params);

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session missing url" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg =
      err instanceof Stripe.errors.StripeError ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
