"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "signing-in" | "reset-sent" | "error";

export default function ReturningMemberSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGoogle() {
    if (!supabase) {
      setStatus("error");
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg("Sign-in failed. Please try again.");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setStatus("error");
      setErrorMsg("Please enter your password.");
      return;
    }

    setStatus("signing-in");
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    // Session is established. Hand off to the callback page so the routing
    // decision (profile lookup → /log vs /welcome vs /upgrade) stays in one place.
    router.push("/auth/callback");
  }

  async function handleForgotPassword() {
    if (!supabase) {
      setStatus("error");
      setErrorMsg("Reset is temporarily unavailable.");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setStatus("error");
      setErrorMsg("Enter your email above first, then tap Forgot password.");
      return;
    }
    setStatus("signing-in");
    setErrorMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("reset-sent");
  }

  return (
    <div className="mt-8">
      <div style={{ borderTop: "1px solid var(--border)" }} />

      <p
        className="text-sm text-center mt-5 mb-4"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        Already a member?
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleGoogle}
          className="group flex items-center justify-center gap-3 tap-feedback"
          style={{
            height: "48px",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-1">
          <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
          <span
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "10px",
            }}
          >
            or
          </span>
          <div style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-2">
          <label htmlFor="signin-email" className="sr-only">
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="you@example.com"
            disabled={status === "signing-in"}
            style={{
              height: "44px",
              padding: "0 12px",
              borderRadius: "0.625rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <label htmlFor="signin-password" className="sr-only">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="Password"
            disabled={status === "signing-in"}
            style={{
              height: "44px",
              padding: "0 12px",
              borderRadius: "0.625rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "signing-in"}
            style={{
              height: "44px",
              borderRadius: "0.625rem",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: status === "signing-in" ? "not-allowed" : "pointer",
            }}
          >
            {status === "signing-in" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-xs text-center mt-1"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          Forgot password?
        </button>
      </div>

      {errorMsg && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
        >
          {errorMsg}
        </p>
      )}
      {status === "reset-sent" && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          We sent a reset link to {email}. Open it to set a new password.
        </p>
      )}
    </div>
  );
}
