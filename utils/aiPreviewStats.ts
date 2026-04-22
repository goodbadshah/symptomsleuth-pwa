/**
 * Client-side AI preview stats - computes a single-sentence data-derived
 * teaser insight for the State D paywall, with zero API calls.
 */

import type { DailyLog } from "@/app/providers";

export function computePreviewInsight(
  logs: DailyLog[],
  conditions: string[]
): string {
  const loggedDaysCount = new Set(logs.map((l) => l.date)).size;

  // Defense-in-depth: should not be called below threshold
  if (loggedDaysCount < 14) {
    return "Keep logging - your patterns are starting to take shape.";
  }

  // ── 1. Low-sleep correlation ───────────────────────────────────────────────
  const lowSleepDays = logs.filter(
    (l) => l.context?.sleepQuality != null && l.context.sleepQuality <= 2
  );
  if (lowSleepDays.length >= 5) {
    const withHighSeverity = lowSleepDays.filter((l) =>
      l.entries.some((e) => e.value >= 3)
    );
    const pct = Math.round((withHighSeverity.length / lowSleepDays.length) * 100);
    if (pct > 60) {
      return "Your severity trends upward on low-sleep nights.";
    }
  }

  // ── 2. Food trigger correlation ────────────────────────────────────────────
  const triggerMap: Record<string, { total: number; highSeverity: number }> = {};
  for (const log of logs) {
    const triggers = log.context?.foodTriggers ?? [];
    const hasHighSeverity = log.entries.some((e) => e.value >= 3);
    for (const t of triggers) {
      if (!triggerMap[t]) triggerMap[t] = { total: 0, highSeverity: 0 };
      triggerMap[t].total++;
      if (hasHighSeverity) triggerMap[t].highSeverity++;
    }
  }

  let bestTrigger: string | null = null;
  let bestTriggerPct = 0;
  for (const [trigger, stats] of Object.entries(triggerMap)) {
    if (stats.total < 4) continue;
    const pct = Math.round((stats.highSeverity / stats.total) * 100);
    if (pct > 55 && pct > bestTriggerPct) {
      bestTrigger = trigger;
      bestTriggerPct = pct;
    }
  }
  if (bestTrigger) {
    const primaryCondition = conditions[0] ?? "symptoms";
    // Reference the primary condition symptom name for specificity
    const symptomRef =
      primaryCondition === "Migraine"
        ? "migraines"
        : primaryCondition === "IBS"
        ? "flares"
        : primaryCondition === "Fibromyalgia"
        ? "pain days"
        : "high-severity days";
    return `Your ${symptomRef} cluster on days you logged ${bestTrigger}.`;
  }

  // ── 3. Stress correlation ──────────────────────────────────────────────────
  const highStressDays = logs.filter(
    (l) => l.context?.stressLevel != null && l.context.stressLevel >= 3
  );
  if (highStressDays.length >= 5) {
    const withHighSeverity = highStressDays.filter((l) =>
      l.entries.some((e) => e.value >= 3)
    );
    const pct = Math.round((withHighSeverity.length / highStressDays.length) * 100);
    if (pct > 55) {
      return `Stress appears in ${pct}% of your high-severity entries.`;
    }
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return `You've logged ${loggedDaysCount} days. Your patterns are becoming clearer.`;
}
