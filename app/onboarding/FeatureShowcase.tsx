"use client";

import { useEffect, useMemo, useState } from "react";
import SeverityChipSelector from "@/components/log/SeverityChipSelector";
import AIPreviewCard from "@/components/insights/AIPreviewCard";
import TimelineChart from "@/components/timeline/TimelineChart";
import { generateDemoData } from "@/utils/generateDemoData";

type Feature = "log" | "ai" | "timeline" | "community" | "report";

interface Props {
  feature: Feature;
  conditions: string[];
  onContinue: () => void;
  onSkip: () => void;
  stepIndex: number;
}

const FEATURE_COPY: Record<Feature, { eyebrow: string; eyebrowVariant: "neutral" | "accent"; heading: string; body: string; ctaLabel: string }> = {
  log: {
    eyebrow: "Daily Log",
    eyebrowVariant: "neutral",
    heading: "10 seconds to log how you feel",
    body: "One deliberate tap per symptom. Track what matters for your body.",
    ctaLabel: "See your log",
  },
  ai: {
    eyebrow: "Sleuth AI",
    eyebrowVariant: "accent",
    heading: "Your personal data analyst",
    body: "Ask questions about your patterns. Sleuth reads your logs, never a generic answer.",
    ctaLabel: "See Sleuth AI",
  },
  timeline: {
    eyebrow: "Timeline",
    eyebrowVariant: "neutral",
    heading: "See your patterns over time",
    body: "30, 90, or all-time views. Your trends become visible after a few weeks.",
    ctaLabel: "See your timeline",
  },
  community: {
    eyebrow: "Community",
    eyebrowVariant: "neutral",
    heading: "You're not logging into a void",
    body: "Anonymous patterns from thousands of users with your condition, so you can finally see what's normal.",
    ctaLabel: "See the community",
  },
  report: {
    eyebrow: "Doctor Report",
    eyebrowVariant: "accent",
    heading: "A report your doctor can actually use",
    body: "Clinical-quality summaries from your own data. Generated in seconds.",
    ctaLabel: "See the report",
  },
};

export default function FeatureShowcase({
  feature,
  conditions,
  onContinue,
  onSkip,
  stepIndex,
}: Props) {
  const primaryCondition = conditions[0] ?? "Migraine";

  const demo = useMemo(() => generateDemoData(primaryCondition), [primaryCondition]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [feature]);

  const copy = FEATURE_COPY[feature];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 20,
          paddingBottom: 12,
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip to plan"
          style={{
            background: "none",
            border: "none",
            padding: "4px 0",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Skip to plan →
        </button>

        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={stepIndex}
          aria-label={`Step ${stepIndex} of 5`}
          style={{ display: "flex", gap: 6 }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: i <= stepIndex ? "var(--accent)" : "var(--border)",
                transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Headline block (fade in on mount) ────────────────────────────── */}
      <div
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
          paddingBottom: 24,
          opacity: mounted ? 1 : 0,
          transition: "opacity 400ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <EyebrowTag variant={copy.eyebrowVariant}>{copy.eyebrow}</EyebrowTag>

        <h2
          style={{
            marginTop: 8,
            marginBottom: 0,
            fontFamily: "var(--font-display)",
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.15,
            color: "var(--text-primary)",
          }}
        >
          {copy.heading}
        </h2>

        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {copy.body}
        </p>
      </div>

      {/* ── Live preview (full bleed, clipped with gradient fades) ──────── */}
      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {feature === "log" && <LogPreview demo={demo} />}
          {feature === "ai" && (
            <AIPreview condition={primaryCondition} />
          )}
          {feature === "timeline" && <TimelinePreview demo={demo} />}
          {feature === "community" && (
            <CommunityPreview condition={primaryCondition} />
          )}
          {feature === "report" && <ReportPreview />}
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 40%, var(--bg-primary) 85%, var(--bg-primary) 100%)",
          }}
        />
        {/* Left edge fade */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 96,
            pointerEvents: "none",
            background: "linear-gradient(to right, var(--bg-primary), transparent)",
          }}
        />
        {/* Right edge fade */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 96,
            pointerEvents: "none",
            background: "linear-gradient(to left, var(--bg-primary), transparent)",
          }}
        />
      </div>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <div
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
          paddingBottom: 32,
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <button
          type="button"
          onClick={onContinue}
          aria-label={copy.ctaLabel}
          className="group tap-feedback"
          style={{
            width: "100%",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: "1.25rem",
            border: "none",
            cursor: "pointer",
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
            fontFamily: "var(--font-body)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 500 }}>{copy.ctaLabel}</span>
          <span
            className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.12)",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline
                points="4,2 8,6 4,10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Eyebrow tag ──────────────────────────────────────────────────────────────

function EyebrowTag({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "neutral" | "accent";
}) {
  const isAccent = variant === "accent";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        fontFamily: "var(--font-body)",
        backgroundColor: isAccent ? "var(--accent-light)" : "var(--border)",
        color: isAccent ? "var(--accent)" : "var(--text-secondary)",
      }}
    >
      {children}
    </span>
  );
}

// ─── Log preview: 3 symptom rows with pre-selected chips ──────────────────────

function LogPreview({ demo }: { demo: ReturnType<typeof generateDemoData> }) {
  const rows = demo.profile.symptoms.slice(0, 3);
  const latestLog = demo.logs[demo.logs.length - 1];

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 24 }}>
      {rows.map((sym, i) => {
        const entry = latestLog?.entries.find((e) => e.symptomId === sym.id);
        const value = entry ? Math.min(entry.value, 4) : (i + 2) % 5;
        return (
          <div key={sym.id} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: 10,
              }}
            >
              {sym.name}
            </div>
            <SeverityChipSelector
              value={value}
              onChange={() => {}}
              label={sym.name}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── AI preview ────────────────────────────────────────────────────────────────

function AIPreview({ condition }: { condition: string }) {
  const weekNumber =
    Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 52;
  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
      <AIPreviewCard
        condition={condition}
        weekNumber={weekNumber}
        daysRemaining={0}
        logsRemaining={0}
      />
    </div>
  );
}

// ─── Timeline preview ─────────────────────────────────────────────────────────

function TimelinePreview({ demo }: { demo: ReturnType<typeof generateDemoData> }) {
  return (
    <div style={{ paddingTop: 8 }}>
      <TimelineChart
        logs={demo.logs}
        symptoms={demo.profile.symptoms}
        range="30D"
        isPremium={true}
      />
    </div>
  );
}

// ─── Community preview (static mock) ──────────────────────────────────────────

function CommunityPreview({ condition }: { condition: string }) {
  const rows: { name: string; personal: number; community: number }[] = [
    { name: "Headache", personal: 3.2, community: 2.9 },
    { name: "Fatigue", personal: 2.8, community: 3.1 },
    { name: "Nausea", personal: 2.1, community: 2.4 },
  ];

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          marginBottom: 16,
          lineHeight: 1.3,
        }}
      >
        Based on 4,200 {condition} users
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map((row) => {
          const maxVal = 5;
          const personalWidth = (row.personal / maxVal) * 48;
          const communityWidth = (row.community / maxVal) * 48;
          return (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  flex: 1,
                }}
              >
                {row.name}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: `${personalWidth}px`,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      minWidth: 22,
                    }}
                  >
                    {row.personal.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: `${communityWidth}px`,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "var(--community)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      minWidth: 22,
                    }}
                  >
                    {row.community.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Report preview (static skeleton) ─────────────────────────────────────────

function ReportPreview() {
  const sections = ["Headache", "Fatigue", "Nausea"];

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
      <style>{`
        @keyframes fs-report-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .fs-report-skeleton {
          background: linear-gradient(
            90deg,
            var(--border) 25%,
            rgba(255,255,255,0.5) 50%,
            var(--border) 75%
          );
          background-size: 200% 100%;
          animation: fs-report-shimmer 2s linear infinite;
          border-radius: 4px;
          height: 12px;
        }
      `}</style>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--text-secondary)",
          marginBottom: 16,
        }}
      >
        Symptom Report, Last 30 Days
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map((name) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--text-primary)",
              }}
            >
              {name}
            </div>
            <div className="fs-report-skeleton" style={{ width: "100%" }} />
            <div className="fs-report-skeleton" style={{ width: "80%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
