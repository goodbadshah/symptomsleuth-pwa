"use client";

import { useState } from "react";
import { useInView, entryStyle } from "@/hooks/useInView";

interface Props {
  conditions: string[];
  onContinue: (optIn: boolean) => void;
  onBack: () => void;
}

export default function CommunityOptIn({ conditions, onContinue, onBack }: Props) {
  const [optIn, setOptIn] = useState(true);

  const { ref: dataRef, inView: dataVisible } = useInView();
  const { ref: toggleRef, inView: toggleVisible } = useInView();

  const conditionLabel =
    conditions.length === 1
      ? conditions[0]
      : conditions.slice(0, 2).join(" & ") + (conditions.length > 2 ? "…" : "");

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 pt-12 pb-8">
      {/* Header */}
      <div className="mb-8">
        {/* Eyebrow pill */}
        <span
          className="inline-flex items-center rounded-full mb-4"
          style={{
            padding: "2px 10px",
            fontSize: "10px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            backgroundColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Step 3 of 4
        </span>
        <h1
          className="text-3xl leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          Help others living with{" "}
          <span style={{ color: "var(--accent)" }}>{conditionLabel}</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your logs anonymously contribute to a shared pattern library - helping
          researchers and other patients spot trends over time.
        </p>
      </div>

      {/* Double-Bezel: data transparency card */}
      <div
        ref={dataRef as React.RefObject<HTMLDivElement>}
        className="mb-4"
        style={{
          ...entryStyle(dataVisible, 0),
          padding: "6px",
          borderRadius: "1.25rem",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
          backgroundColor: "rgba(255,255,255,0.6)",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
            borderRadius: "0.875rem",
            padding: "16px 16px 14px",
          }}
        >
          {/* Section label */}
          <span
            style={{
              display: "block",
              fontSize: "10px",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            What&rsquo;s shared
          </span>

          {/* Dot list */}
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[
              "Symptom names & severity",
              "Sleep, stress & exercise data",
              "Week of year - never exact dates",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2"
                style={{
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span
                  style={{
                    marginTop: "7px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div
            style={{
              margin: "12px 0",
              borderTop: "1px solid var(--border)",
            }}
          />

          {/* Privacy statement */}
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: "1.5",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Your identity, notes, timestamps, and device details are{" "}
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              never included
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Double-Bezel: toggle card */}
      <div
        ref={toggleRef as React.RefObject<HTMLDivElement>}
        className="mb-8"
        style={{
          ...entryStyle(toggleVisible, 1),
          padding: "6px",
          borderRadius: "1.25rem",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
          backgroundColor: "rgba(255,255,255,0.6)",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
            borderRadius: "0.875rem",
            padding: "14px 16px",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-base font-medium"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                Contribute anonymous data
              </p>
              <p
                className="text-sm mt-0.5"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                Adjustable anytime in settings
              </p>
            </div>
            <button
              role="switch"
              aria-checked={optIn}
              onClick={() => setOptIn((v) => !v)}
              className="relative flex-shrink-0 tap-feedback"
              style={{
                width: "48px",
                height: "24px",
                padding: 0,
                backgroundColor: optIn ? "var(--accent)" : "var(--border)",
                borderRadius: "12px",
                transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white"
                style={{
                  left: 0,
                  borderRadius: "50%",
                  transform: optIn ? "translateX(26px)" : "translateX(2px)",
                  transition: "transform 200ms cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: "var(--shadow)",
                }}
                aria-hidden="true"
              />
              <span className="sr-only">{optIn ? "On" : "Off"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Footer */}
      <div className="flex flex-col gap-3">
        {/* Continue - Button-in-Button */}
        <button
          onClick={() => onContinue(optIn)}
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

        <button
          onClick={onBack}
          className="w-full h-10 text-sm tap-feedback"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
