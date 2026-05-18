"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type Dispatch,
} from "react";
import { readStorage, writeStorage } from "@/utils/storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumStatus {
  type: "none" | "monthly" | "annual" | "lifetime";
  stripeSubscriptionId?: string;
  expiresAt?: string;
}

export interface Symptom {
  id: string;
  name: string;
  condition: string;
  // All symptoms use 1-5 severity. `type` field was removed.
}

export interface SymptomEntry {
  symptomId: string;
  value: number;
}

export interface DailyContext {
  sleepQuality?: number;
  stressLevel?: number;
  exercise?: boolean | number;
  menstrualCycleDay?: number;
  foodTriggers?: string[];
}

export interface AIUsage {
  /** ISO timestamps of AI messages sent in the last 24h. Pruned on every read. Max 20 within any 24h window. */
  messages: { sentAt: string }[];
}

export interface DailyLog {
  date: string;
  entries: SymptomEntry[];
  context?: DailyContext;
  note?: string;
  loggedAt: string;
}

export interface AppState {
  version: 5;
  profile: {
    userId?: string;                // local UUID until Supabase auth; Supabase auth.uid after account setup
    email?: string;                 // collected at Stripe Checkout - billing + recovery
    supabaseLinked: boolean;        // true once /welcome account setup migrates data to Supabase
    awaitingAccountSetup: boolean;  // true after successful payment, until user completes /welcome
    stripeCustomerId?: string;
    conditions: string[];
    symptoms: Symptom[];
    createdAt: string;
    trialEndsAt?: string;
    premium: PremiumStatus;
    communityOptIn: boolean;        // defaults to true; toggle lives in Settings → Privacy, not onboarding
    aiUnlockedAt?: string;
    aiUsage?: AIUsage;
    theme?: 'light' | 'dark' | 'system';
  };
  logs: DailyLog[];
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState: AppState = {
  version: 5,
  profile: {
    conditions: [],
    symptoms: [],
    createdAt: new Date().toISOString(),
    premium: { type: "none" },
    communityOptIn: true,
    supabaseLinked: false,
    awaitingAccountSetup: false,
  },
  logs: [],
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "SET_USER_ID"; payload: string }
  | { type: "SET_SUPABASE_LINKED"; payload: boolean }
  | { type: "SET_AWAITING_ACCOUNT_SETUP"; payload: boolean }
  | { type: "SET_TRIAL_DATA"; payload: { subscriptionId: string; customerId: string; email: string; trialEndsAt: string; plan: "monthly" | "annual" } }
  | { type: "SET_LIFETIME"; payload: { customerId: string; email: string } }
  | { type: "SET_CONDITIONS"; payload: string[] }
  | { type: "SET_SYMPTOMS"; payload: Symptom[] }
  | { type: "SET_COMMUNITY_OPT_IN"; payload: boolean }
  | { type: "SET_PREMIUM"; payload: PremiumStatus }
  | { type: "SAVE_LOG"; payload: DailyLog }
  | { type: "UPDATE_LOG"; payload: DailyLog }
  | { type: "SET_AI_UNLOCKED_AT"; payload: string }
  | { type: "RECORD_AI_MESSAGE"; payload: { sentAt: string } }
  | { type: "SET_THEME"; payload: 'light' | 'dark' | 'system' }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "SET_USER_ID":
      return {
        ...state,
        profile: { ...state.profile, userId: action.payload },
      };

    case "SET_SUPABASE_LINKED":
      return {
        ...state,
        profile: { ...state.profile, supabaseLinked: action.payload },
      };

    case "SET_AWAITING_ACCOUNT_SETUP":
      return {
        ...state,
        profile: { ...state.profile, awaitingAccountSetup: action.payload },
      };

    case "SET_TRIAL_DATA": {
      const { subscriptionId, customerId, email, trialEndsAt, plan } = action.payload;
      return {
        ...state,
        profile: {
          ...state.profile,
          email,
          stripeCustomerId: customerId,
          trialEndsAt,
          awaitingAccountSetup: true,
          premium: {
            type: plan,
            stripeSubscriptionId: subscriptionId,
            expiresAt: trialEndsAt,
          },
        },
      };
    }

    case "SET_LIFETIME": {
      const { customerId, email } = action.payload;
      return {
        ...state,
        profile: {
          ...state.profile,
          email,
          stripeCustomerId: customerId,
          awaitingAccountSetup: true,
          premium: { type: "lifetime" },
        },
      };
    }

    case "SET_CONDITIONS":
      return {
        ...state,
        profile: { ...state.profile, conditions: action.payload },
      };

    case "SET_SYMPTOMS":
      return {
        ...state,
        profile: { ...state.profile, symptoms: action.payload },
      };

    case "SET_COMMUNITY_OPT_IN":
      return {
        ...state,
        profile: { ...state.profile, communityOptIn: action.payload },
      };

    case "SET_PREMIUM":
      return {
        ...state,
        profile: { ...state.profile, premium: action.payload },
      };

    case "SAVE_LOG": {
      const exists = state.logs.findIndex(
        (l) => l.date === action.payload.date
      );
      if (exists >= 0) {
        const updated = [...state.logs];
        updated[exists] = action.payload;
        return { ...state, logs: updated };
      }
      return { ...state, logs: [...state.logs, action.payload] };
    }

    case "UPDATE_LOG": {
      const idx = state.logs.findIndex((l) => l.date === action.payload.date);
      if (idx < 0) return state;
      const updated = [...state.logs];
      updated[idx] = action.payload;
      return { ...state, logs: updated };
    }

    case "SET_AI_UNLOCKED_AT":
      return {
        ...state,
        profile: { ...state.profile, aiUnlockedAt: action.payload },
      };

    case "RECORD_AI_MESSAGE": {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const prevMessages = state.profile.aiUsage?.messages ?? [];
      const pruned = prevMessages.filter((m) => m.sentAt > cutoff);
      return {
        ...state,
        profile: {
          ...state.profile,
          aiUsage: { messages: [...pruned, action.payload] },
        },
      };
    }

    case "SET_THEME":
      return {
        ...state,
        profile: { ...state.profile, theme: action.payload },
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  hydrated: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      dispatch({ type: "HYDRATE", payload: stored });
    }
     
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change (after hydration only,
  // so the empty initial state never overwrites stored data on cold open)
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(state);
  }, [state, hydrated]);

  // Apply data-theme attribute to <html> based on profile.theme preference
  useEffect(() => {
    const theme = state.profile.theme ?? 'system';
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      // 'system' — remove attribute and let @media (prefers-color-scheme) handle it
      html.removeAttribute('data-theme');
    }
  }, [state.profile.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return ctx;
}
