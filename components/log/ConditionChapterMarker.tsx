"use client";

import { SeverityGlyph } from "@/utils/severityGlyphs";

interface Props {
  condition: string;
  collapsed?: boolean;
  onToggle?: () => void;
  previewValues?: number[];
  /** When true, renders a completed indicator and suppresses the Nothing-to-report button. */
  complete?: boolean;
  /** When provided, renders the "Nothing to report" ghost button in the header. */
  onNothingToReport?: () => void;
  /** Plays a one-shot accent pulse on transition to complete. */
  justCompleted?: boolean;
  children: React.ReactNode;
}

export default function ConditionChapterMarker({
  condition,
  collapsed = false,
  onToggle,
  previewValues,
  complete = false,
  onNothingToReport,
  justCompleted = false,
  children,
}: Props) {
  const chevron = (
    <span
      aria-hidden="true"
      style={{
        color: "var(--text-secondary)",
        transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
        transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline
          points="3,6 8,11 13,6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  const completeBadge = (
    <span
      aria-label="Complete"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        borderRadius: "999px",
        backgroundColor: "var(--accent)",
        color: "#ffffff",
        flexShrink: 0,
      }}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <polyline
          points="1,4 4,7 9,1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  return (
    <div
      style={{
        position: "relative",
        animation: justCompleted
          ? "chapter-complete-pulse 600ms cubic-bezier(0.32,0.72,0,1) forwards"
          : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
          minHeight: "52px",
          gap: "12px",
        }}
      >
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            className="tap-feedback"
            style={{
              flex: 1,
              display: "block",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              minHeight: "24px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <p
              className="text-base font-medium"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                margin: 0,
              }}
            >
              {condition}
            </p>
          </button>
        ) : (
          <p
            className="text-base font-medium"
            style={{
              flex: 1,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              margin: 0,
            }}
          >
            {condition}
          </p>
        )}

        {/* Nothing to report — outlined button, hidden when complete */}
        {!complete && onNothingToReport && (
          <button
            type="button"
            onClick={onNothingToReport}
            className="tap-feedback"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "999px",
              padding: "6px 12px",
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
              minHeight: "32px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
            aria-label={`Mark ${condition} as nothing to report`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <line
                x1="2"
                y1="5"
                x2="8"
                y2="5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Nothing today
          </button>
        )}

        {complete && completeBadge}

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand" : "Collapse"}
            aria-expanded={!collapsed}
            className="tap-feedback"
            style={{
              background: "none",
              border: "none",
              padding: "6px",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {chevron}
          </button>
        )}
      </div>

      {collapsed && previewValues && previewValues.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 16px 14px",
          }}
        >
          {previewValues.slice(0, 5).map((v, i) => (
            <span
              key={i}
              style={{
                color:
                  v > 0 ? "var(--text-primary)" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SeverityGlyph value={v} size={14} />
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateRows: collapsed ? "0fr" : "1fr",
          transition: "grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
        }}
      >
        <div style={{ minHeight: 0, padding: "0 16px" }}>{children}</div>
      </div>
    </div>
  );
}
