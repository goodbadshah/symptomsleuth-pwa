"use client";

import { useRef, useCallback } from "react";

interface Props {
  /** The insight sentence to render on the card. */
  insight: string;
  /** Condition name - shown as an eyebrow above the insight text. */
  condition: string;
  /** Sample size for the footer, e.g. 3200. */
  sampleSize?: number;
  onClose: () => void;
}

/**
 * Bottom sheet + canvas renderer.
 *
 * Primary use case: saving to camera roll to show a doctor, partner, or
 * insurance reviewer - "see, it's not just me."
 * Secondary: forwarding privately via DM to someone with the same condition.
 *
 * Uses the SymptomSleuth wordmark from /public/brand/wordmark.svg.
 * Do NOT recreate the logo - load it at runtime.
 */
export default function ShareableInsight({ insight, condition, sampleSize, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateAndShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1080×1080 - square, looks right on iOS camera roll + any social share
    canvas.width = 1080;
    canvas.height = 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Background ───────────────────────────────────────────────────────
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, 1080, 1080);

    // Subtle warm border
    ctx.strokeStyle = "#E8E8E4";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1000, 1000);

    // ── Wordmark ─────────────────────────────────────────────────────────
    const img = new Image();
    img.src = "/brand/wordmark.svg";
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // proceed even if asset missing
    });

    if (img.naturalWidth > 0) {
      const logoH = 40;
      const logoW = (img.naturalWidth / img.naturalHeight) * logoH;
      ctx.drawImage(img, 80, 80, logoW, logoH);
    } else {
      // Placeholder text if SVG didn't load
      ctx.fillStyle = "#2D6A4F";
      ctx.font = "600 18px DM Sans, system-ui, sans-serif";
      ctx.fillText("SymptomSleuth", 80, 108);
    }

    // ── Condition eyebrow ─────────────────────────────────────────────────
    ctx.fillStyle = "#2D6A4F";
    ctx.font = "600 24px DM Sans, system-ui, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(condition.toUpperCase(), 80, 220);
    ctx.letterSpacing = "0px";

    // ── Insight text (word-wrapped Fraunces) ──────────────────────────────
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "400 52px Georgia, serif"; // closest canvas fallback for Fraunces
    const words = insight.split(" ");
    let line = "";
    let y = 330;
    const maxWidth = 920;
    const lineHeight = 70;

    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), 80, y);
        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), 80, y);

    // ── Sample size ───────────────────────────────────────────────────────
    if (sampleSize && sampleSize > 0) {
      ctx.fillStyle = "#6B6B6B";
      ctx.font = "400 22px DM Mono, monospace";
      ctx.fillText(`Based on ${sampleSize.toLocaleString()} entries`, 80, y + 56);
    }

    // ── Teal accent line ──────────────────────────────────────────────────
    ctx.fillStyle = "#4A90A4";
    ctx.fillRect(80, 940, 180, 3);

    // ── Footer ────────────────────────────────────────────────────────────
    ctx.fillStyle = "#6B6B6B";
    ctx.font = "400 24px DM Mono, monospace";
    ctx.fillText("symptomsleuth.com", 80, 990);

    // ── Export + share ────────────────────────────────────────────────────
    const png = canvas.toDataURL("image/png");

    try {
      const blob = await (await fetch(png)).blob();
      const file = new File([blob], "symptomsleuth-insight.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "SymptomSleuth insight" });
      } else {
        // Fall back to download
        triggerDownload(png);
      }
    } catch {
      // User dismissed share sheet - offer download as fallback
      triggerDownload(png);
    }

    onClose();
  }, [insight, condition, sampleSize, onClose]);

  return (
    <>
      {/* Hidden canvas - only used during render */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Bottom sheet */}
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Save insight"
      >
        <div
          className="ring-1 ring-black/[0.04] bg-white/60 p-1.5 rounded-[1.25rem] w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideUp 300ms cubic-bezier(0.32,0.72,0,1)" }}
        >
          <div className="bg-[--bg-surface] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-[calc(1.25rem-0.375rem)] p-5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[--text-secondary] mb-1">
              Save this insight
            </p>
            <p
              className="mb-5 text-[--text-primary]"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", fontWeight: 400, lineHeight: 1.35 }}
            >
              {insight}
            </p>

            <button
              onClick={generateAndShare}
              className="group w-full flex items-center justify-between gap-3 px-5 py-3 rounded-[1.25rem] bg-[--accent] text-white active:scale-[0.98]"
              style={{ transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)" }}
            >
              <span className="text-sm font-medium">Save to camera roll</span>
              <span
                className="w-7 h-7 rounded-full bg-black/[0.12] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-[1.05]"
                style={{ transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)" }}
              >
                {/* Download icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-sm text-[--text-secondary] active:opacity-60"
              style={{ transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

function triggerDownload(dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "symptomsleuth-insight.png";
  a.click();
}
