"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/app/providers";
import type { DailyLog, DailyContext, SymptomEntry, Symptom } from "@/app/providers";
import ContextFields from "@/components/log/ContextFields";
import FoodTriggers from "@/components/log/FoodTriggers";
import { submitAnonymousLog } from "@/utils/community";
import { useInView, entryStyle } from "@/hooks/useInView";
import { useStreak } from "@/hooks/useStreak";
import SaveConfirmModal from "@/components/log/SaveConfirmModal";
import { pickRandomMessage } from "@/utils/logMessages";
import type { LogMessage } from "@/utils/logMessages";
import ConditionChapterMarker from "@/components/log/ConditionChapterMarker";
import ConditionProgress from "@/components/log/ConditionProgress";
import SymptomWizard from "@/components/log/SymptomWizard";
import ConditionManagerModal from "@/components/log/ConditionManagerModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────────────────────

function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

/** "yesterday" / "2 days ago" / "last Tuesday" / ISO date if > 14 days */
function getRelativeDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((todayStart.getTime() - target.getTime()) / 86400000);
  if (diffDays === 1) return "yesterday";
  if (diffDays === 2) return "2 days ago";
  if (diffDays <= 14) {
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(target);
    return `last ${weekday}`;
  }
  return dateStr;
}

/** "9:23 AM" - from an ISO loggedAt string */
function getRelativeTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}

// ─── Types ───────────────────────────────────────────────────────────────────────────────────

type EntryMap = Record<string, number | undefined>;

interface ConditionGroup {
  condition: string;
  symptoms: Symptom[];
}

// ─── Symptom group with double-bezel + scroll entry ───────────────────────────────────────────

function SymptomGroup({
  condition,
  groupSymptoms,
  isCollapsed,
  onToggle,
  entries,
  activeSymptomIndex,
  onEntryChange,
  onSetActiveSymptomIndex,
  justSaved,
  entryIndex,
  complete,
  justCompleted,
  onNothingToReport,
}: {
  condition: string;
  groupSymptoms: Symptom[];
  isCollapsed: boolean;
  onToggle: () => void;
  entries: EntryMap;
  activeSymptomIndex: number;
  onEntryChange: (id: string, v: number) => void;
  onSetActiveSymptomIndex: (index: number) => void;
  justSaved: boolean;
  entryIndex: number;
  complete: boolean;
  justCompleted: boolean;
  onNothingToReport: () => void;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      id={`condition-group-${condition}`}
      style={{
        ...entryStyle(inView, entryIndex),
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ConditionChapterMarker
        condition={condition}
        collapsed={isCollapsed}
        onToggle={onToggle}
        previewValues={groupSymptoms.map((s) => entries[s.id] ?? -1)}
        complete={complete}
        justCompleted={justCompleted}
        onNothingToReport={onNothingToReport}
      >
        <SymptomWizard
          groupSymptoms={groupSymptoms}
          entries={entries}
          activeIndex={activeSymptomIndex}
          onEntryChange={onEntryChange}
          onSetActiveIndex={onSetActiveSymptomIndex}
          justSaved={justSaved}
          complete={complete}
        />
      </ConditionChapterMarker>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────────────────────────

export default function LogPage() {
  const { state, dispatch } = useAppState();
  const { symptoms, conditions, communityOptIn } = state.profile;

  const today = todayLocalDate();
  const heading = formatHeading(today);

  const existingLog = state.logs.find((l) => l.date === today);
  const isUpdate = !!existingLog;

  // Hero date context string
  const uniqueLoggedDates = [...new Set(state.logs.map((l) => l.date))];
  const loggedDaysCount = uniqueLoggedDates.length;
  const mostRecentPastLog = state.logs
    .filter((l) => l.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const contextString: string = isUpdate
    ? `Day ${loggedDaysCount} · Logged ${getRelativeTime(existingLog!.loggedAt)} - tap to update`
    : loggedDaysCount === 0
    ? "Day 1 · First trail entry"
    : `Day ${loggedDaysCount + 1} · Last logged ${getRelativeDate(mostRecentPastLog!.date)}`;

  const showMenstrualField = conditions.some(
    (c) => c === "PCOS" || c === "Endometriosis"
  );

  const groups: ConditionGroup[] = [];
  const seenConditions = new Set<string>();

  const allConditionsInOrder = [
    ...conditions,
    ...symptoms.map((s) => s.condition).filter((c) => !conditions.includes(c)),
  ];

  for (const condition of allConditionsInOrder) {
    if (seenConditions.has(condition)) continue;
    seenConditions.add(condition);
    const groupSymptoms = symptoms.filter((s) => s.condition === condition);
    if (groupSymptoms.length > 0) {
      groups.push({ condition, symptoms: groupSymptoms });
    }
  }

  // Wizard-style flow: first condition expanded, rest collapsed.
  // For existing logs, all groups expanded (user is editing, not progressing).
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (existingLog) return new Set();
    return new Set(groups.slice(1).map((g) => g.condition));
  });

  function toggleGroup(condition: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(condition)) next.delete(condition);
      else next.add(condition);
      return next;
    });
  }

  // Track which conditions the user has "resolved" — either by filling every symptom
  // or by tapping Nothing to report. Used to advance the progress indicator and
  // auto-collapse completed sections.
  const [completedConditions, setCompletedConditions] = useState<Set<string>>(() => {
    if (!existingLog) return new Set();
    // Pre-mark conditions complete if all their symptoms appear in the existing log.
    const loggedIds = new Set(existingLog.entries.map((e) => e.symptomId));
    return new Set(
      groups
        .filter((g) => g.symptoms.every((s) => loggedIds.has(s.id)))
        .map((g) => g.condition)
    );
  });

  // One-shot pulse target — the condition that *just* transitioned to complete.
  const [justCompletedCondition, setJustCompletedCondition] = useState<string | null>(null);

  // Per-symptom wizard cursor inside each condition. Starts at 0 for every group.
  const [activeSymptomIndex, setActiveSymptomIndex] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    groups.forEach((g) => {
      map[g.condition] = 0;
    });
    return map;
  });

  const [entries, setEntries] = useState<EntryMap>(() => {
    if (existingLog) {
      const map: EntryMap = Object.fromEntries(symptoms.map((s) => [s.id, 0]));
      existingLog.entries.forEach(e => { map[e.symptomId] = e.value; });
      return map;
    }
    return {};
  });

  const [context, setContext] = useState<DailyContext>(existingLog?.context ?? {});
  const [note, setNote] = useState(existingLog?.note ?? "");
  const [noteOpen, setNoteOpen] = useState(false);



  useEffect(() => {
    if (existingLog) {
      setEntries(Object.fromEntries(existingLog.entries.map((e) => [e.symptomId, e.value])));
      setContext(existingLog.context ?? {});
      setNote(existingLog.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingLog?.date]);

  /**
   * Advance the wizard when a condition becomes fully filled.
   * Triggered by a chip commit that pushes the last symptom in the group above 0.
   */
  function advanceFromCondition(condition: string) {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate([15, 30, 20]);
      } catch(e) {}
    }

    setJustCompletedCondition(condition);
    setCompletedConditions((prev) => {
      if (prev.has(condition)) return prev;
      const next = new Set(prev);
      next.add(condition);
      return next;
    });
    // After the pulse, collapse the completed group and open the next incomplete one.
    window.setTimeout(() => {
      setCollapsedGroups((prevCollapsed) => {
        const nextCollapsed = new Set(prevCollapsed);
        nextCollapsed.add(condition);
        setCompletedConditions((doneSet) => {
          const nextGroup = groups.find(
            (g) => g.condition !== condition && !doneSet.has(g.condition)
          );
          if (nextGroup) {
            nextCollapsed.delete(nextGroup.condition);
            // Smooth scroll to the next group after the accordion finishes animating (400ms)
            window.setTimeout(() => {
              const el = document.getElementById(`condition-group-${nextGroup.condition}`);
              if (el) {
                const _container = el.closest(".overflow-y-auto") as HTMLElement | null;
                if (_container) {
                  const headerOffset = 180; // offset for collapsed chapter height
                  const elementPosition = el.getBoundingClientRect().top;
                  const containerPosition = _container.getBoundingClientRect().top;
                  const offsetPosition = elementPosition - containerPosition + _container.scrollTop - headerOffset;
                  _container.scrollTo({ top: offsetPosition, behavior: "smooth" });
                } else {
                  const headerOffset = 180;
                  const elementPosition = el.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }
            }, 400);
          } else {
            // All conditions are completed; scroll down to the dietary intake section
            window.setTimeout(() => {
              const foodSection = document.getElementById("food-triggers-section");
              if (foodSection) {
                const _container = foodSection.closest(".overflow-y-auto") as HTMLElement | null;
                if (_container) {
                  const headerOffset = 90; // Just under the top nav
                  const elementPosition = foodSection.getBoundingClientRect().top;
                  const containerPosition = _container.getBoundingClientRect().top;
                  const offsetPosition = elementPosition - containerPosition + _container.scrollTop - headerOffset;
                  _container.scrollTo({ top: offsetPosition, behavior: "smooth" });
                } else {
                  const headerOffset = 90;
                  const elementPosition = foodSection.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }
            }, 400);
          }
          return doneSet;
        });
        return nextCollapsed;
      });
      setJustCompletedCondition(null);
    }, 600);
  }

  function handleEntryChange(symptomId: string, value: number) {
    setEntries((prev) => {
      const next = { ...prev, [symptomId]: value };
      const group = groups.find((g) => g.symptoms.some((s) => s.id === symptomId));
      if (!group) return next;

      const symptomIndex = group.symptoms.findIndex((s) => s.id === symptomId);
      const currentActive = activeSymptomIndex[group.condition] ?? 0;

      // Only auto-advance when committing the active symptom.
      if (symptomIndex === currentActive) {
        const isLastSymptom = symptomIndex === group.symptoms.length - 1;
        if (isLastSymptom) {
          // Condition complete — schedule advance after chip animation settles.
          if (!completedConditions.has(group.condition)) {
            window.setTimeout(() => advanceFromCondition(group.condition), 150);
          }
        } else {
          // Step to next symptom in this condition.
          window.setTimeout(() => {
            setActiveSymptomIndex((prevMap) => ({
              ...prevMap,
              [group.condition]: symptomIndex + 1,
            }));
          }, 150);
        }
      }
      return next;
    });
  }

  function handleSetActiveSymptomIndex(condition: string, index: number) {
    // Jumping back into a symptom un-completes the condition so it can be edited.
    setCompletedConditions((prev) => {
      if (!prev.has(condition)) return prev;
      const next = new Set(prev);
      next.delete(condition);
      return next;
    });
    setActiveSymptomIndex((prev) => ({ ...prev, [condition]: index }));
  }

  function handleNothingToReport(condition: string) {
    const group = groups.find((g) => g.condition === condition);
    if (!group) return;
    setEntries((prev) => {
      const next = { ...prev };
      group.symptoms.forEach((s) => {
        next[s.id] = 0;
      });
      return next;
    });
    advanceFromCondition(condition);
  }

  // Progress counts — every symptom is one unit. A condition marked complete via
  // "No symptoms today" counts all its symptoms as logged even though their values are 0.
  const totalSymptomCount = groups.reduce((sum, g) => sum + g.symptoms.length, 0);
  const loggedSymptomCount = groups.reduce((sum, g) => {
    if (completedConditions.has(g.condition)) return sum + g.symptoms.length;
    return sum + (activeSymptomIndex[g.condition] ?? 0);
  }, 0);

  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [showModal, setShowModal] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<LogMessage | null>(null);
  const { count: streak } = useStreak();

  const handleSave = useCallback(() => {
    const entryList: SymptomEntry[] = symptoms
      .map((s) => ({ symptomId: s.id, value: entries[s.id] ?? 0 }))
      .filter((e) => e.value !== 0);

    const hasContext = Object.keys(context).some(
      (k) => context[k as keyof DailyContext] !== undefined
    );

    const log: DailyLog = {
      date: today,
      entries: entryList,
      ...(hasContext && { context }),
      ...(note.trim() && { note: note.trim() }),
      loggedAt: new Date().toISOString(),
    };

    dispatch({ type: "SAVE_LOG", payload: log });

    if (communityOptIn) {
      void submitAnonymousLog(log, symptoms);
    }

    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 800);

    // Post-save modal - random message on every successful save
    setCurrentMessage(pickRandomMessage());
    setShowModal(true);
  }, [symptoms, entries, context, note, today, dispatch, communityOptIn]);

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: "50vh", "--sticky-offset": "150px" } as React.CSSProperties}>
      {/* Date Header Block */}
      <div>
        <div className="max-w-[800px] mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-4">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "44px",
              fontWeight: 400,
              lineHeight: 1.05,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {heading}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "6px",
              marginBottom: "24px",
              letterSpacing: "0.03em",
            }}
          >
            {contextString}
          </p>

          {/* Section eyebrow */}
          {symptoms.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--text-secondary)",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                TODAY&rsquo;S LOG
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "16px",
                  margin: "0 0 4px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Rate Your Symptoms
                </p>
                <ConditionProgress
                  total={totalSymptomCount}
                  completed={loggedSymptomCount}
                />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: "1.4",
                }}
              >
                One deliberate tap per symptom.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-8 pt-4">

      {symptoms.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            No symptoms set up yet.
          </p>
        </div>
      )}

      <div className="pt-2">
        {groups.map(({ condition, symptoms: groupSymptoms }, index) => {
          const isCollapsed = collapsedGroups.has(condition);
          const isComplete = completedConditions.has(condition);
          return (
            <SymptomGroup
              key={condition}
              condition={condition}
              groupSymptoms={groupSymptoms}
              isCollapsed={isCollapsed}
              onToggle={() => toggleGroup(condition)}
              entries={entries}
              activeSymptomIndex={activeSymptomIndex[condition] ?? 0}
              onEntryChange={handleEntryChange}
              onSetActiveSymptomIndex={(i) => handleSetActiveSymptomIndex(condition, i)}
              justSaved={saveState === "saved"}
              entryIndex={index}
              complete={isComplete}
              justCompleted={justCompletedCondition === condition}
              onNothingToReport={() => handleNothingToReport(condition)}
            />
          );
        })}
      </div>

      {/* Dietary Intake */}
      <div id="food-triggers-section" className="my-2" style={{ margin: "0 -16px" }}>
        <FoodTriggers value={context} onChange={setContext} />
      </div>

      {/* Context */}
      <div className="my-2" style={{ margin: "0 -16px" }}>
        <ContextFields
          value={context}
          onChange={setContext}
          showMenstrualField={showMenstrualField}
        />
      </div>

      {/* Note */}
      <div className="my-2" style={{ borderBottom: "1px solid var(--border)", margin: "0 -16px" }}>
        <button
          onClick={() => setNoteOpen((o) => !o)}
          className="w-full flex items-center justify-between tap-feedback"
          style={{
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "16px",
            paddingRight: "16px",
            minHeight: "56px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-expanded={noteOpen}
        >
          <p className="text-base font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
            {note.trim() ? "Note" : "Add a note"}
          </p>
          <span
            aria-hidden="true"
            style={{
              color: "var(--text-secondary)",
              transition: "transform 200ms cubic-bezier(0.16,1,0.3,1)",
              transform: noteOpen ? "rotate(180deg)" : "rotate(0deg)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polyline points="3,6 8,11 13,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateRows: noteOpen ? "1fr" : "0fr",
            transition: "grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1)",
            overflow: "hidden",
          }}
        >
          <div style={{ minHeight: 0 }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? What's different today?"
              rows={4}
              style={{
                display: "block",
                width: "100%",
                padding: "0 0 20px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
              }}
              aria-label="Daily note"
            />
          </div>
        </div>
      </div>

      {/* Save / Update - Button-in-Button */}
      <div className="pt-6" style={{ paddingLeft: "16px", paddingRight: "16px", paddingBottom: "20px" }}>
        <motion.button
          onClick={handleSave}
          disabled={saveState === "saved"}
          whileHover={saveState !== "saved" ? { scale: 1.02 } : undefined}
          whileTap={saveState !== "saved" ? { scale: 0.98 } : undefined}
          className={`group w-full flex items-center justify-between px-5 tap-feedback ${saveState !== "saved" ? "shadow-[0_4px_14px_rgba(45,106,79,0.2)]" : ""}`}
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: saveState === "saved" ? "default" : "pointer",
            position: "relative",
            transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
          }}
          aria-label={isUpdate ? "Update today's log" : "Save today's log"}
        >
          <span
            className="text-base font-medium"
            style={{ opacity: saveState === "saved" ? 0 : 1, transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)" }}
          >
            {isUpdate ? "Update" : "Save"}
          </span>

          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
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
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
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

      <div className="max-w-[480px] mx-auto px-4 md:px-0">
        <button
          onClick={() => setShowManager(true)}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 mt-6 mb-12 rounded-[1.25rem] border border-[--border] text-[--text-primary] bg-white group hover:bg-[#FAFAF8] active:scale-[0.98] transition-all duration-150"
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <span className="font-body font-medium text-[15px]">Edit Conditions & Symptoms</span>
        </button>
      </div>

      </div>

      <SaveConfirmModal
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        message={currentMessage}
        streak={streak}
      />
      <ConditionManagerModal
        isOpen={showManager}
        onClose={() => setShowManager(false)}
      />
    </div>
  );
}
