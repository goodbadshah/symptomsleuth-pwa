"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getISOWeek } from "date-fns";
import { useAppState } from "@/app/providers";
import { useAIAccess } from "@/hooks/useAIAccess";
import { useTrial } from "@/hooks/useTrial";
import TimelineSegment from "@/components/timeline/TimelineSegment";
import CommunityOverview from "@/components/insights/CommunityOverview";
import AIPreviewCard from "@/components/insights/AIPreviewCard";
import ProgressToUnlock from "@/components/insights/ProgressToUnlock";
import AIChat from "@/components/insights/AIChat";
import AILockedPreview from "@/components/insights/AILockedPreview";

// ──────────────────────────────────────────────────────────────────────────────
// Local helper components
// ──────────────────────────────────────────────────────────────────────────────

function EmptyTrailState() {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px 40px",
        gap: 12,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Your journey starts with one tap.
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          margin: 0,
        }}
      >
        Log today to begin.
      </p>
      <div style={{ height: 32 }} />
      <button
        onClick={() => router.push("/log")}
        className="group active:scale-[0.98] flex items-center"
        style={{
          padding: "14px 24px",
          borderRadius: "1.25rem",
          backgroundColor: "var(--accent)",
          border: "none",
          cursor: "pointer",
          gap: 12,
          transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            color: "#ffffff",
          }}
        >
          Start logging
        </span>
        <span
          className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
          }}
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}

interface HeroDateBlockProps {
  heading: string;
  secondary: string;
}

function HeroDateBlock({ heading, secondary }: HeroDateBlockProps) {
  return (
    <div style={{ padding: "32px 20px 8px" }}>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {heading}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {secondary}
      </p>
    </div>
  );
}

type Segment = "timeline" | "ai" | "community";

interface InsightsSegmentedControlProps {
  active: Segment;
  onChange: (s: Segment) => void;
}

function InsightsSegmentedControl({ active, onChange }: InsightsSegmentedControlProps) {
  const segments: { id: Segment; label: string }[] = [
    { id: "ai", label: "Sleuth AI" },
    { id: "timeline", label: "Timeline" },
    { id: "community", label: "Community" },
  ];

  return (
    <div
      style={{
        display: "flex",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        marginBottom: 0,
      }}
    >
      {segments.map((seg) => {
        const isActive = active === seg.id;
        return (
          <button
            key={seg.id}
            onClick={() => onChange(seg.id)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              padding: "8px 0",
              cursor: "pointer",
              marginBottom: -1,
              transition: "color 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms cubic-bezier(0.16,1,0.3,1)",
              height: 36,
              flex: 1,
              textAlign: "center",
            }}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { state } = useAppState();
  const { logs, profile } = state;
  const { isAIThresholdMet, hasAIAccess, loggedDaysCount, daysRemaining, logsRemaining, totalLogEntries } =
    useAIAccess();
  const { isPremium } = useTrial();
  const [activeSegment, setActiveSegment] = useState<Segment>("ai");

  const condition = profile.conditions[0] ?? "Other";
  const weekNumber = getISOWeek(new Date());
  const hasNoLogs = loggedDaysCount === 0;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Hero */}
      <HeroDateBlock
        heading="Insights"
        secondary={hasNoLogs ? "No entries yet" : `Week ${Math.max(1, Math.ceil(loggedDaysCount / 7))}`}
      />

      {/* Segmented control */}
      <InsightsSegmentedControl active={activeSegment} onChange={setActiveSegment} />

      {/* Timeline segment */}
      {activeSegment === "timeline" && (
        <TimelineSegment logs={logs} symptoms={profile.symptoms} isPremium={isPremium} />
      )}

      {/* AI segment - four internal states (empty state rendered inline when no logs) */}
      {activeSegment === "ai" && (
        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {hasNoLogs && <EmptyTrailState />}
          {!hasNoLogs && hasAIAccess && <AIChat loggedDaysCount={loggedDaysCount} />}
          {!hasNoLogs && isAIThresholdMet && !isPremium && (
            <AILockedPreview logs={logs} conditions={profile.conditions} />
          )}
          {!hasNoLogs && !isAIThresholdMet && (
            <>
              <AIPreviewCard
                condition={condition}
                weekNumber={weekNumber}
                daysRemaining={daysRemaining}
                logsRemaining={logsRemaining}
              />
              <ProgressToUnlock
                daysRemaining={daysRemaining}
                logsRemaining={logsRemaining}
                loggedDaysCount={loggedDaysCount}
                totalLogEntries={totalLogEntries}
              />
            </>
          )}
        </div>
      )}

      {/* Community segment */}
      {activeSegment === "community" && (
        <div style={{ padding: "20px 16px" }}>
          <CommunityOverview conditions={profile.conditions} />
        </div>
      )}

      {/* Legacy placeholder block removed - reset action moved to Account page */}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy shim - keep old unused exports working until fully removed
// ──────────────────────────────────────────────────────────────────────────────
// (none needed - file is fully replaced)
