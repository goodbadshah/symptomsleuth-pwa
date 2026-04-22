"use client";

import { useAppState } from "@/app/providers";
import type { DailyLog } from "@/app/providers";

function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function calculateStreak(logs: DailyLog[], today: string): number {
  if (logs.length === 0) return 0;
  const logDates = new Set(logs.map((l) => l.date));
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  // If today isn't logged yet, start counting from yesterday
  if (!logDates.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const str = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!logDates.has(str)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface StreakState {
  /** Number of consecutive days logged (0 if no streak) */
  count: number;
  /** True if today has already been logged */
  loggedToday: boolean;
}

export function useStreak(): StreakState {
  const { state } = useAppState();
  const today = todayLocalDate();
  const count = calculateStreak(state.logs, today);
  const loggedToday = state.logs.some((l) => l.date === today);
  return { count, loggedToday };
}
