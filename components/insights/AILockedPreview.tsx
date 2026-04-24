"use client";

import { useRouter } from "next/navigation";
import type { DailyLog } from "@/app/providers";
import { computePreviewInsight } from "@/utils/aiPreviewStats";

interface Props {
  logs: DailyLog[];
  conditions: string[];
}

/**
 * AILockedPreview - State D paywall.
 *
 * Shown when the data threshold is met but the user's premium has lapsed.
 * Displays a client-side computed insight from their real data, a blurred
 * answer preview, and the upgrade CTA.
 */
export default function AILockedPreview({ logs, conditions }: Props) {
  const router = useRouter();
  const insight = computePreviewInsight(logs, conditions);

  return (
    <div
      className="rounded-[1.25rem] p-6"
      style={{
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
        {/* Eyebrow pill - accent-light variant */}
        <span
          className="inline-flex items-center self-start rounded-full px-2.5 py-0.5"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
          }}
        >
          SLEUTH - UNLOCKED, READY WHEN YOU ARE
        </span>

        {/* Data-derived insight - Fraunces 22px */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {insight}
        </p>

        {/* Answer preview - first line visible, next two blurred */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Looking at your logged data, there&apos;s a consistent pattern worth
            noting across your last 30 days of entries.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.6,
              filter: "blur(4px)",
              userSelect: "none",
            }}
          >
            On days with low sleep quality, your severity readings trend 1.4 points
            higher on average - which holds true across 8 of your last 10 such days.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.6,
              filter: "blur(4px)",
              userSelect: "none",
            }}
          >
            The pattern stabilized after week 2, suggesting your data has enough
            signal to answer questions about triggers more reliably.
          </p>
        </div>

        {/* Primary CTA - button-in-button with trailing arrow */}
        <button
          onClick={() => router.push("/upgrade")}
          className="group active:scale-[0.98] flex items-center w-full"
          style={{
            padding: "14px 20px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            border: "none",
            cursor: "pointer",
            justifyContent: "space-between",
            transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--accent-foreground)",
            }}
          >
            Unlock Sleuth
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
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* Secondary privacy text */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Your 14 days of data stay private. Sleuth only reads what you ask it to
          see.
        </p>
    </div>
  );
}
