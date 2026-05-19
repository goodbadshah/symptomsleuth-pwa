"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/app/providers";
import type { Symptom } from "@/app/providers";
import { buildSuggestedSymptoms } from "@/utils/symptoms";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CONDITIONS = [
  "Anxiety", "Arthritis", "Asthma", "Atrial Fibrillation", "Autoimmune",
  "COPD", "Cancer", "Chronic Kidney Disease", "Chronic Lyme Disease", "Chronic Pain",
  "Dementia & Alzheimer's", "Depression", "Endometriosis", "Fibromyalgia", "Heart Disease",
  "Hypertension", "IBD", "IBS", "Liver Disease", "Long COVID", "MCAS",
  "Migraine", "Obesity", "Osteoporosis", "PCOS", "POTS", "Periodontal Disease",
  "Stroke", "Thyroid Disease", "Type 2 Diabetes"
];

// Helper to get active symptoms from currently selected conditions
function getInitialSymptoms(
  selectedConditions: string[],
  existingSymptoms: Symptom[]
): (Symptom & { enabled: boolean })[] {
  // Preseve all existing symptoms (enabled by default)
  const merged = existingSymptoms.map(s => ({ ...s, enabled: true }));
  const existingKeys = new Set(existingSymptoms.map(s => s.name.toLowerCase()));

  // For any new matching suggestions for the selected conditions, append them disabled
  const suggested = buildSuggestedSymptoms(selectedConditions);
  for (const s of suggested) {
    if (!existingKeys.has(s.name.toLowerCase())) {
      merged.push({ ...s, enabled: false });
    }
  }

  // We should only keep symptoms that are either custom or belong to a currently selected condition?
  // CLAUDE.md says: 'Do not retroactively delete...'. So we should show them.
  // Wait, if they are tracking it in their profile, it stays but maybe they want to uncheck it.
  return merged;
}

export default function ConditionManagerModal({ isOpen, onClose }: Props) {
  const { state, dispatch } = useAppState();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());
  const [workingSymptoms, setWorkingSymptoms] = useState<(Symptom & { enabled: boolean })[]>([]);
  const [addName, setAddName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedConditions(new Set(state.profile.conditions || []));
      setWorkingSymptoms([]);
      setAddName("");
    }
  }, [isOpen, state.profile.conditions, state.profile.symptoms]);

  if (!isOpen) return null;

  function handleContinueStep1() {
    // Transition to configuring symptoms
    const conditionsArr = Array.from(selectedConditions);
    const symptoms = getInitialSymptoms(conditionsArr, state.profile.symptoms || []);
    setWorkingSymptoms(symptoms);
    setStep(2);
  }

  function handleSave() {
    const finalSymptoms = workingSymptoms
      .filter((s) => s.enabled)
      .map(({ enabled, ...rest }) => rest);
      
    dispatch({ type: "SET_CONDITIONS", payload: Array.from(selectedConditions) });
    dispatch({ type: "SET_SYMPTOMS", payload: finalSymptoms });
    onClose();
  }

  function toggleCondition(c: string) {
    setSelectedConditions(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggleSymptom(id: string) {
    setWorkingSymptoms(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }

  function addCustomSymptom() {
    const name = addName.trim();
    if (!name) return;
    const cond = Array.from(selectedConditions)[0] ?? "Other";
    setWorkingSymptoms(prev => [
       ...prev, 
       { id: uuidv4(), name, condition: cond, enabled: true }
    ]);
    setAddName("");
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] overflow-y-auto bg-[--bg-primary] rounded-t-[1.5rem] shadow-xl mx-auto max-w-[800px]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-[--text-primary] m-0">
              {step === 1 ? "Manage Conditions" : "Tracked Symptoms"}
            </h2>
            <button 
              onClick={onClose}
              className="text-[14px] text-[--text-secondary] hover:text-[--text-primary]"
            >
              Cancel
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                  {CONDITIONS.map(c => {
                    const isSelected = selectedConditions.has(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCondition(c)}
                        className="w-full text-left truncate group active:scale-[0.98] relative transition-transform duration-150"
                        style={{
                          padding: "6px",
                          borderRadius: "1.25rem",
                          boxShadow: isSelected
                            ? "0 0 0 1.5px var(--accent)"
                            : `0 0 0 1px var(--bezel-ring)`,
                          backgroundColor: isSelected
                            ? "rgba(216,243,220,0.3)"
                            : "var(--bezel-outer-bg)",
                          transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                          cursor: "pointer",
                        }}
                      >
                        <div 
                          className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                          style={{ boxShadow: "var(--hover-glow)" }} 
                        />
                        <div style={{
                          padding: "10px 12px",
                          backgroundColor: isSelected ? "rgba(216,243,220,0.5)" : "var(--bg-surface)",
                          boxShadow: "var(--bezel-inset-shadow)",
                          borderRadius: "0.875rem",
                          minHeight: "56px",
                          transition: "background-color 200ms cubic-bezier(0.16,1,0.3,1)",
                        }}>
                          <span
                            className="text-[15px] font-medium leading-tight font-body truncate block"
                            style={{
                              color: isSelected ? "var(--accent)" : "var(--text-primary)",
                              transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                            }}
                          >
                            {c}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={handleContinueStep1}
                  disabled={selectedConditions.size === 0}
                  className="w-full flex items-center justify-between gap-3 px-5 py-[14px] rounded-[1.25rem] bg-[--accent] text-white disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] transition-transform duration-150"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                >
                  <span className="font-body font-medium text-[15px]">Next: Edit Symptoms</span>
                  <span className="w-8 h-8 rounded-full bg-black/[0.12] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-150">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex flex-col mb-8 -mx-6 md:-mx-8">
                  {workingSymptoms.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.id)}
                        className="w-full flex items-center justify-between px-6 md:px-8 py-4 text-left active:scale-[0.98] transition-transform duration-150"
                        style={{
                          borderBottom: "1px solid var(--border)",
                          backgroundColor: s.enabled ? "var(--bg-surface)" : "var(--bg-primary)",
                          opacity: s.enabled ? 1 : 0.45,
                          transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1), background-color 150ms cubic-bezier(0.16,1,0.3,1)",
                          minHeight: "56px",
                        }}
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-base font-medium font-body" style={{ color: "var(--text-primary)" }}>
                          {s.name}
                        </p>
                        <p className="text-sm mt-0.5 font-body" style={{ color: "var(--text-secondary)" }}>
                          {s.condition}
                        </p>
                      </div>
                      
                      {/* Checkbox syncing with SymphonySetup style */}
                      <span
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors duration-150"
                        style={{
                          border: `1.5px solid ${s.enabled ? "var(--accent)" : "var(--border)"}`,
                          backgroundColor: s.enabled ? "var(--accent)" : "transparent",
                          borderRadius: "4px",
                        }}
                      >
                        {s.enabled && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <polyline
                              points="1,4 4,7 9,1"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  ))}

                  <div className="mt-4 flex items-center gap-3 px-6 md:px-8 pt-4 pb-2 border-[--border]">
                    <input
                      type="text"
                      placeholder="Add another symptom..."
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                      className="flex-1 rounded-[12px] border border-[--border] px-4 py-3 font-body text-[14px] bg-[--bg-surface] text-[--text-primary] outline-none focus:border-[--accent] transition-colors placeholder-[--text-secondary]"
                    />
                    <button
                      onClick={addCustomSymptom}
                      disabled={!addName.trim()}
                      className="px-4 py-3 rounded-[12px] bg-[--border] text-[--text-primary] text-[14px] font-medium font-body disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center px-5 py-[14px] rounded-[1.25rem] border border-[--border] text-[--text-primary] group active:scale-[0.98] transition-transform duration-150 bg-[--bg-surface] hover:bg-[--border]"
                  >
                    <span className="font-body font-medium text-[15px]">Back</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex-[2] flex items-center justify-between gap-3 px-5 py-[14px] rounded-[1.25rem] bg-[--accent] text-white group active:scale-[0.98] transition-transform duration-150"
                  >
                    <span className="font-body font-medium text-[15px]">Save Changes</span>
                    <span className="w-8 h-8 rounded-full bg-black/[0.12] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-150">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6667 3.5L5.25004 9.91667L2.33337 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
