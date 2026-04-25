"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppState } from "@/app/providers";
import { hydrateFromSupabase } from "@/utils/hydrateFromSupabase";
import { migrateLocalData } from "@/utils/migrateLocalData";
import { readStorage } from "@/utils/storage";

/**
 * Auth landing page.
 *
 * Reached after Google OAuth, after signInWithPassword, and after a password
 * reset. When a `code` param is present we exchange it for a session;
 * otherwise we consult the existing session.
 *
 * Branches:
 *   1. Profile exists in Supabase → hydrate local state from Supabase, then
 *      route to /log (or /welcome if the row says awaiting_account_setup).
 *      Without hydration, /(app) sees conditions: [] and bounces to onboarding.
 *   2. No profile + local says payment finished → this is the OAuth signup
 *      round-trip. Run migrateLocalData here so we never bounce through
 *      /welcome's State 2 (which would auto-migrate against any lingering
 *      session — the original Bug 2 path).
 *   3. Otherwise → /upgrade?missing=1.
 */
function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { dispatch } = useAppState();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) {
        setErrorMsg("Sign-in is temporarily unavailable.");
        return;
      }

      const code = params.get("code");
      const errParam = params.get("error_description") ?? params.get("error");

      if (errParam) {
        router.replace(`/?auth_error=${encodeURIComponent(errParam)}`);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (cancelled) return;
          router.replace(`/?auth_error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (cancelled) return;

      if (!user) {
        router.replace("/upgrade?missing=1");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, awaiting_account_setup")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile) {
        const hydrated = await hydrateFromSupabase(
          user.id,
          user.created_at ?? new Date().toISOString(),
        );
        if (cancelled) return;
        if (hydrated) {
          dispatch({ type: "HYDRATE", payload: hydrated });
        }
        router.replace(profile.awaiting_account_setup ? "/welcome" : "/log");
        return;
      }

      const localState = readStorage();
      if (localState?.profile.awaitingAccountSetup) {
        const result = await migrateLocalData(user.id, localState);
        if (cancelled) return;
        if (result.ok) {
          dispatch({ type: "SET_USER_ID", payload: user.id });
          dispatch({ type: "SET_SUPABASE_LINKED", payload: true });
          dispatch({ type: "SET_AWAITING_ACCOUNT_SETUP", payload: false });
          router.replace("/install");
          return;
        }
        router.replace("/welcome?migrate_error=1");
        return;
      }

      router.replace("/upgrade?missing=1");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [params, router, dispatch]);

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ minHeight: "100dvh", padding: "24px" }}
    >
      <span
        className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"
        style={{ color: "var(--accent)" }}
        aria-label="Signing you in"
      />
      <p
        className="text-sm"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        {errorMsg ?? "Signing you in…"}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
