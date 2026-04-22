import type { DailyLog, Symptom } from "@/app/providers";

export type DateRange = "7D" | "30D" | "90D" | "All";

/**
 * Muted, desaturated versions of severity colors for multi-symptom chart overlay.
 * These are deliberately de-saturated so multiple lines don't fight each other.
 */
export const SYMPTOM_PALETTE = [
  "#7BA99B", // muted sage teal
  "#A89060", // muted ochre
  "#8B7BAF", // muted mauve
  "#7B9EB5", // muted slate blue
  "#B57B7B", // muted rose
  "#7BA87B", // muted green
  "#B5A07B", // muted sand
  "#7B8FAF", // muted indigo
];

/** Returns a windowed + sorted array of logs based on the selected date range. */
export function filterLogsByRange(logs: DailyLog[], range: DateRange): DailyLog[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (range === "All") return sorted;

  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return sorted.filter((l) => l.date >= cutoffStr);
}

export interface ChartDataPoint {
  date: string;      // YYYY-MM-DD - used as x-axis key
  dateLabel: string; // human-readable (e.g. "Apr 8")
  [symptomId: string]: number | string; // symptomId → severity value
}

/** Builds the flat data array recharts expects, with one key per symptom. */
export function buildChartData(logs: DailyLog[], symptoms: Symptom[]): ChartDataPoint[] {
  return logs.map((log) => {
    const point: ChartDataPoint = {
      date: log.date,
      dateLabel: formatChartDate(log.date),
    };
    for (const sym of symptoms) {
      const entry = log.entries.find((e) => e.symptomId === sym.id);
      if (entry) point[sym.id] = entry.value;
    }
    return point;
  });
}

/** Formats YYYY-MM-DD to "Apr 8" style. */
export function formatChartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Formats YYYY-MM-DD to "Wednesday, April 8" style for log cards. */
export function formatLogCardDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** Returns x-axis tick values - subset of dates to avoid crowding */
export function getXAxisTicks(dates: string[], range: DateRange): string[] {
  if (dates.length <= 7) return dates;
  const maxTicks = range === "7D" ? 7 : range === "30D" ? 6 : 8;
  const step = Math.ceil(dates.length / maxTicks);
  return dates.filter((_, i) => i % step === 0);
}
