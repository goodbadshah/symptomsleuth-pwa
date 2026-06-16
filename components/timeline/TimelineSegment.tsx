"use client";

import { useState } from "react";
import type { DailyLog, Symptom } from "@/app/providers";
import { filterLogsByRange, type DateRange } from "@/utils/timelineData";
import DateRangeSelector from "@/components/timeline/DateRangeSelector";
import TimelineChart from "@/components/timeline/TimelineChart";
import DailyLogList from "@/components/timeline/DailyLogList";
import TimelineSummary from "@/components/timeline/TimelineSummary";

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
  const effectiveRange: DateRange = isPremium ? range : "7D";
  const filteredLogs = filterLogsByRange(logs, effectiveRange);

  return (
    <div>
      {/* Date range chip row */}
      <div style={{ padding: "0 20px" }}>
        <DateRangeSelector selected={effectiveRange} onChange={setRange} isPremium={isPremium} />
      </div>

      {/* Summary headline - the graph's verbal answer */}
      <div style={{ padding: "0 20px" }}>
        <TimelineSummary filteredLogs={filteredLogs} rangeLabel={effectiveRange} symptoms={symptoms} />
      </div>

      {/* Area chart with context overlay and trial gate */}
      <div style={{ padding: "0 20px" }}>
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
