/**
 * Client-side preview stats - data-derived insight strings, computed entirely
 * in the browser with zero Claude API spend.
 *
 * Powers:
 *   - InsightStrip on the Log screen (every state from day 0+)
 *   - SaveConfirmModal post-save delta
 *   - TimelineSummary headline above the chart
 *   - "What Sleuth has noticed" accrual card on Insights
 *   - AILockedPreview teaser (legacy entry point: computePreviewInsight)
 */

import type { DailyLog, Symptom } from "@/app/providers";

// ──────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────────────────────

function loggedDays(logs: DailyLog[]): number {
  return new Set(logs.map((l) => l.date)).size;
}

function symptomRefForCondition(primaryCondition: string | undefined): string {
  if (primaryCondition === "Migraine") return "migraines";
  if (primaryCondition === "IBS") return "flares";
  if (primaryCondition === "Fibromyalgia") return "pain days";
  if (primaryCondition === "PCOS" || primaryCondition === "Endometriosis") return "flares";
  return "high-severity days";
}

function avgSeverity(logs: DailyLog[]): number | null {
  let total = 0;
  let count = 0;
  for (const l of logs) {
    for (const e of l.entries) {
      if (e.value >= 1) {
        total += e.value;
        count += 1;
      }
    }
  }
  return count > 0 ? total / count : null;
}

function weekdayName(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(y, m - 1, d));
}

function findFoodTriggerCorrelation(
  logs: DailyLog[],
  minOccurrences: number,
  minPct: number
): { trigger: string; pct: number } | null {
  const map: Record<string, { total: number; high: number }> = {};
  for (const log of logs) {
    const triggers = log.context?.foodTriggers ?? [];
    const high = log.entries.some((e) => e.value >= 3);
    for (const t of triggers) {
      if (!map[t]) map[t] = { total: 0, high: 0 };
      map[t].total += 1;
      if (high) map[t].high += 1;
    }
  }
  let best: { trigger: string; pct: number } | null = null;
  for (const [trigger, stats] of Object.entries(map)) {
    if (stats.total < minOccurrences) continue;
    const pct = Math.round((stats.high / stats.total) * 100);
    if (pct >= minPct && (!best || pct > best.pct)) {
      best = { trigger, pct };
    }
  }
  return best;
}

function findLowSleepCorrelation(
  logs: DailyLog[],
  minOccurrences: number,
  minPct: number
): number | null {
  const lowSleep = logs.filter(
    (l) => l.context?.sleepQuality != null && l.context.sleepQuality <= 2
  );
  if (lowSleep.length < minOccurrences) return null;
  const high = lowSleep.filter((l) => l.entries.some((e) => e.value >= 3));
  const pct = Math.round((high.length / lowSleep.length) * 100);
  return pct >= minPct ? pct : null;
}

function findStressCorrelation(
  logs: DailyLog[],
  minOccurrences: number,
  minPct: number
): number | null {
  const high = logs.filter(
    (l) => l.context?.stressLevel != null && l.context.stressLevel >= 3
  );
  if (high.length < minOccurrences) return null;
  const withSeverity = high.filter((l) => l.entries.some((e) => e.value >= 3));
  const pct = Math.round((withSeverity.length / high.length) * 100);
  return pct >= minPct ? pct : null;
}

function findWorstDay(logs: DailyLog[]): DailyLog | null {
  let worst: DailyLog | null = null;
  let worstAvg = 0;
  for (const log of logs) {
    if (log.entries.length === 0) continue;
    const avg = log.entries.reduce((s, e) => s + e.value, 0) / log.entries.length;
    if (avg > worstAvg) {
      worstAvg = avg;
      worst = log;
    }
  }
  return worstAvg >= 2 ? worst : null;
}

function computeWeekOverWeekTrend(logs: DailyLog[]): string | null {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 8) return null;
  const mid = Math.floor(sorted.length / 2);
  const earlier = sorted.slice(0, mid);
  const later = sorted.slice(mid);
  const earlyAvg = avgSeverity(earlier);
  const lateAvg = avgSeverity(later);
  if (earlyAvg == null || lateAvg == null) return null;
  const diff = lateAvg - earlyAvg;
  if (Math.abs(diff) < 0.4) return null;
  if (diff < 0) {
    return `Your severity is trending down (${lateAvg.toFixed(1)} vs ${earlyAvg.toFixed(1)} earlier).`;
  }
  return `Your severity is trending up (${lateAvg.toFixed(1)} vs ${earlyAvg.toFixed(1)} earlier).`;
}

// ──────────────────────────────────────────────────────────────────────────────
// computeProgressiveInsight - single-sentence headline that strengthens with data
// ──────────────────────────────────────────────────────────────────────────────

export interface ProgressiveInsight {
  /** Short eyebrow tag (uppercase, tracked) */
  eyebrow: string;
  /** Single-sentence Fraunces headline */
  headline: string;
  /** Strength of the claim - drives UI styling */
  strength: "none" | "seedling" | "growing" | "mature";
}

export function computeProgressiveInsight(
  logs: DailyLog[],
  conditions: string[]
): ProgressiveInsight {
  const days = loggedDays(logs);
  const primary = conditions[0];

  if (days === 0) {
    return {
      eyebrow: "BUILDING YOUR TRAIL",
      headline: "Your first taps start the pattern.",
      strength: "none",
    };
  }

  if (days <= 2) {
    return {
      eyebrow: "BUILDING YOUR TRAIL",
      headline: `${days} day${days === 1 ? "" : "s"} logged. Sleuth needs a few more to find a pattern.`,
      strength: "none",
    };
  }

  if (days <= 4) {
    const worst = findWorstDay(logs);
    if (worst) {
      return {
        eyebrow: "FIRST PATTERN",
        headline: `Your worst day so far was ${weekdayName(worst.date)}.`,
        strength: "seedling",
      };
    }
    return {
      eyebrow: "FIRST PATTERN",
      headline: `${days} days logged. Patterns are forming.`,
      strength: "seedling",
    };
  }

  if (days <= 13) {
    const sleep = findLowSleepCorrelation(logs, 3, 55);
    if (sleep != null) {
      return {
        eyebrow: "WHAT SLEUTH SEES",
        headline: "Your worst days lean toward your low-sleep nights.",
        strength: "growing",
      };
    }
    const food = findFoodTriggerCorrelation(logs, 3, 55);
    if (food) {
      return {
        eyebrow: "WHAT SLEUTH SEES",
        headline: `Your ${symptomRefForCondition(primary)} cluster on days you logged ${food.trigger}.`,
        strength: "growing",
      };
    }
    const stress = findStressCorrelation(logs, 3, 55);
    if (stress != null) {
      return {
        eyebrow: "WHAT SLEUTH SEES",
        headline: `Stress shows up on ${stress}% of your high-severity days.`,
        strength: "growing",
      };
    }
    const trend = computeWeekOverWeekTrend(logs);
    if (trend) {
      return {
        eyebrow: "WHAT SLEUTH SEES",
        headline: trend,
        strength: "growing",
      };
    }
    return {
      eyebrow: "WHAT SLEUTH SEES",
      headline: `${days} days in. Keep logging - the patterns are getting clearer.`,
      strength: "growing",
    };
  }

  // Days 14+: stricter thresholds, the same surface AILockedPreview reads from
  const sleep = findLowSleepCorrelation(logs, 5, 60);
  if (sleep != null) {
    return {
      eyebrow: "SLEUTH",
      headline: "Your severity trends upward on low-sleep nights.",
      strength: "mature",
    };
  }
  const food = findFoodTriggerCorrelation(logs, 4, 55);
  if (food) {
    return {
      eyebrow: "SLEUTH",
      headline: `Your ${symptomRefForCondition(primary)} cluster on days you logged ${food.trigger}.`,
      strength: "mature",
    };
  }
  const stress = findStressCorrelation(logs, 5, 55);
  if (stress != null) {
    return {
      eyebrow: "SLEUTH",
      headline: `Stress appears in ${stress}% of your high-severity entries.`,
      strength: "mature",
    };
  }
  return {
    eyebrow: "SLEUTH",
    headline: `${days} days logged. Your patterns are clearer than most.`,
    strength: "mature",
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// computePostSaveDelta - one sentence about what changed with today's entry
// ──────────────────────────────────────────────────────────────────────────────

export function computePostSaveDelta(
  logs: DailyLog[],
  todayDate: string,
  conditions: string[]
): string | null {
  const today = logs.find((l) => l.date === todayDate);
  if (!today) return null;
  const prior = logs.filter((l) => l.date !== todayDate);
  const days = loggedDays(prior);

  if (days < 2) return null;

  const todayHigh = today.entries.some((e) => e.value >= 3);
  const todayHasStress = (today.context?.stressLevel ?? 0) >= 3;
  const todayLowSleep = today.context?.sleepQuality != null && today.context.sleepQuality <= 2;
  const todayTriggers = today.context?.foodTriggers ?? [];

  if (todayHasStress) {
    const sorted = [...prior].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 1;
    for (const l of sorted) {
      if ((l.context?.stressLevel ?? 0) >= 3) streak += 1;
      else break;
    }
    if (streak >= 3) return `That's ${streak} days in a row with reported stress 3 or higher.`;
  }

  if (todayHigh && todayTriggers.length > 0) {
    for (const t of todayTriggers) {
      const priorCount = prior.filter((l) => {
        const triggers = l.context?.foodTriggers ?? [];
        const high = l.entries.some((e) => e.value >= 3);
        return high && triggers.includes(t);
      }).length;
      if (priorCount === 0) return `First time you've logged ${t} on a high-severity day.`;
    }
  }

  if (conditions[0] && days >= 7) {
    const trend = computeRecentSevenVsPriorSeven(logs, todayDate);
    if (trend) return trend;
  }

  if (todayLowSleep && todayHigh) {
    return "Low sleep and high severity together today - one to watch.";
  }

  return null;
}

function computeRecentSevenVsPriorSeven(logs: DailyLog[], todayDate: string): string | null {
  const today = new Date(todayDate);
  const ms = 86400000;
  const recent: DailyLog[] = [];
  const prior: DailyLog[] = [];
  for (const log of logs) {
    const d = new Date(log.date);
    const diffDays = Math.round((today.getTime() - d.getTime()) / ms);
    if (diffDays >= 0 && diffDays < 7) recent.push(log);
    else if (diffDays >= 7 && diffDays < 14) prior.push(log);
  }
  if (recent.length < 3 || prior.length < 3) return null;
  const r = avgSeverity(recent);
  const p = avgSeverity(prior);
  if (r == null || p == null) return null;
  const diff = r - p;
  if (Math.abs(diff) < 0.4) return null;
  if (diff < 0) return `Severity trending down this week - avg ${r.toFixed(1)} vs ${p.toFixed(1)} last week.`;
  return `Severity trending up this week - avg ${r.toFixed(1)} vs ${p.toFixed(1)} last week.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// computeTimelineSummary - short Fraunces headline above the chart
// ──────────────────────────────────────────────────────────────────────────────

export function computeTimelineSummary(
  filteredLogs: DailyLog[],
  rangeLabel: string,
  _symptoms: Symptom[]
): string | null {
  if (filteredLogs.length === 0) return null;
  const avg = avgSeverity(filteredLogs);
  if (avg == null) return null;

  let worstDay: { date: string; avg: number } | null = null;
  for (const log of filteredLogs) {
    if (log.entries.length === 0) continue;
    const dayAvg = log.entries.reduce((s, e) => s + e.value, 0) / log.entries.length;
    if (!worstDay || dayAvg > worstDay.avg) worstDay = { date: log.date, avg: dayAvg };
  }

  const spike = worstDay && worstDay.avg >= 3 ? `, 1 spike on ${weekdayName(worstDay.date)}` : "";
  const rangePhrase = rangeLabel === "All" ? "All time" : `Last ${rangeLabel.replace("D", " days")}`;
  return `${rangePhrase}: avg severity ${avg.toFixed(1)}${spike}.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// computeSleuthNoticedBullets - accrual card content; grows with days logged
// ──────────────────────────────────────────────────────────────────────────────

export function computeSleuthNoticedBullets(
  logs: DailyLog[],
  conditions: string[]
): string[] {
  const days = loggedDays(logs);
  if (days < 3) return [];
  const bullets: string[] = [];
  const primary = conditions[0];

  const worst = findWorstDay(logs);
  if (worst) bullets.push(`Your worst day so far was ${weekdayName(worst.date)}.`);

  if (days >= 5) {
    const sleep = findLowSleepCorrelation(logs, 3, 55);
    if (sleep != null) {
      bullets.push("Low-sleep nights track with your higher-severity days.");
    }
    const food = findFoodTriggerCorrelation(logs, 3, 55);
    if (food) {
      bullets.push(`${food.trigger} shows up on ${food.pct}% of your high-severity days.`);
    }
  }

  if (days >= 7) {
    const stress = findStressCorrelation(logs, 4, 55);
    if (stress != null) {
      bullets.push(`Stress is logged on ${stress}% of your worst days.`);
    }
    const trend = computeWeekOverWeekTrend(logs);
    if (trend) bullets.push(trend);
  }

  if (bullets.length === 0) {
    bullets.push(
      `${days} days of ${symptomRefForCondition(primary)} logged. Patterns are still forming.`
    );
  }

  return bullets.slice(0, 3);
}

// ──────────────────────────────────────────────────────────────────────────────
// computePreviewInsight - LEGACY entry point used by AILockedPreview.
// Kept as a thin wrapper around computeProgressiveInsight so existing callers
// continue to work; new code should call computeProgressiveInsight directly.
// ──────────────────────────────────────────────────────────────────────────────

export function computePreviewInsight(
  logs: DailyLog[],
  conditions: string[]
): string {
  return computeProgressiveInsight(logs, conditions).headline;
}
