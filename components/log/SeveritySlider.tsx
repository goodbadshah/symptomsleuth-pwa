"use client";

import { useRef, useCallback, useState } from "react";

// ─── Color palettes ────────────────────────────────────────────────────────────

const SEVERITY_HEX: Record<number, string> = {
  1: "#B7E4C7",
  2: "#95D5B2",
  3: "#FCD34D",
  4: "#F97316",
  5: "#DC2626",
};

const CONTEXT_HEX: Record<number, string> = {
  1: "#D1D1CE",
  2: "#ABABAB",
  3: "#7A7A7A",
  4: "#5E5E5E",
  5: "#4A4A4A",
};

interface Props {
  value: number; // committed integer 0–5
  onChange: (v: number) => void;
  variant?: "severity" | "context";
  label?: string;
  // Overrides visual position with a raw 0–100 percentage (used by the demo
  // animation). When set, pointer interaction is disabled and CSS position
  // transitions are suppressed so the external animator drives motion directly.
  displayPct?: number;
}

// Applied only when releasing the drag - snaps thumb to the committed integer.
const SNAP_TRANSITION = "300ms cubic-bezier(0.32,0.72,0,1)";

export default function SeveritySlider({
  value,
  onChange,
  variant = "severity",
  label = "Severity",
  displayPct,
}: Props) {
  const colors = variant === "severity" ? SEVERITY_HEX : CONTEXT_HEX;

  // Raw pointer position 0–100 while actively dragging.
  const [dragPct, setDragPct] = useState<number | null>(null);

  // Priority: live drag → external animation → committed value.
  const activePct =
    dragPct !== null
      ? dragPct
      : displayPct !== undefined
      ? displayPct
      : (value / 5) * 100;

  // Integer for color / label. Never goes below 1 once there's any fill,
  // so the thumb shows a color the moment the finger touches the track.
  const activeInt =
    activePct <= 0 ? 0 : Math.max(1, Math.min(5, Math.round(activePct / 20)));

  const fillColor =
    activeInt > 0 ? colors[activeInt] : "var(--severity-0-border)";

  // While dragging or externally animated: kill position transitions so the
  // visual follows instantly. Re-enable on release for the integer snap.
  const isDynamic = dragPct !== null || displayPct !== undefined;

  const thumbTransition = isDynamic
    ? "background-color 60ms linear"
    : `left ${SNAP_TRANSITION}, transform ${SNAP_TRANSITION}, background-color ${SNAP_TRANSITION}`;

  const fillTransition = isDynamic
    ? "background-color 60ms linear"
    : `width ${SNAP_TRANSITION}, background-color ${SNAP_TRANSITION}`;

  const labelTransition = isDynamic
    ? "opacity 60ms linear"
    : `opacity ${SNAP_TRANSITION}`;

  const trackRef = useRef<HTMLDivElement>(null);

  const getPct = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (displayPct !== undefined) return; // read-only when demo controls it
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const pct = getPct(e.clientX);
      setDragPct(pct);
      onChange(Math.max(0, Math.min(5, Math.round(pct / 20))));
    },
    [getPct, onChange, displayPct]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const pct = getPct(e.clientX);
      setDragPct(pct);
      onChange(Math.max(0, Math.min(5, Math.round(pct / 20))));
    },
    [getPct, onChange]
  );

  const handlePointerUp = useCallback(() => {
    // Clearing dragPct lets the committed integer value take over and the
    // SNAP_TRANSITION smoothly animates the thumb to its final position.
    setDragPct(null);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        minHeight: "48px",
      }}
    >
      {/* Track + thumb + pointer interaction layer */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          height: "48px",
          touchAction: "none",
          cursor: displayPct !== undefined ? "default" : "pointer",
        }}
      >
        {/* Visual track */}
        <div
          ref={trackRef}
          aria-hidden="true"
          style={{
            position: "relative",
            width: "100%",
            height: "5px",
            borderRadius: "3px",
            backgroundColor: "var(--severity-0-border)",
            overflow: "visible",
          }}
        >
          {/* Filled portion */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${activePct}%`,
              maxWidth: "100%",
              borderRadius: "3px",
              backgroundColor: fillColor,
              transition: fillTransition,
            }}
          />

          {/* Thumb */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: activePct > 0 ? `${activePct}%` : "0%",
              transform:
                activePct > 0 ? "translate(-50%, -50%)" : "translate(0, -50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor:
                activeInt > 0 ? fillColor : "var(--bg-surface)",
              border:
                activeInt > 0
                  ? "none"
                  : "2px solid var(--severity-0-border)",
              boxShadow: "0 1px 4px rgba(26,26,26,0.14)",
              transition: thumbTransition,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Hidden input - keyboard nav + screen readers only */}
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuetext={value === 0 ? "Not logged" : `${value} out of 5`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            margin: 0,
            pointerEvents: "none",
          }}
          tabIndex={0}
        />
      </div>

      {/* Numeric label */}
      <span
        aria-hidden="true"
        style={{
          width: "14px",
          textAlign: "right",
          fontSize: "15px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
          opacity: activeInt > 0 ? 1 : 0,
          transition: labelTransition,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {activeInt || ""}
      </span>
    </div>
  );
}
