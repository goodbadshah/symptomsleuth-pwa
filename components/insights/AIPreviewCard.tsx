"use client";

import { getSampleQuestionForWeek } from "@/content/aiSampleQuestions";

interface Props {
  condition: string;
  weekNumber: number;
  daysRemaining: number;
  logsRemaining: number;
}

/**
 * AIPreviewCard - State B locked preview.
 *
 * Shows a rotating sample question with a skeleton "answer" to create
 * anticipation for the AI unlock. Card is NOT tappable.
 */
export default function AIPreviewCard({
  condition,
  weekNumber,
  daysRemaining,
  logsRemaining,
}: Props) {
  const sampleQuestion = getSampleQuestionForWeek(condition, weekNumber);

  const eyebrowText =
    daysRemaining > 0
      ? `ASK SLEUTH AI: UNLOCKS IN ${daysRemaining} DAY${daysRemaining === 1 ? "" : "S"}`
      : logsRemaining > 0
      ? "ASK SLEUTH AI: NEEDS MORE LOGS"
      : "ASK SLEUTH AI: UNLOCKING";

  return (
    <>
      {/* Shimmer keyframes - injected once per render, lightweight */}
      <style>{`
        @keyframes shimmer-ai {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-ai {
          background: linear-gradient(
            90deg,
            var(--border) 25%,
            rgba(255,255,255,0.6) 50%,
            var(--border) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-ai 2s ease-in-out infinite;
        }
      `}</style>

      {/* Card */}
      <div
        className="rounded-[1.25rem] p-6"
        style={{
          boxShadow: "0 0 0 1px var(--bezel-ring)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
          {/* Eyebrow pill - neutral variant */}
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5"
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {eyebrowText}
          </span>

          {/* 16px spacer */}
          <div style={{ height: 16 }} />

          {/* Sample question - Fraunces 22px weight 400 */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {sampleQuestion}
          </p>

          {/* 20px spacer */}
          <div style={{ height: 20 }} />

          {/* Skeleton answer bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[95, 82, 68].map((width, i) => (
              <div
                key={i}
                className="shimmer-ai"
                style={{
                  height: 12,
                  borderRadius: 6,
                  width: `${width}%`,
                }}
              />
            ))}
          </div>

          {/* 20px spacer */}
          <div style={{ height: 20 }} />

          {/* Footer text */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Your personal AI unlocks when your data has enough signal to answer
            you well.
          </p>
        </div>
    </>
  );
}
