/**
 * Severity Glyph System
 * --------------------------------------------------------------------
 * Five authored abstract marks that escalate in visual density to
 * mirror the severity scale. They replace emoticon faces everywhere
 * severity is shown (chips, Timeline tooltips, Insights summaries,
 * Doctor Report header).
 *
 * Scale (matches SeverityChipSelector 0–4 with 5 kept as legacy-extreme):
 *   0 - None           single horizontal hairline (absence marker)
 *   1 - Mild           one small filled dot
 *   2 - Moderate-low   two dots stacked
 *   3 - Moderate       three dots in a tight triangle
 *   4 - Severe         filled circle with a thin outer ring
 *   5 - Extreme        severe glyph with a second concentric outer ring
 *
 * All glyphs:
 *   - Render at currentColor so they inherit the chip's text color
 *   - Default size 12px, centered on a 16x16 viewBox
 *   - Stroke width tuned for crisp rendering at native size
 *
 * Usage:
 *   import { SeverityGlyph } from "@/utils/severityGlyphs";
 *   <SeverityGlyph value={3} size={12} />
 *
 * Or import individual components:
 *   import { GlyphMild } from "@/utils/severityGlyphs";
 *   <GlyphMild size={14} />
 */

import { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  focusable: false,
});

/* 0 - None: single horizontal hairline, absence marker */
export function GlyphNone({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <line
        x1="3"
        y1="8"
        x2="13"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* 1 - Mild: one small filled dot */
export function GlyphMild({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* 2 - Moderate-low: two dots stacked vertically */
export function GlyphModerateLow({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <circle cx="8" cy="5.5" r="1.25" fill="currentColor" />
      <circle cx="8" cy="10.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

/* 3 - Moderate: three dots in a tight triangle (one top, two bottom) */
export function GlyphModerate({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <circle cx="8" cy="5" r="1.25" fill="currentColor" />
      <circle cx="5.5" cy="10.5" r="1.25" fill="currentColor" />
      <circle cx="10.5" cy="10.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

/* 4 - Severe: filled 7px circle with a thin 1px outer ring */
export function GlyphSevere({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <circle cx="8" cy="8" r="3.5" fill="currentColor" />
      <circle
        cx="8"
        cy="8"
        r="5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

/* 5 - Extreme: severe glyph + second concentric outer ring */
export function GlyphExtreme({ size = 12, ...rest }: GlyphProps) {
  return (
    <svg {...baseProps(size)} {...rest}>
      <circle cx="8" cy="8" r="3.5" fill="currentColor" />
      <circle
        cx="8"
        cy="8"
        r="5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Dispatcher: takes a numeric severity value and returns the right glyph.
 * Accepts 0-5. Values outside range fall back to GlyphNone.
 *
 * The chip selector stores values 0-4. Legacy log entries may store 5 -
 * treat those as Extreme (visually equivalent to 4 + an outer ring).
 */
export function SeverityGlyph({
  value,
  size = 12,
  ...rest
}: GlyphProps & { value: number }) {
  switch (value) {
    case 1:
      return <GlyphMild size={size} {...rest} />;
    case 2:
      return <GlyphModerateLow size={size} {...rest} />;
    case 3:
      return <GlyphModerate size={size} {...rest} />;
    case 4:
      return <GlyphSevere size={size} {...rest} />;
    case 5:
      return <GlyphExtreme size={size} {...rest} />;
    case 0:
    default:
      return <GlyphNone size={size} {...rest} />;
  }
}
