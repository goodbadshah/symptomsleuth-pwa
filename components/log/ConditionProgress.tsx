"use client";

interface Props {
  total: number;
  completed: number;
}

/**
 * Segmented hairline progress indicator.
 * One segment per condition. Fills as each condition completes.
 * Sits to the right of "Rate Your Symptoms" subheading.
 */
export default function ConditionProgress({ total, completed }: Props) {
  if (total <= 0) return null;

  const segments = Array.from({ length: total }, (_, i) => i < completed);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      aria-label={`${completed} of ${total} conditions logged`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
      }}
    >
      {segments.map((filled, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: "20px",
            height: "3px",
            borderRadius: "2px",
            backgroundColor: filled ? "var(--accent)" : "var(--border)",
            transition:
              "background-color 400ms cubic-bezier(0.32, 0.72, 0, 1), transform 400ms cubic-bezier(0.32, 0.72, 0, 1)",
            transformOrigin: "left center",
          }}
        />
      ))}
    </div>
  );
}
