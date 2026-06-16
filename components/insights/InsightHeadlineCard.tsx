"use client";

import type { DailyLog } from "@/app/providers";
import { computeProgressiveInsight } from "@/utils/aiPreviewStats";

interface Props {
  logs: DailyLog[];
  conditions: string[];
}

/**
 * InsightHeadlineCard - the lead element on the Insights screen.
 *
 * One-sentence Fraunces headline, computed client-side from the user's
 * own data. Always present from day 1+ so the chart below it is always
 * an evidence panel for a stated answer, not a mute artifact.
 */
export default function InsightHeadlineCard({ logs, conditions }: Props) {
  const insight = computeProgressiveInsight(logs, conditions);

  return (
    <div
      style={{
        padding: 6,
        borderRadius: "1.25rem",
        background: "var(--bezel-outer-bg)",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
      }}
    >
      <div
        style={{
          padding: "20px 20px 22px",
          borderRadius: "0.875rem",
          background: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            padding: "2px 10px",
            backgroundColor:
              insight.strength === "mature" ? "var(--accent-light)" : "var(--border)",
            color:
              insight.strength === "mature" ? "var(--accent)" : "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {insight.eyebrow}
        </span>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.2,
            color: "var(--text-primary)",
            margin: "10px 0 0",
          }}
        >
          {insight.headline}
        </p>
      </div>
    </div>
  );
}
