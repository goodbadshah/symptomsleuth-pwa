"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/providers";
import { useTrial } from "@/hooks/useTrial";
import { generateDemoData, DEMO_CONDITIONS } from "@/utils/generateDemoData";
import { supabase } from "@/lib/supabase";
import { clearStorage } from "@/utils/storage";

// ──────────────────────────────────────────────────────────────────────────────
// Eyebrow tag helper
// ──────────────────────────────────────────────────────────────────────────────

function EyebrowTag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "10px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.15em",
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        color: "var(--text-secondary)",
      }}
    >
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Toggle switch - for community opt-in
// ──────────────────────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="active:scale-[0.98]"
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        backgroundColor: checked ? "var(--accent)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative" as const,
        transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transition: "left 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { state, dispatch } = useAppState();
  const { profile } = state;
  const { isPremium, isInTrial, endsAt } = useTrial();
  const router = useRouter();
  const [resetStep, setResetStep] = useState<"idle" | "confirm">("idle");
  const [demoCondition, setDemoCondition] = useState("Migraine");
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Auth state
  const hasSupabaseAuth = !!profile.userId && profile.userId.includes("-");
  const authLabel = hasSupabaseAuth
    ? profile.email
      ? `Signed in · ${profile.email}`
      : "Signed in with Google"
    : "Local account - data on this device only";

  const isLifetime = profile.premium.type === "lifetime";

  // Plan badge
  function getPlanLabel() {
    if (isLifetime) return "Lifetime Member ✦";
    if (!isPremium) return "Free";
    if (isInTrial) return "Trial";
    if (profile.premium.type === "monthly") return "Monthly";
    if (profile.premium.type === "annual") return "Annual";
    return "Active";
  }

  function getEndDateLabel() {
    if (!endsAt) return null;
    const d = new Date(endsAt);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleReset() {
    dispatch({ type: "RESET" });
    router.replace("/onboarding");
  }

  async function handleSignOut() {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue regardless - local reset is the source of truth
      }
    }
    // Clear storage directly and hard-navigate so the (app) layout's
    // "no conditions → /onboarding" redirect effect can't race us.
    clearStorage();
    window.location.replace("/");
  }

  function handleLoadDemo() {
    const demoState = generateDemoData(demoCondition);
    dispatch({ type: "HYDRATE", payload: demoState });
    setDemoLoaded(true);
    setTimeout(() => router.replace("/insights"), 800);
  }

  function handleCommunityToggle(value: boolean) {
    dispatch({ type: "SET_COMMUNITY_OPT_IN", payload: value });
    // Persist to Supabase if the user is linked. Fire-and-forget - the local
    // dispatch is the source of truth for this session.
    if (profile.supabaseLinked && profile.userId && supabase) {
      void supabase
        .from("profiles")
        .update({ community_opt_in: value })
        .eq("user_id", profile.userId);
    }
  }

  function handleThemeChange(value: "light" | "dark" | "system") {
    // Apply to DOM immediately — don't wait for the React → state → useEffect chain
    const html = document.documentElement;
    if (value === "dark") html.setAttribute("data-theme", "dark");
    else if (value === "light") html.setAttribute("data-theme", "light");
    else html.removeAttribute("data-theme");
    // Persist to state / localStorage
    dispatch({ type: "SET_THEME", payload: value });
  }

  const currentTheme = profile.theme ?? "system";

  return (
    <div style={{ padding: "32px 20px 48px" }}>
      {/* Hero */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 4px",
          lineHeight: 1.1,
        }}
      >
        Account
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          margin: "0 0 32px",
        }}
      >
        {authLabel}
      </p>

      <div style={{ borderTop: "1px solid var(--border)" }}>
        {/* ── Subscription section ── */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
          <EyebrowTag label="Subscription" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "var(--text-primary)",
                  margin: "0 0 2px",
                  fontWeight: 500,
                }}
              >
                {isLifetime ? getPlanLabel() : `${getPlanLabel()} plan`}
              </p>
              {isLifetime ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  One-time purchase · never expires
                </p>
              ) : (
                getEndDateLabel() && (
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    {isInTrial ? "Trial ends" : "Renews"} {getEndDateLabel()}
                  </p>
                )
              )}
            </div>
            {/* Manage plan - only show for active subscription plans (not lifetime) */}
            {!isLifetime && profile.stripeCustomerId && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/create-portal", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customerId: profile.stripeCustomerId }),
                    });
                    const data = (await res.json()) as { url?: string };
                    if (data.url) window.location.href = data.url;
                  } catch {
                    // Silently fail - portal opens in same tab when possible
                  }
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Manage plan
              </button>
            )}
          </div>
        </div>

        {/* ── Privacy section ── */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
          <EyebrowTag label="Privacy" />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "var(--text-primary)",
                  margin: "0 0 2px",
                  fontWeight: 500,
                }}
              >
                Contribute anonymous symptom trends
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  maxWidth: 260,
                  lineHeight: 1.45,
                }}
              >
                Help others with similar conditions by sharing anonymous
                severity data. Never includes notes or identifying information.
              </p>
            </div>
            <ToggleSwitch
              checked={profile.communityOptIn}
              onChange={handleCommunityToggle}
              label="Contribute anonymous symptom trends"
            />
          </div>
        </div>

        {/* ── Appearance section ── */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
          <EyebrowTag label="Appearance" />
          <div style={{ marginTop: 12 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                color: "var(--text-primary)",
                fontWeight: 500,
                margin: "0 0 12px",
              }}
            >
              Color scheme
            </p>
            {/* Three-option segmented row — text tabs with underline indicator */}
            <div
              role="radiogroup"
              aria-label="Color scheme"
              style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}
            >
              {(["light", "system", "dark"] as const).map((opt) => {
                const labels: Record<string, string> = {
                  light: "Light",
                  system: "System",
                  dark: "Dark",
                };
                const active = currentTheme === opt;
                return (
                  <button
                    key={opt}
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleThemeChange(opt)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      background: "none",
                      border: "none",
                      borderBottom: active
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                      padding: "8px 16px",
                      cursor: "pointer",
                      marginBottom: "-1px",
                      transition:
                        "color 150ms cubic-bezier(0.16,1,0.3,1), border-color 150ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                margin: "10px 0 0",
                lineHeight: 1.4,
              }}
            >
              {currentTheme === "system"
                ? "Follows your device setting."
                : currentTheme === "dark"
                ? "Dark journal — warm charcoal, always."
                : "Light parchment — always on."}
            </p>
          </div>
        </div>

        {/* ── Session section ── */}
        {(profile.supabaseLinked || hasSession) && (
          <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
            <EyebrowTag label="Session" />
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleSignOut}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "border-color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* ── Data section ── */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
          <EyebrowTag label="Data" />
          <div style={{ marginTop: 12 }}>
            {resetStep === "idle" ? (
              <button
                onClick={() => setResetStep("confirm")}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "border-color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                Restart onboarding
              </button>
            ) : (
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  This clears all your data and restarts onboarding.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={handleReset}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "#ffffff",
                      backgroundColor: "#C8472F",
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Yes, restart onboarding
                  </button>
                  <button
                    onClick={() => setResetStep("idle")}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      padding: "10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Demo data section ── */}
        <div style={{ padding: "20px 0" }}>
          <EyebrowTag label="Demo" />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              margin: "8px 0 14px",
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            Load 90 days of realistic fake logs to explore all visualizations. Includes a monthly premium subscription.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              value={demoCondition}
              onChange={(e) => setDemoCondition(e.target.value)}
              aria-label="Select condition for demo data"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "10px 12px",
                cursor: "pointer",
                outline: "none",
                minWidth: 160,
              }}
            >
              {DEMO_CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={handleLoadDemo}
              disabled={demoLoaded}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 500,
                color: demoLoaded ? "var(--text-secondary)" : "#ffffff",
                backgroundColor: demoLoaded ? "var(--border)" : "var(--accent)",
                border: "none",
                borderRadius: "0.75rem",
                padding: "10px 18px",
                cursor: demoLoaded ? "default" : "pointer",
                transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {demoLoaded ? "Loaded - opening Insights…" : "Load demo data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
