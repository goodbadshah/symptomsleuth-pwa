"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  total: number;
  completed: number;
}

/**
 * Progress bar anchored next to "Rate Your Symptoms".
 * Solid track + accent fill + DM Mono count label.
 * Visible from day 1, no false precision.
 */
export default function ConditionProgress({ total, completed }: Props) {
  if (total <= 0) return null;

  const pct = Math.min(100, Math.round((completed / total) * 100));
  const numWidth = `${String(total).length}ch`;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      aria-label={`${completed} of ${total} symptoms logged`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "8px",
          borderRadius: "999px",
          backgroundColor: "var(--border)",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--accent)",
            borderRadius: "999px",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "0.03em",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <div style={{ position: "relative", width: numWidth, display: "inline-flex", justifyContent: "flex-end" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={completed}
              initial={{ y: 12, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ display: "inline-block", position: "absolute" }}
            >
              {completed}
            </motion.span>
          </AnimatePresence>
          {/* Invisible placeholder to maintain width if position: absolute makes it layout poorly, though width is hardcoded */}
          <span style={{ visibility: "hidden" }}>{completed}</span>
        </div>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500, margin: "0 2px" }}>/</span>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{total}</span>
      </div>
    </div>
  );
}
