"use client";

import { useState } from "react";
import type { DailyContext } from "@/app/providers";

const FOOD_TRIGGERS = [
  "Dairy",
  "Gluten",
  "Alcohol",
  "Caffeine",
  "High Sugar",
  "High Sodium",
  "High FODMAPs",
  "Histamine",
  "Tyramine",
  "Nightshades",
  "PODS",
  "Processed Food",
  "Cruciferous Veg",
  "Alliums (Onion/Garlic)",
  "Legumes",
  "Soy",
  "Red Meat",
  "Eggs",
  "Nuts & Seeds",
  "Artificial Sweeteners",
  "Seafood",
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
                  return (
                    <button
                      key={trigger}
                      onClick={() => toggle(trigger)}
                      className="active:scale-[0.98] group flex-none relative"
                      style={{
                        height: "56px",
                        padding: "3px",
                        borderRadius: "12px",
                        boxShadow: isSelected
                          ? "0 0 0 1px var(--bg-primary), 0 0 0 2.5px var(--accent)"
                          : "0 0 0 1px var(--bezel-ring)",
                        backgroundColor: isSelected
                          ? "var(--bg-primary)"
                          : "var(--bezel-outer-bg)",
                        transition:
                          "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1), transform 150ms",
                        cursor: "pointer",
                        border: "none",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      aria-pressed={isSelected}
                    >
                      {/* Inner core */}
                      <div
                        className="flex items-center justify-center relative overflow-hidden"
                        style={{
                          height: "100%",
                          padding: "0 16px",
                          backgroundColor: isSelected ? "var(--accent)" : "var(--bg-surface)",
                          color: isSelected ? "#ffffff" : "var(--text-secondary)",
                          boxShadow: "var(--bezel-inset-shadow)",
                          borderRadius: "9px",
                          transition:
                            "background-color 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)",
                        }}
                      >
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
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
