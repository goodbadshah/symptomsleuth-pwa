"use client";

import { useState } from "react";
import type { DailyContext } from "@/app/providers";
import SeverityChipSelector from "./SeverityChipSelector";
import ToggleSwitch from "./ToggleSwitch";

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
  const [open, setOpen] = useState(false);

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
      {/* Toggle header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between tap-feedback"
          style={{
            padding: "14px 16px",
            minHeight: "52px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <p
              className="text-base font-medium"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Context
            </p>
            {/* Eyebrow pill - accent variant */}
            <span
              className="inline-flex items-center rounded-full"
              style={{
                padding: "2px 8px",
                fontSize: "10px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                backgroundColor: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              Optional
            </span>
          </div>
          <span
            aria-hidden="true"
            style={{
              color: "var(--text-secondary)",
              // Spec: collapse → cubic-bezier(0.16, 1, 0.3, 1) 400ms
              transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polyline
                points="3,6 8,11 13,6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* Collapsible body - grid-template-rows trick: 0fr → 1fr */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            // Spec: collapse/expand → cubic-bezier(0.16, 1, 0.3, 1) 400ms
            transition: "grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1)",
            overflow: "hidden",
          }}
        >
          <div style={{ minHeight: 0 }}>
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
                  value={value.sleepQuality ?? 0}
                  onChange={(v) => set("sleepQuality", v === 0 ? undefined : v)}
                  label="Sleep quality"
                  customLabels={["Skip", "Poor", "Fair", "Good", "Great"]}
                />
              </ChipContextRow>

              <ChipContextRow label="Stress today?">
                <SeverityChipSelector
                  value={value.stressLevel ?? 0}
                  onChange={(v) => set("stressLevel", v === 0 ? undefined : v)}
                  label="Stress level"
                  customLabels={["Skip", "Low", "Medium", "High", "Extreme"]}
                />
              </ChipContextRow>

              {/* Exercise - toggle stays (binary yes/no) */}
              <ContextRow label="Any exercise?">
                <ToggleSwitch
                  value={value.exercise ?? false}
                  onChange={(v) => set("exercise", v || undefined)}
                  label="Exercise today"
                />
              </ContextRow>

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
