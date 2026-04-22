"use client";

import { SeverityGlyph } from "@/utils/severityGlyphs";

interface Props {
  condition: string;
  /** When true: hairline header is the tap target, chevron shown, children hidden */
  collapsed?: boolean;
  /** Present when the chapter supports collapse (2+ conditions). Absent for single-condition. */
  onToggle?: () => void;
  /**
   * Up to 5 severity values for today's entries in this group.
   * Shown as SeverityGlyph mini-row beneath the rule when collapsed.
   */
  previewValues?: number[];
  children: React.ReactNode;
}

/**
 * ConditionChapterMarker - editorial hairline chapter divider for condition groups.
 *
 * Renders a 1px --border hairline spanning the card's inner width, with the
 * condition name centered on the rule, creating the visual break. This is the
 * canonical treatment for condition grouping - never a grey pill or badge.
 *
 * When collapsed: shows a mini-preview row of SeverityGlyph marks beneath the rule.
 * When onToggle is provided: the header row is a tap target with a chevron.
 */
export default function ConditionChapterMarker({
  condition,
  collapsed = false,
  onToggle,
  previewValues,
  children,
}: Props) {
  const headerContent = (
    <div>
      {/* Hairline rule with centered condition name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px 0",
        }}
      >
        <div
          style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }}
        />
        <span
          style={{
            padding: "0 8px",
            fontSize: "10px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            textTransform: "uppercase" as const,
            letterSpacing: "0.15em",
            color: "var(--accent)",
            // Sits on --bg-surface so it visually cuts the rule
            backgroundColor: "var(--bg-surface)",
            whiteSpace: "nowrap" as const,
          }}
        >
          {condition}
        </span>
        {onToggle && (
          <span
            aria-hidden="true"
            style={{
              marginLeft: "6px",
              color: "var(--text-secondary)",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 200ms cubic-bezier(0.16,1,0.3,1)",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline
                points="2,4 6,8 10,4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
        <div
          style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }}
        />
      </div>

      {/* Mini severity preview - shown only when collapsed with preview data */}
      {collapsed && previewValues && previewValues.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "8px 16px 12px",
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

      {/* 8px spacer below rule when expanded (no preview shown) */}
      {!collapsed && <div style={{ height: "8px" }} />}
    </div>
  );

  return (
    <div>
      {/* Header: tappable if onToggle exists, static otherwise */}
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          style={{
            width: "100%",
            display: "block",
            textAlign: "left" as const,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            WebkitTapHighlightColor: "transparent",
            minHeight: "48px",
          }}
        >
          {headerContent}
        </button>
      ) : (
        headerContent
      )}

      {/* Children with grid-template-rows collapse animation */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: collapsed ? "0fr" : "1fr",
          transition: "grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
        }}
      >
        <div style={{ minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}
