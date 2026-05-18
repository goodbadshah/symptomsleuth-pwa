"use client";

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
        gap: "10px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "84px",
          height: "6px",
          borderRadius: "999px",
          backgroundColor: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            backgroundColor: "var(--accent)",
            borderRadius: "999px",
            transition: "width 500ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-secondary)",
          letterSpacing: "0.03em",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {completed} / {total}
      </span>
    </div>
  );
}
