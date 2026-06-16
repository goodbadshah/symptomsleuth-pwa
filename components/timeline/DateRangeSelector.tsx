"use client";

import type { DateRange } from "@/utils/timelineData";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7D", value: "7D" },
  { label: "30D", value: "30D" },
  { label: "90D", value: "90D" },
  { label: "All", value: "All" },
];

function LockIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5" stroke={color} strokeWidth="1.4" />
      <path d="M4 6V4a2 2 0 1 1 4 0v2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  selected: DateRange;
  onChange: (range: DateRange) => void;
  isPremium: boolean;
}

/**
 * DateRangeSelector - 4-chip row using the SeverityChipSelector visual language.
 * Replaces the previous 13px underline tabs - violated 48px tap-target rule.
 *
 * Selected state: --accent flood, white text (claim-not-highlight pattern).
 * Locked ranges show an inline lock icon and refuse selection for non-premium.
 */
export default function DateRangeSelector({ selected, onChange, isPremium }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        padding: "8px 0 12px",
      }}
    >
      {RANGES.map((r) => {
        const locked = !isPremium && r.value !== "7D";
        const isActive = selected === r.value;
        return (
          <Chip
            key={r.value}
            label={r.label}
            isActive={isActive}
            locked={locked}
            onClick={() => {
              if (locked) return;
              onChange(r.value);
            }}
          />
        );
      })}
    </div>
  );
}

function Chip({
  label,
  isActive,
  locked,
  onClick,
}: {
  label: string;
  isActive: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const lockedColor = "var(--text-secondary)";
  const activeBg = "var(--accent)";
  const activeText = "#ffffff";
  const idleText = "var(--text-primary)";

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={locked ? `${label} - requires premium` : label}
      onClick={onClick}
      disabled={locked}
      className="active:translate-y-[0.5px]"
      style={{
        padding: 4,
        borderRadius: "0.875rem",
        background: "var(--bezel-outer-bg)",
        boxShadow: `0 0 0 1px ${isActive ? "var(--accent)" : "var(--bezel-ring)"}`,
        border: "none",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.55 : 1,
        transition:
          "transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          minHeight: 48,
          borderRadius: "0.625rem",
          background: isActive ? activeBg : "var(--bg-surface)",
          boxShadow: isActive ? "none" : "var(--bezel-inset-shadow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: isActive ? activeText : idleText,
          transition: "background-color 150ms cubic-bezier(0.16,1,0.3,1), color 150ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span>{label}</span>
        {locked && <LockIcon color={lockedColor} />}
      </div>
    </button>
  );
}
