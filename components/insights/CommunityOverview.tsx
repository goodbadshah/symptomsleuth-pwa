"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppState } from "@/app/providers";
import type { Symptom } from "@/app/providers";
import { useCommunity } from "@/hooks/useCommunity";
import type { SymptomAggregate } from "@/utils/community";
import ThresholdMessage from "./ThresholdMessage";
import PatternComparison from "./PatternComparison";
import CorrelationCard from "./CorrelationCard";
import FadeIn from "@/components/ui/FadeIn";

interface Props {
  /** The conditions the user is tracking (from profile.conditions). */
  conditions: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ──────────────────────────────────────────────────────────────────────────────

function CommunityOverviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 rounded-full" style={{ backgroundColor: "var(--border)" }} />
      <div className="h-4 w-full rounded-full" style={{ backgroundColor: "var(--border)" }} />
      <div className="h-4 w-5/6 rounded-full" style={{ backgroundColor: "var(--border)" }} />
      <div className="h-4 w-3/4 rounded-full" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Top Tracked Symptoms sub-section
// ──────────────────────────────────────────────────────────────────────────────

interface TopTrackedProps {
  symptoms: SymptomAggregate[];
  userSymptoms: Symptom[];
  condition: string;
  totalActiveUsers: number;
  onAddSymptom: (symptomName: string, condition: string) => void;
}

function TopTrackedSymptoms({
  symptoms,
  userSymptoms,
  condition,
  totalActiveUsers,
  onAddSymptom,
}: TopTrackedProps) {
  const trackedNames = new Set(userSymptoms.map((s) => s.name.toLowerCase()));
  const maxCount = symptoms.length > 0 ? Math.max(...symptoms.map((s) => s.trackingCount)) : 1;

  // Show up to 10 community symptoms sorted by tracking count
  const sorted = [...symptoms].sort((a, b) => b.trackingCount - a.trackingCount).slice(0, 10);

  return (
    <section aria-label="Top tracked symptoms">
      <div className="mb-4">
        <span
          className="text-[10px] uppercase tracking-[0.15em] text-[--text-secondary]"
          style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)" }}
        >
          What others track
        </span>
        <h3
          className="text-[--text-primary]"
          style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", fontWeight: 400, lineHeight: 1.25 }}
        >
          Most tracked by {condition} users
        </h3>
      </div>

      <div className="space-y-3">
        {sorted.map((symptom, i) => {
          const isTracked = trackedNames.has(symptom.symptomName.toLowerCase());
          const pct = Math.round((symptom.trackingCount / Math.max(totalActiveUsers, 1)) * 100);
          const barWidth = Math.round((symptom.trackingCount / maxCount) * 100);

          return (
            <FadeIn key={symptom.symptomName} delay={i * 60}>
              <div
                className="py-2"
                style={isTracked ? { borderLeft: "2px solid var(--accent)", paddingLeft: "8px" } : {}}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="text-sm flex-1 text-[--text-primary]"
                    style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)", fontWeight: isTracked ? 500 : 400 }}
                  >
                    {symptom.symptomName}
                  </span>
                  <span
                    className="text-[--text-secondary] shrink-0"
                    style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)", fontSize: "11px" }}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Horizontal bar */}
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: isTracked ? "var(--accent)" : "var(--community, #4A90A4)",
                      opacity: isTracked ? 1 : 0.5,
                      transition: "width 600ms cubic-bezier(0.32,0.72,0,1)",
                    }}
                  />
                </div>

                {/* "Add to tracker?" for community symptoms the user doesn't track */}
                {!isTracked && (
                  <button
                    onClick={() => onAddSymptom(symptom.symptomName, condition)}
                    className="mt-1.5 text-[11px] text-[--accent] underline underline-offset-2 active:opacity-60"
                    style={{ transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1)" }}
                  >
                    Add to your tracker?
                  </button>
                )}
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CommunityOverview - main container
// ──────────────────────────────────────────────────────────────────────────────

export default function CommunityOverview({ conditions }: Props) {
  const { state, dispatch } = useAppState();
  const { aggregates, loading, error } = useCommunity();

  // Condition tab state - first condition selected by default
  const [selectedCondition, setSelectedCondition] = useState(
    conditions[0] ?? ""
  );

  const condition = selectedCondition || conditions[0] || "";
  const userSymptoms = state.profile.symptoms.filter(
    (s) => s.condition === condition
  );

  const aggregate = aggregates.get(condition) ?? null;

  // ── Add a community symptom to the user's tracker ──
  const handleAddSymptom = (symptomName: string, forCondition: string) => {
    const newSymptom: Symptom = {
      id: uuidv4(),
      name: symptomName,
      condition: forCondition,
    };
    dispatch({
      type: "SET_SYMPTOMS",
      payload: [...state.profile.symptoms, newSymptom],
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Condition tabs - only shown when tracking multiple conditions */}
      {conditions.length > 1 && (
        <nav
          className="flex gap-0 border-b"
          style={{ borderColor: "var(--border)" }}
          aria-label="Select condition"
        >
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCondition(c)}
              className="pb-2.5 pt-1 px-4 text-sm relative"
              style={{
                fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)",
                fontWeight: selectedCondition === c ? 500 : 400,
                color: selectedCondition === c ? "var(--accent)" : "var(--text-secondary)",
                transition: "color 150ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {c}
              {selectedCondition === c && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              )}
            </button>
          ))}
        </nav>
      )}

      {/* Loading */}
      {loading && <CommunityOverviewSkeleton />}

      {/* Error - degrade silently; only show if loading finished with error */}
      {!loading && error && (
        <p className="text-sm text-[--text-secondary] text-center py-8">
          Community data unavailable right now.
        </p>
      )}

      {/* No data / below threshold */}
      {!loading && !error && (!aggregate || aggregate.totalActiveUsers < 50) && (
        <ThresholdMessage condition={condition} />
      )}

      {/* Full community data */}
      {!loading && !error && aggregate && aggregate.totalActiveUsers >= 50 && (
        <div className="space-y-8">
          {/* Hero stat - trust anchor */}
          <FadeIn>
            <p
              className="text-[--text-primary]"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.25,
              }}
            >
              Based on{" "}
              <span style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)" }}>
                {aggregate.totalActiveUsers.toLocaleString()}
              </span>{" "}
              {condition} users
            </p>
          </FadeIn>

          {/* Section 1 - Top Tracked Symptoms */}
          <TopTrackedSymptoms
            symptoms={aggregate.symptoms}
            userSymptoms={userSymptoms}
            condition={condition}
            totalActiveUsers={aggregate.totalActiveUsers}
            onAddSymptom={handleAddSymptom}
          />

          {/* Hairline divider */}
          <hr style={{ borderColor: "var(--border)" }} />

          {/* Section 2 - Pattern Comparison */}
          <PatternComparison
            aggregateSymptoms={aggregate.symptoms}
            userSymptoms={userSymptoms}
            userLogs={state.logs}
          />

          {/* Section 3 - Correlation Insights */}
          {aggregate.correlations.length > 0 && (
            <section aria-label="Correlation insights">
              <div className="mb-4">
                <span
                  className="text-[10px] uppercase tracking-[0.15em] text-[--text-secondary]"
                  style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)" }}
                >
                  Community patterns
                </span>
                <h3
                  className="text-[--text-primary]"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: 1.25,
                  }}
                >
                  Correlation Insights
                </h3>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {aggregate.correlations.map((correlation, i) => (
                  <CorrelationCard
                    key={`${correlation.factorA}-${correlation.factorB}`}
                    correlation={correlation}
                    condition={condition}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
