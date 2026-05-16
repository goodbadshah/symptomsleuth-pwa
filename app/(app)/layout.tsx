"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/app/providers";
import AppHeader from "@/components/layout/AppHeader";

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
  const { state, hydrated } = useAppState();
  const activeTabIndex = Math.max(0, tabs.findIndex((t) => pathname.includes(t.match)));
  const mainRef = useRef<HTMLElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect to onboarding if no conditions selected.
  // Redirect to /welcome if payment is done but account setup is still pending.
  // Exclude /upgrade: the plan picker must remain reachable so a user who
  // abandoned mid-flow can start a new plan. /welcome will itself reset the
  // pending flag once a fresh intent is started.
  // Wait for hydration — otherwise the initial empty state redirects logged-in
  // users to /onboarding on every refresh.
  useEffect(() => {
    if (!hydrated) return;
    if (state.profile.conditions.length === 0) {
      router.replace("/onboarding");
      return;
    }
    if (state.profile.awaitingAccountSetup && !pathname.startsWith("/upgrade")) {
      router.replace("/welcome");
    }
  }, [hydrated, state.profile.conditions, state.profile.awaitingAccountSetup, pathname, router]);

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

  if (!hydrated) return null;
  if (state.profile.conditions.length === 0) return null;

  return (
    <div
      className="flex flex-col h-[100dvh] mx-auto w-full"
      style={{ position: "relative" }}
    >
      {/* Global AppHeader across both desktop and mobile */}
      <div className="sticky top-0 z-30">
        <AppHeader />
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ position: "relative" }}>
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside 
          className={`hidden md:flex flex-col border-r border-[var(--border)] backdrop-blur-md bg-[var(--nav-outer-bg)] z-20 transition-all duration-300 ${isSidebarOpen ? 'w-[300px]' : 'w-[80px]'}`}
          style={{ position: "relative" }}
        >
          <nav className="flex-1 p-6 flex flex-col items-center" aria-label="Desktop navigation">
            <ul className="flex flex-col gap-4 w-full">
              {tabs.map((tab) => {
                const isActive = pathname.includes(tab.match);
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className="group relative flex items-center justify-between p-4 rounded-[1.25rem] transition-transform duration-150 active:scale-[0.98] tap-feedback"
                      style={{
                        boxShadow: isActive ? "0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(26,26,26,0.06)" : "none",
                        backgroundColor: isActive && isSidebarOpen ? "var(--bg-surface)" : "transparent",
                        color: isActive && isSidebarOpen ? "var(--nav-active-color)" : "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                        justifyContent: isSidebarOpen ? "space-between" : "center",
                      }}
                      title={!isSidebarOpen ? tab.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color: isActive ? "var(--accent)" : "currentColor" }}>{tab.icon}</span>
                        {isSidebarOpen && <span className="font-medium text-[15px] whitespace-nowrap">{tab.label}</span>}
                      </div>
                      {/* Premium trailing chevron on active */}
                      {isActive && isSidebarOpen && (
                        <span className="w-6 h-6 rounded-full bg-black/[0.04] flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: "var(--accent)" }}>
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full p-2 shadow-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-30"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 1 }}>
            <div key={pathname} className="page-enter pb-24 md:pb-12 max-w-[800px] mx-auto px-4 md:px-8 w-full mt-4 md:mt-12">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom nav - Double-Bezel architecture ── */}
      {/* Outer: fixed shell with backdrop-blur (Hidden on Desktop) */}
      <nav
        className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full backdrop-blur-sm"
        style={{ maxWidth: "480px", zIndex: 40 }}
        aria-label="Mobile navigation"
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
