"use client";

import { useState } from "react";
import type { Symptom } from "@/app/providers";
import SeverityChipSelector from "./SeverityChipSelector";
import Marginalia from "./Marginalia";
import { SeverityGlyph } from "@/utils/severityGlyphs";

const CHIP_LABELS = ["None", "Mild", "Medium", "Severe", "Extreme"];

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

        if (isActive) {
          return (
            <ActiveRow
              key={symptom.id}
              symptom={symptom}
              value={value}
              onChange={(v) => onEntryChange(symptom.id, v)}
              justSaved={justSaved}
              positionLabel={`${index + 1} of ${groupSymptoms.length}`}
            />
          );
        }

        return (
          <CompactRow
            key={symptom.id}
            symptom={symptom}
            value={value}
            state={isDone ? "done" : "upcoming"}
            onJump={() => onSetActiveIndex(index)}
            isLast={index === groupSymptoms.length - 1}
            showUpNextLabel={isUpcoming && index === activeIndex + 1}
          />
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
  return (
    <div
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
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          <p
            style={{
              fontSize: "10px",
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
              fontSize: "16px",
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
  const opacity = isDone ? 1 : 0.55;
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
        transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1)",
        minHeight: "44px",
      }}
    >
      <p
        style={{
          fontSize: "14px",
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
          <SeverityGlyph value={value} size={12} />
          <span
            style={{
              fontSize: "11px",
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
            fontSize: "11px",
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
