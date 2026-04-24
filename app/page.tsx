"use client";

import Link from "next/link";
import { useInView, entryStyle } from "@/hooks/useInView";
import AppHeader from "@/components/layout/AppHeader";

const VALUE_PROPS = [
  {
    label: "Quick daily log",
    detail: "Tap through your symptoms in seconds. Works offline.",
  },
  {
    label: "Your patterns over time",
    detail: "Timeline chart shows severity trends and streak data.",
  },
  {
    label: "Community intelligence",
    detail:
      "See how your patterns compare to thousands with the same condition. Anonymous. Opt-in.",
  },
  {
    label: "Doctor-ready reports",
    detail: "Generate a structured clinical summary for your next appointment.",
  },
];

export default function LandingPage() {
  const { ref: valueRef, inView: valueVisible } = useInView();
  const { ref: privacyRef, inView: privacyVisible } = useInView();
  const { ref: pricingRef, inView: pricingVisible } = useInView();

  return (
    <>
      <AppHeader showStreak={false} />
      <main
        className="flex flex-col mx-auto px-5"
      style={{
        maxWidth: "480px",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Hero - always above fold ── */}
      <section className="flex flex-col justify-center pt-10 pb-10">
        <h1
          className="leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.4375rem, 7.25vw, 2.25rem)" }}
        >
          See what your symptoms
          <br />
          are saying.
        </h1>

        <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          Built for chronic conditions: Migraines, IBS, fibromyalgia, diabetes, PCOS, and more.
        </p>

        {/* CTA - Button-in-Button, always visible above fold */}
        <Link
          href="/onboarding"
          className="group flex items-center justify-between px-5 tap-feedback"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            textDecoration: "none",
          }}
        >
          <span className="text-base font-medium">Start free trial</span>
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
        </Link>

        <p
          className="text-sm text-center mt-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Optional sign-in. End-to-end encrypted. Only you can read your data.
        </p>
      </section>

      {/* ── Value props - scroll entry ── */}
      <section
        ref={valueRef as React.RefObject<HTMLElement>}
        className="py-10"
        style={{
          ...entryStyle(valueVisible, 0),
          borderTop: "1px solid var(--border)",
        }}
      >
        <ul className="flex flex-col gap-7">
          {VALUE_PROPS.map(({ label, detail }, index) => (
            <li
              key={label}
              className="flex flex-col gap-1"
              style={entryStyle(valueVisible, index)}
            >
              <span className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                {label}
              </span>
              <span className="text-base" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Privacy - scroll entry ── */}
      <section
        ref={privacyRef as React.RefObject<HTMLElement>}
        className="py-8"
        style={{
          ...entryStyle(privacyVisible, 0),
          borderTop: "1px solid var(--border)",
        }}
      >
        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your health data never leaves your device. We literally cannot see it,
          even if we wanted to. Anonymous community data is opt-in - symptom
          severity by week only, never your identity or notes.
        </p>
      </section>

      {/* ── Pricing - scroll entry ── */}
      <section
        ref={pricingRef as React.RefObject<HTMLElement>}
        className="py-8 mb-8"
        style={{
          ...entryStyle(pricingVisible, 0),
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          href="/onboarding"
          className="group flex items-center justify-between px-5 tap-feedback mb-6"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            textDecoration: "none",
          }}
        >
          <span className="text-base font-medium">Start free trial</span>
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
        </Link>

        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          14-day free trial on annual ($39.99/yr), or $9.99/month. Cancel anytime.
        </p>
      </section>
      </main>
    </>
  );
}
