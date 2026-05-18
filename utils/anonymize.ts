/**
 * utils/anonymize.ts
 *
 * This is the PII boundary for community data submission.
 * EVERYTHING that goes to Supabase passes through this file.
 *
 * What is intentionally excluded:
 *   - User identity, device ID (never stored)
 *   - Free-text notes (stay local only)
 *   - Specific dates or timestamps (replaced with ISO week)
 *   - Menstrual cycle day (sensitive health data, excluded even with opt-in)
 *   - Symptom IDs (replaced with symptom name to prevent reverse-mapping)
 *
 * What is included:
 *   - Condition name
 *   - Symptom name (human-readable, not an internal ID)
 *   - Value (1-5)
 *   - ISO week string (YYYY-Wnn) - never more specific than a week
 *   - Optional context: sleepQuality, stressLevel, exercise ONLY
 */

import type { DailyLog, Symptom } from "@/app/providers";

export interface AnonymousLogEntry {
  condition: string;
  symptomName: string;
  value: number;            // 1-5 severity only
  weekOf: string;           // ISO week format: YYYY-Wnn
  context?: {
    sleepQuality?: number;  // 1-5
    stressLevel?: number;   // 1-5
    exercise?: boolean | number;
    foodTriggers?: string[]; // included for community correlation analysis
    // menstrualCycleDay is intentionally omitted
  };
}

/**
 * Converts a date string (YYYY-MM-DD) to ISO week notation (YYYY-Wnn).
 * Week 1 is the week containing January 4th (ISO 8601).
 */
export function toISOWeek(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`); // noon avoids DST edge cases
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday of the current week determines the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - yearStart.getTime()) / 86400000 -
        3 +
        ((yearStart.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Transforms a DailyLog into an array of AnonymousLogEntry objects.
 *
 * @param log      The daily log to anonymize
 * @param symptoms The user's full symptom list (needed to resolve symptomId → name/condition)
 * @returns        Anonymized entries ready for community submission, or [] if nothing to send
 */
export function anonymizeLogs(
  log: DailyLog,
  symptoms: Symptom[]
): AnonymousLogEntry[] {
  const weekOf = toISOWeek(log.date);

  // Build context object - exclude menstrualCycleDay explicitly
  const context: AnonymousLogEntry["context"] =
    log.context !== undefined
      ? {
          ...(log.context.sleepQuality !== undefined && {
            sleepQuality: log.context.sleepQuality,
          }),
          ...(log.context.stressLevel !== undefined && {
            stressLevel: log.context.stressLevel,
          }),
          ...(log.context.exercise !== undefined && {
            exercise: log.context.exercise,
          }),
          ...(log.context.foodTriggers !== undefined &&
            log.context.foodTriggers.length > 0 && {
              foodTriggers: log.context.foodTriggers,
            }),
          // menstrualCycleDay: intentionally omitted
        }
      : undefined;

  const hasContext = context && Object.keys(context).length > 0;

  const entries: AnonymousLogEntry[] = [];

  for (const entry of log.entries) {
    const symptom = symptoms.find((s) => s.id === entry.symptomId);
    // Skip if symptom not found (e.g. deleted after logging) or value is 0/unset
    if (!symptom) continue;
    if (entry.value === 0) continue; // skip unlogged entries

    entries.push({
      condition: symptom.condition,
      symptomName: symptom.name, // human-readable name, not the internal UUID
      value: entry.value,
      weekOf,
      ...(hasContext && { context }),
    });
  }

  return entries;
}
