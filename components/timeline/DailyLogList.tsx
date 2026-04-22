"use client";

import { useState } from "react";
import type { DailyLog, Symptom } from "@/app/providers";
import { formatLogCardDate } from "@/utils/timelineData";
import { SYMPTOM_PALETTE } from "@/utils/timelineData";
import { SeverityGlyph } from "@/utils/severityGlyphs";

// ─── Context indicator icons (10px) ───────────────────────────────────────────

function ContextDots({ log }: { log: DailyLog }) {
  const ctx = log.context;
  if (!ctx) return null;

  const indicators: string[] = [];
  if (ctx.sleepQuality != null && ctx.sleepQuality <= 2) indicators.push("Sleep");
  if (ctx.stressLevel != null && ctx.stressLevel >= 4) indicators.push("Stress");
  if (ctx.exercise) indicators.push("Exercise");
  if (ctx.foodTriggers && ctx.foodTriggers.length > 0)
    indicators.push(`${ctx.foodTriggers.length} trigger${ctx.foodTriggers.length > 1 ? "s" : ""}`);

  if (indicators.length === 0) return null;

  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 11,
        color: "var(--text-secondary)",
        opacity: 0.7,
      }}
    >
      {indicators.join(" · ")}
    </span>
  );
}

// ─── Detail panel (expanded card content) ────────────────────────────────────

function DetailPanel({ log, symptoms }: { log: DailyLog; symptoms: Symptom[] }) {
  return (
    <div
      style={{
        padding: "12px 0 4px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {log.entries.map((entry, i) => {
        const sym = symptoms.find((s) => s.id === entry.symptomId);
        if (!sym) return null;
        const color = SYMPTOM_PALETTE[
          symptoms.findIndex((s) => s.id === entry.symptomId) % SYMPTOM_PALETTE.length
        ];
        return (
          <div
            key={entry.symptomId}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)" }}>
                {sym.name}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
              {entry.value}/5
            </span>
          </div>
        );
      })}

      {log.context && (
        <div
          style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 16px",
          }}
        >
          {log.context.sleepQuality != null && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
              Sleep {log.context.sleepQuality}/5
            </span>
          )}
          {log.context.stressLevel != null && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
              Stress {log.context.stressLevel}/5
            </span>
          )}
          {log.context.exercise && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
              Exercise ✓
            </span>
          )}
          {log.context.foodTriggers && log.context.foodTriggers.length > 0 && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
              {log.context.foodTriggers.join(", ")}
            </span>
          )}
        </div>
      )}

      {log.note && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
            margin: 0,
            fontStyle: "italic",
            paddingTop: 4,
            borderTop: "1px solid var(--border)",
            lineHeight: 1.5,
          }}
        >
          {log.note}
        </p>
      )}
    </div>
  );
}

// ─── Single log row ────────────────────────────────────────────────────────────

function LogRow({ log, symptoms }: { log: DailyLog; symptoms: Symptom[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`Log for ${formatLogCardDate(log.date)}`}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "12px 0",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Date */}
        <div style={{ flex: "0 0 auto", minWidth: 72 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--text-secondary)",
              display: "block",
            }}
          >
            {formatLogCardDate(log.date).split(", ").slice(-1)[0]}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--text-secondary)",
              opacity: 0.6,
            }}
          >
            {formatLogCardDate(log.date).split(",")[0]}
          </span>
        </div>

        {/* Severity dots */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
              color: "var(--text-secondary)",
            }}
          >
            {log.entries.map((entry) => (
              <SeverityGlyph key={entry.symptomId} value={entry.value} size={12} />
            ))}
          </div>
          <ContextDots log={log} />
          {log.note && !expanded && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-secondary)",
                opacity: 0.7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {log.note}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: "var(--text-secondary)",
            opacity: 0.5,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
            marginTop: 2,
          }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && <DetailPanel log={log} symptoms={symptoms} />}
    </div>
  );
}

// ─── Main list ─────────────────────────────────────────────────────────────────

interface Props {
  logs: DailyLog[];
  symptoms: Symptom[];
}

export default function DailyLogList({ logs, symptoms }: Props) {
  if (logs.length === 0) return null;

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ marginTop: 24 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-secondary)",
          margin: "0 0 4px",
        }}
      >
        Daily logs
      </p>
      {sorted.map((log) => (
        <LogRow key={log.date} log={log} symptoms={symptoms} />
      ))}
    </div>
  );
}
