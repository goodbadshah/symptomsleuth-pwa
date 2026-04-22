"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useInView, entryStyle } from "@/hooks/useInView";
import type { Symptom, DailyLog } from "@/app/providers";
import type { ChartDataPoint, DateRange } from "@/utils/timelineData";
import { buildChartData, filterLogsByRange, getXAxisTicks, SYMPTOM_PALETTE } from "@/utils/timelineData";
import { useRouter } from "next/navigation";
import { SeverityGlyph } from "@/utils/severityGlyphs";

// ─── Context icon SVGs (12px, inline) ─────────────────────────────────────────

function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Poor sleep">
      <path d="M9.5 7A4 4 0 1 1 5 2.5 3.2 3.2 0 0 0 9.5 7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}
function LightningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="High stress">
      <path d="M7 1.5 4 6.5h3.5L5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function RunnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Exercise">
      <circle cx="8" cy="2.5" r="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 4.5 4.5 7l1.5 1.5-1 2M6 4.5l2 1.5 1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ForkKnifeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Food triggers">
      <path d="M4 1.5v3c0 1 .7 1.5 1.5 1.5S7 5.5 7 4.5v-3M5.5 6v4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M9 1.5v9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.5 1.5c0 0 1.5.5 1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Context overlay row ───────────────────────────────────────────────────────

interface ContextOverlayProps {
  logs: DailyLog[];
  chartData: ChartDataPoint[];
}

function ContextOverlay({ logs, chartData }: ContextOverlayProps) {
  if (logs.every((l) => !l.context)) return null;

  return (
    <div
      role="img"
      aria-label="Context indicators"
      style={{
        display: "flex",
        paddingLeft: 40, // align with recharts y-axis width
        paddingRight: 6,
        marginTop: 4,
        gap: 0,
      }}
    >
      {chartData.map((point) => {
        const log = logs.find((l) => l.date === point.date);
        const ctx = log?.context;
        const icons: React.ReactNode[] = [];
        if (ctx?.sleepQuality != null && ctx.sleepQuality <= 2)
          icons.push(<MoonIcon key="moon" />);
        if (ctx?.stressLevel != null && ctx.stressLevel >= 4)
          icons.push(<LightningIcon key="lightning" />);
        if (ctx?.exercise) icons.push(<RunnerIcon key="runner" />);
        if (ctx?.foodTriggers && ctx.foodTriggers.length > 0)
          icons.push(<ForkKnifeIcon key="fork" />);

        return (
          <div
            key={point.date}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              gap: 1,
              color: "var(--text-secondary)",
              opacity: 0.6,
              minWidth: 0,
            }}
          >
            {icons}
          </div>
        );
      })}
    </div>
  );
}

// ─── Active-point detail panel (replaces floating tooltip) ────────────────────

interface ActivePoint {
  label: string;
  payload: { dataKey: string; value: number; color: string }[];
}

interface DetailPanelProps {
  active: ActivePoint | null;
  symptoms: Symptom[];
}

function DetailPanel({ active, symptoms }: DetailPanelProps) {
  return (
    <div
      style={{
        minHeight: 48,
        marginBottom: 8,
        paddingLeft: 40,
        paddingRight: 6,
        display: "flex",
        alignItems: "center",
      }}
    >
      {active && active.payload.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--text-secondary)",
            }}
          >
            {active.label}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
            {active.payload.map((item) => {
              const sym = symptoms.find((s) => s.id === item.dataKey);
              return (
                <div
                  key={item.dataKey}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      color: "var(--text-primary)",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <SeverityGlyph value={Math.round(item.value)} size={12} />
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--text-primary)",
                    }}
                  >
                    {sym?.name ?? item.dataKey}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.value}/5
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-secondary)",
            opacity: 0.5,
          }}
        >
          Tap a point to see details
        </span>
      )}
    </div>
  );
}

// ─── Legend ────────────────────────────────────────────────────────────────────

interface LegendProps {
  symptoms: Symptom[];
  hidden: Set<string>;
  onToggle: (id: string) => void;
}

function ChartLegend({ symptoms, hidden, onToggle }: LegendProps) {
  if (symptoms.length <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 12px",
        paddingLeft: 40,
        marginBottom: 12,
      }}
    >
      {symptoms.map((sym, i) => {
        const color = SYMPTOM_PALETTE[i % SYMPTOM_PALETTE.length];
        const isHidden = hidden.has(sym.id);
        return (
          <button
            key={sym.id}
            onClick={() => onToggle(sym.id)}
            aria-pressed={!isHidden}
            aria-label={`Toggle ${sym.name}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              padding: "2px 0",
              cursor: "pointer",
              opacity: isHidden ? 0.35 : 1,
              transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              {sym.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Trial gate overlay ────────────────────────────────────────────────────────

function TrialGateOverlay() {
  const router = useRouter();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        zIndex: 10,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          color: "var(--text-primary)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Unlock your full history
      </p>
      <button
        onClick={() => router.push("/upgrade")}
        aria-label="Upgrade to unlock full history"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          padding: "10px 20px 10px 16px",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        See all your data
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 5h6M5 2l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={{
        ...entryStyle(inView),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 8,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        Your trends are building
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-secondary)",
          margin: 0,
          maxWidth: 260,
          lineHeight: 1.5,
        }}
      >
        Keep logging - patterns will appear here after a few days.
      </p>
    </div>
  );
}

// ─── Main chart ────────────────────────────────────────────────────────────────

interface Props {
  logs: DailyLog[];
  symptoms: Symptom[];
  range: DateRange;
  isPremium: boolean;
}

export default function TimelineChart({ logs, symptoms, range, isPremium }: Props) {
  const { ref } = useInView();

  // Default: show only the first symptom; user can toggle more via legend
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(symptoms.slice(1).map((s) => s.id))
  );
  const [activePoint, setActivePoint] = React.useState<ActivePoint | null>(null);

  // Reset active point when range changes so stale detail panel clears
  React.useEffect(() => {
    setActivePoint(null);
  }, [range]);

  const toggleHidden = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const filteredLogs = filterLogsByRange(logs, range);
  const chartData = buildChartData(filteredLogs, symptoms);
  const dates = chartData.map((d) => d.date);
  const ticks = getXAxisTicks(dates, range);
  const showGate = !isPremium && range !== "7D";

  // Show EmptyState when there aren't enough logs OR when every logged day
  // only recorded "None" severity (value=0 is not written as an entry, so
  // chart data points will have no symptom keys at all).
  const hasData = chartData.some((point) =>
    symptoms.some((sym) => typeof point[sym.id] === "number")
  );
  if (filteredLogs.length < 2 || !hasData) return <EmptyState />;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = (data: any) => {
    if (data?.activePayload && data.activePayload.length > 0) {
      setActivePoint({
        label: data.activeLabel ?? "",
        payload: data.activePayload.map((p: { dataKey: string; value: number; color: string }) => ({
          dataKey: p.dataKey,
          value: p.value,
          color: p.color,
        })),
      });
    }
  };

  const handleMouseLeave = () => setActivePoint(null);

  return (
    <div ref={ref as React.Ref<HTMLDivElement>}>
      <ChartLegend symptoms={symptoms} hidden={hidden} onToggle={toggleHidden} />

      {/* Static detail panel — never floats, never blocks scrolling */}
      <DetailPanel active={activePoint} symptoms={symptoms} />

      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: 200,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={range}
              data={chartData}
              margin={{ top: 8, right: 6, bottom: 0, left: -10 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Only faint horizontal grid lines at each severity level */}
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.7}
              />

              <XAxis
                dataKey="dateLabel"
                ticks={ticks.map((d) => chartData.find((p) => p.date === d)?.dateLabel ?? d)}
                tick={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fill: "var(--text-secondary)",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fill: "var(--text-secondary)",
                }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              {/* Tooltip renders nothing visible — only drives the cursor line */}
              <Tooltip
                content={() => null}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />

              {symptoms.map((sym, i) => {
                const color = SYMPTOM_PALETTE[i % SYMPTOM_PALETTE.length];
                const isHidden = hidden.has(sym.id);
                return (
                  <Area
                    key={sym.id}
                    type="monotone"
                    dataKey={sym.id}
                    name={sym.name}
                    stroke={color}
                    strokeWidth={isHidden ? 0 : 2.5}
                    fill={color}
                    fillOpacity={isHidden ? 0 : 0.15}
                    dot={false}
                    activeDot={
                      isHidden
                        ? false
                        : { r: 3, fill: color, strokeWidth: 0 }
                    }
                    connectNulls
                    isAnimationActive={!isHidden}
                    animationBegin={0}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {showGate && <TrialGateOverlay />}
      </div>

      <ContextOverlay logs={filteredLogs} chartData={chartData} />
    </div>
  );
}

// React import needed for useState
import React from "react";
