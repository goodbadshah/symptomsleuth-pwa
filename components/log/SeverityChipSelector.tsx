"use client";

import React from "react";
import {
  GlyphNone,
  GlyphMild,
  GlyphModerateLow,
  GlyphModerate,
  GlyphSevere,
} from "@/utils/severityGlyphs";

// ── Glyph order: one glyph per chip position (index 0–4) ─────────────────────
// Chip 0 (None) → GlyphNone
// Chip 1 (Mild) → GlyphMild
// Chip 2 (Medium) → GlyphModerateLow  ← visual density escalates correctly
// Chip 3 (Severe) → GlyphModerate
// Chip 4 (Extreme) → GlyphSevere
// GlyphExtreme is reserved for legacy value=5 rendering in TimelineChart/Report.
const ORDERED_CHIP_GLYPHS = [
  GlyphNone,
  GlyphMild,
  GlyphModerateLow,
  GlyphModerate,
  GlyphSevere,
] as const;

// ── Chip configuration - warmer palette (Editorial Stationery) ────────────────
interface ChipDef {
  label: string;
  value: number;
  selectedBg: string;
  selectedBorder: string;
  selectedText: string;
}

const SEVERITY_CHIPS: ChipDef[] = [
  {
    label: "None",
    value: 0,
    selectedBg: "rgba(209,209,206,0.25)",
    selectedBorder: "#D1D1CE",
    selectedText: "var(--chip-text-none)",
  },
  {
    label: "Mild",
    value: 1,
    selectedBg: "rgba(197,223,184,0.25)",
    selectedBorder: "#C5DFB8",
    selectedText: "var(--chip-text-mild)",
  },
  {
    label: "Medium",
    value: 2,
    selectedBg: "rgba(168,204,151,0.25)",
    selectedBorder: "#A8CC97",
    selectedText: "var(--chip-text-moderate)",
  },
  {
    label: "Severe",
    value: 3,
    selectedBg: "rgba(244,201,93,0.25)",
    selectedBorder: "#F4C95D",
    selectedText: "var(--chip-text-severe)",
  },
  {
    label: "Extreme",
    value: 4,
    selectedBg: "rgba(232,130,58,0.25)",
    selectedBorder: "#E8823A",
    selectedText: "var(--chip-text-extreme)",
  },
];

const CONTEXT_SELECTED = {
  bg: "rgba(74,74,74,0.25)",
  border: "#4A4A4A",
  text: "var(--chip-text-context)",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** 0 = None, 1–4 = severity level. Values ≥ 5 clamped to 4 (legacy compat). */
  value: number;
  onChange: (value: number) => void;
  /** Used for aria-label on the radiogroup */
  label?: string;
  /**
   * 'severity' (default): chips use the severity color palette.
   * 'context': all chips use neutral --context-slider-high palette.
   */
  scale?: "severity" | "context";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SeverityChipSelector({
  value,
  onChange,
  label = "Severity",
  scale = "severity",
}: Props) {
  const displayValue = Math.min(value, 4);

  function handleChipPress(chipValue: number) {
    if (chipValue === displayValue) return; // same chip - no-op
    onChange(chipValue);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }
  }

  return (
    <>
      {/* ── Chip row ─────────────────────────────────────────────────────── */}
      <div
        role="radiogroup"
        aria-label={label}
        style={{ display: "flex", gap: "6px", width: "100%" }}
      >
        {SEVERITY_CHIPS.map((chip, index) => {
          const selected = displayValue === chip.value;
          const GlyphComp = ORDERED_CHIP_GLYPHS[index];

          // Determine selected colors based on scale
          const sc =
            scale === "context"
              ? CONTEXT_SELECTED
              : {
                  bg: chip.selectedBg,
                  border: chip.selectedBorder,
                  text: chip.selectedText,
                };

          // Outer ring: severity-colored offset ring when selected,
          // neutral hairline ring when resting (double-bezel outer shell)
          const outerBoxShadow = selected
            ? `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}`
            : "0 0 0 1px rgba(0,0,0,0.04)";

          return (
            <button
              key={chip.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={chip.label}
              onClick={() => handleChipPress(chip.value)}
              onPointerDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0.5px)";
              }}
              onPointerUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
              onPointerLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
              style={{
                // Outer shell
                flex: 1,
                minWidth: 0,
                height: "56px",
                padding: "2px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                backgroundColor: "transparent",
                boxShadow: outerBoxShadow,
                transition: [
                  "box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
                  "transform 150ms cubic-bezier(0.16,1,0.3,1)",
                ].join(", "),
              }}
            >
              {/* Inner core - double-bezel architecture */}
              <div
                style={{
                  height: "100%",
                  borderRadius: "6px",
                  backgroundColor: selected
                    ? sc.bg
                    : "var(--bg-surface)",
                  boxShadow: selected
                    ? `var(--bezel-inset-shadow), inset 0 1px 2px rgba(0,0,0,0.06)`
                    : "var(--bezel-inset-shadow)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: selected ? sc.text : "var(--text-secondary)",
                  transition: [
                    "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                    "color 200ms cubic-bezier(0.16,1,0.3,1)",
                    "box-shadow 150ms cubic-bezier(0.16,1,0.3,1)",
                  ].join(", "),
                }}
              >
                <GlyphComp size={12} />
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: selected ? 600 : 500,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {chip.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </>
  );
}

