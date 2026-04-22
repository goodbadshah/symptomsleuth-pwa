"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Props {
  plan: "monthly" | "annual";
  onBack: () => void;
}

// ── Inner form (needs to be a child of <Elements>) ──────────────────────────

const TRIAL_DAYS: Record<"monthly" | "annual", number> = {
  monthly: 7,
  annual: 14,
};

interface FormProps {
  plan: "monthly" | "annual";
  clientSecret: string;
}

function CardForm({ plan, clientSecret }: FormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const returnUrl = new URL("/onboarding/trial-activated", window.location.origin);
    returnUrl.searchParams.set("plan", plan);
    returnUrl.searchParams.set("email", emailTrim);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: returnUrl.toString(),
        payment_method_data: {
          billing_details: { email: emailTrim },
        },
      },
    });

    // confirmSetup only returns here on error - success redirects away
    setErrorMsg(error.message ?? "Something went wrong. Please try again.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email */}
      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-sm mb-2"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full"
          style={{
            height: "48px",
            borderRadius: "0.75rem",
            border: "1px solid rgba(0,0,0,0.1)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            padding: "0 14px",
            outline: "none",
          }}
        />
      </div>

      {/* Stripe PaymentElement */}
      <div className="mb-8">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { email: "never" } },
          }}
        />
      </div>

      {errorMsg && (
        <p
          className="text-sm mb-4 text-center"
          style={{ color: "var(--color-error, #e53e3e)" }}
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="group w-full flex items-center justify-between px-5"
        style={{
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: submitting ? "var(--accent-muted, #a0aec0)" : "var(--accent)",
          color: "#ffffff",
          fontFamily: "var(--font-body)",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background-color 150ms ease",
        }}
      >
        <span className="text-sm font-medium">
          {submitting ? "Starting trial…" : "Start My Free Trial"}
        </span>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.12)", flexShrink: 0 }}
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline
              points="4,2 8,6 4,10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <p className="text-xs text-center mt-4" style={{ color: "var(--text-secondary)" }}>
        No charge today. Your card will be billed after your {TRIAL_DAYS[plan]}-day trial ends.
        Cancel anytime before then.
      </p>
    </form>
  );
}

// ── Outer shell - fetches SetupIntent, renders <Elements> ───────────────────

export default function CardCollection({ plan, onBack }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/create-setup-intent", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Server error");
        const data = await res.json() as { clientSecret: string };
        setClientSecret(data.clientSecret);
      })
      .catch(() => setFetchError("Couldn't load payment form. Please try again."));
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 pt-16 pb-10">
      {/* Back */}
      <button
        onClick={onBack}
        className="self-start mb-10 flex items-center gap-1"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
        aria-label="Back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polyline
            points="10,3 5,8 10,13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm">Back</span>
      </button>

      {/* Heading */}
      <div className="mb-8">
        <h1
          className="text-4xl leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          Add a card.
        </h1>
        <p
          className="text-xl leading-snug"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)", fontWeight: 400 }}
        >
          We&apos;ll only charge you after your free trial ends.
        </p>
      </div>

      {/* Double-bezel card form container */}
      <div
        style={{
          padding: "6px",
          borderRadius: "1.25rem",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
          backgroundColor: "rgba(255,255,255,0.6)",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
            borderRadius: "0.875rem",
            padding: "20px 18px",
          }}
        >
          {fetchError ? (
            <p className="text-sm text-center" style={{ color: "var(--color-error, #e53e3e)" }}>
              {fetchError}
            </p>
          ) : !clientSecret ? (
            <div className="flex justify-center py-8">
              <span
                className="inline-block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin"
                style={{ color: "var(--accent)" }}
                aria-label="Loading payment form"
              />
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <CardForm plan={plan} clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>

      {/* Trust line */}
      <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
        Secured by Stripe. We never store your card details.
      </p>
    </div>
  );
}
