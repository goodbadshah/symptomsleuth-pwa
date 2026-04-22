"use client";

import { useEffect } from "react";
import { useAppState } from "@/app/providers";

export interface AIAccessState {
  isAIThresholdMet: boolean;
  hasAIAccess: boolean;
  isPremium: boolean;
  loggedDaysCount: number;
  totalLogEntries: number;
  daysRemaining: number;
  logsRemaining: number;
  aiUnlockedAt: string | undefined;
}

/**
 * useAIAccess - computes AI Sleuth access state from AppState.
 *
 * Access gates:
 *  - isAIThresholdMet: loggedDaysCount >= 14 AND totalLogEntries >= 20
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
  const isAIThresholdMet = loggedDaysCount >= 14 && totalLogEntries >= 20;

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

  return {
    isAIThresholdMet,
    hasAIAccess: isAIThresholdMet && isPremium,
    isPremium,
    loggedDaysCount,
    totalLogEntries,
    daysRemaining: Math.max(0, 14 - loggedDaysCount),
    logsRemaining: Math.max(0, 20 - totalLogEntries),
    aiUnlockedAt: profile.aiUnlockedAt,
  };
}
