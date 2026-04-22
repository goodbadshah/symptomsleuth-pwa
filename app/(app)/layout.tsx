"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppState } from "@/app/providers";
import AppHeader from "@/components/layout/AppHeader";
import PaperGround from "@/components/ui/PaperGround";

const tabs = [
  {
    href: "/log",
    label: "Log",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <path d="M15.5 3.5a2.121 2.121 0 0 1 3 3L7 18l-4 1 1-4L15.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    match: "/log",
  },
  {
    href: "/insights",
    label: "Insights",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <path d="M8 17h6M9 19.5h4M11 3a6 6 0 0 1 4 10.472V15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1.528A6 6 0 0 1 11 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    match: "/insights",
  },
  {
    href: "/report",
    label: "Report",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <path d="M5 3h8l4 4v12H5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points="13,3 13,7 17,7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    match: "/report",
  },
  {
    href: "/account",
    label: "Account",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    match: "/account",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useAppState();
  const activeTabIndex = Math.max(0, tabs.findIndex((t) => pathname.includes(t.match)));
  const mainRef = useRef<HTMLElement>(null);

  // Redirect to onboarding if no conditions selected
  useEffect(() => {
    if (state.profile.conditions.length === 0) {
      router.replace("/onboarding");
    }
  }, [state.profile.conditions, router]);

  // Default landing tab - redirect to /insights when loggedDaysCount >= 4
  // Only fires once per session on cold open to /log, respects user navigation.
  useEffect(() => {
    if (pathname !== "/log") return;
    const hasNavigated = sessionStorage.getItem("hasNavigated");
    if (hasNavigated) return;
    const loggedDaysCount = new Set(state.logs.map((l) => l.date)).size;
    if (loggedDaysCount >= 4) {
      router.replace("/insights");
    }
  }, [pathname, state.logs, router]);

  // Mark navigation as user-initiated after first route change away from /log
  useEffect(() => {
    if (pathname !== "/log") {
      sessionStorage.setItem("hasNavigated", "true");
    }
  }, [pathname]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  if (state.profile.conditions.length === 0) return null;

  return (
    <div
      className="flex flex-col h-[100dvh] mx-auto"
      style={{ maxWidth: "480px", backgroundColor: "var(--bg-primary)", position: "relative" }}
    >
      {/* Paper grain - fixed, below all content, never on interactive surfaces */}
      <PaperGround />
      {/* App header band - 72px, --accent background, wordmark + streak */}
      <AppHeader />
      <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 1 }}>
        <div key={pathname} className="page-enter pb-24">
          {children}
        </div>
      </main>

      {/* ── Bottom nav - Double-Bezel architecture ── */}
      {/* Outer: fixed shell with backdrop-blur (permitted - fixed element) */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full backdrop-blur-sm"
        style={{ maxWidth: "480px", zIndex: 40 }}
        aria-label="Main navigation"
      >
        {/* Outer shell */}
        <div
          className="mx-3 mb-3 p-1.5 rounded-[1.25rem]"
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(26,26,26,0.06)",
            backgroundColor: "var(--nav-outer-bg)",
          }}
        >
          <ul className="grid grid-cols-4 relative" style={{ height: "52px" }}>
            {/* Sliding selection indicator — single element that moves between tabs */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "25%",
                left: `${activeTabIndex * 25}%`,
                borderRadius: "calc(1.25rem - 0.375rem)",
                backgroundColor: "var(--bg-surface)",
                boxShadow: "var(--bezel-inset-shadow), 0 1px 3px rgba(26,26,26,0.06)",
                transition: "left 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            {tabs.map((tab) => {
              const isActive = pathname.includes(tab.match);
              return (
                <li key={tab.href} className="relative flex" style={{ zIndex: 1 }}>
                  <Link
                    href={tab.href}
                    className="relative flex flex-col items-center justify-center gap-1 flex-1 text-xs font-medium tap-feedback"
                    style={{
                      color: isActive ? "var(--nav-active-color)" : "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                      transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                      borderRadius: "calc(1.25rem - 0.375rem)",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span style={{ position: "relative", zIndex: 1 }}>{tab.icon}</span>
                    <span style={{ position: "relative", zIndex: 1 }}>{tab.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
