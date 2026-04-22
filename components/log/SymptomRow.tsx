"use client";

import type { Symptom } from "@/app/providers";
import SeverityChipSelector from "./SeverityChipSelector";
import Marginalia from "./Marginalia";

interface Props {
  symptom: Symptom;
  value: number; // 0 = None, 1–4 = severity (5 is clamped for legacy compat)
  onChange: (value: number) => void;
  justSaved?: boolean; // triggers left-border flash animation
}

export default function SymptomRow({
  symptom,
  value,
  onChange,
  justSaved = false,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "16px 16px 14px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      {/* Flash border - accent pulse on save. Spec: cubic-bezier(0.32,0.72,0,1) 600ms */}
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

      {/* Symptom name + Marginalia micro-stats */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          margin: "0 0 10px",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            fontWeight: 500,
            lineHeight: "1.3",
            color: value > 0 ? "var(--text-primary)" : "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            margin: 0,
            transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {symptom.name}
        </p>
        <Marginalia symptomId={symptom.id} />
      </div>

      {/* Chip selector - full width, one deliberate tap per severity */}
      <SeverityChipSelector
        value={value}
        onChange={onChange}
        label={symptom.name}
      />
    </div>
  );
}
