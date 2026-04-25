import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

type Plan = "monthly" | "annual" | "lifetime";

interface RequestBody {
  plan: Plan;
}

// Lifetime price. Must match Stripe dashboard; duplicated here so the client
// doesn't need to know the amount in advance.
const LIFETIME_AMOUNT_CENTS = 7999;
const LIFETIME_CURRENCY = "usd";

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan } = body;
  if (plan !== "monthly" && plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    if (plan === "lifetime") {
      const intent = await stripe.paymentIntents.create({
        amount: LIFETIME_AMOUNT_CENTS,
        currency: LIFETIME_CURRENCY,
        automatic_payment_methods: { enabled: true },
      });
      return NextResponse.json({
        clientSecret: intent.client_secret,
        intentType: "payment" as const,
      });
    }

    // Annual / Monthly - SetupIntent saves the payment method for the
    // subscription we create in /api/activate-plan. No charge happens here;
    // Stripe bills automatically after the trial window closes.
    const intent = await stripe.setupIntents.create({
      usage: "off_session",
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({
      clientSecret: intent.client_secret,
      intentType: "setup" as const,
    });
  } catch (err) {
    const msg =
      err instanceof Stripe.errors.StripeError ? err.message : "Failed to create intent";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
