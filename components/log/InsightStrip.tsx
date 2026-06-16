"use client";

import { useRouter } from "next/navigation";
import type { DailyLog } from "@/app/providers";
import {
  computeProgressiveInsight,
  type ProgressiveInsight,
} from "@/utils/aiPreviewStats";
import type { ProgressiveInsightLevel } from "@/hooks/useAIAccess";

interface Props {
  logs: DailyLog[];
  conditions: string[];
  level: ProgressiveInsightLevel;
  daysRemaining: number;
}

/**
 * InsightStrip - persistent ~96px card on the Log screen that turns every
 * tap into a sentence about the user's body. Sits directly above the date
 * hero. Tappable; routes to /insights.
 *
 * State machine matches `progressiveInsightLevel` from useAIAccess:
 *   none      → "Your first taps start the pattern" + progress dots
 *   seedling  → first observation (worst day, etc.)
 *   growing   → live correlation from aiPreviewStats
 *   mature    → live insight + "Ask Sleuth →" affordance
 */
export default function InsightStrip({ logs, conditions, level, daysRemaining }: Props) {
  const router = useRouter();
  const insight: ProgressiveInsight = computeProgressiveInsight(logs, conditions);

  const onClick = () => router.push("/insights");
  const ctaLabel = level === "mature" ? "Ask Sleuth" : "See more";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${insight.eyebrow}: ${insight.headline}. Open insights.`}
      className="group active:scale-[0.99] block w-full text-left"
      style={{
        padding: 6,
        borderRadius: "1.25rem",
        background: "var(--bezel-outer-bg)",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        border: "none",
        cursor: "pointer",
        transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        style={{
          borderRadius: "0.875rem",
          background: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 84,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: level === "mature" ? "var(--accent)" : "var(--text-secondary)",
              lineHeight: 1,
            }}
          >
            {insight.eyebrow}
          </span>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.25,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {insight.headline}
          </p>
          {level !== "mature" && daysRemaining > 0 && (
            <ProgressDots loggedDays={14 - daysRemaining} />
          )}
        </div>

        <div
          className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 8,
            transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            {ctaLabel}
          </span>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: level === "mature" ? "var(--accent)" : "var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke={level === "mature" ? "#ffffff" : "var(--text-secondary)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

function ProgressDots({ loggedDays }: { loggedDays: number }) {
  const total = 14;
  const filled = Math.min(loggedDays, total);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
      <div
        style={{
          height: 2,
          width: 80,
          background: "var(--border)",
          borderRadius: 1,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: "100%",
            width: `${(filled / total) * 100}%`,
            background: "var(--accent)",
            transition: "width 600ms cubic-bezier(0.32,0.72,0,1)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-secondary)",
          letterSpacing: "0.03em",
        }}
      >
        {filled}/{total}
      </span>
    </div>
  );
}
