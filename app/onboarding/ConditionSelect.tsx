"use client";

import { useState } from "react";

const CONDITIONS = [
  "Migraine",
  "IBS",
  "Fibromyalgia",
  "Chronic Pain",
  "Anxiety",
  "Autoimmune",
  "PCOS",
  "Endometriosis",
  "Hypertension",
  "Obesity",
  "Periodontal Disease",
  "Depression",
  "Arthritis",
  "Type 2 Diabetes",
  "COPD",
  "Asthma",
  "Heart Disease",
  "Chronic Kidney Disease",
  "Cancer",
  "Dementia & Alzheimer's",
  "Stroke",
  "Osteoporosis",
  "Atrial Fibrillation",
  "Liver Disease",
  "Thyroid Disease",
  "IBD",
];

interface Props {
  onContinue: (conditions: string[]) => void;
}

export default function ConditionSelect({ onContinue }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState("");
  const [otherActive, setOtherActive] = useState(false);

  // ConditionSelect is always above the fold - no scroll-triggered animation needed.
  // Render buttons immediately visible and tappable.

  function toggle(condition: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      return next;
    });
  }

  function toggleOther() {
    setOtherActive((v) => !v);
    if (otherActive) setOtherText("");
  }

  function handleContinue() {
    const conditions = [...selected];
    if (otherActive && otherText.trim()) {
      conditions.push(otherText.trim());
    }
    onContinue(conditions);
  }

  const hasSelection = selected.size > 0 || (otherActive && otherText.trim().length > 0);

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 pt-12 pb-8">
      {/* Header */}
      <div className="mb-8">
        {/* Eyebrow pill - step indicator */}
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
          Step 1 of 4
        </span>
        <h1
          className="text-3xl leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          What are you tracking?
        </h1>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          Select all that apply. You can track multiple conditions.
        </p>
      </div>

      {/* Condition grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {CONDITIONS.map((condition) => {
          const isSelected = selected.has(condition);
          return (
            <div key={condition}>
              {/* Double-Bezel card - outer shell */}
              <button
                onClick={() => toggle(condition)}
                className="w-full tap-feedback"
                style={{
                  padding: "6px",
                  borderRadius: "1.25rem",
                  boxShadow: isSelected
                    ? "0 0 0 1.5px var(--accent)"
                    : `0 0 0 1px var(--bezel-ring)`,
                  backgroundColor: isSelected
                    ? "rgba(216,243,220,0.3)"
                    : "var(--bezel-outer-bg)",
                  transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                  cursor: "pointer",
                }}
                aria-pressed={isSelected}
              >
                {/* Inner core */}
                <div
                  className="flex items-start text-left"
                  style={{
                    padding: "10px 12px",
                    backgroundColor: isSelected ? "rgba(216,243,220,0.5)" : "var(--bg-surface)",
                    boxShadow: "var(--bezel-inset-shadow)",
                    borderRadius: "0.875rem",
                    minHeight: "48px",
                    transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <span
                    className={`text-base font-medium leading-tight food-trigger-label${isSelected ? " food-trigger-label--selected" : ""}`}
                    style={{
                      fontFamily: "var(--font-body)",
                      transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {condition}
                  </span>
                </div>
              </button>
            </div>
          );
        })}

        {/* Other card */}
        <div>
          <button
            onClick={toggleOther}
            className="w-full tap-feedback"
            style={{
              padding: "6px",
              borderRadius: "1.25rem",
              boxShadow: otherActive
                ? "0 0 0 1.5px var(--accent)"
                : `0 0 0 1px var(--bezel-ring)`,
              backgroundColor: otherActive
                ? "rgba(216,243,220,0.3)"
                : "var(--bezel-outer-bg)",
              transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1)",
              cursor: "pointer",
            }}
            aria-pressed={otherActive}
          >
            <div
              className="flex items-start text-left"
              style={{
                padding: "10px 12px",
                backgroundColor: otherActive ? "rgba(216,243,220,0.5)" : "var(--bg-surface)",
                boxShadow: "var(--bezel-inset-shadow)",
                borderRadius: "0.875rem",
                minHeight: "48px",
                transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <span
                className={`text-base font-medium leading-tight food-trigger-label${otherActive ? " food-trigger-label--selected" : ""}`}
                style={{
                  fontFamily: "var(--font-body)",
                  transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                Other
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Other text input */}
      {otherActive && (
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--text-secondary)" }}
            htmlFor="other-condition"
          >
            What condition?
          </label>
          <input
            id="other-condition"
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="e.g. Lupus, Long COVID…"
            className="w-full px-3 py-3 text-base border-b outline-none bg-transparent"
            style={{
              borderBottomColor: "var(--border)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
            autoFocus
          />
        </div>
      )}

      <div className="flex-1" />

      {/* Continue - Button-in-Button pattern */}
      <button
        onClick={handleContinue}
        disabled={!hasSelection}
        className="group w-full flex items-center justify-between px-5 tap-feedback"
        style={{
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: hasSelection ? "var(--accent)" : "var(--border)",
          color: hasSelection ? "#ffffff" : "var(--text-secondary)",
          cursor: hasSelection ? "pointer" : "not-allowed",
          fontFamily: "var(--font-body)",
          border: "none",
          transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
        aria-disabled={!hasSelection}
      >
        <span className="text-sm font-medium">Continue</span>
        {/* Trailing icon circle */}
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
    </div>
  );
}
