"use client";

/**
 * PaperGround - warm paper-grain noise overlay applied once in the app shell.
 *
 * Rules:
 *  - Fixed full-screen, z-index: 0, pointer-events: none (never blocks taps)
 *  - Rendered only on the base background shell - never on cards, chips,
 *    buttons, inputs, or any interactive surface
 *  - Opacity driven by --paper-noise-opacity: 0.03
 *
 * Implementation: inline SVG feTurbulence + feColorMatrix warmed toward
 * #D4CFBF (212,207,191) to kill the flat screen feel without skeuomorphism.
 */
export default function PaperGround() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: "var(--paper-noise-opacity, 0.03)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <filter id="paper-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          {/* Warm the noise toward #D4CFBF - 212/255≈0.831, 207/255≈0.812, 191/255≈0.749 */}
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.831
                    0 0 0 0 0.812
                    0 0 0 0 0.749
                    0 0 0 1 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>
    </div>
  );
}
