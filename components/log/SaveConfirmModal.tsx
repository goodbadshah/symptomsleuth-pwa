"use client";

import { useEffect, useRef } from "react";
import type { LogMessage } from "@/utils/logMessages";

const DISMISS_AFTER = 4000; // ms

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  message: LogMessage | null;
  streak: number;
}

/**
 * Post-save bottom sheet modal.
 *
 * CLAUDE.md compliance:
 * - Bottom sheet slide-up: cubic-bezier(0.32, 0.72, 0, 1) 300ms (CLAUDE.md bottom sheet spec)
 * - Backdrop: backdrop-blur-sm - permitted for overlays per CLAUDE.md §7
 * - Double-bezel architecture: outer shell + inner core with inset highlight
 * - Drain bar: scaleX transform - "animate exclusively via transform and opacity" rule satisfied
 *   (linear timing is a deliberate exception, same as shimmer - countdown must be constant-rate)
 * - Streak pill: eyebrow tag pattern (accent-light / accent) - CLAUDE.md §3
 * - Flame SVG: inline stroke SVG - no emoji, no icon library dependency
 * - No bounce, no spring, no JS per-frame animation
 * - Auto-dismisses via setTimeout, not a polling interval
 */
export default function SaveConfirmModal({ isOpen, onDismiss, message, streak }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    timerRef.current = setTimeout(onDismiss, DISMISS_AFTER);
    return () => clearTimeout(timerRef.current);
  }, [isOpen, onDismiss]);

  if (!isOpen || !message) return null;

  return (
    <>
      {/* ── Keyframe definitions ── */}
      <style>{`
        @keyframes st-slide-up {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes st-drain {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        onClick={onDismiss}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(26, 26, 26, 0.28)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 60,
        }}
      />

      {/* ── Bottom sheet ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log saved"
        aria-live="polite"
        onClick={onDismiss}
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          width: "100%",
          maxWidth: "480px",
          zIndex: 61,
          padding: "0 12px 32px",
          animation: `st-slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1) both`,
        }}
      >
        {/* Outer bezel */}
        <div
          style={{
            borderRadius: "1.25rem",
            padding: "6px",
            backgroundColor: "var(--bg-surface)",
            boxShadow:
              "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(26,26,26,0.18)",
            overflow: "hidden",
          }}
        >
          {/* Drain bar - 2px, scaleX from 1→0 over DISMISS_AFTER ms */}
          <div
            style={{
              height: "2px",
              backgroundColor: "var(--accent-light)",
              marginBottom: "4px",
              borderRadius: "2px 2px 0 0",
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "var(--accent)",
                transformOrigin: "left",
                animation: `st-drain ${DISMISS_AFTER}ms linear forwards`,
              }}
            />
          </div>

          {/* Inner bezel */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "calc(1.25rem - 0.375rem)",
              boxShadow: "var(--bezel-inset-shadow)",
              padding: "20px 20px 16px",
            }}
          >
            {/* Streak pill - only shown when streak ≥ 1 */}
            {streak >= 1 && (
              <div style={{ marginBottom: "14px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "9999px",
                    padding: "2px 10px 2px 7px",
                    backgroundColor: "var(--accent-light)",
                    fontSize: "10px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.12em",
                    color: "var(--accent)",
                  }}
                  aria-label={`Day ${streak} streak`}
                >
                  {/* Inline stroke flame - no fill, matches app's SVG icon language */}
                  <svg
                    width="9"
                    height="11"
                    viewBox="0 0 9 11"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M4.5 0.8C4.5 0.8 7 2.8 7 5.2C7 6.88 5.88 8.2 4.5 8.2C3.12 8.2 2 6.88 2 5.2C2 4.4 2.35 3.55 2.35 3.55C2.35 3.55 2.8 4.35 3.2 4.35C3.2 2.8 4.5 0.8 4.5 0.8Z"
                      stroke="var(--accent)"
                      strokeWidth="0.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.5 8.2C4.5 8.2 3.85 9.1 3.85 9.55C3.85 9.8 4.05 10 4.3 10H4.7C4.95 10 5.15 9.8 5.15 9.55C5.15 9.1 4.5 8.2 4.5 8.2Z"
                      stroke="var(--accent)"
                      strokeWidth="0.75"
                      fill="rgba(216,243,220,0.5)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    Day {streak}
                  </span>
                </span>
              </div>
            )}

            {/* Message heading - Fraunces */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: 400,
                color: "var(--text-primary)",
                margin: "0 0 8px",
                lineHeight: 1.2,
              }}
            >
              {message.heading}
            </p>

            {/* Message body - DM Sans */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                lineHeight: 1.55,
                color: "var(--text-secondary)",
                margin: "0 0 18px",
              }}
            >
              {message.body}
            </p>

            {/* Dismiss hint */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                opacity: 0.45,
                margin: 0,
                textAlign: "center" as const,
              }}
              aria-hidden="true"
            >
              Tap to dismiss
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
