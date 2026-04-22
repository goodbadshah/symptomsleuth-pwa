import { createClient } from "@supabase/supabase-js";
import { anonymizeLogs, type AnonymousLogEntry } from "@/utils/anonymize";
import type { DailyLog, Symptom } from "@/app/providers";

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Only initialise the client when credentials are present so the module
// can be imported without crashing during local dev (env vars not set yet).
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Re-export the type so callers don't need to import from two places
export type { AnonymousLogEntry };

// ─── Aggregates types ─────────────────────────────────────────────────────────

export interface SymptomAggregate {
  symptomName: string;
  trackingCount: number;
  avgSeverity: number;
  severityDistribution: number[];
  trendDirection: "improving" | "stable" | "worsening";
}

export interface Correlation {
  factorA: string;
  factorB: string;
  percentage: number;
  sampleSize: number;
}

export interface ConditionAggregate {
  condition: string;
  totalActiveUsers: number;
  symptoms: SymptomAggregate[];
  correlations: Correlation[];
  updatedAt: string;
}

// ─── Submit anonymous log ─────────────────────────────────────────────────────

/**
 * Anonymizes a DailyLog via utils/anonymize.ts (the single PII boundary)
 * then submits the result to /api/community/submit for server-side validation
 * and insertion. Silently fails - community features never block the user.
 */
export async function submitAnonymousLog(
  log: DailyLog,
  symptoms: Symptom[]
): Promise<void> {
  try {
    const entries = anonymizeLogs(log, symptoms);
    if (entries.length === 0) return;

    // Submit via the API route (server validates shape and uses service role key)
    await fetch("/api/community/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    });
  } catch {
    // Degrade gracefully - never block the user
  }
}

// ─── Fetch condition aggregates ───────────────────────────────────────────────

/**
 * Fetches pre-computed community aggregates for a condition.
 * Returns null if the condition has fewer than 50 active users or on error.
 */
export async function fetchConditionAggregates(
  condition: string
): Promise<ConditionAggregate | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("condition_aggregates")
      .select("*")
      .eq("condition", condition)
      .single();

    if (error || !data) return null;

    const aggregate = data as ConditionAggregate;

    // Enforce minimum threshold - never show insights with < 50 active users
    if (aggregate.totalActiveUsers < 50) return null;

    return aggregate;
  } catch {
    return null;
  }
}
