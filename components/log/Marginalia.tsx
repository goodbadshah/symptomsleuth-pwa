"use client";

import { useAppState } from "@/app/providers";

interface Props {
  symptomId: string;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dateDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Marginalia - DM Mono 11px micro-stat for symptom rows with ≥3 data points.
 *
 * Rules:
 *  - Absent on day 1 or if fewer than 3 log entries exist for this symptom
 *  - Never shown for Food Triggers
 *  - Content rotation (deterministic by ISO week):
 *    * If last log was today: "last: {value}"
 *    * If ≥7 days history: "7d avg {X.X}"
 *    * If ≥14 days history: alternate weekly between avg and trend
 */
export default function Marginalia({ symptomId }: Props) {
  const { state } = useAppState();

  // All logged entries for this symptom, newest first
  const entries = state.logs
    .filter((l) => l.entries.some((e) => e.symptomId === symptomId && e.value > 0))
    .map((l) => {
      const entry = l.entries.find((e) => e.symptomId === symptomId)!;
      return { date: l.date, value: entry.value };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  if (entries.length < 3) return null;

  const today = todayISO();

  // If the most recent entry is today, show "last: value"
  if (entries[0].date === today) {
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-secondary)",
          flexShrink: 0,
          whiteSpace: "nowrap" as const,
        }}
      >
        last: {entries[0].value}
      </span>
    );
  }

  const sevenDaysAgoStr = dateDaysAgo(7);
  const fourteenDaysAgoStr = dateDaysAgo(14);

  const last7 = entries.filter((e) => e.date >= sevenDaysAgoStr);
  const prior7 = entries.filter(
    (e) => e.date >= dateDaysAgo(14) && e.date < sevenDaysAgoStr
  );

  const has7dHistory = last7.length >= 2;
  const has14dHistory =
    entries.filter((e) => e.date >= fourteenDaysAgoStr).length >= 5 &&
    prior7.length >= 2;

  const isoWeek = getISOWeekNumber(new Date());
  const showTrend = has14dHistory && isoWeek % 2 === 0;

  if (showTrend) {
    const last7Avg = last7.reduce((s, e) => s + e.value, 0) / last7.length;
    const prior7Avg = prior7.reduce((s, e) => s + e.value, 0) / prior7.length;
    const diff = last7Avg - prior7Avg;
    const arrow = diff > 0.3 ? "↗" : diff < -0.3 ? "↘" : "→";
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-secondary)",
          flexShrink: 0,
          whiteSpace: "nowrap" as const,
        }}
      >
        trend {arrow}
      </span>
    );
  }

  if (has7dHistory) {
    const avg = last7.reduce((s, e) => s + e.value, 0) / last7.length;
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-secondary)",
          flexShrink: 0,
          whiteSpace: "nowrap" as const,
        }}
      >
        7d avg {avg.toFixed(1)}
      </span>
    );
  }

  return null;
}
