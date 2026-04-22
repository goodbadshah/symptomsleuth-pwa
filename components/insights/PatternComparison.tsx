"use client";

import type { SymptomAggregate } from "@/utils/community";
import type { Symptom, DailyLog } from "@/app/providers";
import FadeIn from "@/components/ui/FadeIn";

interface Props {
  aggregateSymptoms: SymptomAggregate[];
  /** User's tracked symptoms for the current condition. */
  userSymptoms: Symptom[];
  userLogs: DailyLog[];
}

/** Average severity for a symptom from the user's local logs (value 1–4 scale). */
function getUserAvg(symptomId: string, logs: DailyLog[]): number | null {
  const values = logs
    .flatMap((l) => l.entries)
    .filter((e) => e.symptomId === symptomId && e.value > 0)
    .map((e) => e.value);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Returns a normalized bar percentage from a 1–4 value (or 1–5 legacy). */
function toBarPct(value: number): number {
  return Math.min(100, Math.round((value / 4) * 100));
}

export default function PatternComparison({ aggregateSymptoms, userSymptoms, userLogs }: Props) {
  // Only compare symptoms the user tracks that also exist in community data
  const comparisons = userSymptoms
    .map((symptom) => {
      const agg = aggregateSymptoms.find(
        (s) => s.symptomName.toLowerCase() === symptom.name.toLowerCase()
      );
      if (!agg) return null;
      const userAvg = getUserAvg(symptom.id, userLogs);
      if (userAvg === null) return null;
      return { symptom, userAvg, communityAvg: agg.avgSeverity };
    })
    .filter(Boolean) as { symptom: Symptom; userAvg: number; communityAvg: number }[];

  if (comparisons.length === 0) return null;

  return (
    <section aria-label="Your patterns vs community">
      {/* Section header */}
      <div className="mb-4">
        <span
          className="text-[10px] uppercase tracking-[0.15em] text-[--text-secondary]"
          style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)" }}
        >
          Your Patterns
        </span>
        <h3
          className="text-[--text-primary]"
          style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", fontWeight: 400, lineHeight: 1.25 }}
        >
          vs. Community
        </h3>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {comparisons.map(({ symptom, userAvg, communityAvg }, i) => (
          <FadeIn key={symptom.id} delay={i * 80}>
            <div className="py-4">
              {/* Symptom name */}
              <p
                className="text-sm text-[--text-primary] mb-3"
                style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui)", fontWeight: 500 }}
              >
                {symptom.name}
              </p>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-6">
                {/* Personal */}
                <div>
                  <span
                    className="text-[11px] text-[--text-secondary] mb-1.5 block"
                    style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)" }}
                  >
                    Your avg: {userAvg.toFixed(1)}
                  </span>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${toBarPct(userAvg)}%`,
                        backgroundColor: "var(--accent)",
                        transition: "width 600ms cubic-bezier(0.32,0.72,0,1)",
                      }}
                    />
                  </div>
                </div>

                {/* Community */}
                <div>
                  <span
                    className="text-[11px] text-[--text-secondary] mb-1.5 block"
                    style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)" }}
                  >
                    Community avg: {communityAvg.toFixed(1)}
                  </span>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${toBarPct(communityAvg)}%`,
                        backgroundColor: "var(--community, #4A90A4)",
                        transition: "width 600ms cubic-bezier(0.32,0.72,0,1)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
