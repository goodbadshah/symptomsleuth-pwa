"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyContext } from "@/app/providers";

const FOOD_TRIGGERS = [
  "Alcohol",
  "Alliums (Onion/Garlic)",
  "Artificial Sweeteners",
  "Caffeine",
  "Cruciferous Veg",
  "Dairy",
  "Eggs",
  "Gluten",
  "High FODMAPs",
  "High Sodium",
  "High Sugar",
  "Histamine",
  "Legumes",
  "Nightshades",
  "Nuts & Seeds",
  "PODS",
  "Processed Food",
  "Red Meat",
  "Seafood",
  "Soy",
  "Tyramine",
];

interface Props {
  value: DailyContext;
  onChange: (ctx: DailyContext) => void;
}

export default function FoodTriggers({ value, onChange }: Props) {
  const [open, setOpen] = useState(true);

  const selected = new Set(value.foodTriggers ?? []);

  function toggle(trigger: string) {
    const next = new Set(selected);
    if (next.has(trigger)) {
      next.delete(trigger);
    } else {
      next.add(trigger);
    }
    const triggers = [...next];
    onChange({
      ...value,
      foodTriggers: triggers.length > 0 ? triggers : undefined,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        margin: "0 -16px",
      }}
    >
      {/* Toggle header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between tap-feedback"
          style={{
            padding: "14px 16px",
            minHeight: "52px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <p
              className="text-base font-medium"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              Dietary Intake
            </p>
            
          </div>
          <span
            aria-hidden="true"
            style={{
              color: "var(--text-secondary)",
              transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
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
        </button>

        {/* Collapsible body */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1)",
            overflow: "hidden",
          }}
        >
          <div style={{ minHeight: 0 }}>
            <div
              style={{
                padding: "0 16px 14px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginBottom: "10px",
                }}
              >
                Select any categories you consumed today.
              </p>
              {/* 2-column chip grid - same pattern as onboarding ConditionSelect */}
              <div className="flex flex-wrap gap-2">
                {FOOD_TRIGGERS.map((trigger) => {
                  const isSelected = selected.has(trigger);
                  
                  const restingBoxShadow = "0 0 0 1px var(--bezel-ring)";
                  const selectedBoxShadow = "0 0 0 1px var(--bg-primary), 0 0 0 2.5px var(--accent)";
                  
                  return (
                    <motion.button
                      key={trigger}
                      onClick={() => toggle(trigger)}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      animate={isSelected ? "selected" : "rest"}
                      variants={{
                        rest: { scale: 1, boxShadow: restingBoxShadow, backgroundColor: "var(--bezel-outer-bg)" },
                        hover: { scale: 1.04, boxShadow: isSelected ? selectedBoxShadow : restingBoxShadow, backgroundColor: "var(--bg-primary)" },
                        tap: { scale: 0.90 },
                        selected: { scale: 1, boxShadow: selectedBoxShadow, backgroundColor: "var(--bg-primary)" }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 25,
                      }}
                      style={{
                        flex: "none",
                        position: "relative",
                        height: "56px",
                        padding: "3px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        border: "none",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {/* Inner core */}
                      <motion.div
                        variants={{
                          rest: { backgroundColor: isSelected ? "var(--accent)" : "var(--bg-surface)", color: isSelected ? "#ffffff" : "var(--text-secondary)" },
                          hover: { backgroundColor: "var(--accent)", color: "#ffffff" },
                          tap: { backgroundColor: "var(--accent)", color: "#ffffff" },
                          selected: { backgroundColor: "var(--accent)", color: "#ffffff" }
                        }}
                        style={{
                          height: "100%",
                          padding: "0 16px",
                          boxShadow: isSelected
                            ? "var(--bezel-inset-shadow), inset 0 1px 2px rgba(0,0,0,0.06)"
                            : "var(--bezel-inset-shadow)",
                          borderRadius: "9px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Animated Glow Layer strictly inside the chip for center pulse */}
                        <AnimatePresence>
                          <motion.div
                            variants={{
                              rest: { opacity: 0, scale: 0.9 },
                              hover: { opacity: [0.6, 0.9, 0.6], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
                              selected: { opacity: [0.8, 1, 0.8], scale: [0.98, 1.05, 0.98], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `radial-gradient(circle at center, rgba(255,255,255,0.2), transparent 85%)`,
                              zIndex: 0,
                              pointerEvents: "none",
                            }}
                          />
                        </AnimatePresence>

                        <span
                          style={{
                            fontSize: "14px",
                            fontFamily: "var(--font-body)",
                            fontWeight: isSelected ? 600 : 500,
                            lineHeight: 1.1,
                            whiteSpace: "nowrap",
                            position: "relative",
                            zIndex: 10,
                          }}
                        >
                          {trigger}
                        </span>
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
