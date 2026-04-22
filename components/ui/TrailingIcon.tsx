interface TrailingIconProps {
  children: React.ReactNode;
}

// Nested circular icon container for button-in-button CTAs.
// Usage: place inside a button alongside the label text.
export default function TrailingIcon({ children }: TrailingIconProps) {
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center
                 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-[1.05]
                 transition-transform duration-150"
      style={{
        backgroundColor: "rgba(0,0,0,0.12)",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </span>
  );
}
