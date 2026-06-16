"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/app/providers";
import { useAIAccess } from "@/hooks/useAIAccess";
import { useTrial } from "@/hooks/useTrial";
import TimelineSegment from "@/components/timeline/TimelineSegment";
import CommunityOverview from "@/components/insights/CommunityOverview";
import AIChat from "@/components/insights/AIChat";
import AILockedPreview from "@/components/insights/AILockedPreview";
import InsightHeadlineCard from "@/components/insights/InsightHeadlineCard";
import SleuthNoticedCard from "@/components/insights/SleuthNoticedCard";

// ──────────────────────────────────────────────────────────────────────────────
// Empty state - day 0, no logs yet
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

// ──────────────────────────────────────────────────────────────────────────────
// Section heading - editorial eyebrow + Fraunces title
// ──────────────────────────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ padding: "0 20px", marginBottom: 8 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--text-secondary)",
          margin: "0 0 4px",
          lineHeight: 1,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page - stacked narrative layout (replaces the segmented control)
// ──────────────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { state } = useAppState();
  const { logs, profile } = state;
  const {
    hasAIAccess,
    isAIThresholdMet,
    loggedDaysCount,
    daysRemaining,
    progressiveInsightLevel,
  } = useAIAccess();
  const { isPremium } = useTrial();

  // Day 0 - single composed empty state, no other surfaces.
  if (loggedDaysCount === 0) {
    return (
      <div style={{ paddingBottom: 24 }}>
        <EmptyTrailState />
      </div>
    );
  }

  // Pick which Sleuth surface to render at the bottom of the page.
  let sleuthSurface: React.ReactNode = null;
  if (hasAIAccess) {
    sleuthSurface = <AIChat loggedDaysCount={loggedDaysCount} />;
  } else if (isAIThresholdMet && !isPremium) {
    sleuthSurface = <AILockedPreview logs={logs} conditions={profile.conditions} />;
  } else if (progressiveInsightLevel !== "none") {
    sleuthSurface = (
      <SleuthNoticedCard
        logs={logs}
        conditions={profile.conditions}
        daysRemaining={daysRemaining}
        loggedDaysCount={loggedDaysCount}
      />
    );
  }

  return (
    <div
      style={{
        paddingBottom: 80,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* 1. Hero headline - the answer */}
      <div style={{ padding: "24px 16px 0" }}>
        <InsightHeadlineCard logs={logs} conditions={profile.conditions} />
      </div>

      {/* 2. Timeline - the evidence */}
      <section>
        <SectionHeading eyebrow="THE EVIDENCE" title="Timeline" />
        <TimelineSegment logs={logs} symptoms={profile.symptoms} isPremium={isPremium} />
      </section>

      {/* 3. Community - the context */}
      <section>
        <SectionHeading eyebrow="THE CONTEXT" title="Community" />
        <div style={{ padding: "0 20px" }}>
          <CommunityOverview conditions={profile.conditions} />
        </div>
      </section>

      {/* 4. Sleuth - the conversation */}
      {sleuthSurface && (
        <section>
          <SectionHeading
            eyebrow={hasAIAccess ? "ASK SLEUTH" : "WHAT SLEUTH SEES"}
            title={hasAIAccess ? "Your sleuth" : "Patterns so far"}
          />
          <div style={{ padding: "0 16px" }}>{sleuthSurface}</div>
        </section>
      )}
    </div>
  );
}
