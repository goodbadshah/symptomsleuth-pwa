import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

type Plan = "monthly" | "annual" | "lifetime";

const TRIAL_DAYS: Record<"monthly" | "annual", number> = {
  monthly: 7,
  annual: 14,
};

const PRICE_IDS: Record<"monthly" | "annual", string | undefined> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID,
};

interface RequestBody {
  plan: Plan;
  intentId: string;
  email: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan, intentId, email } = body;
  const emailTrim = (email ?? "").trim().toLowerCase();

  if (plan !== "monthly" && plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!intentId) {
    return NextResponse.json({ error: "Missing intent id" }, { status: 400 });
  }
  if (!emailTrim.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    // ── Lifetime: verify the PaymentIntent succeeded and attach a Customer ──
    if (plan === "lifetime") {
      const intent = await stripe.paymentIntents.retrieve(intentId);
      if (intent.status !== "succeeded") {
        return NextResponse.json(
          { error: `Payment not complete (status: ${intent.status})` },
          { status: 400 },
        );
      }

      let customerId = typeof intent.customer === "string" ? intent.customer : intent.customer?.id;
      if (!customerId) {
        // Idempotency keys keyed on intentId so a retried request (mobile
        // network blip, double-submit) replays the cached response instead
        // of creating a duplicate customer or hitting Stripe's "PaymentMethod
        // previously used" error on a second attach.
        const customer = await stripe.customers.create(
          { email: emailTrim },
          { idempotencyKey: `customer:${intentId}` },
        );
        customerId = customer.id;
        if (typeof intent.payment_method === "string") {
          await stripe.paymentMethods.attach(
            intent.payment_method,
            { customer: customerId },
            { idempotencyKey: `pm-attach:${intentId}` },
          );
        }
        await stripe.paymentIntents.update(
          intentId,
          { customer: customerId },
          { idempotencyKey: `pi-update:${intentId}` },
        );
      }

      return NextResponse.json({
        plan: "lifetime" as const,
        customerId,
        email: emailTrim,
      });
    }

    // ── Annual / Monthly: create customer, attach payment method, start trial ──
    const setupIntent = await stripe.setupIntents.retrieve(intentId);
    if (setupIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Card setup not complete (status: ${setupIntent.status})` },
        { status: 400 },
      );
    }

    const paymentMethod =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;
    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method missing" }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing price id for plan: ${plan}` },
        { status: 500 },
      );
    }

    // Idempotency keys keyed on intentId. Without these, a retried POST
    // (mobile network blip, swipe-back, double-submit) attempts to attach
    // the same PaymentMethod to a second new Customer and Stripe rejects it
    // with "PaymentMethod previously used or detached, may not be used again."
    const customer = await stripe.customers.create(
      {
        email: emailTrim,
        payment_method: paymentMethod,
        invoice_settings: { default_payment_method: paymentMethod },
      },
      { idempotencyKey: `customer:${intentId}` },
    );

    const subscription = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        trial_period_days: TRIAL_DAYS[plan],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      },
      { idempotencyKey: `subscription:${intentId}` },
    );

    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : new Date(Date.now() + TRIAL_DAYS[plan] * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      plan,
      customerId: customer.id,
      subscriptionId: subscription.id,
      email: emailTrim,
      trialEndsAt,
    });
  } catch (err) {
    const msg =
      err instanceof Stripe.errors.StripeError ? err.message : "Failed to activate plan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
