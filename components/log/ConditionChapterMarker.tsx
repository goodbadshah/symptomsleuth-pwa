"use client";

import { SeverityGlyph } from "@/utils/severityGlyphs";

interface Props {
  condition: string;
  collapsed?: boolean;
  onToggle?: () => void;
  previewValues?: number[];
  children: React.ReactNode;
}

export default function ConditionChapterMarker({
  condition,
  collapsed = false,
  onToggle,
  previewValues,
  children,
}: Props) {
  const headerContent = (
    <div
      className="w-full flex items-center justify-between"
      style={{
        padding: "14px 16px",
        minHeight: "52px",
      }}
    >
      <p
        className="text-base font-medium"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {condition}
      </p>
      {onToggle && (
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
      )}
    </div>
  );

  return (
    <div>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="w-full tap-feedback"
          style={{
            display: "block",
            textAlign: "left" as const,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {headerContent}
        </button>
      ) : (
        headerContent
      )}

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
        <div style={{ minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}
