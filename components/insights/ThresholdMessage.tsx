"use client";

import { useState } from "react";
import FadeIn from "@/components/ui/FadeIn";

interface Props {
  condition: string;
}

const SHARE_URL = "https://symptomsleuth.com";

/**
 * Shown when a condition has fewer than 50 active community users.
 * The share action itself is a distribution mechanic.
 */
export default function ThresholdMessage({ condition }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `I've been using SymptomSleuth to track my ${condition} symptoms. If you also have ${condition}, join me - the more of us log, the better our shared data gets. ${SHARE_URL}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText, url: SHARE_URL });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User dismissed - no error state needed
    }
  };

  return (
    <FadeIn>
      <div className="ring-1 ring-black/[0.04] bg-white/60 p-1.5 rounded-[1.25rem]">
        <div
          className="bg-[--bg-surface] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-[calc(1.25rem-0.375rem)] p-6"
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium bg-[--border] text-[--text-secondary]">
            Building
          </span>

          {/* Heading */}
          <h3
            className="mt-3 mb-3 text-[--text-primary]"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "22px", fontWeight: 400, lineHeight: 1.25 }}
          >
            Community insights are building
          </h3>

          {/* Body */}
          <p className="text-sm text-[--text-secondary] mb-6 leading-relaxed">
            We need more {condition} users logging to surface patterns. Share
            SymptomSleuth with others who have {condition} to unlock community
            insights.
          </p>

          {/* CTA - button-in-button */}
          <button
            onClick={handleShare}
            className="group flex items-center gap-3 px-5 py-3 rounded-[1.25rem] bg-[--accent] text-white active:scale-[0.98]"
            style={{ transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)" }}
          >
            <span className="text-sm font-medium">
              {copied ? "Copied!" : "Share with others"}
            </span>
            <span
              className="w-7 h-7 rounded-full bg-black/[0.12] flex items-center justify-center shrink-0 group-hover:scale-[1.05] group-hover:translate-x-0.5 group-hover:-translate-y-px"
              style={{ transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)" }}
            >
              {/* Arrow right */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </FadeIn>
  );
}
