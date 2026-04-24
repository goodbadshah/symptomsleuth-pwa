"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/app/providers";

type Status = "loading" | "success" | "error";

interface ConfirmResponse {
  plan: "monthly" | "annual" | "lifetime";
  customerId: string | null;
  email: string | null;
  subscriptionId?: string;
  trialEndsAt?: string | null;
  expiresAt?: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { dispatch } = useAppState();

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setErrorMsg("Missing session id.");
      setStatus("error");
      return;
    }

    fetch("/api/confirm-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Confirmation failed");
        }
        return res.json() as Promise<ConfirmResponse>;
      })
      .then((data) => {
        if (data.plan === "lifetime") {
          dispatch({
            type: "SET_LIFETIME",
            payload: {
              customerId: data.customerId ?? "",
              email: data.email ?? "",
            },
          });
        } else {
          dispatch({
            type: "SET_TRIAL_DATA",
            payload: {
              subscriptionId: data.subscriptionId ?? "",
              customerId: data.customerId ?? "",
              email: data.email ?? "",
              trialEndsAt: data.trialEndsAt ?? data.expiresAt ?? new Date().toISOString(),
              plan: data.plan,
            },
          });
        }
        setStatus("success");
        setTimeout(() => router.replace("/log"), 1500);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] px-5"
      style={{ backgroundColor: "var(--bg-primary)", maxWidth: "480px", margin: "0 auto" }}
    >
      {status === "loading" && (
        <>
          <span
            className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-6"
            style={{ color: "var(--accent)" }}
            aria-label="Confirming purchase"
          />
          <p
            className="text-xl text-center"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-secondary)",
              fontWeight: 400,
            }}
          >
            Confirming your purchase…
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
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            You&apos;re in.
          </h1>
          <p
            className="text-base text-center"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
          >
            Opening your log…
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <p
            className="text-base text-center mb-6"
            style={{
              color: "var(--color-error, #C8472F)",
              fontFamily: "var(--font-body)",
            }}
          >
            {errorMsg}
          </p>
          <button
            onClick={() => router.replace("/upgrade")}
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
            Back to plans
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
