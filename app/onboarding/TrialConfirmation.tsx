"use client";

import { useInView, entryStyle } from "@/hooks/useInView";
import { motion } from "framer-motion";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const INCLUDED = [
  "Full symptom logging for every tracked condition",
  "Community patterns for matched conditions",
  "AI Sleuth once you've logged 14 days",
  "Doctor-ready reports",
];

export default function TrialConfirmation({ onContinue, onBack }: Props) {
  const { ref, inView } = useInView();

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 pt-16 pb-10 relative">
      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-10 right-5 flex items-center justify-center w-10 h-10 rounded-full tap-feedback"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <polyline points="10,3 5,8 10,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Heading */}
      <div className="mb-10" ref={ref as React.RefObject<HTMLDivElement>} style={entryStyle(inView, 0)}>
        <h1
          className="text-4xl leading-tight mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        >
          You&apos;re ready.
        </h1>
        <p
          className="text-xl leading-snug"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-secondary)",
            fontWeight: 400,
          }}
        >
          Pick a plan to start your free trial.
        </p>
      </div>

      {/* What's included */}
      <ul className="flex flex-col gap-3 mb-8" style={entryStyle(inView, 1)}>
        {INCLUDED.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                marginTop: "9px",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex-1 md:flex-none md:mt-8" />

      {/* CTA */}
      <motion.button
        onClick={onContinue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group w-full relative flex items-center justify-center px-5 shadow-[0_4px_14px_rgba(45,106,79,0.2)] tap-feedback"
        style={{
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: "var(--accent)",
          color: "#ffffff",
          fontFamily: "var(--font-body)",
          border: "none",
          cursor: "pointer",
          transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span className="text-sm font-medium">Choose your plan</span>
        <span
          className="absolute right-5 w-7 h-7 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
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
      </motion.button>

      <p className="text-xs text-center mt-4" style={{ color: "var(--text-secondary)" }}>
        No charge today. Cancel anytime during your trial.
      </p>
    </div>
  );
}
