  const fs = require('fs');
  const file = 'app/(app)/log/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // We want to remove the `<ConditionProgress>` from the top header
  content = content.replace(/<ConditionProgress\s+total=\{totalSymptomCount\}\s+completed=\{loggedSymptomCount\}\s*\/>/g, '');

  content = content.replace(/<button[^>]*onClick=\{handleSave\}[^>]*>[\s\S]*?<\/button>/g, `
      {/* Sticky Bottom Action Bar */}
      <div 
        className="fixed bottom-[env(safe-area-inset-bottom,24px)] left-0 right-0 z-50 pointer-events-none"
        style={{
          padding: "0 16px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div 
          className="pointer-events-auto"
          style={{
            maxWidth: "800px",
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "8px 8px 8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset"
          }}
        >
          {/* Left: Progress */}
          <div style={{ flexShrink: 0 }}>
            <ConditionProgress total={totalSymptomCount} completed={loggedSymptomCount} />
          </div>

          {/* Right: Save Button */}
          <button
            onClick={handleSave}
            className="group active:scale-[0.98] focus:outline-none"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0 16px 0 20px",
              height: "44px",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              borderRadius: "16px",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1), background-color 150ms",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(45,106,79,0.2)",
            }}
          >
            <span>{saveState === "saved" ? "Saved" : existingLog ? "Update log" : "Save log"}</span>
            <span
              className="w-7 h-7 rounded-full bg-black/[0.12] flex items-center justify-center
                         group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-[1.05]
                         transition-transform duration-150"
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              {saveState === "saved" ? (
                <CheckCircle size={14} weight="bold" />
              ) : (
                <ArrowRight size={14} weight="bold" />
              )}
            </span>
          </button>
        </div>
      </div>
  `);
  
  fs.writeFileSync(file, content);
