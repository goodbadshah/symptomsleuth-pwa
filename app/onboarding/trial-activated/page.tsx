"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/app/providers";
import AppHeader from "@/components/layout/AppHeader";

function TrialActivatedContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { dispatch } = useAppState();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const setupIntentId = params.get("setup_intent");
    const plan = params.get("plan") as "monthly" | "annual" | null;
    const email = params.get("email");

    if (!setupIntentId || !plan || !email) {
      setErrorMsg("Missing activation parameters. Please contact support.");
      setStatus("error");
      return;
    }

    fetch("/api/activate-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupIntentId, plan, email }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? "Activation failed");
        }
        return res.json() as Promise<{
          subscriptionId: string;
          customerId: string;
          trialEndsAt: string;
        }>;
      })
      .then(({ subscriptionId, customerId, trialEndsAt }) => {
        dispatch({
          type: "SET_TRIAL_DATA",
          payload: {
            subscriptionId,
            customerId,
            email,
            trialEndsAt,
            plan,
          },
        });
        setStatus("success");
        setTimeout(() => router.replace("/log"), 1500);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AppHeader showStreak={false} />
      <div
        className="flex flex-col items-center justify-center min-h-[100dvh] px-5"
        style={{ backgroundColor: "var(--bg-primary)", maxWidth: "480px", margin: "0 auto" }}
      >
      {status === "loading" && (
        <>
          <span
            className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-6"
            style={{ color: "var(--accent)" }}
            aria-label="Activating trial"
          />
          <p
            className="text-xl text-center"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)", fontWeight: 400 }}
          >
            Setting up your trial…
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <span
            className="flex items-center justify-center w-14 h-14 rounded-full mb-6"
            style={{ backgroundColor: "var(--accent-light)" }}
            aria-hidden="true"
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <polyline
                points="2,10 8.5,17 22,2"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1
            className="text-4xl mb-3 text-center"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
          >
            You&apos;re all set.
          </h1>
          <p
            className="text-xl text-center"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)", fontWeight: 400 }}
          >
            Your {params.get("plan") === "annual" ? "14" : "7"}-day trial has started.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <p
            className="text-base text-center mb-6"
            style={{ color: "var(--color-error, #e53e3e)", fontFamily: "var(--font-body)" }}
          >
            {errorMsg}
          </p>
          <button
            onClick={() => router.replace("/onboarding")}
            style={{
              padding: "12px 24px",
              borderRadius: "0.875rem",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to onboarding
          </button>
        </>
      )}
      </div>
    </>
  );
}

export default function TrialActivatedPage() {
  return (
    <Suspense>
      <TrialActivatedContent />
    </Suspense>
  );
}
