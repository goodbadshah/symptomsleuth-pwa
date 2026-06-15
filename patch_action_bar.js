const fs = require('fs');
const file = 'app/(app)/log/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove inline ConditionProgress
content = content.replace(/<ConditionProgress\s+total=\{totalSymptomCount\}\s+completed=\{loggedSymptomCount\}\s*\/>/g, '');

// 2. Replace the Save button block
const buttonRegex = /\{\/\* Save \/ Update - Button-in-Button \*\/\}\s*<div className="pt-6"[^>]*>[\s\S]*?<\/motion\.button>\s*<\/div>/g;
content = content.replace(buttonRegex, `
      {/* Sticky Bottom Action Bar */}
      <div 
        className="fixed bottom-[env(safe-area-inset-bottom,72px)] left-0 right-0 z-50 pointer-events-none"
        style={{
          padding: "0 16px",
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-8px)"
        }}
      >
        <div 
          className="pointer-events-auto w-full max-w-[480px]"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "8px 8px 8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9)"
          }}
        >
          {/* Left: Progress */}
          <div style={{ flexShrink: 0 }}>
            <ConditionProgress total={totalSymptomCount} completed={loggedSymptomCount} />
          </div>

          {/* Right: Save Button */}
          <motion.button
            onClick={handleSave}
            disabled={saveState === "saved"}
            whileHover={saveState !== "saved" ? { scale: 1.02 } : undefined}
            whileTap={saveState !== "saved" ? { scale: 0.95 } : undefined}
            className={\`group flex items-center gap-3 px-4 tap-feedback \${saveState !== "saved" ? "shadow-[0_2px_8px_rgba(45,106,79,0.2)]" : ""}\`}
            style={{
              height: "44px",
              borderRadius: "16px",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: saveState === "saved" ? "default" : "pointer",
              position: "relative",
              transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)"
            }}
            aria-label={isUpdate ? "Update log" : "Save log"}
          >
            <span
              className="text-[14px] font-semibold"
              style={{ opacity: saveState === "saved" ? 0 : 1, transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)" }}
            >
              {isUpdate ? "Update" : "Save"}
            </span>

            <span
              style={{
                position: "absolute",
                left: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                opacity: saveState === "saved" ? 1 : 0,
                transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
                pointerEvents: "none",
              }}
              aria-hidden={saveState !== "saved"}
            >
              Saved
            </span>

            <span
              className="w-6 h-6 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            >
              {saveState === "saved" ? (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <polyline points="1,5 4.5,8.5 11,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="4,2 8,6 4,10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </motion.button>
        </div>
      </div>
`);

fs.writeFileSync(file, content);
