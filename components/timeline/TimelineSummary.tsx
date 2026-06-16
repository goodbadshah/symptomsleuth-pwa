"use client";

import type { DailyLog, Symptom } from "@/app/providers";
import { computeTimelineSummary } from "@/utils/aiPreviewStats";

interface Props {
  filteredLogs: DailyLog[];
  rangeLabel: string;
  symptoms: Symptom[];
}

/**
 * TimelineSummary - one-line Fraunces headline above the chart that gives
 * the graph a verbal answer instead of leaving it as a mute artifact.
 * Returns null when there is not enough data to summarize.
 */
export default function TimelineSummary({ filteredLogs, rangeLabel, symptoms }: Props) {
  const summary = computeTimelineSummary(filteredLogs, rangeLabel, symptoms);
  if (!summary) return null;
  return (
    <p
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 18,
        fontWeight: 400,
        lineHeight: 1.3,
        color: "var(--text-primary)",
        margin: "8px 0 12px",
      }}
    >
      {summary}
    </p>
  );
}
