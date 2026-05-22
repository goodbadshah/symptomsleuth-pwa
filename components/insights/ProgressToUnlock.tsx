"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  daysRemaining: number;
  logsRemaining: number;
  loggedDaysCount: number;
  totalLogEntries: number;
}

/**
 * ProgressToUnlock - progress strip shown below AIPreviewCard in State B.
 */
export default function ProgressToUnlock({
  daysRemaining,
  logsRemaining,
  loggedDaysCount,
  totalLogEntries,
}: Props) {
  // Pick whichever gate has more remaining (further from done)
  const showDaysGate = daysRemaining >= logsRemaining;
  const currentCount = showDaysGate ? loggedDaysCount : totalLogEntries;
  const targetCount = showDaysGate ? 14 : 20;
  const unit = showDaysGate ? "days" : "logs";

  const progressPct = showDaysGate
    ? Math.min(100, (loggedDaysCount / 14) * 100)
    : Math.min(100, (totalLogEntries / 20) * 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 4px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <div style={{ position: "relative", width: "2ch", display: "inline-flex", justifyContent: "flex-start" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={currentCount}
              initial={{ y: 12, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ display: "inline-block", position: "absolute" }}
            >
              {currentCount}
            </motion.span>
          </AnimatePresence>
          <span style={{ visibility: "hidden" }}>{currentCount}</span>
        </div>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500, margin: "0 2px" }}>of {targetCount} {unit}</span>
      </div>

      {/* Progress line */}
      <div
        style={{
          width: 120,
          height: 8,
          borderRadius: 999,
          backgroundColor: "var(--border)",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative"
        }}
      >
        <motion.div
           animate={{ width: `${progressPct}%` }}
           transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--accent)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
