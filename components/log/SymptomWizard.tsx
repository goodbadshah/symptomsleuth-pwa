"use client";

import { useState, useRef, useEffect } from "react";
import type { Symptom } from "@/app/providers";
import SeverityChipSelector from "./SeverityChipSelector";
import Marginalia from "./Marginalia";
import { SeverityGlyph } from "@/utils/severityGlyphs";
import { motion, AnimatePresence } from "framer-motion";

const CHIP_LABELS = ["None", "Mild", "Medium", "Severe", "Extreme"];

// Safe haptic wrapper
const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(pattern);
    } catch (e) {
      // Ignore
    }
  }
};

interface Props {
  groupSymptoms: Symptom[];
  entries: Record<string, number>;
  /** Index of the active symptom within groupSymptoms. */
  activeIndex: number;
  onEntryChange: (symptomId: string, value: number) => void;
  /** Allow user to step back to a previous symptom. */
  onSetActiveIndex: (index: number) => void;
  justSaved?: boolean;
  /** When the condition is complete, render all rows in their done state. */
  complete: boolean;
}

/**
 * Per-symptom wizard within an expanded condition.
 * - Done symptoms render as compact rows (name + selected severity glyph + label).
 * - Active symptom renders the full SeverityChipSelector.
 * - Upcoming symptoms render as muted preview rows.
 * - Tapping a done or upcoming row jumps the active index to it.
 */
export default function SymptomWizard({
  groupSymptoms,
  entries,
  activeIndex,
  onEntryChange,
  onSetActiveIndex,
  justSaved = false,
  complete,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {groupSymptoms.map((symptom, index) => {
        const value = entries[symptom.id] ?? 0;
        const isActive = !complete && index === activeIndex;
        const isDone = complete || index < activeIndex;
        const isUpcoming = !complete && index > activeIndex;

        return (
          <motion.div
            key={symptom.id}
            layout
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          >
            {isActive ? (
              <ActiveRow
                symptom={symptom}
                value={value}
                onChange={(v) => {
                  vibrate(10);
                  onEntryChange(symptom.id, v);
                }}
                justSaved={justSaved}
                positionLabel={`${index + 1} of ${groupSymptoms.length}`}
              />
            ) : (
              <CompactRow
                symptom={symptom}
                value={value}
                state={isDone ? "done" : "upcoming"}
                onJump={() => onSetActiveIndex(index)}
                isLast={index === groupSymptoms.length - 1}
                showUpNextLabel={isUpcoming && index === activeIndex + 1}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Active row — full chip selector ──────────────────────────────────────────

function ActiveRow({
  symptom,
  value,
  onChange,
  justSaved,
  positionLabel,
}: {
  symptom: Symptom;
  value: number;
  onChange: (v: number) => void;
  justSaved: boolean;
  positionLabel: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The "Typewriter" Auto-Scroll
    // Wait for the Framer Motion layout animation to settle before calculating coordinates
    const t = setTimeout(() => {
      if (rowRef.current) {
        const _container = rowRef.current.closest(".overflow-y-auto") as HTMLElement | null;
        if (_container) {
          const rect = rowRef.current.getBoundingClientRect();
          const containerRect = _container.getBoundingClientRect();
          const viewportHeight = _container.clientHeight;
          
          // Unconditionally scroll the newly active row into the "focus zone" (upper-mid screen). 
          // This acts like a treadmill—pulling the next row up to exactly where the user is already tapping.
          const currentScroll = _container.scrollTop;
          const targetY = currentScroll + (rect.top - containerRect.top) - (viewportHeight * 0.35);
          
          _container.scrollTo({ top: targetY, behavior: "smooth" });
        } else {
          // Fallback if container not found
          const rect = rowRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const targetY = window.scrollY + rect.top - viewportHeight * 0.35;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }
    }, 450); // framer-motion transition is 400ms

    return () => clearTimeout(t);
  }, [symptom.id]);

  return (
    <div
      ref={rowRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "16px 16px 14px",
        margin: "0 -16px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      {justSaved && value > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: "var(--accent)",
            animation: "accent-flash 600ms cubic-bezier(0.32,0.72,0,1) forwards",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          margin: "0 0 10px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          <p
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              margin: 0,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {positionLabel}
          </p>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 500,
              lineHeight: "1.3",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              margin: 0,
              transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {symptom.name}
          </p>
        </div>
        <Marginalia symptomId={symptom.id} />
      </div>

      <SeverityChipSelector
        value={value}
        onChange={onChange}
        label={symptom.name}
      />
    </div>
  );
}

// ─── Compact row — done or upcoming ──────────────────────────────────────────

function CompactRow({
  symptom,
  value,
  state,
  onJump,
  isLast,
  showUpNextLabel,
}: {
  symptom: Symptom;
  value: number;
  state: "done" | "upcoming";
  onJump: () => void;
  isLast: boolean;
  showUpNextLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const isDone = state === "done";

  const nameColor = isDone ? "var(--text-primary)" : "var(--text-secondary)";
  const opacity = isDone ? 1 : 0.6;
  const scale = isDone ? 1 : 0.98;
  const filter = isDone ? "none" : "blur(0.5px)";
  const valueLabel = value > 0 ? CHIP_LABELS[value] : isDone ? "None" : "";

  return (
    <button
      type="button"
      onClick={onJump}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="tap-feedback"
      aria-label={`Edit ${symptom.name}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 16px",
        margin: "0 -16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        backgroundColor: hover ? "rgba(0,0,0,0.015)" : "transparent",
        border: "none",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        cursor: "pointer",
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
        opacity,
        transform: `scale(${scale})`,
        filter,
        transformOrigin: "left center",
        transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1), filter 300ms ease, background-color 200ms ease",
        minHeight: "44px",
      }}
    >
      <p
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: nameColor,
          fontFamily: "var(--font-body)",
          margin: 0,
          flex: 1,
        }}
      >
        {symptom.name}
      </p>

      {isDone ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: value > 0 ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          <SeverityGlyph value={value} size={14} />
          <span
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.03em",
              minWidth: "44px",
              textAlign: "right",
            }}
          >
            {valueLabel}
          </span>
        </span>
      ) : (
        <span
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            visibility: showUpNextLabel ? "visible" : "hidden",
          }}
        >
          Up next
        </span>
      )}
    </button>
  );
}
