const fs = require('fs');
const file = 'app/(app)/log/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetBlockRegex = /\{\/\* Sticky Bottom Action Bar \*\/\}[\s\S]*?<\/motion\.button>\s*<\/div>\s*<\/div>/;

const newBlock = `
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
            backgroundColor: "var(--bezel-outer-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "8px 8px 8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px var(--bezel-ring)",
          }}
        >
          {/* Inner highlight (glass only visible in light mode per CLAUDE.md spec) */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "24px", boxShadow: "var(--bezel-inset-shadow)", pointerEvents: "none" }} />
          
          {/* Left: Progress */}
          <div style={{ flexShrink: 0, zIndex: 1 }}>
            <ConditionProgress total={totalSymptomCount} completed={loggedSymptomCount} />
          </div>

          {/* Right: Save Button */}
          <motion.button
            onClick={handleSave}
            disabled={saveState === "saved" || totalSymptomCount === 0 || loggedSymptomCount < totalSymptomCount}
            initial="rest"
            whileHover={saveState !== "saved" && loggedSymptomCount === totalSymptomCount ? "hover" : "rest"}
            whileTap={saveState !== "saved" && loggedSymptomCount === totalSymptomCount ? "tap" : "rest"}
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.02 },
              tap: { scale: 0.95 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={\`group flex items-center gap-3 px-4 z-10 \${saveState !== "saved" && loggedSymptomCount === totalSymptomCount ? "shadow-[0_2px_8px_rgba(45,106,79,0.2)] tap-feedback" : ""}\`}
            style={{
              height: "44px",
              borderRadius: "16px",
              backgroundColor: saveState === "saved" ? "var(--bg-surface)" : loggedSymptomCount === totalSymptomCount ? "var(--accent)" : "transparent",
              color: saveState === "saved" ? "var(--accent)" : loggedSymptomCount === totalSymptomCount ? "#ffffff" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              border: saveState === "saved" ? "1px solid var(--accent)" : loggedSymptomCount === totalSymptomCount ? "none" : "1px solid var(--border)",
              cursor: (saveState === "saved" || loggedSymptomCount < totalSymptomCount) ? "default" : "pointer",
              position: "relative",
              boxShadow: (saveState === "saved" || loggedSymptomCount < totalSymptomCount) ? "none" : "inset 0 1px 1px rgba(255,255,255,0.4)"
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
              className={\`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 \${loggedSymptomCount === totalSymptomCount && saveState !== "saved" ? "group-hover:translate-x-0.5 group-hover:-translate-y-px bg-black/10 group-hover:bg-white/20" : ""}\`}
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            >
              {saveState === "saved" ? (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <polyline points="1,5 4.5,8.5 11,1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </motion.button>
        </div>
      </div>
`;
content = content.replace(targetBlockRegex, newBlock.trim());
fs.writeFileSync(file, content);
