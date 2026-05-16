"use client";

import { useState } from "react";
import type { DailyContext } from "@/app/providers";

const FOOD_TRIGGERS = [
  "Dairy",
  "Eggs",
  "Poultry",
  "Red Meat",
  "Seafood",
  "Legumes",
  "Cruciferous Veg",
  "Nightshades",
  "Gluten",
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
    // Outer shell - Double-Bezel
    <div
      style={{
        padding: "6px",
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px var(--bezel-ring)",
        backgroundColor: "var(--bezel-outer-bg)",
      }}
    >
      {/* Inner core */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--bezel-inset-shadow)",
          borderRadius: "0.875rem",
          overflow: "hidden",
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
              Food Triggers
            </p>
            {/* Eyebrow pill - optional */}
            <span
              className="inline-flex items-center rounded-full"
              style={{
                padding: "2px 8px",
                fontSize: "10px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                backgroundColor: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              Optional
            </span>
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
                padding: "0 12px 14px",
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
                Select anything you ate today.
              </p>
              {/* 2-column chip grid - same pattern as onboarding ConditionSelect */}
              <div className="grid grid-cols-2 gap-2">
                {FOOD_TRIGGERS.map((trigger) => {
                  const isSelected = selected.has(trigger);
                  return (
                    <button
                      key={trigger}
                      onClick={() => toggle(trigger)}
                      className="w-full tap-feedback group relative"
                      style={{
                        padding: "6px",
                        borderRadius: "1.25rem",
                        boxShadow: isSelected
                          ? "0 0 0 1.5px var(--accent)"
                          : "0 0 0 1px var(--bezel-ring)",
                        backgroundColor: isSelected
                          ? "rgba(216,243,220,0.3)"
                          : "var(--bezel-outer-bg)",
                        transition:
                          "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1), transform 150ms",
                        cursor: "pointer",
                        border: "none",
                        overflow: "hidden", // ensures the pulse doesn't break out awkwardly if needed, but actually we might want it visible
                      }}
                      aria-pressed={isSelected}
                    >
                      {/* Inner core */}
                      <div
                        className="flex items-start text-left relative overflow-hidden"
                        style={{
                          padding: "10px 12px",
                          backgroundColor: isSelected
                          ? "rgba(216,243,220,0.6)"
                          : "rgba(216,243,220,0.25)",
                          boxShadow: "var(--bezel-inset-shadow)",
                          borderRadius: "0.875rem",
                          minHeight: "44px",
                          transition:
                            "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                        }}
                      >
                        {/* Pulse Glow Layer inside the core */}
                        <div 
                          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                            isSelected ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100 group-hover:animate-pulse'
                          }`}
                          style={{
                            background: 'radial-gradient(circle at center, rgba(45,106,79,0.3), transparent 70%)',
                            zIndex: 0,
                          }}
                        />
                        
                        <span
                          className={`text-sm font-medium leading-tight relative z-10 food-trigger-label${isSelected ? " food-trigger-label--selected" : ""}`}
                          style={{
                            fontFamily: "var(--font-body)",
                            transition:
                              "color 200ms cubic-bezier(0.16,1,0.3,1)",
                          }}
                        >
                          {trigger}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
