"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "idle" | "email";
type Status = "idle" | "sending" | "sent" | "error";

export default function ReturningMemberSignIn() {
  const [mode, setMode] = useState<Mode>("idle");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGoogle() {
    if (!supabase) {
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    // No query string on the redirect — Supabase's allowlist matcher rejects
    // URLs with queries and bounces them to Site URL. The callback page
    // disambiguates intent from Supabase profile + localStorage.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMsg("Sign-in failed. Please try again.");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Sign-in is temporarily unavailable.");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mt-8">
      {/* Hairline rule */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Label */}
      <p
        className="text-sm text-center mt-5 mb-4"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        Already a member?
      </p>

      {/* Sign-in buttons */}
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

        {mode === "idle" ? (
          <button
            onClick={() => setMode("email")}
            className="flex items-center justify-center gap-3 tap-feedback"
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
              <rect
                x="1.75"
                y="3.75"
                width="14.5"
                height="10.5"
                rx="1.25"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M2 4.5 9 10l7-5.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Continue with Email</span>
          </button>
        ) : (
          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col gap-2"
            style={{
              padding: "6px",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-surface)",
            }}
          >
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
              disabled={status === "sending" || status === "sent"}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "0.625rem",
                border: "none",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              style={{
                height: "40px",
                borderRadius: "0.625rem",
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: status === "sending" ? "not-allowed" : "pointer",
              }}
            >
              {status === "sending"
                ? "Sending magic link…"
                : status === "sent"
                  ? "Check your email"
                  : "Send magic link"}
            </button>
          </form>
        )}
      </div>

      {errorMsg && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: "#C8472F", fontFamily: "var(--font-body)" }}
        >
          {errorMsg}
        </p>
      )}
      {status === "sent" && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          We sent a link to {email}. Open it to sign in.
        </p>
      )}
    </div>
  );
}
