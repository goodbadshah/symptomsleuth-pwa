"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { buildSuggestedSymptoms } from "@/utils/symptoms";
import type { Symptom } from "@/app/providers";
import { useInView, entryStyle } from "@/hooks/useInView";
import { motion } from "framer-motion";

interface Props {
  conditions: string[];
  onContinue: (symptoms: Symptom[]) => void;
  onBack: () => void;
}

type SymptomWithEnabled = Symptom & { enabled: boolean };

export default function SymptomSetup({ conditions, onContinue, onBack }: Props) {
  const suggested = buildSuggestedSymptoms(conditions);

  const [symptoms, setSymptoms] = useState<SymptomWithEnabled[]>(
    suggested.map((s) => ({ ...s, enabled: true }))
  );
  const [addName, setAddName] = useState("");

  // Observe the list container for staggered entry
  const { ref: listRef, inView: listVisible } = useInView();

  function toggleEnabled(id: string) {
    setSymptoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function addCustom() {
    const name = addName.trim();
    if (!name) return;
    const newSymptom: SymptomWithEnabled = {
      id: uuidv4(),
      name,
      condition: conditions[0] ?? "Other",
      enabled: true,
    };
    setSymptoms((prev) => [...prev, newSymptom]);
    setAddName("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addCustom();
  }

  function handleContinue() {
    const active = symptoms
      .filter((s) => s.enabled)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ enabled, ...s }) => s);
    onContinue(active);
  }

  const enabledCount = symptoms.filter((s) => s.enabled).length;

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 pt-12 pb-8 relative">
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
          Step 2 of 4
        </span>
        <h1
          className="text-3xl leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontWeight: 400 }}
        >
          Which symptoms?
        </h1>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          We&apos;ve suggested common ones. Turn off what doesn&apos;t apply, and add anything
          we missed.
        </p>
      </div>

      {/* Symptom list - observed for scroll entry */}
      <div
        ref={listRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto -mx-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4">
          {symptoms.map((symptom, index) => (
          <div key={symptom.id} className="md:border-r border-[var(--border)] md:even:border-r-0" style={entryStyle(listVisible, index)}>
            <button
              onClick={() => toggleEnabled(symptom.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left tap-feedback"
              style={{
                borderBottom: "1px solid var(--border)",
                backgroundColor: symptom.enabled ? "var(--bg-surface)" : "var(--bg-primary)",
                opacity: symptom.enabled ? 1 : 0.45,
                transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1), background-color 150ms cubic-bezier(0.16,1,0.3,1)",
                minHeight: "56px",
              }}
              aria-pressed={symptom.enabled}
              aria-label={`${symptom.enabled ? "Disable" : "Enable"} ${symptom.name}`}
            >
              {/* Checkbox */}
              <span
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                style={{
                  border: `1.5px solid ${symptom.enabled ? "var(--accent)" : "var(--border)"}`,
                  backgroundColor: symptom.enabled ? "var(--accent)" : "transparent",
                  borderRadius: "4px",
                  transition: "background-color 150ms cubic-bezier(0.16,1,0.3,1), border-color 150ms cubic-bezier(0.16,1,0.3,1)",
                }}
                aria-hidden="true"
              >
                {symptom.enabled && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <polyline
                      points="1,4 4,7 9,1"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <div>
                <p
                  className="text-base font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {symptom.name}
                </p>
                {conditions.length > 1 && (
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {symptom.condition}
                  </p>
                )}
              </div>
            </button>
          </div>
        ))}

        {/* Add custom symptom row */}
        <div
          className="flex items-center gap-3 px-5 py-4 md:border-r border-[var(--border)] md:even:border-r-0"
          style={{ borderBottom: "1px solid var(--border)", minHeight: "56px" }}
        >
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a symptom…"
            className="flex-1 text-base bg-transparent outline-none"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
            aria-label="Add a custom symptom"
          />
          {addName.trim() && (
            <button
              onClick={addCustom}
              className="text-base font-medium tap-feedback"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
            >
              Add
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-5 flex flex-col gap-3">
        {/* Continue - Button-in-Button */}
        <motion.button
          onClick={handleContinue}
          disabled={enabledCount === 0}
          whileHover={enabledCount > 0 ? { scale: 1.02 } : undefined}
          whileTap={enabledCount > 0 ? { scale: 0.98 } : undefined}
          className={`group w-full relative flex items-center justify-center px-5 tap-feedback ${enabledCount > 0 ? "shadow-[0_4px_14px_rgba(45,106,79,0.2)]" : ""}`}
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: enabledCount > 0 ? "var(--accent)" : "var(--border)",
            color: enabledCount > 0 ? "#ffffff" : "var(--text-secondary)",
            cursor: enabledCount > 0 ? "pointer" : "not-allowed",
            fontFamily: "var(--font-body)",
            border: "none",
            transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span className="text-sm font-medium">
            Continue{enabledCount > 0 ? ` with ${enabledCount}` : ""}
          </span>
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
    </div>
  );
}
