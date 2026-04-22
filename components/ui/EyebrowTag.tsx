interface EyebrowTagProps {
  children: React.ReactNode;
  variant?: "accent" | "neutral";
}

export default function EyebrowTag({ children, variant = "accent" }: EyebrowTagProps) {
  const styles =
    variant === "accent"
      ? { backgroundColor: "var(--accent-light)", color: "var(--accent)" }
      : { backgroundColor: "var(--border)", color: "var(--text-secondary)" };

  return (
    <span
      style={styles}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium"
    >
      {children}
    </span>
  );
}
