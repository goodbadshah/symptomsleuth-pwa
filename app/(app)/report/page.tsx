"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/providers";
import { useTrial } from "@/hooks/useTrial";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Highlight numeric patterns inline in DM Mono
function renderLineWithNumbers(text: string, key: string | number) {
  const parts = text.split(/(\d+\.?\d*(?:\/\d+)?%?)/g);
  return (
    <span key={key}>
      {parts.map((part, i) =>
        /^\d+\.?\d*(?:\/\d+)?%?$/.test(part) ? (
          <span
            key={i}
            style={{ fontFamily: "var(--font-mono)", fontSize: "inherit" }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

// ─── Report renderer ──────────────────────────────────────────────────────────

function ReportContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      if (elements.length > 0) {
        elements.push(<div key={`gap-${key++}`} style={{ height: 28 }} />);
      }
      elements.push(
        <h2
          key={key++}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            fontWeight: 500,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {line.slice(2)}
        </h2>
      );
      elements.push(
        <div
          key={key++}
          style={{
            height: "1px",
            backgroundColor: "var(--border)",
            margin: "8px 0 12px",
          }}
        />
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: 8 }} />);
    } else {
      elements.push(
        <p
          key={key++}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {renderLineWithNumbers(line, `inner-${key}`)}
        </p>
      );
    }
  }

  return <div>{elements}</div>;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ReportSkeleton() {
  const bars: { w: string; h: number }[] = [
    { w: "55%", h: 17 },
    { w: "100%", h: 1 },
    { w: "92%", h: 14 },
    { w: "78%", h: 14 },
    { w: "85%", h: 14 },
    { w: "0%", h: 24 },
    { w: "48%", h: 17 },
    { w: "100%", h: 1 },
    { w: "95%", h: 14 },
    { w: "82%", h: 14 },
    { w: "70%", h: 14 },
    { w: "88%", h: 14 },
    { w: "0%", h: 24 },
    { w: "60%", h: 17 },
    { w: "100%", h: 1 },
    { w: "90%", h: 14 },
    { w: "75%", h: 14 },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bars.map((bar, i) =>
          bar.w === "0%" ? (
            <div key={i} style={{ height: bar.h }} />
          ) : (
            <div
              key={i}
              className="skeleton"
              style={{ width: bar.w, height: bar.h, borderRadius: 4 }}
            />
          )
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          marginTop: 24,
          textAlign: "center",
        }}
      >
        Analyzing your symptom data...
      </p>
    </div>
  );
}

// ─── Upgrade locked view ──────────────────────────────────────────────────────
// Placeholder until UpgradeScreen (Prompt 7) is built. Routes to /upgrade.

function UpgradeLocked() {
  const router = useRouter();

  return (
    <div style={{ padding: "32px 20px 40px", display: "flex", flexDirection: "column" }}>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 8px",
          lineHeight: 1.1,
        }}
      >
        Doctor Report
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          margin: "0 0 40px",
        }}
      >
        Premium feature
      </p>

      <div
        style={{
          padding: "6px 12px",
          borderRadius: "2rem",
          backgroundColor: "var(--border)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          marginBottom: 20,
        }}
      >
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
          <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="var(--text-secondary)" strokeWidth="1.25" />
          <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="var(--text-secondary)" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Premium only
        </span>
      </div>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 12px",
          lineHeight: 1.3,
        }}
      >
        A report your doctor can actually read.
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--text-secondary)",
          margin: "0 0 32px",
          lineHeight: 1.6,
        }}
      >
        Choose a date range. Get a structured clinical summary of your symptom
        frequency, severity trends, context correlations, and patterns - ready
        to hand your doctor.
      </p>

      <button
        onClick={() => router.push("/upgrade")}
        className="group active:scale-[0.98]"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: "var(--accent)",
          border: "none",
          cursor: "pointer",
          transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
        }}
        aria-label="Unlock full access"
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            color: "#ffffff",
          }}
        >
          Unlock full access
        </span>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px"
          style={{
            backgroundColor: "rgba(0,0,0,0.12)",
            transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="4,2 8,6 4,10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        $6.99/month or $29.99/year. Cancel anytime.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type GenerateState = "idle" | "loading" | "done" | "error";

export default function ReportPage() {
  const { state } = useAppState();
  const { isPremium } = useTrial();

  const [startDate, setStartDate] = useState(daysAgoStr(30));
  const [endDate, setEndDate] = useState(todayStr());
  const [generateState, setGenerateState] = useState<GenerateState>("idle");
  const [reportText, setReportText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { profile, logs } = state;

  const logsInRange = logs.filter(
    (l) => l.date >= startDate && l.date <= endDate
  );
  const totalEntries = logsInRange.reduce(
    (sum, l) => sum + l.entries.filter((e) => e.value > 0).length,
    0
  );
  const hasNoLogs = logs.length === 0;

  const handleGenerate = useCallback(async () => {
    if (generateState === "loading") return;
    setGenerateState("loading");
    setReportText(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRange: { start: startDate, end: endDate },
          symptoms: profile.symptoms,
          logs,
          conditions: profile.conditions,
        }),
      });

      const data = (await res.json()) as { report?: string; error?: string };

      if (!res.ok || !data.report) {
        setErrorMsg(data.error ?? "Report generation failed. Try again.");
        setGenerateState("error");
        return;
      }

      setReportText(data.report);
      setGenerateState("done");
    } catch {
      setErrorMsg("Could not connect. Check your internet connection.");
      setGenerateState("error");
    }
  }, [generateState, startDate, endDate, profile, logs]);

  const handleCopy = useCallback(async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, [reportText]);

  const handleShare = useCallback(async () => {
    if (!reportText) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "SymptomSleuth Doctor Report",
          text: reportText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }, [reportText, handleCopy]);

  if (!isPremium) return <UpgradeLocked />;

  return (
    <div style={{ padding: "32px 20px 120px" }}>
      {/* Hero block */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "44px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 6px",
          lineHeight: 1.1,
        }}
      >
        Doctor Report
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          margin: "0 0 40px",
        }}
      >
        {hasNoLogs
          ? "No logs yet - start logging to generate a report"
          : `${logsInRange.length} days logged - ${totalEntries} entries in range`}
      </p>

      {/* Section eyebrow + heading */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          margin: "0 0 4px",
        }}
      >
        Date Range
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "24px",
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: "0 0 20px",
          lineHeight: 1.2,
        }}
      >
        Choose your range.
      </p>

      {/* Date range inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="report-start"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            From
          </label>
          <input
            id="report-start"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (generateState === "done") {
                setGenerateState("idle");
                setReportText(null);
              }
            }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "12px 14px",
              width: "100%",
              outline: "none",
              WebkitAppearance: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="report-end"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            To
          </label>
          <input
            id="report-end"
            type="date"
            value={endDate}
            min={startDate}
            max={todayStr()}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (generateState === "done") {
                setGenerateState("idle");
                setReportText(null);
              }
            }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "12px 14px",
              width: "100%",
              outline: "none",
              WebkitAppearance: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Generate button - button-in-button pattern matching Save */}
      <button
        onClick={handleGenerate}
        disabled={generateState === "loading" || hasNoLogs}
        className="group tap-feedback w-full"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "56px",
          borderRadius: "1.25rem",
          backgroundColor: hasNoLogs ? "var(--border)" : "var(--accent)",
          border: "none",
          cursor: generateState === "loading" || hasNoLogs ? "default" : "pointer",
          opacity: generateState === "loading" ? 0.7 : 1,
          transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1)",
          boxSizing: "border-box",
        }}
        aria-label="Generate doctor report"
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            color: hasNoLogs ? "var(--text-secondary)" : "#ffffff",
          }}
        >
          {generateState === "loading" ? "Generating..." : "Generate Report"}
        </span>

        <span
          className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px"
          style={{
            backgroundColor: hasNoLogs ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.12)",
            transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {generateState === "loading" ? (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "white",
                display: "block",
                opacity: 0.7,
              }}
            />
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline
                points="4,2 8,6 4,10"
                stroke={hasNoLogs ? "var(--text-secondary)" : "white"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      {/* Error state */}
      {generateState === "error" && errorMsg && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--severity-5)",
            marginTop: 16,
            lineHeight: 1.5,
          }}
          role="alert"
        >
          {errorMsg}
        </p>
      )}

      {/* Loading skeleton */}
      {generateState === "loading" && (
        <div style={{ marginTop: 36 }}>
          <ReportSkeleton />
        </div>
      )}

      {/* Report output */}
      {generateState === "done" && reportText && (
        <div style={{ marginTop: 36 }}>
          <ReportContent text={reportText} />

          {/* Secondary actions */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--accent)",
                fontWeight: 500,
              }}
              aria-label="Copy report to clipboard"
            >
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <polyline points="2,8 6,12 13,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <rect x="1" y="4" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h8A1.5 1.5 0 0 1 15 2.5v9A1.5 1.5 0 0 1 13.5 13H12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              )}
              {copied ? "Copied" : "Copy report"}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--accent)",
                fontWeight: 500,
              }}
              aria-label="Share report"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M7.5 1v9M4.5 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 9.5v4a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              Share
            </button>
          </div>

          {/* Disclaimer */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: 20,
              lineHeight: 1.5,
            }}
          >
            Generated by SymptomSleuth. This is patient-reported data, not a
            medical diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}
