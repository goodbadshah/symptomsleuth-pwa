"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { readStorage } from "@/utils/storage";

/**
 * OAuth / magic-link callback.
 *
 * Must run on the client: Supabase's default PKCE flow stores the code verifier
 * in the browser, so `exchangeCodeForSession` only works where that storage
 * lives. A server route handler hits the error path and returns JSON.
 *
 * Routing decision uses ground truth, not a passed-in mode parameter:
 *   1. Profile exists in Supabase → /log (or /welcome if `awaiting_account_setup`).
 *   2. No profile yet, but local state says payment finished → /welcome to migrate.
 *   3. Otherwise no record of this user → /upgrade?missing=1 to start a trial.
 *
 * The earlier `sessionStorage` mode trick failed for magic links: Gmail opens
 * the link in a fresh tab, and sessionStorage isn't shared across tabs.
 */
function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
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
        router.replace(profile.awaiting_account_setup ? "/welcome" : "/log");
        return;
      }

      // No profile row yet. If this device just finished payment, the migration
      // hasn't run — send them to /welcome to complete it. Otherwise treat as
      // a returning sign-in for an unknown account.
      const localState = readStorage();
      if (localState?.profile.awaitingAccountSetup) {
        router.replace("/welcome");
        return;
      }

      router.replace("/upgrade?missing=1");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

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
