"use client";

import { useAppState } from "@/app/providers";

export interface TrialStatus {
  /** True if the user currently has premium access (trial active OR paid subscription active) */
  isPremium: boolean;
  /** True specifically because they are within their free trial window */
  isInTrial: boolean;
  /** True if the trial has expired AND they have not upgraded */
  isExpired: boolean;
  /** ISO string of when the trial/subscription ends, or null */
  endsAt: string | null;
}

export function useTrial(): TrialStatus {
  const { state } = useAppState();
  const { profile } = state;
  const now = Date.now();

  // Lifetime never expires
  const isLifetime = profile.premium.type === "lifetime";

  // Paid subscription active (monthly/annual with a valid expiresAt)
  const hasPaidPlan =
    isLifetime ||
    ((profile.premium.type === "monthly" || profile.premium.type === "annual") &&
      profile.premium.expiresAt != null &&
      new Date(profile.premium.expiresAt).getTime() > now);

  // Trial window: prefer server-set trialEndsAt, fall back to createdAt + 7d
  const trialEnd = profile.trialEndsAt
    ? new Date(profile.trialEndsAt).getTime()
    : new Date(profile.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;

  const isInTrial = !hasPaidPlan && now < trialEnd;
  const isPremium = hasPaidPlan || isInTrial;
  const isExpired = !isPremium;

  const endsAt = isLifetime
    ? null
    : hasPaidPlan
      ? profile.premium.expiresAt ?? null
      : profile.trialEndsAt ?? new Date(profile.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
        ? new Date(new Date(profile.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null;

  return { isPremium, isInTrial, isExpired, endsAt };
}
