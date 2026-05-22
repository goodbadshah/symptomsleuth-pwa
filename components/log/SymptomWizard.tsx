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
  entries: Record<string, number | undefined>;
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
        const value = entries[symptom.id];
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
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
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
  value: number | undefined;
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
        // Skip auto-scroll if the container is collapsed (height is 0)
        if (rowRef.current.parentElement && rowRef.current.parentElement.clientHeight === 0) {
          return;
        }

        const _container = rowRef.current.closest(".overflow-y-auto") as HTMLElement | null;
        if (_container) {
          const rect = rowRef.current.getBoundingClientRect();
          const containerRect = _container.getBoundingClientRect();
          const viewportHeight = _container.clientHeight;
          
          // Gentle Bounds Check Scroll
          // Ensure the newly active row is comfortably visible, but do not jerk it unconditionally.
          const headerHeight = 160; // 72px AppHeader + ~88px Condition Header
          const currentScroll = _container.scrollTop;
          const relativeTop = rect.top - containerRect.top;
          const relativeBottom = rect.bottom - containerRect.top;
          
          let targetY = currentScroll;
          if (relativeTop < headerHeight) {
            // Pushed under the sticky header
            targetY = currentScroll + relativeTop - headerHeight - 20;
          } else if (relativeBottom > viewportHeight - 64) {
            // Falling off the bottom
            targetY = currentScroll + relativeBottom - viewportHeight + 96;
          }
          
          if (targetY !== currentScroll) {
            _container.scrollTo({ top: targetY, behavior: "smooth" });
          }
        } else {
          // Fallback if container not found
          const rect = rowRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const targetY = window.scrollY + rect.top - 160;
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
      {justSaved && value !== undefined && value >= 0 && (
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
  value: number | undefined;
  state: "done" | "upcoming";
  onJump: () => void;
  isLast: boolean;
  showUpNextLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const isDone = state === "done";
  const hasSeverity = isDone && value !== undefined && value >= 0;
  const displayValue = Math.min(value ?? 0, 4);

    const SOLID_BGS = [
      "var(--severity-1)",
      "var(--severity-2)",
      "var(--severity-3)",
      "var(--severity-4)",
      "var(--severity-5)"
    ];

    const bgColor = hasSeverity
      ? SOLID_BGS[displayValue]
      : hover ? "rgba(0,0,0,0.015)" : "transparent";

  const nameColor = hasSeverity 
    ? "#ffffff" 
    : isDone ? "var(--text-primary)" : "var(--text-secondary)";
    
  const glyphColor = hasSeverity
    ? "#ffffff"
    : value !== undefined && value >= 0 && isDone ? "var(--text-primary)" : "var(--text-secondary)";
    
  const secondaryColor = hasSeverity 
    ? "rgba(255,255,255,0.7)" 
    : "var(--text-secondary)";

  const opacity = isDone ? 1 : 0.6;
  const scale = isDone ? 1 : 0.98;
  const filter = isDone ? "none" : "blur(0.5px)";
  const valueLabel = isDone ? CHIP_LABELS[displayValue] : "";

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
        display: "block",
        width: "100%",
        padding: "16px 14px",
        margin: "0 0 2px 0",
        borderRadius: "0px",
        border: hasSeverity ? "1px solid transparent" : "1px solid var(--border)",
        backgroundColor: bgColor,
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <p
          style={{
            fontSize: "16px",
            fontWeight: hasSeverity ? 500 : 400,
            color: nameColor,
            fontFamily: "var(--font-body)",
            margin: 0,
            flex: 1,
            lineHeight: 1.1,
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
              color: glyphColor,
              fontWeight: hasSeverity ? 600 : 400,
              fontSize: "14px",
              fontFamily: "var(--font-body)",
              lineHeight: 1.1,
            }}
          >
            <SeverityGlyph value={value ?? 0} size={14} />
            <span style={{ color: hasSeverity ? "#ffffff" : "var(--text-secondary)" }}>
              {valueLabel}
            </span>
          </span>
        ) : showUpNextLabel ? (
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            Up next
          </span>
        ) : null}
      </div>
    </button>
  );
}
