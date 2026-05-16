"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Password reset destination.
 *
 * Supabase emails the user a link with `?code=...` (PKCE) that lands here.
 * We exchange the code for a recovery session, then let the user set a new
 * password via `updateUser`. Once that succeeds the session becomes a normal
 * authenticated session, so we route to /auth/callback to make the same
 * profile-lookup decision as a regular sign-in.
 */
function ResetContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [stage, setStage] = useState<"exchanging" | "ready" | "submitting" | "success" | "error">(
    "exchanging",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!supabase) {
        setStage("error");
        setErrorMsg("Reset is temporarily unavailable.");
        return;
      }
      const code = params.get("code");
      const errParam = params.get("error_description") ?? params.get("error");

      if (errParam) {
        if (cancelled) return;
        setStage("error");
        setErrorMsg(errParam);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setStage("error");
          setErrorMsg(error.message);
          return;
        }
      }

      // Confirm we have a session (link could be expired/already-used).
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data?.user) {
        setStage("error");
        setErrorMsg("This reset link is invalid or expired. Request a new one.");
        return;
      }
      setStage("ready");
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match.");
      return;
    }
    setStage("submitting");
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStage("ready");
      setErrorMsg(error.message);
      return;
    }
    setStage("success");
    router.replace("/auth/callback");
  }

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: "480px",
        minHeight: "100dvh",
        padding: "64px 20px 40px",
      }}
    >
      <div className="mb-10">
        <h1
          className="text-4xl leading-tight mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        >
          Set a new password.
        </h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          Pick something at least 8 characters. You&apos;ll be signed in once you submit.
        </p>
      </div>

      {stage === "exchanging" && (
        <div className="flex flex-col items-center gap-4 my-8">
          <span
            className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"
            style={{ color: "var(--accent)" }}
            aria-label="Verifying reset link"
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Verifying reset link…
          </p>
        </div>
      )}

      {stage === "error" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}>
            {errorMsg ?? "Something went wrong."}
          </p>
          <button
            onClick={() => router.replace("/")}
            style={{
              height: "52px",
              borderRadius: "1.25rem",
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Back to sign-in
          </button>
        </div>
      )}

      {(stage === "ready" || stage === "submitting") && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="reset-password" className="sr-only">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="New password (min 8 characters)"
            disabled={stage === "submitting"}
            style={{
              height: "48px",
              padding: "0 14px",
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <label htmlFor="reset-password-confirm" className="sr-only">
            Confirm new password
          </label>
          <input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            placeholder="Confirm password"
            disabled={stage === "submitting"}
            style={{
              height: "48px",
              padding: "0 14px",
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={stage === "submitting"}
            style={{
              height: "52px",
              borderRadius: "1.25rem",
              backgroundColor: stage === "submitting" ? "var(--text-secondary)" : "var(--accent)",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: stage === "submitting" ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {stage === "submitting" ? "Updating…" : "Update password"}
          </button>
          {errorMsg && (
            <p
              className="text-xs text-center mt-1"
              style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
            >
              {errorMsg}
            </p>
          )}
        </form>
      )}

      {stage === "success" && (
        <div className="flex flex-col items-center gap-4 my-8">
          <span
            className="inline-block w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"
            style={{ color: "var(--accent)" }}
            aria-label="Signing you in"
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Signing you in…
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}
