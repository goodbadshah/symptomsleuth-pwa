"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  defaultBg: string;
  selectedBorder: string;
  selectedText: string;
}

const SEVERITY_CHIPS: ChipDef[] = [
  {
    label: "None",
    value: 0,
    selectedBg: "rgba(209,209,206,0.5)",
    defaultBg: "rgba(209,209,206,0.2)",
    selectedBorder: "#D1D1CE",
    selectedText: "var(--chip-text-none)",
  },
  {
    label: "Mild",
    value: 1,
    selectedBg: "rgba(197,223,184,0.5)",
    defaultBg: "rgba(197,223,184,0.2)",
    selectedBorder: "#C5DFB8",
    selectedText: "var(--chip-text-mild)",
  },
  {
    label: "Medium",
    value: 2,
    selectedBg: "rgba(168,204,151,0.5)",
    defaultBg: "rgba(168,204,151,0.2)",
    selectedBorder: "#A8CC97",
    selectedText: "var(--chip-text-moderate)",
  },
  {
    label: "Severe",
    value: 3,
    selectedBg: "rgba(244,201,93,0.5)",
    defaultBg: "rgba(244,201,93,0.2)",
    selectedBorder: "#F4C95D",
    selectedText: "var(--chip-text-severe)",
  },
  {
    label: "Extreme",
    value: 4,
    selectedBg: "rgba(232,130,58,0.5)",
    defaultBg: "rgba(232,130,58,0.2)",
    selectedBorder: "#E8823A",
    selectedText: "var(--chip-text-extreme)",
  },
];

const CONTEXT_SELECTED = {
  bg: "rgba(74,74,74,0.4)",
  defaultBg: "rgba(74,74,74,0.15)",
  border: "#4A4A4A",
  text: "var(--chip-text-context)",
};

// Map scale to box shadow glow colors
const GLOW_COLORS = {
  0: "rgba(209,209,206,0)",
  1: "rgba(197,223,184,0.4)",
  2: "rgba(168,204,151,0.6)",
  3: "rgba(244,201,93,0.8)",
  4: "rgba(232,130,58,0.9)",
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
                  defaultBg: chip.defaultBg,
                  border: chip.selectedBorder,
                  text: chip.selectedText,
                };

          // Outer ring: severity-colored offset ring when selected,
          // neutral hairline ring when resting (double-bezel outer shell)
          const outerBoxShadow = selected
            ? `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}`
            : "0 0 0 1px rgba(0,0,0,0.04)";

          const glowColor = scale === "severity" 
            ? GLOW_COLORS[chip.value as keyof typeof GLOW_COLORS] 
            : "rgba(74,74,74,0.4)";

          return (
            <motion.button
              key={chip.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={chip.label}
              onClick={() => handleChipPress(chip.value)}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              animate={selected ? "selected" : "rest"}
              variants={{
                rest: { scale: 1, boxShadow: "0 0 0 1px rgba(0,0,0,0.04)" },
                hover: { scale: 1.02, boxShadow: selected ? `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}` : "0 0 0 1px rgba(0,0,0,0.04)" },
                tap: { scale: 0.95 },
                selected: { scale: 1, boxShadow: `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}` }
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
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
                position: "relative",
              }}
            >
              {/* Inner core - double-bezel architecture */}
              <motion.div
                animate={{
                  backgroundColor: selected ? sc.bg : sc.defaultBg,
                  color: selected ? sc.text : "var(--text-secondary)",
                }}
                style={{
                  height: "100%",
                  borderRadius: "6px",
                  boxShadow: selected
                    ? `var(--bezel-inset-shadow), inset 0 1px 2px rgba(0,0,0,0.06)`
                    : "var(--bezel-inset-shadow)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Animated Glow Layer strictly inside the chip for center pulse */}
                <AnimatePresence>
                  {(scale === "severity" && chip.value > 0) && (
                    <motion.div
                      variants={{
                        rest: { opacity: 0, scale: 0.9 },
                        hover: { opacity: [0.4, 0.7, 0.4], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
                        selected: { opacity: [0.5, 0.9, 0.5], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at center, ${GLOW_COLORS[chip.value as keyof typeof GLOW_COLORS]}, transparent 70%)`,
                        zIndex: 0,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex flex-col items-center gap-1">
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
              </motion.div>
            </motion.button>
          );
        })}
      </div>

    </>
  );
}

