"use client";

import { Suspense, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/app/providers";
import { motion } from "framer-motion";

type Plan = "annual" | "monthly" | "lifetime";

function UpgradeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, dispatch } = useAppState();
  const [submitting, setSubmitting] = useState<Plan | null>(null);
  const errorMsg: string | null = null;
  const missingAccount = params.get("missing") === "1";

  function handleSelect(plan: Plan) {
    if (submitting) return;
    setSubmitting(plan);
    // Starting a new plan resets any stale post-payment flag from a prior
    // incomplete run. The flag gets flipped back on after this payment succeeds.
    if (state.profile.awaitingAccountSetup) {
      dispatch({ type: "SET_AWAITING_ACCOUNT_SETUP", payload: false });
    }
    router.push(`/welcome?plan=${plan}`);
  }

  return (
    <div style={{ padding: "32px 20px 48px" }}>
      {missingAccount && (
        <div
          role="status"
          style={{
            marginBottom: 20,
            padding: "12px 14px",
            borderRadius: "0.875rem",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          No account found. Start your free trial below.
        </div>
      )}
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-1"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          padding: 0,
        }}
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

      {/* Hero */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 12px",
          lineHeight: 1.1,
        }}
      >
        Unlock SymptomSleuth.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "15px",
          color: "var(--text-secondary)",
          margin: "0 0 32px",
          lineHeight: 1.5,
        }}
      >
        Sleuth AI, full timeline, doctor reports, and community insights.
      </p>

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* ── Annual card (dominant) ────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full">
          <AnnualCard
            onSelect={() => handleSelect("annual")}
            submitting={submitting === "annual"}
            disabled={submitting !== null}
          />
        </div>

        {/* ── Monthly card (recessive) ──────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full">
          <MonthlyCard
            onSelect={() => handleSelect("monthly")}
            submitting={submitting === "monthly"}
            disabled={submitting !== null}
          />
        </div>

        {/* ── Lifetime card (tertiary, best value) ──────────────────── */}
        <div className="flex-1 flex flex-col h-full">
          <LifetimeCard
            onSelect={() => handleSelect("lifetime")}
            submitting={submitting === "lifetime"}
            disabled={submitting !== null}
          />
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "#C8472F",
            textAlign: "center",
            margin: "20px 0 0",
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Trust line */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          textAlign: "center",
          marginTop: 28,
          lineHeight: 1.5,
        }}
      >
        Cancel anytime. Your data is always yours.
      </p>
    </div>
  );
}

// ── Annual card ──────────────────────────────────────────────────────────────

function AnnualCard({
  onSelect,
  submitting,
  disabled,
}: {
  onSelect: () => void;
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        position: "relative",
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--accent)",
      }}
    >
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: "var(--accent)",
          borderRadius: "0.875rem",
          padding: "20px 20px 18px",
          color: "#ffffff",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            margin: "0 0 6px",
          }}
        >
          Annual
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            $39.99
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            / year
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.8)",
            margin: "0 0 14px",
          }}
        >
          That&apos;s just $3.33/month
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 18px",
          }}
        >
          14-day free trial included
        </p>

        <motion.button
          onClick={onSelect}
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.02 }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          className="group mt-auto"
          style={{
            width: "100%",
            minHeight: "56px",
            padding: "14px 20px",
            borderRadius: "1.25rem",
            backgroundColor: "#ffffff",
            color: "var(--accent)",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "opacity 150ms ease",
            opacity: disabled && !submitting ? 0.5 : 1,
          }}
        >
          <span>{submitting ? "Starting checkout…" : "Start Free Trial"}</span>
          <span
            className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "rgba(45,106,79,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

// ── Monthly card ─────────────────────────────────────────────────────────────

function MonthlyCard({
  onSelect,
  submitting,
  disabled,
}: {
  onSelect: () => void;
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
      }}
    >
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          padding: "20px 20px 18px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            color: "var(--text-secondary)",
            margin: "0 0 6px",
          }}
        >
          Monthly
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            $9.99
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            / month
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            margin: "0 0 14px",
          }}
        >
          Cancel anytime
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: "0 0 18px",
          }}
        >
          7-day free trial included
        </p>

        <motion.button
          onClick={onSelect}
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.02 }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          className="mt-auto"
          style={{
            width: "100%",
            minHeight: "56px",
            padding: "14px 20px",
            borderRadius: "1.25rem",
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 150ms ease",
            opacity: disabled && !submitting ? 0.5 : 1,
          }}
        >
          {submitting ? "Starting checkout…" : "Try Monthly"}
        </motion.button>
      </div>
    </div>
  );
}

// ── Lifetime card (tertiary, best value) ─────────────────────────────────────

function LifetimeCard({
  onSelect,
  submitting,
  disabled,
}: {
  onSelect: () => void;
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        position: "relative",
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1.5px var(--accent)",
        backgroundColor: "var(--bezel-outer-bg)",
      }}
    >
      {/* Star decoration - floats above card, sage circle with filled star */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-11px",
          right: "14px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 4px rgba(45,106,79,0.30)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.9 5.87L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.4L12 2z"
            fill="#ffffff"
          />
        </svg>
      </span>

      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          padding: "20px 20px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 500,
              color: "var(--accent)",
              margin: 0,
            }}
          >
            Lifetime
          </p>
          <span
            style={{
              padding: "2px 8px",
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              borderRadius: "999px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
            }}
          >
            Best Value
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            $79.99
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            one-time
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            margin: "0 0 14px",
          }}
        >
          Yours forever
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: "0 0 18px",
          }}
        >
          Pay once. Never expires.
        </p>

        <motion.button
          onClick={onSelect}
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.02 }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          className="group mt-auto"
          style={{
            width: "100%",
            minHeight: "56px",
            padding: "14px 20px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "opacity 150ms ease",
            opacity: disabled && !submitting ? 0.5 : 1,
          }}
        >
          <span>{submitting ? "Starting checkout…" : "Get Lifetime Access"}</span>
          <span
            className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <>
      <AppHeader showStreak={false} />
      <div
        className="mx-auto w-full max-w-[480px] md:max-w-[960px]"
        style={{
          minHeight: "100dvh",
        }}
      >
        <Suspense>
          <UpgradeContent />
        </Suspense>
      </div>
    </>
  );
}
