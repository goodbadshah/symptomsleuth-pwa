import { supabase } from "@/lib/supabase";
import type { AppState } from "@/app/providers";

export interface MigrationResult {
  ok: boolean;
  error?: string;
}

/**
 * Moves onboarding data from localStorage into Supabase after the user has
 * completed payment and signed in. Critical: on any failure we do NOT clear
 * localStorage - the user gets to retry from /welcome without losing work.
 */
export async function migrateLocalData(userId: string, state: AppState): Promise<MigrationResult> {
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { profile, logs } = state;

  // 1. Upsert profile row. This is the gate for everything else.
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          email: profile.email ?? null,
          stripe_customer_id: profile.stripeCustomerId ?? null,
          conditions: profile.conditions,
          symptoms: profile.symptoms,
          trial_ends_at: profile.trialEndsAt ?? null,
          premium_type: profile.premium.type,
          premium_expires_at: profile.premium.expiresAt ?? null,
          stripe_subscription_id: profile.premium.stripeSubscriptionId ?? null,
          community_opt_in: profile.communityOptIn,
          awaiting_account_setup: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (error) {
      return { ok: false, error: error.message };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save profile.";
    return { ok: false, error: msg };
  }

  // 2. Insert any daily_logs captured during the trial period. Missing logs is
  //    non-fatal for the migration - the profile row is the hard requirement.
  if (logs.length > 0) {
    try {
      const rows = logs.map((log) => ({
        user_id: userId,
        date: log.date,
        entries: log.entries,
        context: log.context ?? null,
        note: log.note ?? null,
        logged_at: log.loggedAt,
      }));

      const { error } = await supabase
        .from("daily_logs")
        .upsert(rows, { onConflict: "user_id,date" });

      if (error) {
        return { ok: false, error: error.message };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save logs.";
      return { ok: false, error: msg };
    }
  }

  return { ok: true };
}
