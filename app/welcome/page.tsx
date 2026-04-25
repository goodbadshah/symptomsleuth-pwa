"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";
import { useAppState } from "@/app/providers";
import { migrateLocalData } from "@/utils/migrateLocalData";
import AppHeader from "@/components/layout/AppHeader";

type Plan = "monthly" | "annual" | "lifetime";
type IntentType = "setup" | "payment";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const PLAN_LABEL: Record<Plan, { name: string; price: string; sub: string; cta: string }> = {
  annual: {
    name: "Annual",
    price: "$39.99 / year",
    sub: "14-day free trial. No charge today.",
    cta: "Start free trial",
  },
  monthly: {
    name: "Monthly",
    price: "$9.99 / month",
    sub: "7-day free trial. No charge today.",
    cta: "Start free trial",
  },
  lifetime: {
    name: "Lifetime",
    price: "$79.99 one-time",
    sub: "Pay once. Never expires.",
    cta: "Pay $79.99",
  },
};

function WelcomeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, dispatch } = useAppState();
  const { profile } = state;

  const planParam = params.get("plan") as Plan | null;
  const plan: Plan | null =
    planParam === "annual" || planParam === "monthly" || planParam === "lifetime"
      ? planParam
      : null;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<IntentType | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  // State gate driven by `awaitingAccountSetup` (flipped to true by the
  // post-payment dispatch) rather than `premium.type`, which can be stale from
  // prior test sessions. supabaseLinked wins over everything - fully set up.
  const showPaymentForm =
    !profile.supabaseLinked && !profile.awaitingAccountSetup;
  const showAccountAuth =
    !profile.supabaseLinked && profile.awaitingAccountSetup;

  // Fetch the intent once plan is known and we're still in the payment state.
  useEffect(() => {
    if (!plan || !showPaymentForm) return;
    let cancelled = false;

    fetch("/api/create-plan-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Couldn't start checkout");
        }
        return res.json() as Promise<{ clientSecret: string; intentType: IntentType }>;
      })
      .then((data) => {
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        setIntentType(data.intentType);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIntentError(err instanceof Error ? err.message : "Couldn't start checkout");
      });

    return () => {
      cancelled = true;
    };
  }, [plan, showPaymentForm]);

  // Exit routes:
  //  - Fully linked → /log (nothing more to do here)
  //  - No plan in URL and nothing pending → back to plan picker
  useEffect(() => {
    if (profile.supabaseLinked) {
      router.replace("/log");
      return;
    }
    if (!plan && !profile.awaitingAccountSetup) {
      router.replace("/upgrade");
    }
  }, [plan, profile.supabaseLinked, profile.awaitingAccountSetup, router]);

  const elementsOptions: StripeElementsOptions | null = useMemo(
    () => (clientSecret ? { clientSecret, appearance: { theme: "stripe" } } : null),
    [clientSecret],
  );

  function handleActivated(data: ActivatedPayload) {
    if (data.plan === "lifetime") {
      dispatch({
        type: "SET_LIFETIME",
        payload: { customerId: data.customerId, email: data.email },
      });
    } else {
      dispatch({
        type: "SET_TRIAL_DATA",
        payload: {
          subscriptionId: data.subscriptionId,
          customerId: data.customerId,
          email: data.email,
          trialEndsAt: data.trialEndsAt,
          plan: data.plan,
        },
      });
    }
  }

  return (
    <>
      <AppHeader showStreak={false} />
      <div
        className="mx-auto"
        style={{
          maxWidth: "480px",
          minHeight: "100dvh",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex flex-col min-h-[100dvh] px-5 pt-16 pb-10">
          {showPaymentForm && plan && (
            <PaymentStep
              plan={plan}
              intentType={intentType}
              intentError={intentError}
              elementsOptions={elementsOptions}
              onActivated={handleActivated}
            />
          )}

          {showAccountAuth && <AccountAuth />}
        </div>
      </div>
    </>
  );
}

// ─── Payment step ─────────────────────────────────────────────────────────────

interface PaymentStepProps {
  plan: Plan;
  intentType: IntentType | null;
  intentError: string | null;
  elementsOptions: StripeElementsOptions | null;
  onActivated: (data: ActivatedPayload) => void;
}

function PaymentStep({ plan, intentType, intentError, elementsOptions, onActivated }: PaymentStepProps) {
  return (
    <>
      <div className="mb-8">
        <h1
          className="text-4xl leading-tight mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        >
          Add a card.
        </h1>
        <p
          className="text-xl leading-snug"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-secondary)",
            fontWeight: 400,
          }}
        >
          {plan === "lifetime"
            ? "One payment. Never expires."
            : "No charge today. Cancel anytime during your free trial."}
        </p>
      </div>

      <PlanSummaryCard plan={plan} />

      <div
        style={{
          padding: "6px",
          borderRadius: "1.25rem",
          boxShadow: "0 0 0 1px var(--bezel-ring)",
          backgroundColor: "var(--bezel-outer-bg)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            boxShadow: "var(--bezel-inset-shadow)",
            borderRadius: "0.875rem",
            padding: "20px 18px",
          }}
        >
          {intentError ? (
            <p
              className="text-sm text-center"
              style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
            >
              {intentError}
            </p>
          ) : !elementsOptions || !intentType ? (
            <div className="flex justify-center py-8">
              <span
                className="inline-block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin"
                style={{ color: "var(--accent)" }}
                aria-label="Loading payment form"
              />
            </div>
          ) : (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm plan={plan} intentType={intentType} onActivated={onActivated} />
            </Elements>
          )}
        </div>
      </div>

      <p
        className="text-xs text-center"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        Secured by Stripe. We never store your card details.
      </p>
    </>
  );
}

function PlanSummaryCard({ plan }: { plan: Plan }) {
  const meta = PLAN_LABEL[plan];
  return (
    <div
      style={{
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          padding: "18px 18px 14px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 500,
              color: "var(--text-secondary)",
              margin: "0 0 4px",
            }}
          >
            {meta.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            {meta.price}
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            margin: 0,
            textAlign: "right",
            maxWidth: 180,
            lineHeight: 1.4,
          }}
        >
          {meta.sub}
        </p>
      </div>
    </div>
  );
}

// ─── Payment form (runs inside <Elements>) ────────────────────────────────────

interface ActivatedPayload {
  plan: Plan;
  customerId: string;
  subscriptionId: string;
  email: string;
  trialEndsAt: string;
}

interface PaymentFormProps {
  plan: Plan;
  intentType: IntentType;
  onActivated: (data: ActivatedPayload) => void;
}

function PaymentForm({ plan, intentType, onActivated }: PaymentFormProps) {
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

    let intentId: string | undefined;
    if (intentType === "payment") {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/welcome?plan=${plan}`,
          payment_method_data: { billing_details: { email: emailTrim } },
        },
        redirect: "if_required",
      });
      if (result.error) {
        setErrorMsg(result.error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }
      intentId = result.paymentIntent?.id;
    } else {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/welcome?plan=${plan}`,
          payment_method_data: { billing_details: { email: emailTrim } },
        },
        redirect: "if_required",
      });
      if (result.error) {
        setErrorMsg(result.error.message ?? "Card setup failed. Please try again.");
        setSubmitting(false);
        return;
      }
      intentId = result.setupIntent?.id;
    }

    if (!intentId) {
      setErrorMsg("Payment confirmation incomplete. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/activate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, intentId, email: emailTrim }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Couldn't activate your plan.");
      }
      const data = (await res.json()) as Partial<ActivatedPayload> & { plan: Plan };
      onActivated({
        plan: data.plan,
        customerId: data.customerId ?? "",
        subscriptionId: data.subscriptionId ?? "",
        email: data.email ?? emailTrim,
        trialEndsAt: data.trialEndsAt ?? new Date().toISOString(),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't activate your plan.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label
          htmlFor="billing-email"
          className="block text-sm mb-2"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Email
        </label>
        <input
          id="billing-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
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

      <div className="mb-6">
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
          style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
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
          backgroundColor: submitting ? "var(--text-secondary)" : "var(--accent)",
          color: "#ffffff",
          fontFamily: "var(--font-body)",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background-color 150ms ease",
        }}
      >
        <span className="text-sm font-medium">
          {submitting ? "Processing…" : PLAN_LABEL[plan].cta}
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
    </form>
  );
}

// ─── Account auth step ────────────────────────────────────────────────────────

function AccountAuth() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const { profile } = state;

  const [mode, setMode] = useState<"idle" | "email">("idle");
  const [email, setEmail] = useState(profile.email ?? "");
  // `signin-error` → problem talking to Supabase before a session exists.
  // `migration-error` → signed in but saving local data to Supabase failed.
  // These use different copy so users see the correct reason.
  const [status, setStatus] = useState<
    "idle" | "signing-in" | "sent" | "migrating" | "signin-error" | "migration-error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If the user returns here after a magic-link redirect, Supabase will have
  // an active session - kick off migration immediately.
  useEffect(() => {
    if (!supabase || profile.supabaseLinked) return;
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data?.user;
      if (!authUser || cancelled) return;
      await runMigration(authUser.id);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runMigration(userId: string) {
    setStatus("migrating");
    setErrorMsg(null);
    const result = await migrateLocalData(userId, state);
    if (!result.ok) {
      setStatus("migration-error");
      setErrorMsg(result.error ?? null);
      return;
    }
    dispatch({ type: "SET_USER_ID", payload: userId });
    dispatch({ type: "SET_SUPABASE_LINKED", payload: true });
    dispatch({ type: "SET_AWAITING_ACCOUNT_SETUP", payload: false });
    router.replace("/log");
  }

  async function handleGoogle() {
    if (!supabase) {
      setStatus("signin-error");
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    setStatus("signing-in");
    setErrorMsg(null);
    // No query string on the redirect: Supabase's allowlist matcher silently
    // rejects URLs with queries and falls back to Site URL. The callback page
    // figures out where to route via Supabase profile + localStorage.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("signin-error");
      setErrorMsg(error.message || "Sign-in failed. Please try again.");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("signin-error");
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setStatus("signin-error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("signing-in");
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("signin-error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  async function handleRetry() {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await runMigration(data.user.id);
    } else {
      setStatus("idle");
      setErrorMsg(null);
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1
          className="text-4xl leading-tight mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        >
          Secure your data before we start.
        </h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Create your account so your symptom history syncs across devices and is never lost.
        </p>
      </div>

      {status === "migrating" ? (
        <div className="flex flex-col items-center gap-4 my-8">
          <span
            className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"
            style={{ color: "var(--accent)" }}
            aria-label="Saving your data"
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Saving your data…
          </p>
        </div>
      ) : status === "migration-error" ? (
        <div className="flex flex-col gap-4 mb-8">
          <p className="text-sm" style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}>
            We couldn&apos;t save your data. Please try again.
          </p>
          {errorMsg && (
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              {errorMsg}
            </p>
          )}
          <button
            onClick={handleRetry}
            style={{
              height: "52px",
              borderRadius: "1.25rem",
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      ) : status === "sent" ? (
        <div
          className="mb-8"
          style={{
            padding: "6px",
            borderRadius: "1.25rem",
            boxShadow: "0 0 0 1px var(--bezel-ring)",
            backgroundColor: "var(--bezel-outer-bg)",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              boxShadow: "var(--bezel-inset-shadow)",
              borderRadius: "0.875rem",
              padding: "18px 20px",
            }}
          >
            <p
              className="text-base mb-2"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
            >
              Check your email
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              We sent a link to {email}. Open it on this device to finish setting up your account.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleGoogle}
            disabled={status === "signing-in"}
            className="flex items-center justify-center gap-3 tap-feedback"
            style={{
              height: "52px",
              borderRadius: "1.25rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              cursor: status === "signing-in" ? "not-allowed" : "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium">Continue with Google</span>
          </button>

          {mode === "idle" ? (
            <button
              onClick={() => setMode("email")}
              className="flex items-center justify-center gap-3 tap-feedback"
              style={{
                height: "52px",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="1.75" y="3.75" width="14.5" height="10.5" rx="1.25" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 4.5 9 10l7-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">Set up with Email</span>
            </button>
          ) : (
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col gap-2"
              style={{
                padding: "6px",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <label htmlFor="welcome-email" className="sr-only">
                Email address
              </label>
              <input
                id="welcome-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com"
                disabled={status === "signing-in"}
                style={{
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "0.75rem",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={status === "signing-in"}
                style={{
                  height: "44px",
                  borderRadius: "0.75rem",
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: status === "signing-in" ? "not-allowed" : "pointer",
                }}
              >
                {status === "signing-in" ? "Sending magic link…" : "Send magic link"}
              </button>
            </form>
          )}
          {errorMsg && (
            <p
              className="text-xs text-center mt-1"
              style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
            >
              {errorMsg}
            </p>
          )}
        </div>
      )}

      <div className="flex-1" />

      <p
        className="text-xs text-center"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.6,
        }}
      >
        Your logs are encrypted. We cannot read them.
      </p>
    </>
  );
}

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeContent />
    </Suspense>
  );
}
