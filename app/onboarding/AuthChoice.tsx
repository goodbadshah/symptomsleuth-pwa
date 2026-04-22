"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/utils/community";
import { useAppState } from "@/app/providers";
import { useInView, entryStyle } from "@/hooks/useInView";

interface Props {
  onAnonymous: () => void;
}

export default function AuthChoice({ onAnonymous }: Props) {
  const { dispatch } = useAppState();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);
  const { ref, inView } = useInView();

  // Pick up auth_error param if OAuth redirect returned an error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) setAuthError("Sign-in failed. You can continue without an account.");
  }, []);

  // After OAuth redirect, Supabase session is established - read userId
  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        dispatch({ type: "SET_USER_ID", payload: session.user.id });
        // onAnonymous re-used here to advance the step - name is a misnomer at this point
        // but the effect is the same: proceed to Screen 1
        onAnonymous();
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [dispatch, onAnonymous]);

  async function handleOAuth(provider: "google" | "facebook") {
    if (!supabase) {
      // Supabase not configured - fall through to anonymous
      handleAnonymous();
      return;
    }
    setLoading(provider);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      setAuthError("Sign-in failed. You can continue without an account.");
      setLoading(null);
    }
    // On success the page redirects - loading state stays until redirect
  }

  function handleAnonymous() {
    const uuid = uuidv4();
    dispatch({ type: "SET_USER_ID", payload: uuid });
    onAnonymous();
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex flex-col min-h-[100dvh] px-5 pt-16 pb-10"
      style={entryStyle(inView, 0)}
    >
      {/* Heading */}
      <div className="mb-12">
        <h1
          className="text-4xl leading-tight mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        >
          Your data,
          <br />
          your lock.
        </h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign in to sync across devices and recover your data if you switch
          phones. Everything is encrypted before it leaves your device.
        </p>
      </div>

      {/* Auth options */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Google */}
        <button
          onClick={() => handleOAuth("google")}
          disabled={loading !== null}
          className="group flex items-center justify-between px-5 tap-feedback"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: loading === "google" ? "var(--accent)" : "var(--accent)",
            color: "#ffffff",
            opacity: loading !== null && loading !== "google" ? 0.5 : 1,
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: loading !== null ? "default" : "pointer",
          }}
        >
          <span className="flex items-center gap-3">
            {/* Google G mark - monochrome white */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                fill="white" fillOpacity="0.9"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                fill="white" fillOpacity="0.9"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                fill="white" fillOpacity="0.9"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                fill="white" fillOpacity="0.9"
              />
            </svg>
            <span className="text-base font-medium">
              {loading === "google" ? "Signing in…" : "Continue with Google"}
            </span>
          </span>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.12)", flexShrink: 0 }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleOAuth("facebook")}
          disabled={loading !== null}
          className="group flex items-center justify-between px-5 tap-feedback"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            opacity: loading !== null && loading !== "facebook" ? 0.5 : 1,
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: loading !== null ? "default" : "pointer",
          }}
        >
          <span className="flex items-center gap-3">
            {/* Facebook f mark */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M10.5 6H12V3.5H10.5C9.12 3.5 8 4.62 8 6v1H6.5v2.5H8V15h2.5V9.5H12l.5-2.5h-2V6Z"
                fill="white" fillOpacity="0.9"
              />
            </svg>
            <span className="text-base font-medium">
              {loading === "facebook" ? "Signing in…" : "Continue with Facebook"}
            </span>
          </span>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.12)", flexShrink: 0 }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      {/* Error */}
      {authError && (
        <p className="text-sm text-center mb-4" style={{ color: "var(--severity-5)" }}>
          {authError}
        </p>
      )}

      {/* Anonymous option */}
      <button
        onClick={handleAnonymous}
        disabled={loading !== null}
        className="text-sm text-center tap-feedback"
        style={{
          color: "var(--text-secondary)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
        }}
      >
        Continue without account
      </button>

      {/* Trust reassurance */}
      <p
        className="text-xs text-center mt-auto pt-10"
        style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
      >
        We store an encrypted copy of your data.
        <br />
        We cannot read it - ever.
      </p>
    </div>
  );
}
