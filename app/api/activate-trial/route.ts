import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const PRICE_IDS: Record<"monthly" | "annual", string> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID!,
};

const TRIAL_DAYS: Record<"monthly" | "annual", number> = {
  monthly: 7,
  annual: 14,
};

interface RequestBody {
  setupIntentId: string;
  plan: "monthly" | "annual";
  email: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { setupIntentId, plan, email } = body;

  if (!setupIntentId || !plan || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (plan !== "monthly" && plan !== "annual") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Retrieve the SetupIntent to get the confirmed payment method
  let setupIntent: Stripe.SetupIntent;
  try {
    setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
  } catch (err) {
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Failed to retrieve setup intent";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (setupIntent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment method not confirmed" }, { status: 400 });
  }

  const paymentMethodId = setupIntent.payment_method as string;

  // Create Stripe Customer
  let customer: Stripe.Customer;
  try {
    customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  } catch (err) {
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Failed to create customer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Create Subscription with plan-specific trial - card billed automatically after trial
  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PRICE_IDS[plan] }],
      trial_period_days: TRIAL_DAYS[plan],
      default_payment_method: paymentMethodId,
      expand: ["latest_invoice"],
    });
  } catch (err) {
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Failed to create subscription";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const trialEndsAt = new Date(subscription.trial_end! * 1000).toISOString();

  return NextResponse.json({
    subscriptionId: subscription.id,
    customerId: customer.id,
    trialEndsAt,
  });
}
