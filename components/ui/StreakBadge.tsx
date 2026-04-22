"use client";

import { useStreak } from "@/hooks/useStreak";

/**
 * StreakBadge - inline pill rendered inside AppHeader.
 *
 * Inline flex element - no fixed positioning. AppHeader places it on the right
 * with its own flexbox layout. Sits on --accent background so colors are inverted.
 *
 * Design rules:
 * - bg-white/20 backdrop-blur-sm pill with 1px ring-white/30
 * - DM Mono 12px numeric count + inline SVG flame
 * - Shown from Day 1
 * - 55% opacity when today has not been logged - motivational dimming, not punishment
 */
export default function StreakBadge() {
  const { count, loggedToday } = useStreak();

  // Day 1+ - first log is the dopamine moment
  if (count < 1) return null;

  return (
    <div
      aria-label={`${count}-day logging streak`}
      style={{
        display: "flex",
        alignItems: "center",
        opacity: loggedToday ? 1 : 0.55,
        transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
      }}
    >
      {/* Eyebrow pill - inverted palette for the green header surface */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          borderRadius: "9999px",
          padding: "3px 10px 3px 8px",
          // White translucent fill - sits on --accent (#2D6A4F) background
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          // DM Mono for the number; pill body in DM Sans
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(255, 255, 255, 0.92)",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Inline SVG flame - stroke-based, no fill, matches the icon language in the rest of the app */}
        <svg
          width="11"
          height="13"
          viewBox="0 0 11 13"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M5.5 1C5.5 1 8.5 3.5 8.5 6.5C8.5 8.433 7.157 10 5.5 10C3.843 10 2.5 8.433 2.5 6.5C2.5 5.5 3 4.5 3 4.5C3 4.5 3.5 5.5 4 5.5C4 3.5 5.5 1 5.5 1Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 10C5.5 10 4.5 11 4.5 11.5C4.5 12.052 4.948 12.5 5.5 12.5C6.052 12.5 6.5 12.052 6.5 11.5C6.5 11 5.5 10 5.5 10Z"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>

        {/* Numeric count in DM Mono per data/numbers rule */}
        <span style={{ fontFamily: "var(--font-mono)" }}>{count}</span>
      </span>
    </div>
  );
}
