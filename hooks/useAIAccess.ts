"use client";

import { useEffect } from "react";
import { useAppState } from "@/app/providers";

export type ProgressiveInsightLevel = "none" | "seedling" | "growing" | "mature";

export interface AIAccessState {
  isAIThresholdMet: boolean;
  hasAIAccess: boolean;
  isPremium: boolean;
  loggedDaysCount: number;
  totalLogEntries: number;
  daysRemaining: number;
  logsRemaining: number;
  aiUnlockedAt: string | undefined;
  /**
   * Progressive accrual level for the hybrid Sleuth model.
   *  - none      (0–2 days)   no insight yet, only progress copy
   *  - seedling  (3–4 days)   first observation
   *  - growing   (5–13 days)  correlations from aiPreviewStats
   *  - mature    (14+ days)   chat surface available (premium)
   */
  progressiveInsightLevel: ProgressiveInsightLevel;
}

const DAYS_THRESHOLD = 14;
const ENTRIES_THRESHOLD = 15;

/**
 * useAIAccess - computes AI Sleuth access state from AppState.
 *
 * Access gates:
 *  - isAIThresholdMet: loggedDaysCount >= 14 AND totalLogEntries >= 15
 *  - hasAIAccess: isAIThresholdMet AND isPremium (trial counts as premium)
 *
 * Side effect: when isAIThresholdMet first becomes true, dispatches
 * SET_AI_UNLOCKED_AT with the current timestamp if aiUnlockedAt is unset.
 */
export function useAIAccess(): AIAccessState {
  const { state, dispatch } = useAppState();
  const { logs, profile } = state;

  const loggedDaysCount = new Set(logs.map((l) => l.date)).size;
  const totalLogEntries = logs.reduce((sum, l) => sum + l.entries.length, 0);
  const isAIThresholdMet =
    loggedDaysCount >= DAYS_THRESHOLD && totalLogEntries >= ENTRIES_THRESHOLD;

  // Premium / trial check
  const premium = profile.premium;
  const now = new Date();
  const trialEnd = profile.trialEndsAt ? new Date(profile.trialEndsAt) : null;
  const isTrialActive = trialEnd ? now < trialEnd : false;
  const hasPaidPremium =
    (premium.type === "monthly" || premium.type === "annual") &&
    !!premium.expiresAt &&
    now < new Date(premium.expiresAt);
  const isPremium = hasPaidPremium || isTrialActive;

  // Record the moment the AI threshold is first met
  useEffect(() => {
    if (isAIThresholdMet && !profile.aiUnlockedAt) {
      dispatch({ type: "SET_AI_UNLOCKED_AT", payload: new Date().toISOString() });
    }
  }, [isAIThresholdMet, profile.aiUnlockedAt, dispatch]);

  let progressiveInsightLevel: ProgressiveInsightLevel = "none";
  if (loggedDaysCount >= DAYS_THRESHOLD) progressiveInsightLevel = "mature";
  else if (loggedDaysCount >= 5) progressiveInsightLevel = "growing";
  else if (loggedDaysCount >= 3) progressiveInsightLevel = "seedling";

  return {
    isAIThresholdMet,
    hasAIAccess: isAIThresholdMet && isPremium,
    isPremium,
    loggedDaysCount,
    totalLogEntries,
    daysRemaining: Math.max(0, DAYS_THRESHOLD - loggedDaysCount),
    logsRemaining: Math.max(0, ENTRIES_THRESHOLD - totalLogEntries),
    aiUnlockedAt: profile.aiUnlockedAt,
    progressiveInsightLevel,
  };
}
