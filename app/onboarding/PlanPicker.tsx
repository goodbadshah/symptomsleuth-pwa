"use client";

import { useAppState } from "@/app/providers";
import type { Symptom } from "@/app/providers";

interface Props {
  selectedPlan: "monthly" | "annual" | "lifetime";
  onSelectPlan: (plan: "monthly" | "annual" | "lifetime") => void;
  onContinue: () => void;
  onBack: () => void;
  conditions: string[];
  symptoms: Symptom[];
  communityOptIn: boolean;
}

const PLANS = [
  {
    id: "annual" as const,
    label: "Annual",
    price: "$39.99",
    period: "/year",
    star: false,
    sub: "Just $3.33/month",
    badge: "14-day free trial",
    badgeAccent: true,
    trialDays: 14,
  },
  {
    id: "monthly" as const,
    label: "Monthly",
    price: "$9.99",
    period: "/month",
    star: false,
    sub: "Billed monthly",
    badge: "7-day free trial",
    badgeAccent: false,
    trialDays: 7,
  },
  {
    id: "lifetime" as const,
    label: "Lifetime",
    price: "$79.99",
    period: "one-time",
    star: true,
    sub: "No renewal ever.",
    badge: "Best value",
    badgeAccent: true,
    trialDays: 0,
  },
];

export default function PlanPicker({
  selectedPlan,
  onSelectPlan,
  onContinue,
  onBack,
  conditions,
  symptoms,
  communityOptIn,
}: Props) {
  const { dispatch } = useAppState();

  function handleContinue() {
    // Persist profile data collected during onboarding before proceeding to card step
    dispatch({ type: "SET_CONDITIONS", payload: conditions });
    dispatch({ type: "SET_SYMPTOMS", payload: symptoms });
    dispatch({ type: "SET_COMMUNITY_OPT_IN", payload: communityOptIn });
    onContinue();
  }

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
          <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm">Back</span>
      </button>

      {/* Heading */}
      <div className="mb-10">
        <h1
          className="text-4xl leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          You&apos;re ready.
        </h1>
        <p
          className="text-xl leading-snug"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)", fontWeight: 400 }}
        >
          Annual members get double the trial - 14 days free.
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col" style={{ gap: "12px", marginBottom: "32px" }}>
        {PLANS.map((plan) => {
          const selected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className="w-full text-left"
              style={{
                position: "relative",
                padding: "6px",
                borderRadius: "1.25rem",
                boxShadow: selected
                  ? "0 0 0 2px var(--accent)"
                  : "0 0 0 1px rgba(0,0,0,0.06)",
                backgroundColor: selected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "box-shadow 150ms ease, background-color 150ms ease, opacity 150ms ease",
                opacity: selected ? 1 : 0.72,
              }}
            >
              {plan.star && (
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
              )}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
                  borderRadius: "0.875rem",
                  padding: "14px 18px 16px",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center"
                        style={{
                          padding: "3px 10px",
                          fontSize: "10px",
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          borderRadius: "1.25rem",
                          backgroundColor: plan.badgeAccent ? "rgba(45,106,79,0.08)" : "rgba(0,0,0,0.05)",
                          color: plan.badgeAccent ? "var(--accent)" : "var(--text-secondary)",
                          border: plan.badgeAccent ? "1px solid rgba(45,106,79,0.18)" : "1px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                    <p
                      className="text-base font-medium"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                    >
                      {plan.label}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {plan.sub}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span
                      className="text-2xl"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 400 }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {plan.period}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* CTA */}
      <div>
        <button
          onClick={handleContinue}
          className="group w-full flex items-center justify-between px-5 tap-feedback"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="text-sm font-medium">Continue</span>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px"
            style={{
              backgroundColor: "rgba(0,0,0,0.12)",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <p
          className="text-xs text-center mt-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {selectedPlan === "lifetime"
            ? "One-time payment. No subscription, no renewal."
            : <>No charge today. You&apos;ll only be billed after your{" "}{PLANS.find((p) => p.id === selectedPlan)?.trialDays}-day free trial. Cancel anytime.</>}
        </p>
      </div>
    </div>
  );
}
