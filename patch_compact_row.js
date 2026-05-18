const fs = require('fs');
const file = 'components/log/SymptomWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix ActiveRow value flash
content = content.replace(
  "{justSaved && value > 0 && (",
  "{justSaved && value !== undefined && value >= 0 && ("
);

// Replace CompactRow function completely
const compactRowRegex = /function CompactRow\(\{[\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?<\/[a-z]+>\s*\);\s*\}/m;
content = content.replace(compactRowRegex, `function CompactRow({
  symptom,
  value,
  state,
  onJump,
  isLast,
  showUpNextLabel,
}: {
  symptom: Symptom;
  value: number;
  state: "done" | "upcoming";
  onJump: () => void;
  isLast: boolean;
  showUpNextLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const isDone = state === "done";
  const hasSeverity = isDone && value >= 0;
  const displayValue = Math.min(value, 4);

  const SOLID_BGS = [
    "var(--severity-1)",
    "var(--severity-2)",
    "var(--severity-3)",
    "var(--severity-4)",
    "var(--severity-5)"
  ];

  const bgColor = hasSeverity 
    ? SOLID_BGS[displayValue]
    : hover ? "rgba(0,0,0,0.015)" : "transparent";

  const nameColor = hasSeverity 
    ? "#ffffff" 
    : isDone ? "var(--text-primary)" : "var(--text-secondary)";
    
  const glyphColor = hasSeverity
    ? "#ffffff"
    : value >= 0 && isDone ? "var(--text-primary)" : "var(--text-secondary)";
    
  const secondaryColor = hasSeverity 
    ? "rgba(255,255,255,0.7)" 
    : "var(--text-secondary)";

  const opacity = isDone ? 1 : 0.6;
  const scale = isDone ? 1 : 0.98;
  const filter = isDone ? "none" : "blur(0.5px)";
  const valueLabel = isDone ? CHIP_LABELS[displayValue] : "";

  return (
    <button
      type="button"
      onClick={onJump}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="tap-feedback"
      aria-label={\`Edit \${symptom.name}\`}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        padding: "16px 14px",
        margin: "0 0 2px 0",
        borderRadius: "0px",
        border: hasSeverity ? "1px solid transparent" : "1px solid var(--border)",
        backgroundColor: bgColor,
        cursor: "pointer",
        textAlign: "left",
        WebkitTapHighlightColor: "transparent",
        opacity,
        transform: \`scale(\${scale})\`,
        filter,
        transformOrigin: "left center",
        transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1), filter 300ms ease, background-color 200ms ease",
        minHeight: "44px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <p
          style={{
            fontSize: "16px",
            fontWeight: hasSeverity ? 500 : 400,
            color: nameColor,
            fontFamily: "var(--font-body)",
            margin: 0,
            flex: 1,
            lineHeight: 1.1,
          }}
        >
          {symptom.name}
        </p>

        {isDone ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: glyphColor,
              fontWeight: hasSeverity ? 600 : 400,
              fontSize: "14px",
              fontFamily: "var(--font-body)",
              lineHeight: 1.1,
            }}
          >
            <SeverityGlyph value={value} size={14} />
            <span style={{ color: hasSeverity ? "#ffffff" : "var(--text-secondary)" }}>
              {valueLabel}
            </span>
          </span>
        ) : showUpNextLabel ? (
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            Up next
          </span>
        ) : null}
      </div>
    </button>
  );
}`);

fs.writeFileSync(file, content);
console.log('patched');
