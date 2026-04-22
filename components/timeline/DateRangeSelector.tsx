"use client";

import type { DateRange } from "@/utils/timelineData";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7D", value: "7D" },
  { label: "30D", value: "30D" },
  { label: "90D", value: "90D" },
  { label: "All", value: "All" },
];

/** Inline SVG lock icon - 12px, inline, no emoji */
function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 14"
      fill="none"
      aria-hidden="true"
      style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }}
    >
      <rect
        x="1.5"
        y="6"
        width="9"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M4 6V4a2 2 0 1 1 4 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  selected: DateRange;
  onChange: (range: DateRange) => void;
  isPremium: boolean;
}

export default function DateRangeSelector({ selected, onChange, isPremium }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid var(--border)",
        marginBottom: 0,
      }}
    >
      {RANGES.map((r) => {
        const locked = !isPremium && r.value !== "7D";
        const isActive = selected === r.value;

        return (
          <button
            key={r.value}
            role="tab"
            aria-selected={isActive}
            aria-label={locked ? `${r.label} - requires premium` : r.label}
            onClick={() => {
              if (locked) return;
              onChange(r.value);
            }}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              padding: "10px 0 9px",
              cursor: locked ? "default" : "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: locked
                ? "var(--text-secondary)"
                : isActive
                ? "var(--accent)"
                : "var(--text-secondary)",
              opacity: locked ? 0.55 : 1,
              marginBottom: -1, // sits flush on the border-bottom
              transition: "color 150ms cubic-bezier(0.16,1,0.3,1), border-color 150ms cubic-bezier(0.16,1,0.3,1)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {r.label}
            {locked && <LockIcon />}
          </button>
        );
      })}
    </div>
  );
}
