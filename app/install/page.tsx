"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Platform = "ios" | "android" | "desktop" | "unknown";

// Muted, sufficiently varied colors so the mock home screen reads as
// "other apps" without distracting from the SymptomSleuth tile.
const TILES: { color: string }[] = [
  { color: "#7BA8C9" }, // soft blue
  { color: "#E8B47A" }, // peach
  { color: "#A88BC1" }, // lavender
  { color: "#7CB8A0" }, // mint
  { color: "#D88A8A" }, // dusty rose
  { color: "#C9B07B" }, // mustard
  null as unknown as { color: string }, // SymptomSleuth slot (index 6)
  { color: "#6B98B5" }, // steel
  { color: "#B59E7B" }, // sand
  { color: "#9DB58F" }, // sage
  { color: "#C97B9C" }, // pink
  { color: "#7E92B5" }, // periwinkle
  { color: "#D9A175" }, // terracotta
  { color: "#8FB5A8" }, // seafoam
  { color: "#B58FB5" }, // mauve
  { color: "#A8B57C" }, // olive
];

const DOCK_TILES: { color: string }[] = [
  { color: "#5A7AA1" },
  { color: "#A88BC1" },
  { color: "#7CB8A0" },
  { color: "#D88A8A" },
];

export default function InstallPage() {
  const router = useRouter();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Already installed - skip straight through.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) {
      router.replace("/log");
      return;
    }

    const ua = navigator.userAgent;
    const detected: Platform = /iPad|iPhone|iPod/.test(ua)
      ? "ios"
      : /Android/.test(ua)
        ? "android"
        : "desktop";

    // Defer setState out of the effect body to the next frame; this also lets
    // the initial blurred/translated paint land before the entry transition fires.
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setPlatform(detected);
    });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [router]);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  }

  function handleContinue() {
    router.replace("/log");
  }

  // Always-visible primary button. If the native install event isn't
  // available (iOS, dev without HTTPS+SW, browsers with no support, or
  // Chrome's engagement heuristic hasn't fired yet), fall back to scrolling
  // the platform-specific manual instructions into view.
  function handlePrimary() {
    if (installEvent) {
      void handleInstall();
      return;
    }
    const target = document.getElementById("install-help");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.animate(
        [
          { boxShadow: "0 0 0 0 rgba(45,106,79,0)" },
          { boxShadow: "0 0 0 4px rgba(45,106,79,0.25)" },
          { boxShadow: "0 0 0 0 rgba(45,106,79,0)" },
        ],
        { duration: 900, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
      );
    }
  }

  const primaryDisabled = installed;
  const primaryLabel = installed
    ? "Installed"
    : installEvent
      ? "Add to Home Screen"
      : platform === "ios"
        ? "How to add it"
        : "Show me how";

  return (
    <>
      <AppHeader showStreak={false} />
      <div
        className="mx-auto"
        style={{
          maxWidth: "480px",
          minHeight: "100dvh",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex flex-col min-h-[100dvh] px-5 pt-12 pb-10">
          <div className="mb-8">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                color: "var(--text-secondary)",
                margin: "0 0 8px",
              }}
            >
              Last step
            </p>
            <h1
              className="text-4xl leading-tight mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
                fontWeight: 400,
              }}
            >
              Keep SymptomSleuth on your home screen.
            </h1>
            <p
              className="text-base leading-relaxed"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              One tap to log. Works offline. Pinned alongside your other apps.
            </p>
          </div>

          <MockHomeScreen mounted={mounted} />

          <div id="install-help" className="mb-6" style={{ borderRadius: "1.25rem" }}>
            {installed ? (
              <InstalledNote />
            ) : platform === "ios" ? (
              <IOSInstructions />
            ) : platform === "android" ? (
              <AndroidFallback />
            ) : (
              <DesktopFallback />
            )}
          </div>

          <div className="flex-1" />

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePrimary}
              disabled={primaryDisabled}
              className="group w-full flex items-center justify-between px-5 tap-feedback"
              style={{
                height: "56px",
                borderRadius: "1.25rem",
                backgroundColor: primaryDisabled
                  ? "var(--text-secondary)"
                  : "var(--accent)",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                border: "none",
                cursor: primaryDisabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-sm font-medium">{primaryLabel}</span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.12)",
                  flexShrink: 0,
                  transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
                }}
                aria-hidden="true"
              >
                {installEvent || installed ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2.5v6M4 5.5l3-3 3 3M3 11h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="4,2 8,6 4,10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </button>

            <button
              onClick={handleContinue}
              className="tap-feedback"
              style={{
                height: "48px",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {installed ? "Continue to your log" : "Skip for now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mock home screen ─────────────────────────────────────────────────────────

function MockHomeScreen({ mounted }: { mounted: boolean }) {
  return (
    <div
      className="relative mx-auto mb-10"
      style={{
        width: "260px",
        aspectRatio: "9 / 17",
        borderRadius: "36px",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #5A7A95 0%, #8FA4B5 45%, #C5B89E 100%)",
        boxShadow:
          "0 1px 3px rgba(26,26,26,0.06), 0 18px 40px -10px rgba(26,26,26,0.25)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(0.75rem)",
        filter: mounted ? "blur(0)" : "blur(4px)",
        transition:
          "opacity 600ms cubic-bezier(0.32, 0.72, 0, 1), transform 600ms cubic-bezier(0.32, 0.72, 0, 1), filter 600ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-5 pt-3"
        style={{
          fontFamily: "var(--font-body)",
          color: "rgba(255,255,255,0.95)",
          fontSize: "10px",
          fontWeight: 600,
        }}
      >
        <span>9:41</span>
        <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <span style={{ width: 14, height: 6, borderRadius: 1, backgroundColor: "rgba(255,255,255,0.85)" }} />
        </span>
      </div>

      {/* App grid */}
      <div
        className="grid grid-cols-4 gap-2.5 px-4 pt-5"
      >
        {TILES.map((tile, i) =>
          tile === null ? (
            <SymptomSleuthTile key={i} />
          ) : (
            <BlurredTile key={i} color={tile.color} />
          ),
        )}
      </div>

      {/* Page indicator dots */}
      <div
        style={{
          position: "absolute",
          bottom: 78,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 999,
              backgroundColor:
                i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>

      {/* Dock */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          padding: 8,
          borderRadius: 22,
          backgroundColor: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {DOCK_TILES.map((tile, i) => (
            <BlurredTile key={i} color={tile.color} dock />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlurredTile({ color, dock }: { color: string; dock?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: dock ? "11px" : "12px",
        backgroundColor: color,
        filter: "blur(2.5px)",
        opacity: 0.9,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    />
  );
}

function SymptomSleuthTile() {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 0 0 1.5px rgba(255,255,255,0.7), 0 4px 14px rgba(0,0,0,0.25)",
      }}
    >
      {/* Plain <img> instead of next/image: the icon is a 195x195 PNG and
          the next/image optimizer doesn't reliably serve over a LAN IP in
          dev (the host check rejects non-localhost origins even with
          allowedDevOrigins). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/symptomsleuth-icon-194.png"
        alt="SymptomSleuth"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

// ─── Platform-specific guidance blocks ─────────────────────────────────────────

function IOSInstructions() {
  return (
    <div
      style={{
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          padding: "16px 18px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            color: "var(--accent)",
            margin: "0 0 10px",
          }}
        >
          On iPhone, two taps
        </p>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-primary)",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 8,
                border: "1px solid var(--border)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
              aria-hidden="true"
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path
                  d="M7 1v9M4 4l3-3 3 3M2 8v6h10V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              Tap the <strong style={{ fontWeight: 600 }}>Share</strong> button in
              Safari.
            </span>
          </li>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-primary)",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 8,
                border: "1px solid var(--border)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2v10M2 7h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>
              Choose{" "}
              <strong style={{ fontWeight: 600 }}>Add to Home Screen</strong>.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function AndroidFallback() {
  return (
    <ManualSteps
      eyebrow="On Android"
      steps={[
        <>
          Tap the <strong>⋮</strong> menu in Chrome.
        </>,
        <>
          Choose <strong>Install app</strong> or{" "}
          <strong>Add to Home Screen</strong>.
        </>,
      ]}
    />
  );
}

function DesktopFallback() {
  return (
    <ManualSteps
      eyebrow="On desktop"
      steps={[
        <>
          Look for the install icon (a small <strong>⊕</strong>) on the right
          side of your address bar.
        </>,
        <>
          Click it and choose <strong>Install</strong>. SymptomSleuth opens in
          its own window.
        </>,
      ]}
    />
  );
}

function ManualSteps({
  eyebrow,
  steps,
}: {
  eyebrow: string;
  steps: React.ReactNode[];
}) {
  return (
    <div
      style={{
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          padding: "16px 18px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            color: "var(--accent)",
            margin: "0 0 10px",
          }}
        >
          {eyebrow}
        </p>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {steps.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-primary)",
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--accent)",
                }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function InstalledNote() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px",
        borderRadius: "0.875rem",
        backgroundColor: "var(--accent-light)",
        color: "var(--accent)",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M3.5 9l3.5 3.5L14.5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Installed. Find SymptomSleuth on your home screen.</span>
    </div>
  );
}
