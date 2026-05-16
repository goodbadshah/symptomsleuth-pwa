"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "signing-in" | "reset-sent" | "error";

export default function ReturningMemberSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 py-1">
        {/* Google SignIn */}
        <button
          onClick={handleGoogle}
          className="w-12 h-12 flex items-center justify-center rounded-[1rem] tap-feedback shadow-sm bg-[--bg-surface] hover:bg-[var(--bezel-outer-bg)] transition-colors border border-[--border]"
          aria-label="Continue with Google"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
        </button>

        {/* Apple SignIn (Placeholder) */}
        <button
          className="w-12 h-12 flex items-center justify-center rounded-[1rem] tap-feedback shadow-sm bg-[--bg-surface] hover:bg-[var(--bezel-outer-bg)] transition-colors border border-[--border] text-[--text-primary]"
          aria-label="Continue with Apple"
        >
          <svg width="22" height="22" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-84.3 103-125.2-4.2-2.1-61.9-22-62.1-85.4zM201 106.3c19.1-23.1 32.2-56.1 28.7-88.3-25.5 1-62 16.5-81.8 39.4-17.3 19.8-32.5 53.6-28.2 84.8 28.7 2.2 62.4-12.7 81.3-35.9z"/>
          </svg>
        </button>

        {/* Email SignIn */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="w-12 h-12 flex items-center justify-center rounded-[1rem] tap-feedback shadow-sm bg-[--bg-surface] hover:bg-[var(--bezel-outer-bg)] transition-colors border border-[--border] text-[--text-primary]"
          aria-label="Continue with Email"
        >
          <Mail size={18} strokeWidth={2} />
        </button>
      </div>

      {errorMsg && !showEmailModal && (
        <p
          className="text-[12px] text-[#C8472F] mt-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {errorMsg}
        </p>
      )}

      {/* Email Login Modal overlay */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailModal(false)}
              className="absolute inset-0 bg-black/10 backdrop-blur-[4px] dark:bg-black/40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-[1.5rem] border shadow-2xl p-6 bg-[--bg-surface] border-[--bezel-ring]"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[14px] font-semibold text-[--text-primary]">Sign in with Email</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-[--text-secondary]" />
                </button>
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="Email address"
                  disabled={status === "signing-in"}
                  className="h-[44px] px-3.5 rounded-xl border border-[--border] bg-transparent text-[--text-primary] text-[14px] outline-none focus:ring-1 focus:ring-[--accent] transition-shadow disabled:opacity-50"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                
                <input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="Password"
                  disabled={status === "signing-in"}
                  className="h-[44px] px-3.5 rounded-xl border border-[--border] bg-transparent text-[--text-primary] text-[14px] outline-none focus:ring-1 focus:ring-[--accent] transition-shadow disabled:opacity-50"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                
                <button
                  type="submit"
                  disabled={status === "signing-in"}
                  className="h-[44px] rounded-xl bg-[--accent] text-white text-[14px] font-medium border-none mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {status === "signing-in" ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-[12px] text-center mt-4 transition-colors text-[--text-secondary] hover:text-[--text-primary] bg-transparent border-none"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Forgot your password?
              </button>

              {errorMsg && (
                <p
                  className="text-[12px] text-center mt-3 text-[#C8472F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {errorMsg}
                </p>
              )}
              {status === "reset-sent" && (
                <p
                  className="text-[12px] text-center mt-3 text-[--text-secondary]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  We sent a reset link to {email}.
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
