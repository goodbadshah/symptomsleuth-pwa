"use client";

import { useRouter } from "next/navigation";
import type { DailyLog } from "@/app/providers";
import { computeSleuthNoticedBullets } from "@/utils/aiPreviewStats";

interface Props {
  logs: DailyLog[];
  conditions: string[];
  daysRemaining: number;
  loggedDaysCount: number;
}

/**
 * SleuthNoticedCard - "What Sleuth has noticed" accrual card.
 *
 * Shown for the seedling (3-4 days) and growing (5-13 days) progressive
 * insight levels. Bullets accrue as the user logs more days. Replaces the
 * locked-preview-with-skeleton-bars pattern - the card visibly fills up
 * each week instead of teasing a fixed unlock date.
 *
 * The CTA at the bottom drives toward /upgrade only after threshold is met
 * (handled by AILockedPreview). Below threshold there is no CTA - the gate
 * is a wait, not a wall.
 */
export default function SleuthNoticedCard({
  logs,
  conditions,
  daysRemaining,
  loggedDaysCount,
}: Props) {
  const router = useRouter();
  const bullets = computeSleuthNoticedBullets(logs, conditions);
  const showCTA = daysRemaining === 0; // mature level handled elsewhere

  return (
    <div
      style={{
        padding: 6,
        borderRadius: "1.25rem",
        background: "var(--bezel-outer-bg)",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
      }}
    >
      <div
        style={{
          padding: "20px 20px 18px",
          borderRadius: "0.875rem",
          background: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            padding: "2px 10px",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            fontFamily: "var(--font-body)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          What Sleuth has noticed
        </span>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.25,
            color: "var(--text-primary)",
            margin: "12px 0 14px",
          }}
        >
          {loggedDaysCount} day{loggedDaysCount === 1 ? "" : "s"} of patterns so far.
        </p>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {bullets.map((b, i) => (
            <li
              key={i}
              style={{
                position: "relative",
                paddingLeft: 16,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--text-primary)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              {b}
            </li>
          ))}
        </ul>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-secondary)",
            margin: "16px 0 0",
            lineHeight: 1.5,
          }}
        >
          {daysRemaining > 0
            ? `Sleuth's chat unlocks in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Keep logging to fill the page.`
            : "Sleuth's chat is ready when you are."}
        </p>

        {showCTA && (
          <button
            onClick={() => router.push("/upgrade")}
            className="group active:scale-[0.99]"
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: "1.25rem",
              background: "var(--accent)",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <span>Unlock Sleuth chat</span>
            <span
              className="group-hover:translate-x-0.5 group-hover:-translate-y-px"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              }}
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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
        )}
      </div>
    </div>
  );
}
