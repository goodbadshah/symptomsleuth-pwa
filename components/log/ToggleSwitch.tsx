"use client";

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export default function ToggleSwitch({ value, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label ?? "Toggle"}
      onClick={() => onChange(!value)}
      style={{
        position: "relative",
        width: 48,
        height: 28,
        padding: 0,
        borderRadius: 14,
        backgroundColor: value ? "var(--accent)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        transition: "background-color 200ms ease-out",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: 0,
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          transform: value ? "translateX(23px)" : "translateX(3px)",
          transition: "transform 200ms ease-out",
          boxShadow: "var(--shadow)",
        }}
      />
      <span className="sr-only">{value ? "On" : "Off"}</span>
    </button>
  );
}
