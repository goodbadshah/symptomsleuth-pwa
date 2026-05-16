"use client";

import { useState } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { motion } from "framer-motion";

const CONDITIONS = [
  "Anxiety",
  "Arthritis",
  "Asthma",
  "Atrial Fibrillation",
  "Autoimmune",
  "COPD",
  "Cancer",
  "Chronic Kidney Disease",
  "Chronic Lyme Disease",
  "Chronic Pain",
  "Dementia & Alzheimer's",
  "Depression",
  "Endometriosis",
  "Fibromyalgia",
  "Heart Disease",
  "Hypertension",
  "IBD",
  "IBS",
  "Liver Disease",
  "Long COVID",
  "MCAS",
  "Migraine",
  "Obesity",
  "Osteoporosis",
  "PCOS",
  "POTS",
  "Periodontal Disease",
  "Stroke",
  "Thyroid Disease",
  "Type 2 Diabetes",
];

interface Props {
  onContinue: (conditions: string[]) => void;
  onBack?: () => void;
}

export default function ConditionSelect({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState("");
  const [otherActive, setOtherActive] = useState(false);

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
    <div className="flex flex-col min-h-[100dvh] px-5 pt-12 pb-8 relative">
      {onBack && (
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
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {CONDITIONS.map((condition, index) => {
          const isSelected = selected.has(condition);
          // Faster stagger (40ms), cap staggering delay per row roughly (modulo logic prevents huge delays on long scrolls)
          const delay = (index % 15) * 40; 
          return (
            <FadeIn key={condition} delay={delay}>
              {/* Double-Bezel card - outer shell */}
              <button
                onClick={() => toggle(condition)}
                className="w-full tap-feedback group relative"
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
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                  style={{ boxShadow: "var(--hover-glow)" }} 
                />
                
                {/* Inner core */}
                <div
                  className="flex items-center text-left w-full h-full"
                  style={{
                    padding: "10px 12px",
                    backgroundColor: isSelected ? "rgba(216,243,220,0.5)" : "var(--bg-surface)",
                    boxShadow: "var(--bezel-inset-shadow)",
                    borderRadius: "0.875rem",
                    minHeight: "56px",
                    transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <span
                    className={`text-[15px] font-medium leading-tight food-trigger-label${isSelected ? " food-trigger-label--selected" : ""}`}
                    style={{
                      fontFamily: "var(--font-body)",
                      transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {condition}
                  </span>
                </div>
              </button>
            </FadeIn>
          );
        })}

        {/* Other card */}
        <FadeIn delay={(CONDITIONS.length % 15) * 40}>
          <button
            onClick={toggleOther}
            className="w-full tap-feedback group relative"
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
            {/* Glow effect on hover */}
            <div 
              className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
              style={{ boxShadow: "var(--hover-glow)" }} 
            />
            
            <div
              className="flex items-center text-left w-full h-full"
              style={{
                padding: "10px 12px",
                backgroundColor: otherActive ? "rgba(216,243,220,0.5)" : "var(--bg-surface)",
                boxShadow: "var(--bezel-inset-shadow)",
                borderRadius: "0.875rem",
                minHeight: "56px",
                transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <span
                className={`text-[15px] font-medium leading-tight food-trigger-label${otherActive ? " food-trigger-label--selected" : ""}`}
                style={{
                  fontFamily: "var(--font-body)",
                  transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                Other
              </span>
            </div>
          </button>
        </FadeIn>
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
      <motion.button
        onClick={handleContinue}
        disabled={!hasSelection}
        whileHover={hasSelection ? { scale: 1.02 } : undefined}
        whileTap={hasSelection ? { scale: 0.98 } : undefined}
        className={`group w-full relative flex items-center justify-center px-5 tap-feedback ${hasSelection ? "shadow-[0_4px_14px_rgba(45,106,79,0.2)]" : ""}`}
        style={{
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: hasSelection ? "var(--accent)" : "var(--border)",
          color: hasSelection ? "#ffffff" : "var(--text-secondary)",
          cursor: hasSelection ? "pointer" : "not-allowed",
          fontFamily: "var(--font-body)",
          border: "none",
          transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
        aria-disabled={!hasSelection}
      >
        <span className="text-sm font-medium">Continue</span>
        {/* Trailing icon circle */}
        <span
          className="absolute right-5 w-7 h-7 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </motion.button>
    </div>
  );
}
