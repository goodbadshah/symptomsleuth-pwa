"use client";

interface Props {
  daysRemaining: number;
  logsRemaining: number;
  loggedDaysCount: number;
  totalLogEntries: number;
}

/**
 * ProgressToUnlock - thin progress strip shown below AIPreviewCard in State B.
 *
 * Picks whichever gate is further from completion and shows a simple
 * inline progress line. No card, no elevation - just type and a hairline.
 */
export default function ProgressToUnlock({
  daysRemaining,
  logsRemaining,
  loggedDaysCount,
  totalLogEntries,
}: Props) {
  // Pick whichever gate has more remaining (further from done)
  const showDaysGate = daysRemaining >= logsRemaining;
  const label = showDaysGate
    ? `${loggedDaysCount} of 14 days`
    : `${totalLogEntries} of 20 logs`;

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
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </span>

      {/* Progress line - 80px wide × 2px tall */}
      <div
        style={{
          width: 80,
          height: 2,
          borderRadius: 999,
          backgroundColor: "var(--border)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            backgroundColor: "var(--accent)",
            borderRadius: 999,
            transition: "width 400ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}
