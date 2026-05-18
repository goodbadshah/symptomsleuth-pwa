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
    selectedBg: "var(--severity-1)",
    defaultBg: "rgba(0, 163, 108, 0.25)", /* Rich Green */
    selectedBorder: "var(--severity-1)",
    selectedText: "#ffffff",
  },
  {
    label: "Mild",
    value: 1,
    selectedBg: "var(--severity-2)",
    defaultBg: "rgba(255, 182, 0, 0.25)", /* Rich Gold */
    selectedBorder: "var(--severity-2)",
    selectedText: "#ffffff",
  },
  {
    label: "Medium",
    value: 2,
    selectedBg: "var(--severity-3)",
    defaultBg: "rgba(249, 87, 0, 0.25)", /* Rich Orange */
    selectedBorder: "var(--severity-3)",
    selectedText: "#ffffff",
  },
  {
    label: "Severe",
    value: 3,
    selectedBg: "var(--severity-4)",
    defaultBg: "rgba(230, 0, 0, 0.25)", /* Rich Red */
    selectedBorder: "var(--severity-4)",
    selectedText: "#ffffff",
  },
  {
    label: "Extreme",
    value: 4,
    selectedBg: "#6A0DAD",
    defaultBg: "rgba(106, 13, 173, 0.25)", /* Purple */
    selectedBorder: "#6A0DAD",
    selectedText: "#ffffff",
  },
];

const CONTEXT_SELECTED = {
  bg: "var(--context-slider-high)",
  defaultBg: "rgba(74,74,74,0.1)",
  border: "var(--context-slider-high)",
  text: "#ffffff",
};

// Map scale to box shadow glow colors (saturated and wide spread)
const GLOW_COLORS = {
  0: "var(--severity-1)",
  1: "var(--severity-2)",
  2: "var(--severity-3)",
  3: "var(--severity-4)",
  4: "#6A0DAD",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** undefined means unselected, 0 = None, 1–4 = severity level. */
  value: number | undefined;
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
  const displayValue = value === undefined ? undefined : Math.min(value, 4);

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
        style={{ display: "flex", gap: "4px", width: "100%", margin: "0 -16px", padding: "0 16px" }}
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
                hover: { scale: 1.04, boxShadow: selected ? `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}` : `0 0 0 1px var(--bg-primary), 0 0 0 1.5px ${sc.border}` },
                tap: { scale: 0.90 },
                selected: { scale: 1, boxShadow: `0 0 0 1px var(--bg-primary), 0 0 0 2.5px ${sc.border}` }
              }}
              transition={{
                type: "spring",
                stiffness: 700,
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
                variants={{
                  rest: { 
                    backgroundColor: selected ? sc.bg : sc.defaultBg,
                    color: selected ? "#ffffff" : "var(--text-secondary)",
                  },
                  hover: { 
                    backgroundColor: sc.bg, // Fully flood with saturated color
                    color: "#ffffff" // Snap text to pure white
                  },
                  tap: {
                    backgroundColor: sc.bg,
                    color: "#ffffff"
                  },
                  selected: { 
                    backgroundColor: sc.bg,
                    color: "#ffffff"
                  }
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
                  {(scale === "severity" && chip.value >= 0) && (
                    <motion.div
                      variants={{
                        rest: { opacity: 0, scale: 0.9 },
                        hover: { opacity: [0.6, 0.9, 0.6], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
                        selected: { opacity: [0.8, 1, 0.8], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at center, rgba(255,255,255,0.2), transparent 85%)`, /* 85% spread as requested in CLAUDE.md */
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
                      fontSize: "14px",
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

