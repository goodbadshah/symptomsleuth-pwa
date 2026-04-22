"use client";

import Wordmark from "@/components/brand/Wordmark";
import StreakBadge from "@/components/ui/StreakBadge";

/**
 * AppHeader - 72px global header band, rendered in app/(app)/layout.tsx.
 *
 * Design rules:
 *  - --accent (#2D6A4F) full saturation background - load-bearing for brand
 *    recognition in UGC/TikTok. Never desaturate, never make cream.
 *  - 1px bottom border at ~60% brightness for subtle edge separation
 *  - Left: Wordmark at 48px height, 20px left padding, vertically centered
 *  - Right: StreakBadge, 20px right padding, vertically centered
 *  - NO other chrome - no menu, no icons, no back button
 */
export default function AppHeader({ showStreak = true }: { showStreak?: boolean }) {
  return (
    <header
      style={{
        height: "72px",
        backgroundColor: "var(--accent)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "20px",
        paddingRight: "20px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <Wordmark />
      {showStreak && <StreakBadge />}
    </header>
  );
}
