import { supabase } from "@/lib/supabase";
import type { AppState, DailyLog, PremiumStatus, Symptom } from "@/app/providers";

interface ProfileRow {
  user_id: string;
  email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  conditions: string[] | null;
  symptoms: Symptom[] | null;
  trial_ends_at: string | null;
  premium_type: PremiumStatus["type"] | null;
  premium_expires_at: string | null;
  community_opt_in: boolean | null;
  awaiting_account_setup: boolean | null;
}

interface DailyLogRow {
  date: string;
  entries: DailyLog["entries"];
  context: DailyLog["context"] | null;
  note: string | null;
  logged_at: string;
}

/**
 * Build a fresh AppState from Supabase. Used by /auth/callback after a
 * returning sign-in (post-clearStorage) so localStorage gets repopulated
 * with the user's conditions, symptoms, premium state, and logs. Without
 * this, the (app) layout sees `conditions: []` and bounces to /onboarding.
 */
export async function hydrateFromSupabase(
  userId: string,
  fallbackCreatedAt: string,
): Promise<AppState | null> {
  if (!supabase) return null;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select(
      "user_id, email, stripe_customer_id, stripe_subscription_id, conditions, symptoms, trial_ends_at, premium_type, premium_expires_at, community_opt_in, awaiting_account_setup",
    )
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (profileErr || !profile) return null;

  const { data: logRows } = await supabase
    .from("daily_logs")
    .select("date, entries, context, note, logged_at")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .returns<DailyLogRow[]>();

  const logs: DailyLog[] = (logRows ?? []).map((row) => ({
    date: row.date,
    entries: row.entries,
    context: row.context ?? undefined,
    note: row.note ?? undefined,
    loggedAt: row.logged_at,
  }));

  return {
    version: 5,
    profile: {
      userId,
      email: profile.email ?? undefined,
      supabaseLinked: true,
      awaitingAccountSetup: profile.awaiting_account_setup ?? false,
      stripeCustomerId: profile.stripe_customer_id ?? undefined,
      conditions: profile.conditions ?? [],
      symptoms: profile.symptoms ?? [],
      createdAt: fallbackCreatedAt,
      trialEndsAt: profile.trial_ends_at ?? undefined,
      premium: {
        type: profile.premium_type ?? "none",
        stripeSubscriptionId: profile.stripe_subscription_id ?? undefined,
        expiresAt: profile.premium_expires_at ?? undefined,
      },
      communityOptIn: profile.community_opt_in ?? true,
    },
    logs,
  };
}
