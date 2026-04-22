"use client";

import { useState } from "react";
import type { Correlation } from "@/utils/community";
import ShareableInsight from "./ShareableInsight";
import FadeIn from "@/components/ui/FadeIn";

interface Props {
  correlation: Correlation;
  condition: string;
  index?: number; // for FadeIn stagger
}

// ──────────────────────────────────────────────────────────────────────────────
// Human-readable text for the factorA codes produced by the Edge Function
// ──────────────────────────────────────────────────────────────────────────────

function factorAToText(factorA: string): string {
  if (factorA === "sleep_poor")   return "poor sleep (1–2)";
  if (factorA === "stress_high")  return "high stress";
  if (factorA === "exercise_yes") return "exercise days";
  if (factorA.startsWith("food_")) return factorA.slice(5); // e.g. "food_Dairy" → "Dairy"
  return factorA;
}

function buildInsightText(correlation: Correlation, condition: string): string {
  const factorText = factorAToText(correlation.factorA);
  return `${correlation.percentage}% of ${condition} users who logged ${factorText} also logged higher severity`;
}

// ──────────────────────────────────────────────────────────────────────────────
// CorrelationCard
// ──────────────────────────────────────────────────────────────────────────────

export default function CorrelationCard({ correlation, condition, index = 0 }: Props) {
  const [showShare, setShowShare] = useState(false);

  const insightText = buildInsightText(correlation, condition);

  return (
    <>
      <FadeIn delay={index * 100}>
        <div
          className="pl-3 py-4 pr-4"
          style={{ borderLeft: "2px solid var(--community, #4A90A4)" }}
        >
          {/* Insight text */}
          <p className="text-sm text-[--text-primary] leading-relaxed mb-1.5">
            {insightText}
          </p>

          <div className="flex items-center justify-between gap-4">
            {/* Sample size */}
            <span
              className="text-[--text-secondary]"
              style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)", fontSize: "11px" }}
            >
              Based on {correlation.sampleSize.toLocaleString()} entries
            </span>

            {/* Share - text-style button, no elevation */}
            <button
              onClick={() => setShowShare(true)}
              className="text-[11px] text-[--text-secondary] underline underline-offset-2 active:opacity-60 shrink-0"
              style={{ transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1)" }}
            >
              Save
            </button>
          </div>
        </div>
      </FadeIn>

      {showShare && (
        <ShareableInsight
          insight={insightText}
          condition={condition}
          sampleSize={correlation.sampleSize}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
