"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth / magic-link callback.
 *
 * Must run on the client: Supabase's default PKCE flow stores the code verifier
 * in the browser, so `exchangeCodeForSession` only works where that storage
 * lives. A server route handler hits the error path and returns JSON, which is
 * what the user sees when Google sign-in "shows JSON".
 *
 * Modes (read from sessionStorage, set by the page that initiated the flow —
 * never as a URL query string, since Supabase's redirect_to allowlist matcher
 * silently rejects URLs that carry queries and falls back to Site URL):
 *   - signin  (returning member from landing page): look up their profile.
 *             Found → /log. Not found → /upgrade?missing=1.
 *   - welcome (post-checkout from /welcome): /welcome resumes migration.
 *   - (unset) treated as signin.
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

      const mode = sessionStorage.getItem("auth_mode") ?? "signin";
      sessionStorage.removeItem("auth_mode");
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

      if (mode === "welcome") {
        router.replace("/welcome");
        return;
      }

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

      if (!profile) {
        router.replace("/upgrade?missing=1");
        return;
      }

      if (profile.awaiting_account_setup) {
        router.replace("/welcome");
        return;
      }

      router.replace("/log");
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
