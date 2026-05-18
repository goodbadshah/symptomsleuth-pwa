"use client";

import type { DailyContext } from "@/app/providers";
import SeverityChipSelector from "./SeverityChipSelector";

interface Props {
  value: DailyContext;
  onChange: (ctx: DailyContext) => void;
  showMenstrualField: boolean;
}

export default function ContextFields({
  value,
  onChange,
  showMenstrualField,
}: Props) {
  function set<K extends keyof DailyContext>(key: K, v: DailyContext[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        margin: "0 -16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          minHeight: "52px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p
          className="text-base font-medium"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Daily Lifestyle
        </p>
      </div>

      {/* Body */}
      <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingBottom: "20px" }}>
        {/* Left-border accent grouping - secondary visual hierarchy */}
        <div
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "12px",
            borderLeft: "2px solid var(--border)",
            paddingLeft: "16px",
          }}
        >
              <ChipContextRow label="How did you sleep?">
                <SeverityChipSelector
                  value={value.sleepQuality}
                  onChange={(v) => set("sleepQuality", v)}
                  label="Sleep quality"
                  customLabels={["Great", "Good", "Fair", "Poor", "Unable"]}
                />
              </ChipContextRow>

              <ChipContextRow label="Stress today?">
                <SeverityChipSelector
                  value={value.stressLevel}
                  onChange={(v) => set("stressLevel", v)}
                  label="Stress level"
                  customLabels={["None", "Low", "Medium", "High", "Extreme"]}
                />
              </ChipContextRow>

              <ChipContextRow label="Physical exertion?">
                <SeverityChipSelector
                  value={typeof value.exercise === 'number' ? value.exercise : (value.exercise ? 2 : undefined)}
                  onChange={(v) => set("exercise", v)}
                  label="Movement"
                  customLabels={["None", "Light", "Moderate", "Heavy", "Max"]}
                />
              </ChipContextRow>

              {showMenstrualField && (
                <ContextRow label="Cycle day">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={value.menstrualCycleDay ?? ""}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      set("menstrualCycleDay", isNaN(n) ? undefined : n);
                    }}
                    placeholder="-"
                    className="text-right outline-none bg-transparent"
                    style={{
                      width: 56,
                      fontSize: "16px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "2px",
                      minHeight: "44px",
                    }}
                    aria-label="Menstrual cycle day"
                  />
                </ContextRow>
              )}
              </div>
            </div>
    </div>
  );
}
function ContextRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        paddingTop: "10px",
        paddingBottom: "10px",
        borderBottom: "1px solid var(--border)",
        gap: "12px",
        minHeight: "48px",
      }}
    >
      <p
        className="text-base"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-body)",
          flexShrink: 0,
          width: "140px",
        }}
      >
        {label}
      </p>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// Column layout - label above, full-width chips below (mirrors SymptomRow)
function ChipContextRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        paddingTop: "12px",
        paddingBottom: "14px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-body)",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
