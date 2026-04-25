import type { AppState } from "@/app/providers";

const STORAGE_KEY = "symptomsleuth_v2";
const CURRENT_VERSION = 5;

// ─── Migration ────────────────────────────────────────────────────────────────

function migrate(raw: Record<string, unknown>): AppState {
  const version = typeof raw.version === "number" ? raw.version : 1;

  if (version < 2) {
    // v1 → v2: add communityOptIn and DailyContext support
    const profile = (raw.profile as Record<string, unknown>) ?? {};
    return migrate({
      version: 2,
      profile: {
        conditions: (profile.conditions as string[]) ?? [],
        symptoms: (profile.symptoms as AppState["profile"]["symptoms"]) ?? [],
        createdAt:
          typeof profile.createdAt === "string"
            ? profile.createdAt
            : new Date().toISOString(),
        premium: (profile.premium as AppState["profile"]["premium"]) ?? {
          type: "none",
        },
        communityOptIn: true,
      },
      logs: (raw.logs as AppState["logs"]) ?? [],
    } as Record<string, unknown>);
  }

  if (version < 3) {
    // v2 → v3: add optional userId, email, stripeCustomerId, trialEndsAt to profile
    const profile = (raw.profile as Record<string, unknown>) ?? {};
    return migrate({
      version: 3,
      profile: {
        ...profile,
        userId: (profile.userId as string | undefined) ?? undefined,
        email: (profile.email as string | undefined) ?? undefined,
        stripeCustomerId: (profile.stripeCustomerId as string | undefined) ?? undefined,
        trialEndsAt: (profile.trialEndsAt as string | undefined) ?? undefined,
      },
      logs: (raw.logs as AppState["logs"]) ?? [],
    } as Record<string, unknown>);
  }

  if (version < 4) {
    // v3 → v4: add AI fields (non-destructive - preserves all existing data)
    const profile = (raw.profile as Record<string, unknown>) ?? {};
    return migrate({
      version: 4,
      profile: {
        ...profile,
        aiUnlockedAt: (profile.aiUnlockedAt as string | undefined) ?? undefined,
        aiUsage: (profile.aiUsage as AppState["profile"]["aiUsage"]) ?? undefined,
      },
      logs: (raw.logs as AppState["logs"]) ?? [],
    } as Record<string, unknown>);
  }

  if (version < 5) {
    // v4 → v5: add supabaseLinked + awaitingAccountSetup flags for the Stripe-first
    // onboarding. Existing users with a stripeCustomerId are treated as already
    // through the account-setup gate (they installed before /welcome existed).
    const profile = (raw.profile as Record<string, unknown>) ?? {};
    const hasStripe = typeof profile.stripeCustomerId === "string" && profile.stripeCustomerId.length > 0;
    return {
      version: 5,
      profile: {
        ...profile,
        supabaseLinked:
          typeof profile.supabaseLinked === "boolean" ? profile.supabaseLinked : false,
        awaitingAccountSetup:
          typeof profile.awaitingAccountSetup === "boolean"
            ? profile.awaitingAccountSetup
            : hasStripe
              ? false
              : false,
      },
      logs: (raw.logs as AppState["logs"]) ?? [],
    } as AppState;
  }

  return raw as unknown as AppState;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function readStorage(): AppState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.version !== "number" || parsed.version < CURRENT_VERSION) {
      return migrate(parsed);
    }
    return parsed as unknown as AppState;
  } catch {
    return null;
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function writeStorage(state: AppState): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be full or unavailable - fail silently
  }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export function clearStorage(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}
