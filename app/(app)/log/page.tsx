"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppState } from "@/app/providers";
import type { DailyLog, DailyContext, SymptomEntry, Symptom } from "@/app/providers";
import SymptomRow from "@/components/log/SymptomRow";
import ContextFields from "@/components/log/ContextFields";
import FoodTriggers from "@/components/log/FoodTriggers";
import { submitAnonymousLog } from "@/utils/community";
import { useInView, entryStyle } from "@/hooks/useInView";
import { useStreak } from "@/hooks/useStreak";
import SaveConfirmModal from "@/components/log/SaveConfirmModal";
import { pickRandomMessage } from "@/utils/logMessages";
import type { LogMessage } from "@/utils/logMessages";
import ConditionChapterMarker from "@/components/log/ConditionChapterMarker";

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

type EntryMap = Record<string, number>;

interface ConditionGroup {
  condition: string;
  symptoms: Symptom[];
}

// ─── Symptom group with double-bezel + scroll entry ───────────────────────────────────────────

function SymptomGroup({
  condition,
  groupSymptoms,
  useGrouping,
  isCollapsed,
  onToggle,
  entries,
  onEntryChange,
  justSaved,
  entryIndex,
}: {
  condition: string;
  groupSymptoms: Symptom[];
  useGrouping: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  entries: EntryMap;
  onEntryChange: (id: string, v: number) => void;
  justSaved: boolean;
  entryIndex: number;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        ...entryStyle(inView, entryIndex),
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ConditionChapterMarker
        condition={condition}
        collapsed={useGrouping ? isCollapsed : false}
        onToggle={useGrouping ? onToggle : undefined}
        previewValues={groupSymptoms.slice(0, 5).map((s) => entries[s.id] ?? 0)}
      >
        {groupSymptoms.map((symptom) => (
          <SymptomRow
            key={symptom.id}
            symptom={symptom}
            value={entries[symptom.id] ?? 0}
            onChange={(v) => onEntryChange(symptom.id, v)}
            justSaved={justSaved}
          />
        ))}
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

  const useGrouping = true;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(conditions.length >= 2 ? groups.map((g) => g.condition) : [])
  );

  function toggleGroup(condition: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(condition)) next.delete(condition);
      else next.add(condition);
      return next;
    });
  }

  const [entries, setEntries] = useState<EntryMap>(() => {
    if (existingLog) {
      return Object.fromEntries(existingLog.entries.map((e) => [e.symptomId, e.value]));
    }
    return Object.fromEntries(symptoms.map((s) => [s.id, 0]));
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

  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [showModal, setShowModal] = useState(false);
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
    <div style={{ minHeight: "100dvh", paddingBottom: "96px" }}>
      {/* Sticky Header Box */}
      <div 
        className="sticky top-0 z-20"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.03) 20%, rgba(0,0,0,0) 100%), var(--bg-primary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
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
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                  margin: "0 0 4px",
                }}
              >
                Rate Your Symptoms
              </p>
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
          const isCollapsed = useGrouping && collapsedGroups.has(condition);
          return (
            <SymptomGroup
              key={condition}
              condition={condition}
              groupSymptoms={groupSymptoms}
              useGrouping={useGrouping}
              isCollapsed={isCollapsed}
              onToggle={() => toggleGroup(condition)}
              entries={entries}
              onEntryChange={(id, v) => setEntries((prev) => ({ ...prev, [id]: v }))}
              justSaved={saveState === "saved"}
              entryIndex={index}
            />
          );
        })}
      </div>

      {/* Food Triggers */}
      <div className="my-2" style={{ margin: "0 -16px" }}>
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
        <button
          onClick={handleSave}
          disabled={saveState === "saved"}
          className="group w-full flex items-center justify-between px-5 tap-feedback"
          style={{
            height: "56px",
            borderRadius: "1.25rem",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontFamily: "var(--font-body)",
            border: "none",
            cursor: saveState === "saved" ? "default" : "pointer",
            position: "relative",
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
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px"
            style={{
              backgroundColor: "rgba(0,0,0,0.12)",
              transition: "transform 150ms cubic-bezier(0.16,1,0.3,1)",
              flexShrink: 0,
            }}
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
        </button>
      </div>

      </div>

      <SaveConfirmModal
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        message={currentMessage}
        streak={streak}
      />
    </div>
  );
}
