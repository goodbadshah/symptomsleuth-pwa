"use client";

import { useState } from "react";
import type { DailyLog, Symptom } from "@/app/providers";
import { filterLogsByRange, type DateRange } from "@/utils/timelineData";
import DateRangeSelector from "@/components/timeline/DateRangeSelector";
import TimelineChart from "@/components/timeline/TimelineChart";
import DailyLogList from "@/components/timeline/DailyLogList";

interface Props {
  logs: DailyLog[];
  symptoms: Symptom[];
  isPremium: boolean;
}

/**
 * TimelineSegment - composable wrapper rendered inside the Insights screen.
 * Owns the date-range state. Derives the effective range from premium status
 * so no useEffect+setState is needed; if premium lapses the view snaps to 7D
 * automatically without triggering cascading re-renders.
 */
export default function TimelineSegment({ logs, symptoms, isPremium }: Props) {
  const [range, setRange] = useState<DateRange>("7D");

  // Derive effective range - non-premium users are always clamped to 7D.
  // DateRangeSelector already blocks selecting locked ranges; this handles
  // the edge case where premium lapses while a wider range is selected.
  const effectiveRange: DateRange = isPremium ? range : "7D";

  const filteredLogs = filterLogsByRange(logs, effectiveRange);

  return (
    <div>
      {/* Date range tabs - sticky within the segment */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--bg-primary)",
          zIndex: 10,
          padding: "0 20px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <DateRangeSelector selected={effectiveRange} onChange={setRange} isPremium={isPremium} />
      </div>

      {/* Area chart with context overlay and trial gate */}
      <div style={{ padding: "16px 20px 0" }}>
        <TimelineChart
          logs={logs}
          symptoms={symptoms}
          range={effectiveRange}
          isPremium={isPremium}
        />
      </div>

      {/* Scrollable daily log list */}
      <div style={{ padding: "0 20px" }}>
        <DailyLogList logs={filteredLogs} symptoms={symptoms} />
      </div>
    </div>
  );
}
